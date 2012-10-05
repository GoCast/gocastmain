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
    settings.roommanager = {
        devel: true
        allow_overflow: true,
        allow_maxparticipants_from_client: true,
        maxparticipants_ceiling: 25,
        default_room: 'Lobby'
    };
}
else {
    settings.roommanager = {
        // Features
    };
}

//
// As an example, we can make special checks for enterprise values too...
//
if (process.env.STANFORDGOCAST === 1) {
    settings.roommanager = {
        maxparticipants_ceiling: 50
    };
}


module.exports = settings;
