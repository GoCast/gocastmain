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

/*jslint sloppy: false, todo: true, white: true, browser: true, devel: true */
/*global Callcast, app */
// index.js methods
/*global  closeWindow,
          removeContentFromCarousel,
          removePluginFromCarousel,
          openPersonalChat,
          openWindow,
          openMeeting,
          tryPluginInstall,
          loadVideo,
          checkForPluginOptionalUpgrades,
          handleRoomSetup,
          carouselItemUnzoom,
          showPersonalChatWithSpot,
          onEffectApplied,
          promptTour
*/
'use strict';

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user joined the session.
 *        This implements the trigger "joined_session".
 */
$(document).on('joined_session', function(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, 'User has successfully joined the session.');
  $('#upper-left > #roomname > h3').html('Welcome to ' + $.roomcode.decipherroomname($.urlvars.g || $.urlvars.roomname) + '!');
  /*
   * Enable button activities except join. */
  app.enableButtons(true);
  closeWindow();
  promptTour();

  return false;
}); /* joined_session() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user left the session.
 *        This implements the trigger "left_session".
 */
$(document).on('left_session', function(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, 'User has successfully left the session.');
  /*
   * Remove all the objects in carousel. */
  $('#meeting > #streams > #scarousel div.cloudcarousel:not(.unoccupied)').each(function(i, e) {
    if ($(e).hasClass('typeContent')) {
      //removeContentFromCarousel($(e).attr('id'));
      removeSpotCb({spotnumber: $(e).attr('spotnumber')});
      app.carousel.createSpot();
    }
    else {
      removePluginFromCarousel($(e).attr('encname'));
    }
  });
  /*
   * Disable button activities except join. */
  app.enableButtons(false);
  return false;
}); /* left_session() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when room list has been updated.
 *        This implemets the trigger "roomlist_updated".
 */
$(document).on('roomlist_updated', function(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, 'The room list has been updated.');
}); /* roomlist_updated() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a new sync link is issued.
 *        This implements the trigger "synclink".
 */
$(document).on('synclink', function(
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
  app.log(2, 'A new synclink has been issued.');
}); /* synclink() */

///
/// \brief Function that modifies the DOM when a public message arrives.
///        This implements the trigger "public-message".
///
$(document).on('public-message', function(
  ev, // Event object.
  msginfo // Message Information Object.
)
{
  try
  {
    var jqChat = $(app.GROUP_CHAT_OUT),
        util,
        item,
        name;
    if (!jqChat[0]) {throw "no chat out div";}
    util = jqChat.data('util');
    if (!util) {throw "no chat util";}
    item = app.carousel.getByNick(msginfo.nick);
    if (!item)
    {
      name = decodeURI(msginfo.nick);
    }
    else
    {
      name = item.chatName;
    }
    util.addMsg(name, decodeURI(msginfo.body));
    if ($(app.GROUP_CHAT_SHOW).is(":visible"))
    {
      $(app.GROUP_CHAT_SHOW).effect("pulsate", { times:5 }, 5 * 2000);
    }
//    console.log('A public message arrived ' + decodeURI(msginfo.nick) + " " + decodeURI(msginfo.body));
  }
  catch(err)
  {
    app.log(4, "public-message err" + err);
  }
}); // public-message()

///
/// \brief Function that modifies the DOM when a private message arrives.
///        This implements the trigger "private-message".
$(document).on('private-message', function(
  ev, // event
  msginfo // * Message Information Object. */
)
{
  try
  {
    var id, oo, jqChat, atBottom, msgNumber, span, util, item;
    app.log(2, 'A private message arrived.');
    id = app.str2id(msginfo.nick);
    oo = $('#meeting > #streams > #scarousel div.cloudcarousel#' + id).get(0);
    if (oo)
    {
      showPersonalChatWithSpot(oo);
      jqChat = $("#msgBoard > #chatOut", oo);
      console.log("jqChat", jqChat);
      if (!jqChat[0]) {throw "no chat out div";}
      util = jqChat.data('util');
      if (!util) {throw "no chat util";}
      item = app.carousel.getByNick(msginfo.nick);
      if (!util) {throw "no item by name " + msginfo.nick;}
      util.addMsg(item.chatName.split('/')[0], decodeURI(msginfo.body));
    }
    else // spot not found
    {
      app.log(4, "private-message error message to " + msginfo.nick + " doesn't have a spot");
    }
  } catch (err) {
    app.log(4, "private-message exception " + err);
  }
}); // private-message()

///
/// extract spot info from info object
/// and set participant info
/// the image participant property is in css format url(<url>)
///
function setSpotInfo(info)
{
    if (info && info.nick && info.nick !== Callcast.nick)
    {
       var spot = Callcast.participants[info.nick];
       if (spot)
       {
          if (info.image)
          {
             spot.image = 'url(' + info.image + ')';
          }
          else // use the default bg image
          {
             spot.image = 'url(images/person.png)';
          }

          console.log('setSpotInfo', info, spot);
       }
       else
       {
         app.log(4, "setSpotInfo " + info.nick + " not in participants list");
       }
       app.log(2, 'setSpotInfo nick ' + info.nick + ' image ' + info.image);
    }
}

///
/// set the carousel video based on the callcast participant state
/// for an occupied spot
///
function setCarouselItemState(info)
{
  var id, oo, w, s, h, image;
  try
  {
    if (!info)      {throw "info is not defined";}
    if (!info.nick) {throw "info.nick is not defined";}
    id = app.str2id(info.nick);
    oo = $('#meeting > #streams > #scarousel div.cloudcarousel#' + id).get(0);
    if (oo)
    {  // item found
       // Check dimensions of wrapper div to correct for video dimensions.
       if (info.hasVid) {
           w = $(oo).width() - 4;
           s = w / Callcast.WIDTH;
           h = Callcast.HEIGHT * s;
           info.width = w;
           info.height = h;
           app.log(2, 'setCarouselItemState video on user ' + info.nick + ' dim w ' + info.width + ', h ' + info.height);
           $(oo).removeClass('videooff').css('background-image', ''); // remove any background image
           Callcast.ShowRemoteVideo(info);
       }
       else // if hasVid is null or false turn video off
       {
          info.hasVid = false;
          image = Callcast.participants[info.nick].image;
          $(oo).addClass('videooff').css('background-image', image);
          Callcast.ShowRemoteVideo(info);
          app.log(2, 'setCarouselItemState video off user ' + info.nick + ' image ' + info.image);
       }
    }
    else if (info.nick === Callcast.nick) {
      console.log('setCarouselItemState video changed for local user ', info);
      app.carousel.updateAll();
    }
    else
    {
      app.log(3, "setCarouselItemState item for " + info.nick + " not found");
    }
  }
  catch (err)
  {
    console.log('setCarouselItemState exception', err);
  }
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a new user joined.
 *        This is implements the trigger "user_joined".
 */
$(document).on('user_joined', function(
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
  // get nickname and find carousel item
  // carousel item for this user was created in addplugin...
  app.log(2, 'A new user ' + info.nick + ' joined.');
  setSpotInfo(info); // set the item data
  setCarouselItemState(info); // set the carousel video state
}); /* user_joined() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a user update its status.
 *        This implemets the trigger "user_updated'.
 */
$(document).on('user_updated', function(
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
  // get nickname and find carousel item
  // carousel item for this user was created in addplugin...
  app.log(2, 'user ' + info.nick + ' updated.');
  setSpotInfo(info); // set the item data
  setCarouselItemState(info); // set the carousel video state
}); /* user_updated() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when a user left.
 *        This implements the trigger "user_left".
 */
$(document).on('user_left', function(
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
  app.log(2, 'User ' + nick + ' left.');
}); /* user_left() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when room creation was not allowed.
 *        This implements the trigger "room-creation-not-allowed".
 */
$(document).on('room-creation-not-allowed', function(
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
  closeWindow();
  app.log(4, 'The room creation was not allowed.');
  $('#errorMsgPlugin > h1').text('Joining room ' + roomname + ' failed');
  $('#errorMsgPlugin > p#prompt').text('Your room may not exist. Please reload and choose another room.');
  openWindow('#errorMsgPlugin');
}); /* room-creation-not-allowed() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user is connected.
 *        This implements the trigger "connected".
 */
$(document).on('connected', function(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, 'User is connected.');
  app.xmppLoggedIn = true;
  checkCredentials2();

  if (!app.loggedInAll()) {
    $(document).trigger('one-login-complete', 'XMPP GO.');    // One more login action complete.
  }

  return false;
}); /* connected() */

$(document).on('one-login-complete', function(event, msg) {
  if (msg) {
    app.log(2, 'one-login-complete: Msg: ' + msg);
  }
  else {
    app.log(2, 'one-login-complete: No Msg');
  }

  if (app.loggedInAll())
  {
    app.log(2, 'one-login-complete: opening meeting');
    handleRoomSetup();
  }
});

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function that modifies the DOM when user has disconnected.
 *        This implements the trigger "disconnected".
 */
$(document).on('disconnected', function(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (app.authfail) {
    app.authfail = false;
    checkCredentials(null, 'Bad email or password.');
    return;
  }

  Callcast.log('Connection terminated.');
  app.log(4, "SENDLOG_DISCONNECTED: disconnected");
  app.userLoggedIn = false;
  $('#errorMsgPlugin > h1').text('We got disconnected!');
  $('#errorMsgPlugin > p#prompt').text('Please click on the send log button, and after its done, reenter the room.');
  closeWindow();
  openWindow('#errorMsgPlugin');
  $('#errorMsgPlugin > #reload').text('Re-enter room').removeAttr('onclick').unbind('click').click(function() {
    $(this).text('Reload').unbind('click').click(errMsgReloadClick);
    checkCredentials();
  });

  $('#errorMsgPlugin > #sendLog').unbind('click').click(function() {
    $(this).attr('disabled', 'disabled');
    $('#errorMsgPlugin > #reload').attr('disabled', 'disabled');
    $('#errorMsgPlugin > p#prompt').text('Sending log to GoCast...');

    var logger = new GoCastJS.SendLogsXMPP(Callcast.room, Callcast.nick,
                                           Callcast.LOGCATCHER,
                                           Callcast.CALLCAST_XMPPSERVER, '',
                                           function() {
      $('#errorMsgPlugin > p#prompt').text('Sending log to GoCast... DONE.');
      $('#errorMsgPlugin > #reload').removeAttr('disabled');
    }, function() {
      $('#errorMsgPlugin > p#prompt').text('Sending log to GoCast... FAILED.');
      $('#errorMsgPlugin > #reload').removeAttr('disabled');
    });
  });

  return false;
}); /* disconnected() */

function assignSpotForParticipant(nickname, shownNickname) {
  var dispname = decodeURI(shownNickname),
      id = app.str2id(nickname),
      w, h, jqOo, oo, item;

  if (!nickname) {
    app.log(4, "assignSpotForParticipant: nickname undefined");
    return;
  }

  // check if nickname already in carousel
  jqOo = $('#meeting > #streams > #scarousel div.cloudcarousel#'+ id);
  if (jqOo.length > 0) {
    app.log(4, "assignSpotForParticipant: nickname [" + nickname + "] already in carousel");
    alert("assignSpotForParticipant: nickname [" + nickname + "] already in carousel");
    return;
  }

  // Check next available cloudcarousel
  oo = $('#meeting > #streams > #scarousel div.unoccupied').get(0);

  // if we're out of spots add one
  if (!oo) {
    oo = app.carousel.createSpot();
  }

  if (oo) {
    $(oo).attr('id', id).attr('encname', nickname).attr('title', dispname);
    $('div.name', oo).text(dispname);
    $(oo).removeClass('unoccupied');
    $("#showChat", oo).css("display", "block"); // display showChat button

    // set spot item name
    item = $(oo).data('item');
    if (!item) {throw "item is not defined";}
    app.carousel.setSpotName(item, nickname);
    app.carousel.updateAll();
  } else {
    app.log(4, 'assignSpotForParticipant: Maximum number of participants reached.');
  }
}

function addPluginForParticipant(nickname, shownNickname) {
  var id = app.str2id(nickname),
      oo = $('#meeting > #streams > #scarousel div.cloudcarousel#'+ id).get(0),
      w=1, h=1, playerhtml = '<object id="GocastPlayer' + id + '" type="application/x-gocastplayer" width="' + w +
                             '" height="' + h + '"></object>';

  if ($.urlvars.wrtcable) {
    playerhtml = '<video id="GocastPlayer' + id + '" width="' + w + '" height="' + h + '" autoplay></video>';
  }

  if (!nickname) {
    app.log(4, "addPluginForParticipant: nickname undefined");
    return;
  }

  if (!oo) {
    AssignSpotForParticipant(nickname, shownNickname);
    oo = $('#meeting > #streams > #scarousel div.cloudcarousel#'+ id).get(0);
  }

  if (oo) {
    $(oo).attr('spotnumber', id)
         .append(playerhtml);
    app.log(2, 'Added GocastPlayer' + id + ' object.');
    app.carousel.updateAll();
    return $(($.urlvars.wrtcable ? 'video' : 'object') + '#GocastPlayer' + id, oo).get(0);
  }

  app.log(4, 'addPluginForParticipant: Spot for participant [' + nickname + '] not found.');
  return null;
}

function removePluginForParticipant(nickname) {
  if (nickname) {
    try {
      var id = app.str2id(nickname),
          oo = $('#meeting > #streams > #scarousel div.cloudcarousel#' + id).get(0), poo;

      if (oo) {
        poo = $(($.urlvars.wrtcable ? 'video' : 'object') + '#GocastPlayer' + id, oo).get(0);
        console.log('removePluginForParticipant: Plugin = ', poo);
        if (poo) {
          oo.removeChild(poo);
        }
      }
    } catch (e) {
      console.log('removePluginForParticipant: ', e);
      app.log(4, 'removePluginForParticipant: ' + e);
    }
  }
}

function unassignSpotForParticipant(nickname) {
  if (nickname) {
    try {
      var id = app.str2id(nickname),
          oo = $('#meeting > #streams > #scarousel div.cloudcarousel#' + id).get(0);

      removePluginForParticipant(nickname);
      if (oo) {
        $(oo).removeClass('selected').find('div.bringtofront.front').removeClass('front');
        $(oo).addClass('unoccupied');
        $(oo).removeAttr('title');
        $(oo).removeAttr('id');
        $(oo).removeAttr('encname');
        $('div.name', oo).text('');
        $('#msgBoard', oo).css('display', 'none');
        $('#showChat', oo).css('display', 'none');
        $(oo).css('background-image', 'url("images/GoToken.png")');
      }
    } catch (e) {
      app.log(4, 'unassignSpotForParticipant: ', e);
    }
  }
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
///
/// \brief Function called when other Gocast.it plugin object is removed.
/// \arg nickname remote user name
///
function removePluginFromCarousel(nickname)
{
  if (nickname) // this method gets called for local user and nickname is null
                // so stop here if nickname is null
  {
    try
    {
      app.log(2, "removePluginFromCarousel nickname " + nickname);
      // Get parent object and modify accordingly.
      var id = app.str2id(nickname),
          jqOo = $('#meeting > #streams > #scarousel div.cloudcarousel#' + id),
      //    jqUR = $('#upper-right', jqOo),
          item = $(jqOo).data('item');
      // todo this method is called for all occupied spots
      // fix to call only for spot with id
      if (jqOo.length !== 1) {return;}
      if (!item) {throw "item not found";}
      jqOo.addClass('unoccupied');
      jqOo.removeAttr('title');
      jqOo.removeAttr('id');
      jqOo.removeAttr('encname');
      //jqUR.attr("class", app.spotUrDefaultClass)
      //    .attr("src", app.spotUrDefaultImage);

      // Remove player.
      // todo hack, have to empty div , remove doesn't work
      //var foo = $('object', jqOo);
      //jqOo.remove('object');
      jqOo.empty();
      // put back things that should not have been removed
      jqOo.append('<div class="name"></div>');
      jqOo.css('background-image', 'url("images/GoToken.png")'); // reset background image
      item.addControls();
    }
    catch (err)
    {
       app.log(4, "removePluginFromCarousel exception " + err);
    }
  }
  return false;
} // removePluginFromCarousel()

///
/// \brief remove and re-instantiate local plugin
///
/// the local plugin is instantiated in index.html
///
/*
function reloadLocalPlugin()
{
  try
  {
    // Get parent object and modify accordingly.
    var jqDiv = $('#meeting > #streams > #scarousel div.cloudcarousel#mystream');
    if (jqDiv.length != 1) return;
    if (!item) throw "item not found";
    // Remove plugin
    // todo hack, have to empty div , remove doesn't work
    //var foo = $('object', jqDiv);
    //jqDiv.remove('object');
    jqDiv.empty();
    // instantiate the plugin
    jqOo.append('<object class="localplayer" id="GocastPlayerLocal" type="application/x-gocastplayer" width="0" height="0"><param name="onload" value="pluginLoaded" /></object>');
  }
  catch (err)
  {
     app.log(4, "reloadLocalPlugin exception " + err);
  }
} // reloadLocalPlugin
*/
///
/// \brief get info from url
/// \param url target url
/// \return JSON object with info:
///    title header title tag
///    type  mime type
///
function getUrlInfo(options, callback)
{
  $.ajax(
  {
    url      : options.proxyUrl,          //customizable
    data     : {xhr2: false, url: options.webUrl},  //customizable
    cache    : true,
    dataType : "jsonp",
    success  : function(response)
        {
           var result = (/<title>(.*?)<\/title>/m).exec(response), // jslint waiver
               info = {},
               title;
           if (result)
           {
               title = result[1];
               info.title = title;
           }
           callback(info);
        }
    });
}

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
  app.log(2, 'addContentToCarousel ' + info.id);
  console.log('info', info);

  // info.id is an encoded name, get an id from it to use to index
  // into carousel items
  var id = app.str2id(info.id),
      oo = $('#meeting > #streams > #scarousel div.unoccupied').get(0),
      divIcon, divTitle;
  if (!oo) // if we're out of spots add one
  {
    oo = app.carousel.createSpot();
    app.carousel.updateAll();
  }
  if (oo) {
    $(oo).attr('id', id);
    $(oo).attr('title', info.altText);
    $(oo).attr('alt', info.altText);
    $(oo).attr('url', info.url);
    $(oo).attr('encname', info.id);
    $(oo).removeClass('unoccupied').addClass('typeContent');

    // use the image in info if supplied
    // else generate one from the url
    if (info.image)
    {
       $(oo).css('background-image', info.image);
    }
    else // gen image from url
    {
       getUrlInfo(
       {
         webUrl: info.url,
         proxyUrl: 'http://carousel.gocast.it/proxy'
       },
       function(urlInfo)
       {
          // remove the spot background
          $(oo).css('background-image', '');
          // create a child div with url info for spot
          divIcon = $('<div class="spotUrlIcon"/>');
          // hot link to http://getfavicon.appspot.com/ to get favicon
          $(divIcon).css('background-image', 'url(http://g.etfv.co/' + info.url + ')');

          divTitle = $('<div class="spotUrlTitle"/>');
          // add title
          if (urlInfo.title)
          {
             $(divTitle).append($('<p>' + urlInfo.title + '</p>'));
          }
          else
          {
             $(divTitle).append($('<p>' + info.url + '</p>'));
          }
          $(oo).append('<div class="urlPad"/>');
          $(oo).append(divIcon);
          $(oo).append(divTitle);
       });
    }
    app.log(2, 'Added Content' + id + ' object.');
  }
  else {
    app.log(4, 'Maximum number of participants reached.');
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
  var id = infoId,
      jqOo = $('#meeting > #streams > #scarousel div.cloudcarousel#' + id);
  jqOo.addClass('unoccupied').removeClass('typeContent');
  jqOo.removeAttr('id');
  jqOo.removeAttr('title');
  jqOo.removeAttr('alt');
  jqOo.removeAttr('url');
  jqOo.removeAttr('encname');
  jqOo.css('background-image', 'url("images/GoToken.png")');
  app.log(2, 'Removing content from spot [' + infoId + ', ' + jqOo.attr('spotnumber') + ']');
  return false;
} /* removeContentFromCarousel() */

///
/// \brief perform action defined in info to spot
///
/// the possible actions so far
/// are defined in info.spottype and can be
/// "youtube" play a youtube video
/// "url" display the url image in the spot and add a link to open
/// "new" add an empty spot (does nothing here)
/// "whiteBoard" add or update the whiteboard in the spot
///
function doSpot(spotDiv, info)
{
  try
  {
    var divIcon, divTitle,
        jqDiv = $(spotDiv),
        whiteBoard, editor,
        wiki, fshare, deskshare;
//    console.log('doSpot', info);
//    console.log('spotDiv', spotDiv);
    if (!spotDiv) {throw "no spotDiv";}
    if (!info || !info.spottype) {throw "spottype not defined";}
    if (info.spottype === 'youtube')
    {
      console.log('doSpot youtube');
      loadVideo(spotDiv, info);
    }
    else if (info.spottype === 'whiteBoard')
    {
      if (info.cmdtype === "addspot") // set spot attr's for new whiteboard
      {
        jqDiv.attr('id', app.str2id('whiteBoard' + info.spotnumber));
        jqDiv.attr('title', 'whiteBoard');
        jqDiv.attr('alt', 'whiteBoard');
        jqDiv.attr('encname', 'whiteBoard');
        jqDiv.attr('spotnumber', info.spotnumber);
        jqDiv.removeClass('unoccupied').addClass('typeContent whiteBoard');
        whiteBoard = new GoCastJS.WhiteBoard(spotDiv, info);
      }
      else // get existing whiteboard
      {
        whiteBoard = $("#wbCanvas", spotDiv).data("wb");
      }

      if (whiteBoard) // play any commands in info
      {
        whiteBoard.doCommands(info);
      }
      else // error, couldn't find wb
      {
        console.log("whiteBoardCommand error, can't find wb", info);
        throw "can't find whiteboard for spot " + info.spotnumber;
      }
    }
    else if (info.spottype === 'editor')
    {
      if (info.cmdtype === "addspot")
      {
        jqDiv.attr('id', app.str2id('editor ' + info.spotnumber));
        jqDiv.attr('title', 'editor');
        jqDiv.attr('alt', 'editor');
        jqDiv.attr('encname', 'editor');
        jqDiv.attr('spotnumber', info.spotnumber);
        jqDiv.removeClass('unoccupied').addClass('typeContent editor');
        editor = new GoCastJS.gcEdit(spotDiv, info);
      }
      else
      {
        editor = jqDiv.data('gcEdit');
      }
      if (editor)
      {
        editor.doSpot(info);
      }
    }
    else if (info.spottype === 'fileshare') {
      if (info.cmdtype === 'addspot') {
        jqDiv.attr('id', app.str2id('fileshare ' + info.spotnumber));
        jqDiv.attr('title', 'FileShare');
        jqDiv.attr('alt', 'FileShare');
        jqDiv.attr('encname', 'fileshare');
        jqDiv.attr('spotnumber', info.spotnumber);
        jqDiv.removeClass('unoccupied').addClass('typeContent fileshare');
        fshare = new GoCastJS.gcFileShare(spotDiv, info);
      } else {
        fshare = jqDiv.data('gcFileShare');
      }

      if (fshare) {
        fshare.doSpot(info);
      }
    }
    else if (info.spottype === 'wiki') {
      if (info.cmdtype === 'addspot') {
        jqDiv.attr('id', app.str2id('wiki ' + info.spotnumber));
        jqDiv.attr('title', 'Wikipedia');
        jqDiv.attr('alt', 'Wikipedia');
        jqDiv.attr('encname', 'wiki');
        jqDiv.attr('spotnumber', info.spotnumber);
        jqDiv.removeClass('unoccupied').addClass('typeContent wiki');
        wiki = new GoCastJS.WikiBrowser(spotDiv, info);
      } else {
        wiki = jqDiv.data('wiki');
      }

      if (wiki) {
        wiki.doSpot(info);
      }
    }
    else if (info.spottype === 'deskshare') {
      if (info.cmdtype === 'addspot') {
        jqDiv.attr('id', app.str2id('deskshare ' + info.spotnumber));
        jqDiv.attr('title', 'DeskShare');
        jqDiv.attr('alt', 'DeskShare');
        jqDiv.attr('encname', 'deskshare');
        jqDiv.attr('spotnumber', info.spotnumber);
        jqDiv.removeClass('unoccupied').addClass('typeContent deskshare');
        deskshare = new GoCastJS.gcDeskShare(spotDiv, info);
      } else {
        deskshare = jqDiv.data('gcDeskShare');
      }

      if (deskshare) {
        deskshare.doSpot(info);
      }      
    }
    else if (info.spottype === 'url')
    {
      jqDiv.attr('id', app.str2id(info.spotdivid));
      jqDiv.attr('title', info.spotdivid);
      jqDiv.attr('alt', info.spotdivid);
      jqDiv.attr('url', info.spoturl);
      jqDiv.attr('encname', info.spotdivid);
      jqDiv.removeClass('unoccupied').addClass('typeContent');

      // use the image in info if supplied
      // else generate one from the url
      if (info.spotimage)
      {
         jqDiv.css('background-image', info.spotimage);
      }
      else
      {
        // was get url info but that feature was ripped
        app.log(4, "no image for url spot");
      }
    }
    // ... other spot commands
  } catch(err) {
    app.log(4, "doSpot error " + err);
  }
} // doSpot
///
/// \brief get a spot for an addSpot operation by info.spotreplace
///        info
///         |- spotreplace replace an existing spot
///         |  |- exact replace spot at info.spotindex or first unoc if exact is occupied or new spot
///         |  |- first-unoc replace first unoccupied spot or new spot
///         |  |- last-unoc replace last unoccupied spot or new spot
/// \throw
///
function getSpotForAdd(info)
{
  var divs = $('#meeting > #streams > #scarousel div.unoccupied'),
      item;
  if (info.spotreplace === 'exact') // replace spot at spotindex
  {
    item = app.carousel.getByIndex(info.spotindex);
    if (!item) // item not there, probably was deleted, choose first-unoc
    {
      if (divs.length > 0)
      {
        return divs.get(0);
      }
      else // no unoc spots, create one
      {
        return app.carousel.createSpot(info);
      }
    }
    else if ($(item.object).hasClass("unoccupied")) // spot is there and unoccupied
    {
      return item.object;
    }
    else if (divs.length > 0) // item is there and occupied get an unoc div
    {
      return divs.get(0);
    }
    else // no unoc spots, create one
    {
      return app.carousel.createSpot(info);
    }
  }
  else if (info.spotreplace === 'first-unoc') // replace first unoc spot
  {
    if (divs.length > 0)
    {
      return divs.get(0);
    }
    else // no unoc spots, create one
    {
      return app.carousel.createSpot(info);
    }
  }
  else if (info.spotreplace === 'last-unoc') // replace last unoccupied spot
  {
    if (divs.length > 0)
    {
      return divs.get(divs.length - 1);
    }
    else // no unoc spots, create one
    {
      return app.carousel.createSpot(info);
    }
  }
  else
  {
    throw "getSpotForAdd unknown spotreplace command " + info.spotreplace;
  }
} // getSpotForAdd
///
/// \brief addspot callback add a new spot or replace an unoccupied spot
///        depending on info contents
///        info
///         |- spotreplace replace an existing spot
///         |  |- exact replace spot at info.spotindex, spot must be unoccupied
///         |  |- first-unoc replace first unoccupied spot
///         |  |- last-unoc replace last unoccupied spot
///         |- spotnodup stop spot add if spot with id already exists
///         |- spotdivid spot id fo test spot existence
///         |- spotnumber incoming spot address from server
///         |- spotindex carousel spot index set at origin if spot does not have number
///
/// a spot may be created if there are no unoccupied spots or the spot with spotindex was deleted
///
function addSpotCb(info)
{
  try
  {
    var spotDiv, // the desired spot to be replaced or added
       item,
       div, divs;
//    console.log('addSpot msg received id ' + info.spotdivid + ' #' + info.spotnumber, info);
    // determine cmd type, add or replace

    // Changed behavior - always assume first-unoc if none given.
    info.spotreplace = info.spotreplace || 'first-unoc';

    // if there is a nodup prop == 1 and spot with spotId exists
    // don't replace
    if (info.spotnodup && info.spotnodup === 1 && info.spotdivid)
    {
       div = $('#meeting > #streams > #scarousel #' + info.spotdivid);
       if (div.length > 0)
       {
          return; // spot with id exists so we're done
       }
    }
    spotDiv = getSpotForAdd(info);
    if (!spotDiv) {throw "couldn't get spot for addSpot";}
    item = $(spotDiv).data('item');
    if (!item) {throw "couldn't get item for addSpot";}
    app.carousel.setSpotNumber(item, info.spotnumber);

    // set the item spot number to info.spotnumber
    doSpot(spotDiv, info);
    app.carousel.updateAll(); // redraw carousel
  } catch(err) {
    app.log(4, "Error addSpotCb exception " + err);
  }
}

///
/// \brief setspot callback, get spot by spotnumber and call doSpot on it
///
function setSpotCb(info)
{
//  console.log('setSpot msg received', info);
  var spotDiv, // the desired spot to be replaced or added
      item = app.carousel.getByspotnumber(info.spotnumber); // the item at spotnumber

  // for setSpot there must be an item in the carousel with info.spotnumber
  if (!item)
  {
    // try zoomed spot
    item = $('#meeting > #zoom > .cloudcarousel').data('item');
  }
  if (!item)
  {
    app.log(4, "spot with number " + info.spotnumber + " does not exist");
  }
  else
  {
    doSpot(item.object, info);
    app.carousel.updateAll(); // redraw carousel
  }
}

///
/// \brief removespot callback forward to carousel
///
function removeSpotCb(info)
{
  try
  {
    var item = app.carousel.getByspotnumber(info.spotnumber),
        spot = parseInt(info.spotnumber, 10),
        zoomedSpot, zoomedItem;
    console.log('removeSpot msg received id ' + info.spotdivid + ' #' + info.spotnumber + " index " + info.spotindex, info);
    // find the spot
    if (!item) // item by spot number is not in carousel
    {
      // try zoomed spot
      zoomedSpot = $('#meeting > #zoom > .cloudcarousel');
      if (zoomedSpot.length === 1)
      {
        zoomedItem = $(zoomedSpot).data('item');
        if (zoomedItem.spotnumber) // zoomed spot has spotnumber
        {
          if (zoomedItem.spotnumber === info.spotnumber)
          {
            item = zoomedItem;
          }
        }
        else if (zoomedItem.index === info.spotnumber)
        {
          item = zoomedItem;
        }
        // unzoom
        if (item)
        {
          carouselItemUnzoom();
        }
      }
    }

    if (!item) // get by index
    {
      item = app.carousel.getByIndex(spot);
    }
    if (item)
    {
      $(item.object).remove();
      app.carousel.remove(item.index);
      app.carousel.updateAll();
    }
    else
    {
      app.log(4, 'item ' + info.spotnumber + ' not found');
      console.log('info', info);
    }
  } catch(err) {
    console.log("removeSpotCb exception " + err);
  }
}
///
/// \brief connection status handler
///
function connectionStatus(statusStr)
{
  app.log(2, 'connectionStatus: ' + statusStr);
  $("#connection-status").text(statusStr);

  if (/bad/.test(statusStr.toLowerCase())) {
    app.authfail = true;
  } else if (/failed/.test(statusStr.toLowerCase())) {
    // conn fail
  }
}

///
/// \brief peer connection status handler
///
/// todo use css and background image instead of setting image source
///
function readyStateCb(state, jid, nick)
{
  try {
    // find spot by nick
    var id = app.str2id(nick),
        jqOo = $('#meeting > #streams > #scarousel div.cloudcarousel#' + id),
        participant;

    console.log("readyStateCb", state, jid, nick);

    if (jqOo.length > 0) {
      if (state === 'connected') {
        participant = Callcast.participants[nick];
        if (!participant) {throw "participant " + nick + " not found";}
        if (!participant.image) {throw "participant image for " + nick + " not found";}
        console.log("participant", participant);
        $('object, video', jqOo).css('visibility', 'visible');
        // Make the background image always your image or 'chess piece'.
        jqOo.css('background-image', participant.image);
        app.carousel.updateAll();
      }
      else if (state === 'defunct') {
        jqOo.css("background-image", 'url("images/warning.png")');
        if (!app.defunctAlertShown && !app.defunctAlertShowing) {
          app.defunctAlertShowing = true;
          showWarning('Media Connection Problem',
                      'We were unable to connect you with one or more participants through video. ' +
                      'You can still chat with everyone in the room, and also use the notepad and the whiteboard. ' +
                      'The connectivity problem might be due to firewall issues. If you have your firewall turned on, ' +
                      'you can temporarily disable it and then reload the page to try connecting again. ');
          app.defunctAlertShown = true;
        }
      }
      else {
        jqOo.css("background-image", 'url("images/waiting-trans.gif")');
        $('object, video', jqOo).css('visibility', 'hidden');
      }
    }

  } catch (err) {
    app.log(4, "readyStateCb exception " + err);
  }
}

///
/// \brief show local speaker status
///
function setLocalSpeakerStatus(vol)
{
  // set image based on volume
  var img, div = $("div#volume");
  console.log("speaker volume " + vol);
  if (vol <= 0) // mute, if vol == -1 display mute symbol since sound's probably not getting out or in
  {
     img = 'url("images/volume-muted.png")';
  }
  else if (vol < 255/3)
  {
     img = 'url("images/volume-low.png")';
  }
  else if (vol < 2*255/3)
  {
     img = 'url("images/volume-medium.png")';
  }
  else
  {
     img = 'url("images/volume-high.png")';
  }
  div.css("background-image", img);

  // display volume warning
  /* turn off volume prompt
  if (app.volWarningDisplayed === false)             // check volume only on first callback
  {
    if(("undefined" === typeof(Storage) || window.localStorage.stopVolumeStatus !== "checked") && // and if user has not disabled the check
      (vol < 255*0.07) )                             // if vol is below threshold
    {
      $(app.STATUS_PROMPT).css("display", "block");  // display warning
    }
    app.volWarningDisplayed = true;
  }
  */
}
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Function called when LOCAL Gocast.it plugin object is loaded.
 */
function pluginLoaded(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
     /* No arguments. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var lplayersel = '#mystream > ' + ($.urlvars.wrtcable ? 'video' : 'object') + '.localplayer',
      permissionTimer = null, permblinkTimer = null, $meeting = $('body > div#meeting');
  //app.log(2, 'pluginLoaded Local Plugin Loaded.');
  if (Callcast.localplayerLoaded)
  {
     app.log(2, 'pluginLoaded Callcast.localplayerLoaded - plugin is already loaded');
     return; // assume player is already loaded if localPlayer is not null
  }

  //app.simPluginLoadFailed = true;
  if (app.simPluginLoadFailed) {
    app.log(2, 'simulating plugin load failed...');
    return;
  }

  Callcast.localplayerLoaded = true;
  Callcast.localplayer = $(lplayersel).get(0);

  app.log(2, 'pluginLoaded checking plugin update required');
  if (!Callcast.pluginUpdateRequired()) // do not access plugin api if it needs to be upgraded
  {
     app.log(2, 'pluginLoaded plugin up to date ');
     GoCastJS.PluginLog(Callcast.localplayer, Callcast.PluginLogCallback);

     // set callback for oneffectapplied
     Callcast.setCallbackForCallback_OnEffectApplied(function(effect) {
      onEffectApplied(effect);
     });

     // set localPlayer to null since Init... checks for it to be null
     // before it will proceed
     Callcast.localplayer = null;
     Callcast.InitGocastPlayer(lplayersel, function(message)
     {
        if ($.urlvars.wrtcable) {
          if (permblinkTimer) {
            clearTimeout(permblinkTimer);
            $meeting.removeClass('permission');
          }
          if (permissionTimer) {
            clearTimeout(permissionTimer);
          }
        }

        app.log(2, 'Local plugin successfully initialized.');
        // Set callback functions to add and remove plugins for other
        // participants and content.
        //Callcast.setCallbackForAddPlugin(addPluginToCarousel);
        //Callcast.setCallbackForRemovePlugin(removePluginFromCarousel);
        Callcast.setCallbackForAddPluginToParticipant(addPluginForParticipant);
        Callcast.setCallbackForRemovePluginFromParticipant(removePluginForParticipant);
        Callcast.setCallbackForAddCarouselContent(addContentToCarousel);
        Callcast.setCallbackForRemoveCarouselContent(removeContentFromCarousel);
        Callcast.setCallbackForAddSpot(addSpotCb);
        Callcast.setCallbackForSetSpot(setSpotCb);
        Callcast.setCallbackForRemoveSpot(removeSpotCb);
        Callcast.setCallbackForReadyState(readyStateCb);

        // Callcast Seetings.
        // todo there's an app member for video state, merge it with callcast video state
        // Callcast.SetUseVideo(false); // Initially set to false, user must enable.

        checkForPluginOptionalUpgrades(); // display upgrade button if there are optional upgrades

        // set the speaker volume status callback
        GoCastJS.SetSpkVolListener(4000, Callcast.localplayer, setLocalSpeakerStatus);

        // <MANJESH>
        // set plugin crash monitor
        var crashCheck = GoCastJS.SetPluginCrashMonitor(
          1000, $('#mystream > object.localplayer').get(0),
          function() {
            clearInterval(crashCheck);
            app.pluginCrashed();
          }
        );

        // set devices changed listener
/*        var firstCall = true;
        GoCastJS.SetDevicesChangedListener(
          1000, $('#mystream > object.localplayer').get(0),
          function(va, vr, aia, air, aoa, aor) {
            app.promptDevicesChanged(va.length || aia.length || aoa.length, firstCall);
            if (firstCall) {
              firstCall = false;
            }
          }
        );
*/

        //Before we handle room setup, prompt first time users
        //to set up their camera and microphone if they not on MacOS.
        if ('undefined' !== typeof(Storage)) {
          if(window.localStorage && !window.localStorage.gcpsettings &&
             !app.osPlatform.isMac && !$.urlvars.wrtcable) {
            if(confirm('First time user... wanna setup cam and mic?')) {
              window.location.href = 'gcpsettings';
            }
          }
        }
        // </MANJESH>
        if ($.urlvars.wrtcable || app.winTimeout) {
          clearTimeout(app.winTimeout);
          app.winTimeout = null;
          $(document).trigger('checkCredentials');
        }
     }, function(message) {
        // Failure to initialize.
        app.log(4, 'Failed to initialize user media [' + message + ']');
        Callcast.SendLiveLog('Failed to initialize user media.');
        $('#errorMsgPlugin > h1').text('Failed to access camera & microphone');
        $('#errorMsgPlugin > p#prompt').text('Please reload the page.');
        closeWindow();
        openWindow('#errorMsgPlugin');
     });

      if ($.urlvars.wrtcable) {
        permissionTimer = setTimeout(function blinkpermission() {
          $meeting.toggleClass('permission');
          permblinkTimer = setTimeout(blinkpermission, 1000);
        }, 0);
      }
  }
  else // pluginLoaded but out of date
  {
     //Callcast.SendLiveLog('Plugin upgrade available. Current version: ' + Callcast.GetVersion());
     app.log(2, 'Plugin upgrade available. Current version: ' + Callcast.GetVersion());
     app.pluginUpgrade = true;
  }

  app.pluginLoaded = true;
} /* pluginLoaded() */
