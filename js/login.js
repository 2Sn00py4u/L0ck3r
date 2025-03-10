// global variables
let loginButton = document.getElementById("loginButton");
let unameInput = document.getElementById("login_unameInput");
let passwdInput = document.getElementById("login_passwdInput");
// native-messaging port
let port = null

loginButton.addEventListener("click", function () {
    // get user input
    var uname = unameInput.value;
    var passwd = passwdInput.value;
    var loginRequest = {
        requestType: "loginRequest",
        uname: uname,
        passwd: passwd
    };
    // connect via port
    port = chrome.runtime.connectNative('com.native.locker');
    port.postMessage(loginRequest);
    alert(loginRequest);
    // wait for the response asynchronously using a Promise
    recvMessage().then(response => {
        alert(response.received + "," + response.access); // alert the response
    }).catch(error => {
        alert('Error receiving message:', error);
    });
    
    // listening for disconnect
    onDisconnect();
});

// receive message function with Promise
function recvMessage() {
    return new Promise((resolve, reject) => {
        port.onMessage.addListener(function (msg) {
            if (msg) {
                resolve(msg); // resolve the Promise with the received message
            } else {
                reject('No message received'); // reject if no message received
            }
        });
    });
}

// disconnect error-handling
function onDisconnect(){
    port.onDisconnect.addListener(function () {
        if(chrome.runtime.lastError){
            console.log(chrome.runtime.lastError);
        }
    });
};
