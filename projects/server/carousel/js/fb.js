/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief initialize facebook api.
 */

/*jslint browser: true, devel: true */
/*global FB, app */

'use strict';

var fbLog = '';
function getFBLog() { return fbLog; }

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
        app.log(2, 'fbLoginStatus callback response.authResponse' + response.authResponse);
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
