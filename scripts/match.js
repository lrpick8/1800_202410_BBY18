document.addEventListener("DOMContentLoaded", function () {
  displayMatchDetails();
});

const foundMatch = JSON.parse(localStorage.getItem("foundMatch"));
// Function to display match details on the page
function displayMatchDetails() {
  const matchInfoDiv = document.getElementById("matchInfo");

  if (foundMatch) {
    matchInfoDiv.innerHTML = `
      <p>Player 1: ${foundMatch.player1Name}</p>
      <p>Player 2: ${foundMatch.player2Name}</p>
      <p>Sport: ${foundMatch.sport}</p>
      <p>Location: ${foundMatch.location}</p>
      <p>Skill Level: ${foundMatch.skillLevel}</p>
      <p>Mode: ${foundMatch.mode}</p>
      <p>Match Type: ${foundMatch.matchType}</p>
      <p>Timestamp: ${foundMatch.timestamp}</p>
    `;
  } else {
    matchInfoDiv.textContent = "No match found.";
  }
}

window.addEventListener("beforeunload", function () {
  console.log("Page is being closed or refreshed. Deleting foundMatch...");
  localStorage.removeItem("foundMatch");
});

