var ChangeRegistrationView = function (loginService) {


	this.initialize = function () {
		// Define a div wrapper for the view (used to attach events)
		this.$el = $('<div/>');

		this.$el.on('click', '.changeregistrationusername', changeUsername);
		this.$el.on('click', '.changeregistrationpassword', changePassword);
		this.$el.on('click', '.changeregistrationpasswordhint', changePassword);
		this.$el.on('click', '.changeregistrationemail', changeEmail);

		this.render();

		var lastuser = loginService.getLoggedInUser();
		loginService.getPasswordHint(lastuser).done(function(oldPasswordHint) {
			$('.changeregistrationusername').val(lastuser);
			if(oldPasswordHint) {
				$('.changeregistrationpasswordhint').val(oldPasswordHint);
			}
		});

		loginService.getEmail(lastuser).done(function(oldEmail) {
			if(oldEmail) {
				$('.changeregistrationemail').val(oldEmail);
			}
		});

		loginService.getPassword(lastuser).done(function(oldPass) {
			if(oldPass) {
				$('.changeregistrationpassword').val(oldPass);
			}
		});
	};

	var isValidEmail = function(email) {
	    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if(email && email != '') {
			return re.test(email);
		}
		return false;
	}

	var changeUsername = function() {
		var retVal = prompt("Change Username", $('.changeregistrationusername').val());
		// now do something with it!!!
		if(isValidUsername(retVal)) {
			loginService.changeUsername($('.changeregistrationusername').val(), retVal);
			$('.changeregistrationusername').val(retVal);
		}
	}

	var isValidPassword = function(password) {
		if(password && password != '') {
			return true;
		}
		return false;
	}

	var isValidUsername = function(username) {
		if(username && username != '') {
			return true;
		}
		return false;
	}

	var changePassword = function() {
		var retVal;
		var oldPassword;
		var newPassword;
		var confirmNewPassword;

		var oldPassword = prompt("Enter Old Password");
		var uName = $('.changeregistrationusername').val();
		// check if old password is correct

		loginService.getPassword(uName).done(function(oldPwd) {
			if(oldPassword && (oldPwd === oldPassword)) {
				var newPassword = prompt("Enter New Password:");
				if(newPassword && isValidPassword(newPassword)) {
					var confirmNewPassword = prompt("Confirm New Password:");
					if(newPassword === confirmNewPassword) {
						loginService.changePassword(uName, newPassword);
						$('.changeregistrationpassword').val(newPassword);
						var newPasswordHint = prompt("Enter New Password Hint:");
						if(newPasswordHint) {
							loginService.changePasswordHint(uName, newPasswordHint);
							$('.changeregistrationpasswordhint').val(newPasswordHint);
						} else {
							alert("Please specify a valid Password Hint.  If you misplace your password, there is no way to recover your data!");
						}
					} else {
						alert("New Password and Confirmation do not match.");
						return;
					}
				}
			} else {
				alert("Incorrect password entered.");
			}
		});
	}

	var startSmsPrompt = function(enteredTxt) {
		alert(enteredTxt);
	}

	var changeEmail = function() {
		var newEmail = prompt("Enter New Email:");
		if(newEmail && isValidEmail(newEmail)) {
			var confirmEmail = prompt("Confirm New Email:");
			if(newEmail === confirmEmail) {
				loginService.changeEmail(loginService.getLoggedInUser(), newEmail);
				$('.changeregistrationemail').val(newEmail);
			} else {
				alert("New Email and Confirmation do not match.");
			}
		} else {
			if(newEmail) {
				alert("Invalid Email Entered [" + newEmail + "].  Please enter a valid email.");
			} else {
				// just return here, as user simply canceled.
				return;
			}
		}

	}

	this.render = function() {
		this.$el.html(this.template());
		return this;
	};

	this.initialize();

}


