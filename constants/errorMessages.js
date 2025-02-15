const errorMessages = {
	usernameLength: "Username must be between 3 and 30 symbols!",
	usernameContainsInvalindSymbols:
		"Username must consist only of letters, numbers and spaces!",
	usernameRequired: "Username is required!",
	passwordRequired: "Password is required!",
	passwordLength: "Password must be at least 8 symbols!",
	invalidUsernamePassword: "Username/Password is incorrect!",
	databaseUpdateError: "Error occured while updating the database!",
	wrongCredentials: "Wrong credentials!",
	userExists: "User with this username already exists!",
};

module.exports = errorMessages;
