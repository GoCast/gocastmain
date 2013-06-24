/*jslint sloppy: false, white: true, todo: true, browser: true, devel: true */
/*global window, Buffer, webkitURL */
'use strict';

var gc, fs;
var Callcast = {
    nick: 'myNicknameHere',
    SetSpot: function(info) {
        console.log('Callcast.SetSpot simulation for info: ' + JSON.stringify(info));
    }
    };
var app = {
    carousel: {}
};

$(document).ready(function() {
    console.log('Getting started with gcedit...');
//    gc = new GoCastJS.gcEdit({});   // Invalid start.

    fs = new GoCastJS.gcFileShare({domLocation: $('#spot2').get(0), number: 1002, type: 'gcEdit', networkObject: Callcast,
                                tinyIcon: '/images/logo.png', icon: '/images/logo.png',
                                enabledDesc: 'Edit text documents collaboratively', disabledDesc: 'Cannot edit at this time.'});

    console.log('Getting started with gcedit...');
//    gc = new GoCastJS.gcEdit({});   // Invalid start.

    gc = new GoCastJS.gcEdit({domLocation: $('#spot1')[0], number: 1001, type: 'gcEdit', networkObject: Callcast,
                                tinyIcon: '/images/logo.png', icon: '/images/logo.png',
                                enabledDesc: 'Edit text documents collaboratively', disabledDesc: 'Cannot edit at this time.'});

    gc.setScale(200, 300);

    gc.refreshSpot({from: 'other', code: '<h3>Hello</h3>'});

});

