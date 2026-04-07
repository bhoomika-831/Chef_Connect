function formValidation() {
    var form = document.getElementById("registrationForm");
    var username = form["username"].value;
    var password = form["password"].value;
    var confirmPassword = form["confirm_password"].value;
    var email = form["email"].value;
    var confirmEmail = form["confirm_email"].value;

    var usernamePattern = /^[a-zA-Z0-9]{5,}$/; 
    var passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 

    // Validate username
    if (!usernamePattern.test(username)) {
        alert("Username must be at least 5 characters long and contain only letters and numbers.");
        return false;
    }

    // Validate password
    if (!passwordPattern.test(password)) {
alert("Password must be at least 8 characters long and contain at least one letter, one number, and one special character.");
return false;
}


    // Validate password match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return false;
    }

    // Validate email
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    // Validate email match
    if (email !== confirmEmail) {
        alert("Email addresses do not match.");
        return false;
    }

    return true;
}



//form validation for login page 
function validateForm() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Regular expressions for validation
    var usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;
    var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    // Check if username matches the pattern
    if (!usernameRegex.test(username)) {
        alert("Username must be 3-20 characters long and can include letters, numbers, dots, underscores, and hyphens.");
        return false;
    }

    // Check if password matches the pattern
    if (!passwordRegex.test(password)) {
        alert("Password must be at least 8 characters long and include at least one number, one uppercase letter, and one lowercase letter.");
        return false;
    }

    return true;
}
