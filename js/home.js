//localStorage.clear();

// Checking userdata in local storage and redirecting to login page if not found
let userdata = JSON.parse(localStorage.getItem("userdata"));
if (userdata === null) {
    window.location.href = "login.html";
}

// updating the password_card id in the userdata object
for (let i = 1; i < userdata.password_cards.length + 1; i++){
    userdata.password_cards[i-1].card_id = i.toString();
};
localStorage.setItem("userdata", (JSON.stringify(userdata)));


// port communication
let homepage = document.getElementById("homepage");
let port = chrome.runtime.connectNative('com.native.locker');

port.onMessage.addListener(function (response) {
    if (response) {
        if (response.logout && response.logout === true){
            homepage.classList.remove("logoutloader"); 
            localStorage.removeItem("userdata");
            window.location.href = "login.html";
        };
        if (response.deletedPasswordCard && response.deletedPasswordCard === true){
            let password_card_id = localStorage.getItem("del_password_card_id");
            let password_card = document.getElementById(password_card_id);
            password_card.innerHTML = "";
            password_card.remove();
            localStorage.removeItem("del_password_card_id");
            let passwordCard_toDelete = JSON.parse(localStorage.getItem("passwordCard_toDelete"));
            for (let i = 0; i < userdata.password_cards.length; i++){
                if (userdata.password_cards[i].card_id === passwordCard_toDelete.card_id){
                    userdata.password_cards.splice(i,1);
                };
            };
            userdata = JSON.stringify(userdata);
            localStorage.setItem("userdata", userdata);
            window.location.href = "home.html";
        };
        
        if (response.editPasswordCard !== undefined){
            if (response.editPasswordCard === true){
                userdata.user = response.uname;
                localStorage.setItem("userdata", JSON.stringify(userdata));
                window.location.href = "home.html";
            }
            if (response.editPasswordCard === false){
                userdata = JSON.parse(localStorage.getItem("userdataBackup"));
                localStorage.setItem("L0CK3R_usernameInUse", true);
                window.location.href = "home.html";
            }
        };
        if (response.addedPasswordCard !== undefined){
            if (response.addedPasswordCard === true){
                localStorage.setItem("userdata", JSON.stringify(userdata));
                localStorage.removeItem("userdataBackup");
                window.location.href = "home.html";
            }
            if (response.addedPasswordCard === false){
                userdata = JSON.parse(localStorage.getItem("userdataBackup"));
                window.location.href = "home.html";
            }
        };
    };
});

port.onDisconnect.addListener(function () {
    if(chrome.runtime.lastError){
        console.log(chrome.runtime.lastError);
    }
});


// Loading the home page content using Mustache.js
document.addEventListener("DOMContentLoaded", function() {
    // adding preview-password cards to the home page
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
    };

    // adding event listeners to the password cards copy buttons
    for (let i = 1; i < userdata.password_cards.length + 1; i++){
        let passwordInfo_showId = "copy-password-btn-" + i.toString();
        let copyButton_img_id = "copy-password-btnImage-" + i.toString();
        let copyButton_img  = document.getElementById(copyButton_img_id);
        document.getElementById(passwordInfo_showId).addEventListener("click", function() {
            let passwordInfo_id = "passwordInfo-" + i.toString();
            let password = document.getElementById(passwordInfo_id).value;
            navigator.clipboard.writeText(password).then(() => {
                copyButton_img.src = "../assets/home/check.png";
                copyButton_img.style.opacity = 1;
                setTimeout(() => {
                    copyButton_img.src = "../assets/home/copy.png";
                    copyButton_img.style.opacity = 1;
                }, 200);
              }).catch(err => {
                console.error('Failed to copy text: ', err);
              });
        });
    }

    // adding event listeners to the password cards show/hide buttons
    for (let i = 1; i < userdata.password_cards.length + 1; i++){
        let passwordInfo_showId = "view-password-btn-" + i.toString();
        document.getElementById(passwordInfo_showId).addEventListener("click", function() {
            let passwordInfo_id = "passwordInfo-" + i.toString();
            let passwordInput = document.getElementById(passwordInfo_id);
            let viewButton_img_id = "view-password-btnImage-" + i.toString();
            let viewButton_img  = document.getElementById(viewButton_img_id);
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                viewButton_img.src = "../assets/home/show.png";
            } else {
                passwordInput.type = "password";
                viewButton_img.src = "../assets/home/hide.png";
            };
        });
    }

    // adding event listeners to the password cards edit buttons
    for (let i = 1; i < userdata.password_cards.length +1; i++) {
        let edit_button_id = "save-changes-" + i.toString();
        let edit_button = document.getElementById(edit_button_id);

        edit_button.addEventListener("click", function(){
            let newUsername_id = "emailInfo-" + i.toString()
            let newUsername = document.getElementById(newUsername_id).value;
            let newPassword_id = "passwordInfo-" + i.toString()
            let newPassword = document.getElementById(newPassword_id).value;

            //userdata.user = newUsername;
            localStorage.setItem("userdataBackup", JSON.stringify(userdata));
            localStorage.setItem("card_id", i.toString());
            userdata.password_cards[i-1].email = newUsername;
            userdata.password_cards[i-1].password = newPassword;
            let edit_passwdCard_message = {
                requestType: "edit_passwordCard",
                uname: userdata.user,
                password_card: userdata.password_cards[i-1],
            };
            port.postMessage(edit_passwdCard_message);
        });
    };

    if (localStorage.getItem("L0CK3R_usernameInUse") === "true"){
        `
        let card_id = localStorage.getItem("card_id");
        let password_info_id = "password-info-" + card_id;
        let password_info_Modal = new bootstrap.Modal(document.getElementById(password_info_id), {
            backdrop: 'static',
            keyboard: false
        });
        password_info_Modal.show();`
        let usernameInUseModal = new bootstrap.Modal(document.getElementById("usernameInUse"), {
            backdrop: 'static',
            keyboard: false
        });
        usernameInUseModal.show();
        localStorage.removeItem("L0CK3R_usernameInUse");
        localStorage.removeItem("card_id");
    }

    // adding event listeners to the password cards delete buttons
    document.getElementById("preview-card-options-1").remove();
    for (let i = 2; i < userdata.password_cards.length +1; i++) {
        let delete_button_id = "delete-image-" + i.toString();
        let delete_button = document.getElementById(delete_button_id);

        delete_button.addEventListener("click", function(){
            let warnModal_id = "delete-warning-" + i.toString();
            let warnModal = new bootstrap.Modal(document.getElementById(warnModal_id), {
                backdrop: 'static',
                keyboard: false
            });
            warnModal.show();
            let final_delete_id = "final-delete-" + i.toString();
            document.getElementById(final_delete_id).addEventListener("click", function(){
                try{
                    let delete_passwdCard_message = {
                        requestType: "delete_passwordCard",
                        uname: userdata.user,
                        password_card: userdata.password_cards[i-1],
                    };
                    port.postMessage(delete_passwdCard_message);
                    localStorage.setItem("del_password_card_id", ("preview-password-card-" + i.toString()));
                    localStorage.setItem("passwordCard_toDelete", JSON.stringify(userdata.password_cards[i-1]));
                }
                catch (Error){
                    console.log(Error);
                }
            }); 
        });
    };

    document.getElementById("add-button").addEventListener("click", function() {
        let addPasswordCardModal = new bootstrap.Modal(document.getElementById("add-password-modal"), {
            backdrop: 'static',
            keyboard: false
        });
        addPasswordCardModal.show();
        let addPasswordCardButton = document.getElementById("add-Password");
        addPasswordCardButton.addEventListener("click", function() {
            let newPasswordCard = {
                card_id: (userdata.password_cards.length + 1).toString(),
                card_title: document.getElementById("Title-addPassword").value,
                img_path: "../assets/icons/icon128.png",
                email: document.getElementById("Email-addPassword").value,
                password: document.getElementById("Password-addPassword").value,
            };
            localStorage.setItem("userdataBackup", JSON.stringify(userdata));
            userdata.password_cards.push(newPasswordCard);
            let add_passwdCard_message = {
                requestType: "add_passwordCard",
                uname: userdata.user,
                password_card: newPasswordCard,
            };
            port.postMessage(add_passwdCard_message);
        });
    });
    // copy add- password
    let copyButton_img  = document.getElementById("copy-password-btnImage-addPassword");
    document.getElementById("copy-password-btn-addPassword").addEventListener("click", function() {
        let password = document.getElementById("Password-addPassword").value;
        navigator.clipboard.writeText(password).then(() => {
            copyButton_img.src = "../assets/home/check.png";
            copyButton_img.style.opacity = 1;
            setTimeout(() => {
                copyButton_img.src = "../assets/home/copy.png";
                copyButton_img.style.opacity = 1;
            }, 200);
            }).catch(err => {
            console.error('Failed to copy text: ', err);
            });
    });


    // hide/view add - password
    document.getElementById("view-password-btn-addPassword").addEventListener("click", function() {
        let passwordInput = document.getElementById("Password-addPassword");
        let viewButton_img  = document.getElementById("view-password-btnImage-addPassword");
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            viewButton_img.src = "../assets/home/show.png";
        } else {
            passwordInput.type = "password";
            viewButton_img.src = "../assets/home/hide.png";
        };
    });
});


// side menu

// add Eventlistener logout button
let logoutButton = document.getElementById("logout_button")
logoutButton.addEventListener("click", function() {
    var logoutRequest = {
        requestType: "logoutRequest",
        timestamp: new Date().toLocaleString(),
        uname: userdata.user,
    };
    port.postMessage(logoutRequest);
    homepage.innerHTML = "";
    homepage.classList.add("logoutloader");
});



    

