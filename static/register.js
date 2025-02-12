const loginButton = document.querySelector('#mybut');
loginButton.addEventListener('click', ()=> {

    const firstName = document.querySelector('#firstName').value;
    const lastName = document.querySelector('#lastName').value;

    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password');
    const passwordText = password.value;

    const information = document.createElement("label");
    information.setAttribute('id', "info");

    if (!username || !passwordText || !firstName || !lastName) {
        information.textContent = "Username and Password are required";
        password.insertAdjacentElement('afterend', information);
        return;
    }

    if(username.length < 3 || username.length > 30) {
        information.textContent = "Username must be between 3 and 30 symbols!";
        password.insertAdjacentElement('afterend', information);
        return;
    }

    if(!username.match(/^[A-Za-z0-9 ]+$/)) {
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
        firstName: firstName,
        lastName: lastName,
        username: username,
        password: password
    }

    fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then( () => {
        window.location.href = "/"
    })
    .catch(error => {
        alert("Error during registration.");
        console.error("Error:", error);
    });
});