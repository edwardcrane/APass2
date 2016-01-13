var LoginView = function (service) {


	this.initialize = function () {
		// Define a div wrapper for the view (used to attach events)
		this.$el = $('<div/>');
		this.$el.on('keyup', '.loginpassword', this.checkLogin);
		this.render();

		// Do something like this:
		// if service.getSaveUsername($('.loginusername').val() is true THEN
		// check the box for saving user name.

	};

	// this.findResources = function() {
	//     service.findResources($('.search-key').val()).done(function (resources) {
	//       	resourceListView.setResources(resources);
	//     });
	// };

	this.checkLogin = function() {
		// when service is written, use something like this:
		// service.checkLogin($('.login_password').val()).done(function (username, password){
		// 	// TODO: if checkLogin succeeds, figure out how to forward to HomeView here:

		// for now, let's just dummy something up:
		if(($('.loginusername').val() === "username") && ($('.loginpassword').val() === "pwd")) {
			document.getElementById("login-tpl-username").style.color = "green";
			document.getElementById("login-tpl-password").style.color = "green";
			// use the service to save that state of checkbox.
			// use service to store last login information.
			window.location.href="#home";
			// TODO:  Forward to HomeView
		};

	}

	this.render = function() {
		this.$el.html(this.template());
		// $('.content', this.$el).html(resourceListView.$el);
		return this;
	};

	this.initialize();

}


