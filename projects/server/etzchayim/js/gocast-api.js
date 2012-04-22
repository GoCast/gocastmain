/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \file gocast-api.js
 *
 * \brief JavaScript code that implements the APIs for Gocast.it plug-in.
 *
 * \note This code reqires jQuery v1.7.2.
 *
 * \author Net-Scale Technologies, Inc.,
 *         <a href="http://www.net-scale.com">www.net-scale.com</a>\n
 *         Created April 15, 2012 (paula.muller@net-scale.com)
 *
 * Copyright (c) 2012 XVD. All rights reserved.
 */
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user joined the session.
 *        This is equivalent to trigger "joined_session" in scrum.js.
 */
function joinedSession(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User has successfully joined the session.");
  /*
   * Enable button activities except join. */
  $("#meeting > #mystream > #myctrls > input#video").removeAttr('disabled');
  $("#meeting > #mystream > #myctrls > input#audio").removeAttr('disabled');
  $("#meeting > #controls > input").removeAttr('disabled');
  $("#meeting > #sharingView > div > input").removeAttr('disabled');
  closeWindow();
  return false;
} /* joinedSession() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user left the session.
 *        This is equivalent to trigger "left_session" in scrum.js.
 */
function leftSession(
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
    removePluginFromCarousel($(e).attr("encname"));
  });
  /*
   * Disable button activities except join. */
  $("#meeting > #mystream > #myctrls > input#video")
    .attr('disabled', 'disabled');
  $("#meeting > #mystream > #myctrls > input#audio")
    .attr('disabled', 'disabled');
  $("#meeting > #controls > input").attr('disabled', 'disabled');
  $("#meeting > #sharingView > div > input").attr('disabled', 'disabled');
  return false;
} /* leftSession() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when room list has been updated.
 *        This is equivalent to trigger "roomlist_updated" in scrum.js.
 */
function roomListUpdate(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "The room list has been updated.");
} /* roomListUpdate() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a new sync link is issued.
 *        This is equivalent to trigger "synclink" in scrum.js.
 */
function syncLink(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Sync link. */
  link
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "A new synclink has been issued.");
  var jqTxt = $('#meeting > #sharingView > div > input[type="text"]');
  jqTxt.val(link);
  jqTxt.addClass("arrived");
  setTimeout(function() {
    jqTxt.removeClass("arrived");
  }, 2000);
  $('#meeting > #sharingView > iframe').attr("src", link);
} /* syncLink() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a public message arrives.
 *        This is equivalent to trigger "public_message" in scrum.js.
 */
function publicMessage(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
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
  $("#meeting > #msgBoard > .scrollcontainer > ul")
    .prepend('<li><span class="sender">' + decodeURI(msginfo.nick) +
             ': </span>' +
             '<span class="message">' + msginfo.body + '</span></li>');
  app.log(2, "A public message arrived.");
} /* publicMessage() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a private message arrives.
 *        This is equivalent to trigger "private_message" in scrum.js.
 */
function privateMessage(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Message Information Object. */
  msginfo
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  openPersonalChat(msginfo);
  app.log(2, "A private message arrived.");
} /* privateMessage() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a new user joined.
 *        This is equivalent to trigger "user_joined" in scrum.js.
 */
function userJoined(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * User Information Object. */
  info
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  Callcast.ShowRemoteVideo(info);
  app.log(2, "A new user joined.");
} /* userJoined() */ 



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a user update its status.
 *        This is equivalent to trigger "user_updated" in scrum.js.
 */
function userUpdated(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * User Information Object. */
  info
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  Callcast.ShowRemoteVideo(info);
  app.log(2, "User updated.");
} /* userUpdated() */ 



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a user left.
 *        This is equivalent to trigger "user_left" in scrum.js.
 */
function userLeft(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Nickname from user who left. */
  nick
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User " + nick + " left.");
} /* userLeft() */ 



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when room creation was not allowed.
 *        This is equivalent to trigger "room-creation-not-allowed" in
 *        scrum.js.
 */
function roomCreationNotAllowed(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
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
} /* roomCreationNotAllowed() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user is connected.
 *        This is equivalent to trigger "connected" in scrum.js.
 */
function connected(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User is connected.");
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
   * Proceed to connect user automatically. */
  /*
   * Open waiting room in case it takes too long to join. */
  openWindow("#waitingToJoin");
  Callcast.JoinSession(app.user.scheduleName, app.user.scheduleJid);
  return false;  
} /* connected() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user has disconnected.
 *        This is equivalent to trigger "disconnected" in scrum.js.
 */
function disconnected(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "User has disconnected.");
  Callcast.log("Connection terminated.");
  return false;
} /* disconnected() */



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
  /*
   * Callcast Seetings. */
  Callcast.SetNickname(app.user.name);
  Callcast.SetUseVideo(false); /* Initially set to false, user must enable. */
  /*
   * Connect anonymous. */
  Callcast.connect(Callcast.CALLCAST_XMPPSERVER, "");
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
    $(oo).append('<object id="GocastPlayer'+id+'" type="application/x-gocastplayer" width="128" height="96"></object>');
    $("img", oo).hide();
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
   * Add image. */
  jqOo.append(app.imgPerson.clone());
  jqOo.append('<div class="name"></div>');
  return false;
} /* removePluginFromCarousel() */



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
     * participants. */
    Callcast.setCallbackForAddPlugin(addPluginToCarousel);
    Callcast.setCallbackForRemovePlugin(removePluginFromCarousel);
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
