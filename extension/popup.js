// GETTING USER'S SERVER INFO FROM FORM AND STORING IT LOCALLY
const serverInfoForm = document.getElementById('serverInfoForm');

serverInfoForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Get info from form
  const photoprismUrl = document.getElementById('photoprismUrl').value;
  const authToken = document.getElementById('authToken').value;
  const serverInfo = {
    photoprismUrl: photoprismUrl,
    authToken: authToken
  };

  // Getting user UID
  const response = await fetch(photoprismUrl+'/api/v1/session', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + authToken }
  });
  const session = await response.json();
  const userUid = session.user.UID;
  serverInfo["userUid"] = userUid;

  // Saving info to local storage
  await chrome.storage.local.set({ serverInfo: serverInfo });

  createContextMenu(serverInfo);
});


// CREATE CONTEXT MENUS
async function createContextMenu(serverInfo) {
  chrome.contextMenus.create({
    title: 'Upload to PhotoPrism',
    contexts: ['image', 'video'],
    id: 'contextMenuParent'
  }, catchContextMenuError);

  chrome.contextMenus.create({
    title: 'Upload without album',
    contexts: ['image', 'video'],
    parentId: 'contextMenuParent',
    id: ''
  }, catchContextMenuError);

  // Getting albums
  const { photoprismUrl, authToken } = serverInfo;
  const albumsResponse = await fetch(photoprismUrl+'/api/v1/albums?count=100000&type=album&order=title', {
    method: 'GET',
    headers: { "Authorization": 'Bearer ' + authToken }
  });
  const albums = await albumsResponse.json();

  // Creating a context menu for each album
  for (let i = 0; i < albums.length; i++) {
    chrome.contextMenus.create({
      title: albums[i].Title,
      contexts: ['image', 'video'],
      parentId: 'contextMenuParent',
      id: albums[i].UID
    }, catchContextMenuError);
  }
}

// Catch error if context menu already exist
function catchContextMenuError() {
  if (chrome.runtime.lastError) {
    console.log('Error trying to create context menu: ' + chrome.runtime.lastError.message);
  }
}