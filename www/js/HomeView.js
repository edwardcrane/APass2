var HomeView = function (service) {

	var resourceListView;

	this.initialize = function () {
		// Define a div wrapper for the view (used to attach events)
		this.$el = $('<div/>');
		this.$el.on('keyup', '.search-key', this.findResources);
		resourceListView = new ResourceListView();
		service.getAllResources().done(function(data){
			resourceListView.setResources(data);
		});
		this.render();
		this.$el.on('click', '.newresource', this.newResource);
	};

	this.render = function() {
		this.$el.html(this.template());
		$('.content', this.$el).html(resourceListView.$el);
		return this;
	};

	this.findResources = function() {
	    service.findResources($('.search-key').val()).done(function (resources) {
	    	if(resources.length == 0) {
	    		$('.search-key').css("color", "red");
	    	} else {
	    		$('.search-key').css("color", "white");
	    	}
	      	resourceListView.setResources(resources);
	    });
	};

	this.newResource = function() {
		window.location.href="#resources/0";
	}

	this.initialize();

}


