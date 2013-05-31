var GoCastJS;

(function(module) {
	module.Event = module.Event || module.Class({
		privates: {name: '', pub: null}
	});
}(GoCastJS || (GoCastJS = {})));

(function(module) {
	module.Variant = module.Variant || module.Class({
		privates: {
			value: 0, ontouch: function() {},
			onchange: function() {}, events: {}
		},
		methods: {
			val: function(newvalue) {
                if ('undefined' !== typeof(newvalue)) {
                    if (this.value() !== newvalue) {
                        this.value(newvalue);
                        this.change();
                    }
                    this.touch();
                    return this;
                } else {
                    return this.value();
                }
			},
            on: function(opts) {
                if (opts.evt) {
                    if ('touch' === opts.evt) {
                        this.ontouch(opts.callback);
                    } else if ('change' === opts.evt) {
                        this.onchange(opts.callback);
                    } else if (!this.events()[opts.evt]) {
                        this.events()[opts.evt] = {
                            trigger: opts.trigger,
                            type: opts.type,
                            callback: opts.callback,
                            subscribers: []
                        };
                    }
                }
                return this;
            },
            off: function(evt) {
                if (evt) {
                    if ('touch' === evt) {
                        this.ontouch(function() {});
                    } else if('change' === evt) {
                        this.onchange(function() {});
                    } else if (this.events()[evt]) {
                        delete this.events()[evt];
                    }
                }
                return this;
            },
            regsub: function(opts) {
                if (opts.evt && this.events()[opts.evt]) {
                    this.events()[opts.evt].subscribers.push(opts.sub);
                }
                return this;
            },
            deregsub: function(opts) {
                var idx = -1;
                if (opts.evt && this.events()[opts.evt]) {
                    idx = this.events()[opts.evt].subscribers.indexOf(opts.sub);
                    if (0 <= idx) {
                        this.events()[opts.evt].subscribers.splice(idx, 1);
                    }
                }
                return this;
            },
			touch: function() {
                setTimeout(this.ontouch().bind(this), 0);
                for (var e in this.events()) {
                    if (this.events().hasOwnProperty(e) &&
                        'touch' === this.events()[e].type &&
                        this.events()[e].trigger.bind(this)()) {
                        this.emit(e);
                    }
                }
			},
			change: function() {
                setTimeout(this.onchange().bind(this), 0);
                for (var e in this.events()) {
                    if (this.events().hasOwnProperty(e) &&
                        'change' === this.events()[e].type &&
                        this.events()[e].trigger.bind(this)()) {
                        this.emit(e);
                    }
                }
			},
            emit: function(evt) {
                if (evt && this.events()[evt]) {
                    setTimeout(this.events()[evt].callback.bind(this), 0);
                    this.publish(evt);
                }
            },
            publish: function(evt) {
                var i, subarray = [], pubcb = function() {
                    subarray.pop().onevent(new module.Event({
                        name: evt,
                        pub: this
                    }));
                };

                if (evt && this.events()[evt]) {
                    for (i=0;  i<this.events()[evt].subscribers.length; i++) {
                        subarray.push(this.events()[evt].subscribers[i]);
                        setTimeout(pubcb.bind(this), 0);
                    }
                }
            }
		}
	});
}(GoCastJS));
