document.getElementById('serverInfoForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const photoprismUrl = document.getElementById('photoprismUrl').value;
  const authToken = document.getElementById('authToken').value;
  
  // Send message to background.js to check if server is operational
  chrome.runtime.sendMessage({
    photoprismUrl: photoprismUrl,
    authToken: authToken
  });
});