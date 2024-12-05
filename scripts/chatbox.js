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

// Initialize the chat dropdown
async function initializeChat(currentUserId) {
  const chats = await loadChats(currentUserId);
  const chatDropdown = document.getElementById("chatDropdown");

  chatDropdown.innerHTML = "<option value=''>Select a chat</option>"; // Clear the dropdown and add default option

  if (chats.length === 0) {
    const noChatOption = document.createElement("option");
    noChatOption.value = "";
    noChatOption.textContent = "No chats found";
    chatDropdown.appendChild(noChatOption);
    return;
  }

  // Populate dropdown with chat options
  for (const chat of chats) {
    const otherUserId = chat.participants.find((id) => id !== currentUserId);
    const otherUserName = await getUserName(otherUserId);

    const option = document.createElement("option");
    option.value = chat.chatId; // Use chatId as the value
    option.textContent = `Chat with ${otherUserName}`;
    chatDropdown.appendChild(option);
  }
}

// Handle chat selection from dropdown
document.getElementById("chatDropdown").addEventListener("change", async (event) => {
  const chatId = event.target.value;
  const receiverId = await getReceiverId(chatId, currentUserId);

  if (chatId && receiverId) {
    console.log(`Selected chat: ${chatId}`);
    loadChatMessages(chatId, currentUserId, receiverId);
    localStorage.setItem("activeChatId", chatId);
    localStorage.setItem("receiverId", receiverId);
  } else {
    console.log("No chat selected or receiver ID not found.");
    document.getElementById("currentChatLabel").textContent = "No active chat";
    document.getElementById("chatbox").innerHTML = "";
  }
});

// Get the receiver ID from chat ID and current user ID
async function getReceiverId(chatId, currentUserId) {
  try {
    const chatRef = db.collection("chats").doc(chatId);
    const chatDoc = await chatRef.get();

    if (chatDoc.exists) {
      const participants = chatDoc.data().participants;
      return participants.find((id) => id !== currentUserId); // Find the other user
    }
    return null;
  } catch (error) {
    console.error("Error getting receiver ID:", error);
    return null;
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
    document.getElementById(
      "currentChatLabel"
    ).textContent = `Chat with ${receiverName}`;

    const chatBox = document.getElementById("chatbox");
    chatBox.innerHTML = ""; // Clear the chatbox

    // Set up a real-time listener on the chat document
    unsubscribeChatListener = chatRef.onSnapshot(async (snapshot) => {
      if (!snapshot.exists) {
        alert("Chat does not exist or has been deleted.");
        return;
      }

      const chatData = snapshot.data();
      chatBox.innerHTML = ""; // Clear the chatbox to avoid duplicate messages

      // Cache for sender names
      const senderNameCache = {};

      // Display all messages
      for (const message of chatData.messages || []) {
        let senderName;

        if (message.senderId === currentUserId) {
          senderName = "You";
        } else if (senderNameCache[message.senderId]) {
          senderName = senderNameCache[message.senderId];
        } else {
          // Fetch sender name and cache it
          senderName = await getUserName(message.senderId);
          senderNameCache[message.senderId] = senderName;
        }

        const messageElement = document.createElement("div");
        // messageElement.textContent = `${senderName}: ${message.text}`;
        messageElement.textContent = `${message.text}`;
        messageElement.className = message.senderId === currentUserId ? "sentMessage" : "receivedMessage";
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
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log(user.uid); // Let's know who the logged-in user is by logging their UID
      currentUser = db.collection("users").doc(user.uid); // Go to the Firestore document of the user
      currentUser.get().then((userDoc) => {
        // Get the user name
        let userName = userDoc.data().name;
        console.log(userName);
        //$("#name-goes-here").text(userName); // jQuery
        document.getElementById("name-goes-here").innerText = userName;
      });
    } else {
      console.log("No user is logged in."); // Log a message when no user is logged in
    }
  });
}
insertNameFromFirestore();

// Handle "Leave Chat" button functionality
document.getElementById("leaveChatButton").addEventListener("click", async () => {
  const activeChatId = localStorage.getItem("activeChatId");

  // Ensure currentUserId is properly set
  if (!currentUserId) {
    console.error("currentUserId is not set.");
    alert("You are not logged in. Please log in to continue.");
    return;
  }

  // Ensure activeChatId exists
  if (!activeChatId) {
    console.warn("No active chat ID found.");
    alert("No active chat selected. Please select a chat first.");
    return;
  }

  try {
    const chatRef = db.collection("chats").doc(activeChatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      console.error("Chat document not found.");
      alert("This chat no longer exists.");
      return;
    }

    const chatData = chatDoc.data();
    const updatedParticipants = chatData.participants.filter((id) => id !== currentUserId);

    if (updatedParticipants.length === 0) {
      // If no participants left, delete the chat
      await chatRef.delete();
      console.log("Chat deleted because no participants remain.");
    } else {
      // Update the chat to remove the current user
      await chatRef.update({
        participants: updatedParticipants,
      });
      console.log("User removed from chat participants.");
    }

    // Clear active chat data from localStorage
    localStorage.removeItem("activeChatId");
    localStorage.removeItem("receiverId");

    // Update the UI
    document.getElementById("currentChatLabel").textContent = "No active chat";
    document.getElementById("chatbox").innerHTML = "";

    // Reload the chat list to reflect the updated chats
    await initializeChat(currentUserId);
    console.log("Chat list reloaded.");
  } catch (error) {
    console.error("Error leaving chat:", error);
    alert("An error occurred while trying to leave the chat. Please try again.");
  }
});


