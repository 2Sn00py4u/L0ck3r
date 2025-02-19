let loginButton = document.getElementById("loginButton");

let port = null

loginButton.addEventListener("click", function () {
    port = chrome.runtime.connectNative('com.native.locker');
    onDisconnect();
    alert("return 0");
    
});

function onDisconnect(){
    port.onDisconnect.addListener(function () {
        if(chrome.runtime.lastError){
            console.log(chrome.runtime.lastError);
        }
    });
};