var ResourceListView = function() {
	var resources;

	this.initialize = function() {
		this.$el = $('<div/>');
		this.render();
	};

	this.setResources = function(list) {
		resources = list;
		this.render();
	};

	this.render = function() {
		this.$el.html(this.template(resources));
		return this;
	};

	this.initialize();
}