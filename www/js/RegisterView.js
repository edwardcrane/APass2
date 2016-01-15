var RegisterView = function (loginService) {


	this.initialize = function () {
		// Define a div wrapper for the view (used to attach events)
		this.$el = $('<div/>');
		this.$el.on('click', '.saveregistration', saveRegistration);

		loginService.getAllLogins().done(function(logins) {
			if(logins.length > 0) {
				console.log("loginService already has at least one login, so just log in.");
				window.location.href="#login";
			}
		}) ;

		this.render();
	};

	var saveRegistration = function() {
		// TODO: VALIDATE EVERYTHING!!!!!

		if(validateRegistration()) {
			loginService.createLogin(	$('.registerusername').val(),
										$('.registerpassword').val(),
										$('.registerpasswordhint').val(),
										$('.registeremail').val());
		}

		window.location.href="#login";  // brings one to the login screen per app.js routes.
	}

	var validateRegistration = function() {
		console.log("THIS IS A STUB THAT MUST BE IMPLEMENTED!!!");
		return true;
	}

	this.render = function() {
		this.$el.html(this.template());
		// $('.content', this.$el).html(resourceListView.$el);
		return this;
	};

	this.initialize();

}


