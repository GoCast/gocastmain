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

function privateGenEmail(baseURL, email, name, actcode, bInAppReg) {
    var body;

    if (name && name !== '') {
        body = 'Welcome, ' + name + ', to the GoCast network.\n\n';
    }
    else {
        body = 'Welcome to the GoCast network.\n\n';
    }

    // If we registered from inside the GoCast ... the message is a little different.
    if (bInAppReg) {
        body += 'Please activate your new account by going back to your GoCast page and entering the activation code found below.';
    }
    else {
        body += 'Please activate your new account by going back to the GoCast registration web page and entering the activation code found below.';
    }

    body += '\n\nAlternatively, you can click on the link below.';

    body += 'Your activation code is: ' + actcode.slice(-6).toUpperCase();
    body += '\n\nOr your activation link is: ' + baseURL + 
            '?defaultaction=activate&code=' + actcode.toUpperCase() +
            '&email=' + email.toLowerCase();

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
            emailBody = privateGenEmail(baseURL, email, name, actcode, bInAppReg);

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

//
// @brief Figure out if this email address and activation code are 'good'.
//   This can happen a number of ways - some straight forward and others not so direct.
//   1. Find the email account, then match the code (long or short) with it. GOOD. Enable account.
//   2. Find the email account, then dont find the activation database entry - hmm...
//      Calculate the activation from the email - if it matches, then let the user know this
//      account has already been activated.
//
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
                if (entry.validationCode && true === privateMatchActivationCodes(entry.validationCode.S, actcode)) {
                    // Correct activation code, so enable account
                    xmpp.EnableAccount(email, function() {
                        // Enable successful, delete db entry for email
                        db.DeleteEntry(email, function() {
                            console.log('Hurray! Activation complete for ' + email);
                            success();
                        }, function(err) {
                            console.log('apiValidateAccount: WARNING - Could not delete validation entry for ' + email);
                            console.log('Hurray! Activation complete for ' + email);
                            success();
                        });
                    }, failure);
                } else {
                    // Incorrect activation code
                    failure('apiValidateAccount: Incorrect activation code for ' + email);
                }
            }
            else {
                // This is deemed an outright failure as we're in the success callback but dont have an 'Item'
                failure('apiValidateAccount: Error: Did not find the validation entry for ' + email);
            }
        }, function(err) {
            // Failure of getting database entry for account.
            // No such entry implies either an older code that has been retired
            // or an activation code which was already used or
            // it is a bad code altogether - return an error (dont delete the account that is a bad idea)
            var tempCode = privateCalcActivationCode(email);

            if (true === privateMatchActivationCodes(tempCode, actcode)) {
                // Correct activation code, let use know this is an already used or expired activation code.
                // We're going to go ahead and (re)-enable the account to err on the side of
                // safety for the consumer here. If for some reason, we culled the activation codes
                // but we didn't cull the corresponding xmpp accounts, we would have disabled accounts
                // in the xmpp database without activation codes for them. This would make it impossible
                // for a user to even re-register as their email address would already show as 'in use'
                // and not available. The only other action would be to delete the account and we dont
                // want to do that as this would allow anyone to remotely delete people's valid accounts
                // simply by figuring out how to pass us a good short activation code for that email address.
                //
                // The only added confusion here would be if the account were in the disabled state
                // and the user found the old activation email - and we had culled the activation out
                // but left the xmpp user in...then they would be effectively activating without a
                // real activation entry in the database. But that shouldn't happen anyway. So, we're
                // just playing very conservatively here.
                xmpp.EnableAccount(email, function() {
                    console.log('Hurray! Activation complete for ' + email);
                    success('apiValidateAccount: Activation already used or expired but we are calling it activated again.');
                }, function() {
                    // Possibly should decide to error differently here since enable failed?
                    failure('apiValidateAccount: Activation already used or expired - and enable failed.');
                });
            } else {
                // Incorrect activation code
                failure('apiValidateAccount: Incorrect activation code for ' + email);
            }
        });
    });
}

function apiDeleteAccount(email, success, failure) {
    // Check if account with this email exists
    xmpp.AccountAvailable(email, function() {
        // Account doesn't exist, so fail
        failure('apiDeleteAccount: Account doesn\'t exist');
    }, function() {
        // Account exists, so delete it
        xmpp.DeleteAccount(email, success, failure);
    });
}

function apiChangePassword(email, newpassword, success, failure) {
    xmpp.ChangePassword(email, newpassword, success, failure);
}

/* Manjesh -- These both work (separately of course)
apiNewAccount('http://dev.gocast.it/baseURL.html', 'rwolff@gocast.it', 'rwolff', 'Bob Wolff', function() {
    console.log('TEST: SUCCESS');
}, function(err) {
    console.log('TEST: FAILURE: ', err);
});
*/
/*
apiValidateAccount('rwolff@gocast.it', '85e25a1fea7b001911f791f13180f252', function() {
    console.log('TEST-Validate: SUCCESS.');
}, function(err) {
    console.log('TEST-Validate: FAILED: ' + err);
});
*/

exports.NewAccount = apiNewAccount;
exports.ValidateAccount = apiValidateAccount;
exports.DeleteAccount = apiDeleteAccount;
exports.ChangePassword = apiChangePassword;
