var userdata = {}
var suggested = {}
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "open_password_suggestion") {
    userdata = msg.userdata
    suggested = msg.suggested
    chrome.windows.create({
          url: chrome.runtime.getURL("html/passwordSuggestion.html"),
          type: "popup",
          width: 460,
          height: 500
      });
    }
  if (msg.type === "password_suggestion_ready") {
    chrome.runtime.sendMessage({
      type: "init_data",
      suggested: suggested,
      data: userdata
    });
  }
});

