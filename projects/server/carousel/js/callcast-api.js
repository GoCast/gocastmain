/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \file callcast-api.js
 *
 * \brief JavaScript code that implements the APIs for Gocast.it plug-in.
 *
 * \note This code reqires jQuery v1.7.2.
 *
 * \author Net-Scale Technologies, Inc.,
 *         <a href="http://www.net-scale.com">www.net-scale.com</a>\n
 *         Created May 21, 2012 (paula.muller@net-scale.com)
 *
 * Copyright (c) 2012 XVD. All rights reserved.
 */
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user joined the session.
 *        This implements the trigger "joined_session".
 */
$(document).on('joined_session', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User has successfully joined the session.");
  /*
   * Enable button activities except join. */
  $("#meeting > #streams > #scarousel #mystream > #myctrls > input#video").removeAttr('disabled');
  $("#meeting > #streams > #scarousel #mystream > #myctrls > input#audio").removeAttr('disabled');
  $("#meeting > #streams > #scontrols > input").removeAttr('disabled');
  closeWindow();
  
  return false;
}); /* joined_session() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user left the session.
 *        This implements the trigger "left_session".
 */
$(document).on('left_session', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User has successfully left the session.");
  /*
   * Remove all the objects in carousel. */
  $("#meeting > #streams > #scarousel div.cloudcarousel:not(.unoccupied)").each(function(i, e) {
    if ($(e).hasClass("typeContent")) {
      removeContentFromCarousel($(e).attr("encname"));
    }
    else {
      removePluginFromCarousel($(e).attr("encname"));
    }
  });
  /*
   * Disable button activities except join. */
  $("#meeting > #streams > #scarousel #mystream > #myctrls > input#video")
    .attr('disabled', 'disabled');
  $("#meeting > #streams > #scarousel #mystream > #myctrls > input#audio")
    .attr('disabled', 'disabled');
  $("#meeting > #streams > #scontrols > input").attr('disabled', 'disabled');
  return false;
}); /* left_session() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when room list has been updated.
 *        This implemets the trigger "roomlist_updated".
 */
$(document).on('roomlist_updated', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "The room list has been updated.");
}); /* roomlist_updated() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a new sync link is issued.
 *        This implements the trigger "synclink".
 */
$(document).on('synclink', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * Sync link. */
  link
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "A new synclink has been issued.");
}); /* synclink() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a public message arrives.
 *        This implements the trigger "public-message".
 */
$(document).on('public-message', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * Message Information Object. */
  msginfo
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var notice = msginfo.notice;
  var delayed = msginfo.delayed;
  var nick_class = msginfo.nick_class;

  /*
   * Add message to Message Board. */
  var jqMBspan = $("#meeting > #msgBoard > span");
  jqMBspan.prepend("<span></span>");
  if ($("span", jqMBspan).length > 3) {
    $("span:last-child", jqMBspan).remove();
  }
  $($("span", jqMBspan).get(0)).text("").
    html('<b>'+ decodeURI(msginfo.nick) +'</b>'+': '+
         decodeURI(msginfo.body) + " >  ");
  app.log(2, "A public message arrived.");
}); /* public-message() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a private message arrives.
 *        This implements the trigger "private-message".
 */
$(document).on('private-message', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * Message Information Object. */
  msginfo
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  openPersonalChat(msginfo);
  app.log(2, "A private message arrived.");
}); /* private-message() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a new user joined.
 *        This is implements the trigger "user_joined".
 */
$(document).on('user_joined', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * User Information Object. */
  info
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Check dimensions of wrapper div to correct for video dimensions. */
  if (info.hasVid) {
    var id = app.str2id(info.nick);
    var oo = $("#meeting > #streams > #scarousel div.#"+id).get(0);
    if (oo) {
      var w = $(oo).width() - 4;
      var s = w / Callcast.WIDTH;
      var h = Callcast.HEIGHT * s;
      info.width = w;
      info.height = h;
      app.log(2, "User dim w "+info.width+", h "+info.height);
    }
  }
  Callcast.ShowRemoteVideo(info);
  app.log(2, "A new user joined.");
}); /* user_joined() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a user update its status.
 *        This implemets the trigger "user_updated'.
 */
$(document).on('user_updated', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * User Information Object. */
  info
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Check dimensions of wrapper div to correct for video dimensions. */
  if (info.hasVid) {
    var id = app.str2id(info.nick);
    var oo = $("#meeting > #streams > #scarousel div.#"+id).get(0);
    if (oo) {
      var w = $(oo).width() - 4;
      var s = w / Callcast.WIDTH;
      var h = Callcast.HEIGHT * s;
      info.width = w;
      info.height = h;
      app.log(2, "User dim w "+info.width+", h "+info.height);
    }
  }
  Callcast.ShowRemoteVideo(info);
  app.log(2, "User updated "+info.nick+", vid on:"+info.hasVid);
}); /* user_updated() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a user left.
 *        This implements the trigger "user_left".
 */
$(document).on('user_left', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * Nickname from user who left. */
  nick
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User " + nick + " left.");
}); /* user_left() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when room creation was not allowed.
 *        This implements the trigger "room-creation-not-allowed".
 */
$(document).on('room-creation-not-allowed', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  ev,
    /**
     * Room name. */
  roomname
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(4, "The room creation was not allowed.");
  $("#errorMsgPlugin").empty();
  $("#errorMsgPlugin").append('<h1>Joining room ' + roomname+ ' failed</h1><p>Your room may not exist. Please reload and choose another room. [Ctrl + R]</p>');
  openWindow('#errorMsgPlugin');
}); /* room-creation-not-allowed() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user is connected.
 *        This implements the trigger "connected".
 */
$(document).on('connected', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User is connected.");
  /*
   * Open waiting room in case it takes too long to join. */
  openWindow("#waitingToJoin");

  $(document).trigger("one-login-complete", "XMPP GO.");		// One more login action complete.
  return false;
}); /* connected() */

$(document).on("one-login-complete", function(event, msg) {
	if (!app.numLogins)
	  app.numLogins = 0;

	if (msg)
		console.log("one-login-complete: Msg: " + msg);
	else
		console.log("one-login-complete: No Msg");
	
	app.numLogins++;

	// Once we get facebook (or skip/set-nickname) + xmpp connected, then we're ready to go to the room.
	if (app.numLogins === 2)
	{
		console.log("one-login-complete: opening meeting");
	    openMeeting();

		tryPluginInstall();
		
		handleRoomSetup();
	}

});

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user has disconnected.
 *        This implements the trigger "disconnected".
 */
$(document).on('disconnected', function (
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User has disconnected.");
  Callcast.log("Connection terminated.");
  return false;
}); /* disconnected() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that makes initializations associated to the local plugin.
 *        This makes some of the functionality from "plugin-initialized" in
 *        scrum.js
 */
function initializeLocalPlugin(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var vertext = "Plug-in Version: " + (Callcast.GetVersion() || "None");
  if (Callcast.pluginUpdateRequired()) {
    vertext += " -- Version update REQUIRED." + " Visit " +
      Callcast.PLUGIN_DOWNLOAD_URL;
    /*
     * Force user to update plugin. */
    app.log(4, "Plugin update required: " + vertext);
    $("#errorMsgPlugin").empty();
    $("#errorMsgPlugin").append('<h1>Gocast.it plugin version update required</h1><p>Please visit <a href=' + Callcast.PLUGIN_DOWNLOAD_URL + '>' + Callcast.PLUGIN_DOWNLOAD_URL + '</a> to reinstall.</p>');
    openWindow('#errorMsgPlugin');
    return false;
  }
  else if (Callcast.pluginUpdateAvailable()) {
    vertext += " -- Version update AVAILABLE." + " Visit " +
      Callcast.PLUGIN_DOWNLOAD_URL;
  }
  app.log(2, vertext);

  /*
   * Callcast Seetings. */
  Callcast.SetUseVideo(false); /* Initially set to false, user must enable. */
  app.log(2, "initializeLocalPlugin complete.");
} /* initializeLocalPlugin() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function called when other Gocast.it plugin object is created.
 */
function addPluginToCarousel(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Other user nick name. */
  nickname
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var dispname = decodeURI(nickname);
  var id = app.str2id(nickname);
  /*
   * Check next available cloudcarousel. */
  var oo = $("#meeting > #streams > #scarousel div.unoccupied").get(0);
  if (oo) {
    $(oo).attr("id", id);
    $(oo).attr("encname", nickname);
    $(oo).attr("title", dispname);
    /*
     * Get dimensions oo and scale plugin accordingly. */
    var w = Math.floor($(oo).width() - 4);
    var h = Math.floor((w / Callcast.WIDTH) * Callcast.HEIGHT);
    $(oo).append('<object id="GocastPlayer'+id+'" type="application/x-gocastplayer" width="' + w + '" height="' + h +'"></object>');
    $("div.name", oo).text(dispname);
    $(oo).removeClass("unoccupied");

    app.log(2, "Added GocastPlayer" + id + " object.");
    return $("object#GocastPlayer" + id, oo).get(0);
  }
  else {
    app.log(4, "Maximum number of participants reached.");
  }
} /* addPluginToCarousel() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function called when other Gocast.it plugin object is removed.
 */
function removePluginFromCarousel(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Other user nick name. */
  nickname
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Get parent object and modify accordingly. */
  var id = app.str2id(nickname);
  var jqOo = $('#meeting > #streams > #scarousel div.cloudcarousel#' + id + '"');
  jqOo.addClass("unoccupied");
  jqOo.removeAttr("title");
  jqOo.removeAttr("id");
  jqOo.removeAttr("encname");
  /*
   * Remove player. */
  jqOo.empty();
  /*
   * Add name placeholder. */
  jqOo.append('<div class="name"></div>');
  return false;
} /* removePluginFromCarousel() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function called when content is added to carousel.
 */
function addContentToCarousel(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Info json object with id, image, altText and url. */
  info
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var id = app.str2id(info.id);
  /*
   * Check next available cloudcarousel. */
  var oo = $("#meeting > #streams > #scarousel div.unoccupied").get(0);
  if (oo) {
    $(oo).attr("id", id);
    $(oo).attr("title", info.altText);
    $(oo).attr("alt", info.altText);
    $(oo).attr("url", info.url);
    $(oo).attr("encname", info.id);
    $(oo).css("background-image", info.image);
    $(oo).removeClass("unoccupied").addClass("typeContent");

    app.log(2, "Added Content" + id + " object.");
  }
  else {
    app.log(4, "Maximum number of participants reached.");
  }
} /* addContentToCarousel() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function called when other content from carousel is removed.
 */
function removeContentFromCarousel(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Id of content to remove. */
  infoId
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Get parent object and modify accordingly. */
  var id = app.str2id(infoId);
  var jqOo = $('#meeting > #streams > #scarousel div.cloudcarousel#' + id + '"');
  jqOo.addClass("unoccupied").removeClass("typeContent");
  jqOo.removeAttr("id");
  jqOo.removeAttr("title");
  jqOo.removeAttr("alt");
  jqOo.removeAttr("url");
  jqOo.removeAttr("encname");
  jqOo.css("background-image", 'url("images/gologo.png")');
  return false;
} /* removeContentFromCarousel() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function called when LOCAL Gocast.it plugin object is loaded.
 */
function pluginLoaded(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "Local Plugin Loaded.");
  Callcast.localplayer = $("#mystream > object.localplayer").get(0);
  Callcast.InitGocastPlayer(null, null, function(message) {
    /*
     * Initialization successful. */
    app.log(2, "Local plugin successfully initialized.");
    /*
     * Set callback functions to add and remove plugins for other
     * participants and content. */
    Callcast.setCallbackForAddPlugin(addPluginToCarousel);
    Callcast.setCallbackForRemovePlugin(removePluginFromCarousel);
    Callcast.setCallbackForAddCarouselContent(addContentToCarousel);
    Callcast.setCallbackForRemoveCarouselContent(removeContentFromCarousel);
    initializeLocalPlugin();
  }, function(message) {
    /*
     * Failure to initialize. */
    app.log(4, "Local plugin failed to initialize.");
    $("#errorMsgPlugin").empty();
    $("#errorMsgPlugin").append('<h1>Gocast.it plugin failed to initialize</h1><p>Please reload the page. [Ctrl + R]</p>');
    openWindow('#errorMsgPlugin');
  });
} /* pluginLoaded() */
