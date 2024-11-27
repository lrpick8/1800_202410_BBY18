function findmatch() {
  console.log("Find a Match");
  
  let sport = document.getElementById("sport").value;
  let location = document.querySelector('input[name="location"]:checked').value; // Updated to retrieve location
  let skill = document.querySelector('input[name="skillLevel"]:checked').value;
  let mode = document.querySelector('input[name="mode"]:checked').value;
  let matchtype = document.querySelector('input[name="matchtype"]:checked').value;

  console.log("Sport:", sport);
  console.log("Location:", location); // Log to verify location selection
  console.log("Skill Level:", skill);
  console.log("Mode:", mode);
  console.log("Match Type:", matchtype);

  var user = firebase.auth().currentUser;
  if (user) {
    var currentUser = db.collection("users").doc(user.uid);
    var userID = user.uid;

    // Add the match preferences to Firestore
    db.collection("matchPreferences")
      .add({
        userID: userID,
        sport: sport,
        location: location,
        skillLevel: skill,
        mode: mode,
        matchType: matchtype,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        console.log("Match preferences saved successfully.");
        window.location.href = "matching.html"; // Redirect to the thank-you page
      })
      .catch((error) => {
        console.error("Error saving match preferences: ", error);
      });
  } else {
    console.log("No user is signed in");
    window.location.href = "login.html"; // Redirect to login if no user is signed in
  }
}

function insertNameFromFirestore() {
  // Check if the user is logged in:
  firebase.auth().onAuthStateChanged(user => {
      if (user) {
          console.log(user.uid); // Let's know who the logged-in user is by logging their UID
          currentUser = db.collection("users").doc(user.uid); // Go to the Firestore document of the user
          currentUser.get().then(userDoc => {
              // Get the user name
              let userName = userDoc.data().name;
              console.log(userName);
              //$("#name-goes-here").text(userName); // jQuery
              document.getElementById("name-goes-here").innerText = userName;
          })
      } else {
          console.log("No user is logged in."); // Log a message when no user is logged in
      }
  })
}
insertNameFromFirestore();
