let userdata = {user: "default", level: "default"}

// init-data
function init_data(){
    chrome.runtime.sendMessage({ type: "password_suggestion_ready" });
};

// Tab-Menu
function init_tabMenu(){
    var passwordSuggestionLink = document.getElementById("passwordSuggestionLink");
    var passwordGeneratorLink = document.getElementById("passwordGeneratorLink");
    var openLink = document.getElementById("openLink");
    let tabs = [passwordSuggestionLink, passwordGeneratorLink, openLink];

    function change_active(element){
        for (let i = 0; i < tabs.length; i++){
            tabs[i].classList.remove("active");
            tabs[i].setAttribute('aria-current', '');
        };
        element.classList.add("active");
        element.setAttribute('aria-current', 'page');
    };

    passwordSuggestionLink.addEventListener("click", function(){
        change_active(passwordSuggestionLink);
    });
    passwordGeneratorLink.addEventListener("click", function(){
        change_active(passwordGeneratorLink);
    });
    openLink.addEventListener("click", function(){
        change_active(openLink);
    });
};

//
function load_page(suggestion, data){ //TODO: This code is vulnerable!!!
    const cardTemplate = document.getElementById("preview-card-template").innerHTML;
    let password_data = {}
    for (let i = 0; i < data.logindata.length; i++) {
        password_data = {
            card_id: [i],
            card_title: data.logindata[i].hostname,
            img_path: data.logindata[i].img_path,
            email: data.logindata[i].username,
            password: data.logindata[i].password
        };
        template = document.getElementById("page-container");
        template.innerHTML += Mustache.render(cardTemplate, password_data);
    };
};

// main
function main(){
    chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === "init_data") {
            suggestion = msg.suggested;
            userdata = msg.data;
            alert(JSON.stringify(userdata));
            load_page(suggestion, userdata);
        }
    });
    init_data();
    init_tabMenu();
};

document.addEventListener("DOMContentLoaded", function() {
    main();
});


