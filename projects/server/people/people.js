gSwitchboard = 'switchboard_gocastfriends@video.gocast.it';

$(document).ready(function () {
	 $('#add_button').click(function () {
		 var sel =  $("#fbfriends option:selected");

		 if (sel !== "")
		 {
			 $('#participant-list').empty();
	    	 alert("Ready to lookup name:" + $(sel).text() + " ; id:" + $(sel).attr('fbid'));
	    	 var msg = $msg({to: gSwitchboard, type: 'chat'})
	    	 	.c('body').t('FB_LOOKUP_JID ; ' + $(sel).attr('fbid'));

	    	 Callcast.connection.send(msg);
		 }

	 });

});

$(document).bind('connected', function () {
	console.log("Connected.");

    $('.button').removeAttr('disabled');
    $('#myjid').append(Callcast.connection.jid);

	var pres = $pres({to: 'switchboard_gocastfriends@video.gocast.it', intro_sr: globalFBSR})
		.c('x',{xmlns: 'http://jabber.org/protocol/muc'});

    // Now that we're connected, let's send our presence info to the switchboard and FB info.
    // Note - we're going to send our INTRO_SR buried in our presence.
    //        This way, the switchboard will know who we are on facebook when our presence is seen.
	Callcast.connection.send(pres);

    // Handle inbound signaling messages
});

$(document).bind('disconnected', function () {
    $('.button').attr('disabled', 'disabled');
});

AddPlugin = function(nickname) {
	// TODO - FIX - Need a truly UNIQUE adder here - not nick which can change and be replaced during the lifetime of the call.
	$("#rtcobjects").append('<div id="div_GocastPlayer'+nickname+'"><object id="GocastPlayer'+nickname+'" type="application/x-gocastplayer" width="'+Callcast.WIDTH+'" height="'+Callcast.HEIGHT+'"></object></div>');

	return $('#GocastPlayer'+nickname).get(0);
};

RemovePlugin = function(nickname) {
	$("#div_GocastPlayer"+nickname).remove();
};

function pluginLoaded() {
	console.log("Plugin loaded!");
	Callcast.InitGocastPlayer(null, null, function(message) {
		$(document).trigger('plugin-initialized');
		//
		// Setup the callbacks needed for adding and removing the plugins as they come and go.
		//
		Callcast.setCallbackForAddPlugin(AddPlugin);
		Callcast.setCallbackForRemovePlugin(RemovePlugin);

		// Connection to the xmpp server will happen AFTER Facebook login is complete.
	});
};

$(document).bind('FacebookConnected', function(ev, data) {
	console.log("FacebookConnected. Going for XMPP connection.");

	globalFBSR = data.signedRequest;
	globalFBID = data.id;

	// Need to figure out our name so we can set a nickname.
	FB.api('/me', function(me){
	  if (me.name) {
	  	console.log("On Facebook, I'm known as: " + me.name);
		Callcast.SetNickname(me.name);
	  }
	});

	FB.api("/me/friends?fields=name,picture,id", function handleFriends(response) {
//        var divInfo = document.getElementById("friendstest");

        var friends = response.data;

//        divInfo.innerHTML += "<h1>My Friends</h1>";
		if (friends.length > 0)
		{
			 $('#fbfriends select').empty();
			 $('#fbfriends select').removeAttr('disabled');
		}

        for (var i = 0; i < friends.length; i++) {
//            divInfo.innerHTML += friends[i].name + "<br />";
//            divInfo.innerHTML += "<img src=\"" + friends[i].picture + "\" /><br /><br />";
			 var optionline = '<option fbid=' + friends[i].id;

			 optionline += '>' + friends[i].name + '</option>';

			 $('#fbfriends select').append(optionline);
		}
    });

    	/* Connect anonymous. */
	Callcast.connect(Callcast.CALLCAST_XMPPSERVER, "");
});

$(window).bind('beforeunload', function() {
	Callcast.disconnect();
});

$(window).unload(function() {
// After v1.15, no need to DeInit.	  Callcast.DeInitGocastPlayer();
	  Callcast.disconnect();
	});
