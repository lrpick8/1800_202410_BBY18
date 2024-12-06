
// Logs the user out when button is clicked, returns to index.html. Used from Demo #7 in COMP1800.
function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("logging out user");
      }).catch((error) => {
        // An error happened.
      });
}

