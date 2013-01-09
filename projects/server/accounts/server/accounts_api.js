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

var mail = require('mailgun');

var xmpp = require('./accounts_xmpp');
var db = require('./accounts_db');

'use strict';

function apiNewAccount() {

}

function apiValidateAccount() {

}

function apiDeleteAccount() {

}

function apiChangePassword() {

}

exports.NewAccount = apiNewAccount;
exports.ValidateAccount = apiValidateAccount;
exports.DeleteAccount = apiDeleteAccount;
exports.ChangePassword = apiChangePassword;
