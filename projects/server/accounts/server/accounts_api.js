/**
 * accounts_api - The highest-level API for doing account validation management.
 *
 * The webserver node-listener and the room manager will both utilize this API level.
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

var sys = require('util');
var evt = require('events');

var eventManager = new evt.EventEmitter();
var argv = process.argv;

var mail = require('node-mailgun');
var crypto = require('crypto');
var xmpp = require('./accounts_xmpp');
var db = require('./accounts_db');

'use strict';

function privateGenEmail(email, actcode) {
	console.log('privateGenEmail: Generating activation email [email = ' +
				email + ', actcode = ' + actcode + ']');
	return 'email';
}

function privateMatchActivationCodes(actcode1, actcode2) {
	return true;
}

function apiNewAccount(email, password, name, success, failure) {
	// Check if account with this email exists
	xmpp.xmppAccountAvailable(email, function() {
		// Doesn't exist, so add account
		xmpp.xmppAddAccount(email, password, name, function() {
			// Added account, now generate activation code
			var actcode = crypto.createHash('md5').update('GoCast' + email).digest('hex');
			// Now, generate activation email
			var actemail = privateGenEmail(email, actcode);
			//Now, send activation email
			mail.send(actemail);
			//Now, add pending-activation-db entry for this email
			db.dbAddEntry(email, actcode);
		}, failure);
	}, function() {
		failure('apiNewAccount: Failed');
	});
}

function apiValidateAccount(email, actcode, success, failure) {
	// Check if account with this email exists
	xmpp.xmppAccountAvailable(email, function() {
		// Account doesn't exist, so bad actcode
		failure('apiValidateAccout: Bad activation code');
	}, function() {
		// Account exists, so match actcode with its corresponding db entry
		var entry = db.dbGetEntryByAccountName(email);
		if (entry) {
			if (true === privateMatchActivationCodes(entry.actcode, actcode)) {
				// Correct activation code, so enable account
				xmpp.xmppEnableAccount(email, function() {
					// Enable successful, delete db entry for email
					db.dbDeleteEntry(email);
					success();
				}, failure);
			} else {
				// Incorrect activation code
				failure('apiValidateAccout: Incorrect activation code');
			}
		} else {
			// No such entry, bad/expired code, delete xmpp account
			xmpp.xmppDeleteAccount(email, function() {
				failure('apiValidateAccout: Bad/expired activation code');				
			}, failure);
		}
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

exports.NewAccount = apiNewAccount;
exports.ValidateAccount = apiValidateAccount;
exports.DeleteAccount = apiDeleteAccount;
exports.ChangePassword = apiChangePassword;
