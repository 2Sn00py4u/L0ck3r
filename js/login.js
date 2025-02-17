document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("loginButton").addEventListener("click", function () {
        console.log("button has been clicked");
        var port = chrome.runtime.connectNative('com.locker.backend');
        port.postMessage({text: 'Hello, my_application'});
        port.onMessage.addListener(function (msg) {
            console.log('Received' + msg);
        });
        port.onDisconnect.addListener(function () {
            console.log('Disconnected');
        });
        port.postMessage({text: 'Hello, my_application'});
    });
});