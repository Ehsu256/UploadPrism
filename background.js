/// CONTEXT MENU
// Making the context menu items on extension install/update.

// Not really needed !!! Context menus can be done on startup or after form submition
chrome.runtime.onInstalled.addListener(function () {
  let contextsList = [
    "image",
    "video"
  ];

  for (let i = 0; i < contextsList.length; i++) {
    let contextItem = contextsList[i];
    let contextTitle = "Save " + contextItem + " to PhotoPrism";
    // Creating each context menu item.
    chrome.contextMenus.create({
      title: contextTitle,
      contexts: [contextItem],
      id: contextItem
    });
  }
});


chrome.runtime.onStartup.addListener(async function () {
  console.log("ay");
  await chrome.contextMenus.removeAll();
  
  let parent = chrome.contextMenus.create({
    title: "parent item",
    id:"parent"
  });
  chrome.contextMenus.create({
    title: "child item",
    parentId: parent,
    id: "child1"
  });
  chrome.contextMenus.create({
    title: "child item 2",
    parentId: parent,
    id: "child2"
  });
});


// UPLOAD AND IMPORT FILE TO PHOTOPRISM ON CONTEXT MENU ITEM CLICK
// Removed the "tab" parameter as it was unused (I believe)
chrome.contextMenus.onClicked.addListener(async function fetchFile(info) {
  // RETRIEVING USER'S SERVER INFO FROM STORAGE
  // Retrieving it before every upload may be inefficient
  const serverInfo = await chrome.storage.local.get(["serverInfo"]);
  const photoprismUrl = serverInfo.serverInfo.photoprismUrl;
  const authToken = serverInfo.serverInfo.authToken;
  const userUid = serverInfo.serverInfo.userUid;

  // PREPARING FILE FOR UPLOAD
  // Fetching the right-clicked file
  const fileUrl = info.srcUrl;
  const response = await fetch(fileUrl);
  const blob = await response.blob();

  // Naming the file with the correct extension to prevent "unsupported file extension" error in PhotoPrism
  const extension = blob.type.split("/")[1]; // Getting the file extension from MIME type
  const fileName = "QoolPrism." + extension;
  const fileObject = new File([blob], fileName, { type: blob.type });

  // Creating FormData and appending the file object
  const formData = new FormData();
  formData.append("files", fileObject);
  console.log("FILE INFORMATION:\n", formData.get("files"));

  // UPLOADING THE FILE
  const uploadResponse = await fetch(photoprismUrl+"/api/v1/users/"+userUid+"/upload/_QoolPrism", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + authToken,
      "Connection": "keep-alive"
    },
    body: formData
  });
  console.log("UPLOAD RESULTS:\n", await uploadResponse.json());

  // IMPORTING THE FILE
  const importResponse = await fetch(photoprismUrl+"/api/v1/users/"+userUid+"/upload/_QoolPrism", {
    method: "PUT",
    headers: {
      "Authorization": "Bearer " + authToken,
      "Connection": "keep-alive",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ albums: [] })
  });
  console.log("IMPORT RESULTS:\n", await importResponse.json());
});