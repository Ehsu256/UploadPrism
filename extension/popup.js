document.getElementById('serverInfoForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const serverStatusParagraph = document.getElementById('serverStatusParagraph');
  serverStatusParagraph.innerHTML = 'Checking server status...';

  const photoprismUrl = document.getElementById('photoprismUrl').value;
  const authToken = document.getElementById('authToken').value;
  
  try {
    const statusResponse = await fetch(photoprismUrl+'/api/v1/status', {
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + authToken,
        'Connection': 'keep-alive'
      }
    });
    const serverStatus = await statusResponse.json();

    if (serverStatus.status == 'operational') {
      serverStatusParagraph.innerHTML = 'Connection to PhotoPrism was succesful!';

      chrome.storage.local.set({ serverInfo: { photoprismUrl, authToken } });

      chrome.runtime.sendMessage({});
    }
  } catch (error) {
    console.log('Error trying to connect to server:', error);
    serverStatusParagraph.innerHTML = 'Could not connect to PhotoPrism';
  }
});