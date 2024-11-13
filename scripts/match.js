function displayMatch() {
    const user = firebase.auth().currentUser;
  
    if (user) {
      const userID = user.uid;
      const matchInfoDiv = document.getElementById("matchInfo");
  
      // Query the 'matches' collection to find a match that includes the current user
      db.collection("matches")
        .where("player1", "==", userID)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const matchData = querySnapshot.docs[0].data();
            displayMatchDetails(matchData);
          } else {
            // Try finding the match where the user is player2
            db.collection("matches")
              .where("player2", "==", userID)
              .get()
              .then((snapshot) => {
                if (!snapshot.empty) {
                  const matchData = snapshot.docs[0].data();
                  displayMatchDetails(matchData);
                } else {
                  matchInfoDiv.textContent = "No match found.";
                }
              })
              .catch((error) => {
                console.error("Error finding match for player2:", error);
                matchInfoDiv.textContent = "Error retrieving match.";
              });
          }
        })
        .catch((error) => {
          console.error("Error finding match for player1:", error);
          matchInfoDiv.textContent = "Error retrieving match.";
        });
    } else {
      console.log("No user is signed in. Redirecting to login page...");
      window.location.href = "login.html";
    }
  }
  
  // Function to display match details on the page
  function displayMatchDetails(matchData) {
    const matchInfoDiv = document.getElementById("matchInfo");
    matchInfoDiv.innerHTML = `
      <p>Match ID: ${matchData.matchID}</p>
      <p>Player 1: ${matchData.player1}</p>
      <p>Player 2: ${matchData.player2}</p>
      <p>Sport: ${matchData.sport}</p>
      <p>Location: ${matchData.location}</p>
      <p>Skill Level: ${matchData.skillLevel}</p>
      <p>Mode: ${matchData.mode}</p>
      <p>Match Type: ${matchData.matchType}</p>
      <p>Timestamp: ${matchData.timestamp?.toDate()}</p>
    `;
  }
  