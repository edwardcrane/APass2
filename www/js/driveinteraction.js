	/**  THESE ARE FOR GOOOGLE DRIVE INTERACTION
	 */

	var GOOGLE_CLIENT_API_URL = 'https://accounts.google.com/o/oauth2/auth?';
	var CLIENT_ID = '1062372605568-bhqm5ibm437a7u9kt205rnh6rphrdgms.apps.googleusercontent.com';
	var CLIENT_SECRET = 'iilSb1anq_ntKmKymF7mr3tp';
	var REDIRECT_URI = 'http://localhost';
	var SCOPES = ['https://www.googleapis.com/auth/drive.appdata'];
	// var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly',
	// 				'https://www.googleapis.com/auth/drive.appdata',
	// 				'https://www.googleapis.com/auth/drive.file'];

	var googleapi = {
		authorize: function(options) {
			var deferred = $.Deferred();
			var authUrl = GOOGLE_CLIENT_API_URL + $.param({
				client_id: options.client_id,
				redirect_uri: options.redirect_uri,
				response_type: 'code',
				scope: options.scope
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
						gapi.client.load('drive', 'v2', function() {
							listAppDataFiles();
						});
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
				'scope' : SCOPES.join(' ')
			}, handleAuthResult);
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
			alert("Authorization Error: " + authResult.error);
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
	 * Load Drive API client library.
	 */
	function loadDriveApi() {
		gapi.client.load('drive', 'v2', new function() {
			console.log("called gapi.client.load('drive', 'v2') :" + gapi.client.drive);
//			updateGoogleDriveFile("file:///storage/emulated/0/Android/data/com.airanza.apass2/files/enc.apass", "enc.apass");
		});
	}

	function updateGoogleDriveFile(fullpath, filename) {
		// first ensure the drive is authenticated and loaded.
		gapi.client.load('drive', 'v2', new function() {
			getAppDataFileId(filename).done(function(fId) {
				if(fId) {
					window.resolveLocalFileSystemURL(fullpath, function(fileEntry) {
						fileEntry.file(function(fileData) {
							updateGoogleAppDataFile(fId,
								null, // fileMetadata
								fileData, // fileData
								function(f) { console.log(f); });
						});
					});
				} else {
					uploadToGoogleDrive(fullpath);
				}
			})
		});
	}

	/**
	 * Update existing Google Drive File
	 * Update an existing file's metadata and content.
	 *
	 * @param {String} fileId ID of the file to update.
	 * @param {Object} fileMetadata existing Drive file's metadata.
	 * @param {File} fileData File object to read data from.
	 * @param {Function} callback Callback function to call when the request is complete.
	 */
	function updateGoogleAppDataFile(fileId, fileMetadata, fileData, callback) {
		const boundary = '-------314159265358979323846';
		const delimiter = "\r\n--" + boundary + "\r\n";
		const close_delim = "\r\n--" + boundary + "--";

		var reader = new FileReader();
		reader.readAsBinaryString(fileData);
		reader.onload = function(e) {
			var contentType = fileData.type || 'application/octet-stream';
			// Updating the metadata is optional and you can instead use the value from drive.files.get.
			var base64Data = btoa(reader.result);
			var multipartRequestBody =
				delimiter +
				'Content-Type: application/json\r\n\r\n' +
				JSON.stringify(fileMetadata) +
				delimiter +
				'Content-Type: ' + contentType + '\r\n' +
				'Content-Transfer-Encoding: base64\r\n' +
				'\r\n' +
				base64Data +
				close_delim;

			var request = gapi.client.request({
				'path': '/upload/drive/v2/files/' + fileId,
				'method': 'PUT',
				'params': {'uploadType': 'multipart', 'alt': 'json'},
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

	/**
	 * Upload file specified by fullPath to Google Drive
	 */
	function uploadToGoogleDrive(fullPath) {
		window.resolveLocalFileSystemURL(fullPath, function (fileEntry) {
			fileEntry.file(insertAppDataFile);
		});
	}

	/**
	 * Insert new file.
	 *
	 * @param {File} fileData File object to read data from.
	 * @param {Function} callback Function to call when the request is complete.
	 */
	function insertAppDataFile(fileData, callback) {
		const boundary = '-------314159265358979323846';
		const delimiter = "\r\n--" + boundary + "\r\n";
		const close_delim = "\r\n--" + boundary + "--";

		var reader = new FileReader();
		reader.readAsBinaryString(fileData);
		reader.onload = function(e) {
			var contentType = fileData.type || 'application/octet-stream';
			var fName = fileData.fileName || fileData.name;
			var metadata = {
				'name' : fName,
				'title': fName,
				'parents': [{id: 'appdata'}],
				'appDataContents': 'true',
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

	/**
	 * Delete filename from Google Drive appData
	 */
	function deleteDriveFilename(filename) {
		// first get file ID
		getAppDataFileId(filename).done(function(fileId) {
			// then delete based on ID:
			var request = gapi.client.drive.files.delete({
				'fileId': fileId
			});
			request.execute(function(resp) { console.log(resp); } );
		})
	}

	function downloadDriveFilename(filename, callback) {
		getAppDataFile(filename).done(function(file) {
			downloadDriveFile(file, callback);
		});
	}

	/**
	* returns the Google API File Object of file matching "filename".
	*  WARNING:  IF there is more than 1 with the same filename on Drive,
	* This function will return the first one.
	*/
	function getAppDataFile(filename) {
		var deferred = $.Deferred();
		var resultFiles = [];
		var request = gapi.client.drive.files.list({
			spaces: 'appDataFolder',
			maxResults: 100
		});

		request.execute(function(resp) {
			var files = resp.items;
			if(files && files.length > 0) {
				for(var i=0; i < files.length; i++) {
					var file = files[i];
					if(file.name === filename || file.title === filename) {
						resultFiles.push(file);
					}
				}
				deferred.resolve(resultFiles.length > 0 ? resultFiles[0] : null);
			} else {
				deferred.reject("No files matching [" + filename + "] found.");
			}
		})
		return deferred.promise();
	}

	function getAppDataFileId(filename) {
		var deferred = $.Deferred();

		var resultFiles = [];

		var request = gapi.client.drive.files.list({
			spaces: 'appDataFolder',
			maxResults: 100
			// fields: 'nextPageToken, files(id, name)',
			// pageSize: 100
		});

		request.execute(function(resp) {
			var files = resp.items;
			if(files && files.length > 0) {
				for(var i = 0; i < files.length; i++) {
					var file = files[i];
					if(file.name === filename || file.title === filename) {
						resultFiles.push(file);
					}
				}
				deferred.resolve(resultFiles.length > 0 ? resultFiles[0].id : null);
			} else {
				console.log("no files found in Google Drive appDataFolder");
				deferred.resolve();
			}
		})
		return deferred.promise();
	}

	/**
	 * Download a Drive files's content
	 *
	 */
	function downloadDriveFile(file, callback) {
		if (file.downloadUrl) {
			var accessToken = gapi.auth.getToken().access_token;
			var xhr = new XMLHttpRequest();
			xhr.open('GET', file.downloadUrl);
			xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
			xhr.onload = function() {
				// callback should most likely write data to a file:
				callback(xhr.responseText);
			};
			xhr.onerror = function(e) {
				console.log("in downloadDriveFile(), xhr.error: " + e.error);
			};
			xhr.send();
		} else {
			console.log("in downloadDriveFile(), the specified file has no downloadUrl");
//			callback(null);
		}
	}

	function writeDataToFile(storageDir, outFilename, responseText) {
		window.resolveLocalFileSystemURL(storageDir, function(dir) {
			var outfile;
			console.log("writing downloaded encrypted file to: " + storageDir + outFilename);
			dir.getFile(outFilename, {create:true}, function(file) {
				outfile = file;
				outfile.createWriter(function(fileWriter) {
					fileWriter.write(responseText);
					console.log("Successfully completed write: " + outFilename);
				}, diErrorHandler);
			});
		});
	}

	function diErrorHandler(e) {
	        var msg = '';

        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
        };
        console.log('Error: ' + msg);
        console.log("ERROR: [" + e.name + "]:[" + e.message + "]");
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
			}
		})
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
			} else {
				console.log("no files found in Google Drive appDataFolder");
			}
		})
	}

