let userdata = {user: "default", level: "default"}

// init-data
function init_data(){
    chrome.runtime.sendMessage({ type: "password_suggestion_ready" });
};

function generatePassword(length, lvl){
    function pick_by_percentage(low_letters_p, cap_letters_p, numbers_p, characters_p){
        if (low_letters_p + cap_letters_p + numbers_p + characters_p !== 1){
            return 1;
        }
        let low_letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "ä", "ö", "ü"];
        let cap_letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "Ä", "Ö", "Ü"];
        let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let characters = ["!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/",":", ";", "<", "=", ">", "?", "@","[", "\\", "]", "^", "_", "`","{", "|", "}", "~"];
        let char_distribution = [Array(low_letters_p*100).fill(low_letters).flat(), Array(cap_letters_p*100).fill(cap_letters).flat(), Array(numbers_p*100).fill(numbers).flat(), Array(characters_p*100).fill(characters).flat()].flat();
        return char_distribution[Math.floor(Math.random() * char_distribution.length)];
    };  
    let password = "";
    if (lvl == 1){
        for (let x = 0; x < length; x++){
            password = password + pick_by_percentage(0.8, 0.2, 0.0, 0.0);
        };
    }
    else if (lvl == 2){
        for (let x = 0; x < length; x++){
            password = password + pick_by_percentage(0.4, 0.3, 0.3, 0.0);
        };
    }
    else if (lvl == 3){
        for (let x = 0; x < length; x++){
            password = password + pick_by_percentage(0.25, 0.25, 0.25, 0.25);
        };
    }
    else if (lvl == 4){
        for (let x = 0; x < length; x++){
            password = password + pick_by_percentage(0.2, 0.2, 0.3, 0.3);
        }
    };
    return password;
};

function init_passwordGenerator(password_length_range_id, password_length_range_value_id, abstracting_level_id, abstracting_level_value_id, generated_password_id, regenerate_password_id, copy_generated_password_id){
    var password_length_range = document.getElementById(password_length_range_id);
    var password_length_range_output = document.getElementById(password_length_range_value_id);
    var generated_password = document.getElementById(generated_password_id);
    password_length_range_output.textContent = password_length_range.value;

    var abstracting_level_range = document.getElementById(abstracting_level_id);
    var abstracting_level_range_output = document.getElementById(abstracting_level_value_id);
    abstracting_level_range_output.textContent = abstracting_level_range.value;

    generated_password.innerHTML = generatePassword(password_length_range.value, abstracting_level_range.value);
    password_length_range.addEventListener('input', function() {
        password_length_range_output.textContent = this.value;
        generated_password.innerHTML = generatePassword(password_length_range.value, abstracting_level_range.value);

    });

    abstracting_level_range.addEventListener('input', function() {
        abstracting_level_range_output.textContent = this.value;
        generated_password.innerHTML = generatePassword(password_length_range.value, abstracting_level_range.value);
    });

    var regenerate_password = document.getElementById(regenerate_password_id);
    regenerate_password.addEventListener("click", function(){
        generated_password.innerHTML = generatePassword(password_length_range.value, abstracting_level_range.value);
    });

    var copy_generated_password = document.getElementById(copy_generated_password_id);
    copy_generated_password.addEventListener("click", function(){
        navigator.clipboard.writeText(generated_password.innerHTML).then(() => {
            copy_generated_password.innerHTML = "&#10003; copied"
            setTimeout(() => {
                copy_generated_password.innerHTML = "copy"
            }, 400);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
    });
};

// Tab-Menu
function init_tabMenu(){
    var passwordSuggestionLink = document.getElementById("passwordSuggestionLink");
    var passwordGeneratorLink = document.getElementById("passwordGeneratorLink");
    let tabs = [passwordSuggestionLink, passwordGeneratorLink];
    let password_generator_container = document.getElementById("password-generator-container");
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
        password_generator_container.innerHTML = "";
    });
    passwordGeneratorLink.addEventListener("click", function(){
        change_active(passwordGeneratorLink);
        let template = document.getElementById("password-generator-template").innerHTML;
        password_generator_container.innerHTML = template;
        init_passwordGenerator("password-length-range", "password-length-range-value", "abstracting-level-range", "abstracting-level-range-value", "generated-password", "regenerate-password", "copy-generated-password");
    });
};

//
function load_page(suggestion, data){
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
        let template = document.getElementById("page-container");
        template.innerHTML += Mustache.render(cardTemplate, password_data);
    };
};

function init_passwordTab(userdata) {
    let search = document.getElementById("search-input")
    search.addEventListener("input", function() {
        let searchInput = search.value.toLowerCase();
        for (let i=0; i < userdata.logindata.length; i++){
            if (searchInput.includes("passwd:")){
                let passwordSearch = searchInput.split("passwd:")[1].trim();
                if (userdata.logindata[i].password.toLowerCase().includes(passwordSearch)) {
                    let passwordCard = document.getElementById("preview-password-card-" + i.toString());
                    passwordCard.style.display = "flex";
                }
                else {
                    let passwordCard = document.getElementById("preview-password-card-" + i.toString());
                    passwordCard.style.display = "none";
                }
            }
            else if (searchInput.includes("user:")){
                let emailSearch = searchInput.split("user:")[1];
                if (userdata.logindata[i].username.toLowerCase().includes(emailSearch)) {
                    let passwordCard = document.getElementById("preview-password-card-" + i.toString());
                    passwordCard.style.display = "flex";
                }
                else {
                    let passwordCard = document.getElementById("preview-password-card-" + i.toString());
                    passwordCard.style.display = "none";
                }
            }
            else if (userdata.logindata[i].hostname.toLowerCase().includes(searchInput)) {
                let passwordCard = document.getElementById("preview-password-card-" + i.toString());
                passwordCard.style.display = "flex";
            }
            else {
                let passwordCard = document.getElementById("preview-password-card-" + i.toString());
                passwordCard.style.display = "none";
            }
        };
    });
};

// main
function main(){
    chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === "init_data") {
            suggestion = msg.suggested;
            userdata = msg.data;
            alert(JSON.stringify(userdata));
            load_page(suggestion, userdata);
            init_tabMenu();
            init_passwordTab(userdata);
        }
    });
    init_data();
    
};

document.addEventListener("DOMContentLoaded", function() {
    main();
});


