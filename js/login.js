if (localStorage.getItem("userdata") !== null){
    window.location.href = "../html/home.html";
};

// global variables
let loginButton = document.getElementById("loginButton");
let unameInput = document.getElementById("login_unameInput");
let passwdInput = document.getElementById("login_passwdInput");

function getNativePort() {
    return chrome.runtime.connectNative('com.native.locker');
}

let port = getNativePort();

// check on invalid input
if (localStorage.getItem("invalidLoginInput") === "true"){
    unameInput.classList.add("error");
    passwdInput.classList.add("error");
    unameInput.value = localStorage.getItem("uname");
    passwdInput.value = localStorage.getItem("passwd");
    if (localStorage.getItem("activeElement") === "login_unameInput") {
        unameInput.focus();
    } else if (localStorage.getItem("activeElement") === "login_passwdInput") {
        passwdInput.focus();
    } else {
        unameInput.focus();
    }
    localStorage.removeItem("invalidLoginInput");
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
            chrome.storage.local.set({ autofill: true });
            window.location.href = "../html/home.html";
        };
        if (response.access === false){
            var uname = unameInput.value;
            var passwd = passwdInput.value;
            localStorage.setItem("uname", uname);
            localStorage.setItem("passwd", passwd);
            if (unameInput === document.activeElement) {
                localStorage.setItem("activeElement", "login_unameInput");
            } else if (passwdInput === document.activeElement) {
                localStorage.setItem("activeElement", "login_passwdInput");
            }
            else{
                localStorage.setItem("activeElement", "");
            }
            localStorage.setItem("invalidLoginInput", "true");
            window.location.href = "../html/login.html";
        };
    };
});
port.onDisconnect.addListener(function () {
    if(chrome.runtime.lastError){
        console.error(chrome.runtime.lastError.message);
    }
    var uname = unameInput.value;
    var passwd = passwdInput.value;
    localStorage.setItem("uname", uname);
    localStorage.setItem("passwd", passwd);
    if (unameInput === document.activeElement) {
        localStorage.setItem("activeElement", "login_unameInput");
    } else if (passwdInput === document.activeElement) {
        localStorage.setItem("activeElement", "login_passwdInput");
    }
    else{
        localStorage.setItem("activeElement", "");
    }
    localStorage.setItem("invalidLoginInput", "true");
    window.location.href = "../html/login.html";
});

// login processing
loginButton.addEventListener("click", function () {
    var uname = unameInput.value;
    var passwd = passwdInput.value;
    var loginRequest = {
        requestType: "loginRequest",
        uname: uname,
        passwd: passwd
    };
    document.getElementById("loginButton-container").innerHTML = '<div class="loginloader"></div>';
    port.postMessage(loginRequest);
});