(function($, $$, $$$) {
	$.appCacheStatuses = [
		'uncached',
		'idle',
		'checking',
		'downloading',
		'updateready',
		'obsolete'
	];

	$.appCacheResult = {
		status: '',
		evt: 'none',
		callbacks: {
			proceed: null,
			reload: null
		},
		suggestion: function() {
			var wait = (('checking' === this.status) ||
					    ('uncached' === this.status) ||
					    ('downloading' === this.status)),
			proceed = (('nocache' === this.status) ||
					   ('noupdate' === this.evt)),
			reload = (('updateready' === this.status) ||
					  ('cached' === this.evt)),
			suggestion = '';

			suggestion = wait ? 'wait' : suggestion;
			suggestion = proceed ? 'proceed' : suggestion;
			suggestion = reload ? 'reload' : suggestion;
			return suggestion;
		},
		poll: function(interval, onproceed, onreload) {
			this.status = $.applicationCache ? '' : 'nocache';
			this.evt = 'none';
			this.callbacks.proceed = onproceed || function(){};
			this.callbacks.reload = onreload || function(){};

			var self = this,
			intvl = setInterval(function() {
				if ('wait' !== self.suggestion() && self.callbacks[self.suggestion()]) {
					$$$.log('SUGGESTION: ' + self.suggestion());
					self.callbacks[self.suggestion()]();
					clearInterval(intvl);
				}
			}, (interval||1000));
		}
	};

	$.addEventHandler = function(ele, name, func) {
		if ($$.addEventListener) {
			ele.addEventListener(name, func, false);
		} else if ($$.attachEvent) {
			ele.attachEvent('on' + name, function() {
				return func.call(ele, window.event);
			});
		}
	};

	$.appCacheEventHandler = function() {
		var self = this;

		return function(evt) {
			$$$.log('APPCACHE[' + evt.type + ']: ', evt);
			$$$.log('APPCACHE[status]: ' + self.appCacheStatuses[self.applicationCache.status]);
			self.appCacheResult.status = self.appCacheStatuses[self.applicationCache.status];
			self.appCacheResult.evt = evt.type;
			$$$.log('APPCACHE[suggestion]: ' + self.appCacheResult.suggestion());
		}
	};

	if ($.applicationCache) {
		['cached', 'checking', 'downloading', 'error', 'noupdate', 'obsolete', 'progress', 'updateready'].forEach(function(e, i, a) {
			$$$.log('APPCACHE: Adding event handler for \'' + e + '\'');
			$.addEventHandler($.applicationCache, e, $.appCacheEventHandler());
		});
	} else {
		$.appCacheResult.status = 'nocache';
	}
})(window, document, console);
