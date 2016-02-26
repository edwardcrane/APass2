var HomeView = function (loginService, passwordsService) {

	var resourceListView;

	var adsEnabled = false;

	this.initialize = function () {

		// Define a div wrapper for the view (used to attach events)
		this.$el = $('<div/>');
		this.$el.on('keyup', '.search-key', this.findResources);
		this.$el.on('click', '.newresource', this.newResource);
		this.$el.on('click', '.menuicon', this.menuClicked);
		this.$el.on('click', '.menuitemexportcsvfile', this.onExportCSVFile);
		this.$el.on('click', '.menuitemimportcsvfile', this.onImportCSVFile);
		this.$el.on('click', '.menuitememailcsvfile', this.onEmailCSVFile);
		this.$el.on('click', '.menuitememailencryptedfile', this.onEmailEncryptedFile);
		this.$el.on('click', '.menuitemadvanced', this.onAdvanced);
		this.$el.on('click', '.menuitemsaveencryptedfile', this.onSaveEncryptedFile);
		this.$el.on('click', '.menuitemloadencryptedfile', this.onLoadEncryptedFile);
		this.$el.on('click', '.menuitemchangelogin', this.onChangeLogin);
		this.$el.on('click', '.menuitemremoveads', this.onRemoveAds);
		this.$el.on('click', '.menuitemabout', this.onAbout);

		window.addEventListener("click", this.handleClick);

		resourceListView = new ResourceListView();
		passwordsService.getAllResources().done(function(data){
			resourceListView.setResources(data);
		});

		if(adsEnabled) {
			var admobids = this.prepareAdMobIDs();
			this.prepareInterstitialAd(admobids);
			// display intersstitial ad once loaded:
			document.addEventListener('onAdLoaded', function(e) {
				if(e.adType == 'interstitial') {
					console.log("calling AdMob.showInterstitial()");
					AdMob.showInterstitial();
				};
			});
			this.setupBannerAds(admobids);
		}

		this.render();
	};

	this.render = function() {
		this.$el.html(this.template());
		$('.content', this.$el).html(resourceListView.$el);
		return this;
	};

	this.prepareAdMobIDs = function() {
	    // <!-- ADMOB VALUES -->
	    // <!--<string name="admob_id">TESTER</string>-->
	    // <string name="admob_id" translatable="false">pub-6141378478306258</string>
	    // <string name="edit_activity_bottom_banner_ad_unit_id" translatable="false">ca-app-pub-6141378478306258/9095491524</string>
	    // <string name="new_activity_bottom_banner_ad_unit_id" translatable="false">ca-app-pub-6141378478306258/4525691123</string>
	    // <string name="test_ad_unit_id" translatable="false">ca-app-pub-3940256099942544/6300978111</string>
	    // <string name="primary_android_admob_test_device" translatable="false">03E2E4F5EE38F1A8EF3355F642CCBA94</string>
		var admobids = {};
		if( /(android)/i.test(navigator.userAgent) ) {
			admobids = { // for android
				topbannerid: 'ca-app-pub-6141378478306258/9235092323',
				bottombannerid: 'ca-app-pub-6141378478306258/7618758328',
				afterlogininterstitialid: 'ca-app-pub-6141378478306258/2165351127'
			};
		} else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
			admobids = { // for iOS
				topbannerid: 'ca-app-pub-6141378478306258/9235092323',
				bottombannerid: 'ca-app-pub-6141378478306258/7618758328',
				afterlogininterstitialid: 'ca-app-pub-6141378478306258/2165351127'
			};
		} else {
			admobids = { // for Windows phone
				topbannerid: 'ca-app-pub-6141378478306258/9235092323',
				bottombannerid: 'ca-app-pub-6141378478306258/7618758328',
				afterlogininterstitialid: 'ca-app-pub-6141378478306258/2165351127'
			};
		}
		return admobids;
	}

	this.setupBannerAds = function(admobids) {
		if(AdMob) {
			AdMob.createBanner({
				adId: admobids.topbannerid,
				position: AdMob.AD_POSITION.TOP_CENTER,
				autoShow: true,
				isTesting: false
			});
		};
	};

	this.prepareInterstitialAd = function(admobids) {
		// this function must be followed by AdMob.showInterstitial()
		// when 'onAdLoaded' event is received (Event Handler).
		if(AdMob) {
			AdMob.prepareInterstitial( {
				adId: admobids.afterlogininterstitialid,
				autoShow: false,
				isTesting: false
			});
		};
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

	this.onExportCSVFile = function(event) {
		event.preventDefault();
		var r = confirm(l("Export CSV File to") + " " + passwordsService.getStorageDirectory() + "export.csv?");
		if(r) {
			passwordsService.exportCSV("export.csv");
		} else {
			alert(l("Action Canceled.  No unencrypted CSV file was created."));
		}
	}

	this.onImportCSVFile = function(event) {
		event.preventDefault();
		var r = confirm(l("Importing CSV File from") + " " + passwordsService.getStorageDirectory() + 
			"export.csv" + " " + l("will overwrite all data in APass with data from the file.  Do you wish to continue?"));
		if(r) {
			alert("IMPORT CSV FILE NOT YET IMPLEMENTED.");
			// passwordsService.importCSV("export.csv");
		} else {
			alert(l("Data Load Canceled.  No changes have been made."));
		}
	}

	this.onEmailCSVFile = function(event) {
		event.preventDefault();

		var r = confirm(l("Unencrypted CSV files may pose a security risk if accessible to hackers.  Do you wish to continue anyway?"));
		if(r == false) {
			alert(l("Action Canceled.  No unencrypted CSV file was created."));
			return;
		}

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
        					subject: l("APass Backup File"),
        					body: l("Backup of Entries in APass.")
        				},
						function() {
							console.log('email view dismissed');
        		 		},
        		 		this
        		 	);
        		});
       		} else {
       			alert(l("Email Plugin is NOT Available."));
       		};
        });
	}

	this.onEmailEncryptedFile = function(event) {
		event.preventDefault();

		var r = confirm(l("Are you sure you want to email encrypted data?"));
		if(r == false) {
			alert(l("Action Canceled.  No encrypted file was created."));
			return;
		}

		passwordsService.encryptDB("encrypted.apass");

		// NOW SEND EMAIL ATTACHMENT:		
        cordova.plugins.email.isAvailable(function(isAvailable) {
        	if(isAvailable) {
        		loginService.getEmail(loginService.getLoggedInUser()).done(function (myemail) {
        			var atts = [];
        			var emails = [];

        			emails.push(myemail);
        			atts.push(passwordsService.getStorageDirectory() + "encrypted.apass");

        			window.plugin.email.open({
        					to: emails,
    	    				attachments: atts,
        					subject: l("APass Backup File"),
        					body: l("Backup of Entries in APass")
        				},
						function() {
							console.log('email view dismissed');
        		 		},
        		 		this
        		 	);
        		});
       		} else {
       			alert(l("Email Plugin is NOT Available."));
       		};
        });
	}

	this.onAdvanced = function(event) {
		event.preventDefault();
		document.getElementById("myDropdown").classList.toggle("show");
		document.getElementById("advancedDropdown").classList.toggle("show");
	}

	this.onSaveEncryptedFile = function(event) {
		event.preventDefault();

		var r = confirm(l("Do you wish to save all data to encrypted file") + " " + passwordsService.getStorageDirectory() + "encrypted.apass?");
		if(r) {
			// use crypto.js to encrypt database file into output file.
			passwordsService.encryptDB("encrypted.apass");
			// passwordsService.copyDBFileOut("backup.db");  // for troubleshooting encryption
		} else {
			alert(l("Action Canceled.  No encrypted file was created."));
		}
	}

	this.onLoadEncryptedFile = function(event) {
		event.preventDefault();

		var r = confirm(l("Loading data will DISCARD EXISTING RECORDS.  You may wish to create a backup file first.  Do you wish to continue?"));
		// var r = confirm("Loading data from encrypted file " + passwordsService.getStorageDirectory() + 
		// 	"encrypted.apass will overwrite all data in APass with data from the file.  Do you wish to continue?");
		if(r) {
			passwordsService.decryptDB("encrypted.apass", function() {
				// trigger keyup event as callback, which forces refresh:
        	    $('.search-key').keyup();
			});
		} else {
			alert(l("Data Load Canceled.  No changes have been made."));
		}
	}

	this.onChangeLogin = function(event) {
		event.preventDefault();
		alert("FEATURE NOT YET IMPLEMENTED");
	}

	this.onRemoveAds = function(event) {
		event.preventDefault();
		// adsEnabled = false;
		store.order("turn_off_ads");
	}

	this.setAdsEnabled = function(bAdsEnabled) {
		adsEnabled = bAdsEnabled;
	}

	this.onAbout = function(event) {
		event.preventDefault();
		window.location.href="#";
	}

	this.initialize();
}


