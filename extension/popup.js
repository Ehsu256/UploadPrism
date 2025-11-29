const serverStatusText = document.getElementById('serverStatusText');


document.getElementById('serverInfoForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const photoprismUrl = document.getElementById('photoprismUrl').value;
  const authToken = document.getElementById('authToken').value;

  // Send message to background to check the
  // status of the server if given info is correct
  chrome.runtime.sendMessage({
    serverInfo: { photoprismUrl, authToken },
  });

  serverStatusText.innerHTML = 'Connecting to PhotoPrism...';
});


chrome.runtime.onMessage.addListener((message) => {
  showServerStatus(message.serverStatus);
});

function showServerStatus(serverStatus) {
  switch (serverStatus) {
    case 'operational':
      serverStatusText.innerHTML = 'Connection to PhotoPrism was succesful!';
      break;
    case 'nonoperational':
      serverStatusText.innerHTML = "Couldn't connect to PhotoPrism";
      break;
  
    default:
      serverStatusText.innerHTML = "Error trying to check the status of PhotoPrism";
      break;
  }
}