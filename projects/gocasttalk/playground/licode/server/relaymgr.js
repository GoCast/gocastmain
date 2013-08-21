var express = require('express'),
    net = require('net'),
    N = require('./nuve'),
    fs = require('fs'),
    config = require('./licode_config'),
    app = express(),
    roomprefix = 'room',
    roomnumber = 0;

app.use(express.bodyParser());

app.configure(function() {
    'use strict';
    app.use(express.errorHandler({
       dumpExceptions: true,
       showStack: true 
    }));
    app.use(express.logger());
    app.use(express.static(__dirname + '/public'));
});

app.use(function(req, res, next) {
    'use strict';
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
    res.header('Access-Control-Allow-Headers', 'origin, content-type');
    if ('OPTIONS' === req.method) {
        res.send(200);
    } else {
        next();
    }
});

function gotRoom(res, uname, role) {
    return function(room) {
        console.log('gotRoom(): Got room: ', room);
        console.log('Requesting token for ' + JSON.stringify({'uname': uname, 'role': role}));

        if ('string' === typeof(room)) {
            room = JSON.parse(room);
        }

        N.API.createToken(room._id, uname, role, function(token) {
            console.log('createToken(): Token created: ', token);
            res.send('{"token": "' + token + '", "roomid": "' + room._id + '"}');
        }, function() {
            console.log('createToken: Failed.');
            res.send('{"result": "error_token_create"}');
        });
    };
}

// Init NUVE API
console.log('relaymgr(): Initializing NUVE API...');
N.API.init(config.nuve.superserviceID, config.nuve.superserviceKey, 'http://localhost:3000/');
console.log('relaymgr(): Initializing NUVE API... DONE');

// Tokens are a way for the client to establish a connection with the relay server 'room' for publishing local media.
app.post('/reqroomtoken', function(req, res) {
    var uname = req.body.uname,
        role = req.body.role,
        roomid = req.body.roomid || '';

    console.log('Roomid: ', roomid);
    if ('' === roomid) {
        console.log('[/reqroomtoken]: Creating room [' + roomprefix + roomnumber + ']...');
        N.API.createRoom(roomprefix + (roomnumber++), gotRoom(res, uname, role), function() {
            console.log('[/reqroomtoken]: Error creating room.');
            res.send('{"result": "error_room_create"}');
        });
    } else {
        console.log('[/reqroomtoken]: Searching room with id: [' + roomid + ']...');
        N.API.getRoom(roomid, gotRoom(res, uname, role), function() {
            console.log('[/reqroomtoken]: Error searching room.');
            res.send('{"result": "error_room_search"}');
        });        
    }
});

app.listen(3001);