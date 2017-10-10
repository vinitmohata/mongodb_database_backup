var MongoClient = require('mongodb').MongoClient;
var backup = require('mongodb-backup');
var async = require('async');

// Connection url
var url = 'mongodb://localhost:27017';  // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>/<dbdatabase>
// Connect using MongoClient
MongoClient.connect(url, function (err, db) {
    var dbList = [];
    // Use the admin database for the operation
    var adminDb = db.admin();
    // List all the available databases
    adminDb.listDatabases(function (err, result) {
        dbList = result.databases;
        async.eachSeries(result.databases, function (database, callback) {
            backup({
                uri: url + '/' + database.name, // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>/<dbdatabase>
                root: __dirname + '/databases/',
                callback: function (err) {
                    if (err) {
                        console.error(err);
                        callback()
                    } else {
                        console.log('Backup Done for ' + database.name);
                        callback();
                    }
                }
            });
        }, function (error) {
            if (error) {
                console.error(err);
            } else {
                db.close();
            }
        });
    });
});



