const loginButton = document.querySelector('#mybut');
loginButton.addEventListener('click', ()=> {
    const usernameText = document.querySelector('#username').value;
    const password = document.querySelector("#password");
    const passwordText = password.value;
    const information = document.createElement("label");
    information.setAttribute('id', "info");

    if (!usernameText || !passwordText) {
        information.textContent = "Username and Password are required";
        password.insertAdjacentElement('afterend', information);
        return;
    }

    if(usernameText.length < 3 || usernameText.length > 30) {
        information.textContent = "Username must be between 3 and 30 symbols!";
        password.insertAdjacentElement('afterend', information);
        return;
    }

    if(!usernameText.match(/^[A-Za-z0-9 ]+$/)) {
        information.textContent = "Username must consist only of letters, numbers and spaces!";
        password.insertAdjacentElement('afterend', information);
        return;
    }

    if(passwordText.length < 8) {
        information.textContent = "Password must be at least 8 symbols!";
        password.insertAdjacentElement('afterend', information);
        return;
    }

    const data = {
        username: usernameText,
        password: passwordText
    }

    fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then( response => {
        if(response.ok) {
            window.location.href = "/"
        }
        return response;
    })
    .then(response => response.json())
    .then(response => {
        const error = response.error;
        information.textContent = error;
        password.insertAdjacentElement('afterend', information);
    })
    .catch(error => {
        alert("Error during registration.");
        console.error("Error:", error);
    });
});