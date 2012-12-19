//
// iRelate.js
// iRelate Personal Web Exploration class
//

"use strict";

var GoCastJS = GoCastJS || {};

GoCastJS.iRelate = function (spot, info) {
    var self = this;
    var iRelateCurrentUser = $("body").attr("iRelateCurrentUser");
    if ((iRelateCurrentUser == "") || (iRelateCurrentUser == undefined))
        iRelateCurrentUser = "Tony";
    this.iRelateURL = "http://www.irelate.us/i.htm#" + iRelateCurrentUser.toLowerCase() + "&collaborationid=" + encodeURIComponent(info.roomname + info.spotnumber);
    this.timeout = 1000;
    this.spot = spot;
    this.jqSpot = $(spot);
    this.DIV = '<div id="miRelateContainer' + info.spotnumber + '" style="position:absolute; border-radius: 15px 15px 15px 15px; background-color:#444444; overflow:hidden;">' +
                '<iframe "miRelateIFrame' + info.spotnumber + '" src="' + this.iRelateURL + '" style="position:absolute; left:0px; top:0px; width:100%; height:100%;"/>' +
                '</div>';
    this.info = info;
    this.jqDiv = $(this.DIV).appendTo(this.jqSpot).css("position", "absolute");
    $("#miRelateContainer" + this.info.spotnumber).parent().css("background-color", "transparent");
    $("#miRelateContainer" + this.info.spotnumber).parent().css("border-color", "transparent");
    this.div = this.jqDiv[0];
    this.jqSpot.data('gcIRelate', this);
};

///
/// \brief rezise the ui object, set css dimensions and scale member var
///
/// \arg width, height the target sizes as integers
///
GoCastJS.iRelate.prototype.setScale = function (contWidth, contHeight) {
    if (contWidth < 880) {
        var scaleFactor = (contWidth / 880);
        $("#miRelateContainer" + this.info.spotnumber).css("-webkit-transform", "scale(" + scaleFactor + ")");
        var scaleUpFactor = 880 / contWidth * 100;
        $("#miRelateContainer" + this.info.spotnumber).css("width", scaleUpFactor + "%");
        $("#miRelateContainer" + this.info.spotnumber).css("height", scaleUpFactor + "%");
        var leftOffset = Math.round((880 - contWidth) / 2);
        $("#miRelateContainer" + this.info.spotnumber).css("left", "-" + leftOffset + "px");
        var topOffset = Math.round(((contHeight * (scaleUpFactor / 100) - contHeight) / 2)) + 18;
        $("#miRelateContainer" + this.info.spotnumber).css("top", "-" + topOffset + "px");
    }
    else {
        $("#miRelateContainer" + this.info.spotnumber).css("-webkit-transform", "scale(1.0)");
        $("#miRelateContainer" + this.info.spotnumber).css("width", "100%");
        $("#miRelateContainer" + this.info.spotnumber).css("height", "100%");
        $("#miRelateContainer" + this.info.spotnumber).css("left", "0px");
        $("#miRelateContainer" + this.info.spotnumber).css("top", "0px");
    }
};

///
/// \brief set the shared contents to info.links
///
GoCastJS.iRelate.prototype.doSpot = function (info) {
};
