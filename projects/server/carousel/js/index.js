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
 *         Created May 22, 2012 (paula.muller@net-scale.com)
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
    var ua = navigator.userAgent.toLowerCase();
    return {
      isWin: /win/.test(ua),
      isMac: /mac/.test(ua),
      isLinux64: /linux x86_64/.test(ua),
      isLinux32: /linux i686/.test(ua)
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
    fbName: null,
    scheduleName: null,
    scheduleJid: null,
    scheduleTitle: null
  }
}; /* app */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Populates carousel with demo content.
 */
function startDemoContent(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  /*
   * First content. */
  Callcast.Callback_AddCarouselContent(new Object({id:"demo1", image:"url('images/demo1-egyptmap.gif')", altText:"Egyptians vote in first free presidential election", url:"http://www.google.com/hostednews/ap/article/ALeqM5iS0-q8BzFkHp3IV4ks-5tnbKnw-Q?docId=2b6df5e5e5fd40e0a8ab49103fda20bc"}));
  /*
   * Second content delayed 1000 ms. */
  setTimeout(function() {
    Callcast.Callback_AddCarouselContent(new Object({id:"demo2", image:"url('images/demo2-robertmoog.jpg')", altText:"Robert Moog: I would not call this music.", url:"http://www.guardian.co.uk/music/2012/may/23/robert-moog-interview-google-doodle"}));
  }, 1000);
  /*
   * Third content delayed 2000 ms. */
  setTimeout(function() {
    Callcast.Callback_AddCarouselContent(new Object({id:"demo3", image:"url('images/demo3-spaceX.png')", altText:"Launch of SpaceX Falcon 9", url:"http://www.youtube.com/embed/4vkqBfv8OMM"}));
  }, 2000);
  /*
   * Fourth content delayed 3000 ms. */
  setTimeout(function() {
    Callcast.Callback_AddCarouselContent(new Object({id:"demo4", image:"url('images/demo4-bawarriorsSF.jpg')", altText:"Warriors face many hurdles in building S.F. arena", url:"http://www.sfgate.com/cgi-bin/article.cgi?f=/c/a/2012/05/23/MNM41OLT8K.DTL"}));
  }, 3000);
  /*
   * Fifth content delayed 4000 ms. */
  setTimeout(function() {
    Callcast.Callback_AddCarouselContent(new Object({id:"demo5", image:"url('images/demo5-wikipedia.jpg')", altText:"Wikipedia", url:"http://www.wikipedia.org"}));
  }, 4000);
  closeWindow();  
  return false;
} /* startDemoContent() */



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
  jqMask.fadeIn(500, activateWindow("#personalChat"));
  jqMask.fadeTo("fast", 0.3);   
  /*
   * Set message. */
  var jqWin = $("#boxes > div#personalChat");
  $("p.msg", jqWin).text("").html(decodeURI(msginfo.body));
  /*
   * Set position based on nick id. */
  var id = app.str2id(msginfo.nick);
  var jqO = $('#meeting > #streams > #scarousel div#' + id);
  var cY = jqO.offset().top;
  var cX = jqO.offset().left;
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
  if ($(cTarget).hasClass("feedback")) {
    $('span', jqWin).attr("id", "feedback").text("Feedback message:");
  }
  else if ($(cTarget).hasClass("typeContent")) {
    var url = $(cTarget).attr("url");
    window.open(url, '_blank', 'width=800,height=600');
    return false;
  }
  else {
    var recipientId = $(cTarget).attr("id");
    var recipient = $(cTarget).attr("title");
    var ename = $(cTarget).attr("encname");
    if (recipientId && recipientId.match("mystream")) {
      app.log(2, "Local player clicked, do nothing.");
      return false;
    }
    else if (recipientId) {
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
  jqMask.fadeIn(500, activateWindow("#chatInp"));
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
 * \brief Open controls window.
 */
function openCtrlsWindow(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * Event object. */
  event
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  if (event) {
    event.preventDefault();
  }
  /*
   * Transition effect mask. */
  var jqMask = $('#mask');
  jqMask.fadeIn(500, activateWindow('#controls'));
  jqMask.fadeTo("fast", 0.5);   
  /*
   * Transition effect window.*/
  var jqWin = $('#boxes #controls');
  jqWin.slideDown('slow');
  /*
   * Add class active. */
  jqWin.addClass("active");
  /*
   * Add focus to input name. */
  $("input.chatTo", jqWin).focus();
  return false;
} /* openCtrlsWindow() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Close controls window.
 */
function closeCtrlsWindow(
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
    jqActive.slideUp('slow', function() {
      /*
       * Hide mask and window. */
      $('#mask').hide();
      $('.window').hide();
    });
  }
  return false;
} /* closeCtrlsWindow() */



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
  app.log(2, "openMeeting");

  /*
   * Check user name.*/
  /*
  var usrNm = $("#credentials > input#name").val();
  if (usrNm.length < 1) {
    $("#credentials > p.error").text("Please enter your name to continue.").
      fadeIn("fast");
    return false;
  }
  app.user.name = encodeURI(usrNm);
  app.log(2, "User name:" + usrNm);
  */
  /*
   * Add encname attribute to mystream. */
  $("#meeting > #streams > #scarousel #mystream")
    .attr("encname", app.user.name);
  /*
   * Deactivate window.*/
  //deactivateWindow("#credentials");
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
  var rX = winW * 0.44; /* 50% of 88% */
  var rY = winH * 0.276; /* 40% of 69% */
  $("#scarousel").CloudCarousel(
    {
      xPos: rX*1.10,
      yPos: rY*0.68,
      xRadius: rX*0.94,
      yRadius: rY,
      buttonLeft: $("body > div#meeting > div#streams > div#scontrols > input.left"),
      buttonRight: $("body > div#meeting > div#streams > div#scontrols > input.right"),
      mouseWheel: true,
      minScale: 0.68
    }
  );
  /*
   * Initialize Gocast events. */
  $(window).on('beforeunload', function() {
    app.log(2, "On before unload.");
    Callcast.LeaveSession();
  });
  $(window).unload(function() {
    app.log(2, "On unload.");
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
      onJoinNow();
      break;
    } /* switch (event.which) */
  }
} /* keypressNameHandler() */



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
      Callcast.SendPublicChat(encodeURI(ltext));
    }
    else if (id.match("feedback")) {
      Callcast.SendFeedback(encodeURI(ltext));
    }
    else {
      var ename = jqChatSpan.attr("ename");
      Callcast.SendPrivateChat(encodeURI(ltext), ename);
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
 * \brief Keypress for Group Chat handler.
 */
function keypressGrpChatHandler(
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
      app.log(2, "Enter key pressed in group chat handler");
      event.preventDefault();
      sendGrpChat();
      break;
    } /* switch (event.which) */
  }
} /* keypressGrpChatHandler() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action send Group Chat.
 */
function sendGrpChat(
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
  var jqChatText = $('#boxes #controls > input.chatTo');
  var ltext = jqChatText.val();
  if (ltext.length < 1) {
    return false;
  }
  Callcast.SendPublicChat(encodeURI(ltext));
  app.log(2, "Sending group chat: " + ltext);
  jqChatText.val('');
  closeWindow();
} /* sendGrpChat() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action send Facebook post.
 */
function sendFacebook(
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
  alert("Posting to Facebook will be coming soon.");
  app.log(2, "Sending FB post: Not yet implemented");
  closeWindow();
} /* sendFacebook() */



/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action send Twitter message.
 */
function sendTwitter(
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
  alert("Sending message to Twitter will be coming soon.");
  app.log(2, "Sending message to Twitter: Not yet implemented");
  closeWindow();
} /* sendTwitter() */



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
  if (bVideo) {
    /*
     * Check object dimensions. */
    var jqOo = $(this).parents('#mystream');
    var w = jqOo.width() - 4;
    var h = Callcast.HEIGHT * (w / Callcast.WIDTH);
    Callcast.SendLocalVideoToPeers(new Object({width:w, height:h}));
  }
  else {
    Callcast.SendLocalVideoToPeers(bVideo);
  }
  $(this).toggleClass("on");
  if (bVideo) {
    app.log(2, "Video turned on.");
    $(this).attr("title", "Disable video");
  }
  else {
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
    $("input#btn", winId).on("click.s04072012", onJoinNow);
  }
  else if (winId.match("meeting")) {
    $('#streams > #scarousel #mystream > #myctrls > #video', winId)
      .on("click.s04172012a", changeVideo);
    $('#streams > #scarousel #mystream > #myctrls > #audio', winId)
      .on("click.s04172012b", changeAudio);

    $('#streams > #scarousel div.cloudcarousel:not("#mystream")', winId)
      .on("click.s04172012f", openChat);
  }
  else if (winId.match("chatInp")) {
    $('input.chatTo', winId).on("keydown.s04172012g", keypressChatHandler);
    $('input.send', winId).on("click.s04172012g", sendChat);
  }
  else if (winId.match("controls")) {
    $('input.chatTo', winId).on("keydown.s05222012", keypressGrpChatHandler);
    $('input.send', winId).on("click.s05222012", sendGrpChat);
    $('input.facebook', winId).on("click.s05222012a", sendFacebook);
    $('input.twitter', winId).on("click.s05222012b", sendTwitter);
    $('input.feedback', winId).on("click.s04212012e", openChat);
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
    $("input#btn", winId).off("click.s04072012", onJoinNow);
  }
  else if (winId.match("meeting")) {
    $('#streams > #scarousel #mystream > #myctrls > #video', winId)
      .off("click.s04172012a", changeVideo);
    $('#streams > #scarousel #mystream > #myctrls > #audio', winId)
      .off("click.s04172012b", changeAudio);

    $('#streams > #scarousel div.cloudcarousel:not("#mystream")', winId)
      .off("click.s04172012f", openChat);
  }
  else if (winId.match("chatInp")) {
    $('input.chatTo', winId).off("keydown.s04172012g", keypressChatHandler);
    $('input.send', winId).off("click.s04172012g", sendChat);
  }
  else if (winId.match("controls")) {
    $('input.chatTo', winId).off("keydown.s05222012", keypressGrpChatHandler);
    $('input.send', winId).off("click.s05222012", sendGrpChat);    
    $('input.facebook', winId).off("click.s05222012a", sendFacebook);
    $('input.twitter', winId).off("click.s05222012b", sendTwitter);
    $('input.feedback', winId).off("click.s04212012e", openChat);
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
   * Update window #meeting. */
  var jqW = $('#meeting');
  var meetW = jqW.width();
  var meetOff = winW/2 - meetW/2;
  jqW.css('left', meetOff);
  return false;
} /* resizeWindows() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief callback for login button press.
 */
function onJoinNow(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
    app.log(2, "onJoinNow");

    // todo move
    app.user.scheduleName = "Paulas Tests";
    app.user.scheduleJid = "paula@gocastconference.video.gocast.it";
    app.user.scheduleTitle = "Open test room";
    
    // get the nick name, return back to dialog if not defined
    var usrNm = $("#credentials > input#name").val();
    
    // user must enter fb or nick name if both not entered
    // display error
    if (usrNm.length < 1) {
      $("#credentials > p.error").text("Please enter a name to continue.").
        fadeIn("fast");
      return false;
    }
    
    // set app name from dialog text field
    app.user.name = encodeURI(usrNm);
    app.log(2, "User name:" + usrNm);
    
    // close dialog
    deactivateWindow("#credentials");

    // call one-login trigger
} /* onJoinNow() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief check login credential and display login dialog if necessary.
 */
function checkCredentials(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
    app.log(2, "checkCredentials");
    app.log(2, globalAuthResponse);

    app.user.scheduleName = "Paulas Tests";
    app.user.scheduleJid = "paula@gocastconference.video.gocast.it";
    app.user.scheduleTitle = "Open test room";
    
    // check fb login status and prompt if not logged in
    if (!globalAuthResponse)
    {
       openWindow('#credentials');
    }
    else // fb logged in todo update fb logged in status instead of tryPluginInstall
    {
      $(document).trigger("tryPluginInstall")
    }
} /* checkCredentials() */

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief check if plugin installed and prompt user if not
 */
function tryPluginInstall(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
{
  app.log(2, "tryPluginInstall");
  /*
   * check plugin installed. */
  if (app.pluginInstalled()) {
    /*
     * Close buttons. */
    $('.window .close').on("click", closeWindow);
    /*
     * Resize window. */
    $(window).resize(resizeWindows);
    
    openMeeting();
  }
  else {
    /*
     * Alert user to download and install the plugin. */
    if (app.osPlatform.isWin) {
      $("#errorMsgPlugin > p > a#dlLink").attr("href","javascript:closeWindow();openWindow('#winEula');void(null);");
    }
    else if (app.osPlatform.isMac) {
      $("#errorMsgPlugin > p > a#dlLink").attr("href","https://video.gocast.it/downloads/GoCastPlayer.pkg");
    }
    else if (app.osPlatform.isLinux64 || app.osPlatform.isLinux32) {
      $("#errorMsgPlugin").css("height", 300);
      if (app.osPlatform.isLinux64) {
        $("#errorMsgPlugin > p > a#dlLink").attr("href","https://video.gocast.it/downloads/GoCastPlayer_x86_64.tar.gz");
      }
      else {
        $("#errorMsgPlugin > p > a#dlLink").attr("href","https://video.gocast.it/downloads/GoCastPlayer_i686.tar.gz");
      }
      $("#errorMsgPlugin > p > a#dlLink").parent().find("span").addClass("hidden");
      $("#errorMsgPlugin > .linuxExplanation").removeClass("hidden");
    }
    else {
      $("#errorMsgPlugin > p > a#dlLink").parent().text("We are sorry. We couldn't identify your OS.")
    }
    openWindow('#errorMsgPlugin');
  }
} /* tryPluginInstall() */

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

  $(document).bind('checkCredentials', checkCredentials);
  $(document).bind('tryPluginInstall', tryPluginInstall);

  fbInit(); // init facebook api
    
  /*
   * Write greeting into console. */
  app.log(2, "Page loaded.");  
}); /* $(document).ready(function()) */
