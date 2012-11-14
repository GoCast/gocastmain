/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief initialize facebook api.
 */

/*jslint browser: true, devel: true */
/*global FB, app */

'use strict';

var fbLog = '';
var globalFB = {};

function getFBLog() { return fbLog; }
var GoCastJS = GoCastJS || {};

GoCastJS.FB = function() {
  this.ClearPermissions();
};

//
// \brief - If a permission item is not yet granted, ask the user for it via Facebook login/auth.
// \param permsToRequest - an array of strings which are permission names (like: create_event).
//            Can also be a string of comma-separated (no spaces) permissions like 'xmpp_login,create_event'
//
// \note WARNING - only send a SINGLE permission to request at this time.
GoCastJS.FB.prototype.RequestAdditionalPermissions = function(permsToRequest, cbSuccess, cbFailure) {
  var appid = 458515917498757,
      self = this;

    console.log('FB: RequestAdditionalPermissions: permsToRequest: ', permsToRequest);
    FB.login(function(response) {
      self.GetPermissions(function() {
        // Now that we have a full set of permissions, let's iterate over the requested ones.
        var arrperms = permsToRequest.split(','),
            i, len = arrperms.length;

        // iterate through all inbound requested permissions and see that they ALL were granted.
        for (i = 0; i < len; i += 1) {
          if (self.perms[arrperms[i]] !== 1) {
            cbFailure();
            return;   // Bail out at the first failed permission.
          }
        }

        cbSuccess();
      });
//      console.log('REQUEST RESPONSE: ', response);

    }, { scope: permsToRequest.toString() });
};

//
// \brief Figure out if we have permission for a particular item.
//        Callback 'cb' with a true or false.
//        Will go GetPermissions() if there are none in memory yet.
//
GoCastJS.FB.prototype.HasPermissionFor = function(single_perm, cb) {
  if (!this.perms) {
    this.GetPermissions(function(result) {
      cb(this.perms[single_perm] === 1);
    });
  }
  else {
    cb(this.perms[single_perm] === 1);
  }
};

GoCastJS.FB.prototype.ClearPermissions = function() {
  this.perms = {};
};

//
// \brief - Used in order to keep track of what permissions the user has actually
//          given to our app since some of them are optional.
//          This should be called upon initial login and anytime authorization tokens
//          are changed as this could indicate a change in those permissions.
//
GoCastJS.FB.prototype.GetPermissions = function(cbSuccess, cbFailure) {
  var self = this;

   FB.api('/me/permissions', function(response) {
      var permsArray = response.data[0];

      console.log('DEBUG: permissions: ', permsArray);

      self.perms = permsArray;

      if (cbSuccess) {
        cbSuccess(permsArray);
      }
/*      var permsToPrompt = [];
      for (var i in permsNeeded) {
        if (permsArray[permsNeeded[i]] == null) {
          permsToPrompt.push(permsNeeded[i]);
        }
      }

      if (permsToPrompt.length > 0) {
        alert('Need to re-prompt user for permissions: ' +
          permsToPrompt.join(','));
        promptForPerms(permsToPrompt);
      } else {
        alert('No need to prompt for any permissions');
      } */
   });
};
//
// \brief Use FB.api to create an event. start_time and options.end_time can be in ISO format already
//      or they can be of type Date() and will be converted for you.
// \param options - object for fb.api - fields: description, location, privacy_type/privacy (SECRET, FRIENDS, OPEN)
// \note This does not allow inviting invitees. You'll need to use cbSuccess and the ID to invite attendees via InviteToEvent()
//
GoCastJS.FB.prototype.CreateEvent = function(eventName, start_time, options, cbSuccess, cbFailure) {
  var evopts = options || {},
      self = this;

  evopts.name = eventName;

  if (evopts.privacy) {
    evopts.privacy_type = evopts.privacy;
  }
  else if (evopts.privacy_type) {
    evopts.privacy = evopts.privacy_type;
  }

  if (start_time instanceof Date) {
    evopts.start_time = start_time.toISOString();
  }

  if (evopts.end_time instanceof Date) {
    evopts.end_time = evopts.end_time.toISOString();
  }

  evopts.description = evopts.description || ('Join me at GoCast in room: ' + $.getUrlVar('roomname'));

  evopts.location = evopts.location || window.location.href;

  // If one is not set...set one...
  evopts.picture = evopts.picture || 'http://www.gocast.it/images/gologo.png';

  FB.api('/me/events', 'POST', evopts, function(evreturn) {
    if (evreturn.error) {
/*      if (evreturn.error.code === 290) {
        self.RequestAdditionalPermissions('create_event');
        return;
      }
*/

      if (cbFailure) {
        cbFailure(evreturn.error);
      }
      else {
        console.log('ERROR: CreateEvent: ' + JSON.stringify(evreturn.error));
      }
    }
    else {
      if (cbSuccess) {
        cbSuccess(evreturn);
      }
      else {
        console.log('SUCCESS: CreateEvent: ' + JSON.stringify(evreturn));
      }
    }
  });
};

//
// \brief InviteToEvent - uses an existing event id (id) to invite a list (array) of
//        invitees (invitees).
// \param id - string or integer given back from FB for event ID.
// \param invitees - array of string or integer facebook IDs -- **NOT** names.
//
GoCastJS.FB.prototype.InviteToEvent = function(id, invitees, cbSuccess, cbFailure) {
  if (!id || !invitees) {
    if (cbFailure) {
      cbFailure('Must provide id and invitees.');
    }
    return false;
  }

  FB.api('/' + id + '/invited?users=' + invitees.toString(), 'POST', function(invreturn) {
    if (invreturn.error) {
      if (cbFailure) {
        cbFailure(invreturn.error);
      }
      else {
        console.log('ERROR: InviteToEvent: ' + JSON.stringify(invreturn.error));
      }
    }
    else {
      if (cbSuccess) {
        cbSuccess(invreturn);
      }
      else {
        console.log('SUCCESS: InviteToEvent: ' + JSON.stringify(invreturn));
      }
    }
  });
};

function fbMe(response) // facebook response object
{
   app.log(2, 'FB logged IN or got a new token.');
   fbLog += 'in fbMe() - FB logged IN or got a new token.\n';
   //
   // NOTE: These two represent the keys to the kingdom. The signed response and the id.
   // the authResponse can be accessed using FB sync api calls
   //
   Callcast.SetFBSignedRequestAndAccessToken(response.authResponse.signedRequest, response.authResponse.accessToken);

   fbLog += 'in fbMe() - pre-FB.api(me)\n';

   // user has auth'd your app and is logged into Facebook
   FB.api('/me', function(me)
   {
      if (me && me.name)
      {
         globalFB.GetPermissions();   // Async activity, but won't need results right away to move forward.

         fbLog += 'fbMe() - callback - GOOD.\n';

         app.user.name = encodeURI(me.name);
         app.user.fbProfileUrl = 'https://graph.facebook.com/' + me.id;
         app.user.fbProfilePicUrl = 'https://graph.facebook.com/' + me.id + '/picture?type=large';
         Callcast.SetNickname(app.user.name); // TODO should be somewhere else
         Callcast.setPresenceBlob({
                                              url: app.user.fbProfileUrl,
                                          image: app.user.fbProfilePicUrl
                                         });

         fbLog += 'fbMe() - callback - pre-trigger deferredCheckCredentials\n';

            $(document).trigger('deferredCheckCredentials');
      }
      else {
        fbLog += 'fbMe() callback - ERROR: me is: ' + JSON.stringify(me) + '\n';
      }
   });

   fbLog += 'in fbMe() - post-FB.api(me) call.\n';
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief initialize facebook api.
 */
function ourAsyncFBInit()
{
    // Load the SDK Asynchronously
/*    (function(d) {
       app.log(2, 'fb load facebook-jssdk');
       var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
       js = d.createElement('script'); js.id = id; js.async = true;
       js.src = 'http://connect.facebook.net/en_US/all.js';
       d.getElementsByTagName('head')[0].appendChild(js);
     }(document));
*/

      app.log(2, 'fbAsyncInit callback');
      fbLog += 'pre-fb.init()\n';
      globalFB = new GoCastJS.FB();

      FB.init({
        appId: '458515917498757', // App ID
//          channelUrl : '//' + window.location.hostname + '/channel.html', // Channel File for x-domain communication
//        channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File for x-domain communication
        status: true, // check login status trip to fb server
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true,  // parse XFBML
        oauth: true  //,
//        logging: true
      });

      fbLog += 'post-fb.init() / pre-fb.event.subscribe()\n';
        // listen for and handle auth.authResponseChange events
        FB.Event.subscribe('auth.authResponseChange', function(response) {
          app.log(2, 'authResponseChange callback');
          app.log(2, 'response = ' + JSON.stringify(response));
          console.log('response == ', response);
          fbLog += 'callback: FB.Event.subscribe() - response: ' + JSON.stringify(response) + '\n';
          if (response.authResponse)
          {
             fbMe(response);
          }
          else
          {
            app.log(2, 'FB logged out or token went bad?');
            globalFB.ClearPermissions();
            Callcast.SetFBSignedRequestAndAccessToken(null, null);
          }
        });

      fbLog += 'post-fb.event.subscribe-call() / pre-fb.getLoginStatus()\n';
      // not needed since the status : true arg to FB.init above
      // does the equivalent and fires statusChange
      // but looks like the above stmt is not true, we don't get
      // statusChange event on FB.init if we're not logged into fb
      // so call this on page load, we may need a true 2nd arg
      // to trip to fb server
      FB.getLoginStatus(function(response) {
        app.log(2, 'fbLoginStatus callback response.authResponse: ' + response.authResponse);
          fbLog += 'callback: FB.getLoginStatus() - response: ' + JSON.stringify(response) + '\n';
          //console.log('authResponse-Object', response.authResponse);
          //console.log('accessToken', response.authResponse.accessToken);
          if (!response.authResponse)
          {
             $(document).trigger('deferredCheckCredentials');
          }
          else
          {
             console.log('getLoginStatus response ', response);
             app.log(2, 'getLoginStatus response = ' + JSON.stringify(response));
             fbMe(response);
          }

      });

} // ourAsyncFBInit

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief Action send Facebook post.
 * fb doc here:  http://developers.facebook.com/docs/reference/api/post/
 * todo looks like can't specify that the link should open a new tab
 *      check fb docs later to see if this features is added
 *
 * @param {facebook event} event The event object.
 */
function fbShare(event)
{
  if (event) {
    event.preventDefault();
  }

  // check to see if we're logged in
  FB.api('/me', function(me)
  {
    if (!me)
    {
       alert('Please login to facebook to post to your wall.');
    }
    else
    {
      var params = {};
      params.method = 'feed';
      params.link = window.location.href;
      params.picture = 'http://carousel.gocast.it/images/gologo.png';
      params.name = 'Join me at GoCast in room: ' + $.getUrlVar('roomname');
      params.caption = 'This is an invitation to join my study group.';
      params.description = 'I\'m looking forward to meeting you there.';
      params.message = 'This is an invitation to join my study group.';

      FB.ui(params, function(response)
      {
        if (!response) // cancel in the dialag calls back with no response
                       // so do nothing if there is no response
        {
           app.log(2, 'fbShare no response');
        }
        else if (response.error)
        {
           //alert('We couldn\'t send the message.\n\nPlease give the GoCast Carousel app permission in facebook.');
           app.log(2, 'fbShare error', response);
        } // else {
           // success do nothing since the ui is the send dialog
        // } // else {
      });
    }
  });
} /* fbShare() */

function fbSendDialog()
{
  // check to see if we're logged in
  FB.api('/me', function(me)
  {
    if (!me)
    {
       alert('Please login to facebook to send messages.');
    }
    else
    {
       FB.ui({
            method: 'send',
            name: 'Join me at GoCast in room: ' + $.getUrlVar('roomname'),
            description: 'This is an invitation to join my study group.',
            link: window.location.href,
            picture: 'http://carousel.gocast.it/images/gologo.png'
            }, function(response)
       {
         if (!response) // cancel in the dialag calls back with no response
                        // so do nothing if there is no response
         {
            app.log(2, 'fbSendDialog no response');
         }
         else if (response.error)
         {
            //alert('We couldn\'t send the message.\n\nPlease give the GoCast Carousel app permission in facebook.');
            console.log('fbSendDialog error ', response);
            app.log(2, 'fbSendDialog error = ' + JSON.stringify(response));
         } // else {
            // success do nothing since the ui is the send dialog
         // } // else {
       });
    }
  });
}

/* version using stream.share
function fbSendDialog()
{
  FB.ui(
  {
     method: 'stream.share',
     display: 'dialog',
     t:   'Carousel room ' + $.getUrlVar('roomname'),
     u: window.location.href
  }, function(response)
  {
    if (!response) // cancel in the dialag calls back with no response
                   // so do nothing if there is no response
    {
       console.log("fbSendDialog no response");
    }
    else if (response.error)
    {
       //alert('We couldn\'t send the message.\n\nPlease give the GoCast Carousel app permission in facebook.');
       console.log("fbSendDialog error", response);
    } else {
       // success do nothing since the ui is the send dialog
    }
  });
}
*/
