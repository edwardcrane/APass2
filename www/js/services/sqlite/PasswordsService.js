var PasswordsService = function () {

    this.init = function () {
        var deferred = $.Deferred();
        if(typeof window.sqlitePlugin === 'undefined') {
            console.log("sqlitePlugin is undefined, using WebSQL");
            this.db = window.openDatabase("PasswordsDB", "1.0", "Passwords DB", 200000);
        } else {
            console.log("Using sqlitePlugin.");
            console.log("sqlitePlugin property names: [" + Object.getOwnPropertyNames(window.sqlitePlugin).sort() + "]");
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
                var sql = "SELECT * FROM mypassentry";
                tx.executeSql(sql, null, function(tx, results) {
                    var len = reslts.rows.length,
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
                    "WHERE _id=" + id + ";";

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

        this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM mypassentry " + 
                    "WHERE resourcename LIKE \'%"+ searchKey + "%\' OR " + 
                    "description LIKE \'%" + searchKey + "%\' COLLATE NOCASE";
                tx.executeSql(sql, null, function(tx, results) {
                    var len = results.rows.length,
                    resources = [],
                    i = 0;
                    for (i = 0; i < len; i++) {
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
                console.alert("PasswordsService.updateResource() Transaction Error: " + error.message);
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

    var addMoreSampleData = function(tx) {
        createResource(tx, "resourceName1", "userName1", "password1", "description1");
        createResource(tx, "resourceName2", "userName2", "password2", "description2");
        createResource(tx, "resourceName3", "userName3", "password3", "description3");
        createResource(tx, "resourceName4", "userName4", "password4", "description4");
        createResource(tx, "resourceName5", "userName5", "password5", "description5");
        createResource(tx, "resourceName6", "userName6", "password6", "description6");
        createResource(tx, "resourceName7", "userName7", "password7", "description7");
    }

    var addSampleData = function (tx, resources) {

        var resources = [
            {"_id": 1, "resourcename": "test1", "description": "test1 description", "username": "user1", "password": "password1"},
            {"_id": 2, "resourcename": "test2", "description": "test2 description", "username": "user2", "password": "password2"},
            {"_id": 3, "resourcename": "test3", "description": "test3 description", "username": "user3", "password": "password3"},
            {"_id": 4, "resourcename": "test4", "description": "test4 description", "username": "user4", "password": "password4"},
            {"_id": 5, "resourcename": "test5", "description": "test5 description", "username": "user5", "password": "password5"},
            {"_id": 6, "resourcename": "test6", "description": "test6 description", "username": "user6", "password": "password6"}
        ];
        var l = resources.length;
        var sql = "INSERT OR REPLACE INTO mypassentry " +
            "(_id, resourcename, description, username, password) " +
            "VALUES (?, ?, ?, ?, ?)";
        var r;
        for (var i = 0; i < l; i++) {
            r = resources[i];
            tx.executeSql(sql, [r._id, r.resourcename, r.description, r.username, r.password],
                function () {
                    console.log('INSERT success');
                },
                function (tx, error) {
                    alert('INSERT error: ' + error.message);
                });
        }
    }

    var updateResource = function(tx, _id, resourceName, description, userName, password) {
        var sql = "UPDATE mypassentry SET resourcename = \'" + resourceName + 
                    "\', description = \'" + description + 
                    "\', username = \'" + userName + 
                    "\', password = \'" + password + 
                    "\'  WHERE _id = " + _id + ";";
        tx.executeSql(sql, null, 
            function () {
                console.log("UPDATE success");
            },
            function (tx, error) {
                alert("UPDATE error: " + error.message);
                console.log("UPDATE error: " + error.message);
            });
    }

    var deleteResource = function(tx, _id) {
        var sql = "DELETE FROM mypassentry WHERE _id = " + _id + ";";
        tx.executeSql(sql, null,
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
            "VALUES (\'"+resourceName+"\', \'"+description+"\', \'"+userName+"\', \'"+password+"\')";
        tx.executeSql(sql, null,
            function () {
                console.log('INSERT success');
            },
            function (tx, error) {
                alert('INSERT error: ' + error.message);
            });
    }

}