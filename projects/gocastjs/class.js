//!
//! class.js - A OOP-like class structure for JavaScript
//!
//! Usage:  var <ClassName> = GoCastJS.Class({
//!             privates: {[<varname>: <value>,]+},
//!             publics: {[<varname>: <value>,]+},
//!             statics: {[<varname/funcname>: <value/definition>,]+},
//!             methods: {[<funcname>: <definition>,]+}
//!             base (optional): <ClassName>
//!         });
//!
//!         var <InstanceName> = new <ClassName>({[<varname>: <initval>]+});
//!
//! Note: Each private member 'priv' is accessed by an auto-generated
//!       member function 'priv()' to be used as shown below:
//!
//!             var x = instance.priv() // returns value of private member 'priv'
//!             instance.priv(val) // sets private member 'priv's value to val.
//!

var GoCastJS;

(function(module) {
    module.Class = module.Class || function Class(definition) {
        var constructor = function Constructor() {
            var privates = {},
                base = definition.base;

            // Generate private member variable get/set function.
            function getset(priv) {
                return function(val) {
                    if ('undefined' === typeof(val)) {
                        return privates[priv];
                    }
                    privates[priv] = val;
                };
            }

            // Call base class constructor if present.
            delete definition.base;
            if (base) {
                base.call(this, definition);
            }

            // Private members of the class along with their
            // get/set functions.
            for (var priv in definition.privates) {
                if (definition.privates.hasOwnProperty(priv)) {
                    privates[priv] = definition.privates[priv];
                    this[priv] = getset(priv).bind(this);
                }
            }

            // Public members of the class.
            for (var pub in definition.publics) {
                if (definition.publics.hasOwnProperty(pub)) {
                    this[pub] = definition.publics[pub];
                }
            }

            // Member variable initialization
            if (0 < arguments.length) {
                for (var v in arguments[0]) {
                    if (arguments[0].hasOwnProperty(v)) {
                        if (0 > ['undefined', 'function'].indexOf(typeof(this[v]))) {
                            this[v] = arguments[0][v];
                        }  else if ('undefined' !== typeof(privates[v])) {
                            privates[v] = arguments[0][v];
                        }
                    }
                }
            }
        }, inherit = function inherit(derived, base) {
            function fn() {
                this.constructor = derived;
            }
            
            fn.prototype = base.prototype;
            derived.prototype = new fn();
        };

        // Inherit from base class if present.
        if (definition.base) {
            inherit(constructor, definition.base);
        }

        // Static members of the class.
        for (var prop in definition.statics) {
            if (definition.statics.hasOwnProperty(prop)) {
                constructor[prop] = definition.statics[prop];
            }
        }
        
        // Member functions of the class.
        for (var method in definition.methods) {
            if (definition.methods.hasOwnProperty(method)) {
                constructor.prototype[method] = definition.methods[method]; 
            }
        }
        
        return constructor;
    };
}(GoCastJS || (GoCastJS = {})));
