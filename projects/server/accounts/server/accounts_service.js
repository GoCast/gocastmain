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
var qs = require('qs');

var gcutil = require('./gcutil_node');

var eventManager = new evt.EventEmitter();
var argv = process.argv;

var api = require('./accounts_api');

'use strict';

var https = require('https');
var express = require('express');
var app = express();
var validDomains = ['gocast.it'];
var validSellingAgents = ['mtp-usa', 'gocast-direct', 'gocast-test'];

var anHour = 1000 * 60 * 60;
var aDay = anHour * 24;
var aWeek = aDay * 7;
var maxCookieAge = aWeek * 4;

// -------------- URI PARSER HELPER CLASS --------------------
// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
    var o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

/*jslint plusplus: true*/
    while (i--) {
        uri[o.key[i]] = m[i] || "";
    }
/*jslint plusplus: false*/

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) {
            uri[o.q.name][$1] = $2;
        }
    });

    return uri;
}

/*jslint regexp: true*/
parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};
/*jslint regexp: false*/

// -------------- INCLUDED EXPRESS LIBRARIES -----------------

/* RMW - to get RAW body, this must be done PRIOR to express.bodyParser() addition */
app.use(function(req, res, next) {
    var data = '', cbdata, cbend;
    cbdata = function(chunk) {
        data += chunk;
    };
    cbend = function() {
//        console.log('got data end - rawBody is: ', data);
        req.rawBody = data;
        // Now that we're done with this data, we need to make sure the down-wind people
        // get access to it. So, we remove our listener and emit a single data / end pair
        // for the people down wind.
        req.removeListener('data', cbdata);
        req.removeListener('end', cbend);

        next();
        // Now that we're done with this data, we need to make sure the down-wind people
        // get access to it. So, we remove our listener and emit a single data / end pair
        // for the people down wind.
        req.emit('data', data);
        req.emit('end');
    };

    req.setEncoding('utf8');
    req.on('data', cbdata);
    req.on('end', cbend);
});
app.use(express.bodyParser());
/* End block for bodyParser with mods */

app.use(express.cookieParser(settings.accounts.cookieSecret));

// specifying secret in cookieSession results in the cookie contents not being stored in req.session
// so do not specify the secret... express will obtain it from the 'req' object.
app.use(express.cookieSession({key: 'gcsession', cookie: {maxAge: maxCookieAge}}));

// -------------- ACCT SERVICE REQUEST HANDLERS --------------

//
// Takes a url in and an array (or string) of valid 'base' url domain names
// example: ('http://study.gocast.it/register.html', ['gocast.it', 'partner.com'])
//
// RMW: Note:
// parser has trouble with embedded email address as it looks like a username@hostname situation.
// Unfortunately, this is typical of our situation with a failing url of:
// https://study.gocast.it/myroom.html?defaultaction=activate&email=kkalava@yahoo.com&utm_source=AdWords
// So, changing parseUri(url) here to become parseUri(url.split('?'))
// This will work for our purposes since we ONLY need the host name and not the query params.
//
function valid_base_domain(url, validList) {
    var x = parseUri(url.split('?')), validArr = [], host, i;

    host = x.host || '';
    host = host.toLowerCase();

    if( Object.prototype.toString.call( validList ) === '[object Array]' ) {
        validArr = validList;
    }
    else {
        validArr[0] = validList;  // parameter was a string rather than an array as it should have been.
    }

    // Check each entry in the array list against our host for the right-side being equal to the valid list item.
    for (i = 0; i < validArr.length ; i += 1) {
        if (host.search(validArr[i]) === host.length - validArr[i].length) {
            return true;
        }
    }

    return false;
}

function contains(a, obj) {
    var i;
    for (i = 0; i < a.length; i += 1) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

app.post('/register', function(req, res) {
    var firstRoomName = req.body.desired_roomname,
        extras = null;

    // Use the headers/referer entry above the sent-in baseurl if one is present.
    if (req.body && req.headers.referer) {
        req.body.baseurl = req.headers.referer.split('?')[0];
    }

    if (req.body && !req.body.baseurl) {
        gcutil.log('accounts_service [/register][error]: No referer and no baseurl passed. req.body is: ', req.body);
    }

    if (req.body && !valid_base_domain(req.body.baseurl, validDomains)) {
        gcutil.log('accounts_service [/register][error]: Referrer domain was not valid from: ', req.body.baseurl);
        res.send('{"result": "error"}');
        return;
    }

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

app.post('/newpurchasedaccount', function(req, res) {
    var firstRoomName = req.body.desired_roomname,
        extras = null;

    if (req.body && !req.body.baseurl) {
        gcutil.log('accounts_service [/newpurchasedaccount][error]: No referer and no baseurl passed. req.body is: ', req.body);
    }

    if (req.body && req.body.selling_agent && !contains(validSellingAgents, req.body.selling_agent.toLowerCase())) {
        gcutil.log('accounts_service [/newpurchasedaccount][error]: Selling agent was not valid: ', req.body);
        res.send('{"result": "invalid selling_agent"}');
        return;
    }

    if (req.body && req.body.baseurl && req.body.email && req.body.name && req.body.package_name &&
            req.body.end_subscription_date && req.body.max_rooms_allowed && req.body.selling_agent) {
        gcutil.log('accounts_service [/newpurchasedaccount][info]: FormData = ', req.body);
        // Formulate extras from pre-expectation fields.
        extras = {
            package_name: req.body.package_name,
            end_subscription_date: req.body.end_subscription_date,
            max_rooms_allowed: req.body.max_rooms_allowed,
            selling_agent: req.body.selling_agent
        };

        if (isNaN(new Date(req.body.end_subscription_date).getTime())) {
            // end subscription date is not formatted correctly. Disallow.
            res.send('{"result": "bad end_subscription_date"}');
        }

        // Create account with password which is simply the current time.
        api.NewPaidAccount(req.body.baseurl, req.body.email, new Date().getTime(), req.body.name, firstRoomName, extras, function() {
            // Now the account exists...All good.
            gcutil.log('accounts_service [/newpurchasedaccount][success]: All good for: ' + req.body.email);
            res.send('{"result": "success"}');
        }, function(err) {
            gcutil.log('accounts_service [/newpurchasedaccount][error]: ', err);
            if ('apiNewPaidAccount: Failed - account already in use.' === err) {
                res.send('{"result": "inuse"}');
            }
            else if ('apiNewPaidAccount: Failed - account registered but not activated.' === err) {
                res.send('{"result": "registered"}');
            } else {
                res.send('{"result": "error"}');
            }
        });
    }
    else {
        gcutil.log('accounts_service [/newpurchasedaccount][error]: FormData problem in req.body: ', req.body);

        if (!req.body.name) {
            res.send('{"result": "no name"}');
        }
        else if (!req.body.email) {
            res.send('{"result": "no email"}');
        }
        else if (!req.body.package_name) {
            res.send('{"result": "no package_name"}');
        }
        else if (!req.body.selling_agent) {
            res.send('{"result": "no selling_agent"}');
        }
        else if (!req.body.end_subscription_date) {
            res.send('{"result": "no end_subscription_date"}');
        }
        else if (!req.body.max_rooms_allowed) {
            res.send('{"result": "no max_rooms_allowed"}');
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
//        gcutil.log('accounts_service [/listrooms][info]: FormData = ', req.body);
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
//        gcutil.log('accounts_service [/listrecentrooms][info]: FormData = ', req.body);
        api.ListRecentRooms(req.body.email, function(data) {
//            console.log('strinigify: ', JSON.stringify(data));
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
    // Use the headers/referer entry above the sent-in baseurl if one is present.
    if (req.body && req.headers.referer) {
        req.body.baseurl = req.headers.referer.split('?')[0];
    }

    if (req.body && !req.body.baseurl) {
        gcutil.log('accounts_service [/resetpasswordrequest][error]: No referer and no baseurl passed. req.body is: ', req.body);
    }

    if (req.body && !valid_base_domain(req.body.baseurl, validDomains)) {
        gcutil.log('accounts_service [/resetpasswordrequest][error]: Referrer domain was not valid from: ', req.body.baseurl);
        res.send('{"result": "error"}');
        return;
    }

    if (req.body && req.body.email && req.body.baseurl) {
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

//
// This is a rather blind executed function. It is only executed once all other checks have
// been made. As such, it should not fall to failure unless there are serious issues around
// database connectivity or other major system-wide failures. Logic or permissions should not
// be at issue at this stage.
//
// Due to this, this function will only return true or false and it will not
// contain a callback parameter upon its async database completion.
//
function handleTransactionNotification(req) {
    var extras, custobj, account, name, ending, baseurl, tofield;

/*
    console.log('handleTransactionNotification: SUMMARY');
    console.log('custom: ', req.body.custom);
    console.log('receiver_email: ', req.body.receiver_email);
    console.log('txn_type: ', req.body.txn_type);
    console.log('txn_id: ', req.body.txn_id);
    console.log('payer_email: ', req.body.payer_email);
    console.log('payer_id: ', req.body.payer_id);
*/

    // Parse out the 'custom' field
    custobj = qs.parse(decodeURIComponent(req.body.custom));
    account = custobj.email;
    name = custobj.name;
    baseurl = custobj.baseurl;

    // 30 day free trial - 'subscription' runs out in 30 days unless paid.
    ending = new Date();
    ending.setDate(new Date().getDate() + 30);

    req.body.baseurl = baseurl;

    if (req.body && !req.body.baseurl) {
        gcutil.log('accounts_service [handleTransactionNotification][error]: No referer and no baseurl passed. req.body is: ', req.body);
        return false;
    }

    // Need to do a fulfillment here.
    extras = {
        package_name: req.body.item_number,
        end_subscription_date: ending.toString(),
        max_rooms_allowed: 1,
        selling_agent: 'gocast-direct',
        payer_name: req.body.first_name + ' ' + req.body.last_name
    };

    if (req.body.txn_type === 'subscr_signup') {
        if (!req.body.txn_id) {
            req.body.txn_id = 'SUBSCR-' + req.body.subscr_id;
        }

        tofield = account;   // Assuming that the payer_email will be identical to the account name (most cases should be true)

        if (account !== req.body.payer_email) {
            // Send password-set email to both addresses
            tofield = [account, req.body.payer_email];
        }

        // Create account with password which is simply the current time.
        api.NewPaidAccount(req.body.baseurl, tofield, new Date().getTime(), name, null, extras, function() {
            // Now the account exists...All good.
//            gcutil.log('accounts_service [/handleTransactionNotification][success]: All good for: ' + account);
        }, function(err) {
            gcutil.log('accounts_service [/handleTransactionNotification][error]: ', err);
        });
    }
    else if (req.body.txn_type === 'subscr_cancel') {
        if (!req.body.txn_id) {
            req.body.txn_id = 'CANCEL-' + req.body.subscr_id;
        }

        gcutil.log('Cancel of subscription. TODO:RMW Disabling account.');
    }

    // Need to database this transaction and associate it to the account name.
    api.StoreTransaction(account, req.body.txn_id, req.body, function() {}, function() {});

    return true;
}

app.post('/paypalipn', function(req, res) {
    var options, httpsreq;

    if (req.body) {
//        gcutil.log('accounts_service [/paypalipn][info]: FormData = ', req.body);
//        gcutil.log('accounts_service [/paypalipn][info]: RawBody = ', req.rawBody);

        options = {
            hostname: 'www.paypal.com',
            port: 443,
            path: '/cgi-bin/webscr?cmd=_notify-validate&' + req.rawBody,
            method: 'GET'
        };

        // If we're in the sandbox, reply/verification address is different
        if (req.body.test_ipn === '1') {
            options.hostname = 'www.sandbox.paypal.com';
        }

        httpsreq = https.request(options, function(hres) {
//            console.log('statusCode: ', hres.statusCode);
//            console.log('headers: ', hres.headers);

            hres.on('data', function(d) {
                if (d.toString() === 'VERIFIED') {
//                    console.log('VERIFIED - YES.');
                    res.send('{"result": "success"}');
                    handleTransactionNotification(req);
                }
                else if (d.toString() === 'INVALID') {
                    console.log('NON_VERIFIED - INVALID - SPOOF?');
                    res.send(400, '{"result": "bad validation"}');
                }
                else {
                    console.log('PARTIAL-answer? Data is: ', d.toString());
                    res.send(400, '{"result": "partial answer"}');
                }
            });
        });
        httpsreq.end();

        httpsreq.on('error', function(e) {
            console.log('DEBUG: paypalipn: ERROR: ', e);
            res.send(400, '{"result": "general error"}');
        });
    }
    else {
        gcutil.log('accounts_service [/paypalipn][error]: FormData problem in req.body: ', req.body);

        res.send(400, '{"result": "error"}');
    }
});

//
// Columns of interest:
// status:
//  non-existent - free, active account - likely early account
//  disabled - account not allowed to login
//  non-activated - account registered, but email validation not complete yet.
//
// type:
//  non-existent - free, early account
//  perpetual
//  subscription
//
// trial:
//  non-existent - trial not tried yet
//  0 - not tried
//  1 - trial already used.
//
// RESULTS back to caller
//  'success' - available
//  'trial used' - this account has already had its trial used.
//  'unavailable' - account is already in use
//  'disabled' -
//
app.post('/accountavailable', function(req, res) {

    if (req.body && req.body.email) {
//        gcutil.log('accounts_service [/accountavailable][error]: FormData = ', req.body);
        api.GetAccount(req.body.email, function(entry) {
            if (entry.trial === '1') {
                res.send('{"result": "trial used"}');
            }
            else if (entry.status === 'disabled') {
                res.send('{"result": "disabled"}');
            }
            else if (!entry.validated || entry.status === 'non-activated') {
                res.send('{"result": "unavailable"}');
            }
            else {
                res.send('{"result": "error"}');
            }
        }, function() {
            gcutil.log('accounts_service [/accountavailable][info]: Account available: ' + req.body.email);
            res.send('{"result": "success"}');      // If account does not exist, this is PERFECT.
        });
    }
    else {
        gcutil.log('accounts_service [/accountavailable][error]: FormData problem in req.body: ', req.body);
        res.send('{"result": "error"}');
    }
});

app.post('/sendemailagain', function(req, res) {
    // Use the headers/referer entry above the sent-in baseurl if one is present.
    if (req.body && req.headers.referer) {
        req.body.baseurl = req.headers.referer.split('?')[0];
    }

    if (req.body && !req.body.baseurl) {
        gcutil.log('accounts_service [/sendemailagain][error]: No referer and no baseurl passed. req.body is: ', req.body);
    }

    if (req.body && !valid_base_domain(req.body.baseurl, validDomains)) {
        gcutil.log('accounts_service [/sendemailagain][error]: Referrer domain was not valid from: ', req.body.baseurl);
        res.send('{"result": "error"}');
        return;
    }

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

app.post('/login', function(req, res) {
//    console.log('COOKIESESSION: ', req.session);
    var refHost = null;
    if (req.headers.referer && valid_base_domain(req.headers.referer, validDomains)) {
        // We have a valid caller, so we can give out a stun/turn server entry to them.
        // First parse out the hostname.
        refHost = parseUri(req.headers.referer).host || '';
        refHost = refHost.toLowerCase();
    }
    else {
        refHost = '';
        console.log('DEBUG: /login WARNING: Invalid or no req.headers.referer? "' + req.headers.referer + '" so set refHost to empty string.');
    }

    if (req.session.sid) {
        api.Login({
            sid: req.session.sid,
            host: refHost,
            callback: function(ret) {
                var xs = {};
                if ('success' === ret.result) {
                    xs = {
                        result: 'success',
                        data: {
                            rid: ret.rid,
                            jid: ret.jid,
                            sid: ret.sid,
                            email: ret.email,
                            name: ret.name
                        }
                    };
                    if (ret.stunTurnArray.length) {
//                        console.log('DEBUG: Returning stunTurnArray of: ' + JSON.stringify(ret.stunTurnArray));
                        xs.data.stunTurnArray = ret.stunTurnArray;
                    }
                    res.send(JSON.stringify(xs));
                } else {
                    if ('nosession' === ret.result) {
                        req.session = null;
                    }
                    res.send(JSON.stringify(ret));
                }
            }
        });
    } else if (req.body && req.body.email && req.body.password) {
        api.Login({
            email: req.body.email,
            password: req.body.password,
            host: refHost,
            callback: function(ret) {
                var xs = {};
                if ('success' === ret.result) {
                    xs = {
                        result: 'success',
                        data: {
                            rid: ret.rid,
                            jid: ret.jid,
                            sid: ret.sid,
                            email: ret.email,
                            name: ret.name
                        }
                    };

                    if (ret.stunTurnArray.length) {
//                        console.log('DEBUG: Returning stunTurnArray of: ' + JSON.stringify(ret.stunTurnArray));
                        xs.data.stunTurnArray = ret.stunTurnArray;
                    }

                    req.session.sid = ret.gsid;
                    if (req.session.anon) {
                        delete req.session.anon;
                    }

                    res.send(JSON.stringify(xs));
                } else {
                    res.send(JSON.stringify(ret));
                }
            }
        });
    } else if (req.body && req.body.anon) {
        api.Login({
            anon: true,
            host: refHost,
            callback: function(ret) {
                var xs = {};
                if ('success' === ret.result) {
                    xs = {
                        result: 'success',
                        data: {
                            rid: ret.rid,
                            jid: ret.jid,
                            sid: ret.sid
                        }
                    };

                    if (ret.stunTurnArray.length) {
//                        console.log('DEBUG: Returning stunTurnArray of: ' + JSON.stringify(ret.stunTurnArray));
                        xs.data.stunTurnArray = ret.stunTurnArray;
                    }

                    req.session.anon = true;
                    res.send(JSON.stringify(xs));
                } else {
                    res.send(JSON.stringify(ret));
                }
            }
        });
    } else {
        if (!req.body) {
            console.log('accounts_service[/login][error]: No req.body to process.');
            res.send('{"result": "error"}');
        } else if (!req.body.email) {
//            console.log('accounts_service[/login][error]: No req.body.email to process.');
            res.send('{"result": "noemail"}');
        } else if (!req.body.password) {
            console.log('accounts_service[/login][error]: No req.body.password to process.');
            res.send('{"result": "nopassword"}');
        }
    }
});

app.post('/logout', function(req, res) {
    if (req.session.sid) {
        api.Logout({
            sid: req.session.sid,
            callback: function(ret) {
                req.session = null;
                res.send(JSON.stringify(ret));
            }
        });
    } else {
        console.log('accounts_service[/logout][error]: No session id detected.');
        res.send('{"result": "notloggedin"}');
    }
});

app.post('/reqxmppconn', function(req, res) {
//    console.log('COOKIESESSION: ', req.session);
    if (req.session.sid) {
        api.ReqXmppConn({
            sid: req.session.sid,
            callback: function(ret) {
                var xs = {};
                if ('success' === ret.result) {
                    xs = {
                        result: 'success',
                        data: {
                            rid: ret.rid,
                            jid: ret.jid,
                            sid: ret.sid,
                            email: ret.email,
                            name: ret.name
                        }
                    };
                    res.send(JSON.stringify(xs));
                } else {
                    if ('nosession' === ret.result) {
                        req.session = null;
                    }
                    res.send(JSON.stringify(ret));
                }
            }
        });
    } else if (req.session.anon) {
        api.ReqXmppConn({
            anon: true,
            callback: function(ret) {
                var xs = {};
                if ('success' === ret.result) {
                    xs = {
                        result: 'success',
                        data: {
                            rid: ret.rid,
                            jid: ret.jid,
                            sid: ret.sid
                        }
                    };
                    res.send(JSON.stringify(xs));
                } else {
                    res.send(JSON.stringify(ret));
                }
            }
        });
    } else {
        console.log('accounts_service[/reqxmppconn][error]: No session id detected.');
        res.send('{"result": "notloggedin"}');
    }
});

app.listen(settings.accounts.serviceport || 8083);
