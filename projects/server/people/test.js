var FacebookClient = require("facebook-client").FacebookClient;

var facebook_client = new FacebookClient(
    "303607593050243", // configure like your fb app page states
    "48b900f452eb251407554283cc7f3d7f", // configure like your fb app page states
    {
        "timeout": 10000 // modify the global timeout for facebook calls (Default: 10000)
    }
);

facebook_client.getSessionByRequestHeaders(request.headers)(function(facebook_session) {
    facebook_session.graphCall("/me", {
    })(function(result) {
        console.log('Username is:' + result.name);
    });
    facebook_session.graphCall("/me/feed", {message:"I love node.js!"}, 'POST')(function(result) {
        console.log('The new feed post id is: ' + result.id);
    });
});
