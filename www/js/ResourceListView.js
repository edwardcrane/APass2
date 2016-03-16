var ResourceListView = function() {
	var resources;

	// This logic is here so we can scroll the window without
	// having the search box and toolbar scroll away.
	var scrollableHeight = 0;

	this.initialize = function() {
		this.$el = $('<div/>');

		window.addEventListener('resize', this.onResize);

		this.render();
	};

	this.onResize = function(event) {
		// prevent toolbar & search field scrolling away:
		scrollableHeight = $(window).height() -
			$('.bar-nav').height() -
			$('.bar-standard').height();
		$('.resource-list-ul').height(scrollableHeight);
	}

	this.setResources = function(list) {
		resources = list;
		this.render();
	};

	this.render = function() {
		this.$el.html(this.template(resources));

		// prevent toolbar & search box scrolling away:
		scrollableHeight = $(window).height() -
			$('.bar-nav').height() -
			$('.bar-standard').height();
		$('.resource-list-ul').height(scrollableHeight);
		return this;
	};

	this.initialize();
}