/**
 * accounts_db - Database API for account management in conjunction with DynamoDB
 *
 * This portion is really only about adding, getting, and deleting entries of
 * email/validation-code pairs. It is not doing real account management.
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

function dbAddEntry(accountName, validationCode) {

}

function dbGetEntryByFullValidationCode(validationCode) {

}

function dbGetEntryByShortValidationCode(validationCode) {

}

function dbGetEntryByAccountName(accountName) {

}

function dbDeleteEntry(accountName) {

}

exports.AddEntry = dbAddEntry;
exports.GetEntryByFullValidationCode = dbGetEntryByFullValidationCode;
exports.GetEntryByShortValidationCode = dbGetEntryByShortValidationCode;
exports.GetEntryByAccountName = dbGetEntryByAccountName;
exports.DeleteEntry = dbDeleteEntry;
