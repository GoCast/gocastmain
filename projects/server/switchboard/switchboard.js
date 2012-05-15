/**
 * Server Bot - switchboard operator - for correlating anonymous JIDs to facebook user IDs
 **/

 /*
 TODO

 */
var sys = require('util');
var xmpp = require('node-xmpp');
var fs = require('fs');
var ltx = require('ltx');
var FacebookClient = require("facebook-client").FacebookClient;

var argv = process.argv;

//if (argv.length != 4) {
//    sys.puts('Usage: node echo_bot.js <my-jid> <my-password>');
//    process.exit(1);
//}

//process.on('uncaughtException', function (err) {
//  console.log('Caught exception: ' + err);
//});

function useritem(properties) {
	if (properties)
	{
		for (k in properties)
		{
			console.log("Adding: " + k + " = " + properties[k]);
			this[k] = properties[k];
		}
	}

	this.jids = {};
};

useritem.prototype.addJid = function(jid) {
	if (this.jids[jid])
		this.log("WARN: Jid already in list: " + jid);
	else
		this.jids[jid] = true;
};

useritem.prototype.removeJid = function(jid) {
	if (!this.jids[jid])
		this.log("ERROR: Jid not in list: " + jid);
	else
		delete this.jids[jid];
};

useritem.prototype.getJidList = function()
{
	return this.jids;
};

///
///
///
///  S W I T C H B O A R D
///
///
///

function switchboard(user, pw, notifier) {
	this.SERVER = 'video.gocast.it';
	this.APP_ID = '303607593050243';
	this.APP_SECRET = '48b900f452eb251407554283cc7f3d7f';
	this.client = new xmpp.Client({ jid: user, password: pw, reconnect: true, host: this.SERVER, port: 5222 });
	this.notifier = notifier;

	this.iqnum = 0;
	this.iq_callbacks = {};

	this.userlist = {};
	this.jidlist = {};

	this.facebook_client = new FacebookClient(this.APP_ID, this.APP_SECRET);
	if (!this.facebook_client)
		this.log("ERROR: Facebook Client instantiation failed.");

	var self = this;

	this.client.on('online', function() {
		// Mark ourself as online so that we can receive messages from direct clients.
		el = new xmpp.Element('presence');
		self.client.send(el);

		self.log("Listening for switchboard presence and queries.");

		// Now we need to make sure we stay connected to the server. We will do this via a ping-check
		// to the server every 10 seconds. If we don't get a reply, we can decide what to do about that.
		setInterval(function() {
//			console.log("pinging server...");

			var nopong = setTimeout(function() {
				self.log("ERROR: No pong received. Server connection died?");
			}, 5000);

			self.sendIQ(new xmpp.Element('iq', {to: self.SERVER, type: 'get'})
						.c('ping', {xmlns: 'urn:xmpp:ping'}), function(res) {
//							console.log("Got pong.");
							clearTimeout(nopong);
						});
		}, 10000);

	});

	this.client.on('offline', function() {
		self.log('Switchboard went offline. Reconnection should happen automatically.');
	});

	//
	// Now once we're online, we need to handle all incoming from each room.
	this.client.on('stanza', function(in_stanza) {
		var stanza = in_stanza.clone();

		if (stanza.is('message') && stanza.attrs.type !== 'error')
			self.handleMessage(stanza);
		else if (stanza.is('presence'))
			self.handlePresence(stanza);
		else if (stanza.is('iq') && stanza.attrs.type !== 'error')
			self.handleIq(stanza);
		else
			self.log("UNHANDLED: " + stanza.tree());
	});

	this.client.on('error', function(e) {
		sys.puts(e);
	});

};

switchboard.prototype.log = function(msg) {
	console.log(logDate() + " - Switchboard: " + msg);
};

switchboard.prototype.sendIQ = function(iq, cb) {
	var iqid = "switchboard_iqid" + this.iqnum++;
	var self = this;

	if (!iq.root().is('iq'))
	{
		this.log("sendIQ - malformed inbound iq message. No <iq> stanza: " + iq.tree());
		return;
	}

	// Add in our ever-increasing room-based id.
	iq.root().attr('id', iqid);

	if (cb)
		this.iq_callbacks[iqid] = cb;
	else
		this.log("sendIQ: - No callback for id=" + iqid);

/*	console.log("overseer sendIQ: - Callback list: ");
	for (k in this.iq_callbacks)
		console.log("  CB_ID: " + k);
*/
//	console.log("overseer sendIQ: SendingIQ: " + iq.tree());

	this.client.send(iq.root());
};

switchboard.prototype.sendPrivateMessage = function(tojid, msg) {
	if (this.client)
	{
		var msg_stanza = new xmpp.Element('message', {to: tojid, type: 'chat'})
			.c('body').t(msg);
		this.client.send(msg_stanza);
	}
	else
		this.log("ERROR: Client invalid.");
};

switchboard.prototype.sendGroupMessage = function(room, msg_body) {
	if (this.client)
	{
		var msg = new xmpp.Element('message', {to: room, type: 'groupchat'})
			.c('body').t(msg_body);

		this.client.send(msg);
	}
	else
		this.log("ERROR: Client invalid.");
};

//
// \brief Need to check the room's banned-list for this person.
//
switchboard.prototype.handleMessage = function(msg) {
	// Listen to pure chat messages to the switchboard.
	// TODO: Make these into IQ messages to listen to since they require a 'result' back.

	//
	// Look for direct chats only.
	//
	if (msg.attrs.type === 'chat')
	{
//		this.log("DEBUG: InMsg: " + msg);

		// Don't listen to delayed messages.
		if (msg.getChild('body') && msg.getChild('body').getText() && !msg.getChild('delay'))
		{
			// Now we need to split the message up and trim spaces just in case.
			var cmd = msg.getChild('body').getText().split(';');
			for (k in cmd)
				cmd[k] = cmd[k].trim();

			cmd[0] = cmd[0].toUpperCase();
/*			if (cmd[0] === 'INTRO_SR')
				this.intro_sr(msg.attrs.from, cmd[1]);
			else */
			if (cmd[0] === 'FB_LOOKUP_JID' && cmd[1])
			{
				if (this.userlist[cmd[1]])
					this.log("FB_LOOKUP_ID: Found FB ID: " + cmd[1] + " online. FB Name: " + this.userlist[cmd[1]].name);
				else
					this.log("FB_LOOKUP_ID: ID: " + cmd[1] + " not found online.");
			}
			else if (debugCommands && cmd[0] === 'LISTJIDS')
			{
				var the_list = "";
				for (k in this.jidlist)
					the_list += k + '\n';

				if (the_list === "")
					this.sendPrivateMessage(msg.attrs.from, "No JIDs online currently.");
				else
					this.sendPrivateMessage(msg.attrs.from, "Current JIDs online:\n" + the_list);
			}
			else if (debugCommands && cmd[0] === 'LISTUSERS')
			{
				var the_list = "";
				for (k in this.userlist)
					the_list += k + ": name: " + this.userlist[k].name + ", ID: " + this.userlist[k].id + '\n';

				if (the_list === "")
					this.sendPrivateMessage(msg.attrs.from, "No USERS online currently.");
				else
					this.sendPrivateMessage(msg.attrs.from, "Current USERS online:\n" + the_list);
			}
			else
				this.log("Direct message: Unknown command: " + msg.getChild('body').getText());
		}
	}
};

switchboard.prototype.intro_sr = function(from, blob, cb) {
	var inbound_sig = blob.split('.')[0];	// signature is followed by '.' followed by payload.
	var inbound_payload = blob.split('.')[1];
	var fromjid = from.split('/')[0];	// Ensure this is the bare jid.
	var calculated_sig;

	var self = this;

	// Format of INTRO_SR
	// INTRO_SR ; signature.payload
	if (!fromjid || !blob || !inbound_sig || !inbound_payload)
		this.log("INTRO_SR Invalid. No JID (" + fromjid + "), signature (" + inbound_sig + "), or payload:" + inbound_payload);
	else
	{
		// Now - calculate our signature and compare.
		var facebook_cookie = null;
		inbound_sig = this.facebook_client.convertBase64ToHex(inbound_sig.replace(/\-/g, '+').replace(/\_/g, '/'));
		var facebook_cookie_raw_json = new Buffer(inbound_payload.replace(/\-/g, '+').replace(/\_/g, '/'), 'base64').toString('binary');

		var session = null;
		this.facebook_client.getSessionByFbsrCookie(blob)(function(fbsess) {
			session = fbsess;

			if (session)
			{
				session.graphCall("/me", {
				})(function(result) {
					if (!result)
						self.log("ERROR: Did not successfully make graph call to /me for identity verification.");
					else
					{
						if (!self.userlist[result.id])
							self.userlist[result.id] = new useritem({name: result.name, id: result.id});

						//
						// Add this jid to the list for this facebook user.
						//
						self.userlist[result.id].addJid(fromjid);

						//
						// Now cross-link jids back to user items.
						//
						if (self.jidlist[fromjid])
							self.log("ERROR: JID already in database. Hmm - jid=" + fromjid);
						self.jidlist[fromjid] = self.userlist[result.id];

						self.log('Username is:' + result.name);
						console.log("DEBUG: ", result);

						if (cb)
							cb(result.id);
					}
				});

			}
		});

	}
};

switchboard.prototype.findFacebookUser = function(id) {
	return this.userlist[id];
};

//
// At this level, we only want to handle presence at the server level.
// This means only listen to presence from jids with no username.
//
switchboard.prototype.handlePresence = function(pres) {
//	if (!pres.attrs.from.split('@'))
	{
		var from = pres.attrs.from.split('/')[0];
		var fbname = "";
		var self = this;

		if (this.jidlist[from])
			fbname = this.jidlist[from].name;

		if (pres.attrs.type === 'unavailable')
			this.log("Got pres (OFFLINE): " + from + (fbname ? (" - Facebook: " + fbname) : ""));
		else
		{
			// Only announcing online status if signed request is part of the presence info.
			if (pres.attrs.intro_sr)
			{
				this.intro_sr(from, pres.attrs.intro_sr, function(fbid) {
					var who = "";
					for (k in self.userlist[fbid].jids)
						who += k + ", ";

					who += " - Facebook: " + self.userlist[fbid].name;
					self.log("Got pres (ONLINE): " + who);
				});
			}
		}
	}
};

switchboard.prototype.handleIq = function(iq) {
	// Handle all pings and all queries for #info
	if (iq.attrs.type === 'result' && iq.attrs.id && this.iq_callbacks[iq.attrs.id])
	{
		var iqid = iq.attrs.id;
		var callback = this.iq_callbacks[iqid];

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

//			console.log("Sending pong/result: " + iq);
		this.client.send(iq);
	}
	else if (!iq.attrs.from.split('@'))
		this.log("UNHANDLED IQ: " + iq);
};

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function pad2(num) { return pad(num, 2); };

//
// Return Date/Time as mm-dd-yyyy hh:mm::ss
//
function logDate() {
	var d = new Date();

	return pad2(d.getMonth()+1) + "-" + pad2(d.getDate()) + "-" + d.getFullYear() + " "
			+ pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
};

function notifier(serverinfo, jidlist) {
	this.server = serverinfo.server || "video.gocast.it";
	this.port = serverinfo.port || 5222;
	this.jid = serverinfo.jid;
	this.password = serverinfo.password;

	this.informlist = jidlist;
	this.isOnline = false;

	console.log(logDate() + " - Notifier started:");
	var users = "  Users to notify: ";
	for (k in this.informlist)
	{
		if (users !== "  Users to notify: ")
			users += ", ";

		users += this.informlist[k];
	}
	console.log(users);

	this.client = new xmpp.Client({ jid: this.jid, password: this.password, reconnect: true, host: this.server, port: this.port });

	var self = this;

	this.client.on('online',
		  function() {
		    if (!self.isOnline)
			  	console.log(logDate() + " - Notifier online.");
		  	self.isOnline = true;
//		  	self.sendMessage("Notifier online.");
		  });
	this.client.on('offline',
		  function() {
		  	console.log(logDate() + " - Notifier offline.");
		  	self.isOnline = false;
		  });

};

notifier.prototype.sendMessage = function(msg) {
	if (this.client && this.isOnline)
	{
		for (k in this.informlist)
		{
			var msg_stanza = new xmpp.Element('message', {to: this.informlist[k], type: 'chat'})
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
console.log("STARTED SWITCHBOARD @ " + Date());
console.log("*                                                  *");
console.log("****************************************************");
console.log("****************************************************");

// Setup defaults
debugCommands = false;

if (process.argv.length > 2)
{
	for (i in process.argv)
	{
		// Don't start processing args until we get beyond the .js itself.
		if (i < 2)
			continue;

		var arg = process.argv[i].toLowerCase();

		if (arg === '--help' || arg === '-help')
		{
			console.log("***********");
			console.log("*");
			console.log("* Switchboard usage:");
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

var notify = new notifier({jid: "overseer@video.gocast.it", password: "the.overseer.rocks",
							server: "video.gocast.it", port: 5222},
			["rwolff@video.gocast.it"]); // , "bob.wolff68@jabber.org" ]);

//
// Login as Switchboard operator
//
var overseer = new switchboard("switchboard_gocastfriends@video.gocast.it", "the.switchboard.answers", notify);
