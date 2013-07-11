/*jslint sloppy: false, white: true, todo: true, browser: true, devel: true */
/*global window, Buffer, webkitURL */
'use strict';

var gc, ed, fs, spotfactory;
var Callcast = {
    nick: 'myNicknameHere',
    SetSpot: function(info) {
        console.log('Callcast.SetSpot simulation for info: ' + JSON.stringify(info));
    }
    };
var app = {
    carousel: {
        disableMousewheel: function() {},
        enableMousewheel: function() {}
    }
};

$(document).ready(function() {
    console.log('Getting started with gcFileShare...');
//    gc = new GoCastJS.gcEdit({});   // Invalid start.

    spotfactory = new GoCastJS.SpotFactory();
    spotfactory.RegisterSpot('editor', GoCastJS.gcEdit);
    spotfactory.RegisterSpot('fileshare', GoCastJS.gcFileShare);
    ed = spotfactory.CreateSpot('editor', {domLocation: $('#spot1')[0], nick: Callcast.nick, spotnumber: 1001, type: 'gcEdit', networkObject: Callcast,
                                tinyIcon: '/images/logo.png', icon: '/images/logo.png'});
    fs = spotfactory.CreateSpot('fileshare', {domLocation: $('#spot2').get(0), nick: Callcast.nick, spotnumber: 1002, type: 'gcFileShare', networkObject: Callcast,
                                tinyIcon: '/images/logo.png', icon: '/images/logo.png'});

//    fs = new GoCastJS.gcFileShare({domLocation: $('#spot2').get(0), nick: Callcast.nick, spotnumber: 1002, type: 'gcEdit', networkObject: Callcast,
//                                tinyIcon: '/images/logo.png', icon: '/images/logo.png'});
// Optional items to override...                                enabledDesc: 'Edit text documents collaboratively', disabledDesc: 'Cannot edit at this time.'});
/*
    console.log('Getting started with gcedit...');

    gc = new GoCastJS.gcEdit({domLocation: $('#spot1')[0], nick: Callcast.nick, spotnumber: 1001, type: 'gcEdit', networkObject: Callcast,
                                tinyIcon: '/images/logo.png', icon: '/images/logo.png'});
//                                enabledDesc: 'Edit text documents collaboratively', disabledDesc: 'Cannot edit at this time.'});

    gc.setScale(200, 300);

    gc.refreshSpot({from: 'other', code: '<h3>Hello</h3>'});
*/
});

