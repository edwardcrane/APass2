var ResourceView = function(service, resource) {

	this.initialize = function() {
		this.$el = $('<div/>');
		this.$el.on('click', '.saveresource', this.saveResource);
		this.$el.on('click', '.deleteresource', this.deleteResource);
		this.$el.on('click', '.newresource', this.newResource);
		this.$el.on('click', '.showhiddenpasswordicon', this.showPassword);
		this.$el.on('click', '.editlabel', this.goback);

		this.$el.on('focus', '.resource_password', function(ev) {
			// if new record, let user see password as they type:
			if($('.resource_id').val() == 0) {
				document.getElementById("resource-tpl-password").type = "text";
				document.getElementById("resource-tpl-password").click();
			};
		});
	};

	this.render = function() {
		this.$el.html(this.template(resource));
		return this;
	};

	this.goback = function() {
		window.location.href="#home";
	};

	this.saveResource = function() {
		if($('.resource_id').val() > 0) {
			service.updateResource(	$('.resource_id').val(),
									$('.resource_resourcename').val(),
									$('.resource_username').val(),
									$('.resource_password').val(),
									$('.resource_description').val()
			);
		} else {
			service.createResource( $('.resource_resourcename').val(),
									$('.resource_username').val(),
									$('.resource_password').val(),
									$('.resource_description').val()
			);
		}
		window.location.href="#home";
	};

	this.deleteResource = function() {
		if(confirm(l("Are you sure you want to delete this?"))) {
			if($('.resource_id').val() > 0) {
				service.deleteResource( $('.resource_id').val());
			}
			window.location.href="#home";
		} else {
			alert(sprintf(l("Resource [%s] NOT DELETED."), $('.resource_resourcename').val()));
		}
	};

	this.newResource = function () {
		document.getElementById("resource-tpl-id").value = 0;
		document.getElementById("resource-tpl-resourcename").value = '';
		document.getElementById("resource-tpl-username").value = '';
		document.getElementById("resource-tpl-password").value = '';
		document.getElementById("resource-tpl-description").value = '';
	};

	this.showPassword = function () {
		if(document.getElementById("resource-tpl-password").type == "password") {
			document.getElementById("resource-tpl-password").type = "text";
		} else {
			document.getElementById("resource-tpl-password").type = "password";
		}
	}

	this.initialize();
}