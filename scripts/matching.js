// Firebase Authentication Check
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    console.log("User is signed in:", user.uid);
    findMatchingPlayer(); // Start finding a match once the user is authenticated
  } else {
    console.log("No user is signed in. Redirecting to login page...");
    window.location.href = "login.html";
  }
});

let isMatchFound = false; // Global flag to prevent multiple matches
let timerInterval; // Global variable for the timer

// Main function to find a matching player and initiate the match creation
async function findMatchingPlayer() {
  console.log("=== findMatchingPlayer() called ===");

  const user = firebase.auth().currentUser;
  if (!user) {
    console.log("No user is signed in.");
    window.location.href = "login.html";
    return;
  }

  const userID = user.uid;
  console.log("Current user ID:", userID);

  try {
    // Fetch the current user's match preferences
    const preferencesSnapshot = await db
      .collection("matchPreferences")
      .where("userID", "==", userID)
      .get();

    if (preferencesSnapshot.empty) {
      console.log("No preferences found for this user.");
      window.location.href = "matchMake.html";
      return;
    }

    const userPreferences = preferencesSnapshot.docs[0].data();
    console.log("User preferences found:", userPreferences);

    // Listen for potential matches
    const unsubscribe = db
      .collection("matchPreferences")
      .where("sport", "==", userPreferences.sport)
      .where("location", "==", userPreferences.location)
      .where("skillLevel", "==", userPreferences.skillLevel)
      .where("mode", "==", userPreferences.mode)
      .where("matchType", "==", userPreferences.matchType)
      .onSnapshot(async (matchSnapshot) => {
        if (isMatchFound) {
          console.log("Match already found, unsubscribing...");
          unsubscribe();
          return;
        }

        for (const doc of matchSnapshot.docs) {
          const matchUserID = doc.data().userID;
          if (matchUserID === userID || isMatchFound) continue;

          console.log("Match found with user ID:", matchUserID);
          isMatchFound = true;
          unsubscribe();

          // Fetch user names before creating the match
          const user1Doc = await db.collection("users").doc(userID).get();
          const user2Doc = await db.collection("users").doc(matchUserID).get();

          const user1Name = user1Doc.exists ? user1Doc.data().name : "Unknown";
          const user2Name = user2Doc.exists ? user2Doc.data().name : "Unknown";

          const datePart = new Date().toLocaleDateString();
          const timePart = new Date().toLocaleTimeString();
          const formattedTimestamp = `${datePart} ${timePart}`;
          // Example output: "11/13/2024 2:45 PM"

          // Store the match data locally and in Firestore
          const foundMatch = {
            matchID: `match_${userID}_${matchUserID}_${Date.now()}`,
            player1: userID,
            player1Name: user1Name,
            player2: matchUserID,
            player2Name: user2Name,
            sport: userPreferences.sport,
            location: userPreferences.location,
            skillLevel: userPreferences.skillLevel,
            mode: userPreferences.mode,
            matchType: userPreferences.matchType,
            timestamp: formattedTimestamp,
          };

          localStorage.setItem("foundMatch", JSON.stringify(foundMatch));

          await createMatch(foundMatch);

          alert("Match found! Redirecting to match page.");
          window.location.href = "match.html";
        }

        if (!isMatchFound) {
          console.log("No match found yet.");
        }
      });
  } catch (error) {
    console.error("Error finding match:", error);
  }
}

// Function to create a match document in Firestore
async function createMatch(matchData) {
  const { matchID, player1, player2 } = matchData;
  try {
    // Create the match in Firestore
    await db.collection("matches").doc(matchID).set(matchData);
    console.log(`Match successfully created with ID: ${matchID}`);

    // Remove match preferences for both players
    await removeMatchPreferences(player1);
    await removeMatchPreferences(player2);

    console.log("Match preferences removed for both players.");
  } catch (error) {
    console.error("Error creating match or removing preferences:", error);
  }
}

// Function to remove match preferences after a match is created
async function removeMatchPreferences(userID) {
  console.log(`Attempting to delete match preferences for user: ${userID}`);

  try {
    const querySnapshot = await db
      .collection("matchPreferences")
      .where("userID", "==", userID)
      .get();

    if (querySnapshot.empty) {
      console.log(`No match preferences found for user: ${userID}`);
      return; // Exit if no documents found
    }

    // Delete all matching documents
    const batch = db.batch();
    querySnapshot.forEach((doc) => {
      console.log(`Preparing to delete document ID: ${doc.id}`);
      batch.delete(doc.ref);
    });

    // Commit the batch delete
    await batch.commit();
    console.log(`Successfully deleted match preferences for user: ${userID}`);
  } catch (error) {
    console.error("Error deleting match preferences:", error);
  }
}

// Timer function and event listeners
function startTimer() {
  let hours = 0,
    minutes = 0,
    seconds = 0;
  const timerDisplay = document.getElementById("timerDisplay");

  timerInterval = setInterval(() => {
    seconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    if (minutes === 60) {
      minutes = 0;
      hours++;
    }

    timerDisplay.textContent = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, 1000);
}

// Add event listener to the cancel button
document.getElementById("cancel").addEventListener("click", async () => {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error("No user is signed in. Unable to cancel match preferences.");
    return;
  }

  const userID = user.uid;

  // Call removeMatchPreferences and stop the timer
  clearInterval(timerInterval); // Stop the timer
  try {
    await removeMatchPreferences(userID);
    alert("You have canceled the queue.");
    window.location.href = "main.html"; // Redirect to the main page or any desired page
  } catch (error) {
    console.error("Error canceling match preferences:", error);
    alert("Failed to cancel the queue. Please try again.");
  }
});

// Ensure timer starts only after the page loads
window.onload = startTimer;
