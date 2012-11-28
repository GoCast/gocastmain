/*jslint sloppy: false, todo: true, browser: true, devel: true, white: true */
'use strict';

var GoCastJS = GoCastJS || {};

//
//
//
// l o g D a t e - Support for date/time-stamp logging.
//
//
//

GoCastJS.pad = function(num, size) {
    var s = '000000000' + num;
    return s.substr(s.length - size);
};

GoCastJS.pad2 = function(num) { return GoCastJS.pad(num, 2); };

//
// Return Date/Time as mm-dd-yyyy hh:mm::ss
//
GoCastJS.logDate = function() {
    var d = new Date();

    return GoCastJS.pad2(d.getMonth() + 1) + '-' + GoCastJS.pad2(d.getDate()) + '-' + d.getFullYear() + ' ' +
            GoCastJS.pad2(d.getHours()) + ':' + GoCastJS.pad2(d.getMinutes()) + ':' + GoCastJS.pad2(d.getSeconds());
};

GoCastJS.fileDate = function() {
    var d = new Date();

    return GoCastJS.pad2(d.getMonth() + 1) + '-' + GoCastJS.pad2(d.getDate()) + '-' + d.getFullYear() + '_' +
            GoCastJS.pad2(d.getHours()) + GoCastJS.pad2(d.getMinutes()) + GoCastJS.pad2(d.getSeconds());
};

//
// \brief - Requires a Strophe connection which is active. Optionally uses a room/nick combination
//      as well. cbDataGet is a callback function which iteratively returns a Buffer which will be converted
//      to 'base64' and sent. cbDataGet is function cbDataGet(maxBytes).
//      The transfer will be considered complete when cbDataGet() returns null or '' signalling no more data.
//
//      If non-null, cbLog will be called for all log messages.
//
//      Upon a successful transfer, cbSuccess is called with a message about the transfer.
//      On failure of any kind a cbFailure(message) is called.
//
GoCastJS.IBBTransferClient = function(options, cbSuccess, cbFailure) {
    this.RECEIVER = options.receiver;
    this.BLOCKSIZE = 5500;
    this.connection = options.connection;
    this.cbDataGet = options.cbDataGet;
    this.cbLog = options.cbLog;
    this.room = options.room;

    // For failure logs - send nickname to server.
    this.nick = options.nick;
    // In the case of sending a regular file, this option is used instead of 'nick'
    this.filename = options.filename;

    this.cbSuccess = cbSuccess;
    this.cbFailure = cbFailure;

    this.sid = this.connection.getUniqueId();
    this.XMLNS = 'http://jabber.org/protocol/ibb';
    this.bytesSent = 0;
    this.seq = 0;

    var self = this, msg, attrs;

    this.log('Opening up an IBB transfer request.');

    // Open up the connection
    if (this.nick) {
        // Let the server create the file name from room, nick, and sid.
        console.log('IBB: Sending log with room, nick, sid.');
        attrs = {xmlns: this.XMLNS, room: this.room, nick: this.nick,
                        sid: this.sid, 'block-size': this.BLOCKSIZE, stanza: 'iq'};
    }
    else {
        // Use fname attribute to designate the file name on the server side.
        console.log('IBB: Sending a file with fname and room.');
        attrs = {xmlns: this.XMLNS, room: this.room, fname: this.filename,
                        sid: this.sid, 'block-size': this.BLOCKSIZE, stanza: 'iq'};
    }

    this.connection.sendIQ($iq({to: this.RECEIVER, type: 'set'})
                    .c('open', attrs),
    // Successful callback...
    function(iq) {
        // Start sending data in blocks.
        self.SendData.apply(self);
    },
    // Failure callback
    function(iq) {
        msg = 'Error requesting IBB transfer with ' + self.RECEIVER;

        if (iq) {
          msg += ' ' + iq.tree();
        }
        self.log(msg);
        self.cbFailure(msg);
    }, 3000);
};

GoCastJS.IBBTransferClient.prototype.log = function(msg) {
    if (this.cbLog) {
        this.cbLog.apply(this, arguments);
    }
};

GoCastJS.IBBTransferClient.prototype.SendClose = function() {
    var self = this, msg, attrs;

    if (this.nick) {
        attrs = {xmlns: this.XMLNS, room: this.room, nick: this.nick, sid: this.sid};
    }
    else {
        attrs = {xmlns: this.XMLNS, room: this.room, fname: this.filename, sid: this.sid};
    }

    this.connection.sendIQ($iq({to: this.RECEIVER, type: 'set'})
                    .c('close', attrs),
    // Successful callback...
    function(iq) {
        // We're complete-complete.
        self.cbSuccess('Completed transfer of ' + self.bytesSent + ' bytes to ' + self.RECEIVER);
    },
    // Failure callback
    function(iq) {
        msg = 'Error closing IBB transfer with ' + self.RECEIVER;

        if (iq) {
          msg += ' ' + iq.tree();
        }
        self.log(msg);
        self.cbFailure(msg);
    }, 3000);
};

GoCastJS.IBBTransferClient.prototype.SendData = function() {
    var data, encodedData,
        self = this,
        msg, iqData, attrs;

    // Must ask for less data than we said would be our max due to base64 encoding
    // being a 3bytes-in gets 4bytes-out formula.
    data = this.cbDataGet(Math.floor((this.BLOCKSIZE * 3) / 4));  // Raw data in string form.
    if (!data || data === '') {
        this.log('No more data. Sending close message.');
        this.SendClose();
        return;
    }

//    this.log('IBB.SendData: Asked for: ' + Math.floor((this.BLOCKSIZE * 3) / 4) ' bytes. Got ' + data.length + ' bytes to send.');

    encodedData = $.base64.encode(data);
//    this.log('IBB.SendData: encoded length: ' + encodedData.length);

    if (this.nick) {
        attrs = {xmlns: this.XMLNS, room: this.room, nick: this.nick, sid: this.sid, seq: this.seq };
    }
    else {
        attrs = {xmlns: this.XMLNS, room: this.room, fname: this.filename, sid: this.sid, seq: this.seq};
    }

    iqData = $iq({to: this.RECEIVER, type: 'set'})
                    .c('data', attrs).t(encodedData);
//    this.log('IBB.SendData: iq length is: ' + iqData.length + ' iqData is: ' + iqData.toString());

    // Keep sending data blocks until we get a failure or until we're out of data.
    this.connection.sendIQ(iqData,
    // Successful callback...
    function(iq) {
        // Sent one. Update and prep for another.
        self.seq += 1;
        self.bytesSent += data.length;
        self.SendData();
    },
    // Failure callback
    function(iq) {
        msg = 'Error sending data packet in IBB transfer with ' + self.RECEIVER;

        if (iq) {
          msg += ' ' + iq.tree();
        }
        self.log(msg);
        self.cbFailure(msg);
    }, 3000);

};
