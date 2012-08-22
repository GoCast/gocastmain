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

/*jslint node: true */
var sys = require('util');
var xmpp = require('node-xmpp');
var fs = require('fs');
var ltx = require('ltx');
var evt = require('events');
var ddb = require('dynamodb').ddb({ endpoint: 'dynamodb.us-west-1.amazonaws.com',
                                accessKeyId: 'AKIAJWJEBZBGT6TPH32A',
                                secretAccessKey: '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' });

var eventManager = new evt.EventEmitter();
var argv = process.argv;

'use strict';

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
    this.ACTIVEROOMS = 'room_active_list';
    this.ROOMCONTENTS = 'room_contents';
    this.notifier = notifier;
}

RoomDatabase.prototype.log = function(msg) {
    console.log(logDate() + ' - roomDB: ', msg);
};

RoomDatabase.prototype.notifylog = function(msg) {
    if (this.notifier) {
        this.notifier.sendMessage(logDate() + ' RoomDatabase: ' + msg);
    }
    else {
        console.log(logDate() + ' - NULL-NOTIFIER-MESSAGE: RoomDatabase: ' + msg);
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
                self.roomList[res.items[i].roomname] = res.items[i];
                // Roomname in the object is redundant. Remove it.
                delete self.roomList[res.items[i].roomname].roomname;
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

    this.log('Adding room: ' + (roomname || obj.roomname));

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

    // Make sure all contents for this room are removed automatically as well.
    self.RemoveAllContentsFromRoom(roomname, function() {
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
        spotnumber = '' + spotnumber;
    }

    if (typeof roomname !== 'string' || typeof spotnumber !== 'string') {
        this.log('AddContentToRoom: ERROR: roomname and spotnumber given must be strings.');
        return false;
    }

    putobj.roomname = roomname;
    putobj.spotnumber = spotnumber;

    this.log('Adding content to room: ' + roomname + ' in spotnumber: ' + spotnumber);
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

            // If there were no results from the query, then we're all good here. No entries.
            if (!len) {
                console.log('LoadContentsFromDBForRoom: No Room contents to load in ' + roomname + '. SUCCESS.');
                cbSuccess();
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
                    ddb.query(self.ROOMCONTENTS, roomname, options, QueryCB);
                }, batchDelay);
            }
            else {
                console.log('LoadContentsFromDBForRoom: SUCCESS. Loaded ' + buildup.length + ' spots for room: ' + roomname);
//                console.log('LoadContentsFromDBForRoom: Calling back with: ', buildup);

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

    ddb.query(this.ROOMCONTENTS, roomname, options, QueryCB);
};

RoomDatabase.prototype.RemoveContentFromRoom = function(roomname, spotnumber, cbSuccess, cbFailure) {
    var self = this;

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
            if (!len) {
                console.log('RemoveAllContentsFromRoom: No Room contents to delete. SUCCESS.');
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

    this.log('Removing ALL contents from room: ' + roomname);

    options = { limit: maxPerBatch, attributesToGet: ['roomname', 'spotnumber'] };

    ddb.query(this.ROOMCONTENTS, roomname, options, QueryCB);

};

//
//
// M U C R O O M
//
//

function MucRoom(client, notifier, bSelfDestruct, success, failure) {
    // -- Handle room create request --
    this.bNewRoom = false;
    this.bSelfDestruct = bSelfDestruct || false;
    this.successCallback = success || null;
    this.failureCallback = failure || null;
    this.presenceTimer = null;
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

    this.spotList = {};
    this.spotStorage = {};

    var self = this;

    // Max # users.
    this.options['muc#roomconfig_maxusers'] = '11';

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
        if (stanza.attrs.from && stanza.attrs.from.split('/')[0] !== self.roomname) {
            return;
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

MucRoom.prototype.reset = function() {
    this.bNewRoom = false;
    this.successCallback = null;
    this.failureCallback = null;
    if (this.presenceTimer)
    {
        clearTimeout(this.presenceTimer);
        this.presenceTimer = null;
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

    this.spotList = {};
    this.spotStorage = {};

    this.client.removeListener('stanza', this.onstanza);
};

MucRoom.prototype.finishInit = function(success, failure) {
    this.successCallback = success;
    this.failureCallback = failure;
    this.client.on('stanza', this.onstanza);
};

MucRoom.prototype.notifylog = function(msg) {
    if (this.notifier) {
        this.notifier.sendMessage(logDate() + ' @' + this.roomname.split('@')[0] + ': ' + msg);
    }
    else {
        console.log(logDate() + ' - NULL-NOTIFIER-MESSAGE: @' + this.roomname.split('@')[0] + ': ' + msg);
    }
};

MucRoom.prototype.log = function(msg) {
    console.log(logDate() + ' - @' + this.roomname.split('@')[0] + ': ' + msg);
};

MucRoom.prototype.getRoomConfiguration = function(cb) {
    var self = this,
        getRoomConf;

    // Request room configuration form.
    getRoomConf = new xmpp.Element('iq', {to: this.roomname, type: 'get'})
        .c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'});

    this.log('Requesting room configuration... ');
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
            self.kick(self.nick, function() {
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
        if (!this.participants[fromnick] && fromnick !== this.nick) {
            this.log('Adding: ' + fromjid + ' as Nickname: ' + fromnick);
            this.SendSpotListTo(pres.attrs.from);
        }
        else {
            this.log('Updated Presence: ' + fromjid + ' as Nickname: ' + fromnick);
        }

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
                this.log('OVERSEER: Room destroyed... not trying to rejoin');
            } else {
                this.log('We got kicked out...room destroyed? Or we got disconnected??');
                this.joined = false;
                for (k in this.participants)
                {
                    if (this.participants.hasOwnProperty(k)) {
                        delete this.participants[k];
                    }
                }

                // Need to make sure that the self-destruct timer is cleared if it's ticking...
                if (this.presenceTimer)
                {
                    this.log('OVERSEER: presenceTimer being cleared prior to re-join.');
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
            if (this.bSelfDestruct === true)
            {
                if (1 === size(this.participants) && this.participants[this.nick]) {
                    this.log('OVERSEER: (A-timer) Everybody else has left room [' + this.roomname.split('@')[0] + ']... wait 60 sec...');

                    if (this.presenceTimer)
                    {
                        this.log('OVERSEER: (A-timer) presenceTimer was already set. Clearing first.');
                        clearTimeout(this.presenceTimer);
                        this.presenceTimer = null;
                    }

                    this.presenceTimer = setTimeout(function() {
                        self.log('OVERSEER: (A-timer) No one in room [' + self.roomname.split('@')[0] + '] after 60 seconds :( ...');
                        eventManager.emit('destroyroom', self.roomname.split('@')[0]);
                    }, 60000);
                }
            }
        }

    }

    // If the 'from' is myself -- then I'm here. And so we're joined...
    if (fromnick === this.nick)
    {
        if (!this.joined)
        {
            this.joined = true;

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
                        this.log('OVERSEER: (B-timer) Clearing presenceTimer which was already set. New room entered.');
                        clearTimeout(this.presenceTimer);
                        this.presenceTimer = null;
                    }

                    if (0 === size(this.participants))
                    {
                        this.log('OVERSEER: (B-timer) Just joined room [' + this.roomname.split('@')[0] + '] - waiting for others...');

                        this.presenceTimer = setTimeout(function() {
                            self.log('OVERSEER: (B-timer) New room [' + self.roomname.split('@')[0] + '] entered - no entrants...No joined new room after 30 seconds :( ...');
                            eventManager.emit('destroyroom', self.roomname.split('@')[0]);
                        }, 30000);
                    }
                    else {
                        this.log('OVERSEER: (B-timer) - Someone already in the room. All good. Moving forward.');
                    }
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
                    self.log('Got room configuration. Going for setup.');
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
        if (this.participants.hasOwnProperty(k)) {
            // Add in a ',' if we're not first in line.
            if (parts !== '') {
                parts += ', ';
            }

            parts += k.replace(/\\20/g, ' ');
            if (this.participants[k].video === 'on') {
                parts += '(Video)';
            }
            else if (this.participants[k].video === 'off') {
                parts += '(No-Video)';
            }
        }
    }

    this.log('Participants list: ' + parts);
    this.notifylog('Participants: ' + parts);
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

    this.log('SendSpotListTo: sending full spot catch-up to: ' + to);

    for (k in this.spotList)
    {
        if (this.spotList.hasOwnProperty(k)) {

            // Copy the object for this spot as a starting point.
            attribs_out = this.spotList[k];

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

    if (msgToSend) {
        this.log('SendSpotListTo: msgToSend:' + msgToSend.root().toString());
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

        this.log('Outbound Group Command: ' + msgToSend.root().toString());

        this.client.send(msgToSend);
};

MucRoom.prototype.SendPrivateCmd = function(to, cmd, attribs_in) {
        var attribs_out = attribs_in,
            msgToSend;

        attribs_out.cmdtype = cmd;
        attribs_out.xmlns = 'urn:xmpp:callcast';

        msgToSend = new xmpp.Element('message', {'to': to, type: 'chat', xmlns: 'urn:xmpp:callcast'})
                .c('cmd', attribs_out);

        this.log('Outbound Private Command: ' + msgToSend.root().toString());

        this.client.send(msgToSend);
};

MucRoom.prototype.SendGroupChat = function(msg) {
        var msgToSend;

        msgToSend = new xmpp.Element('message', {to: this.roomname, type: 'groupchat'})
                .c('body').t(msg);

        this.log('Outbound Group Chat: ' + msgToSend.root().toString());

        this.client.send(msgToSend);
};

MucRoom.prototype.SendPrivateChat = function(to, msg) {
        var msgToSend;

        msgToSend = new xmpp.Element('message', {'to': to, type: 'chat'})
                .c('body').t(msg);

        this.log('Outbound Private Chat to ' + to + ': ' + msgToSend.root().toString());

        this.client.send(msgToSend);
};

MucRoom.prototype.AddSpotReflection = function(iq) {
    // Need to pull out the 'info' object - which is the attributes to the 'addspot'
    var info = {}, self = this;
    if (iq.getChild('addspot')) {
        info = iq.getChild('addspot').attrs;
    }

    // Be sure to give a spot number to everyone that's consistent.
    info.spotnumber = this.addSpotCeiling;
    this.addSpotCeiling += 1;

    this.SendGroupCmd('addspot', info);

    // Now reply to the IQ message favorably.
    iq.attrs.to = iq.attrs.from;
    delete iq.attrs.from;
    iq.attrs.type = 'result';

    this.client.send(iq);

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

MucRoom.prototype.RemoveSpotReflection = function(iq) {
    // Need to pull out the 'info' object - which is the attributes to the 'removespot'
    var info = {}, self = this;

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
        this.SendGroupCmd('removespot', info);

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
                self.log('Room setup successful.');

                if (self.successCallback) {
                    self.successCallback();
                    self.successCallback = null;
                    self.failureCallback = null;
                }

                self.bNewRoom = false;

                if (self.bSelfDestruct === true)
                {
                    self.log('OVERSEER: (C-timer) Room setup - no one else in room [' + self.roomname.split('@')[0] + '] yet. Should be soon. Waiting...');

                    if (self.presenceTimer)
                    {
                        self.log('OVERSEER: ERROR: (C-timer) After init of room, presenceTimer should not already be set. Clearing.');
                        clearTimeout(self.presenceTimer);
                        self.presenceTimer = null;
                    }

                    self.presenceTimer = setTimeout(function() {
                        self.log('OVERSEER: (C-timer) After Init-Room [' + self.roomname.split('@')[0] + '] - No one in room after 30 seconds :( ...');
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
        el;

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

    this.log('Joining: ' + rmname + ' as ' + nick + '. '); // + el.tree());
    this.client.send(el);
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
            this.objPool.push(new MucRoom(this.client, this.notifier, true));
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



function Overseer(user, pw, notifier) {
    var roomsxml, par, rooms,
        starting_arg, i, k,
        option,
        self = this;

    this.CONF_SERVICE = '@gocastconference.video.gocast.it';
    this.SERVER = 'video.gocast.it';
    this.static_roomnames = {};
    this.MucRoomObjects = {};
    this.notifier = notifier;
    this.iqnum = 0;
    this.iq_callbacks = {};
    this.roommanager = false;
    this.roomDB = null;

    this.active_rooms = {};

    if (process.argv.length > 2)
    {
        starting_arg = 2;

        for (i in process.argv)
        {
            // Don't start processing args until we get beyond the .js itself.
            if (process.argv.hasOwnProperty(i) && i >= starting_arg) {

                if (process.argv[i].charAt(0) === '-') {
                    option = process.argv[i].substring(1);

                    if ('roommanager' === option) {
                        this.log('OVERSEER: ROOM MANAGER MODE');
                        user = user + '/' + option;
                        this.log('OVERSEER: JID = ' + user);

                        this.roommanager = true;

                        this.roomDB = new RoomDatabase(notifier);
                    }

                    if ('roommanagertest' === option) {
                        this.log('OVERSEER: ROOM MANAGER MODE');
                        user = user + '/' + option;
                        this.log('OVERSEER: JID = ' + user);

                        this.roommanager = true;

                        this.roomDB = new RoomDatabase(notifier);
                    }
                }
                else {
                    this.log('Reading XML File: ' + process.argv[i]);

                    roomsxml = loadRooms(process.argv[i]); // '/var/www/etzchayim/xml/schedules.xml');
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
        }
    }
    else
    {
        this.static_roomnames.offlinetest = true;
    //  this.static_roomnames.lobby = true;
    //  this.static_roomnames.newroom = true;
    //  this.static_roomnames.other_newroom = true;
    }

    this.client = new xmpp.Client({ jid: user, password: pw, reconnect: true, host: this.SERVER, port: 5222 });

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
                self.MucRoomObjects[k] = new MucRoom(self.client, self.notifier, false);
                self.MucRoomObjects[k].finishInit();

                self.MucRoomObjects[k].join(k + self.CONF_SERVICE, 'overseer');
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
        if (e.getChild('conflict'))
        {
            self.log('Username Conflict. Likely two roommanager logins simultaneously.');
            self.log("Use 'ps ax | grep node' to determine if this is the case.");
            self.log('Exiting node now. Return code = 1.');
            process.exit(1);
        }
        else
        {
            sys.puts(e);
            self.notifylog('OVERSEER: ERROR-EMIT-RECEIVED: ' + e);
        }
    });

    // Overseer events
    eventManager.on('destroyroom', function(roomname, force) {
        if (!force)     // Sanity check no one is present unless 'force' is true.
        {
            var mroom = self.MucRoomObjects[roomname],
                parts, k;

            // Check to see that we have a room by that name and see if anyone is in it.
            if (mroom && size(mroom.participants) > 1 && mroom.participants[mroom.nick]) {
                self.notifylog('OVERSEER: Being requested to delete room [' + roomname + "] -- but it's not empty. Skipping deletion.");
                console.log('OVERSEER: Being requested to delete room [' + roomname + "] -- but it's not empty. Skipping deletion.");
                parts = '';

                for (k in mroom.participants)
                {
                    if (mroom.participants.hasOwnProperty(k)) {
                        // Add in a ',' if we're not first in line.
                        if (parts !== '') {
                            parts += ', ';
                        }

                        parts += k.replace(/\\20/g, ' ');
                    }
                }

                self.notifylog('OVERSEER: Would have abandoned the following participants: ' + parts);
                console.log('OVERSEER: Would have abandoned the following participants: ' + parts);
                return;
            }
        }

        console.log('OVERSEER: Deleting room [' + roomname + ']');
        self.destroyRoom(roomname);
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
                self.AddTrackedRoom(k, rooms_in[k], function() {
                    self.log('Added from DB: ' + k);
                }, function(msg) {
                    self.log('LoadRooms: ERROR: Failed ' + k + ' with msg: ' + msg);
                }, true);

                // Now load/add the contents of said room.
                if (self.roomDB) {
                    self.roomDB.LoadContentsFromDBForRoom(k, function(contents) {
                        var temproomname, tempspotnumber;

                        if (contents) {
                            len = contents.length;

                            // Iterate through contents and add them to the memory DB.
                            for (i = 0; i < len; i += 1)
                            {
                                temproomname = contents[i].roomname;
                                tempspotnumber = contents[i].spotnumber;

                                if (!self.MucRoomObjects[temproomname]) {
                                    self.log('ERROR: MucRoomObject for room: ' + temproomname + ' is missing.');
                                }
                                else {
                                    self.MucRoomObjects[temproomname].spotList[tempspotnumber] = contents[i];
                                    delete self.MucRoomObjects[temproomname].spotList[tempspotnumber].roomname;
                                }
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
        this.notifier.sendMessage(logDate() + ' - Overseer: ' + msg);
    }
    else {
        console.log(logDate() + ' - Overseer: NULL-NOTIFIER-MESSAGE: ' + msg);
    }
};

Overseer.prototype.log = function(msg) {
    console.log(logDate() + ' - Overseer: ' + msg);
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

//
// \brief Need to check the room's banned-list for this person.
//
Overseer.prototype.handleMessage = function(msg) {
    var cmd, k, temp,
        fromjid, fromnick, toroom, plea;
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
        cmd = msg.getChild('body').getText().split(';');
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
        this.log('WARNING: Room already present: ' + roomname);
        cbSuccess('WARNING: Room already present: ' + roomname);
        return true;
    }

    if (obj) {
 //       this.log('Adding room ' + roomname + ' with object: ', obj);
        this.active_rooms[roomname] = obj;
        delete this.active_rooms[roomname].roomname;
    }
    else {
        this.active_rooms[roomname] = { persistent: 0 };
    }

    this.MucRoomObjects[roomname] = MucroomObjectPool.get();
    if (this.active_rooms[roomname].persistent) {
        this.MucRoomObjects[roomname].bSelfDestruct = false;
    }

    console.log('Overseer: Adding room ' + roomname + '. New Roomlist=', this.active_rooms);

    if (this.roomDB && !bSkipDBPortion) {
        this.roomDB.AddRoom(roomname, this.active_rooms[roomname], function() {
            self.MucRoomObjects[roomname].finishInit(function() {
//                self.log('AddTrackedRoom: finishInit successful for: ' + roomname);
                cbSuccess();
            }, function() {
                cbFailure('AddTrackedRoom: ERROR: finishInit failed for: ' + roomname);
            });

            self.MucRoomObjects[roomname].join(roomname + self.CONF_SERVICE, 'overseer');
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

        this.MucRoomObjects[roomname].join(roomname + self.CONF_SERVICE, 'overseer');
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
    self.MucRoomObjects[roomname].pendingDeletion = false;
    MucroomObjectPool.put(self.MucRoomObjects[roomname]);
    delete self.MucRoomObjects[roomname];

    return true;
};

Overseer.prototype.CreateRoomRequest = function(iq) {
    var roomname = iq.getChild('room').attr('name'),
        self = this,
        iqResult;

    // If client wants a random room generated, they will send the attribute with a "" value.
    if (roomname === '')
    {
        do
        {
            roomname = this.generateRandomRoomName();
            this.log('Generated random room named: ' + roomname);
        }
        while (this.MucRoomObjects[roomname]);
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
        this.AddTrackedRoom(roomname, null, function() {
            var iqResult = new xmpp.Element('iq', {to: iq.attrs.from, type: 'result', id: iq.attrs.id})
                                .c('ok', {xmlns: 'urn:xmpp:callcast', name: roomname});
            self.client.send(iqResult.root());
            },

            function(msg) {
                var iqResult = new xmpp.Element('iq', {to: iq.attrs.from, type: 'error', id: iq.attrs.id})
                                .c('err', {xmlns: 'urn:xmpp:callcast'});

                self.log('CreateRoomRequest: ERROR: ' + msg);
                self.client.send(iqResult.root());
            }
        );

    }
    else        // Room already exists -- just let 'em know all is ok.
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
                            .c('ok', {xmlns: 'urn:xmpp:callcast'});
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
        }
    }
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

    client = new xmpp.Client({ jid: feedback_jid, password: feedback_pw, reconnect: true, host: 'video.gocast.it', port: 5222 });

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

                    ts = logDate() + ' - ';
                    line = ts + 'From: ' + stanza.attrs.from +
                        ', aka: ' + nick +
                        ', Room: ' + room +
                        ', Body: ' + stanza.getChild('body').getText();

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
            console.log(logDate() + ' - Notifier online.');
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
                    .c('body').t(msg);
                this.client.send(msg_stanza);
            }
        }
    }
};

//
//
//  Main
//
//

console.log('****************************************************');
console.log('****************************************************');
console.log('*                                                  *');
console.log('STARTED SERVERBOT @ ' + Date());
console.log('*                                                  *');
console.log('****************************************************');
console.log('****************************************************');

var notify = new Notifier({jid: 'overseer@video.gocast.it', password: 'the.overseer.rocks',
                            server: 'video.gocast.it', port: 5222},
            ['rwolff@video.gocast.it', 'jim@video.gocast.it']); // , "bob.wolff68@jabber.org" ]);

//
// Login as Overseer
//
var overseer = new Overseer('overseer@video.gocast.it', 'the.overseer.rocks', notify);

//
// The main serverBot/overseer should login as feedbackbot to receive feedback items. Not the room manager.
//
if (!overseer.roommanager) {
    //
    // Login as test feedback bot.
    //
    //var fb = new FeedbackBot("feedback_bot_test1@video.gocast.it", "test1", notify);
    var fb_etzchayim = new FeedbackBot('feedback_bot_etzchayim@video.gocast.it', 'feedback.gocast.etzchayim', notify);
    //var fb_fuse = new FeedbackBot('feedback_bot_fuse@video.gocast.it', 'feedback.gocast.fuse', notify);
    var fb_friends = new FeedbackBot('feedback_bot_friends@video.gocast.it', 'feedback.gocast.friends', notify);
}
