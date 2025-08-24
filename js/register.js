// global variables
let registerButton = document.getElementById("registerButton");
let unameInput = document.getElementById("register_unameInput");
let passwdInput = document.getElementById("register_passwdInput");

function getNativePort() {
    return chrome.runtime.connectNative('com.native.locker');
}

let port = getNativePort();

// check on invalid input
if (localStorage.getItem("invalidRegisterInput") === "true"){
    unameInput.classList.add("error");
    passwdInput.classList.add("error");
    unameInput.value = localStorage.getItem("uname");
    passwdInput.value = localStorage.getItem("passwd");
    if (localStorage.getItem("activeElement") === "register_unameInput") {
        unameInput.focus();
    } else if (localStorage.getItem("activeElement") === "register_passwdInput") {
        passwdInput.focus();
    } else {
        unameInput.focus();
    }
    localStorage.removeItem("invalidRegisterInput");
}

// main
port.onMessage.addListener(function (response) {
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
            if (unameInput === document.activeElement) {
                localStorage.setItem("activeElement", "register_unameInput");
            } else if (passwdInput === document.activeElement) {
                localStorage.setItem("activeElement", "register_passwdInput");
            }
            else{
                localStorage.setItem("activeElement", "");
            }
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
    var uname = unameInput.value;
    var passwd = passwdInput.value;
    if (unameInput === document.activeElement) {
        localStorage.setItem("activeElement", "register_unameInput");
    } else if (passwdInput === document.activeElement) {
        localStorage.setItem("activeElement", "register_passwdInput");
    }
    else{
        localStorage.setItem("activeElement", "");
    }
    localStorage.setItem("uname", uname);
    localStorage.setItem("passwd", passwd);
    localStorage.setItem("invalidRegisterInput", "true");
    window.location.href = "../html/register.html";
});

// register processing
registerButton.addEventListener("click", function () {
    var uname = unameInput.value;
    var passwd = passwdInput.value;
    var registerRequest = {
        requestType: "registerRequest",
        uname: uname,
        passwd: passwd
    };
    document.getElementById("registerButton-container").innerHTML = '<div class="loginloader"></div>';
    port.postMessage(registerRequest);
});
