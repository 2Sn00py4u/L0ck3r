// global variables
let registerButton = document.getElementById("registerButton");
let unameInput = document.getElementById("register_unameInput");
let passwdInput = document.getElementById("register_passwdInput");

// native-messaging port
let port = null;
port = chrome.runtime.connectNative('com.native.locker');

port.onMessage.addListener(function (response) {
    alert(response.access);
    if (response && response.access === true) {
        window.location.href = "../html/home.html";
        //alert(registerResponse.received);    
    };   
});
port.onDisconnect.addListener(function () {
    if(chrome.runtime.lastError){
        alert(chrome.runtime.lastError.message);
        console.log(chrome.runtime.lastError);
    }
});

// register processing
registerButton.addEventListener("click", function () {
    // get user input
    var uname = unameInput.value;
    var passwd = passwdInput.value;
    var registerRequest = {
        requestType: "registerRequest",
        uname: uname,
        passwd: passwd
    };
    // post the register-request
    port.postMessage(registerRequest);
    //alert("posted: " + registerRequest.requestType);
});
