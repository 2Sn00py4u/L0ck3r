let registerButton = document.getElementById("registerButton");
let unameInput = document.getElementById("register_unameInput");
let passwdInput = document.getElementById("register_passwdInput");

let port = null

registerButton.addEventListener("click", function () {
    var uname = unameInput.value;
    var passwd = unameInput.value;
    port = chrome.runtime.connectNative('com.native.locker');
    port.postMessage({text: 'Hello from register'});
    recvMessage();
    onDisconnect();
    alert(uname, passwd);
    
});

function onDisconnect(){
    port.onDisconnect.addListener(function () {
        if(chrome.runtime.lastError){
            console.log(chrome.runtime.lastError);
        }
    });
};

function recvMessage(){
    port.onMessage.addListener(function (msg) {
        alert('Received' + msg);
    });
}
