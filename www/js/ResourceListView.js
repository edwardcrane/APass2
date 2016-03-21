var ResourceListView = function() {
	var resources;

	// This logic is here so we can scroll the window without
	// having the search box and toolbar scroll away.
	var scrollableHeight = 0;

	this.initialize = function() {
		this.$el = $('<div/>');

		window.addEventListener('resize', this.setResourceListHeight);

		this.render();
	};

	this.setResourceListHeight = function() {
		if(window.location.href.endsWith("#home")) {
			scrollableHeight = $(window).height() -
				$('.home-toolbar-and-title').height() -
				$('.search-bar').height();
			$('.resource-list-ul').height(scrollableHeight);
		}
	}

	this.setResources = function(list) {
		resources = list;
		this.render();
	};

	this.render = function() {
		this.$el.html(this.template(resources));

		this.setResourceListHeight();

		return this;
	};

	this.initialize();
}