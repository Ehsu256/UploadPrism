// GETTING USER'S SERVER INFO FROM FORM AND STORING IT LOCALLY
const serverInfoForm = document.getElementById('serverInfoForm');

serverInfoForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Get info from fomr
  const photoprismUrl = document.getElementById('photoprismUrl').value;
  const authToken = document.getElementById('authToken').value;
  const serverInfo = {
    photoprismUrl: photoprismUrl,
    authToken: authToken
  };

  // Getting user UID
  const response = await fetch(photoprismUrl+'/api/v1/session', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + authToken
    }
  });
  const session = await response.json();
  const userUid = session.user.UID;
  serverInfo["userUid"] = userUid;

  // Saving info to local storage
  chrome.storage.local.set({ serverInfo: serverInfo })
    .then(createContextMenus(serverInfo));
});


// CREATE CONTEXT MENUS
async function createContextMenus(serverInfo) {
  console.log('Create context menus');
  await chrome.contextMenus.removeAll();
  
  // Option to uploaded with no specified album
  // They get merged into one parent because they share contexts
  chrome.contextMenus.create({
    title: 'Upload to PhotoPrism',
    contexts: ['image', 'video'],
    id: 'mediaContextMenu'
  }, catchContextMenuError);

  // Parent option for albums
  // Note that in the sample.js they make this file with a let instead of a const
  const albumsParent = chrome.contextMenus.create({
    title: 'Upload to album',
    // contexts: ['image', 'video'],
    id: 'albumsParent'
  }, catchContextMenuError);

  // Getting albums
  const { photoprismUrl, authToken } = serverInfo.photoprismUrl;
  const albumsResponse = await fetch(photoprismUrl+'/api/v1/albums?count=100000&type=album&order=title', {
    method: 'GET',
    headers: {
      "Authorization": 'Bearer ' + authToken
    }
  });
  const albums = await albumsResponse.json();

  // Doesn't work
  for (let i = 0; i < albums.length; i++) {
    console.log('Creating context menu for: ' + albums[i].Title);
    const albumTitle = albums[i].Title;
    const albumUid = albums[i].UID;

    chrome.contextMenus.create({
      title: albumTitle,
      parentId: albumsParent,
      id: albumUid
    }, catchContextMenuError);
  }
}

// Catch error if context menu already exist
function catchContextMenuError() {
  if (chrome.runtime.lastError) {
    console.log('Error trying to create context menu: ' + chrome.runtime.lastError.message);
  }
}