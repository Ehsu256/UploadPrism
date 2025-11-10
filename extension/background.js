chrome.runtime.onMessage.addListener(async () => {
  const serverInfo = (await chrome.storage.local.get(['serverInfo'])).serverInfo;
  
  setIcon('operational');
  getUserUid(serverInfo);
  createContextMenus(serverInfo);
});


async function getUserUid(serverInfo) {
  const { photoprismUrl, authToken } = serverInfo;

  // Get user UID required for upload
  const sessionResponse = await fetch(photoprismUrl+'/api/v1/session', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + authToken }
  });
  const session = await sessionResponse.json();
  serverInfo.userUid = session.user.UID;
  
  await chrome.storage.local.set({ serverInfo: serverInfo });
}


// Prepare file for upload
chrome.contextMenus.onClicked.addListener(async (info) => {
  setIcon('processing');

  const fileUrl = info.srcUrl;
  const response = await fetch(fileUrl);
  const blob = await response.blob();

  // Provide file with correct extension to prevent "unsupported file extension" error in PhotoPrism
  const fileExtension = blob.type.split('/')[1]; // Get the file extension from MIME type
  const fileName = 'UploadPrism.' + fileExtension;
  const fileObject = new File([blob], fileName, { type: blob.type });

  const formData = new FormData();
  formData.append('files', fileObject);
  const albumUid = info.menuItemId;

  uploadFile(formData, albumUid);
});

async function uploadFile(formData, albumUid) {
  const serverInfo = (await chrome.storage.local.get(['serverInfo'])).serverInfo;
  const { photoprismUrl, authToken, userUid } = serverInfo;

  // Use POST and then PUT in order for the image to appear in library
  try {
    const uploadResponse = await fetch(photoprismUrl+'/api/v1/users/'+userUid+'/upload/_UploadPrism', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + authToken,
        'Connection': 'keep-alive'
      },
      body: formData
    });
    const importResponse = await fetch(photoprismUrl+'/api/v1/users/'+userUid+'/upload/_UploadPrism', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + authToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ albums: [albumUid] })
    });

    const uploadStatus = (await uploadResponse.json()).code;
    const importStatus = (await importResponse.json()).code;

    if (uploadStatus == 200 && importStatus == 200) {
      setIcon('success');
    }
  } catch (error) {
    console.log("Error when trying to upload/import media", error);
    setIcon('error');
  }
}


// Possible parameters:
// processing, success, error, operational, nonoperational
function setIcon(uploadStatus) {
  switch (uploadStatus) {
    case 'processing':
      chrome.action.setIcon({
        path: "icons/icon128-processing.png"
      });
      break;
    case 'success':
      chrome.action.setIcon({
        path: "icons/icon128-success.png"
      });
      setIconToDefault();
      break;
    case 'error':
      chrome.action.setIcon({
        path: "icons/icon128-error.png"
      });
      setIconToDefault();
      break;
    case 'operational':
      chrome.action.setIcon({
        path: "icons/icon128-operational.png"
      });
      setIconToDefault();
      break;
    case 'nonoperational':
      chrome.action.setIcon({
        path: "icons/icon128-nonoperational.png"
      });
      setIconToDefault();
      break;
  
    default:
      console.log("Unknown case, setting icon to default");
      setIconToDefault();
      break;
  }
}

function setIconToDefault() {
  setTimeout(() => {
    chrome.action.setIcon({
      path: "icons/icon128.png"
    })
  }, 5000);
}


async function createContextMenus(serverInfo) {
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

  const { photoprismUrl, authToken } = serverInfo;
  const albumsResponse = await fetch(photoprismUrl+'/api/v1/albums?count=100000&type=album&order=title', {
    method: 'GET',
    headers: { "Authorization": 'Bearer ' + authToken }
  });
  const albums = await albumsResponse.json();

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