/**
 * accounts_xmpp - Database API for account management on the XMPP server
 *
 * Assumes the existence of a plugin on the openfire server which enables
 * account management - add, delete, enable, disable, and edit.
 *
 **/

/*jslint node: true, nomen: true, white: true */
/*global test, exec */

var sys = require('util');

var db = require('./accounts_db');
var flow = require('flow');

'use strict';

var account = 'testitem_' + new Date().getTime();

function dbPrivateTest1() {
    console.log('DynamoDB Activation table test.');

    console.log('1. Create an entry for ' + account);
    db.AddEntry(account, 'ValidationCodeHere', function(data) {
        console.log('Created: ', data);

        console.log('2. Find an unknown entry.');
        db.GetEntryByAccountName('UnknownAccountName', function(data) {
                console.log('Found - that is a problem.');
            }, function(err) {
                console.log('Not found. Good - that was expected.');

                console.log('3. Retrieve our prior created entry of: ' + account);
                db.GetEntryByAccountName(account, function(data) {
                    if (data.Item) {
                        console.log('Found it: ', data);
                    }
                    else {
                        console.log('Didnt find our prior created entry. ERROR.');
                        process.exit(-1);
                    }

                    console.log('4. Delete our prior created entry.');
                    db.DeleteEntry(account, function(data) {
                        console.log('Deletion successful: ', data);

                        console.log('5. Delete non-existent entry.');
                        db.DeleteEntry(account+'junk', function(data) {
                            console.log('Deletion successful: This is a problem: ', data);
                        }, function(err) {
                            console.log('Error deleting: ', err);
                        });
                    }, function(err) {
                        console.log('Error deleting: ', err);
                    });
                }, function(err) {
                    console.log('Could not find our prior creation of: ' + account + ':', err);
                });
        });
    }, function(err) {
        console.log('Create failed: ', err);
    });

}

//dbPrivateTest1();


function db2Test1() {
    console.log('DynamoDB Activation table test.');

    account = 'bobtestaccount@gmail.com';

    console.log('1. Create an entry for ' + account);
    db.AddEntry(account, {validated: '0', firstRoomToCreate: 'roomName1'}, function(data) {
        console.log('Created: ', data);
    }, function(err) {
        console.log('Create failed: ', err);
    });

}

function db2Test2() {
    console.log('DynamoDB Activation table test.');

    account = 'bobtestaccount@gmail.com';

    console.log('1. Update an entry for ' + account);
    db.UpdateEntry(account, {validated: new Date().toString(), columnAddition: 'Stuff Goes Here'}, function(data) {
        console.log('Updated: ', data);
    }, function(err) {
        console.log('Update failed: ', err);
    });

}

function db2Test3() {
    console.log('DynamoDB Activation table test.');

    account = 'bobtestaccount@gmail.com';

    console.log('1. Read entry for ' + account);
    db.GetEntryByAccountName(account, function(data) {
        console.log('Read: ', data);

        console.log('2. Check validation of entry ' + account);
        db.IsEntryValidated(account, function() {
            console.log('PASS: Is Validated: ' + account);

            account = 'nonvalidated@gmail.com';
            console.log('3. Validated entry for ' + account);
            db.IsEntryValidated(account, function() {
                console.log('FAIL: Is Validated: ' + account);
            }, function() {
                console.log('PASS: Was not validated: ' + account);

                account = 'invalidaccount@gmail.com';
                console.log('4. Validated entry for ' + account);
                db.IsEntryValidated(account, function() {
                    console.log('FAIL: Is Validated: ' + account);
                }, function() {
                    console.log('PASS: Was not validated: ' + account);

                    account = 'invalidaccount@gmail.com';
                    console.log('5. Account exists? for ' + account);
                    db.EntryExists(account, function() {
                        console.log('FAIL: Exists: ' + account);
                    }, function() {
                        console.log('PASS: Does not exist: ' + account);

                        account = 'nonvalidated@gmail.com';
                        console.log('6. Account exists? for ' + account);
                        db.EntryExists(account, function() {
                            console.log('PASS: Exists: ' + account);
                        }, function() {
                            console.log('FAIL: Does not exist: ' + account);
                        });
                    });
                });
            });
        }, function() {
            console.log('Was not validated: ' + account);
        });
    }, function(err) {
        console.log('Read failed: ', err);
    });

}

function dbRoomTest1() {
    var room, account;

    console.log('DynamoDB Room table test.');

    account = 'bobtestaccount@gmail.com';
    room = 'room1';

    console.log('1. Create a room entry for ' + account + ' of name: ' + room);
    db.CreateRoom(account, room, function(data) {
        console.log('PASS: Created-data: ', data);

        room = 'room2';
        console.log('2. Create a room entry for ' + account + ' of name: ' + room);
        db.CreateRoom(account, room, function(data) {
            console.log('PASS: Created-data: ', data);

            account = 'abc@def.com';
            room = 'room2';
            console.log('3. Create a room entry for ' + account + ' of name: ' + room);
            db.CreateRoom(account, room, function(data) {
                console.log('PASS: Created-data: ', data);

                account = 'bobtestaccount@gmail.com';
                console.log('4. List rooms for ' + account);
                db.ListRooms(account, function(obj, data) {
                    console.log('PASS: List-data: ', data);
                    console.log('PASS: List-obj: ', obj);
                }, function(err) {
                    console.log('Create failed: ', err);
                });
            }, function(err) {
                console.log('Create failed: ', err);
            });
        }, function(err) {
            console.log('Create failed: ', err);
        });

    }, function(err) {
        console.log('Create failed: ', err);
    });

}

function dbRoomTest2() {
    var room, account;

    console.log('DynamoDB Room table test.');

    account = 'in_n_out@gmail.com';
    room = 'room1';

    console.log('1. Create a room entry for ' + account + ' of name: ' + room);
    db.CreateRoom(account, room, function(data) {
        console.log('PASS: Created-data: ', data);

        console.log('2. Delete a room entry for ' + account + ' of name: ' + room);
        db.DeleteRoom(account, room, function(data) {
            console.log('PASS: Delete-data: ', data);

            room = 'junk';
            console.log('3. Delete a non-existent room entry for ' + account + ' of name: ' + room);
            db.DeleteRoom(account, room, function(data) {
                console.log('FAIL: Created-data: ', data);

            }, function(err) {
                console.log('PASS: Delete failed: ', err);

                room = null;
                console.log('4. Delete all room entries? for ' + account);
                db.DeleteRoom(account, room, function(data) {
                    console.log('FAIL: Created-data: ', data);

                }, function(err) {
                    console.log('PASS: Delete failed: ', err);
                });
            });
        }, function(err) {
            console.log('Delete failed: ', err);
        });

    }, function(err) {
        console.log('Create failed: ', err);
    });

}

function dbRoomTest3() {
    var room, account;

    console.log('DynamoDB Room table test.');

    account = 'bobtestaccount@gmail.com';
    room = '';

    console.log('1. List rooms entry for ' + account );
    db.ListRooms(account, function(data) {
        console.log('PASS: List-data: ', data);

        account = 'abc@def.com';

        console.log('2. List rooms for ' + account);
        db.ListRooms(account, function(data) {
            console.log('PASS: List-data: ', data);

            account = 'junk@wonderland.com';
            console.log('3. List rooms for ' + account);
            db.ListRooms(account, function(data) {
                console.log('FAIL: List-data: ', data);

            }, function(err) {
                console.log('PASS: List failed: ', err);
            });
        }, function(err) {
            console.log('List failed: ', err);
        });

    }, function(err) {
        console.log('List failed: ', err);
    });

}

function dbVisitorTest1() {
    var name, account;

    console.log('DynamoDB Visitor table test.');

    account = 'visitor1@gmail.com';
    name = 'nick1';

    console.log('1. New visitor ' + account );
    db.VisitorSeen(account, name, function(data) {
        console.log('PASS: Visitor-data: ', data);

        account = 'anothervisitor@gocast.it';
        name = 'whatever';

        console.log('2. Another new entry ' + account);
        db.VisitorSeen(account, name, function(data) {
            console.log('PASS: Visitor-data: ', data);

            account = 'visitor1@gmail.com';
            name = 'second-nickname';

            console.log('3. Seen twice ' + account);
            db.VisitorSeen(account, name, function(data) {
                console.log('PASS: Visitor-data: ', data);

            }, function(err) {
                console.log('FAIL: List failed: ', err);
            });
        }, function(err) {
            console.log('Seen failed: ', err);
        });

    }, function(err) {
        console.log('Seen failed: ', err);
    });

}

function reportTest1() {
    var today = new Date(), yesterday;

    console.log('DynamoDB Activation report test.');

    console.log('Today is: ', today.toString(), ', #ms: ', today.getTime());
    yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0);    // Rewind to the beginning to the day local time.
    console.log('Today is: ', yesterday.toString(), ', #ms: ', yesterday.getTime());

//    account = 'bobtestaccount@gmail.com';

    console.log('2. Scan');
    db.ValidationReport(yesterday.getTime(), function(data) {
        console.log('Results: ', data);
    }, function(err) {
        console.log('Scan failed: ', err);
    });

}

function dbAssociatedTest1() {
    var email = 'few@gocast.it';

    console.log('Starting dbAssociatedTest1.');

    flow.exec(
        function() {
            db.GetAssociatedRooms(email, this, function(err) {
                console.log('dbAssociatedTest1: ERROR: ', err);
                throw '1';
            });
        },  function(obj) {
            console.log('dbAssociatedTest1: For: ' + email + ' got: ', obj);

            email = 'many@gocast.it';

            db.GetAssociatedRooms(email, this, function(err) {
                console.log('dbAssociatedTest1: ERROR: ', err);
                throw '2';
            });
        },  function(obj) {
            console.log('dbAssociatedTest1: For: ' + email + ' got: ', obj);

            console.log('All complete.');
        }
    );
}

function dbAssociatedTest2() {
    var email = 'new@account.com';

    flow.exec(
        function() {
            db.AddAssociatedRoom(email, 'newroom', 'recent', this, this);
        },
        function(arg) {
            console.log('1-Answer - ', arg);

            email = 'junk@junk.com';
            db.DeleteAssociatedRoom(email, 'junkroom', this, this);
        },
        function(arg) {
            console.log('2-Answer - ', arg);

        }
    );
}

//db2Test1();
//db2Test2();
//db2Test3();
//dbRoomTest1();
//dbRoomTest2();
//dbRoomTest3();
//dbVisitorTest1();
//reportTest1();
dbAssociatedTest1();
//dbAssociatedTest2();
