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
	this.islocked = false;
	this.bannedlist = {};
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

mucRoom.prototype.getRoomConfiguration = function(cb) {
	var self = this;

	// Request room configuration form.
	var getRoomConf = new xmpp.Element('iq', {to: this.roomname, type: 'get'})
		.c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'});

	console.log("Requesting room configuration... ");
	this.sendIQ(getRoomConf, function(resp) {
		if (cb)
			cb.call(self, resp);
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

		this.getRoomConfiguration(function(resp) {
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
		this.participants[fromnick] = fromjid || fromnick;
	}
	else if (pres.attrs.type === 'unavailable' && this.participants[fromnick])
	{
		console.log("Removing: " + fromnick);
		delete this.participants[fromnick];
		if (fromnick === self.nick)
		{
			console.log("We got kicked out...room destroyed? Or we disconnected??");
			this.joined = false;
			for (k in this.participants)
				delete this.participants[k];

			console.log("MUC @" + this.roomname.split('@')[0] + " - Re-joining (and creating?) room.");
			this.rejoin(self.roomname, self.nick_original);
		}

	}

	// If the 'from' is myself -- then I'm here. And so we're joined...
	if (fromnick === this.nick)
	{
		if (!self.joined)
		{
			this.joined = true;

			// Upon joining, get context of the room. Get the banned list.
			this.loadBannedList(function() {
				console.log("Received Banned List for room: " + this.roomname.split('@')[0]);
				this.printParticipants();
				this.printBannedList();
			});

			// Also to get context of the room, find out if the room is members-only or not.
			this.getRoomConfiguration(function(form) {
				// form should contain a list of current variable value entries.
				// We are looking for: muc#roomconfig_membersonly

				// Need to ensure a few things first though...
				if (form.attrs.type === 'result' && form.getChild('query') && form.getChild('query').getChild('x'))
				{
					// Is there a setting for membersonly?
					if (form.getChild('query').getChild('x').getChildByAttr('var', 'muc#roomconfig_membersonly')
						&& form.getChild('query').getChild('x').getChildByAttr('var', 'muc#roomconfig_membersonly').getChild('value'))
					{
						if (form.getChild('query').getChild('x').getChildByAttr('var', 'muc#roomconfig_membersonly').getChild('value').getText() === '1')
						{
							console.log("Walking in, room is locked.");
							this.islocked = true;
						}
						else
							this.islocked = false;
					}
				}

			});
		}
	}
	else
	{
		// If we're already joined, print each coming and going....
		if (this.joined)
			this.printParticipants();
	}

	console.log("MUC pres: @" + this.roomname.split('@')[0] + ": " + pres.getChild('x'));

};

mucRoom.prototype.printBannedList = function() {
	var parts = "";

	for (k in this.bannedlist)
	{
		// Add in a ',' if we're not first in line.
		if (parts !== "")
			parts += ", ";

		parts += k;
	}

	if (parts !== "")
		console.log("Banned list: " + parts);
	else
		console.log("No one on the banned list.");
};

mucRoom.prototype.printParticipants = function() {
	var parts = "";

	for (k in this.participants)
	{
		// Add in a ',' if we're not first in line.
		if (parts !== "")
			parts += ", ";

		parts += k.replace(/\\20/g, ' ');
	}

	console.log("Participants list: " + parts);
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
	{
		if (iq.attrs.type === 'get' && iq.getChild('query') && iq.getChild('query').attrs.xmlns === 'http://jabber.org/protocol/disco#info')
		{
			// Ignore disco info requests. Just reply with 'result'
			iq.attrs.to = iq.attrs.from;
			delete iq.attrs.from;
			iq.attrs.type = 'result';

			console.log("disco#info");
			this.sendIQ(iq, function() { });	// Don't care about any callback.
		}
		else
			console.log("handleIQ @" + this.roomname.split('@')[0] + " was ignored: " + iq);
	}
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
	var self = this;

	if (msg.attrs.type != 'groupchat')
	{
		// Ignore topic changes.
		if (msg.getChild('subject'))
			return;

		var nickfrom = msg.attrs.from.split('/')[1];

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
			var cmd = msg.getChild('body').getText().split(';');
			for (k in cmd)
				cmd[k] = cmd[k].trim();

			cmd[0] = cmd[0].toUpperCase();
			if (cmd[0] === 'KICK')
			{
				// Must have a nickname as an argument.
				if (cmd[1])
				{
					console.log("MUC @"+this.roomname.split('@')[0] + " - Command: KICKing out: " + cmd[1]);

					if (!this.kick(cmd[1], function() {
						console.log("MUC @"+this.roomname.split('@')[0] + " - Command: KICK complete.");

						self.sendGroupMessage(nickfrom + " kicked " + cmd[1] + " out of the room.");
					}))
						console.log("MUC @"+this.roomname.split('@')[0] + " - Command: KICK failed");
				}
				else
					console.log("MUC @"+this.roomname.split('@')[0] + " - Command: KICK - requires nickname.");
			}
			else if (cmd[0] === 'LOCK')
			{
				console.log("MUC @"+this.roomname.split('@')[0] + " - Command: LOCKing room.");
				if (this.lock() === true)
					self.sendGroupMessage(nickfrom + " locked the room.");
			}
			else if (cmd[0] === 'UNLOCK')
			{
				console.log("MUC @"+this.roomname.split('@')[0] + " - Command: UNLOCKing room.");
				this.unlock();
				self.sendGroupMessage(nickfrom + " un-locked the room.");
			}
			else if (cmd[0] === 'INVITE')
			{
				if (!cmd[1] || !cmd[2])
					console.log("MUC @"+this.roomname.split('@')[0] + " - Command: INVITE Invalid. No jid(" + cmd[1] + ") or no nickname(" + cmd[2] + ")");
				else
				{
					console.log("MUC @"+this.roomname.split('@')[0] + " - Command: Approving Invite to room of jid:" + cmd[1] + " - nickname:" + cmd[2]);
					this.invite(cmd[1]);	// Nickname only gets used for identification purposes.
					self.sendGroupMessage(nickfrom + " invited " + cmd[1] + " to join the room as nickname: " + cmd[2]);
				}
			}
			else if (cmd[0] === 'BAN')
			{
//				console.log("DEBUG: message:" + msg.tree());
				if (!cmd[1] || !cmd[2])
					console.log("MUC @"+this.roomname.split('@')[0] + " - Command: BAN Invalid. No jid(" + cmd[1] + ") or no nickname(" + cmd[2] + ")");
				else
				{
					// in case we get a chat-formulated 'name@email.com <mailto:name@email.com>'
					cmd[1] = cmd[1].split(' ')[0];

					console.log("MUC @"+this.roomname.split('@')[0] + " - Command: Banning jid:" + cmd[1] + " - nickname:" + cmd[2]);
					this.banOutsiderByJid(cmd[1], function(resp) {
						self.sendGroupMessage(nickfrom + " banned " + cmd[1] + " from joining the room who was using nickname: " + cmd[2]);
					});
				}
			}
			else
			  console.log("MUC @"+this.roomname.split('@')[0] + " - Invalid Inbound-Command: " + msg.getChild('body').getText());
		}
		else
			console.log("MUC msg @" + this.roomname.split('@')[0] + ": From:" + msg.attrs.from.split('/')[1] + ": " + msg.getChild('body'));
	}
};

mucRoom.prototype.invite = function(invitejid) {
	var self = this;

	// Adding this particular jid to the members list.
	this.sendIQ(new xmpp.Element('iq', {to: this.roomname, type: 'set'})
		.c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
		.c('item', {affiliation: 'member', jid: invitejid}), function(resp) {
			if (resp.attrs.type === 'result')
				console.log("MUC msg @" + self.roomname.split('@')[0] + ": Invite of " + invitejid + " successful.");
			else
				console.log("MUC msg @" + self.roomname.split('@')[0] + ": ERROR: Invite of " + invitejid + " failed:" + resp);
		});
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

//
// \brief Request, get, and clear the members list for this room.
//        Once this is complete. Call the callback.
//
mucRoom.prototype.clearMembersList = function(cb) {
	// Ask for the current list.
	var self = this;

	var getmemb = new xmpp.Element('iq', {to: this.roomname, type: 'get'})
		.c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
		.c('item', {affiliation: 'member'});

//	console.log("clearMemberList - get request is: " + getmemb.tree());

	this.sendIQ(getmemb, function(curlist) {

			if (curlist.attrs.type !== 'result')
				console.log("MUC clearMembers @" + self.roomname.split('@')[0] + ": Get-Curlist failed: " + curlist.tree());

			if (curlist.getChild('query') && curlist.getChild('query').getChild('item'))
			{
				var items = curlist.getChild('query').getChildren('item');

//				console.log("MUC clearMembers @" + self.roomname.split('@')[0] + ": Current entries: " + curlist.tree());

				// Iterate through all items and 'zero them out' -- no affiliation and nuke nick/role
				for (k in items)
				{
					items[k].attrs.affiliation = 'none';

					if (items[k].attrs.nick)
						delete items[k].attrs.nick;
					if (items[k].attrs.role)
						delete items[k].attrs.role;
				}

//				console.log("MUC clearMembers @" + self.roomname.split('@')[0] + ": Modified entries: " + curlist.tree());

				// Going to turn this iq around regardless so the logic flow is identical.
				curlist.root().attrs.type = 'set';
				curlist.root().attrs.to = curlist.root().attrs.from;
				delete curlist.root().attrs.from;

				// After sending this, we'll have a cleared member list.
				// Then we can set our own.
				self.sendIQ(curlist, function(res) {
					if (cb)
						cb.call(self, res)
				});
			}
			else
			{
				// No items in the list from the server. So we're already clear. Just callback.

//				console.log("MUC clearMembers @" + self.roomname.split('@')[0] + ": No members yet.");

				if (cb)
					cb.call(self, curlist);
			}

	});
};

//
// \brief Request the banned-list for this room.
//        Once this is complete. Call the callback.
//
mucRoom.prototype.loadBannedList = function(cb) {
	// Ask for the current list.
	var self = this;

	var getoutcast = new xmpp.Element('iq', {to: this.roomname, type: 'get'})
		.c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
		.c('item', {affiliation: 'outcast'});

//	console.log("loadBannedList - get request is: " + getoutcast.tree());

	this.sendIQ(getoutcast, function(curlist) {
		// Zero out the current banned list
		self.bannedlist = {};

		if (curlist.attrs.type !== 'result')
			console.log("MUC loadBanned @" + self.roomname.split('@')[0] + ": Get-Curlist failed: " + curlist.tree());

		if (curlist.getChild('query') && curlist.getChild('query').getChild('item'))
		{
			var items = curlist.getChild('query').getChildren('item');

//			console.log("MUC loadBanned @" + self.roomname.split('@')[0] + ": Current entries: " + curlist.tree());

			// Iterate through all items and put them in the bannedlist array.
			for (k in items)
			{
				self.bannedlist[items[k].attrs.jid] = true;
			}
		}

		if (cb)
			cb.call(self, curlist);
	});

};

//
// \brief Request, get, and clear the banned list for this room.
//        Once this is complete. Call the callback.
//
mucRoom.prototype.clearBannedList = function(cb) {
	// Ask for the current list.
	var self = this;

	var getoutcast = new xmpp.Element('iq', {to: this.roomname, type: 'get'})
		.c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
		.c('item', {affiliation: 'outcast'});

//	console.log("clearBannedList - get request is: " + getoutcast.tree());

	this.sendIQ(getoutcast, function(curlist) {

			if (curlist.attrs.type !== 'result')
				console.log("MUC clearBanned @" + self.roomname.split('@')[0] + ": Get-Curlist failed: " + curlist.tree());

			if (curlist.getChild('query') && curlist.getChild('query').getChild('item'))
			{
				var items = curlist.getChild('query').getChildren('item');

//				console.log("MUC clearBanned @" + self.roomname.split('@')[0] + ": Current entries: " + curlist.tree());

				// Iterate through all items and 'zero them out' -- no affiliation and nuke nick/role
				for (k in items)
				{
					items[k].attrs.affiliation = 'none';

					if (items[k].attrs.nick)
						delete items[k].attrs.nick;
					if (items[k].attrs.role)
						delete items[k].attrs.role;
				}

//				console.log("MUC clearBanned @" + self.roomname.split('@')[0] + ": Modified entries: " + curlist.tree());

				// Going to turn this iq around regardless so the logic flow is identical.
				curlist.root().attrs.type = 'set';
				curlist.root().attrs.to = curlist.root().attrs.from;
				delete curlist.root().attrs.from;

				// After sending this, we'll have a cleared member list.
				// Then we can set our own.
				self.sendIQ(curlist, function(res) {
					for (k in self.bannedlist)
						delete self.bannedlist[k];

					if (cb)
						cb.call(self, res)
				});
			}
			else
			{
				// No items in the list from the server. So we're already clear. Just callback.
				for (k in self.bannedlist)
					delete self.bannedlist[k];

//				console.log("MUC clearBanned @" + self.roomname.split('@')[0] + ": No banned jids.");

				if (cb)
					cb.call(self, curlist);
			}

	});
};

mucRoom.prototype.lock = function() {
	var self = this;

	if (this.islocked)
	{
		console.log("MUC LOCK @" + this.roomname.split('@')[0] + ": ERROR: Room is already locked.");
		return false;
	}

	// locking a room requires bumping each person to 'member'
	// In this version, we'll first ask the server for the member list. If there is anyone on the
	// list, we'll remove them from the list and then we'll set the current member list 'cleanly'.
	// And then on response, lock the room.

	this.clearMembersList(function(res) {

		if (res.attrs.type !== 'result')
			console.log("MUC LOCK @" + self.roomname.split('@')[0] + ": clearMembers failed: " + res.tree());

		// Now clear the banned list prior to locking the room.
		self.clearBannedList(function(res) {

			if (res.attrs.type !== 'result')
				console.log("MUC LOCK @" + self.roomname.split('@')[0] + ": clearBanned failed: " + res.tree());

				// Setup the head of the iq-set
				var memblist = new xmpp.Element('iq', {to: self.roomname, type: 'set'})
					.c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'});

				for (k in self.participants)
				{
					if (k != self.nick)	// Don't modify myself
					{
						if (k !== self.participants[k])
						{
							// Sending each IQ with no callback. Could wind up in a race for locking the room.
							memblist.c('item', {affiliation: 'member', jid: self.participants[k]}).up();
						}
						else
							console.log("MUC LOCK @" + self.roomname.split('@')[0] + ": Cannot make member. No jid found for: " + k);
					}
				}

//				console.log("MUC Lock @" + self.roomname.split('@')[0] + " Prepped to send member-list: " + memblist.tree());

				// Send the 'set' for the member list. Then Wait for a response and send the lock-room signal.
				self.sendIQ(memblist, function(resp) {
				// Now we need to change the room to be members-only.
					if (resp.attrs.type === 'result')
					{
						this.sendIQ(new xmpp.Element('iq', {to: self.roomname, type: 'set'})
								.c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'})
								.c('x', {xmlns: 'jabber:x:data', type: 'submit'})
								.c('field', {var: "FORM_TYPE", type: 'hidden'})
								.c('value').t('http://jabber.org/protocol/muc#roomconfig')
								.up().up()
								.c('field', {var: 'muc#roomconfig_membersonly', type: 'boolean'})
								.c('value').t('1'), function(resp) {
									if (resp.attrs.type === 'result')
									{
										console.log("MUC Lock @" + self.roomname.split('@')[0] + " locked successfully.");
										self.islocked = true;
									}
									else
										console.log("MUC Lock @" + self.roomname.split('@')[0] + " NOT LOCKED. Resp: " + resp.tree());
								});
					}
					else
						console.log("MUC Lock @" + self.roomname.split('@')[0] + " NOT LOCKED. Member-List failed Resp: " + resp.tree());
				});
			});
		});

	return true;
};

mucRoom.prototype.unlock = function() {
	var self = this;

	// TODO
	// We should destroy the members-list prior to opening up the room so that 'lock' will work properly.

	// We need to change the room to be members-only=0.
	this.sendIQ(new xmpp.Element('iq', {to: this.roomname, type: 'set'})
			.c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'})
			.c('x', {xmlns: 'jabber:x:data', type: 'submit'})
			.c('field', {var: "FORM_TYPE", type: 'hidden'})
			.c('value').t('http://jabber.org/protocol/muc#roomconfig')
			.up().up()
			.c('field', {var: 'muc#roomconfig_membersonly', type: 'boolean'})
			.c('value').t('0'), function(resp) {
				if (resp.attrs.type === 'result')
				{
					console.log("MUC Un-Lock @" + self.roomname.split('@')[0] + " unlocked successfully.");
					self.islocked = false;

					// Now we shall clear the memebers list and the banned list.
					this.clearMembersList(function(res) {

						if (res.attrs.type !== 'result')
							console.log("MUC LOCK @" + self.roomname.split('@')[0] + ": clearMembers failed: " + res.tree());

						// Now clear the banned list prior to locking the room.
						self.clearBannedList(function(res) {

							if (res.attrs.type !== 'result')
								console.log("MUC LOCK @" + self.roomname.split('@')[0] + ": clearBanned failed: " + res.tree());

						});
					});
				}
				else
					console.log("MUC Un-Lock @" + self.roomname.split('@')[0] + " NOT UNLOCKED. Resp: " + resp.tree());
			});
};

//
// Kicking a person effectively removes them from the room but is different than a ban.
// Kick allows them to attempt to re-enter.
// Kick sets the role to none (not affiliation to outcast)
// Kick uses the nickname and not the jid to do the kick.
//
mucRoom.prototype.kick = function(nick, cb) {
	var role = 'none';
	var nickToKick = nick.replace(/ /g, '\\20');

	// See if nickname exists.
	if (!this.participants[nickToKick])
		return false;

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
mucRoom.prototype.banFromRoomByNick = function(nick, cb) {
	var jid = this.participants[nick];
	var affil = 'outcast';
	var nickToBan = nick.replace(/ /g, '\\20');

	// See if nickname exists.
	if (!this.participants[nickToBan])
		return false;

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
		console.log("Couldn't seem to find '" + nick + "'. Must have scrammed.");
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
mucRoom.prototype.banOutsiderByJid = function(jid, cb) {
	var affil = 'outcast';

	// Kicking the user out forcefully. BANNED.
	this.sendIQ(new xmpp.Element('iq', {to: this.roomname, type: 'set'})
				.c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
				.c('item', {jid: jid, affiliation: affil}), cb);

	// Add person to banned list internally.
	this.bannedlist[jid] = true;

	return true;
};

mucRoom.prototype.isBanned = function(jid) {
	if (this.bannedlist[jid])
		return true;
	else
		return false;
};

mucRoom.prototype.sendGroupMessage = function(msg_body) {
	var msg = new xmpp.Element('message', {to: this.roomname, type: 'groupchat'})
		.c('body').t(msg_body);

	this.client.send(msg);
};

mucRoom.prototype.sendIQ = function(iq, cb) {
	var iqid = this.roomname.split('@')[0] + "_iqid" + this.iqnum++;
	var self = this;

	if (!iq.root().is('iq'))
	{
		console.log("sendIQ - malformed inbound iq message. No <iq> stanza: " + iq.tree());
		return;
	}

	// Add in our ever-increasing room-based id.
	iq.root().attr('id', iqid);

	if (cb)
		this.iq_callbacks[iqid] = cb;
	else
		console.log("sendIQ: MUC @" + this.roomname.split('@')[0] + " - No callback for id=" + iqid);

/*	console.log("sendIQ: MUC @" + this.roomname.split('@')[0] + " - Callback list: ");
	for (k in this.iq_callbacks)
		console.log("  CB_ID: " + k);
*/
//	console.log("sendIQ: MUC @" + this.roomname.split('@')[0] + ": SendingIQ: " + iq.tree());

	this.client.send(iq.root());
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
	this.CONF_SERVICE = "@gocastconference.video.gocast.it";
	this.SERVER = 'video.gocast.it';
	this.client = new xmpp.Client({ jid: user, password: pw, reconnect: true, host: this.SERVER, port: 5222 });
	this.roomnames = {};
	this.mucRoomObjects = {};

	this.iqnum = 0;
	this.iq_callbacks = {};

	this.roomnames["bobtestroom"] = true;
//	this.roomnames["newroom"] = true;
//	this.roomnames["other_newroom"] = true;

	var self = this;

	this.client.on('online', function() {
		// Mark ourself as online so that we can receive messages from direct clients.
		el = new xmpp.Element('presence');
		self.client.send(el);

		// Need to join all rooms in 'rooms'
		for (k in self.roomnames)
		{
			self.mucRoomObjects[k] = new mucRoom(self.client);
			self.mucRoomObjects[k].join( k + self.CONF_SERVICE, "overseer");
		}

		// Now we need to make sure we stay connected to the server. We will do this via a ping-check
		// to the server every 10 seconds. If we don't get a reply, we can decide what to do about that.
		setInterval(function() {
			console.log("pinging server...");

			var nopong = setTimeout(function() {
				console.log("ERROR: No pong received. Server connection died?");
			}, 4000);

			self.sendIQ(new xmpp.Element('iq', {to: self.SERVER, type: 'get'})
						.c('ping', {xmlns: 'urn:xmpp:ping'}), function(res) {
//							console.log("Got pong.");
							clearTimeout(nopong);
						});
		}, 10000);

	});

	this.client.on('offline', function() {
		// Clean up / remove all existing rooms in memory.
		for (k in self.roomnames)
			delete self.mucRoomObjects[k];

		console.log('Overseer went offline. Reconnection should happen automatically.');
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
			console.log("UNHANDLED: " + stanza.tree());
	});

	this.client.on('error', function(e) {
		sys.puts(e);
	});

};

overseer.prototype.sendIQ = function(iq, cb) {
	var iqid = "overseer_iqid" + this.iqnum++;
	var self = this;

	if (!iq.root().is('iq'))
	{
		console.log("overseer sendIQ - malformed inbound iq message. No <iq> stanza: " + iq.tree());
		return;
	}

	// Add in our ever-increasing room-based id.
	iq.root().attr('id', iqid);

	if (cb)
		this.iq_callbacks[iqid] = cb;
	else
		console.log("overseer sendIQ: - No callback for id=" + iqid);

/*	console.log("overseer sendIQ: - Callback list: ");
	for (k in this.iq_callbacks)
		console.log("  CB_ID: " + k);
*/
//	console.log("overseer sendIQ: SendingIQ: " + iq.tree());

	this.client.send(iq.root());
};

overseer.prototype.sendGroupMessage = function(room, msg_body) {
	var msg = new xmpp.Element('message', {to: room, type: 'groupchat'})
		.c('body').t(msg_body);

	this.client.send(msg);
};

//
// \brief Need to check the room's banned-list for this person.
//
overseer.prototype.handleMessage = function(msg) {
	// Listen to pure chat messages to the overseer.

	// Now, if we get a direct chat, it could be from a person in a room who is sending commands to
	// the overseer 'in the room' but it'll be received directly by the overseer as well.
	// So, we need to distinguish this.
	// Messages which are room-commands will come "from" "room@gocastconference.video.gocast.it/nickname"
	// while private external messages (for KNOCK especially) will come from true personal jids.
	// So, we'll look for '@gocastconference.video.gocast.it' in the string.
	if (msg.attrs.type === 'groupchat' || msg.attrs.from.indexOf(this.CONF_SERVICE) != -1)
		return;
	else
	{
//		console.log("DEBUG: InMsg: " + msg);

		if (msg.getChild('body') && msg.getChild('body').getText() && !msg.getChild('delay'))
		{
			// Now we need to split the message up and trim spaces just in case.
			var cmd = msg.getChild('body').getText().split(';');
			for (k in cmd)
				cmd[k] = cmd[k].trim();

			cmd[0] = cmd[0].toUpperCase();
			if (cmd[0] === 'KNOCK')
			{
				var fromjid = cmd[1].split(' ')[0];	// Just in case chat client does <mailto:> tag following jid.
				var fromnick = cmd[2];
				var toroom = cmd[3];
				var plea = cmd[4];

				// Format of KNOCK
				// KNOCK ; <from-jid> ; <from-nickname> ; <bare-roomname> ; [message]
				if (!fromjid || !fromnick || !toroom || !this.mucRoomObjects[toroom])
					console.log("KNOCK Invalid. No JID (" + fromjid + "), nickname (" + fromnick + "), room (" + toroom + ") or room not found:");
				else
				{
				console.log("DEBUG: Checking on ban-status for: " + fromjid);
					// We have a room by that name.
					// First, see if the jid is banned. If so, don't do anything.
					if (!this.mucRoomObjects[toroom].isBanned(fromjid))
					{
						// If they are not banned, let's send the message down...
						this.sendGroupMessage(toroom + this.CONF_SERVICE, "KNOCK ; FROM ; " + fromjid + " ; AS ; " + fromnick + " ; " + (plea ? plea : ""));
					}
					else
						console.log("KNOCK refused. JID (" + fromjid + "), is on the banned list for room (" + toroom + ")");
				}
			}
			else
				console.log("Direct message: Unknown command: " + msg.getChild('body').getText());
		}
	}
};

//
// At this level, we only want to handle presence at the server level.
// This means only listen to presence from jids with no username.
//
overseer.prototype.handlePresence = function(pres) {
	if (!pres.attrs.from.split('@'))
	{
		console.log("Got pres: " + pres);
	}
};

overseer.prototype.handleIq = function(iq) {
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
		console.log("UNHANDLED IQ: " + iq);
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

