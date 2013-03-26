/*jslint node: true, white: true */

var settings = {};

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
        persist: true,      // Normally rooms are non-persistent.
        allow_overflow: true,
        allow_maxparticipants_from_client: true,
        maxparticipants_ceiling: 50,
        maxspotsallowed: 6,
        default_room: 'Lobby',
        default_room_persist: false,

        username: 'roommanager@' + settings.SERVERNAME + '/roommanager',
        usernametest: 'roommanager@' + settings.SERVERNAME + '/roommanagertest',
        password: 'being.the.doorman.always',

        public_room_node: settings.CONF_SERVICE.replace(/@/,'') + '/public',
        kill_public_room_node: '1',

        wbstoragelocation: '~/wbstorage'
    };

    settings.dynamodb = {
        endpoint: 'dynamodb.us-west-1.amazonaws.com',
        awsRegion: 'us-west-1',     // aws-sdk requires short-hand region name.
        accessKeyId: 'AKIAJWJEBZBGT6TPH32A',
        secretAccessKey: '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',
        tables: {
            ACTIVEROOMS: 'dev_active_rooms',
            ROOMCONTENTS: 'dev_room_contents'
        }
    };

    settings.accounts = {
        servicePort: 8083,
        xmppAccountServerSecret: 'dev.GoCast.SecretWU78zz',
        xmppAccountServerBase: 'http://localhost:9090/plugins/userService/userservice?',
        dbUserTable: 'dev_UserTable',
        dbUserRoomTable: 'dev_UserRoomTable',
        dbVisitorTable: 'dev_VisitorTable',
        dbPublicRoomTable: 'dev_PublicRoomTable',
        dbAssociatedRoomTable: 'dev_AssociatedRoomTable',
        mailgunKey: 'key-65ism99rlme7svrn93qc-cormdknx-42',      // Bob Wolff - rwolff@gocast.it key -- standard account now.
        mailgunUser: 'postmaster@carouselmail.gocast.it',
        mailgunPass: '7s2ssv2l5pe3',
        inviteFromAddress: 'support@gocast.it',
        inviteFromName: 'GoCast Support',
        inviteSubject: 'Welcome! Please validate your new GoCast account.',
        cookieSecret: '2IVNoseAcNptJ1c9dyV96e8slR7d1V3p'
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

    settings.filecatcher = {
        username: 'filecatcher@' + settings.SERVERNAME + '/filecatcher',
        password: 'receving.and.sharing.files',
        dest: '/home/ec2-user/fileshare'
    };

    settings.feedbackbot = {
        username: 'feedback_bot_dev@' + settings.SERVERNAME,
        password: 'feedback.is.good.burp'
    };

    settings.notifier = {
        username: 'notifier@' + settings.SERVERNAME,
        password: 'reporting.lots.to.you',
        notify_list: ['rwolff@dnle.gocast.it', 'rwolff@dev.gocast.it']
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
        awsRegion: 'us-west-1',     // aws-sdk requires short-hand region name.
        accessKeyId: 'AKIAJWJEBZBGT6TPH32A',
        secretAccessKey: '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',
        tables: {
            ACTIVEROOMS: 'room_active_list',
            ROOMCONTENTS: 'room_contents'
        }
    };

    settings.accounts = {
        servicePort: 8083,
        xmppAccountServerSecret: 'video.GoCast.oXCXC877',
        xmppAccountServerBase: 'http://localhost:9090/plugins/userService/userservice?',
        dbUserTable: 'main_UserTable',
        dbUserRoomTable: 'main_UserRoomTable',
        dbVisitorTable: 'main_VisitorTable',
        dbPublicRoomTable: 'main_PublicRoomTable',
        dbAssociatedRoomTable: 'main_AssociatedRoomTable',
        mailgunKey: 'key-65ism99rlme7svrn93qc-cormdknx-42',      // Bob Wolff - rwolff@gocast.it key
        mailgunUser: 'postmaster@carouselmail.gocast.it',
        mailgunPass: '7s2ssv2l5pe3',
        inviteFromAddress: 'support@gocast.it',
        inviteFromName: 'GoCast Support',
        inviteSubject: 'Welcome! Please validate your new GoCast account.',
        cookieSecret: 'Q9DHrCKkkubiSKZdNlu91rDEO6URQ5LF'
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

    settings.filecatcher = {
        username: 'filecatcher@' + settings.SERVERNAME + '/filecatcher',
        password: 'receving.files.in.xmpp',
        dest: '/home/ec2-user/fileshare'
    };

    settings.feedbackbot = {
        username: 'feedback_bot_gocast@' + settings.SERVERNAME,
        password: 'feedback.gocast.teambang'
    };

    settings.notifier = {
        username: 'overseer@' + settings.SERVERNAME,
        password: 'the.overseer.rocks',
        notify_list: ['rwolff@video.gocast.it']
    };

    settings.roommanager = {
        username: 'overseer@' + settings.SERVERNAME + '/roommanager',
        usernametest: 'overseer@' + settings.SERVERNAME + '/roommanagertest',
        password: 'the.overseer.rocks',
        maxparticipants_ceiling: 5,
        maxspotsallowed: 6,

        public_room_node: settings.CONF_SERVICE.replace(/@/,'') + '/public',
        kill_public_room_node: '1',

        persist: true,      // Normally rooms are non-persistent.
        wbstoragelocation: '~/wbstorage'
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
        awsRegion: 'us-west-1',     // aws-sdk requires short-hand region name.
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

    settings.filecatcher = {
        username: 'filecatcher@' + settings.SERVERNAME + '/filecatcher',
        password: 'sharing.files.for.dnle',
        dest: '/home/ec2-user/fileshare'
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
        persist: true,      // Normally rooms are non-persistent.
        allow_overflow: true,
        allow_maxparticipants_from_client: true,
        maxparticipants_ceiling: 7,
        maxspotsallowed: 20,
        default_room: 'Lobby',
        default_room_persist: false,

        username: 'roommanager@' + settings.SERVERNAME + '/roommanager',
        usernametest: 'roommanager@' + settings.SERVERNAME + '/roommanagertest',
        password: 'the.gatekeeper.rules',

        public_room_node: settings.CONF_SERVICE.replace(/@/,'') + '/public',

        wbstoragelocation: '~/wbstorage'
    };
}
else if (process.env.STANFORDCCC === 1 || process.env.STANFORDCCC === '1') {
    console.log('/////////////////////////////////////////////');
    console.log('// STANFORD CREATIVITY SETTINGS ACTIVATED. //');
    console.log('/////////////////////////////////////////////');

    settings.SERVERNAME = 'dnle.gocast.it';
    settings.SERVERPORT = 5222;
    settings.CONF_SERVICE = '@ccc-conference.dnle.gocast.it';

    settings.dynamodb = {
        endpoint: 'dynamodb.us-west-1.amazonaws.com',
        awsRegion: 'us-west-1',     // aws-sdk requires short-hand region name.
        accessKeyId: 'AKIAJWJEBZBGT6TPH32A',
        secretAccessKey: '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',
        tables: {
            ACTIVEROOMS: 'creativity_active_rooms',
            ROOMCONTENTS: 'creativity_room_contents'
        }
    };

    settings.overseer = {
        username: 'ccc_overseer@' + settings.SERVERNAME,
        password: 'creativity.expands.the.universe',
        OVERSEER_NICKNAME: 'overseer'
    };

    settings.switchboard = {
        username: 'switchboard_ccc@' + settings.SERVERNAME,
        password: 'ccc.switching.users',
        APP_ID: '458515917498757',
        APP_SECRET: 'c3b7a2cc7f462b5e4cee252e93588d45'
    };

    settings.logcatcher = {
        username: 'ccc_logcatcher@' + settings.SERVERNAME + '/logcatcher',
        password: 'ccc.catcher.ofbugs'
    };

    settings.filecatcher = {
        username: 'ccc_filecatcher@' + settings.SERVERNAME + '/filecatcher',
        password: 'ccc.sharing.files',
        dest: '/home/ec2-user/ccc_fileshare'
    };

    settings.feedbackbot = {
        username: 'feedback_bot_ccc@' + settings.SERVERNAME,
        password: 'feedback.is.good.ccc'
    };

    settings.notifier = {
        username: 'ccc_notifier@' + settings.SERVERNAME,
        password: 'notification.bot.ccc',
        notify_list: ['rwolff@dnle.gocast.it']
    };

    settings.roommanager = {
        persist: true,      // Normally rooms are non-persistent.
        allow_overflow: true,
        allow_maxparticipants_from_client: true,
        maxparticipants_ceiling: 7,
        maxspotsallowed: 20,
        default_room: 'Lounge',
        default_room_persist: false,

        username: 'ccc_roommanager@' + settings.SERVERNAME + '/roommanager',
        usernametest: 'ccc_roommanager@' + settings.SERVERNAME + '/roommanagertest',
        password: 'the.gatekeeper.rules.ccc',

        public_room_node: settings.CONF_SERVICE.replace(/@/,'') + '/public',

        wbstoragelocation: '~/wbstorage_creativity'
    };
}


module.exports = settings;
