/**
 * accounts_db - Database API for account management on the XMPP server
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
if (!settings.roommanager) {
    settings.roommanager = {};
}
if (!settings.dynamodb) {
    settings.dynamodb = {};
}

var sys = require('util');
var evt = require('events');
var ddb = require('dynamodb').ddb({ endpoint: settings.dynamodb.endpoint,
                                    accessKeyId: settings.dynamodb.accessKeyId,
                                    secretAccessKey: settings.dynamodb.secretAccessKey});

var eventManager = new evt.EventEmitter();
var argv = process.argv;

'use strict';
