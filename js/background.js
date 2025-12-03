chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "open_extension_window") {
        chrome.windows.create({
            url: chrome.runtime.getURL("html/home.html"),
            type: "popup",
            width: 600,
            height: 500
        });

    }
});
