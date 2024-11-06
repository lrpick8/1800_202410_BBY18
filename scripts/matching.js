function cancelMatchPreferences() {
    // Check if the user is authenticated
    let user = firebase.auth().currentUser;
    if (user) {
        let userID = user.uid;

        // Locate the document in the "matchPreferences" collection where userID matches
        db.collection("matchPreferences")
            .where("userID", "==", userID)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    // Delete each document that matches the userID (should be only one if unique per user)
                    querySnapshot.forEach((doc) => {
                        db.collection("matchPreferences").doc(doc.id).delete()
                        .then(() => {
                            console.log("Match preferences removed successfully.");
                            alert("Your matching preferences have been canceled.");
                            window.location.href = "matchMake.html";
                        })
                        .catch((error) => {
                            console.error("Error removing match preferences: ", error);
                        });
                    });
                } else {
                    console.log("No matching preferences found for this user.");
                    alert("No matching preferences found to cancel.");
                }
            })
            .catch((error) => {
                console.error("Error finding match preferences: ", error);
            });
    } else {
        console.log("No user is signed in.");
        window.location.href = 'login.html'; // Redirect to login if user is not signed in
    }
}
