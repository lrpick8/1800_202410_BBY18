document.addEventListener("DOMContentLoaded", function () {
  auth.onAuthStateChanged((user) => {
    if (user) {
      const currentUserId = user.uid;
      console.log("Current User ID:", currentUserId);
      initializeMatch(currentUserId);
    } else {
      console.error("No user is logged in.");
      alert("Please log in to continue.");
      window.location.href = "login.html";
    }
  });
});

function initializeMatch(currentUserId) {
  displayMatchDetails(currentUserId);
}

// Function to display the Match Details if a match is found.
async function displayMatchDetails(currentUserId) {
  const matchInfoDiv = document.getElementById("matchInfo");
  const foundMatch = JSON.parse(localStorage.getItem("foundMatch"));

  console.log("Retrieved foundMatch:", foundMatch);

  if (!foundMatch || !foundMatch.player1 || !foundMatch.player2) {
    console.error("Invalid match data.");
    alert("Error loading match. Please try again.");
    return;
  }
// Place the details onto match.html.
  matchInfoDiv.innerHTML = `
    <p>Player 1: ${foundMatch.player1Name}</p>
    <p>Player 2: ${foundMatch.player2Name}</p>
    <p>Sport: ${foundMatch.sport}</p>
    <p>Location: ${foundMatch.location}</p>
    <p>Skill Level: ${foundMatch.skillLevel}</p>
    <p>Mode: ${foundMatch.mode}</p>
    <p>Match Type: ${foundMatch.matchType}</p>
    <p>Timestamp: ${foundMatch.timestamp}</p>`;

  const receiverId =
    foundMatch.player1 === currentUserId ? foundMatch.player2 : foundMatch.player1;

  if (!receiverId) {
    console.error("Receiver ID not found.");
    alert("Error loading match.");
    return;
  }

  console.log("Receiver ID:", receiverId);

  const chatId = await createChat(currentUserId, receiverId);
  localStorage.setItem("activeChatId", chatId);
  localStorage.setItem("receiverId", receiverId);

  const goToChatButton = document.createElement("button");
  goToChatButton.textContent = "Go to Chatbox";
  goToChatButton.onclick = () => {
    window.location.href = "chatbox.html";
  };

  matchInfoDiv.appendChild(goToChatButton);
}

// Sends matched users to chat.
async function createChat(userId1, userId2) {
  const chatId = [userId1, userId2].sort().join("_");
  const chatRef = db.collection("chats").doc(chatId);

  try {
    await chatRef.set(
      {
        participants: [userId1, userId2],
        messages: [],
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return chatId;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

window.addEventListener("beforeunload", function () {
  localStorage.removeItem("foundMatch");
});
