// GETTING USER'S SERVER INFO FROM FORM
const serverInfoForm = document.getElementById('serverInfoForm');

serverInfoForm.addEventListener('submit', async () => {
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
    .then(createContextMenus);
});


// CREATE CONTEXT MENUS
async function createContextMenus() {
  chrome.contextMenus.create({
    title: 'media',
    contexts: ['image', 'video', 'audio'],
    id: 'media'
  },
  function () {
    if (chrome.runtime.lastError) {
      console.log('Got error when creating context menu: ' + chrome.runtime.lastError.message);
    }
  });
}