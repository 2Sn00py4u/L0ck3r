let loginButton = document.getElementById("loginButton");
let unameInput = document.getElementById("login_unameInput");
let passwdInput = document.getElementById("login_passwdInput");

let port = null

loginButton.addEventListener("click", function () {
    var uname = unameInput.value;
    var passwd = unameInput.value;
    port = chrome.runtime.connectNative('com.native.locker');
    port.postMessage({text: 'Hello from login'});
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