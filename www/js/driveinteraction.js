	/**  THESE ARE FOR GOOOGLE DRIVE INTERACTION
	 */

	var GOOGLE_CLIENT_API_URL = 'https://accounts.google.com/o/oauth2/auth?';
	var CLIENT_ID = '1062372605568-bhqm5ibm437a7u9kt205rnh6rphrdgms.apps.googleusercontent.com';
	var CLIENT_SECRET = 'iilSb1anq_ntKmKymF7mr3tp';
	var REDIRECT_URI = 'http://localhost';
	var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly',
					'https://www.googleapis.com/auth/drive.appdata',
					'https://www.googleapis.com/auth/drive.file'];

	var googleapi = {
		authorize: function(options) {
			var deferred = $.Deferred();
			var authUrl = GOOGLE_CLIENT_API_URL + $.param({
				client_id: options.client_id,
				redirect_uri: options.redirect_uri,
				response_type: 'code',
				scope: options.scope,
				prompt: 'select_account'
			});
			console.log("authUrl: " + authUrl);
            var authWindow = window.open(authUrl, "_blank", "location=no,toolbar=no");  // for iOS add 'toolbar=no'

			//The recommendation is to use the redirect_uri "urn:ietf:wg:oauth:2.0:oob" 
			//which sets the authorization code in the browser's title. However, we can't 
			//access the title of the InAppBrowser. 
			// 
			//Instead, we pass a bogus redirect_uri of "http://localhost", which means the 
			//authorization code will get set in the url. We can access the url in the 
			//loadstart and loadstop events. So if we bind the loadstart event, we can 
			//find the authorization code and close the InAppBrowser after the user 
			//has granted us access to their data. 
			//
			// To clear the authorization, go to https://accounts.google.com/IssuedAuthSubTokens.
            $(authWindow).on('loadstart', function(e) {
            	var url = e.originalEvent.url;
            	var code = /\?code=(.+)$/.exec(url);
            	var error = /\?error=(.+)$/.exec(url);

            	if(code || error) {
            		authWindow.close();
            	}
				if (code) { 
					//Exchange the authorization code for an access token 
					$.post('https://accounts.google.com/o/oauth2/token', { 
						code: code[1], 
						client_id: options.client_id, 
						client_secret: options.client_secret, 
						redirect_uri: options.redirect_uri, 
						grant_type: 'authorization_code' 
					}).done(function(data) {
						// use the token we got back from oauth to setup the api.
						gapi.auth.setToken(data);
						// load the drive api.
						gapi.client.load('drive', 'v2', testUploadFile);
//						gapi.client.load('drive', 'v2', uploadDatabaseToGoogleDrive("enc.apass"));
//						gapi.client.load('drive', 'v2', listFiles);
						// gapi.client.load('drive', 'v2', function(arg) {
						// 	console.log('inside gapi.client.load callback.  arg: ' + arg);
						// });
						deferred.resolve(data); 
					}).fail(function(response) { 
						deferred.reject(response.responseJSON); 
					}); 
				} else if (error) { 
					//The user denied access to the app 
					deferred.reject({ 
						error: error[1] 
					}); 
				} 
            });

            return deferred.promise();
        }
    };

    function checkAuth() {
		if(device.platform === 'browser') {
			console.log("calling gapi.auth.authorize()");
			gapi.auth.authorize(
			{
				'client_id' : CLIENT_ID,
				'scope' : SCOPES.join(' '),
				'immediate' : true
			}, handleAuthResult);
		} else {
			// because this is called only after deviceready(), InAppBrowser is initialized by now:
			console.log("using the InAppBrowser plugin to authenticate.");
			window.open = cordova.InAppBrowser.open;

			googleapi.authorize(
			{
				'client_id' : CLIENT_ID,
				'client_secret' : CLIENT_SECRET,
				'redirect_uri' : REDIRECT_URI,
				'scope' : SCOPES.join(' '),
				'prompt' : 'select_account'
			}, handleAuthResult);
			// if handleAuthResult doesn't work properly on Android, use this code:
			//
	        // googleapi.authorize({
	        //     client_id: CLIENT_ID,
	        //     client_secret: CLIENT_SECRET,
	        //     redirect_uri: REDIRECT_URI,
	        //     scope: SCOPES.join(' ')
	        // }).done(function(data) {
	        //     console.log("data.access_token:" + data.access_token);
	        //     // TODO:  SOMEHOW SETUP THE API TO DEAL WITH READING & WRITING FILES HERE
	        //     // TODO:  Seems like we should change menu item here to allow user to "unauth".
	        // }).fail(function(data) {
	        //     console.log("data.error:" + data.error);
	        // });
		}
	}

	/**
	 * Handle response from authorization server.
	 *
	 * @param {Object} authResult Authorization result.
	 */
	function handleAuthResult(authResult) {
		var authMenuItem = document.getElementById("menuitemenablegoogledrivebackup");
		if (authResult && !authResult.error) {
			// If already authorized, change menu option to allow user to deny Authorization
			authMenuItem.innerHTML = l("Disable Google Drive Backup");
			loadDriveApi();
		} else {
			console.log("inside handleAuthResult, authResult.error: " + authResult.error);

			// Show auth menu item, allowing the user to initiate authorization
			authMenuItem.innerHTML = l("Enable Google Drive Backup");
			// use the InAppBrowser to display the authorization window:
			// var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');
			// or?
			// gapi.auth.authorize(
			// 	{
			// 		client_id: CLIENT_ID,
			// 		scope: SCOPES.join(' '),
			// 		immediate: false
			// 	}, handleAuthResult)
		}
	}

    /**
     * Initiate auth flow in response to user clicking authorize button.
     *
     * @param {Event} event Button click event.
     */
	function handleAuthClick(event) {
		console.log("inside handleAuthClick()");
		gapi.auth.authorize(
			{
				'client_id' : CLIENT_ID,
				'scope' : SCOPES.join(' '),
				'immediate' : false
			},
			handleAuthResult);
		return false;
	}

	/**
	 * Load Drive API client library.
	 */
	function loadDriveApi() {
//		gapi.client.load('drive', 'v2', listAppDataFiles);
		gapi.client.load('drive', 'v2', testUploadFile);
	}

	function listFiles() {
		var request = gapi.client.drive.files.list({
			'maxResults': 100
		});

		var outString = "";

		request.execute(function(resp) {
			var files = resp.items;
			if(files && files.length > 0) {
				for (var i = 0; i < files.length; i++) {
					var file = files[i];
					outString += (file.title + " (" + file.id + ")\r\n");
				}
				console.log(outString);
				alert(outString);
			}
		})
	}

	function testUploadFile() {
		window.resolveLocalFileSystemURL("file:///storage/emulated/0/Android/data/com.airanza.apass2/files/enc.apass", function(fileEntry) {
			fileEntry.file(insertFile);
		});
	}

	/**
	 * Upload file specified by fullPath to Google Drive
	 */
	function uploadDatabaseToGoogleDrive(fullPath) {
		window.resolveLocalFileSystemURL(fullPath, function (fileEntry) {
			fileEntry.file(insertFile);
		});
	}


	/**
	 * Insert new file.
	 *
	 * @param {File} fileData File object to read data from.
	 * @param {Function} callback Function to call when the request is complete.
	 */
	function insertFile(fileData, callback) {
		const boundary = '-------314159265358979323846';
		const delimiter = "\r\n--" + boundary + "\r\n";
		const close_delim = "\r\n--" + boundary + "--";

		var reader = new FileReader();
		reader.readAsBinaryString(fileData);
		reader.onload = function(e) {
			var contentType = fileData.type || 'application/octet-stream';
			var fName = fileData.fileName || fileData.name;
			var metadata = {
				'title': fName,
				'mimeType': contentType
			};

			var base64Data = btoa(reader.result);
			var multipartRequestBody =
				delimiter +
				'Content-Type: application/json\r\n\r\n' +
				JSON.stringify(metadata) +
				delimiter +
				'Content-Type: ' + contentType + '\r\n' +
				'Content-Transfer-Encoding: base64\r\n' +
				'\r\n' +
				base64Data +
				close_delim;

			var request = gapi.client.request({
				'path': '/upload/drive/v2/files',
				'method': 'POST',
				'params': {'uploadType': 'multipart'},
				'headers': {
					'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
				},
				'body': multipartRequestBody});
			if (!callback) {
				callback = function(file) {
					console.log(file)
				};
			}
			request.execute(callback);
		}
	}

	function createAppDataFile(filename) {
		var fileMetadata = {
			'name' : 'config.json',
			'parents': [ 'appDataFolder']
		};

		var media = {
			mimeType: 'application/json',
			body: fs.createReadStream('files/config.json')
		}
		gapi.drive.files.create({
			resource: fileMetadata,
			media: media,
			fields: 'id'
		}, function(err, file) {
			if(err) {
				console.log(err);
			} else {
				console.log("Folder Id: ", file.id);
			}
		});
	}

	function listAppDataFiles() {
		var request = gapi.client.drive.files.list({
			spaces: 'appDataFolder',
			maxResults: 100
			// fields: 'nextPageToken, files(id, name)',
			// pageSize: 100
		});

		var outString = "";
		request.execute(function(resp) {
			var files = resp.items;
			if(files && files.length > 0) {
				for(var i = 0; i < files.length; i++) {
					var file = files[i];
					outString += (file.title + " (" + file.id + ")\n");
				}
				console.log(outString);
				alert(outString);
			} else {
				console.log("no files found in Google Drive appDataFolder");
			}
		})
	}

