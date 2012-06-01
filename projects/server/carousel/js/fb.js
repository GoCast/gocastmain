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
    //jk what is optimum place to load?
    //jk why async load?
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
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true,  // parse XFBML
        oauth      : true,
      });
      
      FB.getLoginStatus(function(response) {
        app.log(2, "fbLoginStatus callback");
          globalAuthResponse = response.authResponse;
          $(document).trigger("fbLoginStatus")
          //console.log('authResponse-Object', response.authResponse);
          //console.log('accessToken', response.authResponse.accessToken);
      });

        // listen for and handle auth.statusChange events
        FB.Event.subscribe('auth.statusChange', function(response) {
          app.log(2, "fbStatusChange callback");
          if (response.authResponse) {
            //
            // NOTE: These two represent the keys to the kingdom. The signed response and the id.
            //
            globalFBSR = response.authResponse.signedRequest;
            globalFBID = response.authResponse.id;

            // user has auth'd your app and is logged into Facebook
            FB.api('/me', function(me){
              if (me.name) {
                //document.getElementById('auth-displayname').innerHTML = me.name;
                globalFBName = me.name;
                // set nick name to fb name
                app.user.name = me.name;

                //
                // NOTE: These functions really should not be called here - they should be called
                //       on plugin loaded / ready.
                //       For this unit-test-style, this is fine.
                //
                //Callcast.SetNickname(me.name);
                // Now login anonymously
                //Callcast.connect(Callcast.CALLCAST_XMPPSERVER, "");

              }
            })
            //document.getElementById('auth-loggedout').style.display = 'none';
            //document.getElementById('auth-loggedin').style.display = 'block';
          } else {

            //Callcast.disconnect();

            // user has not auth'd your app, or is not logged into Facebook
            //document.getElementById('auth-loggedout').style.display = 'block';
            //document.getElementById('auth-loggedin').style.display = 'none';

          }
        });
    }
}

