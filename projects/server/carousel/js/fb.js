/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \brief initialize facebook api.
 */
function fbInit(
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * No argument. */
)
{
    // Load the SDK Asynchronously
    (function(d){
       app.log(2, "fb load facebook-jssdk");
       var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
       js = d.createElement('script'); js.id = id; js.async = true;
       js.src = "http://connect.facebook.net/en_US/all.js";
       d.getElementsByTagName('head')[0].appendChild(js);
     }(document));

    window.fbAsyncInit = function() {
      app.log(2, "fbAsyncInit callback");
      FB.init({
        appId      : '458515917498757', // App ID
        status     : true, // check login status trip to fb server
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true,  // parse XFBML
        oauth      : true,
      });

      // not needed since the status : true arg to FB.init above 
      // does the equivalent and fires statusChange
      // but looks like the above stmt is not true, we don't get
      // statusChange event on FB.init if we're not logged into fb
      // so call this on page load, we may need a true 2nd arg
      // to trip to fb server
      FB.getLoginStatus(function(response) {
        app.log(2, "fbLoginStatus callback response.authResponse" + response.authResponse);
          //console.log('authResponse-Object', response.authResponse);
          //console.log('accessToken', response.authResponse.accessToken);
     	  if (!response.authResponse)
     	  {
		     $(document).trigger("checkCredentials");
		  }
      });

        // listen for and handle auth.statusChange events
        FB.Event.subscribe('auth.statusChange', function(response) {
          app.log(2, "fbStatusChange callback");
          if (response.authResponse) {
            app.log(2, "fbStatusChange callback user is authorized");
            //
            // NOTE: These two represent the keys to the kingdom. The signed response and the id.
            // the authResponse can be accessed using FB sync api calls
            //
            //globalFBSR = response.authResponse.signedRequest;
            //globalFBID = response.authResponse.id;

            // user has auth'd your app and is logged into Facebook
            FB.api('/me', function(me){
              if (me && me.name) {
                //document.getElementById('auth-displayname').innerHTML = me.name;
                app.user.name = encodeURI(me.name);
                app.user.fbProfileUrl = "https://graph.facebook.com/" + me.id;
                app.user.fbProfilePicUrl = "https://graph.facebook.com/" + me.id + "/picture?type=large";
			    Callcast.SetNickname(app.user.name); // TODO should be somewhere else

              }
            })
          }
     	  globalAuthResponse = response.authResponse;
		  $(document).trigger("checkCredentials")
        });
    }
}
