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
    console.log('accounts_service [/register]: FormData = ', req.body);
    api.apiNewAccount(req.body.baseurl, req.body.email, req.body.password, req.body.name, function() {
        res.send('{"result": "success"}');
    }, function(err) {
        console.log('accounts_service [/register]: ', err);
        if ('apiNewAccount: Failed - account already in use.' === err) {
            res.send('{"result": "inuse"}');
        } else {
            res.send('{"result": "error"}');
        }
    });
});

app.post('/activate', function(req, res) {
    console.log('accounts_service [/activate]: FormData = ', req.body);
    api.apiValidateAccount(req.body.email, req.body.activation_code, function() {
        res.send('{"result": "success"}');
    }, function(err) {
        console.log('accounts_service [/activate]: ', err);
        if (('apiValidateAccount: Incorrect activation code for ' + req.body.email) === err) {
            res.send('{"result": "incorrect"}');
        } else if (('apiValidateAccount: Bad activation code. No account found for: ' + req.body.email) === err) {
            res.send('{"result": "noaccount"}');
        } else if ('apiValidateAccount: Activation already used or expired.' === err ||
                   'apiValidateAccount: Activation already used or expired - and enable failed.' === err) {
            res.send('{"result": "usedorexpired"}');
        } else {
            res.send('{"result": "error"}');
        }
    });
});

app.listen(settings.accounts.serviceport || 8083);
