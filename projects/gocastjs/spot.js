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
//   type: <string>
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
            number: 0,
            type: null,
            tinyIcon: null, icon: null,
            enabledDesc: null, disabledDesc: null,
            spotUI: null,  // (optional)
            domLocation: null,
            networkObject: null
        },
        methods: {
//?    getHTML: function() {},    // Get post-rendered HTML from the UI renderer
            setScale: function(width, height) { this.spotUI().setScale(width, height); },
            // virtual functions
            // refreshSpot - the work horse. When info is provided, update internal structure and refresh
            //               If info is null, then just refresh the spot.
            refreshSpot: function(info) {
                if (info) {
                    this.updateInfo(info);
                }
                this.spotUI().refreshSpot(info);
            },
            canSpotBeUtilized: function() {
                return true; //  (default behavior - feel free to override)
            },
            dragAndDropAction: function(event) {
                event.preventDefault(); // (default)
            },

            // pure virtuals to be implemented by the new class.
            getRawData: function() { throw this.type + ':getRawData() not implemented by child'; }, // gets application specific data direct
            updateInfo: function(info) { throw this.type + ':updateInfo() not implemented by child'; }
        },
        init: function() {
            var k, reqd = ['number', 'type', 'tinyIcon', 'icon', 'enabledDesc', 'disabledDesc', 'domLocation', 'networkObject'];

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
            setScale: function(width, height) { throw 'SpotUIBase::setScale() not implemented by child'; }
        },
        init: function() {
            if (!this.domLocation()) {
                throw 'no DOM location given by derived class.';
            }
            if (!this.spotParent()) {
                console.log('SpotUIBase: init - no UI given initially. Will use default.');
            }
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
        },
        methods: {
//?    getHTML: function() {},    // Get post-rendered HTML from the UI renderer
            // pure virtuals being overridden
            getRawData: function() { return this.code; }, // gets application specific data direct
            updateInfo: function(info) {
                if (info && !info.code) {
                    throw 'gcEdit::updateInfo() - info object does not contain "code" as required.';
                }

                this.code = info.code;
                // Because the editor is housed in the non-UI portion, we'll update it here.
                if (info.from !== this.networkObject().nick)
                {
                    console.log("gcEdit updateInfo ", info);
                    this.editor.setCode(info.code);
                }

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
                if (self.editor.isDirty()) // if editor contents has changed
                {
                  self.sendEdits();
                }
              };
            },
            ///
            /// \brief send editor updates
            ///
            sendEdits: function() {
              var code = this.editor.getCode();
              console.log("gcEdit::sendEdits ", code);
              this.editor.clearDirty();
              this.networkObject().SetSpot({spottype: "editor", spotnumber: this.number(), code: code});
            },
            updateTextArea: function(html) {
              console.log("gcEdit.updateTextArea ", html);
              return html;
            },
            updateFrame: function(code) {
              console.log("gcEdit.updateFrame ", code);
              return code;
            }
        },
        init: function() {
            var self = this;
            console.log('gcEdit::init() executing.');

            // Now do our specific initialization items.
            // Setup an editor.
            this.timeout = 1000;
            if (!this.domLocation()) {
                throw 'gcEdit: No domLocation specified.';
            }

            this.jqSpot = $(this.domLocation());

            this.editor = $("#gcTextArea", this.jqSpot).cleditor(
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
                            })[0];
            if (!this.editor) {
                throw 'gcEdit: instantiation of editor failed. Lack of dom div id?';
            }
            this.jqSpot.data('gcEdit', this);

            //if there's any initial editor content in info, use it
            if (this.code) {
              this.editor.setCode(this.code);
            }

            if (this.info) {
                this.number(this.info().spotnumber);
            }

            setInterval(this.getTimeoutCallback(), this.timeout);
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
        },
        methods: {
            setScale: function(width, height) {
                console.log('gcEditDefaultUI - setting width/height');
                this.div.style.width = width + 'px';
                this.div.style.height = height + 'px';
            },
            refreshSpot: function() {
                console.log('gcEditDefaultUI: refreshSpot called.');

            }
        },
        init: function() {
            console.log('gcEditDefaultUI: init() executing.');
            if (!this.domLocation()) { throw 'gcEditDefaultUI: domLocation not set.'; }
            if (!this.spotParent()) { throw 'gcEditDefaultUI: spotParent not set.'; }

            this.DIV = '<div id="gcEditDiv"><textarea id="gcTextArea"></textarea></div>';
            this.spot = this.domLocation();
            this.jqSpot = $(this.domLocation());
            this.jqDiv = $(this.DIV).appendTo(this.jqSpot).css("position", "absolute");
            this.div = this.jqDiv[0];
            this.item = this.jqSpot.data('item');

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
            fileviewerlist: null, uploadReader: null, uploadName: null, up: null, maxFileSize: 1, info: null
        },
        methods: {
//?    getHTML: function() {},    // Get post-rendered HTML from the UI renderer
            // pure virtuals being overridden
            getRawData: function() { return this.info; }, // gets application specific data direct
            updateInfo: function(info) {
                if (info && !info.links) {
                    throw 'gcFileShare::updateInfo() - info object does not contain "links" as required.';
                }

                this.info(info);
                // Because the editor is housed in the non-UI portion, we'll update it here.
                if (info.from !== this.networkObject().nick)
                {
                    console.log("gcFileShare updateInfo ", info);
                    this.setLinks(info.links);
                }

            },
            //TODO: Old implementation has the DOM with GoCastJS.gcFileShare.removeLink() calls being created
            //      during instantiation and passing the whole link list in the DOM itself. Blech. This should
            //      be modified so that the UI can address the parent spot via the DOM possibly through access
            //      of the spotmanager??? manager[spotnumber].removeLink(linkkey) ?
            removeLink: function(spotnum, links, remlinkkey) {
              var linksobj = JSON.parse(links.replace(/\'/g, '"'));
              delete linksobj[remlinkkey];
              this.networkObject().SetSpot({
                spottype: 'fileshare',
                spotnumber: spotnum,
                links: JSON.stringify(linksobj)
              }, function(msg) {
                console.log('removeLink - SetSpot callback: ', msg);
              });
            },
            setLinks: function(linksStr) {
              var links = JSON.parse(linksStr),
                  k, mods, onclick, self = this;

              if (!linksStr || linksStr === '') {
                return;
              }

              // Need to update our internal representation of the list of stringified links.
              this.info().links = linksStr;
            }
        },
        init: function() {
            var self = this;
            console.log('gcFileShare::init() executing.');

            // Now do our specific initialization items.
            if (!this.domLocation()) {
                throw 'gcFileShare: No domLocation specified.';
            }

            // Hold spot specific information as an object in a private member
            if (this.info()) {
                this.number(this.info().spotnumber);
            }

            this.fileviewerlist({files: [], links: []});
            this.uploadReader(new FileReader());
            this.uploadName('');
//TODO:FIX with test jig
//            this.up(GoCastJS.SendFileToFileCatcher(this.networkObject().connection, this.networkObject().room, this.networkObject().FILECATCHER));
            this.maxFileSize(5 * 1024 * 1024); // 5MB max.

            this.uploadReader().onload = function (oFREvent) {
              self.up().SendFile(self.uploadName(), oFREvent.target.result,
                function(msg, iq) {
                  var links = {};

                  if (self.info().links) {
                    links = JSON.parse(self.info.links);
                  }

                  console.log('SEND SUCCESSFUL.');
                  console.log('New link to filename: ' +  self.uploadName() + ' is: ' + $(iq).attr('link'));
                  // Add 'link' and uploadName to links object and call setspot
                  links[self.uploadName] = $(iq).attr('link');
                  self.networkObject().SetSpot({spottype: 'fileshare', spotnumber: self.number(), links: JSON.stringify(links)}, function(msg) {
                      console.log(msg);
                    });

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
            links: []
        },
        methods: {
            refreshSpot: function(linksStr) {
                var links = JSON.parse(linksStr),
                    k, mods, onclick, self = this;

                console.log('gcFileShareDefaultUI: refreshSpot called.');

                // Now iterate through them and put them in the div.
                this.links().empty();
                this.fileviewerlist = {files: [], links: []};
                mods = '';

                this.showStatus('Drop files here...');
                for (k in links) {
                  if (links.hasOwnProperty(k)) {
                    onclick = 'GoCastJS.gcFileShare.removeLink(' +
                                    this.number().toString() + ', \'' +
                                    linksStr.replace(/\"/g, '\\\'') + '\', \'' +
                                    k +
                                  '\')';

                    this.hideStatus();
                    if (GoCastJS.FileViewer.isformatsupported(k)) {
                      mods += ('<li class="linkitem"><a href="javascript:void(0);" doclink="' + encodeURI(links[k]) +
                               '" class="link viewable" title="Open in FileViewer: ' + k + '">' + k + '</a>' +
                               '<a href="javascript:void(0);" class="linkaction remove" onclick="' +
                               onclick + '" title="Remove: ' + k + '">x</a><a target="_blank" href="' + encodeURI(links[k]) +
                               '" class="linkaction download" title="Download: ' + k + '">&darr;</a></li>');

                      this.fileviewerlist.files.push(k);
                      this.fileviewerlist.links.push(links[k]);
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
                                           $(this).attr('doclink'), self.fileviewerlist);
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
            ///
            /// \brief rezise the ui object, set css dimensions and scale member var
            ///
            /// \arg width, height the target sizes as integers
            ///
            setScale: function(width, height)
            {
              console.log('gcFileShareDefaultUI - setting width/height');
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
                this.spotParent().uploadName(oFile.name);
                this.spotParent().uploadReader().readAsBinaryString(oFile);
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
                       '<div id="fileinput" title="Open file">+<input id="uploadFile" type="file" name="myFile" onchange="loadAFile(' +
                       this.jqSpot.attr('id') + ');" /></div>' +
                       '</div>';
            this.jqDiv = $(this.DIV).appendTo(this.jqSpot).css("position", "absolute");
            this.div = this.jqDiv[0];
            this.item = this.jqSpot.data('item');
            this.links($('#gcFileShareDiv > #links > ul', this.jqSpot));

            this.dndZone = this.jqSpot.get(0);

//TODO dragAndDropAction at the logic level - override with which/what?
            this.dndZone.ondragover = function () {
              this.classList.add('enter');
              return false;
            };

            this.dndZone.ondragleave = function() {
              this.classList.remove('enter');
              return false;
            };

            this.dndZone.ondragend = function () {
              this.classList.remove('enter');
              return false;
            };

            this.dndZone.ondrop = function (e) {
              this.classList.remove('enter');
              e.preventDefault();
              self.UploadFile(e.dataTransfer.files);
            };

            // Old init()
            this.jqSpot.data('gcFileShare', this);

            $('.name', this.jqSpot).text('Fileshare').css('position', 'absolute');
            this.jqSpot.hover(function() {
                //TODO: REFACTOR
                app.carousel.disableMousewheel();
              },
              function() {
                //TODO: REFACTOR
                app.carousel.enableMousewheel();
            });

            this.showStatus('Drop files here...');
        },
        base: GoCastJS.SpotUIBase
    });

}(GoCastJS));

function loadAFile(spotid) {
'use strict';
  var gcfileshare = $('#' + spotid).data('gcFileShare');

  if (gcfileshare) {
    gcfileshare.UploadFile();
  }
  else {
    alert('Cannot load file. Spotid is lost: ' + spotid);
  }
}

