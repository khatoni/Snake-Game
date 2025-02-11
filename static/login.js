const loginButton = document.querySelector('#mybut');
loginButton.addEventListener('click', ()=> {
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    if (!username || !password) {
        alert("Username and Password are required");
        return;
    }

    if(username.length < 3 || username.length > 30) {
        alert("Username must be between 3 and 30 symbols!");
    }

    if(!username.match(/^[A-Za-z0-9 ]+$/)) {
        alert("Username must consist only of letters, numbers and spaces!");
    }

    if(password.length < 8) {
        alert("Password must be at least 8 symbols!");
    }

    const data = {
        username: username,
        password: password
    }

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    })
    .then(response => response.json())
    .then( () => {
        window.location.href = "http://localhost:3000/home"
    })
    .catch(error => {
        alert("Error during registration.");
        console.error("Error:", error);
    });
});