
chrome.storage.local.get("credentials", (data) => {
    const credentials = data.credentials || {};
    chrome.storage.local.get("autofill", (autofill_settings) => {
        const autofill = autofill_settings.autofill || false;
        if (autofill === true) {
            if (window.location.href.includes("login") || window.location.href.includes("signin") || window.location.href.includes("auth")) {
                let fullhostname = window.location.hostname.toLowerCase();
                let hostname_list = fullhostname.split('.');
                let hostname = hostname_list[hostname_list.length - 2];
                let matching = [];
                for (let i = 0; i < credentials.logindata.length; i++) {
                    const card = credentials.logindata[i];
                    if (card.hostname.toLowerCase().includes(hostname)) {
                        matching.push(card);
                    }
                }
                if (matching.length === 0) return;

                function fillFields(selected) {
                    const usernameField = document.querySelector('input[name="login"], input[name="username"], input[name="email"], input[id="username"], input[id="email"], input[type="text"]');
                    const passwordField = document.querySelector('input[type="password"], input[name="password"], input[id="password"]');
                    if (usernameField) {
                        usernameField.value = selected.username;
                        usernameField.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                    if (passwordField) {
                        passwordField.value = selected.password;
                        passwordField.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                }
                fillFields(matching[0]);
                const usernameField = document.querySelector('input[name="login"], input[name="username"], input[name="email"], input[id="username"], input[id="email"], input[type="text"]');
                if (usernameField) {

                    oldIcon = document.getElementById("locker-autofill-icon");
                    if (oldIcon) {
                        oldIcon.remove();
                    }

                    const computedStyle = window.getComputedStyle(usernameField);
                    const inputHeight = computedStyle.height;

                    let iconTemplate = `
                    <style>
                        #locker-autofill-icon {
                            position: absolute;
                            top: {{top}}px;
                            right: {{left}}px;
                            width: {{width}}px;
                            height: {{height}}px;
                            background-color: transparent;
                            /*border: 2px solid rgba(255, 255, 255, 0.8);*/
                            box-shadow: 0 2px 5px rgba(2, 0, 46, 0.97);
                            border-radius: 20%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            cursor: pointer;
                            transition: 0.3s;
                            z-index: 9999;
                        }
                        #locker-autofill-icon:hover {
                            cursor: pointer;
                            box-shadow: 0 2px 10px rgb(255, 255, 255);
                            transition: 0.3s;
                        }
                        #dropdown {
                            position: absolute;
                            top: {{top}}px;
                            right: {{dropdownleft}}px;
                            width: {{width}}px;
                            border-radius: 5px;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                            z-index: 9999;
                        }
                        .dropdown-menu {
                            width: fit-max-content;
                            min-width: 250px;
                            list-style: none;
                            padding: 0;
                            margin: 0;
                            border: none;
                            z-index: 9999;
                            overflow: hidden;
                        }
                        .dropdown-item {
                            padding: 10px;
                            text-decoration: none;
                            display: block;
                            transition: 0.3s;
                        }
                        .dropdown-item:hover {
                            cursor: pointer;
                            background-color: rgba(4, 0, 72, 0.1);
                            box-shadow: 0 2px 10px rgba(255, 255, 255, 0.63);
                            transition: 0.3s;
                        }
                    </style>
                    <div id="locker-autofill-icon">
                        <img src="{{iconUrl}}" alt="L0CK3R" style="height:20px;width:20px;border-radius:50%;"/>
                    </div>
                    <div id="dropdown" class="dropdown" style="display:none;">
                        <div class="dropdown-menu" id="locker-dropdown-menu">`;
                    
                    let templateValues = {
                        iconUrl: chrome.runtime.getURL("assets/icons/icon48.png"),
                        height: (parseInt(inputHeight)),
                        width: (parseInt(inputHeight)),
                        top: (usernameField.offsetTop),
                        left: (usernameField.offsetLeft),
                        dropdownleft: (usernameField.offsetLeft - parseInt(inputHeight)),
                    };
                    for (let i = 0; i < matching.length; i++) {
                        templateValues["card_" + (i + 1)] = matching[i].username;
                        templateValues["credentials_" + (i + 1)] = JSON.stringify(matching[i]);
                        iconTemplate = iconTemplate + `<li><a class="dropdown-item" id="locker-cred-${i + 1}">{{card_${i + 1}}}</a></li>`;
                        if (i === matching.length - 1) {
                            iconTemplate = iconTemplate + `</div></div>`;
                        }
                    }
                    const renderedIcon = Mustache.render(iconTemplate, templateValues);
                    usernameField.parentNode.insertAdjacentHTML("beforeend", renderedIcon);

                    const iconDiv = document.getElementById("locker-autofill-icon");
                    const dropdown = document.getElementById("dropdown");

                    iconDiv.addEventListener("click", function(e) {
                        e.preventDefault();
                        if (dropdown.style.display === "block") {
                            dropdown.style.display = "none";
                        } else {
                            dropdown.style.display = "block";
                        }
                    });

                    document.addEventListener("click", function(event) {
                        if (!iconDiv.contains(event.target) && !dropdown.contains(event.target)) {
                            dropdown.style.display = "none";
                        }
                    });

                    for (let i = 0; i < matching.length; i++) {
                        let credElement = document.getElementById(`locker-cred-${i + 1}`);
                        if (credElement) {
                            credElement.addEventListener("click", function() {
                                fillFields(matching[i]);
                                dropdown.style.display = "none";
                            });
                        }
                    }
                }
            }
        }
    });
});


