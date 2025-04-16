// global variables
let registerButton = document.getElementById("registerButton");
let unameInput = document.getElementById("register_unameInput");
let passwdInput = document.getElementById("register_passwdInput");

// native-messaging port
let port = null;
port = chrome.runtime.connectNative('com.native.locker');

// check on invalid input

if (localStorage.getItem("invalidRegisterInput") === "true"){
    unameInput.classList.add("error");
    passwdInput.classList.add("error");
    unameInput.value = localStorage.getItem("uname");
    passwdInput.value = localStorage.getItem("passwd");
    localStorage.removeItem("invalidRegisterInput");
}

// main
port.onMessage.addListener(function (response) {
    registerButton.disabled = false; // Re-enable the button after processing
    registerButton.innerText = "Register"; // Reset button text
    if (response) {
        if (response.access === true){
            if (response.userdata.latest_access === "new"){
                const latest_access = new Date().toLocaleString();
                response.userdata.latest_access = latest_access;
            }
            localStorage.setItem("userdata", JSON.stringify(response.userdata));
            window.location.href = "../html/home.html";
        };
        if (response.access === false){
            var uname = unameInput.value;
            var passwd = passwdInput.value;
            localStorage.setItem("uname", uname);
            localStorage.setItem("passwd", passwd);
            localStorage.setItem("invalidRegisterInput", "true");
            window.location.href = "../html/register.html";
        };
    };
});
port.onDisconnect.addListener(function () {
    if(chrome.runtime.lastError){
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
    registerButton.disabled = true; // Disable the button to prevent multiple clicks
    registerButton.innerText = "Registering..."; // Change button text to indicate processing
    port.postMessage(registerRequest);
});
