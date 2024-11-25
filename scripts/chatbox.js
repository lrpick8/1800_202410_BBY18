let currentUserId;

document.addEventListener("DOMContentLoaded", function () {
  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUserId = user.uid;
      console.log("Current User ID:", currentUserId);
      initializeChat(currentUserId);

      // Load active chat messages on page load
      const activeChatId = localStorage.getItem("activeChatId");
      const receiverId = localStorage.getItem("receiverId");

      if (activeChatId && receiverId) {
        console.log("Loading active chat on page load...");
        loadChatMessages(activeChatId, currentUserId, receiverId);
      } else {
        console.log("No active chat found to load on page load.");
      }
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
    chatListElement.innerHTML = "<div>No chats found.</div>";
    return;
  }

  // Populate chat list
  for (const chat of chats) {
    const otherUserId = chat.participants.find((id) => id !== currentUserId);
    const otherUserName = await getUserName(otherUserId);

    const listItem = document.createElement("div");
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

let unsubscribeChatListener; // To store the listener and allow cleanup

async function loadChatMessages(chatId, currentUserId, receiverId) {
  try {
    const chatRef = db.collection("chats").doc(chatId);

    // Clear any existing listener before setting up a new one
    if (unsubscribeChatListener) {
      unsubscribeChatListener();
    }

    const receiverName = await getUserName(receiverId);
    document.getElementById("currentChatLabel").textContent = `Chat with ${receiverName}`;

    const chatBox = document.getElementById("chatbox");
    chatBox.innerHTML = ""; // Clear the chatbox

    // Set up a real-time listener on the chat document
    unsubscribeChatListener = chatRef.onSnapshot((snapshot) => {
      if (!snapshot.exists) {
        alert("Chat does not exist or has been deleted.");
        return;
      }

      const chatData = snapshot.data();
      chatBox.innerHTML = ""; // Clear the chatbox to avoid duplicate messages

      // Display all messages
      for (const message of chatData.messages || []) {
        const senderName = message.senderId === currentUserId ? "You" : message.senderName || "Unknown";
        const messageElement = document.createElement("div");
        messageElement.textContent = `${senderName}: ${message.text}`;
        chatBox.appendChild(messageElement);
      }

      console.log("Chat updated in real-time!");
    });

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
