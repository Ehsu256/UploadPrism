chrome.runtime.onStartup.addListener(checkServerStatus);



async function checkServerStatus() {
  
}



// PREPARING FILE FOR UPLOAD
chrome.contextMenus.onClicked.addListener(async (info) => {
  // Fetching the right-clicked file
  const fileUrl = info.srcUrl;
  const response = await fetch(fileUrl);
  const blob = await response.blob();

  // Naming the file with the correct extension to prevent "unsupported file extension" error in PhotoPrism
  const fileExtension = blob.type.split('/')[1]; // Getting the file extension from MIME type
  const fileName = 'UploadPrism.' + fileExtension;
  const fileObject = new File([blob], fileName, { type: blob.type });

  // Creating FormData and appending the File object
  const formData = new FormData();
  formData.append('files', fileObject);

  // Taking the ID of the context menu item clicked (wich is the respective album's UID)
  const albumUid = info.menuItemId;

  // Start upload sequence
  setIcon('processing');
  uploadFile(formData, albumUid);
});


// UPOLOADING FILE
async function uploadFile(formData, albumUid) {
  // Retrieving server info from local storage
  const serverInfo = await chrome.storage.local.get(['serverInfo']);
  const { photoprismUrl, authToken, userUid } = serverInfo.serverInfo; // Object destructuring

  try {
    // Uploading image with POST
    const uploadResponse = await fetch(photoprismUrl+'/api/v1/users/'+userUid+'/upload/_UploadPrism', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + authToken,
        'Connection': 'keep-alive'
      },
      body: formData
    });

    // Importing image with PUT
    const importResponse = await fetch(photoprismUrl+'/api/v1/users/'+userUid+'/upload/_UploadPrism', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + authToken,
        'Connection': 'keep-alive',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ albums: [albumUid] })
    });

    if ((await uploadResponse.json()).code == 200 && (await importResponse.json()).code == 200) {
      setIcon('success');
    }
  } catch (error) {
    console.log("Error when trying to upload/import media", error);
    setIcon('error');
  }
}


// ICON CHANGES - processing, success, error
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
  
    default:
      console.log("Unknown case, setting icon to default");
      setIconToDefault();
      break;
  }
}

// Reset icon after 3 seconds from previous change
function setIconToDefault() {
  setTimeout(() => {
    chrome.action.setIcon({
      path: "icons/icon128.png"
    })
  }, 3000);
}