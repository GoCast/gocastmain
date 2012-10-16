/*jslint node: true */

var settings = {};

//
// Setup the bare-bones defaults. All of these can be overridden below in DEVEL or NON_DEVEL areas.
//
settings.roommanager = {
    maxparticipants_ceiling: 12
};

// Features
//
// For settings.roommanager:
// - allow_kick (TBD)
// - allow_lock (TBD)
// - allow_knock (TBD)
// - allow_invite (TBD)
// - allow_overflow: true | false
// - maxparticipants_ceiling: integer
//      This controls how many the max is set to in a MUC room on the XMPP server upon creation.
//      It also impacts when overflow is used if overflow is allowed.
// - allow_maxparticipants_from_client
//      Users can artifically set a max # of clients in a room via the URL. This value
//      must be equal or less than maxparticipants_ceiling however.
// - default_room: string
//      If no room is specified, use this room name rather than a random name.

//
// Allow for having separate devel settings if an environment variable is set.
//
if (process.env.SETTINGS_DEVEL === 1 || process.env.SETTINGS_DEVEL === '1') {
    console.log('/////////////////////////////////');
    console.log('// **DEV** SETTINGS ACTIVATED. //');
    console.log('/////////////////////////////////');

    settings.SERVERNAME = 'dev.gocast.it';
    settings.SERVERPORT = 5222;
    settings.CONF_SERVICE = '@conference.dev.gocast.it';

    settings.roommanager = {
        allow_overflow: true,
        allow_maxparticipants_from_client: true,
        maxparticipants_ceiling: 25,
        default_room: 'Lobby',

        username: 'roommanager@' + settings.SERVERNAME + '/roommanager',
        usernametest: 'roommanager@' + settings.SERVERNAME + '/roommanagertest',
        password: 'being.the.doorman.always'
    };

    settings.dynamodb = {
        endpoint: 'dynamodb.us-west-1.amazonaws.com',
        accessKeyId: 'AKIAJWJEBZBGT6TPH32A',
        secretAccessKey: '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',
        tables: {
            ACTIVEROOMS: 'dev_active_rooms',
            ROOMCONTENTS: 'dev_room_contents'
        }
    };

    settings.overseer = {
        username: 'overseer@' + settings.SERVERNAME,
        password: 'dev.mode.overseer',
        OVERSEER_NICKNAME: 'dev_overseer'
    };

    settings.switchboard = {
        username: 'switchboard_dev@' + settings.SERVERNAME,
        password: 'dev.lookup.users',
        APP_ID: '458515917498757',
        APP_SECRET: 'c3b7a2cc7f462b5e4cee252e93588d45'
    };

    settings.logcatcher = {
        username: 'logcatcher@' + settings.SERVERNAME + '/logcatcher',
        password: 'grab.those.dev.bugreports'
    };

    settings.feedbackbot = {
        username: 'feedback_bot_dev@' + settings.SERVERNAME,
        password: 'feedback.is.good.burp'
    };

    settings.notifier = {
        username: 'notifier@' + settings.SERVERNAME,
        password: 'reporting.lots.to.you',
        notify_list: ['rwolff@dnle.gocast.it']
    };

}
else {
    console.log('/////////////////////////////////////////////////');
    console.log('// REGULAR VIDEO.GOCAST.IT SETTINGS ACTIVATED. //');
    console.log('/////////////////////////////////////////////////');

    settings.SERVERNAME = 'video.gocast.it';
    settings.SERVERPORT = 5222;
    settings.CONF_SERVICE = '@gocastconference.video.gocast.it';

    settings.dynamodb = {
        endpoint: 'dynamodb.us-west-1.amazonaws.com',
        accessKeyId: 'AKIAJWJEBZBGT6TPH32A',
        secretAccessKey: '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',
        tables: {
            ACTIVEROOMS: 'room_active_list',
            ROOMCONTENTS: 'room_contents'
        }
    };

    settings.overseer = {
        username: 'overseer@' + settings.SERVERNAME,
        password: 'the.overseer.rocks',
        OVERSEER_NICKNAME: 'overseer'
    };

    settings.switchboard = {
        username: 'switchboard_gocastfriends@' + settings.SERVERNAME,
        password: 'the.switchboard.answers',
        APP_ID: '458515917498757',
        APP_SECRET: 'c3b7a2cc7f462b5e4cee252e93588d45'
    };

    settings.logcatcher = {
        username: 'logcatcher@' + settings.SERVERNAME + '/logcatcher',
        password: 'log.catcher.gocast'
    };

    settings.feedbackbot = {
        username: 'feedback_bot_gocast@' + settings.SERVERNAME,
        password: 'feedback.gocast.teambang'
    };

    settings.notifier = {
        username: 'overseer@' + settings.SERVERNAME,
        password: 'the.overseer.rocks',
        notify_list: ['rwolff@video.gocast.it', 'jim@video.gocast.it']
    };

    settings.roommanager = {
        username: 'roommanager@' + settings.SERVERNAME + '/roommanager',
        usernametest: 'roommanager@' + settings.SERVERNAME + '/roommanagertest',
        password: 'the.overseer.rocks'
    };
}

//
// As an example, we can make special checks for enterprise values too...
//
if (process.env.STANFORDDNLE === 1 || process.env.STANFORDDNLE === '1') {
    console.log('/////////////////////////////////////////');
    console.log('// STANFORD DNLE SETTINGS ACTIVATED. //');
    console.log('/////////////////////////////////////////');

    settings.SERVERNAME = 'dnle.gocast.it';
    settings.SERVERPORT = 5222;
    settings.CONF_SERVICE = '@conference.dnle.gocast.it';

    settings.dynamodb = {
        endpoint: 'dynamodb.us-west-1.amazonaws.com',
        accessKeyId: 'AKIAJWJEBZBGT6TPH32A',
        secretAccessKey: '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',
        tables: {
            ACTIVEROOMS: 'dnle_active_rooms',
            ROOMCONTENTS: 'dnle_room_contents'
        }
    };

    settings.overseer = {
        username: 'overseer@' + settings.SERVERNAME,
        password: 'Overlooking.the.universe',
        OVERSEER_NICKNAME: 'overseer'
    };

    settings.switchboard = {
        username: 'switchboard_dnle@' + settings.SERVERNAME,
        password: 'dnle.switching.users',
        APP_ID: '458515917498757',
        APP_SECRET: 'c3b7a2cc7f462b5e4cee252e93588d45'
    };

    settings.logcatcher = {
        username: 'logcatcher@' + settings.SERVERNAME + '/logcatcher',
        password: 'dnle.catcher.ofbugs'
    };

    settings.feedbackbot = {
        username: 'feedback_bot_dnle@' + settings.SERVERNAME,
        password: 'feedback.is.good.dnle'
    };

    settings.notifier = {
        username: 'notifier@' + settings.SERVERNAME,
        password: 'notification.bot',
        notify_list: ['rwolff@dnle.gocast.it']
    };

    settings.roommanager = {
        allow_overflow: true,
        allow_maxparticipants_from_client: true,
        maxparticipants_ceiling: 7,
        default_room: 'Lobby',

        username: 'roommanager@' + settings.SERVERNAME + '/roommanager',
        usernametest: 'roommanager@' + settings.SERVERNAME + '/roommanagertest',
        password: 'the.gatekeeper.rules'
    };
}
else {
    console.log('ERROR in settings. Not picked up.');
}


module.exports = settings;
