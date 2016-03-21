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

	var changeUsername = function() {
		var retVal = prompt(l("Change Username"), $('.changeregistrationusername').val());
		// now do something with it!!!
		if(loginService.isValidUsername(retVal)) {
			loginService.changeUsername($('.changeregistrationusername').val(), retVal);
			$('.changeregistrationusername').val(retVal);
		}
	}

	var changePassword = function() {
		var retVal;
		var oldPassword;
		var newPassword;
		var confirmNewPassword;

		var oldPassword = prompt(l("Old Password") + ":");
		var uName = $('.changeregistrationusername').val();
		// check if old password is correct

		loginService.getPassword(uName).done(function(oldPwd) {
			if(oldPassword && (oldPwd === oldPassword)) {
				var newPassword = prompt(l("New Password") + ":");
				if(newPassword && loginService.isValidPassword(newPassword)) {
					var confirmNewPassword = prompt(l("Confirm New Password") + ":");
					if(newPassword === confirmNewPassword) {
						loginService.changePassword(uName, newPassword);
						$('.changeregistrationpassword').val(newPassword);
						var newPasswordHint = prompt(l("Password Hint") + ":");
						if(newPasswordHint) {
							loginService.changePasswordHint(uName, newPasswordHint);
							$('.changeregistrationpasswordhint').val(newPasswordHint);
						} else {
							alert(l("Please specify a valid Password Hint.  If you misplace your password, there is no way to recover your data!"));
						}
					} else {
						alert(l("New Password and Confirmation do not match!  Please re-enter."));
						return;
					}
				}
			} else {
				alert(l("Incorrect password entered."));
			}
		});
	}

	var startSmsPrompt = function(enteredTxt) {
		alert(enteredTxt);
	}

	var changeEmail = function() {
		var newEmail = prompt(l("Email") + ":");
		if(newEmail && loginService.isValidEmail(newEmail)) {
			var confirmEmail = prompt(l("Confirm Email") + ":");
			if(newEmail === confirmEmail) {
				loginService.changeEmail(loginService.getLoggedInUser(), newEmail);
				$('.changeregistrationemail').val(newEmail);
			} else {
				alert(l("New Email and Confirmation do not match!  Please re-enter."));
			}
		} else {
			if(newEmail) {
				alert(sprintf(l("Invalid Email Entered [%s].  Please enter a valid email."), newEmail));
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


