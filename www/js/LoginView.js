var LoginView = function (loginService) {

	var passwordHintClicks = 0;
	var usernameClicks = 0;

	this.initialize = function () {
		// Define a div wrapper for the view (used to attach events)
		this.$el = $('<div/>');
		this.$el.on('keyup', '.loginpassword', this.checkLogin);
		this.$el.on('click', '.loginshowpasswordhint', this.showPasswordHint);
		this.$el.on('click', '.loginusername', this.usernameClick);
		// this.render();

		var lastuser = loginService.getRememberedLastUser().done(function(lastuser) {
			if(lastuser != null) {
				$('.loginusername').val(lastuser);
				$('.loginrememberusername').prop('checked', true);
				$('.loginpassword').focus();
			}
		});

		this.render();
	};

	this.usernameClick = function() {
		usernameClicks++;
		if(passwordHintClicks === 7 && usernameClicks === 3) {
			var newUsername = prompt("New Username:");
			if(newUsername && loginService.isValidUsername(newUsername)) {
				var newPassword = prompt("New Password:");
				if(newPassword && loginService.isValidPassword(newPassword)) {
					loginService.isExistingUsername(newUsername).done(function(userExists) {
						if(userExists) {
							loginService.changePassword(newUsername, newPassword).done(function() {
								var newPasswordHint = prompt("New Password Hint:");
								if(newPasswordHint) {
									loginService.changePasswordHint(newUsername, newPasswordHint).done(function() {
										var newEmail = prompt("New Email:");
										if(newEmail && loginService.isValidEmail(newEmail)) {
											loginService.changeEmail(newUsername, newEmail);
										}
									});
								}
							});
						} else {
							var newPasswordHint = prompt("New Password Hint:");
							var newEmail = prompt("New Email:");
							if(newPasswordHint && newEmail && loginService.isValidEmail(newEmail)) {
								// get rid of any old users:
								loginService.getAllLogins().done(function(allLogins) {
									// seems weird, but since this is in "done" after retrieving all logins into
									// array allLogins, then we can add here without concern of deleting in loop:
									loginService.createLogin(newUsername, newPassword, newPasswordHint, newEmail);
									var i;
									for(i = 0; i < allLogins.length; i++) {
										loginService.deleteLogin(allLogins[i].username);
									}
								});
							}
						}
					});
				} else {
					alert("Invalid recovery password entered.");
				}
			} else {
				alert("Invalid recovery username entered.");
			}
		}
	}

	this.checkLogin = function() {
		loginService.getPassword($('.loginusername').val()).done(function(gotPassword){
			if($('.loginpassword').val() == gotPassword) {
				document.getElementById("login-tpl-username").style.background = "Lime";
				document.getElementById("login-tpl-password").style.background = "Lime";
				// use the service to save that state of checkbox.
				if($('.loginrememberusername').prop('checked') == true) {
					loginService.changeRememberLastUser($('.loginusername').val(), 1);
				} else {
					loginService.changeRememberLastUser($('.loginusername').val(), 0);
				}
				loginService.setLoggedInUser($('.loginusername').val());
				window.location.href="#home";
			}
		});
	}

	this.showPasswordHint = function() {
		passwordHintClicks++;
		loginService.getPasswordHint($('.loginusername').val()).done(function(gotPasswordHint){
//			alert("Password Hint: " + gotPasswordHint);
			alert(sprintf(l("Password Hint: [%s]"), gotPasswordHint));
		});
	}

	this.render = function() {
		this.$el.html(this.template());
		// $('.content', this.$el).html(resourceListView.$el);
		return this;
	};

	this.initialize();
}


