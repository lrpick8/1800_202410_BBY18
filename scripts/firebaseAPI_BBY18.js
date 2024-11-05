//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
    apiKey: "AIzaSyBGhB9cCwf1CiqWRIS9Wd5OPfi8MdZcgsw",
  authDomain: "sportsmatching-app.firebaseapp.com",
  projectId: "sportsmatching-app",
  storageBucket: "sportsmatching-app.firebasestorage.app",
  messagingSenderId: "94407724195",
  appId: "1:94407724195:web:6f01d547edd26acbb58316"
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
