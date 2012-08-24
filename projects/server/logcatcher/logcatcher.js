/**
 * Log Catcher Bot - Listens for clients to request sending files up to the server and receives them.
 **/

 /*
 TODO

 */
/*jslint node: true */
/*global Buffer */
var sys = require('util');
var xmpp = require('node-xmpp');
var fs = require('fs');
var ltx = require('ltx');

var argv = process.argv;

'use strict';

var GoCastJS = GoCastJS || {};

//if (argv.length != 4) {
//    sys.puts('Usage: node echo_bot.js <my-jid> <my-password>');
//    process.exit(1);
//}

//process.on('uncaughtException', function (err) {
//  console.log('Caught exception: ' + err);
//});

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

GoCastJS.IBBTransfer = function(sender) {
    if (!sender || typeof(sender) !== 'function') {
        throw 'Must have a sender callback.';
    }

    this.send = sender;
    this.transfers = {};    // List of ongoing transfers
    this.history = [];      // Array of transfer history for logging/query purposes.

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

    this.send(iqNew.root());
    return;
};

GoCastJS.IBBTransfer.prototype.SendResult = function(iq) {
    this.send(new ltx.Element('iq', {to: iq.attrs.from, type: 'result', id: iq.attrs.id}).root());
};

GoCastJS.IBBTransfer.prototype.SendClose = function(iq, sid) {
    this.send(new ltx.Element('iq', {to: iq.attrs.from, type: 'set', id: 'closeid'})
            .c('close', {xmlns: 'http://jabber.org/protocol/ibb', sid: sid}).root());

    delete this.transfers[this.GenName(iq, sid)];
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

GoCastJS.IBBTransfer.prototype.GenName = function(iq, sid) {
    return iq.attrs.from + '_' + sid;
};

GoCastJS.IBBTransfer.prototype.internalProcessClose = function(iq) {
    var child = iq.getChildByAttr('xmlns', 'http://jabber.org/protocol/ibb'),
        sid_inbound, genname, theTransfer;

//    console.log('DATA: iq: ', iq);
//    console.log('DATA: child: ', child);

    sid_inbound = child.attrs.sid;
    genname = this.GenName(iq, sid_inbound);
    theTransfer = this.transfers[genname];

    if (sid_inbound === null) {
        this.SendError(iq, 'cancel', 'bad-request', 'No sid given or no seq given.');
        return;
    }

    if (!theTransfer) {
        this.SendError(iq, 'cancel', 'item-not-found',
                        'A transfer of this sid name is not open/active: ' + sid_inbound);
        this.SendClose(iq, sid_inbound);
        return;
    }

    // Now let's close it.
    fs.closeSync(theTransfer.fsfile);
    delete this.transfers[genname];
    this.SendResult(iq);
};

GoCastJS.IBBTransfer.prototype.internalProcessData = function(iq) {
    var child = iq.getChildByAttr('xmlns', 'http://jabber.org/protocol/ibb'),
        size_inbound, seq_inbound, sid_inbound, genname, theTransfer, dataBlock,
        self = this;

//    console.log('DATA: iq: ', iq);
//    console.log('DATA: child: ', child);

    seq_inbound = child.attrs.seq;
    sid_inbound = child.attrs.sid;
    genname = this.GenName(iq, sid_inbound);
    theTransfer = this.transfers[genname];

    if (sid_inbound === null || seq_inbound === null) {
        this.SendError(iq, 'cancel', 'bad-request', 'No sid given or no seq given.');
        if (sid_inbound) {
            this.SendClose(iq, sid_inbound);
        }
        return;
    }

    if (!theTransfer) {
        this.SendError(iq, 'cancel', 'item-not-found',
                        'A transfer of this sid name is not open/active: ' + sid_inbound);
        this.SendClose(iq, sid_inbound);
        return;
    }

    // Now we need to check to ensure the current sequence number is next in line.
    if (theTransfer.nextSeqExpected !== seq_inbound) {
        this.SendError(iq, 'cancel', 'not-acceptable',
                        'A transfer of this sid name is not open/active: ' + sid_inbound);
        this.SendClose(iq, sid_inbound);
        return;
    }

    theTransfer.nextSeqExpected += 1;

    // Process the data block.
    // Make a buffer of base64 and return binary from it. Then pass that into a binary buffer.
    // That final binary buffer gets passed into .write()
    dataBlock = new Buffer(new Buffer(child.getText(), 'base64').toString('binary'), 'binary');
 //   console.log('DATA: INFO: Received: ', dataBlock);

// Synchronous method.
//    console.log('Wrote ' + fs.writeSync(theTransfer.fsfile, dataBlock, 0, dataBlock.length, null) + ' bytes.');
//    this.SendResults(iq);

    fs.write(theTransfer.fsfile, dataBlock, 0, dataBlock.length, null, function(err, written) {
        if (err) {
            console.log('DATA: ERROR: ', err);
            self.SendClose(iq, sid_inbound);
        }
        else {
            console.log('DATA: SID: ' + sid_inbound + ' # bytes written: ' + written);
            self.SendResult(iq);
        }
    });

};

GoCastJS.IBBTransfer.prototype.internalProcessOpen = function(iq) {
    var child = iq.getChildByAttr('xmlns', 'http://jabber.org/protocol/ibb'),
        genname;

    genname = this.GenName(iq, child.attrs.sid);

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
                                                    nextSeqExpected: 0};

    // Now open a file for this transfer.
    this.transfers[genname].filename = genname.replace(/@/g, '_at_') + '_' + GoCastJS.fileDate();
    this.transfers[genname].fsfile = fs.openSync(this.transfers[genname].filename, 'w');

    if (!this.transfers[genname].fsfile) {
        console.log('ERROR: OPEN: Cannot open file: ' + this.transfers[genname].filename);
        this.SendClose(iq, child.attrs.sid);
        return;
    }

    this.SendResult(iq);
    console.log('OPEN: Starting for sid: ' + child.attrs.sid);
};
///
///
///
///  L O G C A T C H E R
///
///
///

function LogCatcher(user, pw, notifier) {
    this.SERVER = 'video.gocast.it';

    this.client = new xmpp.Client({ jid: user, password: pw, reconnect: true, host: this.SERVER, port: 5222 });
    this.notifier = notifier;

    this.iqnum = 0;
    this.iq_callbacks = {};
    this.IBB = new GoCastJS.IBBTransfer(this.sendIQ);

    var self = this;

    this.client.on('online', function() {
        // Mark ourself as online so that we can receive messages from direct clients.
        self.client.send(new xmpp.Element('presence'));

        self.log("Listening for logcatcher queries.");
    });

    this.client.on('offline', function() {
//      self.log('Switchboard went offline. Reconnection should happen automatically.');
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
            self.log("UNHANDLED: " + stanza.tree());
        }
    });

    this.client.on('error', function(e) {
        sys.puts(e);
        if (self.notifier) {
            self.notifylog(e.toString());
        }
    });

}

LogCatcher.prototype.notifylog = function(msg) {
    if (this.notifier) {
        this.notifier.sendMessage(GoCastJS.logDate() + " - LogCatcher: " + msg);
    }
};

LogCatcher.prototype.log = function(msg) {
    console.log(GoCastJS.logDate() + " - LogCatcher: " + msg);
};

LogCatcher.prototype.sendIQ = function(iq, cb) {
    var iqid = "logcatcher_iqid" + this.iqnum,
        self = this;

    this.iqnum += 1;

    if (!iq.root().is('iq'))
    {
        this.log("sendIQ - malformed inbound iq message. No <iq> stanza: " + iq.tree());
        return;
    }

    // Add in our ever-increasing room-based id.
    iq.root().attr('id', iqid);

    if (cb) {
        this.iq_callbacks[iqid] = cb;
    }
    else {
        this.log("sendIQ: - No callback for id=" + iqid);
    }

    this.client.send(iq.root());
};

LogCatcher.prototype.sendPrivateMessage = function(tojid, msg) {
    if (this.client)
    {
        var msg_stanza = new xmpp.Element('message', {to: tojid, type: 'chat'})
            .c('body').t(msg);
        this.client.send(msg_stanza);
    }
    else {
        this.log("ERROR: Client invalid.");
    }
};

//
// \brief Need to check the room's banned-list for this person.
//
LogCatcher.prototype.handleMessage = function(msg) {
    var k, cmd;
    // Listen to pure chat messages to the LogCatcher.
    // TODO: Make these into IQ messages to listen to since they require a 'result' back.

    //
    // Look for direct chats only.
    //
    if (msg.attrs.type === 'chat')
    {
//      this.log("DEBUG: InMsg: " + msg);

        // Don't listen to delayed messages.
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
/*          if (cmd[0] === 'INTRO_SR')
                this.intro_sr(msg.attrs.from, cmd[1]);
            else */
            switch (cmd[0]) {
            case 'LISTLOGS':
                if (this.userlist[cmd[1]]) {
                    this.log("FB_LOOKUP_ID: Found FB ID: " + cmd[1] + " online. FB Name: " + this.userlist[cmd[1]].name);
                }
                else {
                    this.log("FB_LOOKUP_ID: ID: " + cmd[1] + " not found online.");
                }
                break;
            default:
                this.log("Direct message: Unknown command: " + msg.getChild('body').getText());
                break;
            }
        }
    }
};

//
// At this level, we only want to handle presence at the server level.
// This means only listen to presence from jids with no username.
//
LogCatcher.prototype.handlePresence = function(pres) {
    this.log(pres);
};

LogCatcher.prototype.handleIq = function(iq) {
    var iqid, callback;

    if (!iq.attrs.from) {
        console.log('ERROR: malformed IQ - ', iq);
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
    else if (iq.getChild('ping')
        || (iq.getChild('query') && iq.getChildByAttr('xmlns','http://jabber.org/protocol/disco#info')))
    {
        iq.attrs.to = iq.attrs.from;
        delete iq.attrs.from;
        iq.attrs.type = 'result';

//          console.log("Sending pong/result: " + iq);
        this.client.send(iq);
    }
    else if (iq.attrs.type === 'set' && iq.getChildByAttr('xmlns', 'http://jabber.org/protocol/ibb')) {
        // We have an inbound IBB log request.
        if (this.IBB) {
            this.IBB.ProcessIQ(iq);
        }

    }
    else if (!iq.attrs.from.split('@')) {
        this.log("UNHANDLED IQ: " + iq);
    }
};

function Notifier(serverinfo, jidlist) {
    var users, k, self = this;

    this.server = serverinfo.server || "video.gocast.it";
    this.port = serverinfo.port || 5222;
    this.jid = serverinfo.jid;
    this.password = serverinfo.password;

    this.informlist = jidlist;
    this.isOnline = false;

    console.log(GoCastJS.logDate() + " - Notifier started:");
    users = "  Users to notify: ";

    for (k in this.informlist)
    {
        if (this.informlist.hasOwnProperty(k)) {
            if (users !== "  Users to notify: ") {
                users += ", ";
            }

            users += this.informlist[k];
        }
    }
    console.log(users);

    this.client = new xmpp.Client({ jid: this.jid, password: this.password, reconnect: true, host: this.server, port: this.port });

    this.client.on('online',
          function() {
//          if (!self.isOnline)
//              console.log(GoCastJS.logDate() + " - Notifier online.");
            self.isOnline = true;
//          self.sendMessage("Notifier online.");
          });

    this.client.on('offline',
          function() {
//          console.log(GoCastJS.logDate() + " - Notifier offline.");
            self.isOnline = false;
          });

    this.client.on('error', function(e) {
        sys.puts(e);
    });

}

Notifier.prototype.sendMessage = function(msg) {
    var i, len, msg_stanza;

    if (this.client && this.isOnline)
    {
        len = this.informlist.length;

        for (i = 0; i < len; i += 1)
        {
            msg_stanza = new xmpp.Element('message', {to: this.informlist[i], type: 'chat'})
                .c('body').t(msg);
            this.client.send(msg_stanza);
        }
    }
};

//
//
//  Main
//
//

console.log("****************************************************");
console.log("****************************************************");
console.log("*                                                  *");
console.log("STARTED LOGCATCHER @ " + Date());
console.log("*                                                  *");
console.log("****************************************************");
console.log("****************************************************");

// Setup defaults
var debugCommands = false;

var i, arg;

if (process.argv.length > 2)
{
    for (i = 0; i < process.argv.length; i += 1)
    {
        // Don't start processing args until we get beyond the .js itself.
        if (i >= 2)
        {
            arg = process.argv[i].toLowerCase();

            if (arg === '--help' || arg === '-help')
            {
                console.log("***********");
                console.log("*");
                console.log("* LogCatcher usage:");
                console.log("* --help - this usage help.");
                console.log("* --debugcommands - Allow direct chat to switchboard for backend commands.");
                console.log("*");
                console.log("***********");
            }
            else if (arg === '--debugcommands' || arg === '-debugcommands')
            {
                debugCommands = true;
                console.log(":: Enabling debug commands backend.");
            }
        }
    }
}

/*
var notify = new Notifier({jid: 'overseer@video.gocast.it', password: 'the.overseer.rocks',
                            server: 'video.gocast.it', port: 5222},
            ['rwolff@video.gocast.it', 'jim@video.gocast.it']); // , "bob.wolff68@jabber.org" ]);

//
// Login as Switchboard operator
//
var logcatcher = new LogCatcher("logcatcher@video.gocast.it", "log.catcher.gocast", notify);
*/

var ibb = new GoCastJS.IBBTransfer(function (tosend_back) {
    console.log('Callback: Send-back: ' + tosend_back);
});

/* tests for 'open' -- pass followed by fails for 2-5

ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'one'})
    .c('open', {xmlns: 'http://jabber.org/protocol/ibb', 'block-size': 512, sid: 'one', stanza: 'iq'}).root());

ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'two'})
    .c('open', {xmlns: 'http://jabber.org/protocol/ibb', 'block-size': 512, sid: 'two', stanza: 'message'}).root());

ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'three'})
    .c('open', {xmlns: 'http://jabber.org/protocol/ibb', 'block-size': 512, stanza: 'iq'}).root());

ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'four'})
    .c('open', {xmlns: 'http://jabber.org/protocol/ibb', sid: 'four', stanza: 'iq'}).root());

ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'five'})
    .c('open', {'block-size': 512, sid: 'one', stanza: 'iq'}).root());
*/

/* Data transfer test. Open valid. Then start sending data (valid) */
ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'onedata'})
    .c('open', {xmlns: 'http://jabber.org/protocol/ibb', 'block-size': 512, sid: 'data1', stanza: 'iq'}).root());

//
// Bogus - try opening the same sid twice.
//
ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'badopen'})
    .c('open', {xmlns: 'http://jabber.org/protocol/ibb', 'block-size': 512, sid: 'data1', stanza: 'iq'}).root());

var data_in = 'Hello there all you fine people.';
var data_out = new Buffer(data_in, 'binary').toString('base64');

ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'twodata'})
    .c('data', {xmlns: 'http://jabber.org/protocol/ibb', sid: 'data1', seq: 0})
    .t(data_out).root());

data_in = 'And your little dog too!';
data_out = new Buffer(data_in, 'binary').toString('base64');

setTimeout(function() {
    console.log('Second one...');

    ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'threedata'})
        .c('data', {xmlns: 'http://jabber.org/protocol/ibb', sid: 'data1', seq: 1})
        .t(data_out).root());

    setTimeout(function() {
        console.log('And close it...');

        ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'fourdata'})
            .c('close', {xmlns: 'http://jabber.org/protocol/ibb', sid: 'data1'}).root());
    }, 500);
}, 500);

//
// Bogus sid -- not opened yet.
//
ibb.ProcessIQ(new ltx.Element('iq', {from: 'bob@video.gocast.it', type: 'set', id: 'baddata'})
    .c('data', {xmlns: 'http://jabber.org/protocol/ibb', sid: 'dataBogus', seq: 0})
    .t(data_out).root());
