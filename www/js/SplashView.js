var SplashView = function() {
	// var employees;

	this.initialize = function() {
		this.$el = $('<div/>');
		this.render();
	};

	this.render = function() {
		setTimeout(function() {
			window.location.href="#register";
		},
		3000);
		this.$el.html(this.template());
		return this;
	};

	this.initialize();
}