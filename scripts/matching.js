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

// Function to create a match
function createMatch(userID1, userID2, matchPreferences) {
  return new Promise((resolve, reject) => {
    console.log("=== createMatch() called ===");
    console.log("User 1:", userID1);
    console.log("User 2:", userID2);
    console.log("Preferences:", matchPreferences);

    if (!userID1 || !userID2 || !matchPreferences) {
      console.error("Error: Missing required parameters for match creation.");
      reject("Missing parameters");
      return;
    }

    db.collection("matches")
      .add({
        player1: userID1,
        player2: userID2,
        sport: matchPreferences.sport,
        location: matchPreferences.location,
        skillLevel: matchPreferences.skillLevel,
        mode: matchPreferences.mode,
        matchType: matchPreferences.matchType,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((docRef) => {
        console.log(
          `Match successfully created with Firestore ID: ${docRef.id}`
        );
        resolve();
      })
      .catch((error) => {
        console.error("Error creating match in Firestore:", error);
        reject(error);
      });
  });
}

let isMatchFound = false; // Global flag to prevent multiple matches

function findMatchingPlayer() {
  console.log("=== findMatchingPlayer() called ===");

  const user = firebase.auth().currentUser;
  if (!user) {
    console.log("No user is signed in.");
    window.location.href = "login.html";
    return;
  }

  const userID = user.uid;
  console.log("Current user ID:", userID);

  // Fetch the current user's match preferences
  db.collection("matchPreferences")
    .where("userID", "==", userID)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        console.log("No preferences found for this user.");
        window.location.href = "matchMake.html";
        return;
      }

      const userPreferences = querySnapshot.docs[0].data();
      console.log("User preferences found:", userPreferences);

      // Set up real-time listener with `unsubscribe` logic
      const unsubscribe = db
        .collection("matchPreferences")
        .where("sport", "==", userPreferences.sport)
        .where("location", "==", userPreferences.location)
        .where("skillLevel", "==", userPreferences.skillLevel)
        .where("mode", "==", userPreferences.mode)
        .where("matchType", "==", userPreferences.matchType)
        .onSnapshot((matchSnapshot) => {
          if (isMatchFound) {
            console.log("Match already found, unsubscribing...");
            unsubscribe(); // Stop listening if a match is already found
            return;
          }

          matchSnapshot.forEach((doc) => {
            const matchUserID = doc.data().userID;

            // Skip if it's the same user or if a match has already been found
            if (matchUserID === userID || isMatchFound) return;

            console.log("Match found with user ID:", matchUserID);
            isMatchFound = true; // Set flag to prevent multiple matches

            // Unsubscribe the listener after a match is found
            unsubscribe();

            // Create the match and then remove preferences
            createMatch(userID, matchUserID, userPreferences)
              .then(() => {
                removeMatchPreferences(userID);
                removeMatchPreferences(matchUserID);
                alert("Match found! Redirecting to match page.");
                window.location.href = "match.html";
              })
              .catch((error) => {
                console.error("Error creating match:", error);
              });
          });

          if (!isMatchFound) {
            console.log("No match found yet.");
          }
        });
    })
    .catch((error) => {
      console.error("Error retrieving user preferences:", error);
    });
}

// Function to remove match preferences
function removeMatchPreferences(userID) {
  db.collection("matchPreferences")
    .where("userID", "==", userID)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        db.collection("matchPreferences").doc(doc.id).delete();
      });
    })
    .catch((error) => {
      console.error("Error deleting match preferences:", error);
    });
}

// Function to cancel match preferences
function cancelMatchPreferences() {
  const user = firebase.auth().currentUser;
  if (user) {
    const userID = user.uid;

    db.collection("matchPreferences")
      .where("userID", "==", userID)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          db.collection("matchPreferences").doc(doc.id).delete();
        });
        alert("Your matchmaking preferences have been canceled.");
        window.location.href = "matchMake.html";
      })
      .catch((error) => {
        console.error("Error deleting match preferences:", error);
      });
  } else {
    window.location.href = "login.html";
  }
}

// Timer function and event listeners
function startTimer() {
  let hours = 0,
    minutes = 0,
    seconds = 0;
  const timerDisplay = document.getElementById("timerDisplay");

  const timerInterval = setInterval(() => {
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

  document.getElementById("cancel").addEventListener("click", () => {
    clearInterval(timerInterval);
    alert("You have canceled the queue.");
  });
}

// Ensure timer starts only after the page loads
window.onload = startTimer;
