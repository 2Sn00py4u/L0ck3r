// global variables
let registerButton = document.getElementById("registerButton");
let unameInput = document.getElementById("register_unameInput");
let passwdInput = document.getElementById("register_passwdInput");
// native-messaging port
let port = null

registerButton.addEventListener("click", function () {
    // get user input
    var uname = unameInput.value;
    var passwd = passwdInput.value;
    var registerRequest = {
        requestType: "registerRequest",
        uname: uname,
        passwd: passwd
    };
    // connect via port
    port = chrome.runtime.connectNative('com.native.locker');
    port.postMessage(registerRequest);
    alert(registerRequest);
    // wait for the response asynchronously using a Promise
    recvMessage().then(response => {
        alert(response.received + "," + response.access); // alert the response
    }).catch(error => {
        alert('Error receiving response:', error);
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
