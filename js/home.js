//localStorage.clear();
function updateCredentialsFromUserdata(userdata) {
    if (userdata && userdata.password_cards && userdata.password_cards.length) {
        let credentials = {logindata: []};
        for (let i = 0; i < userdata.password_cards.length; i++) {
            const card = userdata.password_cards[i];
            credentials.logindata[i] = {
                hostname: card.card_title,
                username: card.email,
                password: card.password
            };
        }
        chrome.storage.local.set({ credentials: credentials });
    }
}

// Checking userdata in local storage and redirecting to login page if not found
let userdata = JSON.parse(localStorage.getItem("userdata"));
if (userdata === null || userdata === undefined) {
    window.location.href = "login.html";
}
else{
    updateCredentialsFromUserdata(userdata);
}

// updating the password_card id in the userdata object
for (let i = 1; i < userdata.password_cards.length + 1; i++){
    userdata.password_cards[i-1].card_id = i.toString();
};
localStorage.setItem("userdata", (JSON.stringify(userdata)));

var autofillToggle = document.getElementById("autofill-toggle")
chrome.storage.local.get("autofill", (autofill_settings) => {
    const autofill = autofill_settings.autofill || false;
    if (autofill === true){
        autofillToggle.innerHTML = "Autofill: ON";
    }
    else {
        autofillToggle.innerHTML = "Autofill: OFF";
    }
});

// variables
let hosting = false;
let connecting = false;

// port communication
let homepage = document.getElementById("homepage");
let port = null;

function establishPort() {
    port = chrome.runtime.connectNative('com.native.locker');
    port.onMessage.addListener(handlePortMessage);
    port.onDisconnect.addListener(function () {
        if (chrome.runtime.lastError) {
            console.log("Port disconnected:", chrome.runtime.lastError);
        } else {
            console.log("Port disconnected.");
        }
        establishPort();
    });
}
function handlePortMessage(response) {
    if (response) {
        if (response.logout && response.logout === true){
            homepage.classList.remove("logoutloader"); 
            localStorage.removeItem("userdata");
            chrome.storage.local.remove("credentials");
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
        if (response.accountDelete && response.accountDelete === true){
            homepage.classList.remove("logoutloader"); 
            localStorage.removeItem("userdata");
            chrome.storage.local.remove("credentials");
            localStorage.clear();
            window.location.href = "login.html";
        };
        if (response.hostList !== undefined){
            var hosts = response.hostList;
            let container = document.getElementById("hosts-container");
            container.classList.remove("loginloader"); 
            container.innerHTML = "";
            const hostTemplate = document.getElementById("host-template").innerHTML;
            for (let i = 0; i < hosts.length; i++){
                let host_data = {
                    host_id: i,
                    host_ip: hosts[i][0]
                }
                container.innerHTML += Mustache.render(hostTemplate, host_data);
            };
            for (let i = 0; i < hosts.length; i++){
                document.getElementById("Sync-btn-" + i.toString()).addEventListener("click", function(){
                    var collapse_img = document.getElementById("Sync-btn-img-" + i.toString());
                    if (collapse_img.src.endsWith("sync.png")){
                        collapse_img.src = "../assets/home/arrow_down.png";
                        document.getElementById("Sync-btn-" + i.toString()).style.borderWidth = "0px";

                    }
                    else{
                        collapse_img.src = "../assets/home/sync.png";
                        document.getElementById("Sync-btn-" + i.toString()).style.borderWidth = "1px";
                    }
                });
            };
            for (let i = 0; i < hosts.length; i++){
                document.getElementById("Connect-btn-" + i.toString()).addEventListener("click", function(){
                    if (hosting === true){
                        let syncContainer = document.getElementById("sync-container");
                        syncContainer.classList.remove("loginloader");
                        syncContainer.innerHTML += '<div class="alert alert-danger alert-dismissible fade show" role="alert" style="color: #e58990; background-color: #2b0c0f; border: #80252b 1px solid; margin: 2% 5% 2% 5%;">You are currently <b>hosting</b> a Sync-Server!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                        return;
                    }
                    else{
                        if (port === null){
                            establishPort();
                        }
                        let IP_connectInput = document.getElementById("IP-connectInput-" + i.toString());
                        let Port_connectInput = document.getElementById("Port-connectInput-" + i.toString());
                        let container = document.getElementById("sync-container");
                        if (IP_connectInput.value.length < 7 || IP_connectInput.value.length > 15){
                            alert("Please provide a valid IP-address (e.g. 192.168.xxx.xxx)!")
                        }
                        else if (parseInt(Port_connectInput.value) < 49152 || parseInt(Port_connectInput.value) > 65535){
                            alert("Please choose a port between 49152 and 65535, or use the default port 50091.")
                        }
                        else{
                            var connectRequest = {
                                requestType: "connectRequest",
                                uname: userdata.user,
                                password: userdata.password_cards[0].password,
                                ipaddr: IP_connectInput.value,
                                port: parseInt(Port_connectInput.value)
                            };
                            port.postMessage(connectRequest);
                            container.innerHTML = "";
                            container.classList.add("loginloader");
                            connecting = true;
                        }
                    }
                });
            };

            if (port === null){
                establishPort();
            }   
        }
        if (response.connected !== undefined){
            if (response.connected === true){
                let syncContainer = document.getElementById("sync-container");
                syncContainer.classList.remove("loginloader");
                let ipaddr = response.ipaddr;
                let added = response.added;
                syncContainer.innerHTML += '<div class="alert alert-success alert-dismissible fade show" role="alert" style="color: #7bb699; background-color: #071b11; border: #1a5034 1px solid; margin: 2% 5% 2% 5%;">Connected to '+ ipaddr +'<strong> successfully!</strong>!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                if (added === true){
                    syncContainer.innerHTML += '<div class="alert alert-success alert-dismissible fade show" role="alert" style="color: #7bb699; background-color: #071b11; border: #1a5034 1px solid; margin: 2% 5% 2% 5%;">New host <b> '+ ipaddr +'</b> added!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'; 
                }
                if (port === null){
                    establishPort();
                } 
                connecting = false; 
                localStorage.removeItem("userdata");
                chrome.storage.local.remove("credentials");
                alert("Successfully synchronized with the host!");
                window.location.href = "login.html";
                
            }
            else if (response.connected === false){
                let syncContainer = document.getElementById("sync-container");
                syncContainer.classList.remove("loginloader");
                syncContainer.innerHTML += '<div class="alert alert-danger alert-dismissible fade show" role="alert" style="color: #e58990; background-color: #2b0c0f; border: #80252b 1px solid; margin: 2% 5% 2% 5%;"><b><u>Failed</u></b> to connect to host!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                if (port === null){
                    establishPort();
                } 
                connecting = false;
            }
        }
        if (response.bindedServer !== undefined){
            if (response.bindedServer === true){
                let syncContainer = document.getElementById("sync-container");
                document.getElementById("sync-loader").classList.remove("loginloader");
                document.getElementById("sync-loader").remove();
                let ipaddr = response.ipaddr;
                syncContainer.innerHTML = '<div id="bindedServerSuccess" class="alert alert-success fade show" role="alert" style="color: #7bb699; background-color: #071b11; border: #1a5034 1px solid; margin: 2% 5% 2% 5%;">Binded Server-IP: <b>'+ ipaddr +'</b>!';
                if (port === null){
                    establishPort();
                } 
                syncContainer.innerHTML += '<div id="sync-loader" style="margin: 0 5% 5% 5%; display: flex; justify-content:center; align-items:center;"></div>';
                document.getElementById("sync-loader").classList.add("loginloader"); 
            }
            else if (response.bindedServer === false){
                let syncContainer = document.getElementById("sync-container");
                document.getElementById("sync-loader").classList.remove("loginloader");
                document.getElementById("sync-loader").remove();
                syncContainer.innerHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert" style="color: #e58990; background-color: #2b0c0f; border: #80252b 1px solid; margin: 2% 5% 2% 5%;"><b><u>Failed</u></b> to bind the Server-IP, please try again!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                if (port === null){
                    establishPort();
                } 
                hosting = false;
                document.getElementById("cancelHost-btn").style.display = "none";
                document.getElementById("Host-btn").style.display = "flex"; 
            }
        }
        if (response.hostedServer !== undefined){
            if (response.hostedServer === true){
                let syncContainer = document.getElementById("sync-container");
                document.getElementById("sync-loader").classList.remove("loginloader");
                document.getElementById("sync-loader").remove();
                let ipaddr = response.ipaddr;
                let port = response.port;
                syncContainer.innerHTML += '<div id="hostedServerSuccess" class="alert alert-success fade show" role="alert" style="color: #7bb699; background-color: #071b11; border: #1a5034 1px solid; margin: 2% 5% 2% 5%;">Hostet Server on: <b>'+ ipaddr + ':' + port +'</b>!';
                if (port === null){
                    establishPort();
                }
                syncContainer.innerHTML += '<div id="sync-loader" style="margin: 0 5% 5% 5%; display: flex; justify-content:center; align-items:center;"></div>';
                document.getElementById("sync-loader").classList.add("loginloader"); 
            }
            else if (response.hostedServer === false){
                let syncContainer = document.getElementById("sync-container");
                document.getElementById("sync-loader").classList.remove("loginloader");
                document.getElementById("sync-loader").remove();
                syncContainer.innerHTML += '<div class="alert alert-danger alert-dismissible fade show" role="alert" style="color: #e58990; background-color: #2b0c0f; border: #80252b 1px solid; margin: 2% 5% 2% 5%;"><b><u>Failed</u></b> to host the Sync-Server!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                if (port === null){
                    establishPort();
                } 
                hosting = false;
                document.getElementById("cancelHost-btn").style.display = "none";
                document.getElementById("Host-btn").style.display = "flex";
            }
        }
        if (response.clientConnection !== undefined){
            if (response.clientConnection === true){
                let syncContainer = document.getElementById("sync-container");
                document.getElementById("sync-loader").classList.remove("loginloader");
                document.getElementById("sync-loader").remove();
                let ipaddr = response.clientIP || "unknown";
                let port = response.clientPort || "unknown";
                syncContainer.innerHTML += '<div class="alert alert-success alert-dismissible fade show" role="alert" style="color: #7bb699; background-color: #071b11; border: #1a5034 1px solid; margin: 2% 5% 2% 5%;">Client connected: <b>'+ ipaddr + ':' + port +'</b>!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                let bindedServerSuccess = document.getElementById("bindedServerSuccess");
                let hostedServerSuccess = document.getElementById("hostedServerSuccess");
                bindedServerSuccess.classList.add("alert-dismissible");
                hostedServerSuccess.classList.add("alert-dismissible");
                bindedServerSuccess.innerHTML += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                hostedServerSuccess.innerHTML += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                if (port === null){
                    establishPort();
                } 
                hosting = false;
                document.getElementById("cancelHost-btn").style.display = "none";
                document.getElementById("Host-btn").style.display = "flex";
                alert("Successfully synchronized with the client!");
                localStorage.removeItem("userdata");
                chrome.storage.local.remove("credentials");
                window.location.href = "login.html";
                
            }
            else if (response.clientConnection === false){
                let syncContainer = document.getElementById("sync-container");
                document.getElementById("sync-loader").classList.remove("loginloader");
                document.getElementById("sync-loader").remove();
                let ipaddr = response.clientIP || "unknown";
                syncContainer.innerHTML += '<div class="alert alert-danger alert-dismissible fade show" role="alert" style="color: #e58990; background-color: #2b0c0f; border: #80252b 1px solid; margin: 2% 5% 2% 5%;"><b>DANGER!</b> Unauthorized Client (' + ipaddr + ') tried to connect!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                let bindedServerSuccess = document.getElementById("bindedServerSuccess");
                let hostedServerSuccess = document.getElementById("hostedServerSuccess");
                bindedServerSuccess.classList.add("alert-dismissible");
                hostedServerSuccess.classList.add("alert-dismissible");
                bindedServerSuccess.innerHTML += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                hostedServerSuccess.innerHTML += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                if (port === null){
                    establishPort();
                }
                hosting = false;
                document.getElementById("cancelHost-btn").style.display = "none";
                document.getElementById("Host-btn").style.display = "flex";
            }
        }
        if (response.cancelServer !== undefined){
            if (response.cancelServer === true){
                let syncContainer = document.getElementById("sync-container");
                document.getElementById("sync-loader").classList.remove("loginloader");
                document.getElementById("sync-loader").remove();
                syncContainer.innerHTML += '<div class="alert alert-warning alert-dismissible fade show" role="alert" style="color: #e5c27b; background-color: #1f1a0f; border: #7b6d1a 1px solid; margin: 2% 5% 2% 5%;">Hosting server <b>stopped</b>!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                let bindedServerSuccess = document.getElementById("bindedServerSuccess");
                let hostedServerSuccess = document.getElementById("hostedServerSuccess");
                bindedServerSuccess.classList.add("alert-dismissible");
                hostedServerSuccess.classList.add("alert-dismissible");
                bindedServerSuccess.innerHTML += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                hostedServerSuccess.innerHTML += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                if (port === null){
                    establishPort();
                } 
                hosting = false;
                document.getElementById("cancelHost-btn").style.display = "none";
                document.getElementById("Host-btn").style.display = "flex";

            }
            else if (response.cancelServer === false){
                let syncContainer = document.getElementById("sync-container");
                document.getElementById("sync-loader").classList.remove("loginloader");
                document.getElementById("sync-loader").remove();
                syncContainer.innerHTML += '<div class="alert alert-danger alert-dismissible fade show" role="alert" style="color: #e58990; background-color: #2b0c0f; border: #80252b 1px solid; margin: 2% 5% 2% 5%;"><b>Failed</b> to stop hosting, please try again!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
                if (port === null){
                    establishPort();
                }
            }
        }
    };
};

if (port === null){
    establishPort();
} 


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
            if (port === null){
                establishPort();
            } 
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
            if (port === null){
                establishPort();
            } 
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
        // Image edit Password Card
        let editPasswordCard_id = "Image-editPassword-" + i.toString(); 
        document.getElementById(editPasswordCard_id).addEventListener("click", function() {
            document.getElementById("Image-Input-editPassword-" + i.toString()).click();
        });
        let editPassword_Image_Input = document.getElementById("Image-Input-editPassword-" + i.toString());
        editPassword_Image_Input.addEventListener("change", function() {
            const img_file = editPassword_Image_Input.files[0];
            const img_preview = document.getElementById('Image-btnImage-editPassword-' + i.toString());
            if (img_file) {
                const img_reader = new FileReader();
                img_reader.addEventListener("load", function() {
                    img_preview.src = img_reader.result;
                    img_preview.style.opacity = 1;
                });
                img_reader.readAsDataURL(img_file);
                localStorage.setItem("editPasswordCardImage", true);
            }
        });
        let edit_button_id = "save-changes-" + i.toString();
        let edit_button = document.getElementById(edit_button_id);

        edit_button.addEventListener("click", function(){
            if (port === null){
                establishPort();
            } 
            let newUsername_id = "emailInfo-" + i.toString()
            let newUsername = document.getElementById(newUsername_id).value;
            let newPassword_id = "passwordInfo-" + i.toString()
            let newPassword = document.getElementById(newPassword_id).value;

            localStorage.setItem("userdataBackup", JSON.stringify(userdata));
            localStorage.setItem("card_id", i.toString());
            userdata.password_cards[i-1].email = newUsername;
            userdata.password_cards[i-1].password = newPassword;
            if (localStorage.getItem("editPasswordCardImage") === "true"){
                localStorage.removeItem("editPasswordCardImage");
                userdata.password_cards[i-1].img_path = document.getElementById('Image-btnImage-editPassword-'+ i.toString()).src;
            }
            let edit_passwdCard_message = {
                requestType: "edit_passwordCard",
                uname: userdata.user,
                password_card: userdata.password_cards[i-1],
                img_path: userdata.password_cards[i-1].img_path
            };
            port.postMessage(edit_passwdCard_message);
        });
    };

    if (localStorage.getItem("L0CK3R_usernameInUse") === "true"){
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
            if (port === null){
                establishPort();
            } 
            let warnModal_id = "delete-warning-" + i.toString();
            let warnModal = new bootstrap.Modal(document.getElementById(warnModal_id), {
                backdrop: 'static',
                keyboard: false
            });
            warnModal.show();
            let final_delete_id = "final-delete-" + i.toString();
            document.getElementById(final_delete_id).addEventListener("click", function(){
                if (port === null){
                    establishPort();
                } 
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
        if (port === null){
            establishPort();
        } 
        let addPasswordCardModal = new bootstrap.Modal(document.getElementById("add-password-modal"), {
            backdrop: 'static',
            keyboard: false
        });
        addPasswordCardModal.show();
        let addPasswordCardButton = document.getElementById("add-Password");
        addPasswordCardButton.addEventListener("click", function() {
            if (port === null){
                establishPort();
            } 
            let PasswordImage = document.getElementById('Image-btnImage-addPassword');
            let addPasswordCardImage = localStorage.getItem("addPasswordCardImage");
            if (addPasswordCardImage === "true"){
                localStorage.removeItem("addPasswordCardImage");
            }
            else {
                PasswordImage.src = "../assets/icons/icon128.png";
            }
            let newPasswordCard = {
                card_id: (userdata.password_cards.length + 1).toString(),
                card_title: document.getElementById("Title-addPassword").value,
                img_path: PasswordImage.src,
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

    // Image add Password Card
    document.getElementById("Image-addPassword").addEventListener("click", function() {
        document.getElementById("Image-Input-addPassword").click();
    });
    let addPassword_Image_Input = document.getElementById("Image-Input-addPassword")
    addPassword_Image_Input.addEventListener("change", function() {
        const file = addPassword_Image_Input.files[0];
        const preview = document.getElementById('Image-btnImage-addPassword');
        if (file) {
            const reader = new FileReader();
            reader.addEventListener("load", function() {
                preview.src = reader.result;
                preview.style.opacity = 1;
            });
            reader.readAsDataURL(file);
            localStorage.setItem("addPasswordCardImage", true);
        }
    });

    // copy add- password
    let copyButton_img  = document.getElementById("copy-password-btnImage-addPassword");
    document.getElementById("copy-password-btn-addPassword").addEventListener("click", function() {
        if (port === null){
            establishPort();
        } 
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
        if (port === null){
            establishPort();
        } 
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
document.getElementById("L0CK3R_MyAccount").addEventListener("click", function() {
    let myAccountModal = new bootstrap.Modal(document.getElementById("password-info-1"), {
        backdrop: 'static',
        keyboard: false
    });
    myAccountModal.show();
});

document.getElementById("L0CK3R_DeleteAccount").addEventListener("click", function() {
    let myAccountModal = new bootstrap.Modal(document.getElementById("delete-account-warning"), {
        backdrop: 'static',
        keyboard: false
    });
    myAccountModal.show();
    document.getElementById("final-account-delete").addEventListener("click", function(){
        if (port === null){
            establishPort();
        } 
        let deleteAccountControl = document.getElementById("Account-Delete-Input");
        if (deleteAccountControl.value === "Delete my L0CK3R!") {
            var deleteAccountRequest = {
                requestType: "deleteAccountRequest",
                uname: userdata.user,
            };
            port.postMessage(deleteAccountRequest);
            homepage.innerHTML = "";
            homepage.classList.add("logoutloader");
        }
        else {
            deleteAccountControl.value = "";
        }
    });
});

// add Eventlistener to search
document.getElementById("search-input").addEventListener("input", function() {
    let searchInput = document.getElementById("search-input").value.toLowerCase();
    for (let i=0; i < userdata.password_cards.length; i++){
        if (searchInput.includes("passwd:")){
            let passwordSearch = searchInput.split("passwd:")[1].trim();
            if (userdata.password_cards[i].password.toLowerCase().includes(passwordSearch)) {
                let passwordCard = document.getElementById("preview-password-card-" + (i + 1).toString());
                passwordCard.style.display = "flex";
            }
            else {
                let passwordCard = document.getElementById("preview-password-card-" + (i + 1).toString());
                passwordCard.style.display = "none";
            }
        }
        else if (searchInput.includes("email:")){
            let emailSearch = searchInput.split("email:")[1];
            if (userdata.password_cards[i].email.toLowerCase().includes(emailSearch)) {
                let passwordCard = document.getElementById("preview-password-card-" + (i + 1).toString());
                passwordCard.style.display = "flex";
            }
            else {
                let passwordCard = document.getElementById("preview-password-card-" + (i + 1).toString());
                passwordCard.style.display = "none";
            }
        }
        else if (userdata.password_cards[i].card_title.toLowerCase().includes(searchInput)) {
            let passwordCard = document.getElementById("preview-password-card-" + (i + 1).toString());
            passwordCard.style.display = "flex";
        }
        else {
            let passwordCard = document.getElementById("preview-password-card-" + (i + 1).toString());
            passwordCard.style.display = "none";
        }
    };
});


autofillToggle.addEventListener("click", function() {
    let value = autofillToggle.innerHTML;
    if (value === "Autofill: ON") {
        autofillToggle.innerHTML = "Autofill: OFF";
        chrome.storage.local.set({ autofill: false });
    }
    else if (value === "Autofill: OFF") {
        autofillToggle.innerHTML = "Autofill: ON";
        let userdata = JSON.parse(localStorage.getItem("userdata"));
        updateCredentialsFromUserdata(userdata);
        chrome.storage.local.set({ autofill: true });
        window.location.reload();
    }
});

// Sync devices
document.getElementById("Sync_Devices").addEventListener("click", function(){
    if (port === null){
        establishPort();
    } 
    let syncModal = new bootstrap.Modal(document.getElementById("Sync-LOCKER"), {
        backdrop: 'static',
        keyboard: false
    });
    syncModal.show();
    let container = document.getElementById("hosts-container");
    var searchHostsRequest = {
        requestType: "searchHostsRequest",
        uname: userdata.user,
    };
    port.postMessage(searchHostsRequest);
    container.innerHTML = "";
    container.classList.add("loginloader"); 
});

var connect_collapse_toggle = document.getElementById("connect-collapse-toggle");
connect_collapse_toggle.addEventListener("click", function(){
    let isExpanded = connect_collapse_toggle.getAttribute("aria-expanded") === "true";
    if (isExpanded === true){
        document.getElementById("connect-collapse-toggle-img").src = "../assets/home/arrow_down.png";
        connect_collapse_toggle.style.borderWidth = "0px";
    }
    else{
        document.getElementById("connect-collapse-toggle-img").src = "../assets/home/sync.png";
        connect_collapse_toggle.style.borderWidth = "1px";
    }
})

var host_collapse_toggle = document.getElementById("host-collapse-toggle");
host_collapse_toggle.addEventListener("click", function(){
    let isExpanded = host_collapse_toggle.getAttribute("aria-expanded") === "true";
    if (isExpanded === true){
        document.getElementById("host-collapse-toggle-img").src = "../assets/home/arrow_down.png";
        host_collapse_toggle.style.borderWidth = "0px";
    }
    else{
        document.getElementById("host-collapse-toggle-img").src = "../assets/home/host.png";
        host_collapse_toggle.style.borderWidth = "1px";
    }
})

document.getElementById("close-sync-btn").addEventListener("click", function() {
    if (connecting === true){
        let syncContainer = document.getElementById("sync-container");
        syncContainer.classList.remove("loginloader");
        syncContainer.innerHTML += '<div class="alert alert-danger alert-dismissible fade show" role="alert" style="color: #e58990; background-color: #2b0c0f; border: #80252b 1px solid; margin: 2% 5% 2% 5%;">You are currently <b>connected</b> to another Server!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        return;
    }
    else if (hosting === true){
        let syncContainer = document.getElementById("sync-container");
        syncContainer.classList.remove("loginloader");
        syncContainer.innerHTML += '<div class="alert alert-danger alert-dismissible fade show" role="alert" style="color: #e58990; background-color: #2b0c0f; border: #80252b 1px solid; margin: 2% 5% 2% 5%;">You are currently <b>hosting</b> a Sync-Server!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        return;
    }
    else{
        window.location.href = "home.html";
    }
});

document.getElementById("Connect-btn").addEventListener("click", function() {
    if (hosting === true){
        let syncContainer = document.getElementById("sync-container");
        syncContainer.classList.remove("loginloader");
        syncContainer.innerHTML += '<div class="alert alert-danger alert-dismissible fade show" role="alert" style="color: #e58990; background-color: #2b0c0f; border: #80252b 1px solid; margin: 2% 5% 2% 5%;">You are currently <b>hosting</b> a Sync-Server!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        return;
    }
    else{
        if (port === null){
            establishPort();
        }
        let IP_connectInput = document.getElementById("IP-connectInput");
        let Port_connectInput = document.getElementById("Port-connectInput");
        let container = document.getElementById("sync-container");
        if (IP_connectInput.value.length < 7 || IP_connectInput.value.length > 15){
            alert("Please provide a valid IP-address (e.g. 192.168.xxx.xxx)!")
        }
        else if (parseInt(Port_connectInput.value) < 49152 || parseInt(Port_connectInput.value) > 65535){
            alert("Please choose a port between 49152 and 65535, or use the default port 50091.")
        }
        else{
            var connectRequest = {
                requestType: "connectRequest",
                uname: userdata.user,
                password: userdata.password_cards[0].password,
                ipaddr: IP_connectInput.value,
                port: parseInt(Port_connectInput.value)
            };
            port.postMessage(connectRequest);
            container.innerHTML = "";
            container.classList.add("loginloader");
            connecting = true;
        }
    }   
});

document.getElementById("Host-btn").addEventListener("click", function() {
    if (connecting === true){
        let syncContainer = document.getElementById("sync-container");
        syncContainer.classList.remove("loginloader");
        syncContainer.innerHTML += '<div class="alert alert-danger alert-dismissible fade show" role="alert" style="color: #e58990; background-color: #2b0c0f; border: #80252b 1px solid; margin: 2% 5% 2% 5%;">You are currently <b>connected</b> to another Server!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        return;
    }
    else {
        if (port === null){
            establishPort();
        }
        let Time_hostInput = document.getElementById("Time-hostInput");
        if (parseInt(Time_hostInput.value) < 10 || parseInt(Time_hostInput.value) > 60 || Time_hostInput.value === ""){
            Time_hostInput.value = "10";
        }
        let Port_hostInput = document.getElementById("Port-hostInput");
        if (parseInt(Port_hostInput.value) < 49152 || parseInt(Port_hostInput.value) > 65535){
            alert("Please choose a port between 49152 and 65535, or use the default port 50091.")
        }
        else if (Port_hostInput.value === ""){
            Port_hostInput.value = "50091";
        }
        else{
            let container = document.getElementById("sync-container");
            var hostRequest = {
                requestType: "hostRequest",
                uname: userdata.user,
                password: userdata.password_cards[0].password,
                port: parseInt(Port_hostInput.value),
                time: parseInt(Time_hostInput.value)
            };
            hosting = true;
            port.postMessage(hostRequest);
            container.innerHTML = "";
            container.innerHTML += '<div id="sync-loader" style="margin: 0 5% 5% 5%; display: flex; justify-content:center; align-items:center;"></div>';
            document.getElementById("sync-loader").classList.add("loginloader");
            document.getElementById("cancelHost-btn").style.display = "flex";
            document.getElementById("Host-btn").style.display = "none";
        }
    }
    
});

let cancelPort = null
function initCancelPort(){
    cancelPort = chrome.runtime.connectNative('com.native.locker');
    cancelPort.onMessage.addListener(handlePortMessage);
    cancelPort.onDisconnect.addListener(function () {
        if (chrome.runtime.lastError) {
            console.log("Port disconnected:", chrome.runtime.lastError);
        } else {
            console.log("Port disconnected.");
        }
    });
}

document.getElementById("cancelHost-btn").addEventListener("click", function() {
    initCancelPort();
    let container = document.getElementById("sync-container");
    let Port_hostInput = document.getElementById("Port-hostInput");
    var cancelRequest = {
        requestType: "cancelHostRequest",
        uname: userdata.user,
        password: userdata.password_cards[0].password,
        port: parseInt(Port_hostInput.value)
    };
    cancelPort.postMessage(cancelRequest);
    document.getElementById("sync-loader").classList.add("loginloader");
});

document.getElementById("Reload-btn").addEventListener("click", function() {
    if (connecting === true){
        let syncContainer = document.getElementById("sync-container");
        syncContainer.classList.remove("loginloader");
        syncContainer.innerHTML += '<div class="alert alert-danger alert-dismissible fade show" role="alert" style="color: #e58990; background-color: #2b0c0f; border: #80252b 1px solid; margin: 2% 5% 2% 5%;">You are currently <b>connected</b> to another Server!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        return;
    }
    else if (hosting === true){
        let syncContainer = document.getElementById("sync-container");
        syncContainer.classList.remove("loginloader");
        syncContainer.innerHTML += '<div class="alert alert-danger alert-dismissible fade show" role="alert" style="color: #e58990; background-color: #2b0c0f; border: #80252b 1px solid; margin: 2% 5% 2% 5%;">You are currently <b>hosting</b> a Sync-Server!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
        return;
    }
    else {
        if (port === null){
            establishPort();
        }
        let container = document.getElementById("hosts-container");
        var searchHostsRequest = {
            requestType: "searchHostsRequest",
            uname: userdata.user,
        };
        port.postMessage(searchHostsRequest);
        container.innerHTML = "";
        container.classList.add("loginloader");
    }
});

// about-page
document.getElementById("About").addEventListener("click", function() {
    let aboutModal = new bootstrap.Modal(document.getElementById("About-LOCKER"), {
        backdrop: 'static',
        keyboard: false
    });
    aboutModal.show(); 
});

document.getElementById("Github-Link").addEventListener("click", function() {
    chrome.tabs.create({ url: "https://github.com/2Sn00py4u/L0ck3r" });
});

document.getElementById("easteregg-input").addEventListener("input", function(){
    let value = document.getElementById("easteregg-input").value.toLowerCase();
    if (value == "pitas"){
        if (userdata.user == "toni"){
            alert("Die Wissenschaft hat festgestellt, dass Marmelade Fett enthält!");
        }
        else{
            alert("You are not the chosen one!")
        }
        
    }
});

// add Eventlistener logout button
let logoutButton = document.getElementById("logout_button")
logoutButton.addEventListener("click", function() {
    if (port === null){
        establishPort();
    }
    var logoutRequest = {
        requestType: "logoutRequest",
        timestamp: new Date().toLocaleString(),
        uname: userdata.user,
    };
    port.postMessage(logoutRequest);
    homepage.innerHTML = "";
    homepage.classList.add("logoutloader");
});

