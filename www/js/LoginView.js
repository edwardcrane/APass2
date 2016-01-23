var LoginView = function (loginService) {


	this.initialize = function () {
		// Define a div wrapper for the view (used to attach events)
		this.$el = $('<div/>');
		this.$el.on('keyup', '.loginpassword', this.checkLogin);
		this.$el.on('click', '.loginshowpasswordhint', this.showPasswordHint);
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
		loginService.getPasswordHint($('.loginusername').val()).done(function(gotPasswordHint){
			alert("Password Hint: " + gotPasswordHint);
		});
	}

	this.render = function() {
		this.$el.html(this.template());
		// $('.content', this.$el).html(resourceListView.$el);
		return this;
	};

	this.initialize();

}


