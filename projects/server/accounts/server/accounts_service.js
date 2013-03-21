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

var gcutil = require('./gcutil_node');

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
    var firstRoomName = req.body.desired_roomname,
        extras = null;

    if (req.body && req.body.baseurl && req.body.email && req.body.password && req.body.name) {
//        gcutil.log('accounts_service [/register][info]: FormData = ', req.body);
        if (req.body.extra_fields) {
            // Looking for a stringified JSON object.
            try {
                extras = JSON.parse(req.body.extra_fields);
            }
            catch(e) {
                // Badly formed extras. Print out what came to us for our records. Then pretend it never happened.
                gcutil.log('accounts_service [/register][warn]: Badly formed extra_fields: ', req.body.extra_fields);
                extras = null;
            }
        }

        api.NewAccount(req.body.baseurl, req.body.email, req.body.password, req.body.name, firstRoomName, extras, function() {
            res.send('{"result": "success"}');
        }, function(err) {
            gcutil.log('accounts_service [/register][error]: ', err);
            if ('apiNewAccount: Failed - account already in use.' === err) {
                res.send('{"result": "inuse"}');
            }
            else if ('apiNewAccount: Failed - account registered but not activated.' === err) {
                res.send('{"result": "registered"}');
            } else {
                res.send('{"result": "error"}');
            }
        });
    }
    else {
        gcutil.log('accounts_service [/register][error]: FormData problem in req.body: ', req.body);

        if (!req.body.name) {
            res.send('{"result": "no name"}');
        }
        else if (!req.body.email) {
            res.send('{"result": "no email"}');
        }
        else if (!req.body.password) {
            res.send('{"result": "no password"}');
        }
        else {
            res.send('{"result": "error"}');
        }
    }
});

app.post('/createroom', function(req, res) {
    var roomName = req.body.desired_roomname;

    if (req.body && req.body.email && roomName) {
        gcutil.log('accounts_service [/createroom][info]: FormData = ', req.body);
        api.NewRoom(req.body.email, roomName, function() {
            res.send('{"result": "success"}');
        }, function(err) {
            if (err && err.code === 'ConditionalCheckFailedException') {
                // This is just a 'room name already exists' error. Let it go.
                res.send('{"result": "success"}');
            }
            else {
                gcutil.log('accounts_service [/createroom][error]: ', err);
                res.send('{"result": "error"}');
            }
        });
    }
    else {
        gcutil.log('accounts_service [/createroom][error]: FormData problem in req.body: ', req.body);

        if (!req.body.email) {
            res.send('{"result": "no email"}');
        }
        else if (!req.body.desired_roomname) {
            res.send('{"result": "no roomname"}');
        }
        else {
            res.send('{"result": "error"}');
        }
    }
});

app.post('/deleteroom', function(req, res) {
    var roomName = req.body.roomname;

    if (req.body && req.body.email && roomName) {
        gcutil.log('accounts_service [/deleteroom][info]: FormData = ', req.body);
        api.DeleteUserRoom(req.body.email, roomName, function() {
            res.send('{"result": "success"}');
        }, function(err) {
            gcutil.log('accounts_service [/deleteroom][error]: ', err);
            res.send('{"result": "error"}');
        });
    }
    else {
        gcutil.log('accounts_service [/deleteroom][error]: FormData problem in req.body: ', req.body);

        if (!req.body.email) {
            res.send('{"result": "no email"}');
        }
        else if (!req.body.roomname) {
            res.send('{"result": "no roomname"}');
        }
        else {
            res.send('{"result": "error"}');
        }
    }
});

app.post('/listrooms', function(req, res) {

    if (req.body && req.body.email) {
        gcutil.log('accounts_service [/listrooms][info]: FormData = ', req.body);
        api.ListRooms(req.body.email, function(data) {
            res.send('{"result": "success", "data": ' + JSON.stringify(data) + '}');
        }, function(err) {
            gcutil.log('accounts_service [/listrooms][error]: ', err);
            res.send('{"result": "error"}');
        });
    }
    else {
        gcutil.log('accounts_service [/listrooms][error]: FormData problem in req.body: ', req.body);

        if (!req.body.email) {
            res.send('{"result": "no email"}');
        }
        else {
            res.send('{"result": "error"}');
        }
    }
});

app.post('/listrecentrooms', function(req, res) {

    if (req.body && req.body.email) {
        gcutil.log('accounts_service [/listrecentrooms][info]: FormData = ', req.body);
        api.ListRecentRooms(req.body.email, function(data) {
            console.log('strinigify: ', JSON.stringify(data));
            res.send('{"result": "success", "data": ' + JSON.stringify(data) + '}');
        }, function(err) {
            gcutil.log('accounts_service [/listrecentrooms][error]: ', err);
            res.send('{"result": "error"}');
        });
    }
    else {
        gcutil.log('accounts_service [/listrecentrooms][error]: FormData problem in req.body: ', req.body);

        if (!req.body.email) {
            res.send('{"result": "no email"}');
        }
        else {
            res.send('{"result": "error"}');
        }
    }
});

app.post('/getprofile', function(req, res) {

    if (req.body && req.body.email) {
        gcutil.log('accounts_service [/getprofile][info]: FormData = ', req.body);
        api.GetAccount(req.body.email, function(entry) {
            var toReturn = {};
            toReturn.name = entry.name;

            res.send('{"result": "success", "data": ' + JSON.stringify(toReturn) + '}');
        }, function(err) {
            gcutil.log('accounts_service [/getprofile][error]: ', err);
            res.send('{"result": "error"}');
        });
    }
    else {
        gcutil.log('accounts_service [/getprofile][error]: FormData problem in req.body: ', req.body);
        res.send('{"result": "error"}');
    }
});

app.post('/activate', function(req, res) {
    if (req.body && req.body.email && req.body.activation_code) {
//        gcutil.log('accounts_service [/activate][info]: FormData = ', req.body);
        api.ValidateAccount(req.body.email, req.body.activation_code, function() {
            res.send('{"result": "success"}');
        }, function(err) {
            gcutil.log('accounts_service [/activate][error]: ', err);
            if (('apiValidateAccount: Incorrect activation code [' + req.body.activation_code + ']for ' + req.body.email) === err) {
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
    }
    else {
        gcutil.log('accounts_service [/activate][error]: FormData problem in req.body: ', req.body);

        if (!req.body.email) {
            res.send('{"result": "no email"}');
        }
        else if (!req.body.activation_code) {
            res.send('{"result": "no activationcode"}');
        }
        else {
            res.send('{"result": "error"}');
        }
    }
});

app.post('/changepwd', function(req, res) {
    if (req.body && req.body.email && req.body.new_password) {
//        gcutil.log('accounts_service [/changepwd][info]: FormData = ', req.body);
        api.ChangePassword(req.body.email, req.body.new_password, function() {
            res.send('{"result": "success"}');
        }, function(err) {
            gcutil.log('accounts_service [/changepwd][error]: ', err);
            res.send('{"result": "error"}');
        });
    }
    else {
        gcutil.log('accounts_service [/changepwd][error]: FormData problem in req.body: ', req.body);

        if (!req.body.email) {
            res.send('{"result": "no email"}');
        }
        else if (!req.body.new_password) {
            res.send('{"result": "no password"}');
        }
        else {
            res.send('{"result": "error"}');
        }
    }
});

app.post('/resetpasswordrequest', function(req, res) {
    if (req.body && req.body.email) {
        gcutil.log('accounts_service [/resetpasswordrequest][info]: FormData = ', req.body);
        api.GenerateResetPassword(req.body.email, req.body.baseurl, function() {
            res.send('{"result": "success"}');
        }, function(err) {
            gcutil.log('accounts_service [/resetpasswordrequest][error]: ', err);
            if ('apiGenerateResetPassword: Not Activated yet.' === err) {
                res.send('{"result": "not activated"}');
            }
            else if (('apiGenerateResetPassword: account does not exist: ' + req.body.email) === err) {
                res.send('{"result": "no account"}');
            }
            else {
                res.send('{"result": "error"}');
            }
        });
    }
    else {
        gcutil.log('accounts_service [/resetpasswordrequest][error]: FormData problem in req.body: ', req.body);

        if (!req.body.email) {
            res.send('{"result": "no email"}');
        }
        else {
            res.send('{"result": "error"}');
        }
    }
});

app.post('/resetpasswordlink', function(req, res) {
    if (req.body && req.body.email && req.body.password && req.body.resetcode) {
//        gcutil.log('accounts_service [/resetpasswordlink][info]: FormData = ', req.body);
        api.ResetPasswordViaLink(req.body.email, req.body.password, req.body.resetcode, function() {
            res.send('{"result": "success"}');
        }, function(err) {
            gcutil.log('accounts_service [/resetpasswordlink][error]: ', err);

            if ('apiResetPasswordViaLink: Bad reset code.' === err) {
                res.send('{"result": "bad resetcode"}');
            }
            else if ('apiResetPasswordViaLink: Not Activated yet.' === err) {
                res.send('{"result": "not activated"}');
            }
            else if (('apiResetPasswordViaLink: account does not exist: ' + req.body.email) === err) {
                res.send('{"result": "no account"}');
            }
            else {
                res.send('{"result": "error"}');
            }
        });
    }
    else {
        gcutil.log('accounts_service [/resetpasswordlink][error]: FormData problem in req.body: ', req.body);

        if (!req.body.email) {
            res.send('{"result": "no email"}');
        }
        else if (!req.body.resetcode) {
            res.send('{"result": "no resetcode"}');
        }
        else if (!req.body.password) {
            res.send('{"result": "no password"}');
        }
        else {
            res.send('{"result": "error"}');
        }
    }
});

app.post('/visitorseen', function(req, res) {
    if (req.body && req.body.email) {
        gcutil.log('accounts_service [/visitorseen][info]: FormData = ', req.body);
        api.VisitorSeen(req.body.email, req.body.nickname, function() {
            res.send('{"result": "success"}');
        }, function(err) {
            gcutil.log('accounts_service [/visitorseen][error]: ', err);
            res.send('{"result": "error"}');
        });
    }
    else {
        gcutil.log('accounts_service [/createroom][error]: FormData problem in req.body: ', req.body);

        if (!req.body.email) {
            res.send('{"result": "no email"}');
        }
        else {
            res.send('{"result": "error"}');
        }
    }
});

app.post('/sendemailagain', function(req, res) {
    if (req.body && req.body.baseurl && req.body.email) {
//        gcutil.log('accounts_service [/sendemailagain][info]: FormData = ', req.body);
        api.SendEmailAgain(req.body.email, req.body.baseurl, function() {
            res.send('{"result": "success"}');
        }, function(err) {
            gcutil.log('accounts_service [/sendemailagain][error]: ', err);
            res.send('{"result": "error"}');
        });
    }
    else {
        gcutil.log('accounts_service [/sendemailagain][error]: FormData problem in req.body: ', req.body);

        if (!req.body.email) {
            res.send('{"result": "no email"}');
        }
        else {
            res.send('{"result": "error"}');
        }
    }
});

//
// @brief post-location for sending an email to invite others to join you in a GoCast.
//   Requires:
//     .link which is the full link URL to the room
//     .fromemail the email address of the sender
//     .toemailarray A json stringified array of email addresses. A max of 25 entries will be used.
//   Optional:
//     .when A Javascript Date() object stringified - new Date().toString()
//     .note An additional note to be included in the email from the user.
//
app.post('/inviteviaemail', function(req, res) {
    var arg;

    if (req.body && req.body.link && req.body.fromemail && req.body.toemailarray) {
        gcutil.log('accounts_service [/inviteviaemail][info]: FormData = ', req.body);

        try {
            arg = { fromemail: req.body.fromemail,
                    toemailarray: JSON.parse(req.body.toemailarray),
                    link: req.body.link };
        } catch(e) {
            res.send('{"result": "parse error"}');
            return;
        }

        if (req.body.when) {
            arg.when = req.body.when;
        }
        if (req.body.note) {
            arg.note = req.body.note;
        }

        api.SendRoomInviteEmail(arg, function() {
            res.send('{"result": "success"}');
        }, function(err) {
            gcutil.log('accounts_service [/inviteviaemail][error]: ', err);
            if ('apiSendRoomInviteEmail: Account not activated.' === err) {
                res.send('{"result": "not activated"}');
            }
            else if (('apiSendRoomInviteEmail: account does not exist: ' + req.body.fromemail) === err) {
                res.send('{"result": "no account"}');
            }
            else {
                res.send('{"result": "error"}');
            }
        });
    }
    else {
        gcutil.log('accounts_service [/inviteviaemail][error]: FormData problem in req.body: ', req.body);

        if (!req.body.fromemail) {
            res.send('{"result": "no fromemail"}');
        }
        else if (!req.body.link) {
            res.send('{"result": "no link"}');
        }
        else if (!req.body.toemailarray) {
            res.send('{"result": "no toemailarray"}');
        }
        else {
            res.send('{"result": "error"}');
        }
    }
});

app.listen(settings.accounts.serviceport || 8083);
