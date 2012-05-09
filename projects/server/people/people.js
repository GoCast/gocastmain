
$(document).ready(function () {

});

$(document).bind('connected', function () {
    $('.button').removeAttr('disabled');

    $('#myjid').append(Peek.connection.jid);

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
	console.log("FacebookConnected bind: ", data);

	/* Connect anonymous. */
	Callcast.connect(Callcast.CALLCAST_XMPPSERVER, "");
});

$(window).bind('beforeunload', function() {
	alert("bind beforeunload");
	Callcast.disconnect();
});

$(window).unload(function() {
// After v1.15, no need to DeInit.	  Callcast.DeInitGocastPlayer();
	  Callcast.disconnect();
	});
