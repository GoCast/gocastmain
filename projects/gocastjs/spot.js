/*jslint sloppy: false, white: true, todo: true, browser: true, devel: true */
/*global $, FileReader */

//
// Spot and SpotUI base classes
//

var GoCastJS = GoCastJS || {};
//var GoCastJS = (null !== GoCastJS) ? GoCastJS : {};

(function(module) {
'use strict';
// @module SpotBase - Abstract class.
//   Derived classes must implement
//   tinyIcon: <url>
//   icon: <url>
//   enabledDescription: <string>
//   disabledDescription: <string>
//   domLocation: where will the UI reside in the DOM
//   networkObject: required object passed in for making calls back to the network.
//
// Spots may hold their application specific data in any manner they desire.
// Spots must publish how their specific info works such that another vendor
//   can write a SpotUI class for rending this data.
// Spots must provide a basic UI for those applications which do not have a
//   specific knowledge of the spot information.
// When a Spot is created, if a spotUI is not provided, then the Spot will
//   be responsible for instantiating its own basic UI renderer.
//
    module.SpotBase = module.Class({
        privates: {
            spotnumber: 0,
            tinyIcon: null, icon: null,
            enabledDesc: null, disabledDesc: null,
            spotUI: null,  // (optional)
            domLocation: null,
            networkObject: null,
            nick: null,
            info: {},
        },
        methods: {
//?    getHTML: function() {},    // Get post-rendered HTML from the UI renderer
            setScale: function(width, height) { this.spotUI().setScale(width, height); },
            // virtual functions
            // refreshSpot - the work horse. When info is provided, update internal structure and refresh
            //               If info is null, then just refresh the spot.
            refreshSpot: function(info) {
                if (info) {
                    this.spotnumber(info.spotnumber);
                    this.updateInfo(info);
                }

                this.spotUI().refreshSpot(info);
            },
            canSpotBeUtilized: function() {
                return true; //  (default behavior - feel free to override)
            },

            // pure virtuals to be implemented by the new class
            getRawData: function() { throw ':getRawData() not implemented by child'; }, // gets application specific data direct
            updateInfo: function(info) { throw ':updateInfo() not implemented by child'; }
        },
        init: function() {
            var k, reqd = ['spotnumber', 'nick', 'domLocation', 'networkObject'];
            // Optional: enabledDesc, disabledDesc
            //           tinyIcon, icon  (must be implemented by child however)

            console.log('SpotBase::init() executing.');

            for (k = 0 ; k < reqd.length ; k +=1) {
//                console.log('SpotBase: checking for required: ' + reqd[k]);
                if (!this[reqd[k]]()) {
                    throw 'required initialization item missing from derived class for: ' + reqd[k];
                }
            }

            //
            // The rule is - when you overload SpotBase, you'll need to make a SpotUIBase based class which is
            // the default UI class. In your overloaded SpotBase class, you'll need to see if no spotUI is passed
            // in. If not, then instantiate yours.
//            if (!this.spotUI) {
//                this.spotUI(new module.SpotUIBaseDerivedDefault({domLocation: this.domLocation(), spotParent: this }));
//            }
            // If a spotUI was given, then we need to ensure it's dom location and parenting are correct.
            if (this.spotUI()) {
                console.log('SpotBase::init() - Setting up dom/parent for UI given at instantiation.');
                this.spotUI().domLocation(this.domLocation());
                this.spotUI().spotParent(this);
            }
        }
    });

//
// Utilize ‘init()’ to setup your own template of HTML, your own div, etc
// based upon the inbound ‘domLocation’ given by the caller who instantiates.
//

    module.SpotUIBase = module.Class({
        privates: {
            domLocation: null, // (must be set by instantiation)
            spotParent: null // (must be set)
        },
        methods: {
            // virtual functions
            // refreshSpot - the work horse. When info is provided, update internal structure and refresh
            //               If info is null, then just refresh the spot.
            // This function should call its parent’s getRawData() and interpret it here.
            refreshSpot: function(info) { throw 'SpotUIBase::refreshSpot() not implemented by child'; },
            setScale: function(width, height) { throw 'SpotUIBase::setScale() not implemented by child'; },
            clearContainer: function() { throw 'SpotUIBase::clearContainer() not implemented by child'; },
            dragAndDropAction: function(event) {
                event.preventDefault(); // (default)
            }
        },
        init: function() {
            if (!this.domLocation()) {
                throw 'no DOM location given by derived class.';
            }
            if (!this.spotParent()) {
                throw 'no parent given by derived class.';
            }

            // Must be overridden if drag-n-drop is supported for a spot.
            this.domLocation().ondragover = this.dragAndDropAction;
            this.domLocation().ondragleave = this.dragAndDropAction;
            this.domLocation().ondragend = this.dragAndDropAction;
            this.domLocation().ondrop = this.dragAndDropAction;
        }
    });
}(GoCastJS));

//
//   g c E d i t  -  I m p l e m e n t a t i o n
//
(function(module) {
'use strict';
    module.gcEdit = module.Class({
        privates: {
            timeout: 1000
        },
        methods: {
//?    getHTML: function() {},    // Get post-rendered HTML from the UI renderer
            // pure virtuals being overridden
            getRawData: function() { return this.info(); }, // gets application specific data direct
            updateInfo: function(info) {
                if (!info) {
                    throw 'gcEdit::updateInfo() - No info passed in.';
                }

                if (info && !info.code) {
                    throw 'gcEdit::updateInfo() - info object does not contain "code" as required.';
                }

                this.info(info);
                this.spotUI().setCode(info.code);
            },
            ///
            /// \brief get method to send edit updates when timer goes off
            ///
            getTimeoutCallback: function() {
              var self = this; // closure var for timeout callback
              return function()
              {
                // check if there's anything to send
//                console.log("gcEdit timeout ");
                if (self.spotUI() && self.spotUI().isDirty()) // if editor contents has changed
                {
                  self.sendEdits();
                }
              };
            },
            ///
            /// \brief send editor updates
            ///
            sendEdits: function() {
              var code = this.spotUI().getCode();
              console.log("gcEdit::sendEdits ", code);

              this.spotUI().clearDirty();
              this.networkObject().SetSpot({spottype: "editor", spotnumber: this.spotnumber(), code: code});
            }
        },
        init: function() {
            var self = this;
            console.log('gcEdit::init() executing.');

            // Now do our specific initialization items.
            this.tinyIcon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAf9JREFUeNrUmdFxwjAMQEmPf7xB2QBGSDfIBi0bpBuwQT2CuwEbNCO4G6QbmAlS5yr3jE42SpETqjsdRGfkF0WWHVENw7C6Z3lgjqsJm/LaEPY9KJYGfjNNxghe0f3wIxrZT2DfI7sDpXycGPNd6JpxDyqKDGXHUdlkfEyO4Bo5OWZAdl67yL6DT+3VEb47ho/eq0G2C6lgkWy92sTdzyEHAE0uknZBuPAUVA6wWbiabBIr/zcHH5H9CZWNN6+fEOn4rseceoX0CPLB9KGjPGYtklSCB3HIHhaGTYy/5sNJFurFhFMHx1JwJlaZgUfXI/v7BB/snQTLagY1aM6aGrck4Lj99TBflxoXCjU+0lT/KQdLFea47rWoVC2ag4aYzxGnokVykILLQs4JmINLQs5VqMf69xxdf2X25GbunQTDfcICOdzDVkfB1bAPGxZkwRzEOWe9KqJYu1wOlgIUgSsFKAZXAlAUThpQHE4SsAicFOCR2A1E4KQALZp8gIjeDCcBqGB8SzxmcyucBGCDGkiTTyulATXRyTJScBKANtFSMxJwufZbl3kFbWGzV9AZ2MLpxML3uNl5hmv75+MGkPYDXzTKvxClHtVBfUvkcAQ19E44siXawj1EPagTO7ChgusYR/Lwgv0CUVQlX7IqostfZ+7HikaHIdW9/w3xLcAAMHiRum9ki5gAAAAASUVORK5CYII=');
            this.icon(this.tinyIcon());

            // Setup an editor.
            this.timeout(1000);
            this.typeIndicator = 'editor';

            if (!this.domLocation()) {
                throw 'gcEdit: No domLocation specified.';
            }

            if (this.info() && this.info().spotnumber) {
                this.spotnumber(this.info().spotnumber);
            }

            if (!this.disabledDesc()) {
                this.disabledDesc('Cannot edit at this time.');
            }

            if (!this.enabledDesc()) {
                this.enabledDesc('Edit text documents collaboratively');
            }

            setInterval(this.getTimeoutCallback(), this.timeout());
            /*
            // override mouseover event, prevent showing zoom, trash icons
            // since zooming editor doesn't work yet
            this.jqSpot.mouseover(function(event)
            {
              event.stopPropagation();
              return false;
            });
            */

            //
            // The rule is - when you overload SpotBase, you'll need to make a SpotUIBase based class which is
            // the default UI class. In your overloaded SpotBase class, you'll need to see if no spotUI is passed
            // in. If not, then instantiate yours and setup dom location and the parent during instantiation.
            if (!this.spotUI()) {
                console.log('gcEdit::init() - Instantiating default UI - none specified.');
                this.spotUI(new module.gcEditDefaultUI({domLocation: this.domLocation(), spotParent: this }));
            }

        },
        base: GoCastJS.SpotBase
    });

    module.gcEditDefaultUI = module.Class({
        privates: {
            editor: null
        },
        publics: {
            DIV: null, spot: null, jqSpot: null, jqDiv: null, div: null, item: null
        },
        methods: {
            setScale: function(width, height) {
//                console.log('gcEditDefaultUI - setting width/height');
                this.div.style.width = width + 'px';
                this.div.style.height = height + 'px';
            },
            refreshSpot: function(info) {
                // If we have updated info, update it in the parent before refreshing.
                if (info && info.code) {
                    this.spotParent().updateInfo(info);
                }

                if (this.spotParent().nick() !== this.spotParent().getRawData().from) {
                    console.log('gcEditDefaultUI: refreshSpot called.');
                    this.setCode(this.spotParent().getRawData().code);
                }
            },
            clearContainer: function() {
                this.jqDiv.remove();
            },
            isDirty: function() {
                return this.editor().isDirty();
            },
            clearDirty: function() {
                this.editor().clearDirty();
            },
            getCode: function() {
                return this.editor().getCode();
            },
            setCode: function(code) {
                this.editor().setCode(code);
            },
            updateTextArea: function(html) {
              console.log("gcEditDefaultUI.updateTextArea ", html);
              return html;
            },
            updateFrame: function(code) {
              console.log("gcEdit.updateFrame ", code);
              return code;
            }
        },
        init: function() {
            var parInfo, self = this;

            console.log('gcEditDefaultUI: init() executing.');
            if (!this.domLocation()) { throw 'gcEditDefaultUI: domLocation not set.'; }
            if (!this.spotParent()) { throw 'gcEditDefaultUI: spotParent not set.'; }

            this.DIV = '<div id="gcEditDiv"><textarea id="gcTextArea"></textarea></div>';
            this.spot = this.domLocation();
            this.jqSpot = $(this.domLocation());
            this.jqDiv = $(this.DIV).appendTo(this.jqSpot).css("position", "absolute");
            this.div = this.jqDiv[0];
            // Used by carousel for locating.
            this.item = this.jqSpot.data('item');

            this.editor( $("#gcTextArea", this.jqSpot).cleditor(
                            {width:"100%", height:"100%",
                             updateTextArea:function(html)
                             {
                               return self.updateTextArea(html);
                             },
                             updateFrame:function(code)
                             {
                               return self.updateFrame(code);
                             },
                             controls:     // controls to add to the toolbar
                              "| | | | | | bullets numbering | pastetext | link unlink print source"
                            })[0] );
            if (!this.editor()) {
                throw 'gcEdit: instantiation of editor failed. Lack of dom div id?';
            }

            parInfo = this.spotParent().getRawData();
            //if there's any initial editor content in info, use it
            if (parInfo.code) {
              this.editor().setCode(parInfo.code);
            }

        },
        base: GoCastJS.SpotUIBase
    });

}(GoCastJS));

(function(module) {
'use strict';
    /* Fileshare logic requires:
        - FileReader for drag-n-drop hookup
        - SendToFileCatcher for sending the file to the server
        - A list of links to show the user which comes from the server formulated after upload is complete.
        - Removing links per the UI
        - Adding/uploading per the UI
    */
    module.gcFileShare = module.Class({
        privates: {
            fileviewerlist: null, up: null, maxFileSize: 1
        },
        methods: {
//?    getHTML: function() {},    // Get post-rendered HTML from the UI renderer
            // pure virtuals being overridden
            getRawData: function() { return this.info(); }, // gets application specific data direct
            updateInfo: function(info) {
                if (!info) {
                    throw 'gcFileShare::updateInfo() - No info given as required.';
                }

//                if (info && !info.links) {
//                    throw 'gcFileShare::updateInfo() - info object does not contain "links" as required.';
//                }

                this.info(info);
                // Because the editor is housed in the non-UI portion, we'll update it here.
                if (info.from !== this.nick() && info.links)
                {
                    console.log("gcFileShare updateInfo ", info);
                    this.setLinks(info.links);
                }

            },
            removeLink: function(remlinkkey) {
              var linksobj = JSON.parse(this.info().links.replace(/\'/g, '"'));
              delete linksobj[remlinkkey];
              this.networkObject().SetSpot({
                spottype: 'fileshare',
                spotnumber: this.spotnumber(),
                links: JSON.stringify(linksobj)
              }, function(msg) {
                console.log('removeLink - SetSpot callback: ', msg);
              });
            },
            setLinks: function(linksStr) {
              var links, k, mods, onclick, self = this;

              try {
                 links = JSON.parse(linksStr);
              }
              catch(e) {
                links = '';
              }

              if (!linksStr || linksStr === '') {
                return;
              }

              // Need to update our internal representation of the list of stringified links.
              this.info().links = linksStr;
            },
            addNewFileToLinks: function(name, link) {
                var links;

                try {
                    links = JSON.parse(this.info().links);
                }
                catch(e) {
                    links = {};
                }

                // Add 'link' and uploadName to links object and call setspot
                links[name] = link;
                console.log('addNewFileToLinks: New links list: ', links.toString());
                this.networkObject().SetSpot({spottype: 'fileshare', spotnumber: this.spotnumber(), links: JSON.stringify(links)}, function(msg) {
                      console.log(msg);
                });
            }
        },
        statics: {
            loadAFile: function(spotid) {
              var gcfileshare = app.spotfactory.spotlist()[Number(spotid)];

              if (gcfileshare) {
                gcfileshare.UploadFile();
              }
              else {
                alert('Cannot load file. Spotid is lost: ' + spotid);
              }
            }
        },
        init: function() {
            var self = this;
            console.log('gcFileShare::init() executing.');

            // Now do our specific initialization items.
            this.typeIndicator = 'fileshare';
            
            this.icon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAC10lEQVQ4jW1TvUosTRCt/pmeRadXR3YRBDM1E0PB2AcwNlpRWdgN1kDEwFQwE0EWwcxF2EDUQHwBX8EHMBCUYccRXWVm+qduUBfxfvtV0EFXne6qc+qwo6Ojfr/PGGOMwb+BiIwxOoUQiIiIQghrrXNufX2dLS4uUs57P4qnS0QcDoc/l5VKRSnlnJNU4b0XQjjnRsEAoLVutVq1Wg0RPz8/e73e6+trEASSAJxzay2MRBAEaZo2Go1ms0mVQoiXl5dutxvHsaS36RwNRPTer6ys/G5Qa+2cQ0RurSUCqBQRAcBa6713ziVJ0mq1lpeXrbU0PJUZYwCAE6woiiRJsizLsixJEudcURRZlp2cnCwtLR0eHkopOedBEADA29sbfSA553meT09P7+3txXHMGBsMBqenp19fX/1+/+PjY3NzM4qiPM/r9ToiZll2f39fqVTyPJfOOapot9vOOcYY53xubk5r/fj4uL+/r7Uuy7Lb7VKWMRZFEckuGWPGmGq1CgBlWUoprbWrq6udTufi4mJqaoqGrFarP3tijCH9JXHzm23OOWMsz3NrLSJaaznnQoiyLAGAFolU+At+f38HAKUUtX13d9doNBYWFg4ODur1ep7nw+FQCEGwsbExKSUAsFqtZoyZmZnZ2tqanJwkMo+Pj7+/v29ubp6enjY2Nubn5zudjtYaALIsOz8/f35+FkLAxMREHMfj4+O0PfR8tVqNokgpdXt72+v1zs7OqH8aZHd3FwDiOOZ0K6WM41hrrbUmwYQQYRiura2ladpsNoui+NkNapAxxp1z3ntrbVmWxhhjTFmW9AkARFG0s7Pz8PAQhuGPbYhdROSEdP8XRC8AXF5eAoCUkjYsTVMAMMZIopf0GHWFtVYpdXV15b2fnZ1FxMFgcH19HQSBtZYppbz3nPNRM1OQH35ngyAgh/Dt7W0yEOn+n/iBBUGglFJKhWFIqXa7/QdFdCRFyhRfmwAAAABJRU5ErkJggg==');
            this.tinyIcon(this.icon());

            if (!this.domLocation()) {
                throw 'gcFileShare: No domLocation specified.';
            }

            // Hold spot specific information as an object in a private member
            if (this.info() && this.info().spotnumber) {
                this.spotnumber(this.info().spotnumber);
            }

            if (!this.disabledDesc()) {
                this.disabledDesc('Cannot use Fileshare at this time.');
            }

            if (!this.enabledDesc()) {
                this.enabledDesc('Upload and share files with all participants.');
            }

            this.fileviewerlist({files: [], links: []});
            this.up(new GoCastJS.SendFileToFileCatcher(this.networkObject().connection, this.networkObject().room, this.networkObject().FILECATCHER));
            this.maxFileSize(5 * 1024 * 1024); // 5MB max.

            //
            // The rule is - when you overload SpotBase, you'll need to make a SpotUIBase based class which is
            // the default UI class. In your overloaded SpotBase class, you'll need to see if no spotUI is passed
            // in. If not, then instantiate yours and setup dom location and the parent during instantiation.
            if (!this.spotUI()) {
                console.log('gcFileShare::init() - Instantiating default UI - none specified.');
                this.spotUI(new module.gcFileShareDefaultUI({domLocation: this.domLocation(), spotParent: this }));
            }

            //if there's any initial editor content in info, use it
            if (this.info() && this.info().links) {
                this.refreshSpot(this.info());
            }
        },
        base: GoCastJS.SpotBase
    });

    module.gcFileShareDefaultUI = module.Class({
        privates: {
            links: [], uploadReader: null, uploadName: null
        },
        methods: {
            refreshSpot: function(info) {
                var links = {}, linksStr, k, mods, onclick, self = this, fvl;

                // If we have inbound changes, set those up before refreshing.
                if (info && info.links) {
                    this.spotParent().setLinks(info.links);
                }

                try {
                    linksStr = this.spotParent().getRawData().links;
                    links = JSON.parse(this.spotParent().getRawData().links);
                }
                catch(e) {
                    console.log('Error: gcFileShareDefaultUI::refreshSpot - links were no good: ', this.spotParent().getRawData().links);
                    return;
                }

                console.log('gcFileShareDefaultUI: refreshSpot called.');

                // Now iterate through them and put them in the div.
                this.links().empty();
                this.spotParent().fileviewerlist = {files: [], links: []};
                mods = '';
                fvl = this.spotParent().fileviewerlist;

                this.showStatus('Drop files here...');
                for (k in links) {
                  if (links.hasOwnProperty(k)) {
                    onclick = 'app.spotfactory.spotlist()[' +
                                    this.spotParent().spotnumber().toString() + '].removeLink(\'' +
                                    k + '\')';

                    this.hideStatus();
                    if (GoCastJS.FileViewer.isformatsupported(k)) {
                      mods += ('<li class="linkitem"><a href="javascript:void(0);" doclink="' + encodeURI(links[k]) +
                               '" class="link viewable" title="Open in FileViewer: ' + k + '">' + k + '</a>' +
                               '<a href="javascript:void(0);" class="linkaction remove" onclick="' +
                               onclick + '" title="Remove: ' + k + '">x</a><a target="_blank" href="' + encodeURI(links[k]) +
                               '" class="linkaction download" title="Download: ' + k + '">&darr;</a></li>');

                      fvl.files.push(k);
                      fvl.links.push(links[k]);
                    } else {
                      mods += ('<li class="linkitem"><a target="_blank" href="' + links[k] + '" class="link" title="Download: ' + k + '">' +
                               k + '</a><a href="javascript:void(0);" class="linkaction remove" onclick="' +
                               onclick + '" title="Remove: ' + k + '">x</a></li>');
                    }
                  }
                }

                this.links().append(mods);
                $('.link.viewable', $(this.links())).click(function() {
                  GoCastJS.FileViewer.open($('#fileviewer'), $('#mask'), $(this).text(),
                                           $(this).attr('doclink'), fvl);
                });
            },
            showStatus: function(msg) {
              $('#status', this.jqDiv).addClass('show').text(msg);
              $('#links', this.jqDiv).addClass('hide');
              $('#fileinput', this.jqDiv).addClass('hide');
              $('#dnd', this.jqDiv).addClass('hide');
            },
            hideStatus: function(msg) {
              $('#status', this.jqDiv).removeClass('show');
              $('#links', this.jqDiv).removeClass('hide');
              $('#fileinput', this.jqDiv).removeClass('hide');
              $('#dnd', this.jqDiv).removeClass('hide');
            },
            setStatus:function(msg) {
              $('#status', this.jqDiv).text(msg);
            },
            clearContainer: function() {
                this.jqDiv.remove();
            },
            ///
            /// \brief rezise the ui object, set css dimensions and scale member var
            ///
            /// \arg width, height the target sizes as integers
            ///
            setScale: function(width, height)
            {
//              console.log('gcFileShareDefaultUI - setting width/height');
              this.div.style.width = width + 'px';
              this.div.style.height = height + 'px';

              $('#links', this.jqDiv).css({
                'width': width + 'px',
                'height': (0.9*height) + 'px'
              });
              $('#fileinput', this.jqDiv).css({
                'top': (0.9*height) + 'px',
                'width': width + 'px',
                'height': (0.1*height) + 'px',
                'line-height': (0.1*height) + 'px'
              });
              $('#status', this.jqDiv).css({
                'line-height': height + 'px'
              });
            },
            UploadFile: function(DragDropFiles) {
              var us = $('#uploadFile', this.jqSpot).get(0),
                  self = this,
                  oFile;

              // In the case of Drag-N-Drop, we have to get the file info from the calling parameter
              if (!DragDropFiles) {
                if (us.files.length === 0) { return; }
                oFile = us.files[0];
              }
              else {
                // In drag-n-drop, we are given the files array directly.
                if (DragDropFiles.length === 0) { return; }
                oFile = DragDropFiles[0];
              }

              if (oFile.size > this.maxFileSize) {
                this.showStatus('File too big (Max size: ' + this.maxFileSize/1024 + ' KB)');
                setTimeout(function() { self.hideStatus(); }, 2000);
              }
              else {
                this.showStatus('Sharing: ...');
                this.uploadName(oFile.name);
                this.uploadReader().readAsBinaryString(oFile);
              }
            }
        },
        init: function() {
            var self = this;

            console.log('gcFileShareDefaultUI: init() executing.');
            if (!this.domLocation()) { throw 'gcFileShareDefaultUI: domLocation not set.'; }
            if (!this.spotParent()) { throw 'gcFileShareDefaultUI: spotParent not set.'; }

            this.spot = this.domLocation();
            this.jqSpot = $(this.domLocation());
            this.DIV = '<div id="gcFileShareDiv" class="fileshare">' +
                       '<div id="status"></div>' +
                       '<div id="links"><ul></ul></div>' +
                       // TODO: REFACTOR -- prefer to not have a global function called from the script
                       // STEP1: Make loadAFile a static inside of GoCastJS.gcFileShare and call that instead.
                       // STEP2: Formulate the onchange to consider that 'module' name may not be GoCastJS in the future.
                       '<div id="fileinput" title="Open file">+<input id="uploadFile" type="file" name="myFile" onchange="GoCastJS.gcFileShare.loadAFile(\'' +
                       this.jqSpot.attr('id') + '\');" /></div>' +
                       '</div>';
            this.jqDiv = $(this.DIV).appendTo(this.jqSpot).css("position", "absolute");
            this.div = this.jqDiv[0];
            this.item = this.jqSpot.data('item');
            this.links($('#gcFileShareDiv > #links > ul', this.jqSpot));

            //
            // Drag N Drop handlers
            //
            this.domLocation().ondragover  = function () {
              this.classList.add('enter');
              return false;
            };

            this.domLocation().ondragleave = function() {
              this.classList.remove('enter');
              return false;
            };

            this.domLocation().ondragend = function () {
              this.classList.remove('enter');
              return false;
            };

            this.domLocation().ondrop = function (e) {
              this.classList.remove('enter');
              e.preventDefault();
              self.UploadFile(e.dataTransfer.files);
            };

            // Old init()
            $('.name', this.jqSpot).text('Fileshare').css('position', 'absolute');
            this.jqSpot.hover(function() {
                //TODO: REFACTOR -- possibly pull this out into app/carousel and have them 'do' this when a fileshare spot is instantiated
                app.carousel.disableMousewheel();
              },
              function() {
                //TODO: REFACTOR
                app.carousel.enableMousewheel();
            });

            this.uploadName('');
            this.uploadReader(new FileReader());

            this.uploadReader().onload = function (oFREvent) {
              self.spotParent().up().SendFile(self.uploadName(), oFREvent.target.result,
                function(msg, iq) {
                  console.log('SEND SUCCESSFUL.');
                  console.log('New link to filename: ' +  self.uploadName() + ' is: ' + $(iq).attr('link'));

                  self.spotParent().addNewFileToLinks(self.uploadName(), $(iq).attr('link'));

                  self.setStatus('Sharing: DONE');
                  setTimeout(function() { self.hideStatus(); }, 2000);
                },
                function() {
                  console.log('SEND FAILED.');
                  self.setStatus('Sharing: FAILED');
                  setTimeout(function() { self.hideStatus(); }, 2000);
                },
                function(name, sent, total) {
                  if (total) {
                    self.setStatus('Sharing: ' + Math.floor((sent*100)/total) + '%');
                  }
                });
            };

            this.showStatus('Drop files here...');
        },
        base: GoCastJS.SpotUIBase
    });

}(GoCastJS));

(function(module) {
'use strict';
    module.gcDeskShare = module.Class({
        privates: {
        },
        methods: {
//?    getHTML: function() {},    // Get post-rendered HTML from the UI renderer
            // pure virtuals being overridden
            canSpotBeUtilized: function() {
                // TODAY: 07/1/13 - If we're native Chrome 26+, we can use it.
                // SOON: If we're native Chrome26+ **OR** our plugin is >X version... then we can use it.
                return $.urlvars.deskshareable;
            },
            getRawData: function() { return this.info(); }, // gets application specific data direct
            refreshSpot: function(info) {
                var self = this;

                if (info) {
                    this.updateInfo(info);
                }
//TODO - think a lot of this needs to stay in logic arena but some is UI too.
                if (info.owner === this.nick()) {
                    navigator.webkitGetUserMedia({
                      video: {
                        mandatory: {
                          chromeMediaSource: 'screen',
                          minWidth: '1280',
                          minHeight: '720',
                          maxWidth: '1280',
                          maxHeight: '720',
                          minFrameRate: '5',
                          maxFrameRate: '5'
                        }
                      }
                    },
                    function(stream) {
                      Callcast.localdesktopstream = stream;
                      self.screen.src = webkitURL.createObjectURL(stream);
                      Callcast.shareDesktop(Callcast.localdesktopstream);
                    },
                    function(e) {
                      showWarning('Desktop capture disabled', 'Please enable the "screen capture" feature in Chrome by opening a new tab ' +
                                                              'and typing "chrome://flags" in the address bar. After enabling ' +
                                                              'the feature, hit the "Relaunch" button to restart Chrome.');
                    });
                } else {
                    if ($.urlvars.wrtcable) {
                        if (Callcast.participants[info.owner]) {
                            Callcast.participants[info.owner].screenvid = this.screen;
                            if (Callcast.participants[info.owner].desktopstream) {
                                this.screen.src = webkitURL.createObjectURL(
                                    Callcast.participants[info.owner].desktopstream
                                );
                            }
                        }
                    }
                }

                this.spotUI().refreshSpot(info);
            },
            updateInfo: function(info) {
                if (info && !info.owner) {
                    throw 'gcDeskShare::updateInfo() - info object does not contain "owner" as required.';
                }

                this.info(info);
            },
        },
        init: function() {
            var self = this, desc;
            console.log('gcDeskShare::init() executing.');

            // Now do our specific initialization items.
            this.typeIndicator = 'deskshare';
            this.tinyIcon('data:image/png;base64,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');
            this.icon(this.tinyIcon());

            if (!this.domLocation()) {
                throw 'gcDeskShare: No domLocation specified.';
            }

            // Hold spot specific information as an object in a private member
            if (this.info()) {
                this.spotnumber(this.info().spotnumber);
            }

            // If someone hasn't already set the description for enabled...
            if (!this.enabledDescription()) {
                this.enabledDescription('Desktop sharing is an experimental feature. Performance may vary. We are working on making ' +
                                        'this feature more user-friendly and effective.')
            }

            // If someone hasn't already set the description for disabled, figure what's appropriate...
            if (!this.disabledDescription()) {
                    if ($.urlvars.wrtcable) {
                        desc = 'Feature not supported', 'To enable desktop sharing, please upgrade Chrome ' +
                                                             'to version 26 or above.';
                    } else if ($.urlvars.deskshareable) {
                        desc = 'Feature not supported', 'To enable desktop sharing, please click the ' +
                                                             '"GoCast HTML5" button to re-enter the room with a pure HTML5 ' +
                                                             'version of GoCast.';
                    } else {
                        desc = 'Feature not supported', 'To enable desktop sharing, please download Chrome ' +
                                                             'version 26 or above.';
                    }

                    this.disabledDescription(desc);
            }

            //
            // The rule is - when you overload SpotBase, you'll need to make a SpotUIBase based class which is
            // the default UI class. In your overloaded SpotBase class, you'll need to see if no spotUI is passed
            // in. If not, then instantiate yours and setup dom location and the parent during instantiation.
            if (!this.spotUI()) {
                console.log('gcDeskShare::init() - Instantiating default UI - none specified.');
                this.spotUI(new module.gcDeskShareDefaultUI({domLocation: this.domLocation(), spotParent: this }));
            }

            //if there's any initial editor content in info, use it
            if (this.info() && this.info().owner) {
                this.refreshSpot(this.info());
            }
        },
        base: GoCastJS.SpotBase
    });

    module.gcDeskShareDefaultUI = module.Class({
        privates: {
        },
        methods: {
            refreshSpot: function(info) {
//TODO -- did this get re-partitioned ok?
                if (info.owner === this.spotParent().nick()) {
                    $('div.name', this.jqSpot).text('My Desktop');
                }
                else {
                    if ($.urlvars.wrtcable) {
                        $('.zoom', this.jqSpot).css('right', '3px');
                    }
                    else {
                        if ($.urlvars.deskshareable || /^25/.test($.browser.version)) {
                            $('div#gcDeskShareDiv', this.jqSpot).html('<p id="err">You can view this remote desktop by clicking ' +
                                                                      'the green "GoCast HTML5" button. You will then re-enter the '+
                                                                      'room with a pure HTML5 version of GoCast.</p>');
                        } else {
                            $('div#gcDeskShareDiv', this.jqSpot).html('<p id="err">Your browser cannot display remote desktops. ' +
                                                                      'To enjoy this feature, download Chrome version 26 or above.</p>');
                        }
                        $('.zoom', this.jqSpot).remove();
                    }

                    $('.close', this.jqSpot).remove();
                    $('div.name', this.jqSpot).text(decodeURIComponent(info.owner.split('/')[0]) + '\'s Desktop');
                }

            },
            clearContainer: function() {
                this.jqDiv.remove();
            },
            ///
            /// \brief rezise the ui object, set css dimensions and scale member var
            ///
            /// \arg width, height the target sizes as integers
            ///
            setScale: function(width, height)
            {
//              console.log('gcDeskShareDefaultUI - setting width/height');
                this.div.style.width = width + 'px';
                this.div.style.height = height + 'px';
                $('#err', this.div).css({
                    'width': width + 'px',
                    'height': height + 'px'
                });

                if (this.zoomed()) {
                    this.screen.width = 1280;
                    this.screen.height = 720;
                } else {
                    this.screen.width = width;
                    this.screen.height = height;
                }
            },
            zoom: function(z) {
                this.zoomed(z);
                if (z) {
                    $(this.div).css('overflow', 'scroll');
                } else {
                    $(this.div).css('overflow', 'hidden');
                }
            }

        },
        init: function() {
            var self = this;

            console.log('gcDeskShareDefaultUI: init() executing.');
            if (!this.domLocation()) { throw 'gcDeskShareDefaultUI: domLocation not set.'; }
            if (!this.spotParent()) { throw 'gcDeskShareDefaultUI: spotParent not set.'; }

            this.spot = this.domLocation();
            this.jqSpot = $(this.domLocation());
            this.zoomed(false);
            this.DIV = '<div id="gcDeskShareDiv" class="deskshare"><video autoplay muted></video></div>';
            this.jqDiv = $(this.DIV).appendTo(this.jqSpot).css("position", "absolute");
            this.div = this.jqDiv[0];
            this.item = this.jqSpot.data('item');
            this.screen = $('video', this.div).get(0);
        },
        base: GoCastJS.SpotUIBase
    });

}(GoCastJS));

