(function($) {
	var useragent = navigator.userAgent.toLowerCase(),
		clientosinfo = {
			mac: /mac/.test(useragent),
			win: /win/.test(useragent),
			lin32: /linux i686/.test(useragent),
			lin64: /linux x86_64/.test(useragent)
	};

	$.extend({
		clientos: clientosinfo
	});
})(jQuery);

(function($) {
    var urlvarsobj = {},
    	nvpairs = [],
    	nvpair = [],
    	urlsplit = window.location.href.split('?');

    urlvarsobj['baseurl'] = urlsplit[0];
    if (urlsplit[1]) {
        nvpairs = urlsplit[1].split('&');
        for (i in nvpairs) {
        	nvpair = [nvpairs[i].slice(0, nvpairs[i].indexOf('=')),
                      nvpairs[i].slice(nvpairs[i].indexOf('=') + 1)];
            urlvarsobj[decodeURI(nvpair[0])] = decodeURI(nvpair[1]);
        }
    }

    $.extend({
		urlvars: urlvarsobj
	});
})(jQuery);

(function($) {
    var plugins, verstring, ver,
        playerhtml = '<div id="gcpversioncheck"><object id="player" type="application/x-gocastplayer" ' + 
                     'width="0" height="0"></object></div>';

    navigator.plugins.refresh(false);
	plugins = navigator.plugins;

	for (var i=0; i<plugins.length; i++) {
		if ('GoCastPlayer' === plugins[i].name) {
            verstring = plugins[i].version||plugins[i].description;

            if ('GCP' === verstring.split(' ')[0]) {
                ver = verstring.split(' ')[1];
            } else {
                $('body').append(playerhtml);
                setTimeout(function() {
                    var player = document.getElementById('player')
                    ver = player.version;
                }, 100);
            }

            $.extend({
                gocastplayer: {
                    version: ver
                }
            });
			return;
		}
	}
})(jQuery);

(function($) {
    var salt = 'Room',
        saltdelim = ':',
        userdelim = '#',
        roomcodeobj = {
            cipher: function(username, roomname) {
                return $.base64.encode(salt + saltdelim + username + userdelim + roomname);
            },
            decipher: function(rcode) {
                var roomname = $.base64.decode(rcode),
                    roomsalt = roomname.split(saltdelim)[0];

                return (salt === roomsalt) ? roomname.split(saltdelim)[1] : ''; 
            }
        };

        $.extend({
            roomcode: roomcodeobj
        });
})(jQuery);