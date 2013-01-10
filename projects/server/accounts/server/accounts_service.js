/**
 * accounts_service - A port-listener which takes web-based account commands
 *
 * The web server will give us certain action-requests as URLs here:
 * - New account
 * - Validate account
 * - Delete account
 * - Update Password to account
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

var api = require('./accounts_api');

'use strict';

var express = require('express');
var app = express();

// -------------- INCLUDED EXPRESS LIBRARIES -----------------

app.use(express.bodyParser());

// -------------- ACCT SERVICE REQUEST HANDLERS --------------

app.post('/register', function(req, res) {
    api.apiNewAccount(req.body.baseurl, req.body.email, req.body.password, req.body.name, function() {
        res.send('{"result": "success"}');
    }, function(err) {
        console.log('accounts_service: ', err);
        if ('apiNewAccount: Failed - account already in use.' === err) {
            res.send('{"result": "inuse"}');
        } else {
            res.send('{"result": "error"}');
        }
    });
});

app.post('/activate', function(req, res) {
    api.apiValidateAccount('rwolff@gocast.it', '85e25a1fea7b001911f791f13180f252', function() {
        res.send('{"result": "success"}');
    }, function(err) {
        console.log('TEST-Validate: FAILED: ' + err);
    });
});

app.listen(settings.accounts.serviceport || 8083);
