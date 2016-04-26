var HomeView = function (loginService, passwordsService) {

	var resourceListView;

	var adsEnabled = false;

	this.initialize = function () {

		// Define a div wrapper for the view (used to attach events)
		this.$el = $('<div/>');

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

	/**
	 * When user clicks on menu icon, toggle between hiding and showing the dropdown content:
	 */
	this.menuClicked = function (event) {
		if(document.getElementById("advancedDropdown").classList.contains('show')) {
			document.getElementById("advancedDropdown").classList.toggle("show");
		}
		document.getElementById("myDropdown").classList.toggle("show");
	};

	/**
	 * handle clicks outside of menu or icons to clear/reset menus.
	 */
	this.handleClick = function(event) {
		if((!event.target.matches('.menuicon')) && 
			(!event.target.matches('.menuitemadvanced')) &&
			(!event.target.matches('.newresource'))) {
			var dropdowns = document.getElementsByClassName("dropdown-content");
			var i;
			for (i = 0; i < dropdowns.length; i++) {
				var openDropdown = dropdowns[i];
				if(openDropdown.classList.contains('show')) {
					event.preventDefault();
					openDropdown.classList.remove('show');
				};
			};
			var advanceddropdowns = document.getElementsByClassName("advanced-dropdown-content");
			var i;
			for (i = 0; i < advanceddropdowns.length; i++) {
				var openDropdown = advanceddropdowns[i];
				if(openDropdown.classList.contains('show')) {
					event.preventDefault();
					openDropdown.classList.remove('show');
				};
			};
			return true;
		};
	};

	/**
	 * setup event handling: clicks, keystrokes in search box
	 * called from app.js after rendering seems to work best.
	 */
	this.setupEventMapping = function() {
		this.$el.on('keyup', '.search-key', this.findResources);
//		this.$el.on('input', '.search-key', this.findResources);

		this.$el.on('click', '.newresource', this.newResource);
		this.$el.on('click', '.menuicon', this.menuClicked);

		this.$el.on('click', '.menuitemexportcsvfile', this.onExportCSVFile);
		this.$el.on('click', '.menuitemimportcsvfile', this.onImportCSVFile);
		this.$el.on('click', '.menuitememailcsvfile', this.onEmailCSVFile);
		this.$el.on('click', '.menuitememailencryptedfile', this.onEmailEncryptedFile);

		this.$el.on('click', '.menuitemgoogledrivebackup', this.onEnableGoogleDriveBackup);

		this.$el.on('click', '.menuitemadvanced', this.onAdvanced);

		this.$el.on('click', '.menuitemsaveencryptedfile', this.onSaveEncryptedFile);
		// CLICK DOESN'T WORK ON createObjectURL() it seems:
		// this.$el.on('click', '.menuitemsaveencryptedfile', this.onDownloadEncryptedFile);
		// suspected cause is File plugin: 
		// http://stackoverflow.com/questions/30539839/createobjecturl-of-javascript-file-object-from-cordova-camera
		this.$el.on('click', '.menuitemloadencryptedfile', this.onLoadEncryptedFile);
		this.$el.on('click', '.menuitemchangelogin', this.onChangeLogin);
		this.$el.on('click', '.menuitemremoveads', this.onRemoveAds);
		this.$el.on('click', '.menuitemabout', this.onAbout);
	}

	this.onDownloadEncryptedFile = function (event) {

		alert("IMPMENTATION INCOMPLETE.  URL CLICK DOESN'T WORK IN CORDOVA WEBVIEW REVERT TO ONSAVEENCRYPTEDFILE");
		passwordsService.encryptedBlob(function(encBlob) {
			if(encBlob) {
				console.log("encBlob is [" + encBlob.size + "] bytes");

				var url = URL.createObjectURL(encBlob);
				console.log(url);
				var a = document.createElement('a');
				a.download = "backup.apass";
				a.href = url;
				a.textContext = "Download backup.apass";
				a.addEventListener('click', function(event) {
					alert("inside click on a, so should start downloading...");
				});

				// FOR SOME REASON THIS CLICK TRIGGERS THE EVENT LISTENER AND
				// TRIGGERS THE ALERT, BUT IT DOES NOT DOWNLOAD THE FILE, EVEN THOUGH THIS FIDDLE
				// WORKS ON ANDROID: http://jsfiddle.net/qnYk4/48/ FROM WITHIN CHROME
				alert("I AM SORRY BUT THIS FUNCTION HAS NOT BEEN IMPLEMENTED YET, SO YOU CANNOT DOWNLOAD YOUR ENCRYPTED FILE TODAY.");
				a.click();
			};
		});
	}

	this.onExportCSVFile = function(event) {
		event.preventDefault();
		var r = confirm(sprintf(l("Export CSV File to [%s]?"), passwordsService.getStorageDirectory() + "export.csv?"));
		if(r) {
			passwordsService.exportCSV("export.csv");
		} else {
			alert(l("Action Canceled.  No unencrypted CSV file was created."));
		}
	}

	this.onImportCSVFile = function(event) {
		event.preventDefault();
		var r = confirm(sprintf(l("Importing CSV File from [%s] will overwrite all data in APass with data from the file.  Do you wish to continue?"), 
			passwordsService.getStorageDirectory() + "export.csv"));
		if(r) {
			passwordsService.importCSV("export.csv", function() {
				// trigger keyup event as callback, which forces refresh:
				$('.search-key').keyup();
			});
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

	this.onEnableGoogleDriveBackup = function(event) {
		event.preventDefault();

		var encryptedFile = "enc.apass";

		// of course the user must have a google account and must authorize this app to copy files to their drive.
		console.log("user chose to enable Google Drive backups.");
		passwordsService.encryptDB(encryptedFile);
		if(device.platform === 'browser') {
			handleAuthClick(event);
		} else {
			checkAuth();
		}
	}

	this.onAdvanced = function(event) {
		event.preventDefault();
		document.getElementById("myDropdown").classList.toggle("show");
		document.getElementById("advancedDropdown").classList.toggle("show");
	}

	this.onSaveEncryptedFile = function(event) {
		event.preventDefault();

		var r = confirm(sprintf(l("Save Encrypted File [%s]?"), passwordsService.getStorageDirectory() + "encrypted.apass"));
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

		var r = confirm(sprintf(l("Load Encrypted File [%s]?"), passwordsService.getStorageDirectory() + "encrypted.apass"));
		if(!r) {
			alert(l("Data Load Canceled.  No changes have been made."));
			return;
		}

		var r = confirm(l("Loading data will DISCARD EXISTING RECORDS.  You may wish to create a backup file first.  Do you wish to continue?"));
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
		window.location.href="#changeregistration";
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


