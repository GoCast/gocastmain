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

dbPrivateTest1();


