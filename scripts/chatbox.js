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

// Initialize the chat list
async function initializeChat(currentUserId) {
  const chats = await loadChats(currentUserId);
  const chatListElement = document.getElementById("chatList");

  chatListElement.innerHTML = ""; // Clear the chat list

  if (chats.length === 0) {
    chatListElement.innerHTML = "<li>No chats found.</li>";
    return;
  }

  // Populate chat list
  for (const chat of chats) {
    const otherUserId = chat.participants.find((id) => id !== currentUserId);
    const otherUserName = await getUserName(otherUserId);

    const listItem = document.createElement("li");
    listItem.textContent = otherUserName;
    listItem.onclick = () => loadChatMessages(chat.chatId, currentUserId, otherUserId);
    chatListElement.appendChild(listItem);
  }
}

// Load chat metadata from Firestore
async function loadChats(currentUserId) {
  try {
    const chatSnapshot = await db
      .collection("chats")
      .where("participants", "array-contains", currentUserId)
      .get();

    return chatSnapshot.docs.map((doc) => ({
      chatId: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error loading chats:", error);
    return [];
  }
}

// Load messages for a specific chat
async function loadChatMessages(chatId, currentUserId, receiverId) {
  try {
    const chatRef = db.collection("chats").doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      alert("Chat does not exist.");
      return;
    }

    const chatData = chatDoc.data();
    const chatBox = document.getElementById("chatbox");
    chatBox.innerHTML = ""; // Clear the chatbox

    const receiverName = await getUserName(receiverId);
    document.getElementById("currentChatLabel").textContent = `Chat with ${receiverName} (Chat ID: ${chatId})`;

    console.log("Loaded Chat ID:", chatId);

    // Display all messages
    for (const message of chatData.messages || []) {
      const senderName = message.senderId === currentUserId ? "You" : await getUserName(message.senderId);
      const messageElement = document.createElement("div");
      messageElement.textContent = `${senderName}: ${message.text}`;
      chatBox.appendChild(messageElement);
    }

    // Save the active chat ID and receiver ID
    localStorage.setItem("activeChatId", chatId);
    localStorage.setItem("receiverId", receiverId);
  } catch (error) {
    console.error("Error loading chat messages:", error);
  }
}

// Get the username of a user by ID
async function getUserName(userId) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    return userDoc.exists ? userDoc.data().name : "Unknown User";
  } catch (error) {
    console.error("Error fetching user name:", error);
    return "Unknown User";
  }
}

// Handle sending a message
document.getElementById("sendButton").addEventListener("click", async () => {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (!currentUserId) {
    console.error("currentUserId is not set!");
    return;
  }

  const chatId = localStorage.getItem("activeChatId");
  const receiverId = localStorage.getItem("receiverId");

  if (!chatId || !receiverId) {
    console.error("Error: Chat ID or Receiver ID is missing.");
    alert("Error sending message. Please try reloading the page.");
    return;
  }

  if (!message) {
    console.error("Message input is empty.");
    return;
  }

  try {
    const chatRef = db.collection("chats").doc(chatId);

    const newMessage = {
      senderId: currentUserId,
      text: message,
      timestamp: firebase.firestore.Timestamp.now(),
    };

    // Update Firestore with the new message
    await chatRef.update({
      messages: firebase.firestore.FieldValue.arrayUnion(newMessage),
    });

    console.log("Message sent successfully!");

    // Clear the input field
    messageInput.value = "";

    // Reload the chat messages to display the newly sent message
    await loadChatMessages(chatId, currentUserId, receiverId);
  } catch (error) {
    console.error("Error sending message:", error);
  }
});
