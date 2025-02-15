const loginButton = document.querySelector("#mybut");
loginButton.addEventListener("click", (event) => {
	removeErrors();
	const usernameText = document.querySelector("#username").value;
	const password = document.querySelector("#password");
	const passwordText = password.value;
	const information = document.createElement("label");
	information.setAttribute("id", "info");
	information.setAttribute("class", "error");

	if (!usernameText || !passwordText) {
		information.textContent = "Username and Password are required";
		password.insertAdjacentElement("afterend", information);
		event.preventDefault();
		return;
	}

	if (usernameText.length < 3 || usernameText.length > 30) {
		information.textContent = "Username must be between 3 and 30 symbols!";
		password.insertAdjacentElement("afterend", information);
		event.preventDefault();
		return;
	}

	if (!usernameText.match(/^[A-Za-z0-9 ]+$/)) {
		information.textContent =
			"Username must consist only of letters, numbers and spaces!";
		password.insertAdjacentElement("afterend", information);
		event.preventDefault();
		return;
	}

	if (passwordText.length < 8) {
		information.textContent = "Password must be at least 8 symbols!";
		password.insertAdjacentElement("afterend", information);
		event.preventDefault();
		return;
	}
});

function removeErrors() {
	const errors = document.querySelectorAll(".error");
	errors.forEach((element) => {
		element.remove();
	});
}
