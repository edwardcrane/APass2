var SplashView = function(loginService) {
	// var employees;

	this.initialize = function() {
		this.$el = $('<div/>');
		this.render();
	};

	this.render = function() {
		setTimeout(function() {

			loginService.getAllLogins().done(function(logins) {
				console.log(logins.length);
				if(logins.length <= 0) {
					window.location.href="#register";
					return;
				}
			});

			// console.log(loginService.getNumLogins());
			// if(loginService.getNumLogins() <= 0) {
			// 	window.location.href="#register";
			// 	return;
			// }

			if(loginService.getLoggedInUser() == undefined) {
				window.location.href="#login";
				return;
			}

			// so we know there is a user already logged in.
			window.location.href="#home";
			return;
		},
		3000);
		this.$el.html(this.template());
		return this;
	};

	this.initialize();
}