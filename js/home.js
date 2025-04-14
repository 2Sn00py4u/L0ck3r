document.addEventListener("DOMContentLoaded", function() {
    const homeTemplate = '<div>Welcome back {{name}}!</div>';
    const data = {
        name: "admin"
    };
    let template = document.getElementById("home-template");
    template.innerHTML += Mustache.render(homeTemplate, data);
});
    