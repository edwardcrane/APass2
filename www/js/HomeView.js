var HomeView = function (service) {

	var resourceListView;

	this.initialize = function () {
		// Define a div wrapper for the view (used to attach events)
		this.$el = $('<div/>');
		this.$el.on('keyup', '.search-key', this.findResources);
		resourceListView = new ResourceListView();
		this.render();

	};

	this.render = function() {
		this.$el.html(this.template());
		$('.content', this.$el).html(resourceListView.$el);
		return this;
	};

	this.findResources = function() {
	    service.findResources($('.search-key').val()).done(function (resources) {
	      	resourceListView.setResources(resources);
	    });
	};

	this.initialize();

}


