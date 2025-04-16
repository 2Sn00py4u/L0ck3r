let userdata = JSON.parse(localStorage.getItem("userdata"));
if (userdata === null) {
    window.location.href = "../html/login.html";
}

document.addEventListener("DOMContentLoaded", function() {
    const homeTemplate = document.getElementById("content-template").innerHTML;
    let greeting_data = {
        user: userdata.user,
        latest_access: userdata.latest_access,
    }
    let template = document.getElementById("content-container");
    template.innerHTML += Mustache.render(homeTemplate, greeting_data);

    const cardTemplate = document.getElementById("preview-card-template").innerHTML;
    let password_data = {}
    for (let i = 0; i < userdata.password_cards.length; i++) {
        password_data = {
            card_id: userdata.password_cards[i].card_id,
            card_title: userdata.password_cards[i].card_title,
            img_path: userdata.password_cards[i].img_path,
            email: userdata.password_cards[i].email,
            password: userdata.password_cards[i].password,
        };
        template = document.getElementById("preview-password-cards-container");
        template.innerHTML += Mustache.render(cardTemplate, password_data); 
    }   
});


let logoutButton = document.getElementById("logout_button")

logoutButton.addEventListener("click", function() {
    let port = chrome.runtime.connectNative('com.native.locker');

    port.onMessage.addListener(function (response) {
        logoutButton.style.backgroundColor = "transparent"; // Re-enable the button after processing
        if (response) {
            if (response.logout === true){
                localStorage.removeItem("userdata");
                window.location.href = "../html/login.html";
            };
        };
    });
    port.onDisconnect.addListener(function () {
        if(chrome.runtime.lastError){
            console.log(chrome.runtime.lastError);
        }
    });

    var logoutRequest = {
        requestType: "logoutRequest",
        timestamp: new Date().toLocaleString(),
        uname: userdata.user,
    };
    port.postMessage(logoutRequest);
    logoutButton.style.backgroundColor = "#313241";
    
});