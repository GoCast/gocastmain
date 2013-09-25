var GoCastJS = GoCastJS || {};

GoCastJS.StateMachine = (function() {
	return GoCastJS.Class({
		constructor: function GoCastJS_StateMachine() {
			this.states = {};
			this.onsubevent = null;
		},
		methods: {
			state: function(opts) {
				if (opts.name) {
					this.states[opts.name] = opts.state;
				}
				return this;
			},
			transition: function(tostate) {
				if (tostate && this.states[tostate]) {
					this.onsubevent = this.states[tostate];
				}
				return this;
			},
			init: function(state) {
				this.onsubevent = this.onsubevent || state || function() {};
				this.onsubevent();
			},
			subscribe: function(opts) {
				if (opts.evt && opts.pub) {
					opts.pub.regsub({evt: opts.evt, sub: this});
				}
			},
			unsubscribe: function(opts) {
				if (opts.evt && opts.pub) {
					opts.pub.deregsub({evt: opts.evt, sub: this});
				}
			}
		}
	});
}());