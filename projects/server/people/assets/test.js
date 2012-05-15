var xmppland = {
  username: null,
  jid: null,
  authResponse: null,
  connection: null,
  APIKEY: "405456092801119",
  SECRETKEY: "12e09e49ff0c5d78b0b1e8a2258b212a",

  xmpp_alive: function(auth, obj) {
	this.authResponse = auth;
	self = this;

	// If the user passes in an object...send that one to connect.
	// Otherwise, use ourselves.
	if (!obj)
		obj = this;

	FB.api('/me', function(response) {
//	  alert(response.name);
	  self.username = response.username;
	  self.jid = xmppland.username+"@chat.facebook.com";
	  xmppland.connect(obj);
	});
  },

  onConnect: function(status) {
	        if (status === Strophe.Status.CONNECTED) {
	        	console.log("Connected. Hurray.");
	                $(document).trigger('connected');
	        } else if (status === Strophe.Status.DISCONNECTED) {
	         	console.log("Disonnected. Boo.");
	                $(document).trigger('disconnected');
	        }
		else if (status === Strophe.Status.CONNECTING)
			console.log("Connecting...");
		else if (status === Strophe.Status.CONNFAIL)
			console.log("Connecting failed.");
		else if (status === Strophe.Status.AUTHENTICATING)
			console.log("Authenticating...");
		else if (status === Strophe.Status.AUTHFAIL)
			console.log("Authentication failed.");
		else if (status === Strophe.Status.ERROR)
			console.log("General Strophe Failure. ERROR.");
		else
			console.log("Unknown onConnect status:"+status);
  },

    connect: function(obj) {
    	var boshconn = "http://bosh.metajack.im:5280/xmpp-httpbind";
//    	var boshconn = "http://video.gocast.it/http-bind";

    	if (obj.connection)
    		obj.disconnect();

    	obj.connection = new Strophe.Connection(boshconn);
    	obj.connection.reset();

	obj.connection.xmlInput = function(data) {
        	console.log("XML-IN:", data);
	    };

	obj.connection.xmlOutput = function(data) {
	        console.log("XML-OUT:", data);
	    };


	obj.connection.facebookConnect(this.jid, this.onConnect, 60, 1, this.APIKEY, this.SECRETKEY, this.authResponse.accessToken);

    },
};

