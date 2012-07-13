/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 * \file carousel.js
 *
 * \brief JavaScript code for Gocast.it plug-in carousel.
 *
 * \note This code reqires jQuery v1.7.2.
 *
 * \author Net-Scale Technologies, Inc.,
 *         <a href="http://www.net-scale.com">www.net-scale.com</a>\n
 *         Created May 10, 2012 (paula.muller@net-scale.com)
 *
 * \reference CloudCarousel V1.0.5, (c) 2011 by
 *            R Cecco. <http://www.professorcloud.com> MIT License
 *
 * Copyright (c) 2012 XVD. All rights reserved.
 */
/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/


/*
 * jQuery Extension. */
(function($) {

    /*
     * Item object.  A wrapper object for items within the carousel. */
    var Item = function(objIn, options) {
	this.orgWidth = $(objIn).width();
	this.orgHeight = $(objIn).height();
	this.orgFontSize = parseInt($(objIn).css("font-size"));
	this.plgOrgWidth = this.orgWidth - 4;
	this.plgOrgHeight = (this.plgOrgWidth / Callcast.WIDTH) * Callcast.HEIGHT;
	this.object = objIn;
	this.options = options;
	this.objectOK = true;                
	$(this.object).css('position','absolute');
	// add controls
	$(this.object).append('<img class="zoom control" src="images/green-plus.png" alt="Zoom" title="Zoom" onclick="carouselItemZoom(event);"/>');
	$(this.object).append('<img class="close control" src="images/button-close-white.png" alt="Close" title="Close" />');
	// add handlers
	$(this.object).mouseover(function(event)
        {
	    // only show close icon on unoccupied or content spots
	    if ($(this).hasClass('unoccupied') || $(this).hasClass('typeContent'))
	    {
		$('.control', this).css("visibility", "visible");
	    }
	});
	$(this.object).mouseout(function(event)
	{
	    $('.control', this).css("visibility", "hidden");
	});
    }; /* Item object */

    Item.prototype.updateSize = function(item)
    {
        this.orgWidth     = item.orgWidth;
	this.orgHeight    = item.orgHeight;
	this.plgOrgWidth  = item.plgOrgWidth;
	this.plgOrgHeight = item.plgOrgHeight;
    };

    /// \brief a numerically ordered collection of Item with insert an delete
    var Items = function()
    {
	this.vals = {}; // assoc array
	this.keys = []; // array of sorted keys
    };
    Items.prototype.set = function(index, item)
    {
        this.vals[index] = item;
	this.updateKeys();
    };
    Items.prototype.get = function(index)
    {
        //todo check that index is numeric
	return this.vals[index];
    };
    Items.prototype.remove = function(index)
    {
        //todo check that index is numeric
	delete this.vals[index];
	this.updateKeys();
    };
    Items.prototype.getLength = function()
    {
        return this.keys.length;
    };
    Items.prototype.updateKeys = function(worker)
    {
        this.keys = [];
	for (var key in this.vals)
	{
	    if (this.vals.hasOwnProperty(key))
	    this.keys.push(key);
	}
        // sort numeric ascending
	this.keys.sort(function(a,b){return a - b});
    };
    Items.prototype.iterateSorted = function(worker)
    {	
        for (var i = 0; i < this.keys.length; ++i)
	{
            worker(this.vals[this.keys[i]]);
        }
    };
    // get an index for an item to be added 
    // which is the highest element index incremented
    Items.prototype.getNewIndex = function()
    {   // keys are sorted so last element is greatest
        if (this.keys.length == 0)
        {
           return 0;
        }
        else
        {
           var last = this.keys[this.keys.length - 1];
	   return last + 1;
	}
     };
     // add an item to the list
     // assign an index to it that is <highest index> + 1
     Items.prototype.addItem = function(item)
     {
         item.index = this.getNewIndex();
	 this.set(item.index, item);
     };
     // call item.updateSize on all items
     Items.prototype.updateItemSizes = function(newItem)
     {
         this.iterateSorted(function(item)
	 {
            item.updateSize(newItem);
         });
     };
    /*
     * Controller object. This handles moving all the items and dealing
     * with mouse events. */
    var Controller = function(container, objects, options) {
	var funcSin = Math.sin, funcCos = Math.cos, ctx = this;
	var widthOld = 0, heightOld = 0; // saved container dimensions
	var item; // an extra item to store scales since items can be removed from items list
	var items = new Items(); // collection of items by index with sorted iteration
	/*
	 * Initialization. */
	this.controlTimer = 0;
	this.stopped = false;
	this.container = container;
	this.xRadius = options.xRadius;
	this.yRadius = options.yRadius;
	if (options.xRadius === 0) {
	    this.xRadius = ($(container).width()/2.3);
	}
	if (options.yRadius === 0) {
	    this.yRadius = ($(container).height()/6);
	}
	this.xCentre = options.xPos;
	this.yCentre = options.yPos;
	this.frontIndex = 0;        /* Index of the item at the front. */
        /* Start with the first item at the front. */
	this.rotation = this.destRotation = Math.PI/2;
	this.timeDelay = 1000/options.FPS;
	/*
	 * Turn on relative position for container to allow absolutely
	 * positioned elements within it to work.*/
	$(container).css({ position:'relative', overflow:'hidden'} );
	/*
	 * Buttons configurations. */
	$(options.buttonLeft).css('display','inline');
	$(options.buttonRight).css('display','inline');
	/*
	 * Buttons functionality. */
	$(options.buttonLeft).on('mouseup', this, function(event){
	    event.data.rotate(1);
	    return false;
	});
	$(options.buttonRight).on('mouseup',this,function(event){
	    event.data.rotate(-1);
	    return false;
	});
	/*
	 * For mousewheel, there is dependency with jquery mousewheel
	 * plugin: http://plugins.jquery.com/project/mousewheel. */
	if (options.mouseWheel) {
	    $(container).on('mousewheel', this, function(event, delta) {
		event.data.rotate(delta);
		return false;
	    });
	}
	// click on addItem
	$("#addItem", container).click(function(event)
	{
	   ctx.addItem();
	});
	// mouseover
	/*
	$(container).mouseover(function(event)
        {
	    // display add spot icon with fadeout
            $('#addItem', this).show().fadeOut(3000);
	});
	*/
	/*
	$(this.object).mouseout(function(event)
	{
            $('#addItem', this).css("visibility", "hidden");
	});
	*/
	/*
	 * Click on container event. */
        /*
	$(container).on('click', this, function(event)
	{
	    // todo with item add remove this code doesn't work
	    // rewrite if we ever want to do this
	    if (options.bringToFront) {
		var idx = $(event.target).data('itemIndex');
		var frontIndex = event.data.frontIndex;
		var numObjs = objects.length;
		var diff = (idx - frontIndex) % numObjs;
		if (Math.abs(diff) > numObjs / 2) {
		    diff += (diff > 0 ? -numObjs : numObjs);
		}
		event.data.rotate(-diff);
	    }
	}); // onclick()
        */
	/*
	 * Mousedown on container, it prevents items from being selected
	 * as mouse is moved and clicked in the container. */
	$(container).on('mousedown', this, function(event) {
	    event.data.container.focus();
	    return false;
	});
	/*
	 * Selectstart, defined for IE. */
	container.onselectstart = function () { return false; };
	/*
	 * Addition of DIV innerwrapper. */
	this.innerWrapper = $(container).wrapInner('<div style="position:absolute;width:100%;height:100%;"/>').children()[0];
	/*
	 * Go function. */
	this.go = function() {
	    if (this.controlTimer !== 0) { return; }
	    var context = this;
	    this.controlTimer = setTimeout( function(){
		context.updateAll();
	    }, this.timeDelay);
	}; /* go() */
	/*
	 * Stop function. */
	this.stop = function() {
	    clearTimeout(this.controlTimer);
	    this.controlTimer = 0;
	}; /* stop() */
	/*
	 * Rotate function. Starts the rotation of the carousel. Direction
	 * is the number (+-) of carousel items to rotate by. */
	this.rotate = function(direction) 
	{
	    var itemsLength = items.getLength();
	    this.frontIndex -= direction;
	    this.frontIndex %= itemsLength;
	    this.destRotation += ( Math.PI / itemsLength ) * ( 2*direction );
	    this.go();
	}; /* rotate() */
	/*
	 * Update All function. This is the main loop function that moves
	 * everything. */
	this.updateAll = function() {
	    /*
	     * Definitions. */
	    var w, h, x, y, scale, item, sinVal;
	    var minScale = options.minScale;  /* This is the smallest scale
                                               * applied to the furthest
                                               * item. */
	    var smallRange = (1-minScale) * 0.5;
	    var change = (this.destRotation - this.rotation);
	    var absChange = Math.abs(change);
	    this.rotation += change * options.speed;
	    if (absChange < 0.001) {
		this.rotation = this.destRotation;
	    }
	    var itemsLen = items.getLength();
	    var spacing = (Math.PI / itemsLen) * 2;
	    var radians = this.rotation;
	    var isMSIE = $.browser.msie;
	    /*
	     * Note: Turn off display. This can reduce repaints/reflows when
	     * making style and position changes in the loop. See
	     * http://dev.opera.com/articles/view/efficient-javascript/?page=3 */
	    this.innerWrapper.style.display = 'none';
	    var style;
	    var px = 'px';
	    var context = this;
	    /*
	     * Loop through items. */
	    items.iterateSorted(function(item)
	    {
		sinVal = funcSin(radians);
		scale = ((sinVal+1) * smallRange) + minScale;
		x = ctx.xCentre + (( (funcCos(radians) * ctx.xRadius) - (item.orgWidth*0.5)) * scale);
		y = ctx.yCentre + (( (sinVal * ctx.yRadius)  ) * scale);
		if (item.objectOK) {
		    var obj = item.object;
		    w = item.orgWidth * scale;
		    h = item.orgHeight * scale;
		    obj.style.width = w + px;
		    obj.style.height = h + px;
		    obj.style.left = x + px ;
		    obj.style.top = y + px;
		    /*
		     * Adjust object dimensions. */
		    var plgin = $(obj).find("object")[0];
		    if (plgin) {
			w = item.plgOrgWidth * scale;
			h = item.plgOrgHeight * scale;
			if ($(obj).attr("id").match("mystream")) {
			    if (!app.videoEnabled) {
				//                app.log(2, "Nothing to do with resizing video.");
			    }
			    else 
			    {
				if (w > 10 && h > 10)
				{
				    Callcast.SendLocalVideoToPeers(new Object({width:w, height:h}));
				}
				else
				{
				    app.log(3, "carousel local video width " + w + " height " + h);
				}
			    }
			}
			else 
			{
			    var nick = $(obj).attr("encname");
			    if (nick && Callcast.participants[nick].videoOn)
			    {
				if (w > 10 && h > 10)
				{
				    Callcast.ShowRemoteVideo(new Object({nick:nick, width:w, height:h}));
				}
				else
				{
				    app.log(3, "carousel remote video width " + w + " height " + h);
				}
			    }
			    // else do nothing on resize
			}
			/*
			 * Scale name text. */
			$(obj).find("div.name").css("font-size", (item.orgFontSize * scale) + px);
		    }
		    /* >>0 = Math.foor(). Firefox doesn't like fractional
		       decimals in z-index. */
		    obj.style.zIndex = "" + (scale * 100)>>0;
		}
		radians += spacing;
	    }); /* end loop. */
	    /*
	     * Turn display back on. */
	    this.innerWrapper.style.display = 'block';
	    /*
	     * If perceivable change in rotation then loop again next frame. */
	    if (absChange >= 0.001) {
		this.controlTimer = setTimeout( function(){
		    context.updateAll();
		}, this.timeDelay);
	    }
	    else {
		/* Otherwise just stop completely. */
		this.stop();
	    }
	}; /* updateAll() */
	this.remove = function(index) // remove item
	{
	    items.remove(index);
	}
	this.addItem = function() // add a new empty item
	{
	   // add the html
	   var newDiv = $('<div class="cloudcarousel unoccupied" onclick="carouselItemClick(event);"><div class="name"></div></div>');
	   $(this.innerWrapper).append(newDiv);
	   var item = new Item(newDiv[0], options);
	   item.updateSize(this.item);
	   newDiv.data('item', item);
	   items.addItem(item);
	   this.setupItem(item);
	   this.updateAll();
	}
	this.setupItem = function(item) // setup newly added item
	{
	    $('.close', item.object).click(function(event)
            {
		event && event.stopPropagation();
		var jqDiv = $(this).parent();
		var item = jqDiv.data('item');
		console.log("removing", jqDiv);
		jqDiv.remove(); // remove item from carousel
		ctx.remove(item.index); // remove item
		ctx.updateAll();
	    });
	};
	/*
	 * Object Loaded.  Check if objects have loaded. Valid widths and
	 * heights needed. */
	this.checkObjectsLoaded = function()
	{
	    var i;
	    for (i = 0; i < objects.length; i++)
	    {
		if ( ($(objects[i]).width() === undefined) || 
                     ( objects[i].complete !== undefined) && (!objects[i].complete) ) 
		{
                    return;
		}
	    }; // for loop
	    app.log(2, "checkObjectsLoaded done");
	    for( i = 0; i < objects.length; i++) 
	    {  // create and setup item
		var item = new Item(objects[i], options);
		items.addItem(item);
		this.setupItem(item);
		$(objects[i]).data('item', item);
	    }; // for loop
	    // save the storage item
	    if (objects.length > 0)
	    {  // construct a new object, todo this is too much because it sets css, handlers
	       this.item = new Item(objects[0], options);
	    }
	    // document layout seems to be done at this point so resize carousel
	    // todo find better place for this
	    this.resize();
	    // all objects have valid widths and heights, so stop checking.
	    clearInterval(this.tt);
	    this.updateAll();
	}; // checkObjectsLoaded()
	/*
	 * Bootstrapping. */
	this.tt = setInterval( function(){
	    ctx.checkObjectsLoaded();
	}, 50);
	// resize the carousel keeping the spot proportion
	this.resize = function()
	{
	    // get new width
	    var width = $(this.container).width(), height = $(this.container).height();
	    //app.log(2, "container w " + width + " h " + height);
	    
	    // scale spots, maintain aspect ratio
            var newWidth = width * options.xSpotRatio;
	    var newHeight = height * options.ySpotRatio;
	    var widthScale =  newWidth  / this.item.orgWidth;
	    var heightScale = newHeight / this.item.orgHeight;
	    var scale = (widthScale + heightScale) / 2;
            this.item.orgWidth     *= scale;
            this.item.orgHeight    *= scale;
	    this.item.plgOrgWidth  *= scale
	    this.item.plgOrgHeight *= scale

            // update items in list
            items.updateItemSizes(this.item);

	    // change size, todo remove hacks to position carousel correctly
	    /*
	      winW, winH were main window w, h
	      var rX = winW * 0.44; // 50% of 88%
	      var rY = winH * 0.276; // 40% of 69%
	      this.xCentre = rX*1.10;
	      this.yCentre = rY*0.68;
	      this.xRadius = rX*0.94,
	      this.yRadius = rY;
	    */
	    this.xCentre = (width  / 2) * 0.9 * 1.1;
	    this.yCentre = (height / 2) * 0.6 * 0.8;
	    this.xRadius = (width  / 2) * 0.9  ,
	    this.yRadius = (height / 2) * 0.6;

	    //app.log(2, "carousel sizes xCentre " + this.xCentre + " yCentre " + this.yCentre +
	    //                         " xRadius " + this.xRadius + " yRadius " + this.yRadius);
	    
	    this.widthOld = width; this.heightOld = height; // save container dimensions
	    // scale spots
	    this.updateAll();
	}
    }; /* Controller object. */

    /*
     * The jQuery plugin part. Iterates through items specified in
     * selector and inits a Controller class for each one. */
    $.fn.CloudCarousel = function(options) {
	this.each( function() {
	    options = $.extend({}, {
		minScale: 0.5,
		xSpotRatio: 0.3, // spot size percentage of window size
		ySpotRatio: 0.4, // spot size percentage of window size
		xPos: 0,
		yPos: 0,
		xRadius: 0,
		yRadius: 0,
		FPS: 30,
		speed: 0.2,
		mouseWheel: false,
		bringToFront: false
	    }, options);
	    /*
	     * Create a Controller for each carousel.*/
	    $(this).data('cloudcarousel', new Controller( this, $('.cloudcarousel',$(this)), options) );
	});
	return this;
    }; /* $.fn.CloudCarousel() */

})(jQuery);
