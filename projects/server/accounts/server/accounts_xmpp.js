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

var sys = require('util');
var evt = require('events');

var eventManager = new evt.EventEmitter();
var argv = process.argv;

var xmppServerBase = settings.accounts.xmppServerBase;

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
        return input.replace('@', '~');
    }
}

function xmppPrivateSendCommand(args) {

}

//
// @brief Check to see if the account exists or not.
// @arg accountName - Non-escaped account name.
//
// @returns - true or false when valid input is given.
//            But will throw and exception if input is illegal.
//
function xmppAccountAvailable(accountName) {
    var em = xmppPrivateEscapeEmail(accountName);
    if (!em) {
        throw 'Invalid account Name: ' + accountName;
    }

    // Check to see if the account exists by calling 'Add' with the name
    // If the add fails, then the account exists.
    // If it succeeds, then we'll need to delete it and the account doesn't exist.
}

function xmppAddAccount(accountName) {

}

function xmppEnableAccount(accountName) {

}

function xmppDeleteAccount(accountName) {

}

function xmppChangePassword(accountName) {

}

exports.AccountAvailable = xmppAccountAvailable;
exports.AddAccount = xmppAddAccount;
exports.DeleteAccount = xmppDeleteAccount;
exports.ChangePassword = xmppChangePassword;
