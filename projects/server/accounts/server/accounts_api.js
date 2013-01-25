/**
 * accounts_api - The highest-level API for doing account validation management.
 *
 * The webserver node-listener and the room manager will both utilize this API level.
 *
 **/

/*jslint node: true, nomen: true, white: true */
/*global test, exec */

var settings;

try {
    settings = require('./settings');   // Our GoCast settings JS
} catch(e) {
    settings = require('../../settings');   // Look relative ... for developers on desktops.
}

if (!settings) {
    settings = {};
}
if (!settings.accounts) {
    settings.accounts = {};
}

var sys = require('util');
var evt = require('events');

var gcutil = require('./gcutil_node');

var eventManager = new evt.EventEmitter();
var argv = process.argv;

var Mailgun = require('mailgun').Mailgun;
var mg = new Mailgun(settings.accounts.mailgunKey);

var crypto = require('crypto');
var xmpp = require('./accounts_xmpp');
var db = require('./accounts_db');

'use strict';

function privateGenEmail(baseURL, email, name, actcode, extras, bInAppReg) {
    var body;

    if (name && name !== '') {
        body = 'Welcome, ' + name + ',';
    }
    else {
        body = 'Welcome';
    }

    body += ' to GoCast. Thanks for signing up. In order to complete your registration, ' +
            'we need your help in activating your new account.\n\n';

    // If we registered from inside the GoCast ... the message is a little different.
    if (bInAppReg) {
        body += 'Please activate your new account by going back to your GoCast page and entering the activation code found below.';
    }
    else {
        body += 'Please activate your new account by going back to the GoCast registration web page and entering the activation code found below.';
    }

    body += ' Alternatively, you can click on the link below.';

    body += '\n\nYour activation code is: ' + actcode.slice(-6).toUpperCase();
    body += '\n\nYour activation link is: ' + baseURL +
            '?defaultaction=activate&code=' + actcode.toUpperCase() +
            '&email=' + email.toLowerCase();

    // Throw in the Google Analytics if we were given any.
    if (extras) {
        if (extras.campaign_source) {
            body += '&campaign_source=' + encodeURI(extras.campaign_source);
        }
        if (extras.campaign_medium) {
            body += '&campaign_medium=' + encodeURI(extras.campaign_medium);
        }
        if (extras.campaign_name) {
            body += '&campaign_name=' + encodeURI(extras.campaign_name);
        }
    }

    body += '\n\n';
    body += 'Once you are validated, you can always come to your dashboard at: ' + baseURL.substring(0, baseURL.lastIndexOf('/') + 1);
    body += '\n\n';
    body += 'Thanks for signing up with GoCast - we hope you enjoy the service.\n\n';

    body += 'If you have changed your mind, you can unsubscribe below at any time.\n';

    body += 'Thanks!\nThe GoCast Team.\n';

    return body;
}

function privateMatchActivationCodes(actcode1, actcode2) {
    return true;
}

function privateSendEmail(toName, toEmail, body, cbSuccess, cbFailure) {
    mg.sendText(settings.accounts.inviteFromName + ' <' + settings.accounts.inviteFromAddress + '>',
        [toName + ' <' + toEmail + '>'],
      settings.accounts.inviteSubject,
      body,
      settings.accounts.inviteFromAddress, {},
      function(err) {
        if (err) {
            gcutil.log('Mail failed: ' + err);
            cbFailure(err);
        }
        else {
            gcutil.log('Success');
            cbSuccess();
        }
    });
}

function privateCalcActivationCode(email) {
    return crypto.createHash('md5').update('GoCast' + email).digest('hex');
}

function privateMatchActivationCodes(longCode, longOrShortCode) {
    if (longCode.length < 32) {
        throw 'privateMatchActivationCodes: ERROR: Bad longCode: ' + longCode;
    }

    if (longCode.toUpperCase() === longOrShortCode.toUpperCase()
        || longCode.slice(-6).toUpperCase() === longOrShortCode.toUpperCase()) {
        return true;
    }
    else {
        return false;
    }
}

function apiNewAccount(baseURL, email, password, name, firstRoomName, extras, success, failure, bInAppReg) {
    // Check if account with this email exists
    db.EntryExists(email, function() {
        failure('apiNewAccount: Failed - account already in use.');
    }, function() {
        // Doesn't exist, so add account
        xmpp.AddAccount(email, password, name, function() {
            // Added account, now generate activation code
            // Note - account is disabled upon creation until activation is complete.
            var actcode = privateCalcActivationCode(email),
                emailBody, obj;

            // Now, generate activation email
            emailBody = privateGenEmail(baseURL, email, name, actcode, extras, bInAppReg);

            if (extras) {
                obj = extras;   // Starting point.
            }
            else {
                obj = {};
            }

            obj.validationCode = actcode;
            obj.password = password;

            if (firstRoomName) {
                obj.firstRoomName = firstRoomName;
            }

            //Now, add pending-activation-db entry for this email
            db.AddEntry(email, obj, function() {
                //Now, send activation email
                privateSendEmail(name, email, emailBody, function() {
                    gcutil.log('Hurray. Another user signed up! I hope ' + email + ' comes back to activate their account.');
                    success();
                }, function(err) {
                    gcutil.log('apiNewAccount: Failed sending email to ' + email + '. Backing out activation entry and pending account. Error: ' + err);
                    db.DeleteEntry(email, function() {
                        // After deleting entry, still need to delete the xmpp account too.
                        xmpp.DeleteAccount(email, function() {
                            failure('apiNewAccount: Failed sending email. Removed pending account & validation entry.');
                        }, function() {
                            failure('apiNewAccount: Double-failure. Failed sending email & failed removing pending account for ' + email);
                        });
                    }, function() {
                        // Already failed email. Now we failed removing the validation db entry.
                        // Go ahead and try to remove the xmpp account to be as clean as possible here.
                        xmpp.DeleteAccount(email, function() {
                            failure('apiNewAccount: Double-failure. Failed sending email & failed removing activation entry for ' + email);
                        }, function() {
                            failure('apiNewAccount: Triple-failure. Failed sending email, removing activation entry, and failed removing pending account for ' + email);
                        });
                    });
                });
            }, function() {
                gcutil.log('apiNewAccount: Failed to Add validation entry in database. Removing pending account.');
                xmpp.DeleteAccount(email, function() {
                    failure('apiNewAccount: Failed to Add validation entry in database. Removed pending account.');
                }, function() {
                    failure('apiNewAccount: Double-failure. Failed to Add validation entry in database & failed removing pending account also.');
                });
            });
        }, function() {
            failure('apiNewAccount: Failed to add account to xmpp server.');
        });
    });
}

//
// @brief Figure out if this email address and activation code are 'good'.
//   This can happen a number of ways - some straight forward and others not so direct.
//   1. Find the email account, then match the code (long or short) with it. GOOD. Enable account.
//   2. Find the email account, then dont find the activation database entry - hmm...
//      Calculate the activation from the email - if it matches, then let the user know this
//      account has already been activated.
//
function apiValidateAccount(email, actcode, success, failure) {
    // If Account exists, match actcode with its corresponding db entry
    db.GetEntryByAccountName(email, function(entry) {
        // If entry comes back, it could be validated already.
        // Or it's ready to be validated.
        if (entry.validated) {
            // If we're already validated, then give a success but it's really a warning of sorts
            gcutil.log('apiValidateAccount: Activation already complete for ' + email);
            success('apiValidateAccount: Activation already completed.');
        }
        else if (entry.validationCode && true === privateMatchActivationCodes(entry.validationCode, actcode)) {
            // Correct activation code, so enable account
            xmpp.EnableAccount(email, function() {
                // Enable successful, delete db entry for email
                db.ActivateEntry(email, function() {
                    gcutil.log('Hurray! Activation complete for ' + email);
                    success();
                }, function(err) {
                    gcutil.log('apiValidateAccount: WARNING - Could not activate entry for ' + email);
                    gcutil.log('Hurray! Activation complete for ' + email);
                    success();
                });
            }, failure);
        } else {
            // Incorrect activation code
            failure('apiValidateAccount: Incorrect activation code for ' + email);
        }
    }, function(err) {
        // Failure of getting database entry for account.
        failure('apiValidateAccount: Incorrect activation code for ' + email + ', account does not exist.');
    });
}

function apiDeleteAccount(email, success, failure) {
    // Check if account with this email exists
    xmpp.AccountAvailable(email, function() {
        // Account doesn't exist, so fail
        failure('apiDeleteAccount: Account doesn\'t exist');
    }, function() {
        // Account exists, so delete it
        xmpp.DeleteAccount(email, function() {
            db.DeleteEntry(email, success, failure);
        }, function() {
            // If the xmpp account deletion failed, try to delete on the db side.
            // But note - regardless of db deletion success, this is still a
            // failure, so both success and failure call the failure callback.
            db.DeleteEntry(email, failure, failure);
        });
    });

}

function apiChangePassword(email, newpassword, success, failure) {
    xmpp.ChangePassword(email, newpassword, function() {
        db.UpdateEntry(email, {password: newpassword}, success, failure);
    }, function() {
        // If the xmpp change failed, try to change on the db side.
        // But note - regardless of db change success, this is still a
        // failure, so both success and failure call the failure callback.
        db.UpdateEntry(email, {password: newpassword}, success, failure);
    });
}

function apiNewRoom(email, roomName, success, failure) {
    db.CreateRoom(email, roomName, success, failure);
}

function apiListRooms(email, success, failure) {
    db.ListRooms(email, success, failure);
}

function apiVisitorSeen(email, nickName, success, failure) {
    db.VisitorSeen(email, nickName, success, failure);
}

/* Manjesh -- These both work (separately of course)
apiNewAccount('http://dev.gocast.it/baseURL.html', 'rwolff@gocast.it', 'rwolff', 'Bob Wolff', function() {
    gcutil.log('TEST: SUCCESS');
}, function(err) {
    gcutil.log('TEST: FAILURE: ', err);
});
*/
/*
apiValidateAccount('rwolff@gocast.it', '85e25a1fea7b001911f791f13180f252', function() {
    gcutil.log('TEST-Validate: SUCCESS.');
}, function(err) {
    gcutil.log('TEST-Validate: FAILED: ' + err);
});
*/

exports.NewAccount = apiNewAccount;
exports.ValidateAccount = apiValidateAccount;
exports.DeleteAccount = apiDeleteAccount;
exports.ChangePassword = apiChangePassword;
exports.NewRoom = apiNewRoom;
exports.ListRooms = apiListRooms;
exports.VisitorSeen = apiVisitorSeen;
