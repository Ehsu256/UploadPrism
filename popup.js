// GETTING USER'S SERVER INFO FROM FORM
const serverInfoForm = document.getElementById("serverInfoForm");
serverInfoForm.addEventListener("submit", getServerInfo);

function getServerInfo() {
  const photoprismUrl = document.getElementById("photoprismUrl").value;
  const authToken = document.getElementById("authToken").value;
  const userUid = document.getElementById("userUid").value;

  const serverInfo = {
    photoprismUrl: photoprismUrl,
    authToken: authToken,
    userUid: userUid
  };

  chrome.storage.local.set({ serverInfo: serverInfo })
  .then(() => {
    console.log("Server info saved:", serverInfo);
  });
}