

var currentUser;               //points to the document of the user who is logged in
function populateUserInfo() {
    firebase.auth().onAuthStateChanged((user) => {
        // Check if user is signed in:()
        if (user) {

            //go to the correct user document by referencing to the user uid
            currentUser = db.collection("users").doc(user.uid);
            //get the document for current user.
            currentUser.get()
                .then(userDoc => {
                    //get the data fields of the user
                    let userName = userDoc.data().name;
                    let userSchool = userDoc.data().school;
                    let userCity = userDoc.data().city;
                    let userAddress = userDoc.data().address;
                    let userGender = userDoc.data().gender;
                    let userSportPreference = userDoc.data().sportPreference;

                    //if the data fields are not empty, then write them in to the form.
                    if (userName != null) {
                        document.getElementById("nameInput").value = userName;
                    }
                    if (userSchool != null) {
                        document.getElementById("schoolInput").value = userSchool;
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
    document.getElementById('personalInfoFields').disabled = false;
}

function saveUserInfo() {
    //enter code here

    //a) get user entered values
    userName = document.getElementById('nameInput').value;       //get the value of the field with id="nameInput"
    userSchool = document.getElementById('schoolInput').value;     //get the value of the field with id="schoolInput"
    userCity = document.getElementById('cityInput').value;       //get the value of the field with id="cityInput"
    userAddress = document.getElementById('addressInput').value;    //added the proceeding three to customize project from demo10
    userGender = document.getElementById('genderInput').value;
    userSportPreference = document.getElementById('sportPreferenceInput').value;

    //b) update user's document in Firestore
    currentUser.update({
        name: userName,
        school: userSchool,
        city: userCity,
        address: userAddress,
        gender: userGender,
        sportPreference: userSportPreference,
    })
        .then(() => {
            console.log("Document successfully updated!");
        });

    //c) disable edit 
    document.getElementById('personalInfoFields').disabled = true;
}

function matchMake() {
    window.location.href = "matchMake.html";
}

function main() {
    window.location.href = "main.html";
}