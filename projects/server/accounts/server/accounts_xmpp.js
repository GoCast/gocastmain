/**
 * accounts_xmpp - Database API for account management on the XMPP server
 *
 * Assumes the existence of a plugin on the openfire server which enables
 * account management - add, delete, enable, disable, and edit.
 *
 **/

/*jslint node: true, nomen: true, white: true */
/*global test, exec */

var settings = require('./settings');   // Our GoCast settings JS
if (!settings) {
    settings = {};
}
if (!settings.accounts) {
    settings.accounts = {};
}

var http = require('http-get');
var sys = require('util');
var evt = require('events');
var ltx = require('ltx');

var eventManager = new evt.EventEmitter();
var argv = process.argv;

var xmppBase = settings.accounts.xmppAccountServerBase + 'secret=' + settings.accounts.xmppAccountServerSecret;

'use strict';

//
// All APIs will convert account names into escaped account names.
// This process is intended primarily to allow email addresses to be
// used as account names by converting the '@' into an escaped character
// which is otherwise illegal.
//
// For our purposes, we'll give a try at making '~' an illegal account
// name character as this is not often found in email addresses. It is,
// strictly speaking, legal and so it is possible for us to wind up with
// some oddball email address coming to us which we would call illegal
// but is actually legal.
function xmppPrivateEscapeEmail(input) {
    if (input.match(/~/)) {
        return null;
    }
    else {
        return encodeURI(input.replace('@', '~'));
    }
}

function xmppPrivateSendCommand(args, cbSuccess, cbFailure) {
    var formulate = xmppBase,
        res;

    if (!cbSuccess || !cbFailure) {
        throw 'Bad call to function xmppAddAccount';
    }

    if (args.charAt(0) !== '&') {
        formulate += '&' + args;
    }
    else {
        formulate += args;
    }

//    console.log('About to send a GET for: ' + formulate);

    http.get({url: formulate, bufferType: 'buffer'}, function(error, result) {
        if (error) {
            sys.puts('HTTP-GET Error: ' + error);
            cbFailure(error);
        } else {
//            console.log(result.buffer.toString());
            res = new ltx.parse(result.buffer);

            if (res.name.toLowerCase() === 'result') {
//                console.log('All ok.');
                cbSuccess(result.buffer.toString());
            }
            else {
                if (res.name !== 'error') {
                    throw 'Bad response altogether. No error back.';
                }
                else {
//                    console.log('Error type was: ' + res.getText());
                    cbFailure(res.getText());
                }
            }
        //        oEmbedObject = JSON.parse(result.buffer.toString());
        }
    });
}

//
// @brief Check to see if the account exists or not.
// @arg accountName - Non-escaped account name.
//
// @returns - true or false when valid input is given.
//            But will throw and exception if input is illegal.
//
function xmppAccountAvailable(accountName, cbSuccess, cbFailure) {
    var em = xmppPrivateEscapeEmail(accountName);
    if (!em) {
        throw 'Invalid account Name: ' + accountName;
    }

    if (!cbSuccess || !cbFailure) {
        throw 'Bad call to function xmppAccountAvailable';
    }

    // Check to see if the account exists by calling 'Update' with the name
    // If the update fails, then the account is available.
    // If it succeeds, then we know the account is already used. Unavailable.
    try {
        xmppPrivateSendCommand('type=update&username=' + em, function() {
            console.log('xmppAccountAvailable: Not Available: Already in use for: ' + em);
            cbFailure();
        }, function(err) {
            console.log('xmppAccountAvailable: Account available: ' + em);
            cbSuccess();
        });
    } catch(e) {
        console.log('Bad situation with account manager for XMPP server plugin.');
    }
}

//
// @brief When we add accounts, we add them in the disabled state by rule.
//        This implies that after a successful add, we must disable the account.
//        Note: There is some possibility that an account could get added but the
//              disable fails. This would leave us in a bad state. Call it an error for now.
//
function xmppAddAccount(accountName, password, name, cbSuccess, cbFailure) {
    var em = xmppPrivateEscapeEmail(accountName);
    if (!em) {
        throw 'Invalid account Name: ' + accountName;
    }

    if (!cbSuccess || !cbFailure) {
        throw 'Bad call to function xmppAddAccount';
    }

    // Check to see if the account exists by calling 'Update' with the name
    // If the update fails, then the account is available.
    // If it succeeds, then we know the account is already used. Unavailable.
    try {
        xmppPrivateSendCommand('type=add&username=' + em + '&password=' + encodeURI(password) + '&name=' + encodeURI(name), function() {
            console.log('xmppAddAccount: Bare-Add Complete: ' + em);
            xmppPrivateSendCommand('type=disable&username=' + em, function() {
                console.log('xmppAddAccount: Account-Disable Successful for: ' + em);
                cbSuccess();
            }, function(err) {
                console.log('xmppAddAccount: Failed to disable. Calling it a failure and asking for a deletion.');
                xmppPrivateSendCommand('type=delete&username=' + em, function() {
                    // Either way it's a failure due to the odd non-disable situation.
                    cbFailure(err);
                }, function() {
                    // Either way it's a failure due to the odd non-disable situation.
                    cbFailure(err);
                });
            });
        }, function(err) {
            console.log('xmppAddAccount: Failed for: ' + em + ' with error: ' + err);
            cbFailure(err);
        });
    } catch(e) {
        console.log('Bad situation with account manager for XMPP server plugin.');
    }
}

function xmppEnableAccount(accountName, cbSuccess, cbFailure) {
    var em = xmppPrivateEscapeEmail(accountName);
    if (!em) {
        throw 'Invalid account Name: ' + accountName;
    }

    if (!cbSuccess || !cbFailure) {
        throw 'Bad call to function xmppEnableAccount';
    }

    // Check to see if the account exists by calling 'Update' with the name
    // If the update fails, then the account is available.
    // If it succeeds, then we know the account is already used. Unavailable.
    try {
        xmppPrivateSendCommand('type=enable&username=' + em, function() {
            console.log('xmppEnableAccount: Complete: ' + em);
            cbSuccess();
        }, function(err) {
            console.log('xmppEnableAccount: Failed for: ' + em + ' with error: ' + err);
            cbFailure(err);
        });
    } catch(e) {
        console.log('Bad situation with account manager for XMPP server plugin.');
    }
}

function xmppDeleteAccount(accountName, cbSuccess, cbFailure) {
    var em = xmppPrivateEscapeEmail(accountName);
    if (!em) {
        throw 'Invalid account Name: ' + accountName;
    }

    if (!cbSuccess || !cbFailure) {
        throw 'Bad call to function xmppDeleteAccount';
    }

    // Check to see if the account exists by calling 'Update' with the name
    // If the update fails, then the account is available.
    // If it succeeds, then we know the account is already used. Unavailable.
    try {
        xmppPrivateSendCommand('type=delete&username=' + em, function() {
            console.log('xmppDeleteAccount: Complete: ' + em);
            cbSuccess();
        }, function(err) {
            console.log('xmppDeleteAccount: Failed for: ' + em + ' with error: ' + err);
            cbFailure(err);
        });
    } catch(e) {
        console.log('Bad situation with account manager for XMPP server plugin.');
    }
}

function xmppChangePassword(accountName, newPassword, cbSuccess, cbFailure) {
    var em = xmppPrivateEscapeEmail(accountName);
    if (!em) {
        throw 'Invalid account Name: ' + accountName;
    }

    if (!cbSuccess || !cbFailure) {
        throw 'Bad call to function xmppChangePassword';
    }

    // Check to see if the account exists by calling 'Update' with the name
    // If the update fails, then the account is available.
    // If it succeeds, then we know the account is already used. Unavailable.
    try {
        xmppPrivateSendCommand('type=update&username=' + em + '&password=' + encodeURI(newPassword), function() {
            console.log('xmppChangePassword: Complete: ' + em);
            cbSuccess();
        }, function(err) {
            console.log('xmppChangePassword: Failed for: ' + em + ' with error: ' + err);
            cbFailure(err);
        });
    } catch(e) {
        console.log('Bad situation with account manager for XMPP server plugin.');
    }
}

function xmppPrivateTest() {
    console.log('Hello World.');

    console.log('1. Testing to see if rwolff is available.');
    xmppAccountAvailable('rwolff', function() {
        console.log('Available.');
    }, function() {
        console.log('Not available.');

        console.log('2. Testing to see if testaccount is available.');
        xmppAccountAvailable('testaccount', function() {
            console.log('Available.');

            console.log('3. Testing to see if rwolff@gocast.it is available.');
            xmppAccountAvailable('rwolff@gocast.it', function() {
                console.log('Available.');

                console.log('4. Adding abc@def.com.');
                xmppAddAccount('abc@def.com', 'abcPasswordHere', 'ABC DEF', function() {
                    console.log('Added.');

                    console.log('5. Testing to see if abc@def.com is available.');
                    xmppAccountAvailable('abc@def.com', function() {
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

xmppPrivateTest();

exports.AccountAvailable = xmppAccountAvailable;
exports.AddAccount = xmppAddAccount;
exports.DeleteAccount = xmppDeleteAccount;
exports.ChangePassword = xmppChangePassword;
