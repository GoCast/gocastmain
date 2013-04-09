//!
//! variant.js
//!
//! Event-driven variables in JavaScript. 
//!
var GoCastJS = GoCastJS || {};

GoCastJS.Event = (function() {
    return GoCastJS.Class({
        constructor: function GoCastJS_Event(args) {
            //!
            //! e.name: string <name of event>
            //!
            this.name = args.name;
            //!
            //! e.pub: GoCastJS.Variant <publisher of event>
            //!
            this.pub = args.pub;
        }
    });
}());
//!
//! Usage: var v = new GoCastJS.Variant(args)
//!
//! args = {
//!     value: <initial value of the variant>
//!     ontouch: function() { ... } <fired when variant is inited>
//!     onchange: function() { ... } <fired when variant value changes>
//! };
//!
GoCastJS.Variant = (function() {
    return GoCastJS.Class({
        constructor: function GoCastJS_Variant(args) {
            //!
            //! v.value <current value of v>
            //!
            this.value = args.value || 0;
            //!
            //! v.ontouch <callback called when a new
            //!           GoCastJS.Variant is inited>
            //!
            this.ontouch = args.ontouch || function() {};
            //!
            //! v.onchange <callback called when the value of
            //!           GoCastJS.Variant has changed>
            //!
            this.onchange = args.onchange || function() {};

            this.events = {};
            this.touch();
        },
        methods: {
            //!
            //! Usage: v.val(newValue: <optional>)
            //!
            //! If newValue is given, sets v's value to newValue
            //! and returns v to enable method chainability.
            //!
            //! If no argument is given, then returns the current
            //! value of v.
            //!
            val: function(newvalue) {
                if ('undefined' !== typeof(newvalue)) {
                    if (this.value !== newvalue) {
                        this.value = newvalue;
                        this.change();
                    }
                    this.touch();
                    return this;
                } else {
                    return this.value;
                }
            },
            //!
            //! Turn on custom event
            //!
            //! Usage: v.on(opts)
            //!
            //! opts = {
            //!     evt: string <name of custom event>,
            //!     type: string (optional) <a 'touch' or 'change' event>
            //!     trigger: function() { ...; return true/false; }
            //!              <function that specifies the condition
            //!              for triggering event>,
            //!     callback: function() {...}
            //!               <function to be called when event is
            //!               triggered>
            //! }
            //!
            //! If opts.evt is either 'change' or 'touch', opts.trigger
            //! is not needed.
            //!
            on: function(opts) {
                if (opts.evt) {
                    if ('touch' === opts.evt) {
                        this.ontouch = opts.callback || function() {};
                    } else if ('change' === opts.evt) {
                        this.onchange = opts.callback || function() {};
                    } else if (!this.events[opts.evt]) {
                        this.events[opts.evt] = {
                            trigger: opts.trigger || function() { return false; },
                            type: opts.type || 'touch',
                            callback: opts.callback || function() {},
                            subscribers: []
                        };
                    }
                }
                return this;
            },
            //!
            //! Usage: v.off(evt: string) <turn off a custom event>
            //!
            off: function(evt) {
                if (evt) {
                    if ('touch' === evt) {
                        this.ontouch = function() {};
                    } else if('change' === evt) {
                        this.onchange = function() {};
                    } else if (this.events[evt]) {
                        delete this.events[evt];
                    }
                }
                return this;
            },
            //!
            //! Register an event subscriber
            //!
            //! Usage: v.regsub(opts)
            //!
            //! opts = {
            //!     evt: string <name of the event to be subscribed>
            //!     sub: object <subscriber object>
            //! }
            //!
            //! opts.sub should implement a member function as follows:
            //! opts.sub.onsubevent = function(e: GoCastJS.Event) {...}
            //!
            regsub: function(opts) {
                if (opts.evt && this.events[opts.evt]) {
                    this.events[opts.evt].subscribers.push(opts.sub);
                }
                return this;
            },
            //!
            //! Deregister an event subscriber
            //!
            //! Usage: v.deregsub(opts)
            //!
            //! opts = (See regsub());
            //!
            deregsub: function(opts) {
                var idx = -1;
                if (opts.evt && this.events[opts.evt]) {
                    idx = this.events[opts.evt].subscribers.indexOf(opts.sub);
                    if (0 <= idx) {
                        this.events[opts.evt].subscribers.splice(idx, 1);
                    }
                }
                return this;
            },
            touch: function() {
                var e;
                setTimeout(this.ontouch.bind(this), 0);
                for (e in this.events) {
                    if (this.events.hasOwnProperty(e) &&
                        'touch' === this.events[e].type &&
                        this.events[e].trigger.bind(this)()) {
                        this.emit(e);
                    }
                }
            },
            change: function() {
                var e;
                setTimeout(this.onchange.bind(this), 0);
                for (e in this.events) {
                    if (this.events.hasOwnProperty(e) &&
                        'change' === this.events[e].type &&
                        this.events[e].trigger.bind(this)()) {
                        this.emit(e);
                    }
                }
            },
            emit: function(evt) {
                if (evt && this.events[evt]) {
                    setTimeout(this.events[evt].callback.bind(this), 0);
                    this.publish(evt);
                }
            },
            publish: function(evt) {
                var i, subarray = [],
                    pubcb = function() {
                        subarray.pop().onsubevent(new GoCastJS.Event({
                            name: evt,
                            pub: this
                        }));
                    };

                if (evt && this.events[evt]) {
                    for (i=0;  i<this.events[evt].subscribers.length; i++) {
                        subarray.push(this.events[evt].subscribers[i]);
                        setTimeout(pubcb.bind(this), 0);
                    }
                }
            }
        }
    });
}());
