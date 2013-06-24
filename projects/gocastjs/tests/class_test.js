/*jslint sloppy: false, white: true, todo: true, browser: true, devel: true */
/*global window, Buffer, webkitURL */
'use strict';

var BaseClass = GoCastJS.Class({
             init: function() { console.log('Welcome to the BaseClass init().'); },
             privates: {priv1: 1, priv2: 'two', priv3: 3},
             publics: {pub1: 'one', pub2: 2},
//             statics: {[<varname/funcname>: <value/definition>,]+},
             methods: {
              callone: function(amt) {
                console.log('callone: I am alive. Modifying priv1++ by parameter1');
                this.priv1(this.priv1() + (amt || 1));
                console.log('callone: priv1: ', this.priv1());
              },
              overrideme: function() {
                console.log('overrideme: this is the base.');
              }
             }
//             base (optional): <ClassName>
         });

var DerivedClass = GoCastJS.Class({
             init: function() { console.log('Welcome to the DerivedClass init().'); },
//             statics: {[<varname/funcname>: <value/definition>,]+},
             methods: {
              callone: function(amt) {
                console.log('callone: I am alive. Modifying priv1++ by parameter1');
                this.priv1(this.priv1() + (amt || 1));
                console.log('callone: priv1: ', this.priv1());
              },
              overrideme: function() {
                console.log('overrideme: This is the real deal in the derived class.');
              }
             },
             base: BaseClass
         });

      // NOTE: overriding priv3 in BaseClass({priv3: 'overridden'}) does produce an override. Not in derived.
         var base = new BaseClass();
         var derived = new DerivedClass({priv3: 'again'});


$(document).ready(function() {
  var who, con;
    console.log('Getting started with base...');

    console.log('publics: ', base.pub1, ' and ', base.pub2);
    console.log('changing publics to anotherone and anothertwo...');
    base.pub1 = 'anotherone';
    base.pub2 = 'anothertwo';
    console.log('publics: ', base.pub1, ' and ', base.pub2);

    console.log('calling callone(3):');
    base.callone(3);
    console.log('calling callone():');
    base.callone();

    console.log('going to try to print a private value...');
    console.log('base.priv1: ', base.priv1());
    console.log('going to try to modify a private value...');
    base.priv1(99);
    console.log('base.priv1: ', base.priv1());

    console.log('Did priv3 get overridden: ', base.priv3());
    base.overrideme();

    console.log('Now for derived...');
    console.log('Did priv3 get overridden: ', derived.priv3());
    derived.overrideme();

    console.log('test private object and adding / changing items in the object.');
    base.priv1({a:1, b:2, c:'three'});
    console.log('base.priv1: ', JSON.stringify(base.priv1()));
    base.priv1().b = 'change';
    console.log('base.priv1: ', JSON.stringify(base.priv1()));

});

