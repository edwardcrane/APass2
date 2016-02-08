var PasswordsService = function () {

    var logOb;

    this.init = function () {
        var deferred = $.Deferred();


        if(device.platform === 'browser') {
            console.log("PasswordService running on platform "+ device.platform + ", using WebSQL");
            this.db = window.openDatabase("PasswordsDB", "1.0", "Passwords DB", 20000);
        } else {
            console.log("LoginService running on platform " + device.platform + ", using SQLitePlugin");
            this.db = sqlitePlugin.openDatabase({name: "MyPass.db", location: 2});            
        }

        this.db.transaction(
            function (tx) {
                createMyPassTable(tx);
                // addSampleData(tx);
                // addMoreSampleData(tx);
            },
            function (error) {
                console.log('Transaction error: ' + error);
                deferred.reject('Transaction error: ' + error);
            },
            function () {
                console.log('Transaction success');
                deferred.resolve();
            }
        );
        return deferred.promise();
    }

    this.getAllResources = function() {
        var deferred = $.Deferred();

        this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM mypassentry ORDER BY resourcename COLLATE NOCASE ASC;";
                tx.executeSql(sql, null, function(tx, results) {
                    var len = results.rows.length,
                    resources = [],
                    i = 0;
                    for(i = 0; i < len; i++) {
                        resources[i] = results.rows.item(i);
                    }
                    deferred.resolve(resources);
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.findById = function(id) {
        var deferred = $.Deferred();
        this.db.transaction(
            function (tx) {

                var sql = "SELECT * FROM mypassentry " +
                    "WHERE _id=" + id + " ORDER BY resourcename COLLATE NOCASE ASC;";

                tx.executeSql(sql, null, function (tx, results) {
                    deferred.resolve(results.rows.length === 1 ? results.rows.item(0) : null);
                });
            },
            function (error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.findResources = function(searchKey) {
        var deferred = $.Deferred();

        // SUBSTITUTE '' for ' as needed:
        searchKey = searchKey.replace(/'/g, '\'\'');

        this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM mypassentry " + 
                    "WHERE resourcename LIKE \'%"+ searchKey + "%\' OR " + 
                    "description LIKE \'%" + searchKey + "%\' ORDER BY resourcename COLLATE NOCASE ASC;";
                tx.executeSql(sql, null, function (tx, results) {

                    var len = results.rows.length,
                    resources = [],
                    i = 0;

                    for (i = 0; i < len; i++) {
                        resources[i] = results.rows.item(i);
                    }
                    deferred.resolve(resources);
                },function (tx, error) {
                    alert("UPDATE error: " + sql + " error: " + error.message);
                    console.log("UPDATE error: " + sql + " error: " + error.message);
                });
            },
            function(error) {
                console.log("Transaction Error: " + error.message);
                console.log(error);
                deferred.reject("Transaction Error: " + error.message);
            }

        );
        return deferred.promise();
    }

    this.createResource = function(resourceName, username, password, description) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                createResource(tx, resourceName, username, password, description);
                deferred.resolve();  // RESOLVE TO WHAT?
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.updateResource = function(id, resourceName, username, password, description) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                updateResource(tx, id, resourceName, description, username, password);
                deferred.resolve();  // RESOLVE TO WHAT?
            },
            function(error) {
                console.log("PasswordsService.updateResource() Transaction Error: " + error.message);
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.deleteResource = function(id) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                deleteResource(tx, id);
                deferred.resolve();  // RESOLVE TO WHAT?
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    };

    var createMyPassTable = function (tx) {
        // tx.executeSQL('DROP TABLE IF EXISTS mypassentry');
        var sql = "CREATE TABLE IF NOT EXISTS mypassentry ( " +
            "_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "resourcename TEXT, " +
            "description TEXT, " +
            "username TEXT, " +
            "password TEXT )";
        tx.executeSql(sql, null,
            function () {
                console.log("Create mypassentry table succeeded.");
            },
            function (tx, error) {
                alert('Create mypassentry table error: ' + error.message);
            });
    }

    var updateResource = function(tx, _id, resourceName, description, userName, password) {
        var sql = "UPDATE mypassentry SET resourcename = ?, description = ?, username = ?, password = ?" +
            " WHERE _id = ?";
        tx.executeSql(sql, [resourceName, description, userName, password, _id], 
            function () {
                console.log("UPDATE success");
            },
            function (tx, error) {
                alert("UPDATE error: " + sql + " error: " + error.message);
                console.log("UPDATE error: " + sql + " error: " + error.message);
            });
    }

    var deleteResource = function(tx, _id) {
        var sql = "DELETE FROM mypassentry WHERE _id = ?;";
        tx.executeSql(sql, [_id],
            function() {
                console.log("DELETE success. " + _id);
            },
            function(tx, error) {
                alert("DELETE error: " + error.message);
            })
    }

    var createResource = function(tx, resourceName, userName, password, description) {
        var sql = "INSERT OR REPLACE INTO mypassentry (" +
            "resourcename, description, username, password ) " +
            "VALUES (?, ?, ?, ?)";
        tx.executeSql(sql,
            [resourceName, description, userName, password],
            function () {
                console.log('INSERT success');
            },
            function (tx, error) {
                alert('INSERT error: ' + sql + " error: " + error.message);
            });
    }

    // error handler callback for file system functions:
    this.errorHandler = function (e) {  
        var msg = '';

        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'Storage quota exceeded';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'File not found';
                break;
            case FileError.SECURITY_ERR:
                msg = 'Security error';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'Invalid modification';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'Invalid state';
                break;
            default:
                msg = 'Unknown error';
                break;
        };

        console.log('Error: ' + msg);
    }

    var stringifyCSV = function(table) {
        var csv = "";

        console.log("Table contains " + table.length + " records.");
        // if we have any rows, create header row
        if(table.length > 0) {
            var firstRow = table[0];
            for(var key in firstRow) {
                console.log(key + ": " + firstRow[key]);
                csv += "\"" + key + "\"";
                if(key !== "password") { csv += ","};  // last elt no comma.
            }
            csv += "\r\n";
        }

        // now handle each row in table:
        for(var i = 0; i < table.length; i++) {
            var curRow = table[i];

            for (var key in curRow) {
                console.log(key + ": " + curRow[key]);
                csv += "\"" + escapeSpecialChars(curRow[key]) + "\"";
                if(key !== "password") { csv += ","}; // last elt no comma.
            }
            csv += "\r\n";
        }
        return csv;
    }

    // copy DB file out to non-private app directory.
    this.copyDBFileOut = function (infilename, outfilename) {
        var pathToDBFile = cordova.file.dataDirectory + "/../databases/" + "MyPass.db";
        window.resolveLocalFileSystemURL(pathToDBFile, function (fileEntry) {
            window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dirEntry) {
                fileEntry.copyTo(dirEntry, outfilename, function() { console.log("copyDBFileOut() succeeded");}, this.errorHandler);
            });
        });
    };

    // function ab2str(buf) {
    //     var str = String.fromCharCode.apply(null, new Uint8Array(buf));
    //     console.log(str);
    //     return(str);
    // };

    // function str2ab(str) {
    //     var buf = new ArrayBuffer(str.length);
    //     var bufView = new Uint8Array(buf);
    //     for (var i=0, strLen=str.length; i < strLen; i++) {
    //         bufView[i] = str.charCodeAt(i);
    //     }
    //     return buf;
    // }

    this.encryptDBBinaryString = function (filename, outfilename) {
        var pathToDBFile = cordova.file.dataDirectory + "/../databases/" + filename;
        window.resolveLocalFileSystemURL(pathToDBFile, function (fileEntry) {
            fileEntry.file(function(file) {

                var reader = new FileReader();

                reader.onload = function (e) {
                    console.log("Encrypting: [" + reader.result.length + "] bytes.");
                    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Latin1.parse(reader.result), "APassApp");
                    //console.log("encrypted is a WordArray? " + (encrypted instanceof CryptoJS.WordArray));
                    console.log("encrypted length is  [" + encrypted.ciphertext.length + "] bytes.");
                    console.log("encrypted.key:       " + encrypted.key);
                    console.log("encrypted.iv:        " + encrypted.iv);
                    console.log("encrypted.salt:      " + encrypted.salt);
                    console.log("encrypted.ciphertext:" + encrypted.ciphertext);

                    console.log(CryptoJS.AES.decrypt(encrypted, "APassApp").toString(CryptoJS.enc.Latin1));
                    console.log("decrypted string is [" + CryptoJS.AES.decrypt(encrypted, "APassApp").toString(CryptoJS.enc.Latin1).length + "] bytes");

                    // NOW WE MUST WRITE THIS DATA TO NEW FILE.
                    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dir) {
                        var outfile;
                        console.log("writing encrypted file to: " + cordova.file.externalDataDirectory + " " + dir.name + " " + outfilename);
                        dir.getFile(outfilename, {create:true}, function(file){
                            outfile = file;
                            outfile.createWriter(function(fileWriter) {
                                // CipherParam.ciphertext is a WordArray.
                                console.log("convert WordArray to Utf8 string:");
                                var utf8str = CryptoJS.enc.Utf16.stringify(encrypted.ciphertext);
                                console.log("utf8str: "+ utf8str);

                                var blob = new Blob([utf8str], {type:'text/plain'});
                                fileWriter.write(blob);
                                console.log("Successfully completed write: " + outfilename);
                            }, this.errorHandler);
                        });
                    });
                };

                reader.readAsBinaryString(file);
            });
        });
    }

    this.encryptDBArrayBuffer = function (filename, outfilename) {
        var pathToDBFile = cordova.file.dataDirectory + "/../databases/" + filename;
        window.resolveLocalFileSystemURL(pathToDBFile, function (fileEntry) {
            fileEntry.file(function(file) {

                var reader = new FileReader();

                reader.onload = function (e) {
                    var strToEncrypt = String.fromCharCode.apply(null, new Uint8Array(reader.result));
                    console.log("Encrypting: [" + strToEncrypt.length + "] bytes.");
                    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Latin1.parse(strToEncrypt), "APassApp");
                    //console.log("encrypted is a WordArray? " + (encrypted instanceof CryptoJS.WordArray));
                    console.log("encrypted length is  [" + encrypted.ciphertext.length + "] bytes.");
                    console.log("encrypted.key:       " + encrypted.key);
                    console.log("encrypted.iv:        " + encrypted.iv);
                    console.log("encrypted.salt:      " + encrypted.salt);
                    console.log("encrypted.ciphertext:" + encrypted.ciphertext);

                    console.log(CryptoJS.AES.decrypt(encrypted, "APassApp").toString(CryptoJS.enc.Latin1));
                    console.log("decrypted string is [" + CryptoJS.AES.decrypt(encrypted, "APassApp").toString(CryptoJS.enc.Latin1).length + "] bytes");

                    // NOW WE MUST WRITE THIS DATA TO NEW FILE.
                    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dir) {
                        var outfile;
                        console.log("writing encrypted file to: " + cordova.file.externalDataDirectory + " " + dir.name + " " + outfilename);
                        dir.getFile(outfilename, {create:true}, function(file){
                            outfile = file;
                            outfile.createWriter(function(fileWriter) {
                                // CipherParam.ciphertext is a WordArray.
//                                console.log("convert WordArray to Utf8 string:");
//                                var utf8str = CryptoJS.enc.Utf16.stringify(encrypted.ciphertext);
//                                console.log("utf8str: "+ utf8str);

//                                var blob = new Blob([utf8str], {type:'text/plain'});
//                                var blob = new Blob([utf8str], {type:'application/octet-stream'});
                                var blob = new Blob([encrypted], {type:'text/plain'});
                                fileWriter.write(blob);
                                console.log("Successfully completed write: " + outfilename);
                            }, this.errorHandler);
                        });
                    });
                };

                reader.readAsArrayBuffer(file);
            });
        });
    }

    this.decryptDB = function(infilename, outfilename) {
        var pathToDBFile = cordova.file.externalDataDirectory + infilename;

        console.log("infilename: " + infilename);
        console.log("outfilename: " + outfilename);
        console.log("pathToDBFile: " + pathToDBFile);

        window.resolveLocalFileSystemURL(pathToDBFile, function (fileEntry) {
            fileEntry.file(function(file) {

                var reader = new FileReader();

                // Read file callback!  In here, setup asynchronous file write.
                reader.onload = function (e) {
                    var strToDecrypt = String.fromCharCode.apply(null, new Uint8Array(reader.result));
                    console.log("Decrypting: [" + strToDecrypt.length + "] bytes.");
                    var decrypted = CryptoJS.AES.decrypt(CryptoJS.enc.Latin1.parse(strToDecrypt), "APassApp");

                    // var wordArray = CryptoJS.lib.WordArray.create(reader.result);

                    // now decrypt and write to file:
//                    var decrypted = CryptoJS.AES.decrypt(wordArray, "APassApp");
//                    alert(CryptoJS.AES.decrypt(encrypted, "APassApp").toString(CryptoJS.enc.Latin1));
                    // NOW WE MUST WRITE THIS DATA TO NEW FILE.

                    console.log("decrypted w/o enc: " + decrypted);
                    console.log("decrypted: " + decrypted.toString(CryptoJS.enc.Latin1));
                    // Maybe use this when implementation is thoroughly tested for outfilename: 
                    // var pathToDBFile = cordova.file.dataDirectory + "/../databases/" + infilename;
                    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dir) {
                        var outfile;
                        console.log("writing decrypted file to: " + cordova.file.externalDataDirectory + " " + dir.name + " " + outfilename);
                        dir.getFile(outfilename, {create:true}, function(file){
                            outfile = file;
                            outfile.createWriter(function(fileWriter) {
                                // I think decrypted is a WordArray.
                                console.log("convert WordArray to Utf8 string:");
                                var utf8str = CryptoJS.enc.Utf16.stringify(decrypted);
                                console.log("utf8str: " + utf8str);

                                var blob = new Blob([utf8str], {type:'application/octet-stream'});
                                fileWriter.write(blob);
                                // fileWriter.write(CryptoJS.enc.Latin1.parse(decrypted), "application/octet-stream");
//                                fileWriter.write(decrypted, "application/octet-stream");
                                console.log("Successfully completed write: " + outfilename);
                            }, this.errorHandler);
                        });
                    });
                };

                reader.onerror = this.errorHandler;

                reader.readAsArrayBuffer(file);
            });
        }, this.errorHandler);
    }

    this.exportCSV = function (filename) {
        var table = [];
        this.getAllResources().done(function (newTable) {
            table = newTable;

            if(device.platform === 'browser') {
                // browser?

                // Request storage usage and capacity left
                // Choose either Temporary or Persistent
                navigator.webkitPersistentStorage.queryUsageAndQuota ( 
                    function(usedBytes, grantedBytes) {  
                        console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes');
                    }, 
                    function(e) { console.log('Error', e);  }
                );


                navigator.webkitPersistentStorage.requestQuota(1024*1024, function(grantedBytes) {
                    console.log("webkitPersistentStorage granted bytes: " + grantedBytes);
                    window.webkitResolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dir) {
                        dir.getFile(filename, {create:true}, function(file) {
                            logOb = file;
                            console.log("caling writeStr()");
                            writeStr(stringifyCSV(table));
                        });
                    });
                });
            } else {
                console.log(device.platform);
                window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dir) {
                    console.log("writing CSV file to: " + cordova.file.externalDataDirectory + " " + dir + " " + filename);
                    dir.getFile(filename, {create:true}, function(file){
                        logOb = file;
                        writeStr(stringifyCSV(table));
                    });
                });
            };
        });
    }

    function escapeSpecialChars (instr) {
        // suppose a number is passed in?
        if(typeof instr !== 'string') {
            // return it unmolested:
            return instr;
        }
        return instr.replace(/"/g, '""');
    }

    function writeStr(instr) {
        if(!logOb) {
            alert(logOb);
            return;
        }
        var str = instr;
        logOb.createWriter(function(fileWriter) {
            // if we wanted to append, we would uncomment the following:
            // fileWriter.seek(fileWriter.length);
            
            var blob = new Blob([str], {type:'text/plain'});
            fileWriter.write(blob);
            console.log("Successfully completed writeStr().");
        }, this.errorHandler);
    }
} 