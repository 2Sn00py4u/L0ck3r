//localStorage.removeItem("userdata")
let userdata = JSON.parse(localStorage.getItem("userdata"));
if (userdata === null) {
    window.location.href = "login.html";
}

for (let i = 1; i < userdata.password_cards.length + 1; i++){
    userdata.password_cards[i-1].card_id = i.toString();
};
localStorage.setItem("userdata", (JSON.stringify(userdata)));



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
    };
});
port.onDisconnect.addListener(function () {
    if(chrome.runtime.lastError){
        console.log(chrome.runtime.lastError);
    }
});

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
    };  

    for (let i = 1; i < userdata.password_cards.length +1; i++) {
        let delete_button_id = "delete-image-" + i.toString();
        //alert(delete_button_id)
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
});


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
