// Ensure Firebase is properly initialized before running any functions
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("User is signed in:", user.uid);
    findMatchingPlayer(); // Start finding a match once the user is authenticated
  } else {
    console.log("No user is signed in. Redirecting to login page...");
    window.location.href = "login.html";
  }
});

// Function to find a matching player
function findMatchingPlayer() {
  const user = firebase.auth().currentUser;
  if (user) {
    const userID = user.uid;

    // Locate the current user's match preferences
    db.collection("matchPreferences")
      .where("userID", "==", userID)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const userPreferences = querySnapshot.docs[0].data();

          console.log("Searching for a match with these preferences:", userPreferences);

          // Search for another user with matching preferences
          db.collection("matchPreferences")
            .where("sport", "==", userPreferences.sport)
            .where("location", "==", userPreferences.location)
            .where("skillLevel", "==", userPreferences.skillLevel)
            .where("mode", "==", userPreferences.mode)
            .where("matchType", "==", userPreferences.matchType)
            .get()
            .then((matchSnapshot) => {
              let matchFound = false;

              matchSnapshot.forEach((doc) => {
                const matchUserID = doc.data().userID;

                if (matchUserID !== userID) {
                  matchFound = true;
                  alert("Match found! You can now connect with your match.");
                  removeMatchPreferences(userID);
                  removeMatchPreferences(matchUserID);
                  window.location.href = "chat.html";
                }
              });

              if (!matchFound) {
                console.log("No match found yet.");
              }
            })
            .catch((error) => {
              console.error("Error finding a match:", error);
            });
        } else {
          console.log("No preferences found for this user.");
          window.location.href = "matchMake.html";
        }
      })
      .catch((error) => {
        console.error("Error retrieving user preferences:", error);
      });
  } else {
    console.log("No user is signed in.");
    window.location.href = "login.html";
  }
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

function cancelMatchPreferences() {
  const user = firebase.auth().currentUser;
  if (user) {
    const userID = user.uid;

    db.collection("matchPreferences")
      .where("userID", "==", userID)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            db.collection("matchPreferences").doc(doc.id).delete().then(() => {
              alert("Your matchmaking preferences have been canceled.");
              window.location.href = "matchMake.html";
            });
          });
        } else {
          alert("No matching preferences found to cancel.");
        }
      })
      .catch((error) => {
        console.error("Error finding match preferences:", error);
      });
  } else {
    window.location.href = "login.html";
  }
}

function startTimer() {
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  // Reference to the timer display element
  const timerDisplay = document.getElementById("timerDisplay");

  // Update the timer every second
  const timerInterval = setInterval(() => {
      seconds++;

      // Increment minutes and hours as needed
      if (seconds === 60) {
          seconds = 0;
          minutes++;
      }
      if (minutes === 60) {
          minutes = 0;
          hours++;
      }

      // Format the time with leading zeros
      const formattedTime = 
          (hours < 10 ? "0" + hours : hours) + ":" +
          (minutes < 10 ? "0" + minutes : minutes) + ":" +
          (seconds < 10 ? "0" + seconds : seconds);

      // Update the timer display on the page
      timerDisplay.textContent = formattedTime;
  }, 1000); // Update every second

  // Stop the timer if the user clicks "Cancel"
  document.getElementById("cancel").addEventListener("click", function() {
      clearInterval(timerInterval);
      alert("You have canceled the queue.");
  });
}

// Start the timer when the page loads
window.onload = startTimer;