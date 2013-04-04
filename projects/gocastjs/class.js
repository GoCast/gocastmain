//!
//! class.js
//!
//! C++ class-like definitions in JavaScript
//!

var GoCastJS = GoCastJS || {};

//!
//! Usage: var <ClassName> = GoCastJS.Class(definitions)
//!
//! definitions = {
//!     constructor: function <ClassName>(args) {}
//!     statics: { (<FunctionName>: function(args) {}, <VariableName>: value)+ }
//!     methods: { (<FunctionName>: function(args) {},)+ }
//! }
//!
GoCastJS.Class = function(definition) {
    var defn = definition || {},
        statics = defn.statics || {},
        methods = defn.methods || {},
        constructor = defn.constructor || function Empty() {};

    if (!constructor.name) {
        throw 'GoCastJS.Class.NoNameForConstructorException';
    }
    //!
    //! Usage: <ClassName>.extend(statics);
    //!
    //! Use this method to add one or more static functions to the class.
    //!
    constructor.extend = function(statics) {
        var prop;
        for (prop in statics) {
            if (statics.hasOwnProperty(prop)) {
                this[prop] = statics[prop];
            }
        }
    };
    //!
    //! Usage: <ClassName>.append(methods);
    //!
    //! Use this method to add one or more member functions to the class.
    //!
    constructor.append = function(methods) {
        var method;
        for (method in methods) {
            if (methods.hasOwnProperty(method)) {
                this.prototype[method] = methods[method];
            }
        }
    }

    constructor.extend(statics);
    constructor.append(methods);

    return constructor;
};
