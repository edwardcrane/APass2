var LoginService = function () {

     var loggedInUser;

    this.init = function () {
        var deferred = $.Deferred();

        if(device.platform === 'browser') {
            console.log("LoginService running on platform "+ device.platform + ", using WebSQL");
            this.db = window.openDatabase("LoginDB", "1.0", "Login DB", 20000);
        } else {
            console.log("LoginService running on platform " + device.platform + ", using SQLitePlugin");
            this.db = sqlitePlugin.openDatabase({name: "Login.db", location: 2});            
        }

        this.db.transaction(
            function (tx) {
                createLoginTable(tx)
                // createMyPassTable(tx);
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

    var createLoginTable = function(tx) {
        // tx.executeSQL('DROP TABLE IF EXISTS mypassentry');
        var sql = "CREATE TABLE IF NOT EXISTS login ( " +
            "_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "username TEXT, " +
            "password TEXT, " +
            "password_hint TEXT, " +
            "email TEXT, " +
            "remembered_last_user INTEGER )"
        tx.executeSql(sql, null,
            function () {
                console.log("Create login table succeeded.");
            },
            function (tx, error) {
                alert('Create login table error: ' + error.message);
            }
        );
    }

    this.getAllLogins = function() {
        var deferred = $.Deferred();

        this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM login";
                tx.executeSql(sql, null, function(tx, results) {
                    var len = results.rows.length,
                    logins = [],
                    i = 0;
                    for(i = 0; i < len; i++) {
                        logins[i] = results.rows.item(i);
                    }
                    deferred.resolve(logins);
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.createLogin = function(username, password, password_hint, email) {
        var deferred = $.Deferred();

        this.db.transaction(
            function(tx) {
                var sql = "INSERT OR REPLACE INTO login " +
                    "(username, password, password_hint, email) " +
                    "VALUES (\'" +  username        + "\', \'" + 
                                    password        + "\', \'" + 
                                    password_hint   + "\', \'" + 
                                    email           + "\')";
                tx.executeSql(sql, null, function(tx, results) {
                        deferred.resolve();  // resolve what?
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.updateLogin = function(oldUsername, newUsername, newPassword, newPasswordHint, newEmail, newRememberMe ) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                var sql = "UPDATE login SET username = \'" + newUsername +
                            "\', password =\'" + newPassword +
                            "\', password_hint = \'" + newPasswordHint +
                            "\', email = \'" + newEmail +
                            "\', remembered_last_user = " + newRememberMe + ";";
                tx.executeSql(sql, null, function(tx, results) {
                        deferred.resolve();  // resolve what?
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.setLoggedInUser = function(newUser) {
        loggedInUser = newUser;
    }

    this.getLoggedInUser = function() {
        return loggedInUser;
    }

    this.changeUsername = function(oldUsername, newUsername ) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                var sql = "UPDATE login SET username = \'" + newUsername + "\'"
                            " WHERE username = \'" + oldUsername + "\';";
                tx.executeSql(sql, null, function(tx, results) {
                    deferred.resolve();  // resolve what?
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );

        if(loggedInUser === oldUsername) {
            loggedInUser = newUsername;
        };

        return deferred.promise();
    }

    this.changePassword = function(username, newPassword ) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                var sql = "UPDATE login SET password = \'" + newPassword + "\'"
                            " WHERE username = \'" + username + "\';";
                tx.executeSql(sql, null, function(tx, results) {
                        deferred.resolve();  // resolve what?
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.changePasswordHint = function(username, newPasswordHint ) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                var sql = "UPDATE login SET password_hint = \'" + newPasswordHint + "\'"
                            " WHERE username = \'" + username + "\';";
                tx.executeSql(sql, null, function(tx, results) {
                        deferred.resolve();  // resolve what?
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.changeEmail = function(username, newEmail ) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                var sql = "UPDATE login SET email = \'" + newEmail + "\'"
                            " WHERE username = \'" + username + "\';";
                tx.executeSql(sql, null, function(tx, results) {
                        deferred.resolve();  // resolve what?
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.changeRememberLastUser = function(username, newRememberMe ) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                var sql = "UPDATE login SET remembered_last_user = " + newRememberMe +
                            " WHERE username = \'" + username + "\';";
                tx.executeSql(sql, null, function(tx, results) {
                        deferred.resolve();  // resolve what?
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.getRememberedLastUser = function() {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                var sql = "SELECT username from login WHERE remembered_last_user = 1;";
                tx.executeSql(sql, null, function(tx, results){
                    deferred.resolve(results.rows.length === 1 ? results.rows.item(0).username : null);
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    };

    this.getEmail = function(username) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                var sql = "SELECT email from login WHERE username = \'" + username + "\';";
                tx.executeSql(sql, null, function(tx, results){
                    deferred.resolve(results.rows.length === 1 ? results.rows.item(0).email : null);
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    };

    this.getPassword = function(username) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                var sql = "SELECT password from login WHERE username = \'" + username + "\';";
                tx.executeSql(sql, null, function(tx, results){
                    deferred.resolve(results.rows.length === 1 ? (results.rows.item(0).password) : null);
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    };

    this.getPasswordHint = function(username) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                var sql = "SELECT password_hint from login WHERE username = \'" + username + "\';";
                tx.executeSql(sql, null, function(tx, results){
                    deferred.resolve(results.rows.length === 1 ? results.rows.item(0).password_hint : null);
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    };

    this.deleteLogin = function( username ) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                var sql = "DELETE FROM login WHERE username = \'" + username + "\';";
                tx.executeSql(sql, null, function(tx, results) {
                        deferred.resolve();  // resolve what?
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.isExistingUsername = function(username) {
        var deferred = $.Deferred();
        this.db.transaction(
            function(tx) {
                var sql = "SELECT username from login WHERE username = \'" + username + "\';";
                tx.executeSql(sql, null, function(tx, results){
                    deferred.resolve(results.rows.length === 1 ? true : false);
                });
            },
            function(error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    };

    this.isValidEmail = function(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(email && email != '') {
            return re.test(email);
        }
        return false;
    }

    this.isValidPassword = function(password) {
        if(password && password != '') {
            return true;
        }
        return false;
    }

    this.isValidUsername = function(username) {
        if(username && username != '') {
            return true;
        }
        return false;
    }


}