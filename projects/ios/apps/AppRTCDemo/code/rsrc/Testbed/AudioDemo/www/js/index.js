var app2 = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app2.receivedEvent('deviceready');

		console.log("Before webViewLoaded");
        cordova.exec(function(winParam) {}, function(error) {}, "GCICallcast", "webViewLoaded", [ "" ]);
		console.log("After webViewLoaded");

//        cordova.exec(function(winParam) {}, function(error) {}, "GCIWhiteboard",
//                     "echo", ["firstArgument", "secondArgument", 42,
//                                false]);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
