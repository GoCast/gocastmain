/**
 * Server Bot - All-encompassing mechanism for listening/logging feedback
 *              as well as acting as the overseer of rooms to control the network.
 **/
 
 /*
 TODO
** Then add command reception and notification broadcast.
** Then recovery when kicked from a room or room destroyed etc.
** Then reading of config file and periodic re-reading.

 */
var sys = require('util');
var xmpp = require('node-xmpp');
var argv = process.argv;

//if (argv.length != 4) {
//    sys.puts('Usage: node echo_bot.js <my-jid> <my-password>');
//    process.exit(1);
//}

//process.on('uncaughtException', function (err) {
//  console.log('Caught exception: ' + err);
//});

function mucRoom(client) {
	this.isOwner = false;	// Assume we're not the owner yet until we're told so.
	this.roomname = "";
	this.nick = "";
	this.joined = false;
	this.participants = {};
	this.options = {};
	this.iq_callbacks = {};
	this.client = client;
	this.iqnum = 0;
//	this.state = 
	var self = this;
	
	// Max # users.
	this.options['muc#roomconfig_maxusers'] = '11';
	
	// Hidden room.
	this.options['muc#roomconfig_publicroom'] = '0';	// Non-listed room.
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
	
	if (!client)
	{
		alert("mucRoom() - No client specified.");
		return;
	}
	
	client.on('stanza', function(in_stanza) {
		var stanza = in_stanza.clone();
		
		// Only handling our own stanzas.
//		if (!stanza.attrs.from || (stanza.attrs.from && stanza.attrs.from.split('/')[0] != self.roomname))
		if (stanza.attrs.from && stanza.attrs.from.split('/')[0] != self.roomname)
			return;
			
		if (stanza.is('message') && stanza.attrs.type !== 'error')
			self.handleMessage(stanza);
		else if (stanza.is('presence'))			// Note presence will handle its own error stanzas.
			self.handlePresence(stanza);
		else if (stanza.is('iq') && stanza.attrs.type !== 'error')
			self.handleIQ(stanza);
		else
			console.log("MUC UNHANDLED: " + stanza.tree());
	});

};

mucRoom.prototype.handlePresence = function(pres) {
	var fromnick = pres.attrs.from.split('/')[1];
	var fromjid = null;
	var self = this;
	
	if (pres.getChild('x') && pres.getChild('x').getChild('item') && pres.getChild('x').getChild('item').attrs.jid)
		fromjid = pres.getChild('x').getChild('item').attrs.jid.split('/')[0];
	
	// We need to deal with non-configured rooms. If we get a status code 201, we need to config.
	if (pres.getChild('x') && pres.getChild('x').getChildrenByAttr('code','201').length > 0)
	{
		console.log("Room: " + this.roomname.split('@')[0] + " needs configured. Configuring...");
		
		// Request room configuration form.
		var getRoomConf = new xmpp.Element('iq', {to: this.roomname, type: 'get'})
			.c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'}); 
			
		console.log("Requesting room configuration... ");
		this.sendIQ(getRoomConf.root(), function(resp) {
			console.log("Got room configuration. Going for setup.");
			self.setupRoom(resp);
		});
		
	}
	
	if (pres.getChild('error'))
	{
		// Special case where someone has already taken my nickname...kick them out.
		if (pres.getChild('error').getChild('conflict'))
		{
			console.log("Kicking out overseer imposter. His jid=" + fromjid);
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
				console.log("Re-joining room after kicking the imposter.");				
				self.rejoin(self.roomname, null);
			});
		}
		else
				console.log("Couldn't kick -- didn't find their jid. Hmm. Are we not moderator/admin/owner?");
		
		console.log("Room: " + this.roomname.split('@')[0] + " Error: " + pres);
		
		return;
	}
	
	//
	// If this is 'available', add the person to the participants array.
	//
	// Always address items in the array by nickname. Value is nickname or jid if one is available.
	//
	if (pres.attrs.type !== 'unavailable')
	{
		console.log("Adding: " + fromjid + " as Nickname: " + fromnick);
		self.participants[fromnick] = fromjid || fromnick;
	}
	else if (pres.attrs.type === 'unavailable' && self.participants[fromnick])
	{
		console.log("Removing: " + fromnick);
		delete self.participants[fromnick];
		if (fromnick === self.nick)
		{
			console.log("We got kicked out...room destroyed? Or we disconnected??");
			self.joined = false;
			for (k in self.participants)
				delete self.participants[k];
			
			console.log("MUC @" + self.roomname.split('@')[0] + " - Re-joining (and creating?) room.");
			self.rejoin(self.roomname, self.nick_original);
		}
	}

	// If the 'from' is myself -- then I'm here. And so we'll print the current list.
	if (fromnick === self.nick)
	{
		var parts = "";

		for (k in self.participants)
		{
			// Add in a ',' if we're not first in line.
			if (parts !== "")
				parts += ", ";

			parts += k;
		}

		console.log("Participants list: " + parts);
		
		if (!self.joined)
			self.joined = true;
	}
	
	console.log("MUC pres: @" + this.roomname.split('@')[0] + ": " + pres.getChild('x'));

};

//
// If we have a result coming at us and there is a tagged callback for it,
// then make the callback and remove the entry in the callbacks list.
//
mucRoom.prototype.handleIQ = function(iq) {
/*		if (iq.attrs.from.split('@')[0] !== this.roomname.split('@')[0])
	{
		console.log("ERROR: NAME MISMATCH. this.roomname="+this.roomname+" while iq="+iq.tree());
	}
*/		
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
	else if (iq.attrs.type !== 'result')
		console.log("handleIQ msg @" + this.roomname.split('@')[0] + " was ignored: " + iq);
	else
	{
/*			console.log("handleIQ: MUC @" + this.roomname.split('@')[0] + " - Callback list: ");
		for (k in this.iq_callbacks)
			console.log("  CB_ID: " + k);
	*/
		console.log("handleIQ: IQ result msg @" + this.roomname.split('@')[0] + " was ignored: " + iq);
	}
};

//
// In a MUC room, we want to only handle our own messages destined for us.
// We also only want to handle 'chat' messages and not 'groupchat' inbound.
//
mucRoom.prototype.handleMessage = function(msg) {
	if (msg.attrs.type != 'groupchat')
	{
		// Ignore topic changes.
		if (msg.getChild('subject'))
			return;
			
		console.log("MUC msg @" + this.roomname.split('@')[0] + ": From:" + msg.attrs.from.split('/')[1] + ": " + msg.getChild('body').getText());
	}
};
	

mucRoom.prototype.setupRoom = function(form) {
	// We have received a form from the server. We need to make changes and send it back.
	if (!form.is('iq'))
	{
		console.log("ERROR: Server configuration form is not of type iq. Ignoring.");
		return;
	}
	
//	console.log("ROOM_SETUP: INITIAL: " + form.tree());
//	console.log("");
	
	form.attrs.to = form.attrs.from;
//	form.from = "BobAndManjesh";
//	form.from = null;
	delete form.attrs.from;
	form.attrs.type = 'set';
	
	if (form.getChild('query') && form.getChild('query').getChild('x'))
	{
		form.getChild('query').getChild('x').attr('type','submit');
		
		// Now we iterate through the desired options.
		// If we don't find one of our options, we have to assume the server doesn't accept it.
		// If we find it, we set the value to our desired value.

		for (k in this.options)
		{
			if (form.getChild('query').getChild('x').getChildByAttr('var', k)
					&& form.getChild('query').getChild('x').getChildByAttr('var', k).getChild('value'))
			{
//				console.log("Change-Pre:  " + form.getChild('query').getChild('x').getChildByAttr('var', k));
				form.getChild('query').getChild('x').getChildByAttr('var', k).getChild('value').text(this.options[k]);
//				console.log("Change-Post: " + form.getChild('query').getChild('x').getChildByAttr('var', k));
			}
			else
				console.log("Skipping option: " + k);
		}

//		console.log("ROOM_SETUP: FINAL: " + form.tree());
		
		// Now send the room setup off to the server.
		this.sendIQ(form, function(resp) {
			// Handle the response to the room setup.
			if (resp.attrs.type === 'result')
			{
				console.log("Room setup successful.");
			}
			else
				console.log("Room setup failed. Response: " + resp.tree());
		});
	}
	else
		console.log("setupRoom: No <query><x> ...");
};

mucRoom.prototype.kick = function(nick, cb) {
	var jid = this.participants[nick];

	// Found an entry in the array and it wasn't just a nick.	
	if (jid && jid !== nick)
	{
		// Kicking the user out forcefully. BANNED.
		this.sendIQ(new xmpp.Element('iq', {to: this.room, type: 'set'})
					.c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
					.c('item', {jid: jid, affiliation: 'outcast'}), cb);
	}
	else
		console.log("Couldn't seem to find '" + nick + "'. Must have scrammed.");
};

mucRoom.prototype.sendIQ = function(iq, cb) {
	var iqid = this.roomname.split('@')[0] + "_iqid" + this.iqnum++;
	var self = this;

	if (!iq.is('iq'))
	{
		console.log("sendIQ - malformed inbound iq message. No <iq> stanza: " + iq.tree());
		return;
	}

	// Add in our ever-increasing room-based id.		
	iq.attr('id', iqid);
	
	if (cb)
		this.iq_callbacks[iqid] = cb;	
	else
		console.log("sendIQ: MUC @" + this.roomname.split('@')[0] + " - No callback for id=" + iqid);
	
/*	console.log("sendIQ: MUC @" + this.roomname.split('@')[0] + " - Callback list: ");
	for (k in this.iq_callbacks)
		console.log("  CB_ID: " + k);
		
	console.log("sendIQ: MUC @" + this.roomname.split('@')[0] + ": SendingIQ: " + iq.tree());
*/
	this.client.send(iq);
};

mucRoom.prototype.leave = function() {
	var to = this.roomname;
	if (this.nick)
		to += "/" + this.nick;
		
	el = new xmpp.Element('presence', {to: to, usertype: 'silent', type: 'unavailable'})
					.c('x', {xmlns: 'http://jabber.org/protocol/muc'})
	
	console.log("Joining: " + rmname + " as " + nick + ". "); // + el.tree());
	this.client.send(el);
};

mucRoom.prototype.join = function(rmname, nick) {
	// The sole purpose of this nick_original is to allow us to exit/re-join as non-original and kick
	// a user out who is an imposter to the overseer and then re-join again
	this.nick_original = nick;
	
	this.rejoin(rmname, nick);
};

mucRoom.prototype.rejoin = function(rmname, nick) {
	var to = rmname;
	
	// If no nick is specified, then just join. This must be a signal that we are coming in
	// to kick out an imposter to the original overseer nickname.
	if (nick)
		to += "/" + nick;
		
	el = new xmpp.Element('presence', {to: to, usertype: 'silent'})
					.c('x', {xmlns: 'http://jabber.org/protocol/muc'})
	
	console.log("Joining: " + rmname + " as " + nick + ". "); // + el.tree());
	this.client.send(el);
					
	this.roomname = rmname;
	this.nick = nick;
};

///
///
///
///  O  V  E  R  S  E  E  R
///
///
///

function overseer(user, pw, rooms) {
	var self = this;
	var client = new xmpp.Client({ jid: user, password: pw, reconnect: true, host: "video.gocast.it", port: 5222 });
	
	client.on('online', function() {
		// Need to join all rooms in 'rooms'
//		for k in rooms each ...
		var room1 = new mucRoom(client);
		room1.join("bobtestroom@gocastconference.video.gocast.it", "overseer");
//		var room2 = new mucRoom(client);
//		room2.join("newroom@gocastconference.video.gocast.it", "overseer");
//		var room3 = new mucRoom(client);
//		room3.join("other_newroom@gocastconference.video.gocast.it", "overseer");
	});
	
	client.on('offline', function() {
		console.log('Went offline. Reconnection should happen automatically.');
	});
	
	//
	// Now once we're online, we need to handle all incoming from each room.
	client.on('stanza', function(in_stanza) {
		var stanza = in_stanza.clone();
		
		if (stanza.is('message') && stanza.attrs.type !== 'error')
			self.handleMessage(stanza);
		else if (stanza.is('presence'))
			self.handlePresence(stanza);
		else if (stanza.is('iq') && stanza.attrs.type !== 'error')
			self.handleIq(stanza);
		else
			console.log("UNHANDLED: " + stanza.tree());
	});

	client.on('error', function(e) {
		sys.puts(e);
	});
	
	this.handleMessage = function(msg) {
		// Listen to pure chat messages to the overseer.
		if (msg.attrs.type === 'groupchat')
			return;
			
// Don't think we need any global messages.		console.log("Got msg: " + msg);
	};
	
	//
	// At this level, we only want to handle presence at the server level.
	// This means only listen to presence from jids with no username.
	//
	this.handlePresence = function(pres) {
		if (!pres.attrs.from.split('@'))
		{
			console.log("Got pres: " + pres);
		}
	};
	
	this.handleIq = function(iq) {
		// Handle all pings and all queries for #info
		if (iq.getChild('ping') 
			|| (iq.getChild('query') && iq.getChildByAttr('xmlns','http://jabber.org/protocol/disco#info')))
		{
			iq.attrs.to = iq.attrs.from;
			delete iq.attrs.from;
			iq.attrs.type = 'result';
			
			console.log("Sending pong/result: " + iq);
			client.send(iq);
		}
		else if (!iq.attrs.from.split('@'))
			console.log("UNHANDLED IQ: " + iq);
	};
	
};

function feedbackBot(feedback_jid, feedback_pw) {
	// Login and then log any and all messages coming our way.
	// The clients should be sending:
	// Their jid, their room name, their nick
	// plus any message sent by the user.
	var client = new xmpp.Client({ jid: feedback_jid, password: feedback_pw, reconnect: true, host: "video.gocast.it", port: 5222 });
	
	client.on('online',
		  function() {
		  client.send(new xmpp.Element('presence', { }).
			  c('show').t('chat').up().
			  c('status').t('Auto-Logging Feedback')
			 );
		  });
	client.on('stanza',
		  function(in_stanza) {
			  var stanza = in_stanza.clone();
			  if (stanza.is('message') &&
				  // Important: never reply to errors!
				  stanza.attrs.type !== 'error') {
		
				  if (stanza.getChild('body'))
				  {
					var nick = stanza.attrs.nick || 'no-nick';
					var room = stanza.attrs.room || 'no-room';
					
					sys.puts("From: " + stanza.attrs.from
						+ ", Nick: " + nick
						+ ", Room: " + room
						+ ", Body: " + stanza.getChild('body').getText());
				  }
				  
				  // Swap addresses...
				  stanza.attrs.to = stanza.attrs.from;
				  delete stanza.attrs.from;
				  // and send back.
				  client.send(stanza);
			  }
		  });
	client.on('error',
		  function(e) {
		  sys.puts(e);
		  });
};

//
// Login as test feedback bot.
//
//var fb = new feedbackBot("feedback_bot_test1@video.gocast.it", "test1");

//
// Login as Overseer
//
var overseer = new overseer("overseer@video.gocast.it", "the.overseer.rocks");
