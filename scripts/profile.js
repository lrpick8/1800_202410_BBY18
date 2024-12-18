var currentUser; //points to the document of the user who is logged in

// Framework used from Demo #9 in COMP 1800. Altered slightly with gender and sport preference for our specific app.
// Reads from the database and automatically populates user's details.
function populateUserInfo() {
  firebase.auth().onAuthStateChanged((user) => {
    // Check if user is signed in:()
    if (user) {
      //go to the correct user document by referencing to the user uid
      currentUser = db.collection("users").doc(user.uid);
      console.log("User UID: " + user.uid);
      //get the document for current user.
      currentUser.get().then((userDoc) => {
        if (userDoc.exists) {
        //get the data fields of the user
        let userName = userDoc.data().name;
        let userCity = userDoc.data().city;
        let userAddress = userDoc.data().address;
        let userGender = userDoc.data().gender;
        let userSportPreference = userDoc.data().sportPreference;

        //if the data fields are not empty, then write them in to the form.
        if (userName != null) {
          document.getElementById("nameInput").value = userName;
        }
        if (userCity != null) {
          document.getElementById("cityInput").value = userCity;
        }
        if (userAddress != null) {
          document.getElementById("addressInput").value = userAddress;
        }
        if (userGender != null) {
          document.getElementById("genderInput").value = userGender;
        }
        if (userSportPreference != null) {
          document.getElementById("sportPreferenceInput").value = userSportPreference;
        }
      } else {
        console.log("No such Document!");
      }
      }).catch((error) => {
        console.log("Error getting document: ", error);
      });
    } else {
      // No user is signed in.
      console.log("No user is signed in");
    }
  });
}

//call the function to run it
populateUserInfo();

function editUserInfo() {
  //Enable the form fields
  document.getElementById("personalInfoFields").disabled = false;
}

// When user clicks on Save, it writes to Firestore and disables editing until edit is pressed again. 
// Framework used from Demo #9 in COMP 1800, updated for specific app.
function saveUserInfo() {

  //a) get user entered values
  var userName = document.getElementById("nameInput").value; //get the value of the field with id="nameInput"
  var userCity = document.getElementById("cityInput").value; //get the value of the field with id="cityInput"
  var userAddress = document.getElementById("addressInput").value; //added the proceeding three to customize project from demo10
  var userGender = document.getElementById("genderInput").value;
  var userSportPreference = document.getElementById("sportPreferenceInput").value;

  console.log("Name: " + userName);
  console.log("City: " + userCity); 
  console.log("Address: " + userAddress); 
  console.log("Gender: " + userGender); 
  console.log("Sport Preference: " + userSportPreference);

  //b) update user's document in Firestore
  currentUser.update({
      name: userName,
      city: userCity,
      address: userAddress,
      gender: userGender,
      sportPreference: userSportPreference
  })
      .then(() => {
          console.log("Document successfully updated!");
      })
      .catch((error) => {
        console.error("Error Updating Document: ", error);
      });

  //c) disable edit
  document.getElementById("personalInfoFields").disabled = true;
}

function matchMake() {
  window.location.href = "matchMake.html";
}

function main() {
  window.location.href = "main.html";
}

// To post user's name for user customization in top left dropdown menu.
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
