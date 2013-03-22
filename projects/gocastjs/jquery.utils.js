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
    if ($.browser.chrome && 25 <= parseInt($.browser.version)) {
        urlvarsobj['wrtcable'] = 'true';
    }

    if (urlsplit[1]) {
        nvpairs = urlsplit[1].split('&');
        for (i in nvpairs) {
            if (nvpairs.hasOwnProperty(i)) {
                nvpair = [nvpairs[i].slice(0, nvpairs[i].indexOf('=')),
                          nvpairs[i].slice(nvpairs[i].indexOf('=') + 1)];
                urlvarsobj[decodeURI(nvpair[0])] = decodeURI(nvpair[1]);
            }
        }
    }

    $.extend({
		urlvars: urlvarsobj
	});
})(jQuery);

(function($) {
    var plugins, verstring, ver = '0';

    navigator.plugins.refresh(false);
    plugins = navigator.plugins;

    for (var i=0; i<plugins.length; i++) {
        if ('GoCastPlayer' === plugins[i].name) {
            verstring = plugins[i].version||plugins[i].description;
            if ('GCP' === verstring.split(' ')[0]) {
                ver = verstring.split(' ')[1];
            }

            $.extend({
                gocastplayer: {
                    version: ver
                }
            });
            break;
        }
    }

    if ($.urlvars.wrtcable &&
        localStorage && localStorage.gcpUsePlayer) {
        delete $.urlvars.wrtcable;
    }
})(jQuery);

(function($) {
    var salt = 'Room',
        saltdelim = ':',
        userdelim = '#',
        encRoomName = function(inRoom) {
            return inRoom.replace(/'/g, '%27');
        },
        roomcodeobj = {
            cipher: function(username, roomname) {
                return $.base64.encode(salt + saltdelim + encRoomName(encodeURIComponent(username.replace(/@/, '~') + userdelim + roomname)));
            },
            roomurl: function(username, fullname, roomname) {
                return window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) +
                       '?room=' + ((fullname ? (fullname + '\'s ') : '') + roomname).replace(/\s/g, '_') +
                       '&g=' + this.cipher(username, roomname);
            },
            decipher: function(rcode) {
                var roomname = $.base64.decode(rcode),
                    roomsalt = roomname.slice(0, roomname.indexOf(saltdelim));

                return (salt === roomsalt) ? decodeURIComponent(roomname.slice(roomname.indexOf(saltdelim)+1)) : '';
            },
            decipherURIEncoded: function(rcode) {
                var roomname = $.base64.decode(rcode),
                    roomsalt = roomname.slice(0, roomname.indexOf(saltdelim));

                return (salt === roomsalt) ? roomname.slice(roomname.indexOf(saltdelim)+1) : '';
            },
            decipheruname: function(rcode) {
                var roomname = this.decipher(rcode);
                return roomname.slice(0, roomname.indexOf(userdelim)).replace(/~/, '@');
            },
            decipherroomname: function(rcode) {
                var roomname = this.decipher(rcode);
                return decodeURIComponent(roomname.slice(roomname.indexOf(userdelim)+1));
            }
        };

    $.extend({
        roomcode: roomcodeobj
    });
})(jQuery);

(function($) {
    var genEmailArray = function (str, cb) {
        var arr = [];
        str.split(',').forEach(function(commas) {
            commas.trim().split(';').forEach(function(semis) {
                semis.trim().split(' ').forEach(function(spaces) {
                    if (spaces.trim()) {
                        arr.push(spaces.trim());
                    }
                });
            });
        });
        cb(arr);
    };

    $.extend({
        genemaillist: genEmailArray
    });
})(jQuery);