/**
 * Server Bot - All-encompassing mechanism for listening/logging feedback
 *              as well as acting as the overseer of rooms to control the network.
 **/
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
	this.client = client;
	this.iq = 0;
//	this.state = 
	var self = this;
	
	this.options['muc#roomconfig_maxusers'] = '0';
	this.options[
	
	if (!client)
	{
		alert("mucRoom() - No client specified.");
		return;
	}
	
	var becomeOwner = function() {
//			var jfrom = new xmpp.JID(stanza.attrs.from);
//			var roomName = jfrom.user + '@' + jfrom.domain;
		
	};

	client.on('stanza', function(stanza) {
	
		// Only handling our own stanzas.
		if (stanza.from && stanza.from.split('/')[0] != self.roomname)
			return;
			
		if (stanza.is('message') && stanza.attrs.type !== 'error')
			self.handleMessage(stanza);
		else if (stanza.is('presence'))			// Note presence will handle its own error stanzas.
			self.handlePresence(stanza);
		else if (!stanza.is('iq') && stanza.attrs.type !== 'error')
			console.log("MUC UNHANDLED: " + stanza.tree());
	});

	//
	// In a MUC room, we want to only handle our own messages destined for us.
	// We also only want to handle 'chat' messages and not 'groupchat' inbound.
	//
	this.handleMessage = function(msg) {
		if (msg.type != 'groupchat')
		{
			// Ignore topic changes.
			if (msg.getChild('subject'))
				return;
				
			console.log("MUC msg @" + this.roomname.split('@')[0] + ": From:" + msg.from.split('/')[1] + ": " + msg.getChild('body').getText());
		}
	};
	
	this.handlePresence = function(pres) {
		var fromnick = pres.from.split('/')[1];
		
		// We need to deal with non-configured rooms. If we get a status code 201, we need to config.
		if (pres.getChild('x') && pres.getChild('x').getChildrenByAttr('code','201').length > 0)
		{
			console.log("Room: " + this.roomname.split('@')[0] + " needs configured. Configuring...");
			
			// Request room configuration form.
/*			var getRoomConf = new xmpp.Element('iq', {to: this.roomname, type: 'get'})
				.c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'}); 
				
			console.log("Requesting room configuration... " + getRoomConf.tree());
			this.client.send(getRoomConf);
*/			
			//
			// Upon receiving the form from the server, the proper way would be to then
			// fill out the form and 'submit' the form.
			// Instead, we'll try just submitting blindly our preferred options.
			//
			var toSubmit = new xmpp.Element('iq', {to: this.roomname, type: 'set'})
				.c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'})
				.c('x', {xmlns: 'jabber:x:data', type: 'submit'})
				.c('field', {var: 'FORM_TYPE'})
				.c('value').t('http://jabber.org/protocol/muc#roomconfig')
				.up().up();

			// Add in our 'set options' we prefer.
			for (k in this.options)
				toSubmit.c('field', {var: k}).c('value').t(options[k]).up().up();
			
			console.log("Bare to-submit is: " + toSubmit.tree());
			
			// Now we have the base element ... we need to add <field var='varname'><value>real-value</value></field>
		}
		
		if (pres.getChild('error'))
		{
			// Special case where someone has already taken my nickname...kick them out.
			if (pres.getChild('error').getChild('conflict'))
				console.log("Kicking out overseer imposter.");
				self.kick(self.nick, function() {
					
					// Once the kick is complete, we need to re-establish ourselves.
					// TODO - not sure how to unjoin, rejoin, etc all from here...
					//    Is it true that we will have a conflict but we are still joined as 
					//    another nick (our resource id possibly?) - so we could change
					//    our nick then?
				});
			
			console.log("Room: " + this.roomname.split('@')[0] + " Error: " + pres);
			
			return;
		}
		
		//
		// If this is 'available', add the person to the participants array.
		//
		// Always address items in the array by nickname. Value is nickname or jid if one is available.
		//
		if (pres.type !== 'unavailable')
		{
			console.log("Adding: " + fromnick);
			self.participants[fromnick] = (pres.getChild('item') ? pres.getChild('item').jid : null) || fromnick;
		}
		else if (pres.type === 'unavailable' && self.participants[fromnick])
		{
			console.log("Removing: " + fromnick);
			delete self.participants[fromnick];
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

};

mucRoom.prototype.kick = function(nick, cb) {
	var jid = this.participants[nick];
	
	if (jid)
	{
		// Kicking the user out forcefully. BANNED.
		this.client.send(new xmpp.Element('iq', {to: this.room, type: 'set'})
						.c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
						.c('item', {jid: jid, affiliation: 'outcast'}));
	}
	else
		console.log("Couldn't seem to find '" + nick + "'. Must have scrammed.");
};

mucRoom.prototype.sendIQ = function(iq, cb) {
	iq.id = this.iq++;
	var self = this;
	
	this.client.on('iq', function(iq_cb) {
		if (iq_cb.id === iq.id)
		{
			// Now if we've received our IQ callback, then kill this 'on' listener.
			self.client.removeListener(this);
		}
	});
	
	this.client.send(iq);
};

mucRoom.prototype.join = function(rmname, nick) {
		this.client.on('presence', function(pres) {
			console.log("room presence: " + pres);
			return true;
		});
		
		el = new xmpp.Element('presence', {to: rmname + "/" + nick, usertype: 'silent'})
						.c('x', {xmlns: 'http://jabber.org/protocol/muc'})
		
		console.log("Joining: " + rmname + " as " + nick + ". "); // + el.tree());
		this.client.send(el);
						
		this.roomname = rmname;
		this.nick = nick;
};
		

function overseer(user, pw, rooms) {
	var self = this;
	var client = new xmpp.Client({ jid: user, password: pw, reconnect: true, host: "video.gocast.it", port: 5222 });
	
	client.on('online', function() {
		// Need to join all rooms in 'rooms'
//		for k in rooms each ...
		var room1 = new mucRoom(client);
		room1.join("bobtestroom@gocastconference.video.gocast.it", "overseer");
		var room2 = new mucRoom(client);
		room2.join("newroom@gocastconference.video.gocast.it", "overseer");
	});
	
	client.on('offline', function() {
		console.log('Went offline. Reconnection should happen automatically.');
	});
	
	//
	// Now once we're online, we need to handle all incoming from each room.
	client.on('stanza', function(stanza) {
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
		if (msg.attr.type!='groupchat')
			return;
			
		console.log("Got msg: " + msg);
	};
	
	//
	// At this level, we only want to handle presence at the server level.
	// This means only listen to presence from jids with no username.
	//
	this.handlePresence = function(pres) {
		if (!pres.from.split('@'))
		{
			console.log("Got pres: " + pres);
		}
	};
	
	this.handleIq = function(iq) {
		// Handle all pings and all queries for #info
		if (iq.getChild('ping') 
			|| (iq.getChild('query') && iq.getChildByAttr('xmlns','http://jabber.org/protocol/disco#info')))
		{
			iq.to = iq.from;
			delete iq.from;
			iq.type = 'result';
			
//			console.log("Sending pong: " + iq);
			client.send(iq);
		}
		else
			console.log("UNHANDLED IQ: " + iq);
	};
	
};

function feedbackBot(feedback_jid, feedback_pw) {
	// Login and then log any and all messages coming our way.
	// The clients should be sending:
	// Their jid, their room name, their nick
	// plus any message sent by the user.
	var client = new xmpp.Client({ jid: feedback_jid, password: feedback_pw });
	
	client.on('online',
		  function() {
		  client.send(new xmpp.Element('presence', { }).
			  c('show').t('chat').up().
			  c('status').t('Auto-Logging Feedback')
			 );
		  });
	client.on('stanza',
		  function(stanza) {
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
