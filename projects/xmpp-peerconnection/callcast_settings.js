/*jslint sloppy: false, white: true, todo: true, browser: true, devel: true */
/*global Buffer */
'use strict';

var GoCastJS = GoCastJS || {};

GoCastJS.CallcastSettings = function(server) {
    if (!server) {
        throw 'CallcastSettings: Must initialize with a server name';
    }

    switch (server) {
        case 'study.gocast.it':
        case 'carousel.gocast.it':
        case 'video.gocast.it':
            this.privPopulate({CALLCAST_XMPPSERVER: 'video.gocast.it',
                            ANON_USERNAME: 'anon_gocastconference@dev.gocast.it',
                            ANON_PASSWORD: 'gocast.video.anon',
                            CALLCAST_ROOMS: 'gocastconference.video.gocast.it',
                            AT_CALLCAST_ROOMS: '@gocastconference.video.gocast.it',
                            STUNSERVER: 'video.gocast.it', STUNSERVERPORT: 19302,
                            FEEDBACK_BOT: 'feedback_bot_gocast@video.gocast.it',
                            ROOMMANAGER: 'overseer@video.gocast.it/roommanager',
                            SWITCHBOARD_FB: 'switchboard_gocastfriends@video.gocast.it',
                            LOGCATCHER: 'logcatcher@video.gocast.it/logcatcher',
                            FILECATCHER: 'filecatcher@video.gocast.it/filecatcher',
                            MAX_PUBCHAT_SECONDS: 300
                            });
            break;
        case 'dev.gocast.it':
            this.privPopulate({CALLCAST_XMPPSERVER: 'dev.gocast.it',
                            ANON_USERNAME: 'anon_conference@dev.gocast.it',
                            ANON_PASSWORD: 'gocast.anon.user',
                            CALLCAST_ROOMS: 'conference.dev.gocast.it',
                            AT_CALLCAST_ROOMS: '@conference.dev.gocast.it',
                            STUNSERVER: 'dev.gocast.it', STUNSERVERPORT: 19302,
                            FEEDBACK_BOT: 'feedback_bot_dev@dev.gocast.it',
                            ROOMMANAGER: 'roommanager@dev.gocast.it/roommanager',
                            SWITCHBOARD_FB: 'switchboard_dev@dev.gocast.it',
                            LOGCATCHER: 'logcatcher@dev.gocast.it/logcatcher',
                            FILECATCHER: 'filecatcher@dev.gocast.it/filecatcher',
                            MAX_PUBCHAT_SECONDS: 300
                            });
            break;
        case 'dnle.gocast.it':
            this.privPopulate({ CALLCAST_XMPPSERVER: 'dnle.gocast.it',
                            ANON_USERNAME: 'anon_conference@dev.gocast.it',
                            ANON_PASSWORD: 'dnle.anon.user',
                            CALLCAST_ROOMS: 'conference.dnle.gocast.it',
                            AT_CALLCAST_ROOMS: '@conference.dnle.gocast.it',
                            STUNSERVER: 'dnle.gocast.it', STUNSERVERPORT: 19302,
                            FEEDBACK_BOT: 'feedback_bot_dnle@dnle.gocast.it',
                            ROOMMANAGER: 'roommanager@dnle.gocast.it/roommanager',
                            SWITCHBOARD_FB: 'switchboard_dnle@dnle.gocast.it',
                            LOGCATCHER: 'logcatcher@dnle.gocast.it/logcatcher',
                            FILECATCHER: 'filecatcher@dnle.gocast.it/filecatcher',
                            MAX_PUBCHAT_SECONDS: 300
                            });
            break;
        case 'creativity.gocast.it':
            this.privPopulate({ CALLCAST_XMPPSERVER: 'dnle.gocast.it',
                            ANON_USERNAME: 'anon_ccc-conference@dev.gocast.it',
                            ANON_PASSWORD: 'ccc.anon.user',
                            CALLCAST_ROOMS: 'ccc-conference.dnle.gocast.it',
                            AT_CALLCAST_ROOMS: '@ccc-conference.dnle.gocast.it',
                            STUNSERVER: 'dnle.gocast.it', STUNSERVERPORT: 19302,
                            FEEDBACK_BOT: 'feedback_bot_ccc@dnle.gocast.it',
                            ROOMMANAGER: 'ccc_roommanager@dnle.gocast.it/roommanager',
                            SWITCHBOARD_FB: 'switchboard_ccc@dnle.gocast.it',
                            LOGCATCHER: 'ccc_logcatcher@dnle.gocast.it/logcatcher',
                            FILECATCHER: 'ccc_filecatcher@dnle.gocast.it/filecatcher',
                            MAX_PUBCHAT_SECONDS: 300
                            });
            break;
        default:
            throw 'Error - unknown servername for init(): ' + server;
    }
};

GoCastJS.CallcastSettings.prototype = {
    privPopulate: function(obj) {
        var k;

        if (!obj) {
            throw 'Invalid. Must supply object with properties to apply.';
        }

        // Zero out the settings values.
        this.values = {};

        for (k in obj)
        {
            if (obj.hasOwnProperty(k)) {
                // Otherwise we're good to assign it the override.
                this.values[k] = obj[k];
//                console.log('privPopulate: Property ' + k + ' has a new value of ' + obj[k]);
            }
        }

//        console.log('privPopulate: dump: ', Callcast.settings.values);
    },

    //
    // @brief Give back the value in a particular values[entry] property
    //
    get: function(entry) {
        if (this.values) {
            return this.values[entry];
        }

        return null;
    },

    //
    // @brief Do a bulk-transfer of all .values into the 'to' object sent in.
    //
    transferValues: function(to) {
        var k;

        if (!to || typeof(to) !== 'object') {
            throw 'CallcastSettings: transferValues: ERROR: Must pass in a valid object.';
        }

        for (k in this.values) {
            if (this.values.hasOwnProperty(k)) {
                to[k] = this.values[k];
            }
        }
    }
};
