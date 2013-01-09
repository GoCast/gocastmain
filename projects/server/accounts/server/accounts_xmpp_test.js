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

var xmpp = require('./accounts_xmpp');

'use strict';

function xmppPrivateTest1() {
    console.log('Hello World.');

    console.log('1. Testing to see if rwolff is available.');
    xmpp.AccountAvailable('rwolff', function() {
        console.log('Available.');
    }, function() {
        console.log('Not available.');

        console.log('2. Testing to see if testaccount is available.');
        xmpp.AccountAvailable('testaccount', function() {
            console.log('Available.');

            console.log('3. Testing to see if rwolff@gocast.it is available.');
            xmpp.AccountAvailable('rwolff@gocast.it', function() {
                console.log('Available.');

                console.log('4. Adding abc@def.com.');
                xmpp.AddAccount('abc@def.com', 'abcPasswordHere', 'ABC DEF', function() {
                    console.log('Added.');

                    console.log('5. Testing to see if abc@def.com is available.');
                    xmpp.AccountAvailable('abc@def.com', function() {
                        console.log('Available.');
                    }, function() {
                        console.log('Not available.');
                    });
                }, function(err) {
                    console.log('Error adding: ' + err);
                });

            }, function() {
                console.log('Not available.');
            });
        }, function() {
            console.log('Not available.');
        });

    });

}

function xmppPrivateTest2() {
    console.log('Unlock abc@def.com and Create simple account name and enable it.');

    console.log('1. Unlock abc@def.com.');
    xmpp.EnableAccount('abc@def.com', function() {
        console.log('Enabled.');

        console.log('2. Create simple-named account.');
            xmpp.AddAccount('simplename', 'simplePassword', 'Mr. Simple Name', function() {
            console.log('Created account.');

            console.log('3. Enable simple account.');
            xmpp.EnableAccount('simplename', function() {
                console.log('Enabled.');

                console.log('4. Change password on simple account.');
                xmpp.ChangePassword('simplename', 'NewPasswordHere', function() {
                    console.log('Changed.');

                    console.log('5. Deleting abc@def.com');
                    xmpp.DeleteAccount('abc@def.com', function() {
                        console.log('Deleted.');
                    }, function() {
                        console.log('Could not delete.');
                    });
                }, function(err) {
                    console.log('Error changing password: ' + err);
                });

            }, function(err) {
                console.log('Error enabling: ' + err);
            });
        }, function(err) {
            console.log('Error adding account: ' + err);
        });

    }, function() {
        console.log('Enable failed.');
    });

}

xmppPrivateTest1();
//xmppPrivateTest2();

