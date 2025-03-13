// global variables
let loginButton = document.getElementById("loginButton");
let unameInput = document.getElementById("login_unameInput");
let passwdInput = document.getElementById("login_passwdInput");

// native-messaging port
let port = null;
port = chrome.runtime.connectNative('com.native.locker');

port.onMessage.addListener(function (response) {
    if (response) {
        var loginResponse = response;
        //alert(loginResponse.received + "," + loginResponse.access);
        if (loginResponse){
            if (loginResponse.access === true){
                window.location.href = "../html/home.html";
                alert(loginResponse.received);
            }
        };
    };   
});
port.onDisconnect.addListener(function () {
    if(chrome.runtime.lastError){
        alert(chrome.runtime.lastError.message);
        console.log(chrome.runtime.lastError);
    }
});

// login processing
loginButton.addEventListener("click", function () {
    // get user input
    var uname = unameInput.value;
    var passwd = passwdInput.value;
    var loginRequest = {
        requestType: "loginRequest",
        uname: uname,
        passwd: passwd
    };
    // post the Login-request
    port.postMessage(loginRequest);
    alert("posted: " + loginRequest.requestType);
});
