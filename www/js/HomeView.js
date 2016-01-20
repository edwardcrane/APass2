var HomeView = function (service) {

	var resourceListView;

	this.initialize = function () {
		// Define a div wrapper for the view (used to attach events)
		this.$el = $('<div/>');
		this.$el.on('keyup', '.search-key', this.findResources);
		this.$el.on('click', '.newresource', this.newResource);
		this.$el.on('click', '.menuicon', this.menuClicked);

		window.addEventListener("click", this.handleClick);

		resourceListView = new ResourceListView();
		service.getAllResources().done(function(data){
			resourceListView.setResources(data);
		});
		this.render();
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
	};


	// When user clicks on menu icon, toggle between hiding and showing the dropdown content:
	this.menuClicked = function () {
		document.getElementById("myDropdown").classList.toggle("show");
	};

	this.handleClick = function(event) {
		if(!event.target.matches('.menuicon')) {
			var dropdowns = document.getElementsByClassName("dropdown-content");
			var i;
			for (i = 0; i < dropdowns.length; i++) {
				var openDropdown = dropdowns[i];
				if(openDropdown.classList.contains('show')) {
					openDropdown.classList.remove('show');
				};
			};
		};
	};

	// Close the dropdown menu if user clicks outside of it
	// window.onClick = function(event) {
	// 	alert("inside onClick event handler.");
	// 	if(!event.target.matches('.menuicon')) {
	// 		alert("clicked outside of menuicon");
	// 		var dropdowns = document.getElementbyClassName("dropdown-content");
	// 		var i;
	// 		for (i = 0; i < dropdowns.length; i++) {
	// 			var openDropdown = dropdowns[i];
	// 			if(openDropdown.classList.contains('show')) {
	// 				openDropdown.classList.remove('show');
	// 			};
	// 		};
	// 	};
	// };

	this.initialize();

}


