let currentUserId;

document.addEventListener("DOMContentLoaded", function () {
  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUserId = user.uid;
      console.log("Current User ID:", currentUserId);
      initializeChat(currentUserId);
    } else {
      alert("Please log in to continue.");
      window.location.href = "login.html";
    }
  });
});

async function initializeChat(currentUserId) {
  const chats = await loadChats(currentUserId);
  const chatListElement = document.getElementById("chatList");

  chatListElement.innerHTML = "";
  for (const chat of chats) {
    const otherUserId = chat.participants.find((id) => id !== currentUserId);
    const otherUserName = await getUserName(otherUserId);

    const listItem = document.createElement("li");
    listItem.textContent = otherUserName;
    listItem.onclick = () => loadChatMessages(chat.chatId, currentUserId, otherUserId);
    chatListElement.appendChild(listItem);
  }

  if (chats.length === 0) {
    chatListElement.innerHTML = "<li>No chats found.</li>";
  }
}

async function loadChats(currentUserId) {
  const chatSnapshot = await db
    .collection("chats")
    .where("participants", "array-contains", currentUserId)
    .get();

  return chatSnapshot.docs.map((doc) => ({
    chatId: doc.id,
    ...doc.data(),
  }));
}

async function loadChatMessages(chatId, currentUserId, receiverId) {
  const chatRef = db.collection("chats").doc(chatId);
  const chatDoc = await chatRef.get();

  if (!chatDoc.exists) {
    alert("Chat does not exist.");
    return;
  }

  const chatData = chatDoc.data();
  const chatBox = document.getElementById("chatbox");
  chatBox.innerHTML = "";

  const receiverName = await getUserName(receiverId);
  document.getElementById("currentChatLabel").textContent = `Chat with ${receiverName} (Chat ID: ${chatId})`;

  console.log("Setting currentChatLabel to:", `Chat with ${receiverName} (Chat ID: ${chatId})`);

  for (const message of chatData.messages) {
    const senderName = await getUserName(message.senderId);
    const messageElement = document.createElement("div");
    messageElement.textContent = `${senderName}: ${message.text}`;
    chatBox.appendChild(messageElement);
  }
}


async function getUserName(userId) {
  const userDoc = await db.collection("users").doc(userId).get();
  return userDoc.exists ? userDoc.data().name : "Unknown User";
}

document.getElementById("sendButton").addEventListener("click", async () => {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (!currentUserId) {
    console.error("currentUserId is not set!");
    return;
  }

  const currentChatLabel = document.getElementById("currentChatLabel");
  if (!currentChatLabel) {
    console.error("Error: currentChatLabel element not found.");
    return;
  }

  console.log("currentChatLabel content:", currentChatLabel.textContent);

  const match = currentChatLabel.textContent.match(/Chat ID: ([^\)]+)/);
  if (!match) {
    console.error("Error: No chatId found in currentChatLabel.");
    return;
  }

  const chatId = match[1];
  console.log("Extracted chatId from currentChatLabel:", chatId);

  if (message && chatId) {
    const chatRef = db.collection("chats").doc(chatId);

    const newMessage = {
      senderId: currentUserId,
      text: message,
      timestamp: firebase.firestore.Timestamp.now(), // Use fixed timestamp
    };

    try {
      // Add the message to the `messages` array
      await chatRef.update({
        messages: firebase.firestore.FieldValue.arrayUnion(newMessage),
      });

      console.log("Message sent successfully!");

      // Clear the input field
      messageInput.value = "";

      // Reload the chat messages to display the newly sent message
      loadChatMessages(chatId, currentUserId, currentChatLabel.textContent.split(" ")[2]); // Assuming the receiver's name is in position 2
    } catch (error) {
      console.error("Error sending message:", error);
    }
  } else {
    console.log("Message input is empty or chatId is missing.");
  }
});


