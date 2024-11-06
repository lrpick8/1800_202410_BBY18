function findmatch() {
    console.log("Find a Match");
    let sport = document.getElementById("sport").value;
    let location = document.getElementById("location").value;
    let skill = document.querySelector('input[name="skillLevel"]:checked').value;
    let mode = document.querySelector('input[name="mode"]:checked').value;
    let matchtype = document.querySelector('input[name="matchtype"]:checked').value;

    console.log("Sport:", sport);
    console.log("Location:", location);
    console.log("Skill Level:", skill);
    console.log("Mode:", mode);
    console.log("Match Type:", matchtype);

    var user = firebase.auth().currentUser;
    if (user) {
        var currentUser = db.collection("users").doc(user.uid);
        var userID = user.uid;

        // Add the match preferences to Firestore
        db.collection("matchPreferences").add({
            userID: userID,
            sport: sport,
            location: location,
            skillLevel: skill,
            mode: mode,
            matchType: matchtype,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Add a timestamp
        }).then(() => {
            console.log("Match preferences saved successfully.");
            window.location.href = "matching.html"; // Redirect to the thank-you page
        }).catch((error) => {
            console.error("Error saving match preferences: ", error);
        });
    } else {
        console.log("No user is signed in");
        window.location.href = 'login.html'; // Redirect to login if no user is signed in
    }
}