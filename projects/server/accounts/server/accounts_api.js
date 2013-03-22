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
var fs = require('fs');     // Need for readFile

var gcutil = require('./gcutil_node');

var eventManager = new evt.EventEmitter();
var argv = process.argv;

var Mailgun = require('mailgun').Mailgun;
var mg = new Mailgun(settings.accounts.mailgunKey);

var nodemailer = require('nodemailer');

// Prep the one-time transport for mailing HTML based emails.
var transport = nodemailer.createTransport('SMTP', {
        service: 'mailgun',
        auth: {
                user: settings.accounts.mailgunUser,
                pass: settings.accounts.mailgunPass
        }
});

var crypto = require('crypto');
var xmpp = require('./accounts_xmpp');
var db = require('./accounts_db');

var bodyFromDisk = null;

'use strict';

function privateGenGCalHTML(nameemail, link, note, when) {
    var html, start, end, minsToAdd = 60;

//    '<a href="http://www.google.com/calendar/event?action=TEMPLATE&text=GoCast%20Meeting&dates=20130310T213000Z/20130310T223000Z&details=Meeting%20description%20here.&location=https%3A%2F%2Fstudy.gocast.it%3A%2F%3Froomname%3Dblah&trp=true&sprop=&sprop=name:" target="_blank"><img src="//www.google.com/calendar/images/ext/gc_button6.gif" border=0></a>'

    html = 'http://www.google.com/calendar/event?action=TEMPLATE&text=';
    html += encodeURI('GoCast online with ' + nameemail);

    if (when) {
        start = new Date(when);
        end = new Date(when);
        end.setTime(start.getTime() + (minsToAdd*60*1000));   // Add an hour for an end-time.

        html += '&dates=';
        // Zulu format for Google does *NOT* allow for '-' or ':' and we remove the .mmm from the milliseconds portion too.
        html += start.toISOString().replace(/[\-:]/g,'').replace(/\.\d+Z/,'Z') + '/' + end.toISOString().replace(/[\-:]/g,'').replace(/\.\d+Z/,'Z');
    }

    if (note) {
        html += '&details=' + encodeURI(note);
    }

    html += '&location=' + encodeURI(link).replace(/\+/g, '%2b');

    html += '&trp=true&sprop=&sprop=name:';
    return html;
}

function privateGenHTMLInviteEmail(nameemail, link, note, when) {
    var body, fn;

    if (!bodyFromDisk) {
        try {
            fn = process.argv[1].slice(0, process.argv[1].lastIndexOf('/')+1);
            bodyFromDisk = fs.readFileSync(fn + 'inviteemail.tmpl.html', 'utf8');
        }
        catch(e) {
            console.log('ERROR: Could not find file ' + fn + 'inviteemail.tmpl.html');
            return null;
        }
    }

    body = bodyFromDisk;

    body = body.replace(/\{\{note\}\}/g, note || '');

    body = body.replace(/\{\{when\}\}/g, when || '');

    body = body.replace(/\{\{nameemail\}\}/g, nameemail);

    body = body.replace(/\{\{gcallink\}\}/g, privateGenGCalHTML(nameemail, link, note, when) || '');

    body = body.replace(/\{\{roomlink\}\}/g, link || '');

    if (settings.SERVERNAME === 'video.gocast.it') {
        body = body.replace(/\{\{reglink\}\}/g, 'https://study.gocast.it/register.html');
    }
    else if (settings.SERVERNAME === 'dev.gocast.it') {
        body = body.replace(/\{\{reglink\}\}/g, 'https://dev.gocast.it/register.html');
    }
    else if (settings.SERVERNAME === 'dnle.gocast.it') {
    // TODO:RMW - Fix this link with proper matching 'site link' based on what site we're associated with.
    // SERVERNAME of dnle corresponds to both creativity. and dnle.
        body = body.replace(/\{\{reglink\}\}/g, 'https://dnle.gocast.it/register.html');
    }

    return body;
}

function privateGenInviteEmail(nameemail, link, note, when) {
    var body;

    body = nameemail + ' has invited you to join in a collaborative conference online at GoCast.\n\n';

    if (note) {
        body += 'Personal note from ' + nameemail + ': ' + note + '\n\n';
    }

    if (when) {
        body += 'Your meeting will take place: ' + when + '\n\n';
    }

    body += 'The custom link for your meeting is: ' + link + '\n\n';

    body += 'If you have not participated in a GoCast meeting before, you will want to visit your meeting room' +
            ' link a few minutes before the start of the meeting to get your browser and camera setup and prepared.\n\n';

    body += 'The GoCast Team.\n\n';
    body += 'This email was generated in direct response to the named person above inviting you to their upcoming meeting.' +
            ' But you can unsubscribe from any and all further emails at any time.\n';

    return body;
}

function privateGenPasswordResetEmail(baseURL, email, name, resetcode) {
    var body;

    if (name && name !== '') {
        body = 'Hello, ' + name + ',';
    }
    else {
        body = 'Hello.';
    }

    body += '\nWe are sending you this email in response to a request for a password reset ' +
            'of your account.\n\n';

    body += 'If you did not request a password reset for your GoCast account, please ignore this email entirely. ';

    body += 'To reset your GoCast account password, please click on the link below.';

    body += '\n\nYour password reset link is: ' + baseURL + '?action=resetpassword' +
            '&resetcode=' + resetcode +
            '&email=' + email.toLowerCase();

    body += '\n\n';
    body += 'Once you have reset your password, you can always come to your dashboard at: ' +
                baseURL.substring(0, baseURL.lastIndexOf('/') + 1);
    body += '\n\n';
    body += 'Thanks for using GoCast - we hope you enjoy the service.\n\n';

    body += 'The GoCast Team.\n\n';
    body += 'This email was generated in direct response to a password reset request on the GoCast site. But you can unsubscribe from any and all further emails at any time.\n';

    return body;
}

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
        if (extras.utm_source) {
            body += '&utm_source=' + encodeURI(extras.utm_source);
        }
        if (extras.utm_medium) {
            body += '&utm_medium=' + encodeURI(extras.utm_medium);
        }
        if (extras.utm_campaign) {
            body += '&utm_campaign=' + encodeURI(extras.utm_campaign);
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

function privateSendHTMLEmail(toName, toEmail, subject, body, cbSuccess, cbFailure) {
var mailOptions = {
        from: settings.accounts.inviteFromName + ' <' + settings.accounts.inviteFromAddress + '>',
        to: toName + ' <' + toEmail + '>',
        subject: subject,
        generateTextFromHTML: true,
        html: body
    };

    if (!transport) {
        cbFailure('ERROR: FAILURE: No Transport.');
        return null;
    }

    transport.sendMail(mailOptions, function(error, response) {
            if (error) {
                gcutil.log('Mail failed: ' + error);
                cbFailure(error);
            }
            else {
                gcutil.log('Email Success: ', response.message);
                cbSuccess();
            }
    });
}

function privateSendEmail(toName, toEmail, subject, body, cbSuccess, cbFailure) {
    mg.sendText(settings.accounts.inviteFromName + ' <' + settings.accounts.inviteFromAddress + '>',
        [toName + ' <' + toEmail + '>'],
      subject,
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

function privateSendHTMLEmailList(fromName, toEmailArray, subject, body, cbSuccess, cbFailure) {
var mailOptions = {
        from: fromName + ' <' + settings.accounts.inviteFromAddress + '>',
        to: toEmailArray,
        subject: subject,
        generateTextFromHTML: true,
        html: body
    };

    if (!transport) {
        cbFailure('ERROR: FAILURE: No Transport.');
        return null;
    }

    transport.sendMail(mailOptions, function(error, response) {
            if (error) {
                gcutil.log('Mail failed: ' + error);
                cbFailure(error);
            }
            else {
                gcutil.log('Email Success: ', response.message);
                cbSuccess();
            }
    });
}

function privateSendEmailList(fromName, toEmailArray, subject, body, cbSuccess, cbFailure) {
    mg.sendText(fromName + ' <' + settings.accounts.inviteFromAddress + '>',
      toEmailArray, subject, body,
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

//
// @brief date must be a Date object.
//
function privateCalcResetPasswordCode(date, email) {
    var doy = date.getMonth().toString() + date.getDate() + date.getFullYear();
//    console.log(doy);
    return crypto.createHash('md5').update('gcSalt' + doy + email.toLowerCase()).digest('hex');
}

function privateMatchResetPasswordCode(email, inboundCode) {
    var doy, dateCheck, calcCode;

    if (inboundCode.length < 32) {
        gcutil.log('privateMatchResetPasswordCode: ERROR: Bad Code: ' + inboundCode);
        return false;
    }

    // First try with today's date...
    dateCheck = new Date();
//    console.log('Checking against: ', dateCheck);
    calcCode = privateCalcResetPasswordCode(dateCheck, email);
    if (calcCode === inboundCode) {
        return true;
    }

    // Now try with yesterday's date...
    dateCheck = new Date(dateCheck.setDate(dateCheck.getDate() - 1));
//    console.log('Checking (again) against: ', dateCheck);

    calcCode = privateCalcResetPasswordCode(dateCheck, email);
    if (calcCode === inboundCode) {
        return true;
    }

    return false;
}

function privateCalcActivationCode(email) {
    return crypto.createHash('md5').update('GoCast' + email).digest('hex');
}

function privateMatchActivationCodes(longCode, longOrShortCode) {
    if (longCode.length < 32) {
        gcutil.log('privateMatchActivationCodes: ERROR: Bad longCode: ' + longCode);
        return false;
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
    db.EntryExists(email, function(obj) {
        if (obj.validated) {
            failure('apiNewAccount: Failed - account already in use.');
        }
        else {
            failure('apiNewAccount: Failed - account registered but not activated.');
        }
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
            if (name) {
                obj.name = name;
            }

            if (firstRoomName) {
                obj.firstRoomName = firstRoomName;
            }

            //Now, add pending-activation-db entry for this email
            db.AddEntry(email, obj, function() {
                //Now, send activation email
                privateSendEmail(name, email, settings.accounts.inviteSubject, emailBody, function() {
                    gcutil.log('Hurray. Another user signed up! Email: ' + email);
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

function apiSendEmailAgain(email, baseURL, success, failure) {
    var emailBody;

    // If Account exists, return db entry.
    db.GetEntryByAccountName(email, function(entry) {
        if (entry.validated) {
            // If we're already validated, then give a success but it's really a warning of sorts
            gcutil.log('apiSendEmailAgain: Activation already complete for ' + email);
            failure('apiSendEmailAgain: Activation already completed.');
        }
        else {
            // Now, generate activation email
            emailBody = privateGenEmail(baseURL, email, entry.name, entry.validationCode);
            privateSendEmail(entry.name, email, settings.accounts.inviteSubject, emailBody, function() {
                gcutil.log('Re-Sent Registration. Another user signed up! I hope ' + email + ' comes back to activate their account.');
                success();
            }, function(err) {
                failure('apiSendEmailAgain: Email send failure.');
            });
        }
    }, function(err) {
        // Failure of getting database entry for account.
        failure('apiSendEmailAgain: account does not exist: ' + email);
    });
}

//   Requires in opts object:
//     .link which is the full link URL to the room
//     .fromemail the email address of the sender
//     .toemailarray A json stringified array of email addresses. Limits sending to 25 people max.
//   Optional:
//     .when A Javascript Date() object stringified - new Date().toString()
//     .note An additional note to be included in the email from the user.
//
function apiSendRoomInviteEmail(opts, success, failure) {
    var emailBody, emailName, specialFromName, maxToSend = 26;   // 25 + 1 for the sender.

    // If Account exists, return db entry.
    db.GetEntryByAccountName(opts.fromemail, function(entry) {
        if (!entry.validated) {
            // Non-validated accounts cannot send invites.
            gcutil.log('apiSendRoomInviteEmail: Account not activated - ' + opts.fromemail);
            failure('apiSendRoomInviteEmail: Account not activated.');
        }
        else {
            // Now, generate the invitation
            if (entry.name) {
                emailName = entry.name + ' <' + opts.fromemail + '>';
                specialFromName = entry.name + ' via GoCast';
            }
            else {
                emailName = opts.fromemail;
                specialFromName = opts.fromemail.split('@')[0] + ' via GoCast';
            }

            opts.toemailarray.unshift(opts.fromemail);
            emailBody = privateGenHTMLInviteEmail(emailName, opts.link, opts.note, opts.when);
            privateSendHTMLEmailList(specialFromName, opts.toemailarray.slice(0, maxToSend),
                                 'Your invitation to meet on GoCast with ' + emailName, emailBody, function() {
                gcutil.log('Sent an invitation from ' + opts.fromemail + ' with ' + (opts.toemailarray.length - 1) + ' others.');
                success();
            }, function(err) {
                failure('apiSendRoomInviteEmail: Email send failure.');
            });
        }
    }, function(err) {
        // Failure of getting database entry for account.
        failure('apiSendRoomInviteEmail: account does not exist: ' + opts.fromemail);
    });
}

function apiDeleteUserRoom(email, room, success, failure) {
    //  delete room
    db.DeleteRoom(email, room, success, failure);
}

function apiGenerateResetPassword(email, baseURL, success, failure) {
    var emailBody, resetcode, result;

    if (!email || !baseURL || typeof(email) !== 'string' || typeof(baseURL) !== 'string') {
        result = 'Details: ';
        if (!email) {
            result += 'email not present ; ';
        }
        if (!baseURL) {
            result += 'baseURL not present ; ';
        }
        if (typeof(email) !== 'string') {
            result += 'email was of type: ' + typeof(email) + ' ; ';
        }
        if (typeof(baseURL) !== 'string') {
            result += 'baseURL was of type: ' + typeof(email) + ' ; ';
        }

        gcutil.log('apiGenerateResetPassword: ERROR: Bad parameters. ' + result);
        failure('apiGenerateResetPassword: Bad Parameters.' + result);
        return;
    }

    // If Account exists, return db entry.
    db.GetEntryByAccountName(email, function(entry) {
        if (!entry.validated) {
            // If we're not validated, then let them know they just need to finish activating.
            gcutil.log('apiGenerateResetPassword: Not Activated yet for ' + email);
            failure('apiGenerateResetPassword: Not Activated yet.');
        }
        else {
            // Now, generate password reset email
            resetcode = privateCalcResetPasswordCode(new Date(), email);
            emailBody = privateGenPasswordResetEmail(baseURL, email, entry.name, resetcode);

            privateSendEmail(entry.name, email, 'Reset your GoCast account password', emailBody, function() {
                gcutil.log('Sent Password-Reset email to ' + email);
                success();
            }, function(err) {
                failure('apiGenerateResetPassword: Email send failure.');
            });
        }
    }, function(err) {
        // Failure of getting database entry for account.
        failure('apiGenerateResetPassword: account does not exist: ' + email);
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

function apiResetPasswordViaLink(email, password, resetcode, success, failure) {

    // If Account exists, return db entry.
    db.GetEntryByAccountName(email, function(entry) {
        if (!entry.validated) {
            // If we're not validated, then let them know they just need to finish activating.
            gcutil.log('apiResetPasswordViaLink: Not Activated yet for ' + email);
            failure('apiResetPasswordViaLink: Not Activated yet.');
        }
        else {
            // Now figure out if the reset code is good. If so, then make the change.
            if (privateMatchResetPasswordCode(email, resetcode)) {
                apiChangePassword(email, password, function() {
                    gcutil.log('Password-Reset complete for email: ' + email);
                    success();
                }, function(err) {
                    failure('apiResetPasswordViaLink: password change/reset failure.');
                });
            }
            else {
                gcutil.log('apiResetPasswordViaLink: Bad reset code given by ' + email);
                failure('apiResetPasswordViaLink: Bad reset code.');
            }
        }
    }, function(err) {
        // Failure of getting database entry for account.
        failure('apiResetPasswordViaLink: account does not exist: ' + email);
    });
}

function apiGetAccount(email, success, failure) {
    // If Account exists, return db entry.
    db.GetEntryByAccountName(email, function(entry) {
        success(entry);
    }, function(err) {
        // Failure of getting database entry for account.
        failure('apiGetAccount: account ' + email + ' does not exist.');
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

function apiNewRoom(email, roomName, success, failure) {
    db.CreateRoom(email, roomName, success, failure);
}

function apiListRooms(email, success, failure) {
    db.ListRooms(email, success, failure);
}

//
// Sort the inbound recent list by most recent and cut off at a limit of 6
//
function apiListRecentRooms(email, success, failure) {
    db.GetAssociatedRooms(email, function(objs) {
        // We will receive an array of objects here with:
        // { room: 'roomname', roomtype: 'recent' }
        //
        var compare, i, rooms = [], email, roomname, lastEntryTime, maxRecent = 6;

        compare = function(a, b) {
            // Comparison is straight forward except we want to treat '0' as a special one for the
            // end of the array since it wasn't a valid date to start with rather than having those
            // percolate to the top by virtue of being small numbers.
            if (!a.lastEntry || a.lastEntry < b.lastEntry) {
                return 1;
            }
            if (a.lastEntry && a.lastEntry > b.lastEntry) {
                return -1;
            }
            return 0;
        };

        for (i = 0 ; i < objs.length ; i += 1) {
            email = decodeURIComponent(objs[i].room).split('#')[0].replace(/~/g, '@');
            // roomname ... should always have a #, but if it doesn't, we'll not use the split()[1] so we don't wind up null.
            roomname = decodeURIComponent(objs[i].room).replace(/%27/g, '\'');

            if (objs[i].lastEntry) {
                lastEntryTime = new Date(objs[i].lastEntry).getTime();
                if (isNaN(lastEntryTime)) {
                    lastEntryTime = 0;
                }
            }
            else {
                lastEntryTime = 0;
            }

            rooms.push({room: roomname, numparticipants: 0,
                        lastEntry: lastEntryTime,
                        description: 'Last entered on ' + objs[i].lastEntry, owner: objs[i].owner || email });
        }

        //
        // Now - sort the array by lastEntry
        //
//        console.log('DEBUG: apiListRecentRooms: pre-sort-rooms-output: ', rooms);
        rooms.sort(compare);

        // Now cut off the list @ maxEntries
        rooms = rooms.slice(0, maxRecent);
//        console.log('DEBUG: apiListRecentRooms: output: ', rooms);
        success(rooms);
    }, failure);
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
exports.GetAccount = apiGetAccount;
exports.ValidateAccount = apiValidateAccount;
exports.DeleteAccount = apiDeleteAccount;
exports.ChangePassword = apiChangePassword;
exports.NewRoom = apiNewRoom;
exports.DeleteUserRoom = apiDeleteUserRoom;
exports.ListRooms = apiListRooms;
exports.ListRecentRooms = apiListRecentRooms;
exports.VisitorSeen = apiVisitorSeen;
exports.SendEmailAgain = apiSendEmailAgain;
exports.GenerateResetPassword = apiGenerateResetPassword;
exports.ResetPasswordViaLink = apiResetPasswordViaLink;
exports.SendRoomInviteEmail = apiSendRoomInviteEmail;
