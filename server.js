var MongoClient = require('mongodb').MongoClient;
var backup = require('mongodb-backup');
var restore = require('mongodb-restore');
var async = require('async');
var cronJob = require('cron').CronJob;
var express = require('express');
var app = express();

// Connection url
var url = 'mongodb://localhost:27017';  // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>
// Connect using MongoClient
var start_backup = function () {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.error(err)
            return;
        }
        else {
            var dbList = [];
            // Use the admin database for the operation
            var adminDb = db.admin();
            // List all the available databases
            adminDb.listDatabases(function (err, result) {
                dbList = result.databases;
                console.log('Total Databases count is ' + dbList + ' on ' + url);
                async.eachSeries(result.databases, function (database, callback) {
                    backup({
                        uri: url + '/' + database.name,
                        root: __dirname + '/databases/',
                        callback: function (err) {
                            if (err) {
                                console.error('error occured for ' + database.name);
                                console.error(err);
                                callback(err);
                            } else {
                                console.log('Backup done for ' + database.name + 'at ' + new Date());
                                callback();
                            }
                        }
                    });
                }, function (error) {
                    if (error) {
                        console.error(err);
                    } else {
                        console.log('Backup automated process completed');
                        // if (dbList.length > 0) {
                        //     restoredb(dbList, function (error) {
                        //         if (error) {
                        //             console.error(error);
                        //         } else {
                        //             console.log('Restore automated process completed');
                        //             db.close();
                        //         }
                        //     })
                        // } else {
                        //     db.close();
                        // }
                        
                        //Uncomment above part if you want to restore database to other server
                        db.close();  // comment this if you uncooment the above code of restore backup
                    }
                });
            });
        }
    });
}

var restoredb = function (dbs, cb) {
    var backupUrl = 'mongodb://localhost:27017';  // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>
    async.eachSeries(dbs, function (database, callback) {
        restore({
            uri: backupUrl + '/' + database.name,
            root: __dirname + '/databases/',
            callback: function (err) {
                if (err) {
                    console.error('error occured for ' + database.name);
                    console.error(err);
                    callback(err)
                } else {
                    console.log('Restore done for ' + database.name + 'at ' + new Date());
                    callback();
                }
            }
        });
    }, function (error) {
        if (error) {
            cb(error);
        } else {
            cb();
        }
    });
}

var job12pm = new cronJob({
    cronTime: '00 00 12 * * 1-7',
    onTick: function () {
        // Runs everyday
        // at exactly 12:00:00 PM.
        start_backup();
    },
    start: true,
    timeZone: "Asia/Kolkata"
});

job12pm.start();

app.listen(3000);
console.log("Server is running at Port 3000");