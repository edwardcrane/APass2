var HomeView = function (loginService, passwordsService) {

	var resourceListView;

	var admobbannerid = {};

	this.initialize = function () {
		// Define a div wrapper for the view (used to attach events)
		this.$el = $('<div/>');
		this.$el.on('keyup', '.search-key', this.findResources);
		this.$el.on('click', '.newresource', this.newResource);
		this.$el.on('click', '.menuicon', this.menuClicked);
		this.$el.on('click', '.menuitememailcsvfile', this.onCSVFile);
		this.$el.on('click', '.menuitemadvanced', this.onAdvanced);
		this.$el.on('click', '.menuitemsaveencryptedfile', this.onSaveEncryptedFile);
		this.$el.on('click', '.menuitemloadencryptedfile', this.onLoadEncryptedFile);
		this.$el.on('click', '.menuitemchangelogin', this.onChangeLogin);
		this.$el.on('click', '.menuitemremoveads', this.onRemoveAds);
		this.$el.on('click', '.menuitemabout', this.onAbout);

		window.addEventListener("click", this.handleClick);

		document.addEventListener('onAdDismiss', function(data) {
			console.log("inside onAdDismiss event listener.  data: " + data);
			window.setTimeout(this.showInterstitialAd, 5000);
		});

		resourceListView = new ResourceListView();
		passwordsService.getAllResources().done(function(data){
			resourceListView.setResources(data);
		});

		// this object is created in onDeviceReady handler in app.js, so this will work:
		console.log(navigator.userAgent);
		if( /(android)/i.test(navigator.userAgent) ) {
			admobbannerid = { // for android
				topbannerid: 'ca-app-pub-6141378478306258/9235092323',
				bottombannerid: 'ca-app-pub-6141378478306258/7618758328',
				interstitialafterlogin: 'ca-app-pub-6141378478306258/2165351127'
			};
		} else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
			admobbannerid = { // for android
				topbannerid: 'ca-app-pub-6141378478306258/9235092323',
				bottombannerid: 'ca-app-pub-6141378478306258/7618758328',
				interstitialafterlogin: 'ca-app-pub-6141378478306258/2165351127'
			};
		} else {
			admobbannerid = { // for android
				topbannerid: 'ca-app-pub-6141378478306258/9235092323',
				bottombannerid: 'ca-app-pub-6141378478306258/7618758328',
				interstitialafterlogin: 'ca-app-pub-6141378478306258/2165351127'
			};
		}

		// create top banner:
		AdMob.createBanner({
			adId: admobbannerid.topbannerid,
			position: AdMob.AD_POSITION.TOP_CENTER,
			autoShow: true,
			isTesting: false
		});

		window.setTimeout(this.showInterstitialAd, 5000);

		this.render();
	};

/*
    <!-- ADMOB VALUES -->
    <!--<string name="admob_id">TESTER</string>-->
    <string name="admob_id" translatable="false">pub-6141378478306258</string>
    <string name="main_activity_top_banner_ad_unit_id" translatable="false">ca-app-pub-6141378478306258/9235092323</string>
    <string name="main_activity_bottom_banner_ad_unit_id" translatable="false">ca-app-pub-6141378478306258/7618758328</string>
    <string name="edit_activity_bottom_banner_ad_unit_id" translatable="false">ca-app-pub-6141378478306258/9095491524</string>
    <string name="new_activity_bottom_banner_ad_unit_id" translatable="false">ca-app-pub-6141378478306258/4525691123</string>
    <string name="test_ad_unit_id" translatable="false">ca-app-pub-3940256099942544/6300978111</string>
    <string name="primary_android_admob_test_device" translatable="false">03E2E4F5EE38F1A8EF3355F642CCBA94</string>
*/

	this.render = function() {
		this.$el.html(this.template());
		$('.content', this.$el).html(resourceListView.$el);
		return this;
	};

	this.showInterstitialAd = function() {
		var admobid = {};
		if( /(android)/i.test(navigator.userAgent) ) { // for android & amazon -fireos
			admobid = {
				afterlogininterstitialid: 'ca-app-pub-6141378478306258/2165351127'
			};
		} else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
			admobid = {
				afterlogininterstitialid: 'ca-app-pub-6141378478306258/2165351127'
			};
		} else { // for Windows phone:
			admobid = {
				afterlogininterstitialid: 'ca-app-pub-6141378478306258/2165351127'
			};
		};

		// display ad here:
		if(AdMob) 
		{
			console.log("calling AdMob.prepareInterstitial()");
			AdMob.prepareInterstitial( {
				adId: admobid.afterlogininterstitialid,
				autoShow: true
			});
		};

		console.log("calling AdMob.showInterstitial()");
		if(AdMob) AdMob.showInterstitial();
	};

	this.findResources = function() {
	    passwordsService.findResources($('.search-key').val()).done(function (resources) {
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
		if((!event.target.matches('.menuicon')) && (!event.target.matches('.menuitemadvanced'))) {
			var dropdowns = document.getElementsByClassName("dropdown-content");
			var i;
			for (i = 0; i < dropdowns.length; i++) {
				var openDropdown = dropdowns[i];
				if(openDropdown.classList.contains('show')) {
					openDropdown.classList.remove('show');
				};
			};
			var advanceddropdowns = document.getElementsByClassName("advanced-dropdown-content");
			var i;
			for (i = 0; i < advanceddropdowns.length; i++) {
				var openDropdown = advanceddropdowns[i];
				if(openDropdown.classList.contains('show')) {
					openDropdown.classList.remove('show');
				};
			};
		};
	};

	this.onCSVFile = function(event) {
		event.preventDefault();
		passwordsService.exportCSV("export.csv");

		// NOW SEND EMAIL ATTACHMENT:		
        cordova.plugins.email.isAvailable(function(isAvailable) {
        	if(isAvailable) {
        		loginService.getEmail(loginService.getLoggedInUser()).done(function (myemail) {
        			var atts = [];
        			var emails = [];

        			emails.push(myemail);
        			atts.push(cordova.file.externalDataDirectory + "export.csv");

        			window.plugin.email.open({
        					to: emails,
    	    				attachments: atts,
        					subject: "APass CSV Export File",
        					body: "This is the latest CSV Export File from APass."
        				},
						function() {
							console.log('email view dismissed');
        		 		},
        		 		this
        		 	);
        		});
       		}
        });
	}

	this.onAdvanced = function(event) {
		event.preventDefault();
		document.getElementById("myDropdown").classList.toggle("show");
		document.getElementById("advancedDropdown").classList.toggle("show");
	}

	this.onSaveEncryptedFile = function(event) {
		event.preventDefault();
		alert("FEATURE NOT YET IMPLEMENTED");
	}

	this.onLoadEncryptedFile = function(event) {
		event.preventDefault();
		alert("FEATURE NOT YET IMPLEMENTED");
	}

	this.onChangeLogin = function(event) {
		event.preventDefault();
		alert("FEATURE NOT YET IMPLEMENTED");
	}

	this.onRemoveAds = function(event) {
		event.preventDefault();
		alert("FEATURE NOT YET IMPLEMENTED");
	}

	this.onAbout = function(event) {
		event.preventDefault();
		window.location.href="#";
	}

	this.initialize();
}


