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

var eventManager = new evt.EventEmitter();
var argv = process.argv;

var Mailgun = require('mailgun').Mailgun;
var mg = new Mailgun(settings.accounts.mailgunKey);

var crypto = require('crypto');
var xmpp = require('./accounts_xmpp');
var db = require('./accounts_db');

'use strict';

function privateGenEmail(baseURL, email, actcode, bInAppReg) {
    var body;
    console.log('privateGenEmail: Generating activation email [email = ' +
                email + ', actcode = ' + actcode + ']');

    body = 'Welcome to the GoCast network.\n\n';

    // If we registered from inside the GoCast ... the message is a little different.
    if (bInAppReg) {
        body += 'Please activate your new account by going back to your GoCast page and entering the activation code found below.';
    }
    else {
        body += 'Please activate your new account by going back to the GoCast registration web page and entering the activation code found below.';
    }

    body += '\n\nAlternatively, you can click on the link below.';

    body += 'Your activation code is: ' + actcode.slice(-6).toUpperCase();
    body += '\n\nOr your activation link is: ' + baseURL + '?defaultaction=activate&code=' + actcode.toUpperCase();

    body += '\n\n';
    body += 'Thanks for signing up with GoCast - we hope you enjoy the service.\n\n';

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
            console.log('Mail failed: ' + err);
            cbFailure(err);
        }
        else {
            console.log('Success');
            cbSuccess();
        }
    });
}

function privateCalcActivationCode(email) {
    return crypto.createHash('md5').update('GoCast' + email).digest('hex');
}

function apiNewAccount(baseURL, email, password, name, success, failure, bInAppReg) {
    // Check if account with this email exists
    xmpp.AccountAvailable(email, function() {
        // Doesn't exist, so add account
        xmpp.AddAccount(email, password, name, function() {
            // Added account, now generate activation code
            // Note - account is disabled upon creation until activation is complete.
            var actcode = privateCalcActivationCode(email),
                emailBody;

            // Now, generate activation email
            emailBody = privateGenEmail(baseURL, email, actcode, bInAppReg);

            //Now, add pending-activation-db entry for this email
            db.AddEntry(email, actcode, function() {
                //Now, send activation email
                privateSendEmail(name, email, emailBody, function() {
                    console.log('Hurray. Another user signed up! I hope ' + email + ' comes back to activate their account.');
                    success();
                }, function(err) {
                    console.log('apiNewAccount: Failed sending email to ' + email + '. Backing out activation entry and pending account. Error: ' + err);
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
                console.log('apiNewAccount: Failed to Add validation entry in database. Removing pending account.');
                xmpp.DeleteAccount(email, function() {
                    failure('apiNewAccount: Failed to Add validation entry in database. Removed pending account.');
                }, function() {
                    failure('apiNewAccount: Double-failure. Failed to Add validation entry in database & failed removing pending account also.');
                });
            });
        }, function() {
            failure('apiNewAccount: Failed to add account to xmpp server.');
        });
    }, function() {
        failure('apiNewAccount: Failed - account already in use.');
    });
}

function apiValidateAccount(email, actcode, success, failure) {
    // Check if account with this email exists
    xmpp.AccountAvailable(email, function() {
        // Account doesn't exist, so bad actcode
        failure('apiValidateAccount: Bad activation code. No account found for: ' + email);
    }, function() {
        var entry;
        // Account exists, so match actcode with its corresponding db entry
        db.GetEntryByAccountName(email, function(data) {
            if (data.Item) {
                entry = data.Item;
                if (true === privateMatchActivationCodes(entry.activationCode.S, actcode)) {
                    // Correct activation code, so enable account
                    xmpp.EnableAccount(email, function() {
                        // Enable successful, delete db entry for email
                        db.dbDeleteEntry(email);
                        success();
                    }, failure);
                } else {
                    // Incorrect activation code
                    failure('apiValidateAccount: Incorrect activation code for ' + email);
                }
            } else {
                // No such entry, bad/expired code, delete xmpp account
                xmpp.xmppDeleteAccount(email, function() {
                    failure('apiValidateAccout: Bad/expired activation code for ' + email);
                }, failure);
            }
        }, function(err) {
            // Failure of getting database entry for account.
            failure('apiValidateAccout: Failed to get database entry for validation.');
        });
    });
}

function apiDeleteAccount(email, success, failure) {
    // Check if account with this email exists
    xmpp.xmppAccountAvailable(email, function() {
        // Account doesn't exist, so fail
        failure('apiDeleteAccount: Account doesn\'t exist');
    }, function() {
        // Account exists, so delete it
        xmpp.xmppDeleteAccount(email, success, failure);
    });
}

function apiChangePassword(email, newpassword, success, failure) {
    xmpp.xmppChangePassword(email, newpassword, success, failure);
}

/* Manjesh -- This worked for me...No validation yet but got through this part.
apiNewAccount('http://dev.gocast.it/baseURL.html', 'rwolff@gocast.it', 'rwolff', 'Bob Wolff', function() {
    console.log('TEST: SUCCESS');
}, function(err) {
    console.log('TEST: FAILURE: ', err);
});
*/

exports.NewAccount = apiNewAccount;
exports.ValidateAccount = apiValidateAccount;
exports.DeleteAccount = apiDeleteAccount;
exports.ChangePassword = apiChangePassword;
