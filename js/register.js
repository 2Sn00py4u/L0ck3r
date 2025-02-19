let registerButton = document.getElementById("registerButton");

let port = null

registerButton.addEventListener("click", function () {
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
