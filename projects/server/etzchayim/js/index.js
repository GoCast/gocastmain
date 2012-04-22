/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \file index.js
 *
 * \brief JavaScript code for Gocast.it plug-in.
 *
 * \note This code reqires jQuery v1.7.2.
 *
 * \author Net-Scale Technologies, Inc.,
 *         <a href="http://www.net-scale.com">www.net-scale.com</a>\n
 *         Created April 7, 2012 (paula.muller@net-scale.com)
 *
 * Copyright (c) 2012 XVD. All rights reserved.
 */
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/



/* global variables and objects */
/*++++++++++++++++++++++++++++++*/
/**
 * \brief The main application object.
 */
var app = {
  /**
   * URL path to xml directory. */
  xmlDir: "xml",  
  /**
   * Writes the specified log entry into the console HTML element, if
   * present. The meaning of logLevel is 1: debug, 2: info, 3:
   * warning, 4: error, 5: fatal. */
  log: function(logLevel, logMsg) {
    var labels = ["", "DEBUG", "INFO", "WARNING", "ERROR", "FATAL"];
    var now = new Date();
    var logText = now.toTimeString().split(" ")[0] + " " +
      labels[logLevel] + " " + logMsg;
    if (window.console) {
      console[["","log","info","warn","error","error"][logLevel]](logText);
    }
    /*
     * For fatal errors pop-up an alert in addition to the console log
     * entry but do it only once, to avoid flooding the user with alerts. */
    if (logLevel >= 5 && !app.logFatalReported) {
      var msg = "FATAL ERROR\n\n" + logMsg;
      alert(msg);
      app.logFatalReported = true;
    }
  }, /* app.log() */
  /**
   * Flag to remember if a fatal error was reported through a pop-up
   * alert previously so we can avoid pop-up flooding. */
  logFatalReported: false,
  /**
   * The browser object returned by getBrowser(). */
  browser: undefined,
  /**
   * Get the description of the browser and returns the browser object. */
  getBrowser: function() {
    var reVersion = new RegExp("(Chrome|Firefox|Mobile Safari|Safari)/" +
                               "([0-9]+).([0-9]+)", 'g');
    var matches = reVersion.exec(navigator.userAgent);
    if (!matches) {
      reVersion = new RegExp("(AppleWebKit)/([0-9]+).([0-9]+)", 'g');
      matches = reVersion.exec(navigator.userAgent);
    }
    app.browser = new Object();
    if (matches && matches[1]) {
      app.browser.name = matches[1];
    }
    if (matches && matches[2]) {
      app.browser.version = parseInt(matches[2]) || 0;
    }
    if (matches && matches[3]) {
      app.browser.subversion = parseInt(matches[3]) || 0;
    }
  }, /* app.getBrowser() */
  /**
   * Check correct browser version. */
  checkBrowser: function() {
    var expl = "Because this application uses advanced HTML5 features " +
      "it may not work correctly with this browser.";
    var recom = "Recommended browsers are Firefox 6+, Chrome 12+, and " +
      "Mobile Safari 525+.";
    var msg = undefined;
    switch (app.browser.name) {
    case "Chrome":
      if (app.browser.version < 12) {
        msg = "You appear to be using a Chrome version before 12. " +
          expl + " " + recom;
      }
      break;
    case "Firefox":
      if (app.browser.version < 6) {
        msg = "You appear to be using a Firefox version befor 6. " +
          expl + " " + recom;
      }
      break;
    case "Safari":
      if (app.browser.version < 525) {
        msg = "You appear to be using an older Safari version. " +
          expl + " " + recom;
      }
      break;
    case "Mobile Safari":
    case "AppleWebKit":
      if (app.browser.version < 525) {
        msg = "You appear to be using an older Mobile Safari version. " +
          expl + " " + recom;
      }
      break;
    default:
      msg = "We don't recognize your browser. " + expl + " " + recom;
      break;
    } /* switch (app.browser.name) */
    if (msg) {
      alert(msg);
    }    
  }, /* app.checkBrowser() */
  /**
   * The OS platform. */
  osPlatform: (function(){
    var ua = navigator.platform.toLowerCase();
    return {
      isWin: /win/.test(ua),
      isMac: /mac/.test(ua),
      isLinux: /linux/.test(ua),      
    };
  }()),
  /**
   * Calculate number from string. */
  str2id: function(str) {
    var nn = 0;
    for (var i = 0; i < str.length; i++) {
      nn += str.charCodeAt(i);
    };
    return nn;
  }, /* app.str2id() */
  /**
   * Check if gocast.it plugin is installed. */
  pluginInstalled: function() {
    var rtnFlag = false;
    $(navigator.plugins).each(function(i, e) {
      $(e).each(function(ii, ee) {
        if (ee.type &&
            ee.type.match("application/x-gocastplayer")) {
          rtnFlag = true;
          return rtnFlag;
        }
      });
    });
    return rtnFlag;
  }, /* app.pluginInstalled() */
  /*
   * User Information. */
  user: {
    name: null,
    scheduleName: null,
    scheduleJid: null
  },
  /*
   * Image Person. */
  imgPerson: $('<img src="images/person.png" />')
}; /* app */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Open Personal Chat.
 */
function openPersonalChat(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Message Information Object. */
  msginfo
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Transition effect. */
  var jqMask = $('#mask');
  jqMask.fadeIn(500, activateWindow("chatInp"));
  jqMask.fadeTo("fast", 0.3);	
  /*
   * Set content. */
  var jqWin = $("#boxes > div#personalChat");
  $("div.content > h1.title").text(decodeURI(msginfo.nick) + " wrote you...");
  $("div.content > p.msg").text(msginfo.body);
  /*
   * Transition effect for Personal Chat Window.*/
  jqWin.fadeIn(700);
  /*
   * Add class active. */
  jqWin.addClass("active");
  return false;
} /* openPersonalChat() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Open Chat Input.
 */
function openChat(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (!event) {
    return false;
  }
  event.preventDefault();
  var cTarget, cX, cY;
  var jqWin = $("#boxes > div#chatInp");
  /*
   * Get target. */
  cTarget = event.currentTarget;
  if ($(cTarget).hasClass("group")) {
    $('span', jqWin).attr("id", "group").text("Message to Group:");
  }
  else if ($(cTarget).hasClass("feedback")) {
    $('span', jqWin).attr("id", "feedback").text("Feedback message:");
  }
  else {
    var recipientId = $(cTarget).attr("id");
    var recipient = $(cTarget).attr("title");
    var ename = $(cTarget).attr("encname");
    if (recipientId) {
      $('span', jqWin).attr("id", recipientId).attr("ename", ename)
        .text("Message to " + recipient + ":");
    }
    else {
      return false;
    }
  }
  /*
   * Click position. */
  cX = event.clientX;
  cY = event.clientY;
  /*
   * Transition effect. */
  var jqMask = $('#mask');
  jqMask.fadeIn(500, activateWindow("chatInp"));
  jqMask.fadeTo("fast", 0.3);	
  /*
   * Position chat Inp. */
  var winW = $(window).width();
  var winH = $(window).height();
  var wcW = jqWin.outerWidth();
  var wcH = jqWin.outerHeight();
  if ((cY + wcH) > winH) {
    jqWin.css("top", winH - wcH);
  }
  else {
    jqWin.css("top", cY);
  }
  if ((cX + wcW) > winW) {
    jqWin.css("left", winW - wcW);
  }
  else {
    jqWin.css("left", cX);
  }
  /*
   * Activate window. */
  activateWindow("#chatInp");
  /*
   * Transition effect for Chat Input Window.*/
  jqWin.fadeIn(700);
  /*
   * Add class active. */
  jqWin.addClass("active");
  /*
   * Add focus to input text. */
  $("input.chatTo", jqWin).focus();
  return false;
} /* openChat() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Open meeting room.
 */
function openMeeting(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Check user name.*/
  var usrNm = $("#credentials > input#name").val();
  if (usrNm.length < 1) {
    $("#credentials > p.error").text("Please enter your name to continue.").
      fadeIn("fast");
    return false;
  }
  app.user.name = encodeURI(usrNm);
  app.log(2, "User name:" + usrNm);
  /*
   * Deactivate window.*/
  deactivateWindow("#credentials");
  /*
   * Get window height and width. */
  var winH = $(window).height();
  var winW = $(window).width();
  /*
   * Set #meeting height and width to fill the whole screen. */
  var jqWin = $('#meeting');
  jqWin.css({'width':winW,'height':winH}); 
  /*
   * Initialize carousel. */
  var rX = winW * 0.415; /* Half of 84% */
  var rY = winH * 0.152; /* 40% of 38% */
  $("#scarousel").CloudCarousel(
    {
      reflHeight: 0,
      reflGap: 0,
      xPos: rX,
      yPos: rY*0.52,
      xRadius: rX,
      yRadius: rY*0.625,
      buttonLeft: $("body > div#meeting > div#controls > input.left"),
      buttonRight: $("body > div#meeting > div#controls > input.right"),
      mouseWheel: true,
      minScale: 0.68
    }
  );
  /*
   * Initialize Gocast events. */
  $(window).on('beforeunload', function() {
    Callcast.disconnect();
  });
  $(window).unload(function() {
    Callcast.disconnect();
  });
  /*
   * Activate meeting window. */
  activateWindow("#meeting");
 /*
   * Hide window. */
  $('.window').hide();
  /*
   * Transition effect. */
  $('#schedules').hide();
  $('#mask').fadeOut(500);
  jqWin.fadeIn(1000);
  return false;
} /* openMeeting() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Keypress for name handler.
 */
function keypressNameHandler(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Remove any message. */
  $("#credentials > p.error").hide().text("");
  /*
   * We have no action for key press combinations with the Alt key. */
  if (event.altKey) {
    return;
  }
  /*
   * Plain key presses (no Alt or Ctrl key combinations). */
  if (!event.ctrlKey) {
    switch (event.which || event.keyCode) {
    case 13:                            /* 'Enter key' */
      app.log(2, "Enter key pressed");
      event.preventDefault();
      openMeeting();
      break;
    } /* switch (event.which) */
  }
} /* keypressNameHandler() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Keypress for syncLink handler.
 */
function keypressSyncLinkHandler(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * We have no action for key press combinations with the Alt key. */
  if (event.altKey) {
    return;
  }
  /*
   * Plain key presses (no Alt or Ctrl key combinations). */
  if (!event.ctrlKey) {
    switch (event.which || event.keyCode) {
    case 13:                            /* 'Enter key' */
      app.log(2, "Enter key pressed in sync link");
      event.preventDefault();
      sendingSyncLink();
      break;
    } /* switch (event.which) */
  }
} /* keypressSyncLinkHandler() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action sending SyncLink.
 */
function sendingSyncLink(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (event) {
    event.preventDefault();
  }
  var ltext = $('#meeting > #sharingView > div > input[type="text"]').val();
  if (ltext.length < 1) {
    return false;
  }
  Callcast.SendSyncLink(ltext);
  $('#meeting > #sharingView > iframe').attr("src", ltext);
  app.log(2, "Sending sync link");
} /* sendingSyncLink() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Keypress for Chat handler.
 */
function keypressChatHandler(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * We have no action for key press combinations with the Alt key. */
  if (event.altKey) {
    return;
  }
  /*
   * Plain key presses (no Alt or Ctrl key combinations). */
  if (!event.ctrlKey) {
    switch (event.which || event.keyCode) {
    case 13:                            /* 'Enter key' */
      app.log(2, "Enter key pressed in chat handler");
      event.preventDefault();
      sendChat();
      break;
    } /* switch (event.which) */
  }
} /* keypressChatHandler() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action send Chat.
 */
function sendChat(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (event) {
    event.preventDefault();
  }
  var jqChatText = $('#chatInp > input.chatTo');
  var ltext = jqChatText.val();
  if (ltext.length < 1) {
    return false;
  }
  var jqChatSpan = $('#chatInp > span');
  var id = jqChatSpan.attr("id");
  if (id.length < 1) {
    app.log(4, "Error in chat, no id.");
  }
  else {
    if (id.match("group")) {
      Callcast.SendPublicChat(ltext);
    }
    else if (id.match("feedback")) {
      Callcast.SendFeedback(ltext);
    }
    else {
      var ename = jqChatSpan.attr("ename");
      Callcast.SendPrivateChat(ltext, ename);
    }
    app.log(2, "Sending chat to " + id);
    jqChatSpan.removeAttr("id");
    jqChatSpan.removeAttr("ename");
  }
  jqChatText.val('');
  closeWindow();
} /* sendChat() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action change Video.
 */
function changeVideo(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var bVideo = $(this).hasClass("on");
  Callcast.SendLocalVideoToPeers(bVideo);
  $(this).toggleClass("on");
  if (bVideo) {
    $("#meeting > #mystream > img").hide();
    app.log(2, "Video turned on.");
    $(this).attr("title", "Disable video");
  }
  else {
    $("#meeting > #mystream > img").show();
    app.log(2, "Video turned off.");
    $(this).attr("title", "Enable video");
  }
  return false;
} /* changeVideo() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action change Audio.
 */
function changeAudio(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var bMuteAudio = $(this).hasClass("off");
  Callcast.MuteLocalVoice(bMuteAudio);
  $(this).toggleClass("off");
  if (bMuteAudio) {
    app.log(2, "Audio muted.");
    $(this).attr("title", "Unmute audio");
  }
  else {
    app.log(2, "Audio unmuted.");
    $(this).attr("title", "Mute audio");
  }
  return false;
} /* changeAudio() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Add event listeners to opened window.
 *
 *        Auxiliary function to customize features in different windows,
 *        and keep the open and close of modal window common.
 */
function activateWindow(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Window Id with #. */
  winId
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (winId.match("credentials")) {
    $("input#name", winId).on("keydown.s04072012", keypressNameHandler);
    $("input#btn", winId).on("click.s04072012", openMeeting);
  }
  else if (winId.match("meeting")) {
    $('#sharingView > div > input[type="text"]', winId)
      .on("keydown.s04172012", keypressSyncLinkHandler);
    $('#sharingView > div > input[type="button"]', winId)
      .on("click.s04172012", sendingSyncLink);

    $('#mystream > #myctrls > #video', winId)
      .on("click.s04172012a", changeVideo);
    $('#mystream > #myctrls > #audio', winId)
      .on("click.s04172012b", changeAudio);

    $('#controls > input.group', winId).on("click.s04172012e", openChat);
    $('#controls > input.feedback', winId).on("click.s04212012e", openChat);

    $('#streams > #scarousel div.cloudcarousel', winId)
      .on("click.s04172012f", openChat);
  }
  else if (winId.match("chatInp")) {
    $('input.chatTo', winId).on("keydown.s04172012g", keypressChatHandler);
    $('input.send', winId).on("click.s04172012g", sendChat);
  }
  return false;
} /* activateWindow() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Remove event listeners to opened window.
 *
 *        Auxiliary function to customize features in different windows,
 *        and keep the open and close of modal window common.
 */
function deactivateWindow(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Window Id with #. */
  winId
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (winId.match("credentials")) {
    /*
     * Remove any message. */
    $("p.error", winId).hide().text("");
    $("input#name", winId).off("keydown.s04072012", keypressNameHandler);
    $("input#btn", winId).off("click.s04072012", openMeeting);
  }
  else if (winId.match("meeting")) {
    $('#sharingView > div > input[type="text"]', winId)
      .off("keydown.s04172012", keypressSyncLinkHandler);
    $('#sharingView > div > input[type="button"]', winId)
      .off("click.s04172012", sendingSyncLink);

    $('#mystream > #myctrls > #video', winId)
      .off("click.s04172012a", changeVideo);
    $('#mystream > #myctrls > #audio', winId)
      .off("click.s04172012b", changeAudio);

    $('#controls > input.group', winId).off("click.s04172012e", openChat);
    $('#controls > input.feedback', winId).off("click.s04212012e", openChat);

    $('#streams > #scarousel div.cloudcarousel', winId)
      .off("click.s04172012f", openChat);
  }
  else if (winId.match("chatInp")) {
    $('input.chatTo', winId).off("keydown.s04172012g", keypressChatHandler);
    $('input.send', winId).off("click.s04172012g", sendChat);
  }
  return false;
} /* deactivateWindow() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Open modal window.
 */
function openWindow(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Window Id with #. */
  winId
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Get window height and width. */
  var winH = $(window).height();
  var winW = $(window).width();
  /*
   * Set mask height and width to fill the whole screen. */
  var jqMask = $('#mask');
  jqMask.css({'width':winW,'height':winH});
  /*
   * Transition effect. */
  jqMask.fadeIn(1000, activateWindow(winId));
  jqMask.fadeTo("slow",0.8);	
  /*
   * Center window. */
  var jqWin = $(winId);
  jqWin.css('top',  winH/2 - jqWin.height()/2);
  jqWin.css('left', winW/2 - jqWin.width()/2);
  /*
   * Transition effect.*/
  jqWin.fadeIn(2000);
  /*
   * Add class active. */
  jqWin.addClass("active");
  /*
   * Add focus to input name. */
  $("input#name", jqWin).focus();
  return false;
} /* openWindow() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Close modal window.
 */
function closeWindow(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (event) {
    event.preventDefault();
  }
  /*
   * Get active window. */
  var jqActive = $('.window.active')
  if (jqActive[0]) {
    /*
     * Remove class active and call deactivate function. */
    jqActive.removeClass("active");
    deactivateWindow('#' + jqActive.attr("id"));
  }
  /*
   * Hide mask and window. */
  $('#mask').hide();
  $('.window').hide();
  return false;
} /* closeWindow() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Resize windows.
 */
function resizeWindows(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Get the window height and width. */
  var winH = $(window).height();
  var winW = $(window).width();
  /*
   * Set mask height and width to fill the whole screen. */
  $('#mask').css({'width':winW,'height':winH});
  /*
   * Update resizable windows. */
  $('#boxes .window.resizable').each(function(i, e) {
    $(e).css('top',  winH/2 - $(e).height()/2);
    $(e).css('left', winW/2 - $(e).width()/2);
  });
  /*
   * Update windows #meeting and #schedules. */
  var jqW = $('#schedules');
  jqW.css('left', winW/2 - jqW.width()/2);
  jqW = $('#meeting');
  var meetW = jqW.width();
  var meetOff = winW/2 - meetW/2;
  jqW.css('left', meetOff);
  return false;
} /* resizeWindows() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Add schedules to the DOM.
 */
function addSchedules(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * XML document. */
  xml
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  var jqUL = $('body > #schedules > #container > #cbottom > .block > .scrollcontainer > ul');
  $('schedules > room', xml).each(function(i, e) {
    jqUL.append('<li><span class="date">' + $(e).attr("date") + ' - ' +
                $(e).attr("time") + '</span><span class="title">' +
                '<a href="javascript:app.user.scheduleName=' + "'" +
                $(e).attr("name") + "'" + ';app.user.scheduleJid=' + "'" +
                $(e).attr("jid") + "'" + ';openWindow(' +
                "'#credentials'" + ');void(null);">' +
                $(e).attr("title") + '</a></span></li>');
  });
  app.log(2, "Added schedules.");
} /* addSchedules() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief The document ready event handler.
 *
 * This event handler is called right after the DOM finishes loading.
 */
$(document).ready(function(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * The event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * Check the browser. */
  app.getBrowser();
  app.checkBrowser();
  /*
   * Update window #schedules. */
  var jqW = $('#schedules');
  jqW.css('left', $(window).width()/2 - jqW.width()/2);
  /*
   * check plugin installed. */
  if (app.pluginInstalled()) {
    /*
     * Close buttons. */
    $('.window .close').on("click", closeWindow);
    /*
     * Resize window. */
    $(window).resize(resizeWindows);
    /*
     * Load schedules. */
    $.ajax({
      url: app.xmlDir + "/schedules.xml",
      type: "POST",             /* to avoid browser cache we don't use GET */
      global: false,
      error: function(xhr, textStatus, errorThrown) {
        app.log(4, "Schedules request: " + textStatus + ": " + xhr.status +
               " (" + app.xmlDir + "/schedules.xml)");
        $('body > #schedules > #container > #cbottom > .block > .scrollcontainer > ul')
          .append('<li><span class="title">We are sorry. An error occurred' +
                  ' while retrieving the schedules.<br/>Please try again ' +
                  'later. Thanks.</span></li>');
      },
      success: function(document, textStatus, xhr) {
        app.log(2, "Schedules request: " + textStatus + ": " + xhr.status +
                " (" + app.xmlDir + "/schedules.xml)");
        addSchedules(document);
      }, /* success() */
      complete: function(xhr, textStatus) {
        app.log(2,  textStatus + ": Schedules request complete.");
      }      
    }); /* $.ajax(): configuration schedules */
  }
  else {
    /*
     * Alert user to download and install the plugin. */
    if (app.osPlatform.isWin) {
      $("#errorMsgPlugin > p > a#dlLink").attr("href","javascript:closeWindow();openWindow('#winEula');void(null);");
    }
    else if (app.osPlatform.isMac) {
      $("#errorMsgPlugin > p > a#dlLink").attr("href","GoCastPlayer.pkg");
    }
    else if (app.osPlatform.isLinux) {
      $("#errorMsgPlugin > p > a#dlLink").parent().text("The plugin for Linux will be available shortly.");
    }
    else {
      $("#errorMsgPlugin > p > a#dlLink").parent().text("We are sorry. We couldn't identify your OS.")
    }
    openWindow('#errorMsgPlugin');
  }
  /*
   * Write greeting into console. */
  app.log(2, "Schedules page loaded.");  
}); /* $(document).ready(function()) */
