/**
 * Server Bot - All-encompassing mechanism for listening/logging feedback
 *              as well as acting as the overseer of rooms to control the network.
 **/

 /*
 TODO
** Then add command reception and notification broadcast.
** Then recovery when kicked from a room or room destroyed etc.
** Then reading of config file and periodic re-reading.

If room gets locked & user gets bumped offline...because they are anonymous, they'll get a new
anonymous jid/resource on re-connect. They won't be able to get back in the room. So, if the room
is locked, a user could ask to 'knock' which would send a message to the overseer - who could
then send a message to the group saying 'nick' is requesting to come in the room. Invite them?

 */

/*jslint node: true, nomen: true, white: true */
var settings = require('./settings');   // Our GoCast settings JS
if (!settings) {
    settings = {};
}
if (!settings.roommanager) {
    settings.roommanager = {};
}
if (!settings.dynamodb) {
    settings.dynamodb = {};
}

var sys = require('util');
var xmpp = require('node-xmpp');
var fs = require('fs');
var ltx = require('ltx');
var evt = require('events');
var ddb = require('dynamodb').ddb({ endpoint: settings.dynamodb.endpoint,
                                    accessKeyId: settings.dynamodb.accessKeyId,
                                    secretAccessKey: settings.dynamodb.secretAccessKey});
var Canvas = require('canvas');
var nodewb = require('./nodeWB');

var eventManager = new evt.EventEmitter();
var argv = process.argv;

'use strict';

var overseer;   // Utilized much later. Defined now.
var gSkipJoining = false;   // Debug item - RMW

//if (argv.length != 4) {
//    sys.puts('Usage: node echo_bot.js <my-jid> <my-password>');
//    process.exit(1);
//}

//process.on('uncaughtException', function (err) {
//  console.log('Caught exception: ' + err);
//});

function size(assocArray) {
    var k, n = 0;
    for (k in assocArray) {
        if (assocArray.hasOwnProperty(k)) {
            n += 1;
        }
    }
    return n;
}

function pad(num, size) {
    var s = '000000000' + num;
    return s.substr(s.length - size);
}

function pad2(num) { return pad(num, 2); }

//
// Return Date/Time as mm-dd-yyyy hh:mm::ss
//
function logDate() {
    var d = new Date();

    return pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + '-' + d.getFullYear() + ' ' +
            pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
}

//
//
// R O O M   D A T A B A S E
//
//
function RoomDatabase(notifier) {
    this.roomList = {};
    // Table names on DynamoDB
    this.ACTIVEROOMS = settings.dynamodb.tables.ACTIVEROOMS;
    this.ROOMCONTENTS = settings.dynamodb.tables.ROOMCONTENTS;
    this.notifier = notifier;
}

RoomDatabase.prototype.log = function(msg) {
    console.log(logDate() + ' - roomDB: ', decodeURI(msg));
};

RoomDatabase.prototype.notifylog = function(msg) {
    if (this.notifier) {
        this.notifier.sendMessage(logDate() + ' RoomDatabase: ' + decodeURI(msg));
    }
    else {
        console.log(logDate() + ' - NULL-NOTIFIER-MESSAGE: RoomDatabase: ' + decodeURI(msg));
    }
};

RoomDatabase.prototype.LoadRooms = function(cbSuccess, cbFailure) {
    var self = this;

    ddb.scan(this.ACTIVEROOMS, {}, function(err, res) {
        var i, len;

        if (err) {
            if (err.statusCode === 400) {
                self.notifylog('DynamoDB Throughput ERROR: LoadRooms scan.');
            }
            self.log(err);
            if (cbFailure) {
                cbFailure(err);
            }
        } else {
            self.log('Loading ' + res.count + ' rooms from the database.');

            self.roomList = {};
            len = res.count;

            for (i = 0; i < len; i += 1)
            {
                self.roomList[res.items[i].roomname.toLowerCase()] = res.items[i];
                // Roomname in the object is redundant. Remove it.
                delete self.roomList[res.items[i].roomname.toLowerCase()].roomname;
            }

//            self.log(self.roomList);

            if (cbSuccess) {
                cbSuccess(self.roomList);
            }
        }
      });
};

RoomDatabase.prototype.AddRoom = function(roomname, obj, cbSuccess, cbFailure) {
    var self = this;

//    this.log('Adding room: ' + (roomname || obj.roomname));
    if (roomname !== roomname.toLowerCase()) {
        self.log('WARNING: AddRoom: UpperCase roomname given. Squashing case before storing for: ' + roomname);
        roomname = roomname.toLowerCase();
    }

    if (!obj.roomname && roomname) {
        obj.roomname = roomname;
    }

    ddb.putItem(this.ACTIVEROOMS, obj, {}, function(err, res, cap) {
        if (err)
        {
            if (err.statusCode === 400) {
                self.notifylog('DynamoDB Throughput ERROR: AddRoom room: ' + roomname);
            }
            self.log('AddRoom: ERROR: ' + err);
            cbFailure(err);
        } else {
 //           self.log('AddRoom: Success: ' + cap);
 //           self.log(res);
            cbSuccess(res, cap);
        }
    });
};

RoomDatabase.prototype.RemoveRoom = function(roomname, cbSuccess, cbFailure) {
    var self = this;

    this.log('Removing room: ' + roomname);
    if (roomname !== roomname.toLowerCase()) {
        self.log('WARNING: RemoveRoom: UpperCase roomname given. Squashing case before removing for: ' + roomname);
        roomname = roomname.toLowerCase();
    }

    // Make sure all contents for this room are removed automatically as well.
    this.RemoveAllContentsFromRoom(roomname, function() {
        ddb.deleteItem(self.ACTIVEROOMS, roomname, null, {}, function(err, res, cap) {
            if (err)
            {
                if (err.statusCode === 400) {
                    self.notifylog('DynamoDB Throughput ERROR: RemoveRoom room: ' + roomname);
                }
                self.log('RemoveRoom: ERROR: ' + err);
                cbFailure(err);
            } else {
     //           self.log('RemoveRoom: Success: ' + cap);
     //           self.log(res);
                cbSuccess(res, cap);
            }
        });
    }, function(msg) {
        self.log('RemoveRoom: RemoveAllContentsFromRoom: failed to complete: ' + msg);
    });
};

//
// Will auto-correct booleans and turn them into true==>1 and false==>0
//
RoomDatabase.prototype.validateObj = function(obj) {
    var k, tk, retobj = {};

    for (k in obj)
    {
        if (obj.hasOwnProperty(k)) {
            tk = typeof obj[k];

            if (tk === 'boolean') {
                retobj[k] = obj[k] ? 1 : 0;
            }
            else if (tk !== 'string' && tk !== 'number') {
                return null;
            }
            else if (obj[k] !== '') {   // Don't allow null values as dynamodb doesn't like them.
                retobj[k] = obj[k];
            }
        }
    }

    return retobj;
};

RoomDatabase.prototype.AddContentToRoom = function(roomname, spotnumber, obj, cbSuccess, cbFailure) {
    var self = this,
        putobj = null;

    if (!this.roomList[roomname]) {
        this.log('AddContentToRoom: ERROR: roomname [' + roomname + '] doesnt exist yet. Cannot add contents.');
        return false;
    }

    // Build our 'putobj' one property at a time ensuring each property of 'obj' is a string or a number.
    putobj = this.validateObj(obj);
    if (!putobj) {
        this.log('AddContentToRoom: ERROR: obj given must be strings or numbers only.');
        return false;
    }

    if (typeof spotnumber === 'number') {
        // translate to a string.
        spotnumber = spotnumber.toString();
    }

    if (typeof roomname !== 'string' || typeof spotnumber !== 'string') {
        this.log('AddContentToRoom: ERROR: roomname and spotnumber given must be strings.');
        return false;
    }

    putobj.roomname = roomname;
    putobj.spotnumber = spotnumber;

    // Kill off oddball items we don't need to have in the database taking up space and IO costs.
    delete putobj.xmlns;
    delete putobj.cmdtype;
    delete putobj.spotreplace;

//    this.log('Adding content to room: ' + roomname + ' in spotnumber: ' + spotnumber);
//    console.log('DEBUG:Adding content to room: full validated obj: ', putobj);

    ddb.putItem(this.ROOMCONTENTS, putobj, {}, function(err, res, cap) {
        if (err)
        {
            if (err.statusCode === 400) {
                self.notifylog('DynamoDB Throughput ERROR: AddContentToRoom room: ' + roomname + ' spotnumber: ' + spotnumber);
            }
            self.log('AddContentToRoom: ERROR: ' + err);
            cbFailure(err);
        } else {
//            self.log('AddContentToRoom: Success: ' + cap);
//            self.log(res);
            cbSuccess(res, cap);
        }
    });

    return true;
};

RoomDatabase.prototype.LoadContentsFromDBForRoom = function(roomname, cbSuccess, cbFailure) {
     var self = this,
        options = {},
        buildup = [],
        i, len,
        QueryCB = null,
        batchDelay = 500,
        maxPerBatch = 2;

    QueryCB = function(err, res, cap) {
        if (err)
        {
            if (err.statusCode === 400) {
                self.notifylog('DynamoDB Throughput ERROR: QueryCB-Load room: ' + roomname);
            }
            self.log('LoadContentsFromDBForRoom:query ERROR: ' + err);
            console.log('Raw err:', err);
            cbFailure(err);
        } else {
//            console.log('LoadContentsFromDBForRoom:query Success: ', res);
            // Now we have an object in res.items which is an array of objects that contain 'roomname' and 'spotnumber'
            len = res.items.length;

//            console.log('DEBUG: Got QueryCB answer on roomname=' + roomname + ' res=', res);

            // If there were no results from the query, then we're all good here. No entries.
            if (!len) {
                if (buildup.length) {
//                    console.log('LoadContentsFromDBForRoom: SUCCESS. Loaded ' + buildup.length + ' spots for room: ' + roomname);
                    cbSuccess(buildup);
                }
                else {
//                    console.log('LoadContentsFromDBForRoom: No Room contents to load in ' + roomname + '. SUCCESS.');
                    cbSuccess();
                }
                return true;
            }

            // Building a master list to pass back of all contents in the room.
            for (i = 0; i < len; i += 1)
            {
                buildup.push(res.items[i]);
            }

            // If there is more data in the query, delay and then query again.
            if (res.lastEvaluatedKey.hash) {
                options.exclusiveStartKey = res.lastEvaluatedKey;
                setTimeout(function() {
//                    console.log('DEBUG: Going for another iteration roomname=' + roomname);
                    ddb.query(self.ROOMCONTENTS, roomname, options, QueryCB);
                }, batchDelay);
            }
            else {
//                console.log('LoadContentsFromDBForRoom: SUCCESS. Loaded ' + buildup.length + ' spots for room: ' + roomname);
                cbSuccess(buildup);
            }
        }
    };

   if (typeof roomname !== 'string') {
        this.log('LoadContentsFromDBForRoom: ERROR: roomname given must be a string.');
        cbFailure('Room must be a string.');
        return false;
    }

    this.log('Loading ALL contents from db for room: ' + roomname);

    options = { limit: maxPerBatch };

//    console.log('DEBUG: Going for database query on roomname=' + roomname);
    ddb.query(this.ROOMCONTENTS, roomname, options, QueryCB);
};

RoomDatabase.prototype.RemoveContentFromRoom = function(roomname, spotnumber, cbSuccess, cbFailure) {
    var self = this;

    spotnumber = spotnumber.toString();

    if (!this.roomList[roomname]) {
        this.log('RemoveContentFromRoom: ERROR: roomname [' + roomname + '] doesnt exist yet. Cannot remove contents.');
        return false;
    }

    if (typeof roomname !== 'string' || typeof spotnumber !== 'string') {
        this.log('RemoveContentFromRoom: ERROR: roomname and spotnumber given must be strings.');
        return false;
    }

//    this.log('Removing content from room: ' + roomname + ' in spotnumber: ' + spotnumber);

    ddb.deleteItem(this.ROOMCONTENTS, roomname, spotnumber, {}, function(err, res, cap) {
        if (err)
        {
            if (err.statusCode === 400) {
                self.notifylog('DynamoDB Throughput ERROR: RemoveContentFromRoom room: ' + roomname + ' spotnumber: ' + spotnumber);
            }
            self.log('RemoveContentFromRoom: ERROR: ' + err);
            cbFailure(err);
        } else {
//            self.log('RemoveContentFromRoom: Success: ' + cap);
//            self.log(res);
            cbSuccess(res, cap);
        }
    });
};

RoomDatabase.prototype.RemoveAllContentsFromRoom = function(roomname, cbSuccess, cbFailure) {
    var self = this,
        options = {},
        buildup = [],
        i, len,
        toDel = {},
        QueryCB = null,
        batchDelay = 500,
        maxPerBatch = 2;

    QueryCB = function(err, res, cap) {
        if (err)
        {
            if (err.statusCode === 400) {
                self.notifylog('DynamoDB Throughput ERROR: QueryCB-Remove room: ' + roomname);
            }
            self.log('RemoveAllContentsFromRoom:query ERROR: ' + err);
            console.log('Raw err:', err);
            cbFailure(err);
        } else {
//            console.log('RemoveAllContentsFromRoom:query Success: ', res);
            // Now we have an object in res.items which is an array of objects that contain 'roomname' and 'spotnumber'
            len = res.items.length;
            buildup = [];

            // If there were no results from the query, then we're all good here. No entries.
            if (!len && !buildup.length) {
//                console.log('RemoveAllContentsFromRoom: No Room contents to delete. SUCCESS.');
                cbSuccess();
                return true;
            }

            for (i = 0; i < len; i += 1)
            {
                buildup.push([res.items[i].roomname, res.items[i].spotnumber]);
            }

            toDel[self.ROOMCONTENTS] = buildup;
//            console.log('Interim toDel....', toDel);
                ddb.batchWriteItem(null, toDel, function(errdel, resdel) {
                if (errdel)
                {
                    if (errdel.statusCode === 400) {
                        self.notifylog('DynamoDB Throughput ERROR: batchWriteItem room: ' + roomname);
                    }
                    self.log('RemoveAllContentsFromRoom:batchWriteItem ERROR: ' + errdel);
                    cbFailure(errdel);
                } else {
//                    console.log('RemoveAllContentsFromRoom:batchWriteItem Success: ', resdel);

                    // On a successful delete, we check to see if we go around again for more...
                    if (res.lastEvaluatedKey.hash) {
                        options.exclusiveStartKey = res.lastEvaluatedKey;
//                        console.log('Secondary iteration starting from:', res.lastEvaluatedKey);

//                        console.log('table:', self.ROOMCONTENTS, ' roomname:', roomname, ' options:', options);
                        setTimeout(function() {
                            ddb.query(self.ROOMCONTENTS, roomname, options, QueryCB);
                        }, batchDelay);
                    }
                    else {
                        console.log('RemoveAllContentsFromRoom: SUCCESS.');
                        cbSuccess();
                    }
                }
            });
        }
    };

    if (!this.roomList[roomname]) {
        this.log('RemoveAllContentsFromRoom: ERROR: roomname [' + roomname + '] doesnt exist yet. Cannot remove contents.');
        cbFailure('No such room.');
        return false;
    }

    if (typeof roomname !== 'string') {
        this.log('RemoveAllContentsFromRoom: ERROR: roomname given must be a string.');
        cbFailure('Room must be a string.');
        return false;
    }

//    this.log('Removing ALL contents from room: ' + roomname);

    options = { limit: maxPerBatch, attributesToGet: ['roomname', 'spotnumber'] };

    ddb.query(this.ROOMCONTENTS, roomname, options, QueryCB);

};

//
//
// M U C R O O M
//
//

function MucRoom(client, notifier, opts, success, failure) {
    // -- Handle room create request --
    this.bNewRoom = false;

    // opts is only used when 'new MucRoom()' is done manually. If a MucRoom is retrieved
    // from the heap of objects, then new opts are used. So, this is sorta going away over
    // time. For now, if opts.* is used, then override other defaults.
    if (opts.bSelfDestruct === true || opts.bSelfDestruct === false) {
        this.bSelfDestruct = opts.bSelfDestruct;
    }
    else {
        this.bSelfDestruct = !settings.roommanager.persist;
    }
//    console.log('DEBUG: MucRoom() - opts:', opts);
//    console.log('DEBUG: MucRoom() - settings.roommanager.persist=' + settings.roommanager.persist);
//    console.log('DEBUG: MucRoom() - bSelfDestruct=' + this.bSelfDestruct);

    this.successCallback = success || null;
    this.failureCallback = failure || null;
    this.presenceTimer = null;
    this.joinTimer = null;      // Used to ensure that our 'join' actually succeeds.
    // --------------------------------

    this.isOwner = false;   // Assume we're not the owner yet until we're told so.
    this.roomname = '';
    this.nick = '';
    this.joined = false;
    this.participants = {};
    this.islocked = false;
    this.bannedlist = {};
    this.options = {};
    this.iq_callbacks = {};
    this.client = client;
    this.iqnum = 0;
    this.notifier = notifier;
    this.pendingDeletion = false;
    this.addSpotCeiling = 1000;     // Value doled-out upon addspot commands being given (and incremented afterwards)
    this.addWhiteboardCeiling = 1;  // Special value in each room for making unique whiteboard names for display.
    this.wbDir = null;
    this.wbDirRoot = settings.roommanager.wbstoragelocation || __dirname;
    this.wbSaveTimer = null;

    this.currentNumParticipants = 0;
    this.maxParticipantsSeen = 0;
    this.meetingStart = null;

    this.spotList = {};
    this.spotStorage = {};
    this.wbStrokeList = {};
    this.canvas = {};
    this.maxParticipants = -1;

    var self = this;

    // Need to have a 'ceiling' for checking against incoming requests for 'maxparticipants' being too large.
    if (!settings.roommanager.maxparticipants_ceiling) {
        settings.roommanager.maxparticipants_ceiling = 12;
    }

    this.SetMaxRoomParticipants(settings.roommanager.maxparticipants_ceiling);

    // Hidden room.
    this.options['muc#roomconfig_publicroom'] = '0';    // Non-listed room.
    this.options['muc#roomconfig_moderatedroom'] = '0';
    this.options['muc#roomconfig_passwordprotectedroom'] = '0';
    this.options['muc#roomconfig_whois'] = 'moderators';
    this.options['x-muc#roomconfig_reservednick'] = '0';

    // TODO: It appears that OpenFire does not auto-prune rooms which are persistent.
    // Making persistent for now. Plan to have the server prune non-used rooms.
    // This way the serverBot doesn't have to clean up non-xml-spec'd rooms when they disappear.
    this.options['muc#roomconfig_persistentroom'] = '1';

    // Initially, all rooms are unlocked.
    this.options['muc#roomconfig_membersonly'] = '0';

    // stanza callback is stored as a member so that
    // it can be removed from listener when object is no longer active
    this.onstanza = function(in_stanza) {
        var stanza = in_stanza.clone();

        // Only handling our own stanzas.
//      if (!stanza.attrs.from || (stanza.attrs.from && stanza.attrs.from.split('/')[0] != self.roomname))
        if (stanza.attrs.from && stanza.attrs.from.split('/')[0].toLowerCase() !== self.roomname.toLowerCase()) {
            return;
        }

        if (overseer.debugmode === 'ALL' || overseer.debugmode === 'MUCROOMS') {
            self.log('DEBUGSTANZAS: MUCROOMS: ' + stanza.toString());
        }

        if (stanza.is('message') && stanza.attrs.type !== 'error') {
            self.handleMessage(stanza);
        }
        else if (stanza.is('presence')) {         // Note presence will handle its own error stanzas.
            self.handlePresence(stanza);
        }
        else if (stanza.is('iq') && stanza.attrs.type !== 'error') {
            self.handleIQ(stanza);
        }
        else {
            self.log('ERROR: UNHANDLED Stanza: ' + stanza.tree());
        }
    };

    if (!client)
    {
        console.log('MucRoom() - ERROR: No client specified.');
        return;
    }
}

MucRoom.prototype.ValidateWBFolder = function() {
    // Make sure Overseer.wbStorageLocation + '/' + this.roomname
    var dirloc = this.wbDirRoot + '/' + this.roomname.split('@')[0],
        stat;

    this.wbDir = null;  // Assume the worst - we'll not be writing whiteboards to disk.

// console.log('DEBUG: root: ' + this.wbDirRoot + ' and dirloc: ' + dirloc);

    if (!this.roomname) {
        this.log('ValidateWBFolder: No roomname yet. Problem. Should be...');
        return false;
    }

    try {
        stat = fs.statSync(dirloc);
        // If we fail this check, then something bad has happened - because what should be a directory is a file.
        // If it doesn't exist at all, we'll wind up in the catch instead.
        if (stat.isDirectory()) {
            this.wbDir = dirloc;
            return true;
        }
    }
    catch (e) {
        // dirloc doesn't exist. Create it.
        try {
            fs.mkdirSync(dirloc);
            this.wbDir = dirloc;
            return true;
        }
        catch (e2) {
            // mkdir failed.
            this.log('ERROR: Could not create wbStorage room directory: ' + dirloc);
            this.wbDir = null;
            return false;
        }
    }

};

MucRoom.prototype.SetMaxRoomParticipants = function(max) {
    // Check for validity before going forward.
    if (settings.roommanager.maxparticipants_ceiling && max > settings.roommanager.maxparticipants_ceiling) {
        this.log('ERROR: Cannot set maxParticipants > ' + settings.roommanager.maxparticipants_ceiling + '. Value requested was: ' + max);
        return false;
    }

    // Max # users.
    // If it's not been set yet, use the settings value if there's one specified.
    if (this.maxParticipants === -1) {
        this.maxParticipants = settings.roommanager.maxparticipants_ceiling || max;
    }
    else {
        this.maxParticipants = max;
    }

    this.maxParticipants = parseInt(this.maxParticipants, 10) + 1;   // Account for the roommanager being in the room.

    // RMW:NOTE - We setup the room to the maximum ceiling value.
    //      But we control entry to the room by the 'createroom' iq message. If the room is
    //      'full' by our terms, we will disallow them entry, but this is a 'soft' disallow.
    //      If someone is hacking, they could put their presence in the room regardless.
    //      If we need to defend against this, we could watch for someone who comes into
    //      a room which is technically full and if it happens, we KICK them out.
    //      The reason this matters is because if we allow clients to artificially use lower
    //      max participant values, we dont want to reconfigure a room just for this.
    //      In most cases, MucRoomObjectPool items will come off and be created to the 'spec'
    //      for the room and that won't change. But if we allow dynamic participant max sizing
    //      at some point, this becomes messy. So, this handling of it now will be just fine
    //      for now and the future.
    this.options['muc#roomconfig_maxusers'] = this.maxParticipants.toString();    // Stringify.
    console.log('Setting maxParticipants to: ' + this.options['muc#roomconfig_maxusers']);

    return true;
};

MucRoom.prototype.reset = function() {
    this.bNewRoom = false;
    this.successCallback = null;
    this.failureCallback = null;
    if (this.presenceTimer)
    {
        clearTimeout(this.presenceTimer);
        this.presenceTimer = null;
    }

    if (this.joinTimer)
    {
        clearTimeout(this.joinTimer);
        this.joinTimer = null;
    }

    this.isOwner = false;   // Assume we're not the owner yet until we're told so.
    this.roomname = '';
    this.nick = '';
    this.joined = false;
    this.participants = {};
    this.islocked = false;
    this.bannedlist = {};
    this.options = {};
    this.iq_callbacks = {};
    this.iqnum = 0;
    this.pendingDeletion = false;

    this.currentNumParticipants = 0;
    this.maxParticipantsSeen = 0;
    this.meetingStart = null;

    this.bSelfDestruct = !settings.roommanager.persist;

    this.spotList = {};
    this.spotStorage = {};
    this.wbStrokeList = {};
    this.canvas = {};
    this.wbDir = null;
    if (this.wbSaveTimer) {
        clearInterval(this.wbSaveTimer);
    }
    this.wbSaveTimer = null;

    this.client.removeListener('stanza', this.onstanza);
};

MucRoom.prototype.finishInit = function(success, failure) {
    var self = this;

    this.successCallback = success;
    this.failureCallback = failure;
    this.client.on('stanza', this.onstanza);

    //
    // Save whiteboards every 10 seconds
    //
    if (this.wbSaveTimer) {
        clearInterval(this.wbSaveTimer);
    }
    this.wbSaveTimer = setInterval(function() {
        self.SaveAllWhiteboards.call(self, function(okmsg) {
//            self.log('Interval-Whiteboard-Save: Success: ' + okmsg);
        }, function(errmsg) {
            self.log('Interval-Whiteboard-Save: ERROR: ' + errmsg);
        });
    }, 10000);
};

MucRoom.prototype.notifylog = function(msg) {
    if (this.notifier) {
        this.notifier.sendMessage(logDate() + ' @' + this.roomname.split('@')[0] + ': ' + decodeURI(msg));
    }
    else {
        console.log(logDate() + ' - NULL-NOTIFIER-MESSAGE: @' + this.roomname.split('@')[0] + ': ' + decodeURI(msg));
    }
};

MucRoom.prototype.log = function(msg) {
    console.log(logDate() + ' - @' + this.roomname.split('@')[0] + ': ' + decodeURI(msg));
};

MucRoom.prototype.IsFull = function() {
    return size(this.participants) >= this.maxParticipants;
};

MucRoom.prototype.getRoomConfiguration = function(cb) {
    var self = this,
        getRoomConf;

    // Request room configuration form.
    getRoomConf = new xmpp.Element('iq', {to: this.roomname, type: 'get'})
        .c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'});

//    this.log('Requesting room configuration... ');
    // DEBUG
//    this.log(getRoomConf.tree());

    this.sendIQ(getRoomConf, function(resp) {
        if (cb) {
            cb.call(self, resp);
        }
    }, function(resperr) {
        self.log('ERROR: Failed in requesting room configuration. Response is: ' + resperr);
    });
};

MucRoom.prototype.StartMeeting = function() {
    if (this.meetingStart) {
        this.log('StartMeeting: WARNING: Meeting seems to be already started. Calling for end meeting.');
        this.EndMeeting();
    }

    this.meetingStart = new Date();
};

MucRoom.prototype.EndMeeting = function() {
    var duration = 0,
        origDuration = 0,
        outStr = '',
        hr = 1000 * 60 * 60,
        min = 1000 * 60,
        sec = 1000;

    if (!this.meetingStart) {
        this.log('EndMeeting: WARNING: No currently running meeting.');
    }
    else {
        duration = new Date() - this.meetingStart;
        origDuration = duration;

        this.meetingStart = null;
    }

    if (duration > hr) {
        outStr += Math.floor(duration/hr) + 'hr, ';
        duration = duration - (Math.floor(duration/hr) * hr);
    }

    if (duration > min) {
        outStr += Math.floor(duration/min) + 'min, ';
        duration = duration - (Math.floor(duration/min) * min);
    }

    if (duration > sec) {
        outStr += Math.floor(duration/sec) + 'sec ';
        duration = duration - (Math.floor(duration/sec) * sec);
    }

    outStr += '[' + Math.floor(origDuration/sec) + ' seconds]';

    this.log('Meeting Duration: ' + outStr);
    this.notifylog('Meeting Duration: ' + outStr);

    // Reset max participants seen after ending a meeting regardless of whether the room
    // itself gets destroyed or not.
    this.maxParticipantsSeen = 0;
};

MucRoom.prototype.handlePresence = function(pres) {
    var fromnick = pres.attrs.from.split('/')[1],
        fromjid = null,
        self = this,
        k;

//DEBUG    this.log(pres);

    if (pres.getChild('x') && pres.getChild('x').getChild('item') && pres.getChild('x').getChild('item').attrs.jid) {
        fromjid = pres.getChild('x').getChild('item').attrs.jid.split('/')[0];
    }

    // We need to deal with non-configured rooms. If we get a status code 201, we need to config.
    if (pres.getChild('x') && pres.getChild('x').getChildrenByAttr('code', '201').length > 0)
    {
        this.log('needs configured. Setting flag for configuring...');
        this.bNewRoom = true;

        // We used to call getRoomConfiguration() here, but it gets called down below also.
        // To avoid double requests to the server, we'll just do room setup from within there.
    }

    if (pres.getChild('error'))
    {
        // Special case where someone has already taken my nickname...kick them out.
        if (pres.getChild('error').getChild('conflict'))
        {
            this.log('Kicking out overseer imposter. His jid=' + fromjid);
            this.kick(self.nick, function() {
                // Once the kick is complete, we need to re-establish ourselves.
                // TODO - not sure how to unjoin, rejoin, etc all from here...
                //    Is it true that we will have a conflict but we are still joined as
                //    another nick (our resource id possibly?) - so we could change
                //    our nick then?

                // TODO actually need to join with NO NICK and KICK overseer - then re-join.
                //
                // Actually - from here...we aren't joined...so join with null.
                // Then in presence, we'll have to detect our own presence as a match of 'to'
                // with the resource in 'from' and realize why we're there.
                // At that point, kick the imposter and then 'leave' and rejoin()
                self.log('Re-joining room after kicking the imposter.');
                self.rejoin(self.roomname, null);
            });
        }
        else {
            this.log("Couldn't kick -- didn't find their jid. Hmm. Are we not moderator/admin/owner?");
        }

        this.log('Error: ' + pres);

        return;
    }

    //
    // If this is 'available', add the person to the participants array.
    //
    // Always address items in the array by nickname. Value is nickname or jid if one is available.
    //
    if (pres.attrs.type !== 'unavailable')
    {
        //
        // New person we don't know and it's not ourselves.
        //
        if (!this.participants[fromnick] && fromnick !== this.nick) {
            //
            // Bump up our participant count and possibly the 'max' seen too.
            //
            if (this.currentNumParticipants === 0) {
                this.log('ROOM-First-Entrant - Meeting start.');
                this.StartMeeting();
            }
            this.currentNumParticipants += 1;
            this.log('Someone came in: # participants is: ' + this.currentNumParticipants);
            if (this.currentNumParticipants > this.maxParticipantsSeen) {
                this.maxParticipantsSeen = this.currentNumParticipants;
                this.log('New maxParticipantsSeen = ' + this.maxParticipantsSeen);
            }

            if (size(this.participants) >= this.maxParticipants) {
                // We are already at our 'stated' capacity. What to do?
                // TODO:RMW - Kick out new person. This was not legal.
                this.log('ERROR: Room is already full but we have new entry by: ' + fromnick);

                // NOTE: We have to artificially add this person to the participants list or else
                //       kick() won't kick them out as they are not in the room officially.
                this.participants[fromnick] = { name: fromjid || fromnick };

                this.kick(fromnick, function() {
                    self.log('Kicked out: ' + fromnick);
                });

                return;
            }
            this.log('Adding: ' + fromjid + ' as Nickname: ' + decodeURI(fromnick));
            this.SendSpotListTo(pres.attrs.from);
        }
//        else {
//            this.log('Updated Presence: ' + fromjid + ' as Nickname: ' + decodeURI(fromnick));
//        }

        this.participants[fromnick] = { name: fromjid || fromnick };

        if (pres.attrs.video) {
            this.participants[fromnick].video = pres.attrs.video;
        }

        if (this.bSelfDestruct === true)
        {
            if (fromnick !== this.nick && this.presenceTimer)
            {
                this.log('Room not empty -- clearing presenceTimer.');
                clearTimeout(this.presenceTimer);
                this.presenceTimer = null;
            }
        }
    }
    else if (pres.attrs.type === 'unavailable' && this.participants[fromnick])
    {
        this.log(fromnick + ' left room.');
        delete this.participants[fromnick];

        //
        // Was it myself that left the room?
        //
        if (fromnick === self.nick)
        {
            if (this.bSelfDestruct === true && 0 === size(this.participants)) {
                this.log('Room destroyed... not trying to rejoin');
            } else {
                this.log('We got kicked out...room destroyed? Or we got disconnected??');
                this.joined = false;
                this.currentNumParticipants = 0;

                for (k in this.participants)
                {
                    if (this.participants.hasOwnProperty(k)) {
                        this.log('    Abandoning participant: ' + k);
                        delete this.participants[k];
                    }
                }

                // Need to make sure that the self-destruct timer is cleared if it's ticking...
                if (this.presenceTimer)
                {
                    this.log('presenceTimer being cleared prior to re-join.');
                    clearTimeout(this.presenceTimer);
                    this.presenceTimer = null;
                }

                if (!this.pendingDeletion)
                {
                    this.log('Re-joining (and re-creating?) room:' + self.roomname + ' as:' + self.nick_original);
                    this.rejoin(self.roomname, self.nick_original);
                }
                else {
                    this.log('Room [' + self.roomname + '] is pending deletion. Not re-joining.');
                }

                // After calling for a rejoin or noting pending deletion, let's get out of this processing of presence.
                return;
            }
        }
        else
        {
            //
            // Someone left and it wasn't ourselves.
            //
            this.currentNumParticipants -= 1;
            this.log('Someone left: # participants is: ' + this.currentNumParticipants);
            if (this.currentNumParticipants < 0) {
                this.log('ERROR: currentNumParticipants is negative: ' + this.currentNumParticipants + '. Our accounting has an error.');
            }

            if (1 === size(this.participants) && this.participants[this.nick]) {
//                    this.log('OVERSEER: (A-timer) Everybody else has left room [' + this.roomname.split('@')[0] + ']... wait 60 sec...');

                if (this.presenceTimer)
                {
                    this.log('(A-timer) presenceTimer was already set. Clearing first.');
                    clearTimeout(this.presenceTimer);
                    this.presenceTimer = null;
                }

                if (this.bSelfDestruct === true) {
                    this.presenceTimer = setTimeout(function() {
                        var msg;
                        self.log('(A-timer) No one in room after 60 seconds ... destroying.');
                        msg = 'ROOM-EMPTY - end meeting. maxParticipantsSeen was: ' + self.maxParticipantsSeen;
                        self.log(msg);
                        self.notifylog(msg);
                        self.EndMeeting();
                        eventManager.emit('destroyroom', self.roomname.split('@')[0]);
                        self.presenceTimer = null;
                    }, 60000);
                }
                else {
                    // If not a self-destruct room, still need to end the meeting if no one comes back in.
                    this.presenceTimer = setTimeout(function() {
                        var msg;
                        msg = 'ROOM-EMPTY - end meeting. maxParticipantsSeen was: ' + self.maxParticipantsSeen;
                        self.log(msg);
                        self.notifylog(msg);
                        self.EndMeeting();
                        self.presenceTimer = null;
                    }, 60000);
                }
            }
        }

    }

    // If the 'from' is myself -- then I'm here. And so we're joined...
    if (fromnick === this.nick)
    {
        // If we make it into the room, make sure the joinTimer is cleared.
        if (this.joinTimer)
        {
            clearTimeout(this.joinTimer);
            this.joinTimer = null;
        }

        if (!this.joined)
        {
            this.joined = true;
            //
            // Upon joining, use the participants list as our initial water mark of # of participants.
            //
            this.currentNumParticipants = size(this.participants) - 1;  // minus ourselves as we're already in the array.
            this.log('On Join: # participants is: ' + this.currentNumParticipants);
            if (this.currentNumParticipants > this.maxParticipantsSeen) {
                this.maxParticipantsSeen = this.currentNumParticipants;
                this.log('New maxParticipantsSeen = ' + this.maxParticipantsSeen);
            }

            if (false === this.bNewRoom)
            {
                if (this.successCallback) {
                    this.successCallback();
                    this.successCallback = null;
                    this.failureCallback = null;
                }

                if (this.bSelfDestruct === true)
                {
                    if (this.presenceTimer)
                    {
                        this.log('(B-timer) Clearing presenceTimer which was already set. New room entered.');
                        clearTimeout(this.presenceTimer);
                        this.presenceTimer = null;
                    }

                    if (0 === size(this.participants))
                    {
//                        this.log('(B-timer) Just joined room [' + this.roomname.split('@')[0] + '] - waiting for others...');

                        this.presenceTimer = setTimeout(function() {
                            self.log('(B-timer) New room - No one joined within 30 seconds. Destroying.');
                            eventManager.emit('destroyroom', self.roomname.split('@')[0]);
                        }, 30000);
                    }
//                    else {
//                        this.log('(B-timer) - Someone already in the room. All good. Moving forward.');
//                    }
                }
            }

            // Upon joining, get context of the room. Get the banned list.
            this.loadBannedList(function() {
//                this.log('Received Banned List');
                this.printParticipants();
                this.printBannedList();
            });

            // Also to get context of the room, find out if the room is members-only or not.
            this.getRoomConfiguration(function(form) {
                // This is a change of venue for .setupRoom() ...
                // Used to call it on recognizing it was a new room but that caused two getRoomConfiguration() calls
                // which is wasteful to server resources.
                if (self.bNewRoom) {
//                    self.log('Got room configuration. Going for setup.');
                    self.setupRoom(form);
                }

                // form should contain a list of current variable value entries.
                // We are looking for: muc#roomconfig_membersonly

                // Need to ensure a few things first though...
                if (form.attrs.type === 'result' && form.getChild('query') && form.getChild('query').getChild('x'))
                {
                    // Is there a setting for membersonly?
                    if (form.getChild('query').getChild('x').getChildByAttr('var', 'muc#roomconfig_membersonly') &&
                        form.getChild('query').getChild('x').getChildByAttr('var', 'muc#roomconfig_membersonly').getChild('value'))
                    {
                        if (form.getChild('query').getChild('x').getChildByAttr('var', 'muc#roomconfig_membersonly').getChild('value').getText() === '1')
                        {
                            this.log('Upon entry - room is locked.');
                            this.islocked = true;
                        }
                        else {
                            this.islocked = false;
                        }
                    }
                }

            });
        }
    }
    else
    {
        // If we're already joined, print each coming and going....
        if (this.joined) {
            this.printParticipants();
        }
    }

//  this.log("Pres: " + pres.getChild('x'));

};

MucRoom.prototype.printBannedList = function() {
    var parts = '',
        k;

    for (k in this.bannedlist)
    {
        if (this.bannedlist.hasOwnProperty(k)) {
            // Add in a ',' if we're not first in line.
            if (parts !== '') {
                parts += ', ';
            }

            parts += k;
        }
    }

    if (parts !== '') {
        this.log('Banned list: ' + parts);
    }
/*    else {
        this.log('No one on the banned list.');
    }
*/
};

MucRoom.prototype.printParticipants = function() {
    var parts = '',
        k;

    for (k in this.participants)
    {
        // Don't print our own nickname in the room (overseer)
        if (this.participants.hasOwnProperty(k) && k !== this.nick) {
            // Add in a ',' if we're not first in line.
            if (parts !== '') {
                parts += ', ';
            }

            parts += decodeURI(k.replace(/\\20/g, ' '));
            if (this.participants[k].video === 'on') {
                parts += '(V)';
            }
            else if (this.participants[k].video === 'off') {
                parts += '(No-V)';
            }
        }
    }

    if (parts) {
        this.log('Participants list: ' + parts);
        this.notifylog(parts);
    }
};

//
// If we have a result coming at us and there is a tagged callback for it,
// then make the callback and remove the entry in the callbacks list.
//
MucRoom.prototype.handleIQ = function(iq) {
    var iqid, callback;
/*      if (iq.attrs.from.split('@')[0] !== this.roomname.split('@')[0])
    {
        this.log("ERROR: NAME MISMATCH. this.roomname="+this.roomname+" while iq="+iq.tree());
    }
*/
//  this.log("IQ message received: " + iq.tree());

    if (iq.attrs.type === 'result' && iq.attrs.id && this.iq_callbacks[iq.attrs.id])
    {
        iqid = iq.attrs.id;
        callback = this.iq_callbacks[iqid];

        // Need to be sure to not use values from 'iq' after the callback.
        // As the callback itself can modify iq and sometimes does.
        delete this.iq_callbacks[iqid];
        // We have a callback to make on this ID.
        callback.call(this, iq);
    }
    else if (iq.attrs.type !== 'result')
    {
        if (iq.attrs.type === 'get' && iq.getChild('query') && iq.getChild('query').attrs.xmlns === 'http://jabber.org/protocol/disco#info')
        {
            // Ignore disco info requests. Just reply with 'result'
            iq.attrs.to = iq.attrs.from;
            delete iq.attrs.from;
            iq.attrs.type = 'result';

            this.log('disco#info');
            this.sendIQ(iq, function() { });    // Don't care about any callback.
        }
        else if (iq.attrs.type === 'set' && iq.getChildByAttr('xmlns', 'urn:xmpp:callcast'))
        {
//            this.log("Received IQ 'set' -- "); // + iq.root().toString());

            if (iq.getChild('addspot')) {
                this.AddSpotReflection(iq);
            }
            else if (iq.getChild('removespot')) {
                this.RemoveSpotReflection(iq);
            }
            else if (iq.getChild('setspot')) {
                this.SetSpotReflection(iq);
            }
            else if (iq.getChild('wb_stroke')) {
                this.WhiteboardSingleStrokeReflection(iq);
            }
            else {
                this.log('Unknown set, iq is: ' + iq.root().toString());
            }
        }
        else {
            this.log('handleIQ was ignored: ' + iq);
        }
    }
    else
    {
/*          console.log("handleIQ: MUC @" + this.roomname.split('@')[0] + " - Callback list: ");
        for (k in this.iq_callbacks)
            console.log("  CB_ID: " + k);
    */
        this.log('handleIQ: IQ result msg was ignored: ' + iq);
    }
};

MucRoom.prototype.SendSpotListTo = function(to) {
    var k, msgToSend,
        attribs_out;

    msgToSend = null;

//    this.log('SendSpotListTo: sending full spot catch-up to: ' + to);

    for (k in this.spotList)
    {
        if (this.spotList.hasOwnProperty(k)) {

            // Copy the object for this spot as a starting point.
            attribs_out = this.spotList[k];

            //
            // If we have a whiteboard entry, we don't add it to the generic list
            // because full stroke lists can be large.
            //
            if (attribs_out.spottype === 'whiteBoard') {
                this.SendFullWhiteboardStrokeListTo(k, to);
            }
            else {
                // Now add the required items to make it a valid command.
                attribs_out.cmdtype = 'addspot';
                attribs_out.xmlns = 'urn:xmpp:callcast';

                if (msgToSend) {
                    msgToSend.up().c('cmd', attribs_out);
                }
                else {
                    msgToSend = new xmpp.Element('message', {'to': to, type: 'chat', xmlns: 'urn:xmpp:callcast'})
                        .c('cmd', attribs_out);
                }
            }

        }
    }

    if (msgToSend) {
        this.log('SendSpotListTo: msgToSend:' + msgToSend.root().toString());
        this.client.send(msgToSend);
    }

};

MucRoom.prototype.SaveAllWhiteboards = function(cbSuccess, cbFailure) {
    var k, bNumFailed = 0;

    for (k in this.spotList) {
        if (this.spotList.hasOwnProperty(k)) {
            if (this.spotList[k].spottype === 'whiteBoard') {
                // Now -- save this one.
                this.CreateUpdatedImageFromStrokes(k, function() {}, function() { bNumFailed += 1; });
            }
        }
    }

    if (bNumFailed && cbFailure) {
        cbFailure('Whiteboard saving failed in room: ' + this.roomname + ' ' + bNumFailed + ' times.');
    }
    else if (cbSuccess) {
        cbSuccess('All whiteboards saved in room: ' + this.roomname);
    }
};

MucRoom.prototype.DeleteRoom = function() {
    var parts, k;
    // If anyone is in the room, report them as abandoned and return failure.

    // Check to see that we have a room by that name and see if anyone is in it.
    // a) room exists.
    // b) if more than one person & I'm one of them.
    // c) if more than zero people and I'm *NOT* one of them (recently got kicked out as oddball case.)
    if ((size(this.participants) > 1 && this.participants[this.nick])
                    || (size(this.participants > 0) && !this.participants[this.nick])) {
        this.notifylog('Being requested to delete room [' + this.roomname.split('@')[0] + "] -- but it's not empty. Skipping deletion.");
        this.log('Being requested to delete room [' + this.roomname.split('@')[0] + "] -- but it's not empty. Skipping deletion.");
        parts = '';

        for (k in this.participants)
        {
            if (this.participants.hasOwnProperty(k)) {
                // Add in a ',' if we're not first in line.
                if (parts !== '') {
                    parts += ', ';
                }

                parts += k.replace(/\\20/g, ' ');
            }
        }

        this.notifylog('OVERSEER: Would have abandoned the following participants: ' + parts);
        this.log('OVERSEER: Would have abandoned the following participants: ' + parts);
        return false;
    }

    this.DeleteAllWhiteboards();

    return true;
};

MucRoom.prototype.DeleteAllWhiteboards = function() {
    var k;

//DEBUG:
//    try { throw new Error('bogus'); } catch (edbg) { console.log('DeleteAllWhiteboards: Stack: ', edbg.stack); }
//DEBUG:

    if (!this.roomname) {
        this.log('ERROR: Cannot delete whiteboards - no roomname to reference.');
        return false;
    }

    for (k in this.spotList) {
        if (this.spotList.hasOwnProperty(k)) {
            if (this.spotList[k].spottype === 'whiteBoard') {
                // Now -- load the whiteboard.
                this.DeleteWhiteboardForSpot(k);
            }
        }
    }

    // Now remove the parent / room folder above those entries.
    // This is wbDir.
    if (this.wbDir) {
        try {
            fs.rmdirSync(this.wbDir);  // Dont bother to wait. It happens or it doesn't.
        }
        catch (e) {
            this.log('ERROR: DeleteAllWhiteboards: rmdir failed for ' + this.wbDir + ' - not empty? Err: ' + e);
        }
    }
};

MucRoom.prototype.DeleteWhiteboardForSpot = function(spotnumber) {
    var loc;

    if (!spotnumber || !this.wbDir) {
        this.log('ERROR: Cannot load whiteboard spot - either no wbDir or no spotnumber given.');
        return false;
    }

    loc = this.wbDir + '/' + this.wbFname(spotnumber);

    try {
        fs.unlinkSync(loc);
    }
    catch (e) {
        this.log('ERROR: DeleteWhiteboardForSpot: Could not remove: ' + loc + ' Err: ' + e);
    }
};

MucRoom.prototype.LoadAllWhiteboards = function() {
    var k;

    if (!this.roomname) {
        this.log('ERROR: Cannot load whiteboards - no roomname to reference.');
        return false;
    }

    for (k in this.spotList) {
        if (this.spotList.hasOwnProperty(k)) {
            if (this.spotList[k].spottype === 'whiteBoard') {
                // Now -- load the whiteboard.
                this.LoadWhiteboardForSpot(k);
            }
        }
    }
};

MucRoom.prototype.LoadWhiteboardForSpot = function(spotnumber) {
    var loc, loadedImage, img;

    if (!spotnumber || !this.wbDir) {
        this.log('ERROR: Cannot load whiteboard spot - either no wbDir or no spotnumber given.');
        return false;
    }

    loc = this.wbDir + '/' + this.wbFname(spotnumber);

    this.log('Loading whiteboard from: ' + loc);

    this.canvas[spotnumber] = new nodewb.NodeWhiteBoard(this.spotList[spotnumber].wbWidth || 500,
                                                        this.spotList[spotnumber].wbHeight || 500);

    try {
        loadedImage = fs.readFileSync(loc);
        img = new Canvas.Image();
        img.src = loadedImage;

        this.canvas[spotnumber].wb.getContext('2d').drawImage(img, 0, 0);
    }
    catch (e) {
        this.log('WARNING: Could not load whiteboard image: ' + loc + ' Err: ' + e);
    }
};

MucRoom.prototype.wbFname = function(spotnumber) {
    if (!spotnumber) {
        return null;
    }
    else {
        return 'whiteboard_' + this.roomname.split('@')[0] + '_' + spotnumber + '.png';
    }
};

MucRoom.prototype.CreateUpdatedImageFromStrokes = function(spotnumber, cbSuccess, cbFailure) {
    var k, fname,
        attribs_out = {};

    if (!this.wbDir) {
        this.log('CreateUpdatedImageFromStrokes: ERROR - no wbDir for storage.');
        if (cbFailure) {
            cbFailure('CreateUpdatedImageFromStrokes: ERROR - no wbDir for storage.');
        }
        return;
    }

    if (!this.spotList[spotnumber]) {
        this.log('CreateUpdatedImageFromStrokes: ERROR - unknown spotnumber: ' + spotnumber);
        if (cbFailure) {
            cbFailure('CreateUpdatedImageFromStrokes: ERROR - unknown spotnumber: ' + spotnumber);
        }
        return;
    }

    if (this.spotList[spotnumber].spottype !== 'whiteBoard') {
        this.log('CreateUpdatedImageFromStrokes: ERROR - Not a whiteboard spot: ' + spotnumber);
        if (cbFailure) {
            cbFailure('CreateUpdatedImageFromStrokes: ERROR - Not a whiteboard spot: ' + spotnumber);
        }
        return;
    }

    if (!this.canvas[spotnumber]) {
        this.log('CreateUpdatedImageFromStrokes: ERROR - Canvas missing from spot: ' + spotnumber);
        if (cbFailure) {
            cbFailure('CreateUpdatedImageFromStrokes: ERROR - Canvas missing from spot: ' + spotnumber);
        }
        return;
    }

    //
    // Only do a real save if there are strokes to save.
    //
    if (this.wbStrokeList[spotnumber] && this.wbStrokeList[spotnumber].strokes.length) {
        fname = this.wbFname(spotnumber);
//        this.log('CreateUpdatedImageFromStrokes: Found ' + this.wbStrokeList[spotnumber].strokes.length + ' strokes. Creating image file: ' + fname);

        attribs_out.strokes = JSON.stringify(this.wbStrokeList[spotnumber]);
    //    this.log('DEBUG: Full stroke list: ' + attribs_out.strokes);

        // Now process this as a canvas and then save the canvas.
        this.canvas[spotnumber].doCommands(attribs_out);
        // Now that we've been successful in drawing, erase the strokes in memory.
        this.wbStrokeList[spotnumber].strokes = [];

        this.canvas[spotnumber].Save(this.wbDir + '/' + fname, function() {
//                console.log('DEBUG: SUCCESS SAVING ' + fname);
                if (cbSuccess) {
                    cbSuccess('Success Saving: ' + spotnumber);
                }
            }, function(err) {
                console.log('SAVE FAILED for spot: ' + spotnumber + '. ERROR: ' + err);
                if (cbFailure) {
                    cbFailure('SAVE FAILED for spot: ' + spotnumber + '. ERROR: ' + err);
                }
        });
    }
    else {
        // If there were no strokes in the whiteboard, then let's just call it a success.
        if (cbSuccess) {
            cbSuccess('Success (no-strokes) Saving: ' + spotnumber);
        }
    }

};

MucRoom.prototype.SendFullWhiteboardStrokeListTo = function(spotnumber, to) {
    var k, msgToSend,
        attribs_out;

    if (!this.spotList[spotnumber]) {
        this.log('SendFullWhiteboardStrokeListTo: ERROR - unknown spotnumber: ' + spotnumber);
        return;
    }

    if (this.spotList[spotnumber].spottype !== 'whiteBoard') {
        this.log('SendFullWhiteboardStrokeListTo: ERROR - Not a whiteboard spot: ' + spotnumber);
        return;
    }

    msgToSend = null;

    this.log('SendFullWhiteboardStrokeListTo: sending full whiteboard stroke catch-up to: ' + to + ' for ' + spotnumber);

    // Copy the object for this spot as a starting point.
    attribs_out = this.spotList[spotnumber];

    // Now add the required items to make it a valid command.
    attribs_out.cmdtype = 'addspot';
    attribs_out.xmlns = 'urn:xmpp:callcast';

    if (!this.wbStrokeList[spotnumber]) {
        this.wbStrokeList[spotnumber] = {};
        this.wbStrokeList[spotnumber].strokes = [];
    }
    attribs_out.strokes = JSON.stringify(this.wbStrokeList[spotnumber]);
//    this.log('DEBUG: Full stroke list: ' + attribs_out.strokes);

    if (this.canvas[spotnumber]) {
        attribs_out.image = this.canvas[spotnumber].wb.toDataURL('image/png');
        this.log('SendFullWhiteboardStrokeListTo: Pushed canvas image into addspot. Bytesize = ' + attribs_out.image.length);
    }

    if (msgToSend) {
        msgToSend.up().c('cmd', attribs_out);
    }
    else {
        msgToSend = new xmpp.Element('message', {'to': to, type: 'chat', xmlns: 'urn:xmpp:callcast'})
            .c('cmd', attribs_out);
    }

    if (msgToSend) {
//        this.log('DEBUG: SendFullWhiteboardStrokeListTo: msgToSend:' + msgToSend.root().toString());
        this.client.send(msgToSend);
    }

};

MucRoom.prototype.SendGroupCmd = function(cmd, attribs_in) {
        var attribs_out = attribs_in,
            msgToSend;

        attribs_out.cmdtype = cmd;
        attribs_out.xmlns = 'urn:xmpp:callcast';

        msgToSend = new xmpp.Element('message', {to: this.roomname, type: 'groupchat', xmlns: 'urn:xmpp:callcast'})
                .c('cmd', attribs_out);

//        this.log('Outbound Group Command: ' + msgToSend.root().toString());

        this.client.send(msgToSend);
};

MucRoom.prototype.SendPrivateCmd = function(to, cmd, attribs_in) {
        var attribs_out = attribs_in,
            msgToSend;

        attribs_out.cmdtype = cmd;
        attribs_out.xmlns = 'urn:xmpp:callcast';

        msgToSend = new xmpp.Element('message', {'to': to, type: 'chat', xmlns: 'urn:xmpp:callcast'})
                .c('cmd', attribs_out);

//        this.log('Outbound Private Command: ' + msgToSend.root().toString());

        this.client.send(msgToSend);
};

MucRoom.prototype.SendGroupChat = function(msg) {
        var msgToSend;

        msgToSend = new xmpp.Element('message', {to: this.roomname, type: 'groupchat'})
                .c('body').t(msg);

//        this.log('Outbound Group Chat: ' + msgToSend.root().toString());

        this.client.send(msgToSend);
};

MucRoom.prototype.SendPrivateChat = function(to, msg) {
        var msgToSend;

        msgToSend = new xmpp.Element('message', {'to': to, type: 'chat'})
                .c('body').t(msg);

//        this.log('Outbound Private Chat to ' + to + ': ' + msgToSend.root().toString());

        this.client.send(msgToSend);
};

//
// Place for coping with multitude of special spot types and any special requirements they may have.
//
MucRoom.prototype.AddSpotType = function(spottype, info) {
    var self = this;

    // Be sure to give a spot number to everyone that's consistent.
    // Caller can specify a spotnumber (usually from loading from database)
    // in which case, we take their number.
    if (!info.spotnumber) {
        info.spotnumber = this.addSpotCeiling;
        this.addSpotCeiling += 1;
    }

    // In the case of database loading, we have to keep the ceiling caught up with the max
    // spotnumber + 1 at all times.
    if (info.spotnumber >= this.addSpotCeiling) {
        this.addSpotCeiling = parseInt(info.spotnumber, 10) + 1;
    }

    //
    // Now handle any special items/types.
    //
    switch(spottype) {
        case 'whiteBoard':
    // Treatment for whiteboards are a bit special
            // Need to generate a unique whiteboard name.
            // TODO:RMW - BUG - If we always assign a spotname on load, we'll copy over the
            //          existing spotname making whiteboard naming inconsistent on persistent rooms.
            //          If we forego naming here, then the ceiling value can be messed up as a prior
            //          room may create 4 whiteboards and delete 2 of them. This could leave us
            //          having to 'parse' the name for the max number of the existing whiteboards
            //          in order to discern the ceiling. Or just use the +1 technique and then you will
            //          possibly wind up with two 'Whiteboard 3' entries when someone adds another.
            // SOLUTION: Likely - need a wbNumber property which is used to create the spotname. This
            //          would get stored in the db and pulled out making the 'max/ceiling' easier to discern.
            info.spotname = 'Whiteboard ' + this.addWhiteboardCeiling;
            this.addWhiteboardCeiling += 1;

            // Initialize the stroke list to nothing.
            this.wbStrokeList[info.spotnumber] = {};
            this.wbStrokeList[info.spotnumber].strokes = [];

            // Set default canvas width and height if not specified from the client.
            if (!info.wbWidth) {
                info.wbWidth = 500;
            }

            if (!info.wbHeight) {
                info.wbHeight = 500;
            }

            this.canvas[info.spotnumber] = new nodewb.NodeWhiteBoard(info.wbWidth, info.wbHeight);
            break;
        default:
            break;
    }

    // Now track the new spot item for the future
    if (this.spotList[info.spotnumber]) {
        this.log('ERROR: Adding a spot that already exists. spotnumber=' + info.spotnumber);
        return false;
    }
    else {
        this.spotList[info.spotnumber] = info;

//        console.log(' spotList in: ' + this.roomname + ' is: ', this.spotList);

        if (overseer.roomDB) {
            overseer.roomDB.AddContentToRoom(this.roomname.split('@')[0], info.spotnumber, info, function() {
                return true;
            }, function(msg) {
                self.log('AddSpotReflection: ERROR adding to database: ' + msg);
            });
        }
    }

};

MucRoom.prototype.AddSpotReflection = function(iq) {
    // Need to pull out the 'info' object - which is the attributes to the 'addspot'
    var info = {};

    if (iq.getChild('addspot')) {
        info = iq.getChild('addspot').attrs;
    }

    // Add any special items to the memory database.
    this.AddSpotType(info.spottype, info);

    this.SendGroupCmd('addspot', info);

    // Now reply to the IQ message favorably.
    iq.attrs.to = iq.attrs.from;
    delete iq.attrs.from;
    iq.attrs.type = 'result';

    this.client.send(iq);
};

MucRoom.prototype.createErrorIQ = function(iq_in, reason_in, err_type_in) {
    var iq_out, e_type;

    e_type = err_type_in || 'modify';

    iq_out = new xmpp.Element('iq', {to: iq_in.root().attrs.from, type: 'error', id: iq_in.root().attrs.id})
                .c('error', {type: e_type})
                .c('bad-request', {xmlns: 'urn:ietf:params:xml:ns:xmpp-stanzas'})
                .up().c('reason', {xmlns: 'urn:ietf:params:xml:ns:xmpp-stanzas'}).t(reason_in);

    if (iq_in.root().attrs.xmlns) {
        iq_out.root().attrs.xmlns = iq_in.root().attrs.xmlns;
    }

    return iq_out;
};

MucRoom.prototype.SetSpotReflection = function(iq) {
    // Need to pull out the 'info' object - which is the attributes to the 'addspot'
    var info = {}, self = this;

    // Prep to reply to the IQ message.
    iq.attrs.to = iq.attrs.from;
    delete iq.attrs.from;

    if (iq.getChild('setspot')) {
        info = iq.getChild('setspot').attrs;
    }

    // Be sure a spot number attribute is present. Else it's an error.
    if (!info.spotnumber) {
        this.log('Missing required spotnumber attribute.');

        iq.attrs.type = 'error';
        iq.c('reason').t('Missing required spotnumber attribute.');
    }
    else if (!this.spotList[info.spotnumber]) {
        this.log('Unknown spotnumber: ' + info.spotnumber);

        // If we don't have a record of this spotnumber existing, then it's an error also.
        iq.attrs.type = 'error';
        iq.c('reason').t('spotnumber' + info.spotnumber + 'is unknown to the overseer.');
    }
    else {
        this.SendGroupCmd('setspot', info);

        this.spotList[info.spotnumber] = info;

 //       console.log(' spotList in: ' + this.roomname + ' is: ', this.spotList);

        if (overseer.roomDB) {
            overseer.roomDB.AddContentToRoom(this.roomname.split('@')[0], info.spotnumber, info, function() {
                return true;
            }, function(msg) {
                self.log('SetSpotReflection: ERROR adding to database: ' + msg);
            });
        }

        iq.attrs.type = 'result';
    }

    // Send back the IQ result.
    this.client.send(iq);
};

MucRoom.prototype.WhiteboardSingleStrokeReflection = function(iq) {
    // Need to pull out the 'info' object - which is the attributes to the 'addspot'
    var info = {}, self = this;

    // Prep to reply to the IQ message.
    iq.attrs.to = iq.attrs.from;
    delete iq.attrs.from;

    if (iq.getChild('wb_stroke')) {
        info = iq.getChild('wb_stroke').attrs;
    }

    // Be sure a spot number attribute is present. Else it's an error.
    if (!info.spotnumber) {
        this.log('Missing required spotnumber attribute.');

        iq.attrs.type = 'error';
        iq.c('reason').t('Missing required spotnumber attribute.');
    }
    else if (!this.spotList[info.spotnumber]) {
        this.log('Unknown spotnumber: ' + info.spotnumber);

        // If we don't have a record of this spotnumber existing, then it's an error also.
        iq.attrs.type = 'error';
        iq.c('reason').t('spotnumber' + info.spotnumber + 'is unknown to the overseer.');
    }
    else {
        // Add this stroke to the (growing) stroke list for this spot.
        this.wbStrokeList[info.spotnumber].strokes.push(JSON.parse(info.stroke));

        this.SendGroupCmd('setspot', info);

// No update of spotList for a single stroke.        this.spotList[info.spotnumber] = info;

 //       console.log(' spotList in: ' + this.roomname + ' is: ', this.spotList);

// No databasing of single strokes. RMW:TODO revisit this for how to database/store images/stroke deltas.
/*
        if (overseer.roomDB) {
            overseer.roomDB.AddContentToRoom(this.roomname.split('@')[0], info.spotnumber, info, function() {
                return true;
            }, function(msg) {
                self.log('SetSpotReflection: ERROR adding to database: ' + msg);
            });
        }
*/
        iq.attrs.type = 'result';
    }

    // Send back the IQ result.
    this.client.send(iq);
};

MucRoom.prototype.RemoveSpotNumber = function(spotnumber) {
    var self = this, info = {};

    if (!spotnumber) {
        throw 'Error: RemoveSpotNumber: spotnumber missing.';
    }

    info = this.spotList[spotnumber];
    if (!info) {
        throw 'Error: RemoveSpotNumber: Unknown spot ' + spotnumber + '. Cannot find in memory database.';
    }

    switch(info.spottype) {
        case 'whiteBoard':
//            console.log('DEBUG: Found whiteboard for removal. Prepping to delete plus image.');
            if (this.wbStrokeList[info.spotnumber]) {
                // Need to erase our notion of any strokes for this spot since it is a whiteboard.
                this.wbStrokeList[info.spotnumber] = {};
                this.wbStrokeList[info.spotnumber].strokes = [];
                this.canvas[info.spotnumber] = null;
            }

            this.DeleteWhiteboardForSpot(info.spotnumber);
            break;
        default:
            break;
    }

    // Now do the 'typical' items.
    delete this.spotList[info.spotnumber];

//        console.log(' spotList in: ' + this.roomname + ' is: ', this.spotList);

    // TODO: RMW - Now database this removal in room_contents.
    if (overseer.roomDB) {
        overseer.roomDB.RemoveContentFromRoom(this.roomname.split('@')[0], info.spotnumber, function() {
            return true;
        }, function(msg) {
            self.log('AddSpotReflection: ERROR removing from database: ' + msg);
        });
    }
};

MucRoom.prototype.RemoveSpotReflection = function(iq) {
    // Need to pull out the 'info' object - which is the attributes to the 'removespot'
    var info = {};

    if (iq.getChild('removespot')) {
        info = iq.getChild('removespot').attrs;
    }

    if (!info.spotnumber) {
        this.log('RemoveSpotReflection: ERROR: Required spot number not specified.');
        iq = this.createErrorIQ(iq, 'Missing required spotnumber attribute.');
        console.log('iq error going back is:', iq);
    }
    else if (!this.spotList[info.spotnumber]) {
        // When we don't have a record of this spotnumber, we don't delete it.
        this.log('RemoveSpotReflection: ERROR: Unknown spot number.');
        iq = this.createErrorIQ(iq, 'spotnumber ' + info.spotnumber + ' is unknown to the overseer.');
        console.log('iq error going back is:', iq.root().toString());
    }
    else {
        this.RemoveSpotNumber(info.spotnumber);

        this.SendGroupCmd('removespot', info);

        // Prep to reply to the IQ message.
        iq.attrs.to = iq.attrs.from;
        delete iq.attrs.from;

        // Now reply to the IQ message favorably.
        iq.attrs.type = 'result';
    }

        // Send back the IQ result.
        this.client.send(iq.root());
};

//
// In a MUC room, we want to only handle our own messages destined for us.
// We also only want to handle 'chat' messages and not 'groupchat' inbound.
//
MucRoom.prototype.handleMessage = function(msg) {
    var self = this,
        nickfrom, cmd, k;

    if (msg.attrs.type !== 'groupchat')
    {
        // Ignore topic changes.
        if (msg.getChild('subject')) {
            return;
        }

        nickfrom = msg.attrs.from.split('/')[1];

        //
        // Here is where we process inbound requests.
        //
        // Language:
        // CMD [arg [arg...]]
        //
        // KICK ; nickname
        // LOCK
        // UNLOCK
        // INVITE ; jid ; nickname
        // BAN ; jid ; nickname
        //
        if (msg.getChild('body') && msg.getChild('body').getText())
        {
            // Now we need to split the message up and trim spaces just in case.
            cmd = msg.getChild('body').getText().split(';');
            for (k in cmd)
            {
                if (cmd.hasOwnProperty(k)) {
                    cmd[k] = cmd[k].trim();
                }
            }

            cmd[0] = cmd[0].toUpperCase();
            switch (cmd) {
            case 'KICK':

                // Must have a nickname as an argument.
                if (cmd[1])
                {
                    this.log('Command: KICKing out: ' + cmd[1]);

                    if (!this.kick(cmd[1], function() {
                        self.log('Command: KICK complete.');

                        self.sendGroupMessage(nickfrom + ' kicked ' + cmd[1] + ' out of the room.');
                    })) {
                        this.log('Command: KICK failed');
                    }
                }
                else {
                    this.log('Command: KICK - requires nickname.');
                }
                break;
            case 'LOCK':
                this.log('Command: LOCKing room.');
                if (this.lock() === true) {
                    self.sendGroupMessage(nickfrom + ' locked the room.');
                }
                break;
            case 'UNLOCK':
                this.log('Command: UNLOCKing room.');
                this.unlock();
                self.sendGroupMessage(nickfrom + ' un-locked the room.');
                break;
            case 'INVITE':
                if (!cmd[1] || !cmd[2]) {
                    this.log('Command: INVITE Invalid. No jid(' + cmd[1] + ') or no nickname(' + cmd[2] + ')');
                }
                else
                {
                    this.log('Command: Approving Invite to room of jid:' + cmd[1] + ' - nickname:' + cmd[2]);
                    this.invite(cmd[1]);    // Nickname only gets used for identification purposes.
                    self.sendGroupMessage(nickfrom + ' invited ' + cmd[1] + ' to join the room as nickname: ' + cmd[2]);
                }
                break;
            case 'BAN':
//              console.log("DEBUG: message:" + msg.tree());
                if (!cmd[1] || !cmd[2]) {
                    this.log('Command: BAN Invalid. No jid(' + cmd[1] + ') or no nickname(' + cmd[2] + ')');
                }
                else
                {
                    // in case we get a chat-formulated 'name@email.com <mailto:name@email.com>'
                    cmd[1] = cmd[1].split(' ')[0];

                    this.log('Command: Banning jid:' + cmd[1] + ' - nickname:' + cmd[2]);
                    this.banOutsiderByJid(cmd[1], function(resp) {
                        self.sendGroupMessage(nickfrom + ' banned ' + cmd[1] + ' from joining the room who was using nickname: ' + cmd[2]);
                    });
                }
                break;
            default:
                this.log('Invalid Command: ' + msg.getChild('body').getText());
                break;
            }

        }
        else {
            this.log('From:' + msg.attrs.from.split('/')[1] + ': ' + msg.getChild('body'));
        }
    }
    else {
        // Overseer received something from group chat ... we don't listen to much here.
        // But we listen for "Overseer" as a keyword for responding...
        // "Overseer, Hello" - elicits a public response.
        // "Overseer, private" - elicits a private message back
        // "Overseer, 42" - elicits "Hmm - you are asking a big one - What is the answer to life, the Universe, and everything?"
        if (msg.getChild('body') && msg.getChild('body').getText())
        {
            // Now we need to split the message up and trim spaces just in case.
            cmd = decodeURI(msg.getChild('body').getText());

            // If we start with 'OVERSEER', then we answer...
            if (cmd.match(/^overseer/i)) {
                cmd = cmd.slice(cmd.search(' '));

                if (cmd !== '') {
                    if (cmd.match(/hello/i)) {
                        // Response with a greeting publicly.
                        this.sendGroupMessage('Well, hello there to you as well. I hope you are having a great day.');
                    }
                    else if (cmd.match(/private/) || cmd.match(/whisper/i) || cmd.match(/wisper/i)) {
                        // Respond with a private chat
                        this.SendPrivateChat(msg.attrs.from, 'Shh, this is a private message just for you.');
                    }
                    else if (cmd.match('42')) {
                        // Responsd publicly with Life, the Universe and Everything.
                        this.sendGroupMessage('Hmm - the big answer to the big question - What is the answer to life, the Universe, and everything?');
                    }
                    else if (cmd.match('--help') || cmd.match('-help')) {
                        this.sendGroupMessage("Usage: 'hello', 'private', '42', or random phrases come back.");
                    }
                    else {
                        k = ['What is that you say?', "I'm sorry, I didn't get that...", "Can you speak up? I'm not a young computer.",
                             'First things first... HUH?', 'Am I allowed to hear all this talk?', 'Oh, a wise-guy huh?', 'Well...I never!'];
                        this.sendGroupMessage(k[Math.floor(Math.random() * k.length)]);
                    }
                }
            }
        }
    }

};

MucRoom.prototype.invite = function(invitejid) {
    var self = this;

    // Adding this particular jid to the members list.
    this.sendIQ(new xmpp.Element('iq', {to: this.roomname, type: 'set'})
        .c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
        .c('item', {affiliation: 'member', jid: invitejid}), function(resp) {
            if (resp.attrs.type === 'result') {
                self.log('Invite of ' + invitejid + ' successful.');
            }
            else {
                self.log('ERROR: Invite of ' + invitejid + ' failed:' + resp);
            }
        });
};

MucRoom.prototype.setupRoom = function(form) {
    var self = this,
        k;

    // We have received a form from the server. We need to make changes and send it back.
    if (!form.is('iq'))
    {
        this.log('ERROR: Server configuration form is not of type iq. Ignoring.');
        return;
    }

//  console.log("ROOM_SETUP: INITIAL: " + form.tree());
//  console.log("");

    form.attrs.to = form.attrs.from;
    delete form.attrs.from;
    form.attrs.type = 'set';

    if (form.getChild('query') && form.getChild('query').getChild('x'))
    {
        form.getChild('query').getChild('x').attr('type', 'submit');

        // Now we iterate through the desired options.
        // If we don't find one of our options, we have to assume the server doesn't accept it.
        // If we find it, we set the value to our desired value.

        for (k in this.options)
        {
            if (this.options.hasOwnProperty(k)) {
                if (form.getChild('query').getChild('x').getChildByAttr('var', k) &&
                        form.getChild('query').getChild('x').getChildByAttr('var', k).getChild('value'))
                {
    //              console.log("Change-Pre:  " + form.getChild('query').getChild('x').getChildByAttr('var', k));
                    form.getChild('query').getChild('x').getChildByAttr('var', k).getChild('value').text(this.options[k]);
    //              console.log("Change-Post: " + form.getChild('query').getChild('x').getChildByAttr('var', k));
                }
                else {
                    this.log('Skipping option: ' + k);
                }
            }
        }

//      console.log("ROOM_SETUP: FINAL: " + form.tree());

        // Now send the room setup off to the server.
        this.sendIQ(form, function(resp) {
            // Handle the response to the room setup.
            if (resp.attrs.type === 'result')
            {
//                self.log('Room setup successful.');

                if (self.successCallback) {
                    self.successCallback();
                    self.successCallback = null;
                    self.failureCallback = null;
                }

                self.bNewRoom = false;

                if (self.bSelfDestruct === true)
                {
//                    self.log('OVERSEER: (C-timer) Room setup - no one else in room [' + self.roomname.split('@')[0] + '] yet. Should be soon. Waiting...');

                    if (self.presenceTimer)
                    {
                        self.log('OVERSEER: ERROR: (C-timer) After init of room, presenceTimer should not already be set. Clearing.');
                        clearTimeout(self.presenceTimer);
                        self.presenceTimer = null;
                    }

                    self.presenceTimer = setTimeout(function() {
                        self.log('OVERSEER: (C-timer) After Init-Room [' + self.roomname.split('@')[0] + '] - No one entered within 30 seconds. Destroying.');
                        eventManager.emit('destroyroom', self.roomname.split('@')[0]);
                    }, 30000);
                }
            }
            else
            {
                self.log('Room setup failed. Response: ' + resp.tree());

                if (self.failureCallback) {
                    self.failureCallback();
                    self.successCallback = null;
                    self.failureCallback = null;
                }
            }
        });
    }
    else
    {
        this.log('setupRoom: No <query><x> ...');

        if (self.failureCallback) {
            self.failureCallback();
            self.successCallback = null;
            self.failureCallback = null;
        }
    }
};

//
// \brief Request, get, and clear the members list for this room.
//        Once this is complete. Call the callback.
//
MucRoom.prototype.clearMembersList = function(cb) {
    // Ask for the current list.
    var self = this,
        getmemb = new xmpp.Element('iq', {to: this.roomname, type: 'get'})
                        .c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
                        .c('item', {affiliation: 'member'});

//  console.log("clearMemberList - get request is: " + getmemb.tree());

    this.sendIQ(getmemb, function(curlist) {
        var k, items;

            if (curlist.attrs.type !== 'result') {
                self.log('ClearMembers: Get-Curlist failed: ' + curlist.tree());
            }

            if (curlist.getChild('query') && curlist.getChild('query').getChild('item'))
            {
                items = curlist.getChild('query').getChildren('item');

//              console.log("MUC clearMembers @" + self.roomname.split('@')[0] + ": Current entries: " + curlist.tree());

                // Iterate through all items and 'zero them out' -- no affiliation and nuke nick/role
                for (k in items)
                {
                    if (items.hasOwnProperty(k)) {
                        items[k].attrs.affiliation = 'none';

                        if (items[k].attrs.nick) {
                            delete items[k].attrs.nick;
                        }
                        if (items[k].attrs.role) {
                            delete items[k].attrs.role;
                        }
                    }
                }

//              console.log("MUC clearMembers @" + self.roomname.split('@')[0] + ": Modified entries: " + curlist.tree());

                // Going to turn this iq around regardless so the logic flow is identical.
                curlist.root().attrs.type = 'set';
                curlist.root().attrs.to = curlist.root().attrs.from;
                delete curlist.root().attrs.from;

                // After sending this, we'll have a cleared member list.
                // Then we can set our own.
                self.sendIQ(curlist, function(res) {
                    if (cb) {
                        cb.call(self, res);
                    }
                });
            }
            else
            {
                // No items in the list from the server. So we're already clear. Just callback.

//              console.log("MUC clearMembers @" + self.roomname.split('@')[0] + ": No members yet.");

                if (cb) {
                    cb.call(self, curlist);
                }
            }

    });
};

//
// \brief Request the banned-list for this room.
//        Once this is complete. Call the callback.
//
MucRoom.prototype.loadBannedList = function(cb) {
    // Ask for the current list.
    var self = this,
        getoutcast = new xmpp.Element('iq', {to: this.roomname, type: 'get'})
                            .c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
                            .c('item', {affiliation: 'outcast'});

//  console.log("loadBannedList - get request is: " + getoutcast.tree());

    this.sendIQ(getoutcast, function(curlist) {
        var k, items;
        // Zero out the current banned list
        self.bannedlist = {};

        if (curlist.attrs.type !== 'result') {
            self.log('loadBanned: Get-Curlist failed: ' + curlist.tree());
        }

        if (curlist.getChild('query') && curlist.getChild('query').getChild('item'))
        {
            items = curlist.getChild('query').getChildren('item');

//          console.log("MUC loadBanned @" + self.roomname.split('@')[0] + ": Current entries: " + curlist.tree());

            // Iterate through all items and put them in the bannedlist array.
            for (k in items)
            {
                if (items.hasOwnProperty(k)) {
                    self.bannedlist[items[k].attrs.jid] = true;
                }
            }
        }

        if (cb) {
            cb.call(self, curlist);
        }
    });

};

//
// \brief Request, get, and clear the banned list for this room.
//        Once this is complete. Call the callback.
//
MucRoom.prototype.clearBannedList = function(cb) {
    // Ask for the current list.
    var self = this,
        getoutcast = new xmpp.Element('iq', {to: this.roomname, type: 'get'})
                            .c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
                            .c('item', {affiliation: 'outcast'});

//  console.log("clearBannedList - get request is: " + getoutcast.tree());

    this.sendIQ(getoutcast, function(curlist) {
        var k, items;

            if (curlist.attrs.type !== 'result') {
                self.log('clearBanned: Get-Curlist failed: ' + curlist.tree());
            }

            if (curlist.getChild('query') && curlist.getChild('query').getChild('item'))
            {
                items = curlist.getChild('query').getChildren('item');

//              console.log("MUC clearBanned @" + self.roomname.split('@')[0] + ": Current entries: " + curlist.tree());

                // Iterate through all items and 'zero them out' -- no affiliation and nuke nick/role
                for (k in items)
                {
                    if (items.hasOwnProperty(k)) {
                        items[k].attrs.affiliation = 'none';

                        if (items[k].attrs.nick) {
                            delete items[k].attrs.nick;
                        }
                        if (items[k].attrs.role) {
                            delete items[k].attrs.role;
                        }
                    }
                }

//              console.log("MUC clearBanned @" + self.roomname.split('@')[0] + ": Modified entries: " + curlist.tree());

                // Going to turn this iq around regardless so the logic flow is identical.
                curlist.root().attrs.type = 'set';
                curlist.root().attrs.to = curlist.root().attrs.from;
                delete curlist.root().attrs.from;

                // After sending this, we'll have a cleared member list.
                // Then we can set our own.
                self.sendIQ(curlist, function(res) {
                    var k;

                    for (k in self.bannedlist)
                    {
                        if (self.bannedlist.hasOwnProperty(k)) {
                            delete self.bannedlist[k];
                        }
                    }

                    if (cb) {
                        cb.call(self, res);
                    }
                });
            }
            else
            {
                // No items in the list from the server. So we're already clear. Just callback.
                for (k in self.bannedlist) {
                    if (self.bannedlist.hasOwnProperty(k)) {
                        delete self.bannedlist[k];
                    }
                }

//              console.log("MUC clearBanned @" + self.roomname.split('@')[0] + ": No banned jids.");

                if (cb) {
                    cb.call(self, curlist);
                }
            }

    });
};

MucRoom.prototype.lock = function() {
    var self = this;

    if (this.islocked)
    {
        this.log('ERROR: Room is already locked.');
        return false;
    }

    // locking a room requires bumping each person to 'member'
    // In this version, we'll first ask the server for the member list. If there is anyone on the
    // list, we'll remove them from the list and then we'll set the current member list 'cleanly'.
    // And then on response, lock the room.

    this.clearMembersList(function(res) {

        if (res.attrs.type !== 'result') {
            self.log('LOCK: clearMembers failed: ' + res.tree());
        }

        // Now clear the banned list prior to locking the room.
        self.clearBannedList(function(res) {
            var k, memblist;

            if (res.attrs.type !== 'result') {
                self.log('LOCK: clearBanned failed: ' + res.tree());
            }

                // Setup the head of the iq-set
                memblist = new xmpp.Element('iq', {to: self.roomname, type: 'set'})
                                .c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'});

                for (k in self.participants)
                {
                    if (self.participants.hasOwnProperty(k)) {
                        if (k !== self.nick) // Don't modify myself
                        {
                            if (k !== self.participants[k])
                            {
                                // Sending each IQ with no callback. Could wind up in a race for locking the room.
                                memblist.c('item', {affiliation: 'member', jid: self.participants[k]}).up();
                            }
                            else {
                                self.log('LOCK: Cannot make member. No jid found for: ' + k);
                            }
                        }
                    }
                }

//              console.log("MUC Lock @" + self.roomname.split('@')[0] + " Prepped to send member-list: " + memblist.tree());

                // Send the 'set' for the member list. Then Wait for a response and send the lock-room signal.
                self.sendIQ(memblist, function(resp) {
                // Now we need to change the room to be members-only.
                    if (resp.attrs.type === 'result')
                    {
                        this.sendIQ(new xmpp.Element('iq', {to: self.roomname, type: 'set'})
                                .c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'})
                                .c('x', {xmlns: 'jabber:x:data', type: 'submit'})
                                .c('field', {'var': 'FORM_TYPE', type: 'hidden'})
                                .c('value').t('http://jabber.org/protocol/muc#roomconfig')
                                .up().up()
                                .c('field', {'var': 'muc#roomconfig_membersonly', type: 'boolean'})
                                .c('value').t('1'), function(resp) {
                                    if (resp.attrs.type === 'result')
                                    {
                                        self.log('Locked successfully.');
                                        self.islocked = true;
                                    }
                                    else {
                                        self.log('ERROR: NOT LOCKED. Resp: ' + resp.tree());
                                    }
                                });
                    }
                    else {
                        self.log('ERROR: NOT LOCKED. Member-List failed Resp: ' + resp.tree());
                    }
                });
            });
        });

    return true;
};

MucRoom.prototype.unlock = function() {
    var self = this;

    // TODO
    // We should destroy the members-list prior to opening up the room so that 'lock' will work properly.

    // We need to change the room to be members-only=0.
    this.sendIQ(new xmpp.Element('iq', {to: this.roomname, type: 'set'})
            .c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'})
            .c('x', {xmlns: 'jabber:x:data', type: 'submit'})
            .c('field', {'var': 'FORM_TYPE', type: 'hidden'})
            .c('value').t('http://jabber.org/protocol/muc#roomconfig')
            .up().up()
            .c('field', {'var': 'muc#roomconfig_membersonly', type: 'boolean'})
            .c('value').t('0'), function(resp) {
                if (resp.attrs.type === 'result')
                {
                    self.log('Unlocked successfully.');
                    self.islocked = false;

                    // Now we shall clear the memebers list and the banned list.
                    this.clearMembersList(function(res) {

                        if (res.attrs.type !== 'result') {
                            self.log('Unlock: clearMembers failed: ' + res.tree());
                        }

                        // Now clear the banned list prior to locking the room.
                        self.clearBannedList(function(res) {

                            if (res.attrs.type !== 'result') {
                                self.log('Unlock: clearBanned failed: ' + res.tree());
                            }

                        });
                    });
                }
                else {
                    self.log('Unlock: ERROR: NOT UNLOCKED. Resp: ' + resp.tree());
                }
            });
};

//
// Kicking a person effectively removes them from the room but is different than a ban.
// Kick allows them to attempt to re-enter.
// Kick sets the role to none (not affiliation to outcast)
// Kick uses the nickname and not the jid to do the kick.
//
MucRoom.prototype.kick = function(nick, cb) {
    var role = 'none',
        nickToKick = nick.replace(/ /g, '\\20');

    // See if nickname exists.
    if (!this.participants[nickToKick]) {
        return false;
    }

    // Kicking the user out forcefully. Not banning them however.
    this.sendIQ(new xmpp.Element('iq', {to: this.roomname, type: 'set'})
                .c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
                .c('item', {nick: nickToKick, role: role}), cb);
    return true;
};

//
// Ban is much more permanent.
// Ban removes the person from the room using the jid and not the nickname.
// Ban sets affiliation to 'outcast'
// Ban keeps track of the jid who was banned and disallows entry in the future.
//
MucRoom.prototype.banFromRoomByNick = function(nick, cb) {
    var jid = this.participants[nick].name,
        affil = 'outcast',
        nickToBan = nick.replace(/ /g, '\\20');

    // See if nickname exists.
    if (!this.participants[nickToBan]) {
        return false;
    }

    // Found an entry in the array and it wasn't just a nick.
    if (jid && jid !== nickToBan)
    {
        // Add person to banned list internally.
        this.bannedlist[jid] = true;

        // Kicking the user out forcefully. BANNED.
        this.sendIQ(new xmpp.Element('iq', {to: this.roomname, type: 'set'})
                    .c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
                    .c('item', {jid: jid, affiliation: affil}), cb);

        return true;
    }
    else
    {
        this.log("Ban: Couldn't seem to find '" + nick + "'. Must have scrammed.");
        return false;
    }
};

//
// Ban is much more permanent.
// Ban removes the person's ability to join the room if an outsider.
// Ban sets affiliation to 'outcast'
// Ban keeps track of the jid who was banned and disallows entry in the future.
// This is intended for thwarting the annoying "KNOCK" from the outside.
//
MucRoom.prototype.banOutsiderByJid = function(jid, cb) {
    var affil = 'outcast';

    // Kicking the user out forcefully. BANNED.
    this.sendIQ(new xmpp.Element('iq', {to: this.roomname, type: 'set'})
                .c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
                .c('item', {jid: jid, affiliation: affil}), cb);

    // Add person to banned list internally.
    this.bannedlist[jid] = true;

    return true;
};

MucRoom.prototype.isBanned = function(jid) {
    return this.bannedlist[jid] ? true : false;
};

MucRoom.prototype.sendGroupMessage = function(msg_body) {
    var msg = new xmpp.Element('message', {to: this.roomname, type: 'groupchat'})
        .c('body').t(msg_body);

    this.client.send(msg);
};

MucRoom.prototype.sendIQ = function(iq, cb) {
    var iqid = this.roomname.split('@')[0] + '_iqid' + this.iqnum,
        self = this;

    this.iqnum += 1;

    if (!iq.root().is('iq'))
    {
        this.log('sendIQ: malformed inbound iq message. No <iq> stanza: ' + iq.tree());
        return;
    }

    // Add in our ever-increasing room-based id.
    iq.root().attr('id', iqid);

    if (cb) {
        this.iq_callbacks[iqid] = cb;
    }
    else {
        this.log('sendIQ: INFO: No callback for id=' + iqid);
    }

/*  this.log("sendIQ: Callback list: ");
    for (k in this.iq_callbacks)
        this.log("  CB_ID: " + k);
*/
//  this.log("sendIQ: SendingIQ: " + iq.tree());

    this.client.send(iq.root());
};

MucRoom.prototype.leave = function() {
    var to = this.roomname,
        el;

    if (this.nick) {
        to += '/' + this.nick;
    }

    el = new xmpp.Element('presence', {to: to, usertype: 'silent', type: 'unavailable'})
                    .c('x', {xmlns: 'http://jabber.org/protocol/muc'});

    this.log('Leaving.'); // + el.tree());
    this.client.send(el);
};

MucRoom.prototype.join = function(rmname, nick) {
    // The sole purpose of this nick_original is to allow us to exit/re-join as non-original and kick
    // a user out who is an imposter to the overseer and then re-join again
    this.nick_original = nick;

    this.rejoin(rmname, nick);
};

MucRoom.prototype.rejoin = function(rmname, nick) {
    var to = rmname,
        self = this,
        el;

    if (gSkipJoining) {
        this.log('SKIPPING JOIN of: ' + rmname);
        return;
    }

    // If no nick is specified, then just join. This must be a signal that we are coming in
    // to kick out an imposter to the original overseer nickname.
    if (nick) {
        to += '/' + nick;
    }

    el = new xmpp.Element('presence', {to: to, usertype: 'silent'})
                    .c('x', {xmlns: 'http://jabber.org/protocol/muc'});

    // Want to set the roomname in particular before calling .log so formatting is correct.
    this.roomname = rmname;
    this.nick = nick;

    this.ValidateWBFolder();

    this.log('Joining: ' + rmname + ' as ' + nick + '. '); // + el.tree());
    this.client.send(el);

    if (this.joinTimer)
    {
        clearTimeout(this.joinTimer);
        this.joinTimer = null;
        this.log('ReJoin: WARNING: joinTimer was already set. Odd. Clearing it.');
    }

    this.joinTimer = setTimeout(function() {
        // If we don't get our own presence in the room within a few seconds, then something's wrong.
        // This is CRITICAL as we are the ones who create the room initially.
        // If it didn't work, then we'll simply flag it and call rejoin() again.
        self.log('ERROR: REJOIN Failed to give our presence in room. Re-joining again...');
        self.joinTimer = null;

        self.rejoin(rmname, nick);
    }, 4000);
};

var MucroomObjectPool = {
    objPool: [],
    client: null,
    notifier: null,

    init: function(client, notifier) {
        this.client = client;
        this.notifier = notifier;
    },

    get: function() {
        if (0 === this.objPool.length) {
            this.objPool.push(new MucRoom(this.client, this.notifier, {}));
        }

        return this.objPool.pop();
    },

    put: function(roomObj) {
        roomObj.reset();
        this.objPool.push(roomObj);
    }
};

function watchFile(fname) {
    // load filename &
    fs.watchFile(fname, {persistent: true, interval: 3000}, function(curr, prev) {
      if (curr.mtime > prev.mtime)
      {
        var temp_xml;
        temp_xml = fs.readFileSync(fname, 'utf8');
//          console.log('Changed contents: ' + contents);
      }
    });
}

//
// TODO: Finish this - process the list of xml files building 'static_roomnames'
//       Then upon any changes, find the missing entries and add them.
//       And find the removed entries and delete those rooms.
//
function loadRoomsAndProcess(filenames, static_roomnames)
{
    var temp_rooms = {},
        k;

    for (k in filenames)
    {
        if (filenames.hasOwnProperty(k)) {
            watchFile(filenames[k]);
        }
    }
}

function loadRooms(filename) {
    console.log(logDate() + ' - Loading rooms database from: ' + filename);
    return fs.readFileSync(filename, 'utf8');
}



////////////////////////////////////////////////////////////////////////////////////////
///
///
///  O  V  E  R  S  E  E  R
///
///
////////////////////////////////////////////////////////////////////////////////////////



function Overseer(user, pw, notifier, bManager, staticRoomList) {
    var roomsxml, par, rooms,
        k,
        option,
        self = this,
        roomlen, sroom;

    this.CONF_SERVICE = settings.CONF_SERVICE || '@gocastconference.video.gocast.it';
    this.SERVER = settings.SERVERNAME || 'video.gocast.it';
    this.OVERSEER_NICKNAME = settings.overseer.OVERSEER_NICKNAME || 'overseer';
    this.static_roomnames = {};
    this.MucRoomObjects = {};
    this.notifier = notifier;
    this.iqnum = 0;
    this.iq_callbacks = {};
    this.roommanager = bManager || false;
    this.roomDB = null;
    this.debugmode = null;

    this.active_rooms = {};

    if (staticRoomList) {
        roomlen = staticRoomList.length;
        for (sroom = 0 ; sroom < roomlen ; sroom += 1) {
            this.log('Reading XML File: ' + staticRoomList[sroom]);

            roomsxml = loadRooms(staticRoomList[sroom]); // '/var/www/etzchayim/xml/schedules.xml');
            par = new ltx.parse(roomsxml);
            rooms = par.getChildren('room');

            for (k in rooms)
            {
                if (rooms.hasOwnProperty(k)) {
                    if (this.static_roomnames[rooms[k].attrs.jid.split('@')[0]]) {
                        this.log('  WARNING: Duplicate Room: ' + rooms[k].attrs.jid);
                    }
                    else {
                        this.log('  Monitoring room: ' + rooms[k].attrs.jid);
                    }

                    this.static_roomnames[rooms[k].attrs.jid.split('@')[0]] = true;
                }
            }
        }
    }

    if (this.roommanager) {
        this.roomDB = new RoomDatabase(notifier);
    }

//console.log('DEBUG: user: ' + user + ', pw: ' + pw + ', server: ' + this.SERVER + ', port: ' + settings.SERVERPORT);
    this.client = new xmpp.Client({ jid: user, password: pw, reconnect: true, host: this.SERVER, port: settings.SERVERPORT });

    // Very important - because we listen to a single node-xmpp client connection here,
    // we have a lot of potential listeners to an emitter. To avoid the warning about this...
    this.client.setMaxListeners(0);

    // Init MucroomObjectPool
    MucroomObjectPool.init(this.client, this.notifier);

    this.client.on('online', function() {
        var el, k;

        // Mark ourself as online so that we can receive messages from direct clients.
        el = new xmpp.Element('presence');
        self.client.send(el);

        // Need to join all rooms in 'rooms'
        for (k in self.static_roomnames)
        {
            if (self.static_roomnames.hasOwnProperty(k)) {
                self.MucRoomObjects[k] = new MucRoom(self.client, self.notifier, { bSelfDestruct: false });
                self.MucRoomObjects[k].finishInit();

                self.MucRoomObjects[k].join(k + self.CONF_SERVICE, self.OVERSEER_NICKNAME);
            }
        }

        if (self.roommanager) {
            self.LoadActiveRoomsFromDB();
        }
    });

    this.client.on('offline', function() {
        var k;

        // Clean up / remove all existing rooms in memory.
        for (k in self.static_roomnames)
        {
            if (self.static_roomnames.hasOwnProperty(k)) {
                delete self.MucRoomObjects[k];
            }
        }

        self.log('Overseer went offline. Reconnection should happen automatically.');
    });

    //
    // Now once we're online, we need to handle all incoming from each room.
    this.client.on('stanza', function(in_stanza) {
        var stanza = in_stanza.clone();

        if (self.debugmode === 'ALL' || self.debugmode === 'OVERSEER') {
            self.log('DEBUGSTANZAS: OVERSEER: ' + stanza.toString());
        }

        if (stanza.is('message') && stanza.attrs.type !== 'error') {
            self.handleMessage(stanza);
        }
        else if (stanza.is('presence')) {
            self.handlePresence(stanza);
        }
        else if (stanza.is('iq') && stanza.attrs.type !== 'error') {
            self.handleIq(stanza);
        }
        else {
            self.log('UNHANDLED: ' + stanza.toString());
        }
    });

    this.client.on('error', function(e) {
        sys.puts(e);
        self.notifylog('OVERSEER: ERROR-EMIT-RECEIVED: ' + e);
    });

    // Overseer events
    eventManager.on('destroyroom', function(roomname) {
        var mroom = self.MucRoomObjects[roomname],
            parts, k;

        if (mroom) {
            if (mroom.DeleteRoom()) {
                console.log('OVERSEER: Deleting room [' + roomname + ']');
                self.destroyRoom(roomname);
            }
            else {
                console.log('OVERSEER: Did not delete room [' + roomname + ']');
            }
        }
    });

    eventManager.on('error', function(e) {
        sys.puts(e);
        self.notifylog('OVERSEER-eventManager: ERROR-EMIT-RECEIVED: ' + e);
    });
}

Overseer.prototype.LoadActiveRoomsFromDB = function() {
    var self = this;

    this.log('LoadActiveRoomsFromDB - Loading database list of rooms.');

    if (!this.roomDB) {
        this.log('ERROR: No roomDB created yet. Skipping LoadActiveRoomsFromDB.');
        return false;
    }

    this.roomDB.LoadRooms(function(rooms_in) {
        var k, addOne,
            i, len,
            batchDelay = 500;

        // Doing delay-load/add on rooms list.
        addOne = function(roomname, obj) {

        };

        self.active_rooms = rooms_in;

        // Note: We use bSkipDBPortion on AddTrackedRoom() call here to avoid DB hits.
        for (k in rooms_in) {
            if (rooms_in.hasOwnProperty(k)) {
                if (k !== k.toLowerCase()) {
                    self.log('WARNING: LoadRooms: Upper-Case Roomname found in Database: ' + k);
                }

                self.AddTrackedRoom(k.toLowerCase(), rooms_in[k], function() {
                    self.log('Added from DB: ' + k);
                }, function(msg) {
                    self.log('LoadRooms: ERROR: Failed ' + k + ' with msg: ' + msg);
                }, true);

                // Now load/add the contents of said room.
                if (self.roomDB) {
                    self.roomDB.LoadContentsFromDBForRoom(k.toLowerCase(), function(contents) {
                        var temproomname, tempspotnumber;

                        if (contents) {
                            len = contents.length;

                            // Iterate through contents and add them to the memory DB.
                            for (i = 0; i < len; i += 1)
                            {
                                // Pull out the hash and range from the dynamodb and use that as keys.
                                temproomname = contents[i].roomname.toLowerCase();
                                tempspotnumber = contents[i].spotnumber;

                                if (!self.MucRoomObjects[temproomname]) {
                                    self.log('ERROR: MucRoomObject for room: ' + temproomname + ' is missing.');
                                }
                                else {
                                    delete contents[i].roomname;        // Dont clutter the internal memory database.
                                    self.MucRoomObjects[temproomname].AddSpotType(contents[i].spottype, contents[i]);
                                }
                            }

                            // Now load any whiteboards and make canvases.
                            if (self.MucRoomObjects[temproomname]) {
                                self.MucRoomObjects[temproomname].LoadAllWhiteboards();
                            }
                        }
                    }, function(msg) {
                        self.log('LoadRooms: ERROR: Could not load contents for: ' + k);
                    });

                }
                else {
                    self.log('ERROR: RoomDB is not initialized for loading room contents.');
                }
            }
        }
    }, function(err) {
        self.log('LoadRooms ERROR: ' + err);
    });

};

Overseer.prototype.destroyRoom = function(roomname) {
    var self = this,
        iqDestroyRoom, k;

    if (this.MucRoomObjects[roomname]) {
        iqDestroyRoom = new xmpp.Element('iq', {to: roomname + this.CONF_SERVICE, type: 'set'})
                                .c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'})
                                .c('destroy');

        this.MucRoomObjects[roomname].pendingDeletion = true;

        this.sendIQ(iqDestroyRoom.root(), function(iq) {
            if ('result' === iq.attrs.type) {
                self.log('OVERSEER: Successfully deleted [' + roomname + ']... removing MucRoomObject');

                self.RemoveTrackedRoom(roomname, function() {}, function() {});
            }
            else {
                self.log('OVERSEER: Error deleting room [' + roomname + ']...' + iq.toString());
            }
        });
    } else {
        console.log('OVERSEER: Room [' + roomname + '] object not present. No room destruction.');
        console.log('OVERSEER: Dumping list of rooms in MucRoomObjects[]...');
        for (k in self.MucRoomObjects) {
            if (self.MucRoomObjects.hasOwnProperty(k)) {
                console.log('  ' + k);
            }
        }
    }
};

Overseer.prototype.notifylog = function(msg) {
    if (this.notifier) {
        this.notifier.sendMessage(logDate() + ' - Overseer: ' + decodeURI(msg));
    }
    else {
        console.log(logDate() + ' - Overseer: NULL-NOTIFIER-MESSAGE: ' + decodeURI(msg));
    }
};

Overseer.prototype.log = function(msg) {
    console.log(logDate() + ' - Overseer: ' + decodeURI(msg));
};

Overseer.prototype.sendIQ = function(iq, cb) {
    var iqid = 'overseer_iqid' + this.iqnum,
        self = this;

    this.iqnum += 1;

    if (!iq.root().is('iq'))
    {
        this.log('sendIQ - malformed inbound iq message. No <iq> stanza: ' + iq.tree());
        return;
    }

    // Add in our ever-increasing room-based id.
    iq.root().attr('id', iqid);

    if (cb) {
        this.iq_callbacks[iqid] = cb;
    }
    else {
        this.log('sendIQ: - No callback for id=' + iqid);
    }

/*  console.log("overseer sendIQ: - Callback list: ");
    for (k in this.iq_callbacks)
        console.log("  CB_ID: " + k);
*/
//  console.log("overseer sendIQ: SendingIQ: " + iq.tree());

    this.client.send(iq.root());
};

Overseer.prototype.sendGroupMessage = function(room, msg_body) {
    var msg = new xmpp.Element('message', {to: room, type: 'groupchat'})
        .c('body').t(msg_body);

    this.client.send(msg);
};

function deentitize(instr) {
    return instr.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}

//
// \brief Need to check the room's banned-list for this person.
//
Overseer.prototype.handleMessage = function(msg) {
    var cmd, k, l, temp,
        fromjid, fromnick, toroom, plea, mroom;
    // Listen to pure chat messages to the overseer.

    // Now, if we get a direct chat, it could be from a person in a room who is sending commands to
    // the overseer 'in the room' but it'll be received directly by the overseer as well.
    // So, we need to distinguish this.
    // Messages which are room-commands will come "from" "room@gocastconference.video.gocast.it/nickname"
    // while private external messages (for KNOCK especially) will come from true personal jids.
    // So, we'll look for '@gocastconference.video.gocast.it' in the string.
    if (msg.attrs.type === 'groupchat' || msg.attrs.from.indexOf(this.CONF_SERVICE) !== -1) {
        return;
    }

//      console.log("DEBUG: InMsg: " + msg);
    if (msg.getChild('body') && msg.getChild('body').getText() && !msg.getChild('delay'))
    {
        // Now we need to split the message up and trim spaces just in case.
        cmd = deentitize(decodeURI(msg.getChild('body').getText())).split(';');
        for (k in cmd) {
            if (cmd.hasOwnProperty(k)) {
                cmd[k] = cmd[k].trim();
            }
        }

        cmd[0] = cmd[0].toUpperCase();

        switch (cmd[0]) {
        case 'KNOCK':
            fromjid = cmd[1].split(' ')[0]; // Just in case chat client does <mailto:> tag following jid.
            fromnick = cmd[2];
            toroom = cmd[3];
            plea = cmd[4];

            // Format of KNOCK
            // KNOCK ; <from-jid> ; <from-nickname> ; <bare-roomname> ; [message]
            if (!fromjid || !fromnick || !toroom || !this.MucRoomObjects[toroom]) {
                this.log('KNOCK Invalid. No JID (' + fromjid + '), nickname (' + fromnick + '), room (' + toroom + ') or room not found:');
            }
            else
            {
//              console.log("DEBUG: Checking on ban-status for: " + fromjid);
                // We have a room by that name.
                // First, see if the jid is banned. If so, don't do anything.
                if (!this.MucRoomObjects[toroom].isBanned(fromjid))
                {
                    // If they are not banned, let's send the message down...
                    this.sendGroupMessage(toroom + this.CONF_SERVICE, 'KNOCK ; FROM ; ' + fromjid + ' ; AS ; ' + fromnick + ' ; ' + (plea || ''));
                }
                else {
                    this.log('KNOCK refused. JID (' + fromjid + '), is on the banned list for room (' + toroom + ')');
                }
            }
            break;
        case 'LIVELOG':
            temp = 'LIVELOG: From: ' + cmd[1] + ' Msg: ' + cmd[2];
            this.log(temp);
            this.notifylog(temp);
            break;
        case 'SKIPJOIN':
        case 'SKIPJOINING':
            if (!cmd[1] || cmd[1].toLowerCase() === 'on') {
                gSkipJoining = true;
                temp = 'Skipping joining of all rooms enabled.';
            }
            else {
                temp = 'Skipping joining of all rooms disabled. Back to normal.';
                gSkipJoining = false;
            }
            this.log(temp);
            this.notifylog(temp);
            break;
        case 'SETMAXPARTICIPANTS':
            // cmd[1] is room name
            // cmd[2] is new maximum
            if (cmd[1] && cmd[2] && this.MucRoomObjects[cmd[1].toLowerCase()])
            {
                // Validate cmd[2] is a number.
                temp = parseInt(cmd[2], 10);
                if (temp && temp > 0) {
                    if (this.MucRoomObjects[cmd[1].toLowerCase()].SetMaxRoomParticipants(temp)) {
                        this.notifylog('Successfully set new maxparticipants in room: ' + cmd[1] + ' to: ' + cmd[2]);
                    }
                    else {
                        this.notifylog('WARNING: Failed to set new maxparticipants in room: ' + cmd[1] + ' to: ' + cmd[2]);
                    }
                }
            }
            else {
                this.notifylog('ERROR: Failed to SETMAXPARTICIPANTS - be sure to use SETMAXPARTICIPANTS;roomname;newmaxvalue');
            }
            break;
        case 'LISTROOMS':
            if (this.roommanager) {
                temp = 'LISTROOMS Request: \n';
                for (k in this.MucRoomObjects) {
                    if (this.MucRoomObjects.hasOwnProperty(k)) {
                        mroom = this.MucRoomObjects[k];
                        temp += ' ROOM: ' + k;
                        // pendingDeletion && bSelfDestruct
                        temp += mroom.bSelfDestruct ? '' : ' Non-Self-destruct';
                        temp += mroom.pendingDeletion ? ' Pending-deletion' : '';
                        temp += ' maxParticipants=' + mroom.maxParticipants;

                        if (size(mroom.participants) > 1) {
                            for (l in mroom.participants) {
                                if (mroom.participants.hasOwnProperty(l)) {
                                    temp += '\n       ' + l;
                                }
                            }
                        }

                        temp += '\n';
                    }
                }
                this.log(temp);
                this.notifylog(temp);
            }
            break;
        case 'RELOADROOMS':
        case 'REFRESHROOMS':
            if (this.roommanager) {
                this.notifylog('Reloading rooms on the fly.');
                this.LoadActiveRoomsFromDB();
            }
            break;
        case 'DEBUGSTANZAS':
            if (cmd[1]) {
                cmd[1] = cmd[1].toUpperCase();

                // Valid modes are: ALL (both overseer and all mucrooms)
                //                  OVERSEER (only overseer stanzas)
                //                  MUCROOMS (only mucroom stanzas)
                if (cmd[1] === 'ALL' || cmd[1] === 'OVERSEER' || cmd[1] === 'MUCROOMS') {
                    this.debugmode = cmd[1];
                    temp = 'DEBUGSTANZAS set to: ' + cmd[1];
                    this.log(temp);
                    this.notifylog(temp);
                }
                else if (cmd[1] === 'NONE' || cmd[1] === 'OFF') {
                    this.debugmode = null;
                    temp = 'DEBUGSTANZAS are now off.';
                    this.log(temp);
                    this.notifylog(temp);
                }
                else {
                    temp = 'DEBUGSTANZAS - Illegal mode: ' + cmd[1] + ' - Use ALL/OVERSEER/MUCROOMS/NONE only';
                    this.log(temp);
                    this.notifylog(temp);
                }
            }
            else {
                temp = 'DEBUGSTANZAS status currently: ' + this.debugmode;
                this.log(temp);
                this.notifylog(temp);
            }
            break;
        case 'HELP':
            this.notifylog('Commands: LISTROOMS');
            this.notifylog('          DEBUGSTANZAS ; [ALL | OVERSEER | MUCROOMS | NONE]');
            this.notifylog('          SETMAXPARTICIPANTS; <roomname> ; maxParticipants');
//            this.notifylog('          KNOCK');
            this.notifylog('          LIVELOG ; <from-name> ; <message>');
            this.notifylog('          SKIPJOIN ; [ON | OFF]');
            this.notifylog('          RELOADROOMS');
            break;
        default:
            this.log('Direct message: Unknown command: ' + msg.getChild('body').getText());
            break;
        }
    }
};

//
// At this level, we only want to handle presence at the server level.
// This means only listen to presence from jids with no username.
//
Overseer.prototype.handlePresence = function(pres) {
    if (!pres.attrs.from.split('@'))
    {
        this.log('Got pres: ' + pres);
    }
};

Overseer.prototype.generateRandomRoomName = function() {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyz',
        len = chars.length,
        genLength = 16,
        result = '',
        i, rnum;

    for (i = 0; i < genLength; (i += 1)) {
        rnum = Math.floor(Math.random() * len);
        result += chars.substring(rnum, rnum + 1);
    }

    return result;
};

Overseer.prototype.AddTrackedRoom = function(roomname, obj, cbSuccess, cbFailure, bSkipDBPortion) {
    var self = this;

    if (this.active_rooms[roomname] && this.MucRoomObjects[roomname]) {
        this.log('WARNING: AddTrackedRoom - Ignoring - Room already present: ' + roomname);
        cbSuccess('WARNING: AddTrackedRoom - Ignoring - Room already present: ' + roomname);

        // Ensure we are actually in each room at this stage though -- are we?
        if (!this.MucRoomObjects[roomname].participants[this.OVERSEER_NICKNAME]) {
            this.log('WARN: Room Manager is *NOT* in the room requested. Joining room: ' + roomname);
            this.MucRoomObjects[roomname].join(roomname + this.CONF_SERVICE, this.OVERSEER_NICKNAME);
        }
        return true;
    }

    this.MucRoomObjects[roomname] = MucroomObjectPool.get();

    if (obj) {
        this.active_rooms[roomname] = obj;
        delete this.active_rooms[roomname].roomname;
    }
    else {
        this.active_rooms[roomname] = { persistent: this.MucRoomObjects[roomname].bSelfDestruct ? 0 : 1 };
    }

    if (this.active_rooms[roomname].persistent === 1) {
        this.MucRoomObjects[roomname].bSelfDestruct = false;
    } else if (this.active_rooms[roomname].persistent === 0) {
        this.MucRoomObjects[roomname].bSelfDestruct = true;
    }

//    console.log('Overseer: Adding room ' + roomname + '. New Roomlist=', this.active_rooms);

    if (this.roomDB && !bSkipDBPortion) {
        this.roomDB.AddRoom(roomname, this.active_rooms[roomname], function() {
            self.MucRoomObjects[roomname].finishInit(function() {
//                self.log('AddTrackedRoom: finishInit successful for: ' + roomname);
                cbSuccess();
            }, function() {
                cbFailure('AddTrackedRoom: ERROR: finishInit failed for: ' + roomname);
            });

            self.MucRoomObjects[roomname].join(roomname + self.CONF_SERVICE, self.OVERSEER_NICKNAME);
        }, function() {
            self.log('AddTrackedRoom: AddRoom failed.');
            cbFailure('ERROR: AddRoom for DB failed.');
        });
    }
    else {
        if (!bSkipDBPortion) {
            this.log('WARNING: roomDB is not initialized. TrackedRoom will not be databased.');
        }

        // Even without the database, we need to finish the init process on the mucRoom.
        this.MucRoomObjects[roomname].finishInit(function() {
            cbSuccess();
        }, function() {
            cbFailure('ERROR: non-DB-finishInit failed.');
        });

        this.MucRoomObjects[roomname].join(roomname + self.CONF_SERVICE, self.OVERSEER_NICKNAME);
    }

    return true;
};

Overseer.prototype.RemoveTrackedRoom = function(roomname, cbSuccess, cbFailure) {
    var self = this;

    if (!this.active_rooms[roomname]) {
        this.log('ERROR: Attempt to remove an unknown room: ' + roomname);
        return false;
    }

//    console.log('Overseer: Removing room. Roomlist=', this.active_rooms);

    if (this.roomDB) {
        this.roomDB.RemoveRoom(roomname, function() {
//            self.log('RemoveTrackedRoom: RemoveRoom success for: ' + roomname);
            cbSuccess();
        }, function() {
            self.log('RemoveTrackedRoom: RemoveRoom failed.');
            cbFailure('ERROR: RemoveRoom failed.');
        });
    }

    delete this.active_rooms[roomname];

    // Clean up the MucRoomObjects pool.
    this.MucRoomObjects[roomname].pendingDeletion = false;
    MucroomObjectPool.put(self.MucRoomObjects[roomname]);
    delete self.MucRoomObjects[roomname];

    return true;
};

//
// \brief Uses the requested room and checks to see if the room exists. If not,
//      then it gives back the requested room name. If the room exists, it checks
//      to see if the room is full. If not, it returns the requested room.
//      Then the fun begins - if the room is full and overflow is NOT allowed,
//      then it returns null.
//      If, however, overflow is allowed, then it calculates roomnames by appending
//      '-n' to the end of the name where 'n' is an increasing integer starting at 1
//      until an empty or non-full room is found. When this happens, the newly
//      calculated room name is returned.
// \param desiredRoom - preferred room name.
// \returns room name allowed based on overflow feature and availability
//
Overseer.prototype.FindOpenSpotInRoomOverflow = function(desiredRoom) {
var k, mobs, curRoom, breakUp, curDigits, curBase,
    roomExists, roomFull;

    mobs = this.MucRoomObjects;
    curRoom = desiredRoom;  // Starting point.

    // Need to iterate through rooms starting from desiredRoom
    // and see if they are full. If so, then formulate the 'next'
    // room name and check there.
    //
    // Room name iteration is 'roomname' followed by 'roomname-1'
    // then 'roomname-2' ...
    //
    while (true) {
        roomExists = mobs[curRoom];
        roomFull = roomExists && roomExists.IsFull();

        // If we don't even have that room name yet...it's all good.
        // Also - if it's not full, then we're also good.
        if (!roomExists || !roomFull) {
            return curRoom;
        }

        // If the room is full and we do not allow overflow, then return null.
        if (roomExists && roomFull && !settings.roommanager.allow_overflow) {
            return null;
        }

        // Otherwise we need to formulate the next 'curRoom' and try again.
        if (curRoom.match(/-\d$/)) {
            // Already have a '-digit(s)' at the end of curRoom - time to advance it +1
            breakUp = curRoom.match(/(\w*?)-(\d+$)/);
            curDigits = parseInt(breakUp[2], 10);
            curDigits += 1;

            curBase = breakUp[1];
            curRoom = curBase + '-' + curDigits;  // Put it back together.
        }
        else {
            // Currently the room name has no digits trailing - so add a '1'.
            curRoom += '-1';
        }
    }

};

Overseer.prototype.CreateRoomRequest = function(iq) {
    var newRoomname, roomname = iq.getChild('room').attr('name'),
        maxParticipantsRequested = iq.getChild('room').attr('maxparticipants'),
        self = this,
        iqResult, bUsingDefaultRoom = false, addRoomOptions = null;

    //
    // Default rooms have special handling - name and persistence.
    //
    if (roomname === '' && settings.roommanager.default_room) {
        bUsingDefaultRoom = true;
        // Case where we always dump people into a particular room.
        roomname = settings.roommanager.default_room.toLowerCase();

//        console.log('DEBUG: Using default room starting with: ' + roomname);

        // Now - in the case of a default room, there is an option for persistence to be 'different'
        if (settings.roommanager.default_room_persist === true || settings.roommanager.default_room_persist === false) {
//            console.log('DEBUG: default room persistence override is: ' + settings.roommanager.default_room_persist);
            addRoomOptions = { persistent: settings.roommanager.default_room_persist === true ? 1 : 0 };
        }
    }

    // If client wants a random room generated, they will send the attribute with a "" value.
    if (roomname === '')
    {
        // Create a random room name and ensure it's not already in use.
        do
        {
            roomname = this.generateRandomRoomName();
//                this.log('Generated random room named: ' + roomname);
        }
        while (this.MucRoomObjects[roomname]);
    }
    else {
        // Check to see if we wind up in overflow
        newRoomname = this.FindOpenSpotInRoomOverflow(roomname);

        // If the room is full and no overflow is allowed, tell the client no room available.
        if (!newRoomname) {
            iqResult = new xmpp.Element('iq', {to: iq.attrs.from, type: 'error', id: iq.attrs.id})
                            .c('roomfull', {xmlns: 'urn:xmpp:callcast'});

            self.log('CreateRoomRequest: Requested room is full: ' + roomname);
            self.client.send(iqResult.root());
            return;
        }

        // Otherwise we're good. Assign it and let's roll...
        roomname = newRoomname;
    }

    this.log('Overseer.handleIq: Room Name of [' + roomname + '] requested by: ' + iq.attrs.from);

    //
    // No room by that name currently exists.
    //
    if (!this.MucRoomObjects[roomname])
    {
        //
        // Need to track rooms created, their status (including things like persistence)
        // and eventually database that information too.
        //
        this.AddTrackedRoom(roomname, addRoomOptions, function() {
                var iqResult = new xmpp.Element('iq', {to: iq.attrs.from, type: 'result', id: iq.attrs.id})
                                    .c('ok', {xmlns: 'urn:xmpp:callcast', name: roomname});
                self.client.send(iqResult.root());

                // Now set the max participants if settings allows it.
                // Notice that clients setting max participants can only happen when a room is CREATED.
                if (maxParticipantsRequested) {
                    if (settings.roommanager.allow_maxparticipants_from_client) {
                        self.log('Client requested max participants as: ' + maxParticipantsRequested);
                        self.MucRoomObjects[roomname].SetMaxRoomParticipants(maxParticipantsRequested);
                    }
                    else {
                        self.log('Client requested max participants but this feature is DISALLOWED currently.');
                    }
                }
            },

            function(msg) {
                var iqResult = new xmpp.Element('iq', {to: iq.attrs.from, type: 'error', id: iq.attrs.id})
                                .c('err', {xmlns: 'urn:xmpp:callcast'});

                self.log('CreateRoomRequest: ERROR: ' + msg);
                self.client.send(iqResult.root());
            }
        );

    }
    else        // Room already exists -- just let 'em know all is ok. And ensure that we're actually IN the room.
    {
        if (this.MucRoomObjects[roomname].pendingDeletion)
        {
            self.log('WARNING: Room requested:' + roomname + ' is currently pending deletion. Cannot fulfill request.');
            iqResult = new xmpp.Element('iq', {to: iq.attrs.from, type: 'error', id: iq.attrs.id})
                            .c('pendingdeletion', {xmlns: 'urn:xmpp:callcast'});
            self.client.send(iqResult.root());
        }
        else
        {
            iqResult = new xmpp.Element('iq', {to: iq.attrs.from, type: 'result', id: iq.attrs.id})
                            .c('ok', {xmlns: 'urn:xmpp:callcast', name: roomname});
            self.client.send(iqResult.root());

            if (this.MucRoomObjects[roomname].bSelfDestruct === true &&
               1 === size(this.MucRoomObjects[roomname].participants))
            {
                this.log('(D-Timer) - Pre-existing room requested - should have a participant soon in here...');

                if (this.MucRoomObjects[roomname].presenceTimer)
                {
                    this.log('OVERSEER: (D-Timer) presenceTimer was already set. Clearing first.');
                    clearTimeout(this.MucRoomObjects[roomname].presenceTimer);
                    this.MucRoomObjects[roomname].presenceTimer = null;
                }

                this.MucRoomObjects[roomname].presenceTimer = setTimeout(function() {
                    self.log('(D-Timer) - Pre-existing room - No one in room after 60 seconds :( ...');
                    eventManager.emit('destroyRoom', roomname);
                }, 60000);
            }

            // If we're not actually in the room, join it quickly before the client does so we can answer to requests.
            if (!this.MucRoomObjects[roomname].participants[this.OVERSEER_NICKNAME]) {
                this.log('WARN: Room Manager is *NOT* in the room requested. Joining room: ' + roomname);
                this.MucRoomObjects[roomname].join(roomname + this.CONF_SERVICE, this.OVERSEER_NICKNAME);
            }
        }
    }
};

Overseer.prototype.createErrorIQ = function(iq_in, reason_in, err_type_in) {
    var iq_out, e_type;

    e_type = err_type_in || 'modify';

    iq_out = new xmpp.Element('iq', {to: iq_in.root().attrs.from, type: 'error', id: iq_in.root().attrs.id})
                .c('error', {type: e_type})
                .c('bad-request', {xmlns: 'urn:ietf:params:xml:ns:xmpp-stanzas'})
                .up().c('reason', {xmlns: 'urn:ietf:params:xml:ns:xmpp-stanzas'}).t(reason_in);

    if (iq_in.root().attrs.xmlns) {
        iq_out.root().attrs.xmlns = iq_in.root().attrs.xmlns;
    }

    return iq_out;
};

//
// \brief Accepts a message which must have a room name, nickname which was in conflict, and
//          a list of old jids - any one of which may be a ghost in the room.
//          If we find the room and one of the ghost jids, kick that one out and respond favorably.
//          Otherwise, we respond with an error.
//
Overseer.prototype.SubstituteJidForNickname = function(iq) {
    // Need to pull out the 'info' object - which is the attributes to the 'removespot'
    var info = {},
        ojids, i, len, mroom, targetjid,
        bFound = false,
        self = this;

    if (iq.getChild('subjidfornickname')) {
        info = iq.getChild('subjidfornickname').attrs;
    }

    // Validate room and nickname are present/valid. And there are oldjids as well.
    if (!info.room || !this.MucRoomObjects[info.room]) {
        this.log('SubstituteJidForNickname: ERROR: Invalid room: ' + info.room);
        iq = this.createErrorIQ(iq, 'Missing or invalid required room attribute: ' + info.room);
        console.log('iq error going back is:', iq.root().toString());
    }
    else if (!info.nick || !this.MucRoomObjects[info.room].participants[info.nick]) {
        this.log('SubstituteJidForNickname: ERROR: No nickname given or nickname not found: ' + info.nick);
        iq = this.createErrorIQ(iq, 'Required nick attribute not found.');
        console.log('iq error going back is:', iq.root().toString());
    }
    else if (!info.oldjids) {
        this.log('SubstituteJidForNickname: ERROR: No oldjids given.');
        iq = this.createErrorIQ(iq, 'Required oldjids attribute not found.');
        console.log('iq error going back is:', iq.root().toString());
    }
    else {
        // Now we need to iterate through the list of oldjids...

        mroom = this.MucRoomObjects[info.room];
        targetjid = mroom.participants[info.nick].name.split('/')[0];

        this.log('Nickname found. Target JID is: ' + targetjid);
        this.log('SubstituteJidForNickname: INFO: Raw-oldjids: ' + info.oldjids);
        ojids = JSON.parse(info.oldjids);
        console.log('SubstituteJidForNickname: INFO: oldjids: ', ojids);

        len = ojids.length;
        for (i = 0; i < len; i += 1) {
            if (ojids[i].split('/')[0] === targetjid) {
                bFound = true;
                i = len;    // Skip the rest.
            }
        }

        if (!bFound) {
            // Never found a match of the nickname and the 'oldjids' list.
            this.log('SubstituteJidForNickname: ERROR: oldjids did not match. No substitution.');
            iq = this.createErrorIQ(iq, 'No substitution. Oldjids did not match.');
//            console.log('iq error going back is:', iq.root().toString());
        }
        else {
            this.log('SubstituteJidForNickname: Found match. Kicking out nick: ' + info.nick);

            // Kick out the nickname so the substitution can take place.
            mroom.kick(info.nick, function() {
                // Prep to reply to the IQ message.
                iq.attrs.to = iq.attrs.from;
                delete iq.attrs.from;

                // Now reply to the IQ message favorably.
                iq.attrs.type = 'result';

//                console.log('DEBUG: IQ to send back: ', iq.root().toString());
                self.log('SubstituteJidForNickname: Success. Substitution ready for completion by client.');
                // Send back the IQ result.
                this.client.send(iq.root());
            });

            return; // Cannot let this fall out below or we'll wind up sending the result too soon.
        }
    }

    // Send back the IQ result.
    this.client.send(iq.root());
};

Overseer.prototype.handleIq = function(iq) {
    var iqid, callback;

    if (!iq.attrs.from) {
        this.log('ERROR: ERRANT IQ: ' + iq);
        this.notifylog('ERROR: ERRANT IQ: ' + iq);
        return;
    }

    // Handle all pings and all queries for #info
    if (iq.attrs.type === 'result' && iq.attrs.id && this.iq_callbacks[iq.attrs.id])
    {
        iqid = iq.attrs.id;
        callback = this.iq_callbacks[iqid];

        // Need to be sure to not use values from 'iq' after the callback.
        // As the callback itself can modify iq and sometimes does.
        delete this.iq_callbacks[iqid];
        // We have a callback to make on this ID.
        callback.call(this, iq);
    }
    else if (iq.getChild('ping') ||
        (iq.getChild('query') && iq.getChildByAttr('xmlns', 'http://jabber.org/protocol/disco#info')))
    {
        iq.attrs.to = iq.attrs.from;
        delete iq.attrs.from;
        iq.attrs.type = 'result';

        if (iq.getChild('ping')) {
            iq.remove('ping');
        }
//          console.log("Sending pong/result: " + iq);
        this.client.send(iq);
    }
    else if (!iq.attrs.from.split('@')) {
        this.log('UNHANDLED IQ: ' + iq);
    }
    else if (iq.attrs.type === 'set' && iq.getChildByAttr('xmlns', 'urn:xmpp:callcast'))
    {
        // -- Handle room create request --
        if (iq.getChild('room')) {
            this.CreateRoomRequest(iq);
        }
        else if (iq.getChild('subjidfornickname')) {
            this.SubstituteJidForNickname(iq);
        }
    }
    // --------------------------------
};

function FeedbackBot(feedback_jid, feedback_pw, notifier) {
    // Login and then log any and all messages coming our way.
    // The clients should be sending:
    // Their jid, their room name, their nick
    // plus any message sent by the user.
    var d = new Date(),
        fname = feedback_jid.split('@')[0] + '_' + pad2(d.getMonth() + 1) + '_' + pad2(d.getDate()) + '_' + d.getFullYear() + '.txt',
        self = this,
        client;

    this.logfile = fs.createWriteStream(fname, {'flags': 'a'});
    // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
    this.notifier = notifier;
    this.jid = feedback_jid;

    client = new xmpp.Client({ jid: feedback_jid, password: feedback_pw, reconnect: true,
                                host: settings.SERVERNAME, port: settings.SERVERPORT });

    client.on('online',
        function() {
            client.send(new xmpp.Element('presence', { }).
                c('show').t('chat').up().
                c('status').t('Auto-Logging Feedback'));
        });
    client.on('stanza',
        function(in_stanza) {
            var stanza = in_stanza.clone(),
                nick, room, ts, line;
            if (stanza.is('message') &&
                // Important: never reply to errors!
                stanza.attrs.type !== 'error') {

                if (stanza.getChild('body'))
                {
                    nick = stanza.attrs.nick || 'no-nick';
                    room = stanza.attrs.room || 'no-room';

                    nick = decodeURI(nick);
                    room = decodeURI(room);

                    ts = logDate() + ' - ';
                    line = ts + 'From: ' + stanza.attrs.from +
                        ', aka: ' + nick +
                        ', Room: ' + room +
                        ', Body: ' + decodeURI(stanza.getChild('body').getText());

                    sys.puts(line);
                    self.logfile.write(line + '\n');
                    if (self.notifier) {
                        self.notifier.sendMessage('FB received @' + self.jid.split('@')[0] + ':' + line);
                    }
                }

                // Swap addresses...
                stanza.attrs.to = stanza.attrs.from;
                delete stanza.attrs.from;
                // and send back.
                client.send(stanza);
            }
//            else {
//                console.log('feedback-bot stanza-error: ', stanza.toString());
//            }
        });
    client.on('error',
        function(e) {
            sys.puts(e);
        });
}

function Notifier(serverinfo, jidlist) {
    var k,
        users,
        self = this;

    this.server = serverinfo.server || 'video.gocast.it';
    this.port = serverinfo.port || 5222;
    this.jid = serverinfo.jid;
    this.password = serverinfo.password;

    this.informlist = jidlist;
    this.isOnline = false;

    console.log(logDate() + ' - Notifier started:');
    users = '  Users to notify: ';

    for (k in this.informlist)
    {
        if (this.informlist.hasOwnProperty(k)) {
            if (users !== '  Users to notify: ') {
                users += ', ';
            }

            users += this.informlist[k];
        }
    }
    console.log(users);

    this.client = new xmpp.Client({ jid: this.jid, password: this.password, reconnect: true, host: this.server, port: this.port });

    this.client.on('online',
          function() {
//            console.log(logDate() + ' - Notifier online.');
            self.isOnline = true;
//          self.sendMessage("Notifier online.");
          });
    this.client.on('offline',
          function() {
            console.log(logDate() + ' - Notifier offline.');
            self.isOnline = false;
          });
    this.client.on('error', function(e) {
        sys.puts('NOTIFIER ERROR:');
        sys.puts(e);
    });

}

Notifier.prototype.sendMessage = function(msg) {
    var k, msg_stanza;

    if (this.client && this.isOnline)
    {
        for (k in this.informlist)
        {
            if (this.informlist.hasOwnProperty(k)) {
                msg_stanza = new xmpp.Element('message', {to: this.informlist[k], type: 'chat'})
                    .c('body').t(decodeURI(msg));
                this.client.send(msg_stanza);
            }
        }
    }
};

function testWhiteboardLocation() {
    var wbStorageLocation, stat;

    // If settings does not specify it, then we do need to 'punch a value' into it for others.
    if (!settings.roommanager.wbstoragelocation) {
        settings.roommanager.wbstoragelocation = __dirname;
    }

    wbStorageLocation = settings.roommanager.wbstoragelocation;

    if (wbStorageLocation.charAt(0) === '~') {
        wbStorageLocation = wbStorageLocation.replace('~', process.env.HOME);

        // Need to punch this back into settings for others to use without having to do the substitution.
        settings.roommanager.wbstoragelocation = wbStorageLocation;
    }

    try {
        stat = fs.statSync(wbStorageLocation);
        if (stat.isDirectory()) {
            // Will need to be a writable location, so let's do a quick test to ensure this.
            fs.writeFileSync(wbStorageLocation + '/.test.tmp', 'hello there');
            // If we get here, we're all good. Close and delete.
            fs.unlinkSync(wbStorageLocation + '/.test.tmp');
            console.log('INFO: whiteboardstorage location is valid: ' + wbStorageLocation);
        }
        else {
            console.log('ERROR: whiteboardstorage must be a valid directory location: ' + wbStorageLocation);
            process.exit(-3);
        }
    }
    catch(e) {
        console.log('ERROR: whiteboardstorage location must be a writable directory:' + wbStorageLocation);
        process.exit(-2);
    }

}

//
//
//  Main
//
//
var starting_arg, i, option,
    useRoommanager=false,
    user = settings.overseer.username,
    pw = settings.overseer.password;

if (process.argv.length > 2)
{
    starting_arg = 2;

    for (i in process.argv)
    {
        // Don't start processing args until we get beyond the .js itself.
        if (process.argv.hasOwnProperty(i) && i >= starting_arg) {
//            console.log('DEBUG: processing argv[' + i + '] which is: ' + process.argv[i]);

            if (process.argv[i].charAt(0) === '-') {
                // Allow for '-' or '--' easily...
                if (process.argv[i].charAt(1) === '-') {
                    option = process.argv[i].substring(2);
                }
                else {
                    option = process.argv[i].substring(1);
                }

                if ('roommanager' === option) {
                    console.log('OVERSEER: ROOM MANAGER MODE');
                    user = settings.roommanager.username;
                    pw = settings.roommanager.password;
                    useRoommanager = true;
                }

            }
        }
    }
}

testWhiteboardLocation();

/////////////////////////////
/////////////////////////////
// Deal with any default non-specified settings.
/////////////////////////////
/////////////////////////////

// If 'persist' is not specified for the room manager, then default to non-persistent
if (settings.roommanager.persist !== true && settings.roommanager.persist !== false) {
    console.log('DEBUG: no setting for settings.roommanager.persist - setting to false.');
    settings.roommanager.persist = false;
}

console.log('****************************************************');
console.log('****************************************************');
console.log('*                                                  *');
console.log('STARTED SERVERBOT @ ' + Date());
console.log('*                                                  *');
console.log('****************************************************');
console.log('****************************************************');

var notify = new Notifier({jid: settings.notifier.username, password: settings.notifier.password,
                            server: settings.SERVERNAME, port: settings.SERVERPORT},
                            settings.notifier.notify_list);

//
// Login as Overseer
//
overseer = new Overseer(user, pw, notify, useRoommanager);

//
// Let's dump our settings so it's clear what we're running.
//

var setmsg = '';
if (overseer && overseer.roommanager) {
    setmsg = 'Roommanager mode on.'; // - Current Settings: ';
}

//setmsg += JSON.stringify(settings);

console.log(setmsg);
// Send it to the notifier too but we're probably not logged in quite yet. So delay it. :-)
setTimeout(function() { notify.sendMessage(setmsg); }, 2000);

//
// The main serverBot/overseer should login as feedbackbot to receive feedback items. Not the room manager.
//
if (overseer && !overseer.roommanager) {
    //
    // Login as test feedback bot.
    //
    var fb_gocast = new FeedbackBot(settings.feedbackbot.username, settings.feedbackbot.password, notify);
}
