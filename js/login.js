
// global variables
let loginButton = document.getElementById("loginButton");
let unameInput = document.getElementById("login_unameInput");
let passwdInput = document.getElementById("login_passwdInput");

// native-messaging port
let port = null;
port = chrome.runtime.connectNative('com.native.locker');

// check on invalid input
if (localStorage.getItem("invalidLoginInput") === "true"){
    unameInput.classList.add("error");
    passwdInput.classList.add("error");
    unameInput.value = localStorage.getItem("uname");
    passwdInput.value = localStorage.getItem("passwd");
    localStorage.removeItem("invalidLoginInput");
}

// main
port.onMessage.addListener(function (response) {
    loginButton.disabled = false; // Re-enable the button after processing
    loginButton.innerText = "Login"; // Reset button text
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
            localStorage.setItem("invalidLoginInput", "true");
            window.location.href = "../html/login.html";
        };
    };
});
port.onDisconnect.addListener(function () {
    if(chrome.runtime.lastError){
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
    loginButton.disabled = true; // Disable the button to prevent multiple clicks 
    loginButton.innerText = "Logging in..."; // Change button text to indicate processing
    port.postMessage(loginRequest);
});