let userdata = {
    user: "admin",
    latest_access: "2023-10-01 12:00:00",
    password_cards: [
        {
            card_id: "1",
            card_title: "L0CK3R",
            img_path: "../assets/icons/icon128.png",
            email: "admin@l0ck3r.com",
            password: "admin",
        },
        {
            card_id: "2",
            card_title: "Youtube",
            img_path: "../assets/website_images/youtube.png",
            email: "admin@youtube.com",
            password: "password123",
        },
        {
            card_id: "3",
            card_title: "Google",
            img_path: "../assets/website_images/google.png",
            email: "admin@google.com",
            password: "password123",
        },
        {
            card_id: "4",
            card_title: "Instagram",
            img_path: "../assets/website_images/instagram.png",
            email: "admin@instagram.com",
            password: "password123",
        },
        {
            card_id: "5",
            card_title: "Spotify",
            img_path: "../assets/website_images/spotify.png",
            email: "admin@spotify.com",
            password: "password123",
        },
    ],
};

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


    