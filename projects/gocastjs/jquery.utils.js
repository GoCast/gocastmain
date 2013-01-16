(function($) {
	var useragent = navigator.userAgent.toLowerCase(),
		clientosinfo = {
			mac: /mac/.test(useragent),
			win: /win/.test(useragent),
			lin32: /linux i686/.test(useragent),
			lin64: /linux x86_64/.test(useragent)
	};

	$.extend({
		clientos: clientosinfo;
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
        	nvpair = nvpairs[i].split('=');
            urlvarsobj[decodeURI(nvpair[0])] = decodeURI(nvpair[1]);
        }
    }

    $.extend({
		urlvars: urlvarsobj;
	});
})(jQuery);

(function($) {
	var plugins = navigator.plugins;
	for (var i=0; i<plugins.length; i++) {
		if ('GoCastPlayer' === plugins[i].name) {
			var ver = parseFloat(plugins[i].version||plugins[i].description);
			$.extend({
				gocastplayer: {
					version: isNaN(ver) ? 0.0 : ver
				}
			});
			return;
		}
	}
})(jQuery);