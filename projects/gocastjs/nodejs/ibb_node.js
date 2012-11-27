/*jslint node: true, white: true */
/*global Buffer, test, cd */

var sys = require('util');
var xmpp = require('node-xmpp');
var fs = require('fs');
var ltx = require('ltx');
var shelljs = require('shelljs/global');

var EventEmitter = require('events').EventEmitter;

'use strict';

var GoCastJS = require('./gcall_node');

GoCastJS.IBBTransfer = function(client, notifier) {
    var self = this;

    this.notifier = notifier;
    this.client = client;
    this.transfers = {};    // List of ongoing transfers
    this.history = [];      // Array of transfer history for logging/query purposes.

    setTimeout(function() {
        self.internalHistory('Starting IBB Agent @ ' + Date());
        self.notifier.sendMessage('Starting IBB Agent @ ' + Date());
    }, 2000);

};
sys.inherits(GoCastJS.IBBTransfer, EventEmitter);

GoCastJS.IBBTransfer.prototype.log = function(msg) {
    console.log(GoCastJS.logDate() + ' - IBBTransfer: ' + msg);
};

GoCastJS.IBBTransfer.prototype.chdir = function(newdir) {
    if (!test('-d', newdir)) {
        throw 'IBBTransfer::chdir - newdir not a directory: ' + newdir;
    }

    this.log('INFO: Received files shall be placed in: ' + newdir);
    cd(newdir);
};

//
// \brief Generate an error iq message from a good one.
//      It is assumed the incoming iq is unaltered so we use
//      the 'from' as the 'to' in the new iq.
//
GoCastJS.IBBTransfer.prototype.SendError = function(iq, type, subtype, reason) {
    var iqNew = new ltx.Element('iq', {to: iq.attrs.from, type: 'error', id: iq.attrs.id})
            .c('error', {type: type}).c(subtype, {xmlns: 'urn:ietf:params:xml:ns:xmpp-stanas'});

    if (reason) {
        iqNew.up().c('reason').t(reason);
    }

    if (iq.attrs.xmlns) {
        iqNew.root().attrs.xmlns = iq.attrs.xmlns;
    }

    this.internalHistory('ERROR: name: ' + this.GenName(iq) + ', ' + type + '/' + subtype + ', reason: ' + (reason || 'none'));
    this.client.send(iqNew.root());
    return;
};

GoCastJS.IBBTransfer.prototype.SendResult = function(iq) {
    this.client.send(new ltx.Element('iq', {to: iq.attrs.from, type: 'result', id: iq.attrs.id}).root());
//    console.log('SendResult: History: ' + this.DumpHistory());
};

GoCastJS.IBBTransfer.prototype.SendClose = function(iq, sid, error) {
    this.client.send(new ltx.Element('iq', {to: iq.attrs.from, type: 'set', id: 'closeid'})
            .c('close', {xmlns: 'http://jabber.org/protocol/ibb', sid: sid}).root());

    this.internalCloseTransfer(this.GenName(iq), error);
    delete this.transfers[this.GenName(iq)];
};

GoCastJS.IBBTransfer.prototype.ProcessIQ = function(iq) {
    var command, child;

    if (!iq || typeof(iq) !== 'object' || !iq.getChildByAttr('xmlns', 'http://jabber.org/protocol/ibb')) {
        console.log('ERROR: ProcessIQ: Bad iq: ', iq);
        return false;
    }

    // Process the various iq's in the IBB protocol.
    child = iq.getChildByAttr('xmlns', 'http://jabber.org/protocol/ibb');

    // First - if we get 'open', it's a new request.
    command = child.getName();
    switch(command) {
        case 'open':
            this.internalProcessOpen(iq);
            break;
        case 'data':
            this.internalProcessData(iq);
            break;
        case 'close':
            this.internalProcessClose(iq);
            break;
        default:
            console.log('ERROR: ProcessIQ: Bad command: ' + child);
            break;
    }
};

//
// \brief Generically, make the key-name from the sid.
//   But if we have 'room' and 'nick', then use room/nick/sid instead.
//   If an attribute 'fname' is presented, then use this as the filename directly.
//
GoCastJS.IBBTransfer.prototype.GenName = function(iq) {
    var child = iq.getChildByAttr('xmlns', 'http://jabber.org/protocol/ibb'),
        room, nick, sid, givenName;

    if (!child) {
        return 'ERROR';
    }

    room = child.attrs.room;
    nick = child.attrs.nick;
    sid = child.attrs.sid;

    givenName = child.attrs.fname;  // New feature

    if (room && nick) {
        return room + '_' + nick + '_' + sid;
    }
    else if (givenName) {
        return givenName;
    }
    else {
        return iq.attrs.from.split('@')[0] + '_' + sid;
    }
};

GoCastJS.IBBTransfer.prototype.DumpActiveTransfers = function() {
    var k, out = '', theTransfer;

    for (k in this.transfers)
    {
        if (this.transfers.hasOwnProperty(k)) {
            theTransfer = this.transfers[k];
            out += theTransfer.genname + ': Bytes-written: ' + theTransfer.bytesTransferred
                + ', blocks: ' + theTransfer.nextSeqExpected + ', Filename: ' + theTransfer.filename + '\n';
        }
    }

    if (out === '') {
        out = 'None.';
    }
    return out;
};

GoCastJS.IBBTransfer.prototype.DumpHistory = function() {
    var i, len, out = '';
    len = this.history.length;

    for (i = 0; i < len; i += 1)
    {
        out += this.history[i] + '\n';
    }

    if (out === '') {
        out = 'No history.';
    }
    return out;
};

GoCastJS.IBBTransfer.prototype.internalHistory = function(entry) {
    this.history.push(GoCastJS.logDate() + ' ' + entry);

    // Only keep a max number of entries in the history list.
    if (this.history.length > 100) {
        this.history.shift();
    }
};

GoCastJS.IBBTransfer.prototype.internalCloseTransfer = function(keyname, error) {
    var out = 'Closing: ' + keyname,
        theTransfer = this.transfers[keyname];

//    console.log('internalCloseTransfer: History: ' + this.DumpHistory());
    if (theTransfer) {
        out += ' Transferred ' + theTransfer.bytesTransferred + ' bytes.';
    }

    if (error) {
        this.internalHistory(out + ' ERROR: ' + error);
        if (this.notifier) {
            this.notifier.sendMessage('LogCatcher: ' + out + ' ERROR: ' + error);
        }
    }
    else {
        if (this.notifier) {
            this.notifier.sendMessage('LogCatcher: IBB - Successfully received log from room_nick_sid: ' + theTransfer.genname
                + ', bytes: ' + theTransfer.bytesTransferred
                + ', filename: ' + theTransfer.filename);
        }
        this.internalHistory(out + ' Success. ');
        console.log(out + ' Success. ');
        this.emit('received', theTransfer.filename);
    }

    // Now let's close it.
    if (theTransfer) {
        fs.closeSync(theTransfer.fsfile);
        delete this.transfers[keyname];
    }
};

GoCastJS.IBBTransfer.prototype.internalProcessClose = function(iq) {
    var child = iq.getChildByAttr('xmlns', 'http://jabber.org/protocol/ibb'),
        sid_inbound, genname, theTransfer;

//    console.log('internalProcessClose: History: ' + this.DumpHistory());
//    console.log('CLOSE: iq: ', iq);
//    console.log('CLOSE: child: ', child);

    sid_inbound = child.attrs.sid;
    genname = this.GenName(iq);
    theTransfer = this.transfers[genname];

    if (sid_inbound === null) {
        this.SendError(iq, 'cancel', 'bad-request', 'No sid given or no seq given.');
        return;
    }

    if (!theTransfer) {
        this.SendError(iq, 'cancel', 'item-not-found',
                        'A transfer of this sid name is not open/active: ' + sid_inbound);
        this.SendClose(iq, sid_inbound, ' Close: Cannot find sid: ' + sid_inbound);
        return;
    }

    this.internalCloseTransfer(genname);
    this.SendResult(iq);
};

GoCastJS.IBBTransfer.prototype.internalProcessData = function(iq) {
    var child = iq.getChildByAttr('xmlns', 'http://jabber.org/protocol/ibb'),
        size_inbound, seq_inbound, sid_inbound, genname, theTransfer, dataBlock,
        self = this, msg;

//    console.log('DATA: iq: ', iq);
//    console.log('DATA: child: ', child);

    seq_inbound = parseInt(child.attrs.seq, 10);
    sid_inbound = child.attrs.sid;
    genname = this.GenName(iq);
    theTransfer = this.transfers[genname];

    if (sid_inbound === null || seq_inbound === null) {
        this.SendError(iq, 'cancel', 'bad-request', 'No sid given or no seq given.');
        if (sid_inbound) {
            this.SendClose(iq, sid_inbound, 'Data: No sid given.');
        }
        return;
    }

    if (!theTransfer) {
        console.log('Dump of transfers: ', this.transfers);

        this.SendError(iq, 'cancel', 'item-not-found',
                        'A transfer of this sid name is not open/active: ' + sid_inbound);
        this.SendClose(iq, sid_inbound, 'Data: active sid not found: ' + sid_inbound);
        return;
    }

    // Now we need to check to ensure the current sequence number is next in line.
    if (theTransfer.nextSeqExpected !== seq_inbound) {
        console.log('Dump of transfers: ', this.transfers);

        msg = 'Data: out of order seq. Got ' + seq_inbound + ', expected ' + theTransfer.nextSeqExpected;
        this.SendError(iq, 'cancel', 'not-acceptable', msg);
        this.SendClose(iq, sid_inbound, msg);
        return;
    }

    theTransfer.nextSeqExpected += 1;

    // Process the data block.
    // Make a buffer of base64 and return binary from it. Then pass that into a binary buffer.
    // That final binary buffer gets passed into .write()
    dataBlock = new Buffer(new Buffer(child.getText(), 'base64').toString('binary'), 'binary');
    console.log('DATA: INFO: Received: ', dataBlock);

// Synchronous method.
//    console.log('Wrote ' + fs.writeSync(theTransfer.fsfile, dataBlock, 0, dataBlock.length, null) + ' bytes.');
//    this.SendResults(iq);

    fs.write(theTransfer.fsfile, dataBlock, 0, dataBlock.length, null, function(err, written) {
        if (err) {
            console.log('DATA: ERROR: ', err);
            self.SendClose(iq, sid_inbound, 'Data: Error writing to file: ' + theTransfer.filename);
        }
        else {
//            console.log('DATA: SID: ' + sid_inbound + ' # bytes written: ' + written);
            theTransfer.bytesTransferred += written;
            self.SendResult(iq);
        }
    });

};

GoCastJS.IBBTransfer.prototype.internalProcessOpen = function(iq) {
    var child = iq.getChildByAttr('xmlns', 'http://jabber.org/protocol/ibb'),
        genname, theTransfer;

    genname = this.GenName(iq);

    // Ensure we have a valid looking 'open'
    if (!child.attrs.stanza || child.attrs.stanza !== 'iq') {
        this.SendError(iq, 'cancel', 'not-acceptable', 'Only iq stanza supported.');
        return;
    }

    if (!child.attrs.sid || !child.attrs['block-size']) {
        this.SendError(iq, 'cancel', 'bad-request', 'No sid given or no block-size given.');
        return;
    }

    // Now - do we (by chance) already have this one running...
    if (this.transfers[genname]) {
        this.SendError(iq, 'cancel', 'not-acceptable',
                        'A transfer with a sid of this name is already in progress: ' + child.attrs.sid);
        return;
    }

    // Now we're ready to track this transfer and send a positive response.
    this.transfers[genname] = {blocksize: child.attrs['block-size'],
                                                    from: iq.attrs.from,
                                                    sid: child.attrs.sid,
                                                    genname: genname,
                                                    nextSeqExpected: 0,
                                                    bytesTransferred: 0};

    theTransfer = this.transfers[genname];

    // Now open a file for this transfer.
    theTransfer.filename = genname.replace(/@/g, '_at_') + '_' + GoCastJS.fileDate();
    theTransfer.fsfile = fs.openSync(theTransfer.filename, 'w');

    if (!theTransfer.fsfile) {
        console.log('ERROR: OPEN: Cannot open file: ' + theTransfer.filename);
        this.SendClose(iq, child.attrs.sid, 'Open: Cannot open file: ' + theTransfer.filename);
        return;
    }

    this.SendResult(iq);
    console.log('OPEN: Starting for sid: ' + child.attrs.sid);
    this.internalHistory('Open: New transfer: name: ' + theTransfer.genname + ', filename: ' + theTransfer.filename);
};

module.exports = GoCastJS;
