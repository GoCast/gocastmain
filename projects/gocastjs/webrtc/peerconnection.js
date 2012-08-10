var GoCastJS = ('undefined' !== typeof(GoCastJS)) ? GoCastJS : {};
GoCastJS = (null !== GoCastJS) ? GoCastJS : {};

//!
//! constructor: GoCastJS.Exception(pluginId, message)
//!
//! members:
//!     pluginId <string> : unique id of exception throwing plugin instance
//!     message  <string> : description of the exception
//!
GoCastJS.Exception = function(pluginId, message) {
    this.pluginId = pluginId;
    this.message = message;
};

GoCastJS.Exception.prototype.toString = function() {
    return ('[' + this.pluginId + ']: ' + this.message);
};

//!
//! function: GoCastJS.CheckBrowserSupport()
//!
//! returns: 'true' if browser supported, 'false' if not.
//!
GoCastJS.CheckBrowserSupport = function() {
    return (null === navigator.userAgent.toLowerCase().match('msie'));
};

//!
//! function: GoCastJS.CheckGoCastPlayer()
//!
//! returns: 'true' if 'GoCastPlayer' detected, 'false' if not.
//!
GoCastJS.CheckGoCastPlayer = function() {
    for (i in navigator.plugins) {
        if ('GoCastPlayer' === navigator.plugins[i].name) {
            return true;
        }
    }
    return false;
};

//!
//! constructor: GoCastJS.UserMediaOptions(mediaHints, player)
//!
//! arguments/members:
//!     mediaHints  <obj>        : {audio: <bool>, video: <bool>}
//!     player      <HtmlObject> : plugin instance used for local preview
//!
GoCastJS.UserMediaOptions = function(mediaHints, player) {
    this.mediaHints = mediaHints;
    this.player = player;
};

//!
//! function: GoCastJS.getUserMedia(options, success, failure)
//!
//! arguments:
//!     options <GoCastJS.UserMediaOptions> : options for obtaining user media
//!     success <function(stream)>          : success callback with stream obj
//!     failure <function(message)>         : failure callback with message
//!
GoCastJS.getUserMedia = function(options, success, failure) {
    if (false === this.CheckBrowserSupport()) {
        if ('undefined' !== typeof(failure) && null !== failure) {
            failure('GoCastJS.getUserMedia(): ' + 
                    'This browser not supported yet.');
        }
    } else if (false === this.CheckGoCastPlayer()) {
        if ('undefined' !== typeof(failure) && null !== failure) {
            failure('GoCastJS.getUserMedia(): GoCastPlayer not detected.');
        }
    } else {
        var player = options.player;

        if (true === options.mediaHints.video) {
            if ('undefined' === typeof(options.mediaHints.videoin) ||
                null === options.mediaHints.videoin) {
                if ('undefined' === typeof(player.videoinopts['default'])) {
                    failure('GoCastJS.getUserMedia(): ' + 
                            'No video devices detected');
                } else {
                    options.mediaHints.videoin = player.videoinopts['default'];
                    console.log('GoCastJS: Choosing default video: ' + 
                                player.videoinopts[options.
                                                   mediaHints.
                                                   videoin]);
                }
            }
        }

        player.getUserMedia(
            options.mediaHints,
            function(stream) {
                if (false === player.init('localPlayer',
                                          'STUN stun.l.google.com:19302',
                                          null)) {
                    throw new GoCastJS.Exception(player.id, 'init() failed.');
                }

                if (false === player.addStream(stream)) {
                    throw new GoCastJS.Exception(player.id,
                                                 'addStream() failed.');
                }

                player.setLocalDescription(
                    'OFFER',
                    player.createOffer({audio: true, video: true}),
                    function() {
                        player.source = stream;
                        if ('undefined' !== typeof(success) &&
                            null !== success) {
                            success(stream);
                        }
                    },
                    function(message) {
                        console.log('localPlayer.setLocalDescription(): ',
                                    message);
                    }
                );
            },
            function(message) {
                if ('undefined' !== typeof(failure) && null !== success) {
                    failure(message);
                }
            }
        );
    }
};

//!
//! function: GoCastJS.SetSpkVolListener(volCheckInterval,
//!                                      localplayer,
//!                                      onSpkVolChanged)
//!
//! arguments:
//!     volCheckInterval    <milliseconds> : interval for volume check
//!     localPlayer         <HtmlObject>   : plugin used for local preview
//!     onSpkVolChanged     <function()>   : callback for volume change
//!
GoCastJS.SetSpkVolListener = function(volCheckInterval,
                                      localplayer,
                                      onSpkVolChanged) {
    //Inited to 256 (range is [0-255]) in order to always trigger
    // the callback on the first access to localplayer.volume
    var spkVol = 256;

    return setInterval(function() {
        if (spkVol !== localplayer.volume) {
            spkVol = localplayer.volume;
            onSpkVolChanged(spkVol);
        }
    }, volCheckInterval);
};

GoCastJS.SetVideoDevicesChangedListener = function(checkInterval,
                                                   localplayer,
                                                   onChanged) {
    var videoDevices = [];
    var videoInOpts = localplayer.videoinopts;

    for (i in videoInOpts) {
        videoDevices.push(i);
    }

    return setInterval(function() {
        var videoOptions = localplayer.videoinopts;
        var devicesAdded = [];
        var devicesDeleted = [];
        var i = 0;

        // Check for newly added devices
        for (i=0; i<videoDevices.length; i++) {
            if ('undefined' === typeof(videoOptions[videoDevices[i]])) {
                devicesDeleted.push(videoDevices[i]);
            }
        }

        // Check for newly deleted devices
        for(j in videoOptions) {
            if (-1 === videoDevices.indexOf(j)) {
                devicesAdded.push(j);
            }
        }

        // Refresh the current devices list
        videoDevices = [];
        for(j in videoOptions) {
            videoDevices.push(j);
        }

        // Call callback if device list has changed
        if (0 < devicesAdded || 0 < devicesDeleted) {
            onChanged(devicesAdded, devicesDeleted);
        }
    }, checkInterval);
}

//!
//! constructor: GoCastJS.PeerConnectionOptions(iceConfig,
//!                                             onIceMessage,
//!                                             onAddStream,
//!                                             onRemoveStream,
//!                                             player)
//!
//! arguments/members:
//!     iceConfig   <string>     : 'STUN <ip>:<port>'
//!     player      <HtmlObject> : width of plugin window
//!     onIceMessage       <function(sdp, moreComing)> : new ice candidate
//!     onAddStream        <function(stream)>          : new remote stream
//!     onRemoveStream     <function(stream)>          : remote stream removed
//!     onReadyStateChange <function()>                : ready state changed
//!
GoCastJS.PeerConnectionOptions = function(iceConfig,
                                          onIceMessage,
                                          onAddStream,
                                          onRemoveStream,
                                          onReadyStateChange,
                                          player) {
    this.iceConfig = iceConfig;
    this.onIceMessage = onIceMessage;
    this.onAddStream = onAddStream;
    this.onRemoveStream = onRemoveStream;
    this.onReadyStateChange = onReadyStateChange;
    this.player = player;
};

//!
//! constructor: GoCastJS.PeerConnection(options)
//!
//! arguments:
//!     options <GoCastJS.PeerConnectionOptions> : options to create peer
//!                                                connection
//!
//! members:
//!     player <HtmlObject> : 'GoCastPlayer' instance for this peerconnection
//!
GoCastJS.PeerConnection = function(options) {
    if (false === GoCastJS.CheckBrowserSupport()) {
        throw new GoCastJS.Exception(this.peerConn.id, 'Browser unsupported.');
    } else if (false === GoCastJS.CheckGoCastPlayer()) {
        throw new GoCastJS.Exception(this.peerConn.id, 'Plugin undetected.');
    } else {
        this.player = options.player;

        var playerRef = this.player;
        this.player.onaddstream = function(stream) {
            playerRef.source = stream;
            if ('undefined' !== typeof(options.onAddStream) &&
                null !== options.onAddStream) {
                options.onAddStream(stream);
            }
        };

        this.player.onremovestream = function(stream) {
            if ('undefined' !== typeof(options.onRemoveStream) &&
                null !== options.onRemoveStream) {
                options.onRemoveStream(stream);
            }
        };

        this.player.onreadystatechange = function() {
            if ('undefined' !== typeof(options.onReadyStateChange) &&
                null !== options.onReadyStateChange) {
                options.onReadyStateChange();
            }
        };

        if (false === this.player.init(this.player.id,
                                       options.iceConfig,
                                       options.onIceMessage)) {
            throw new GoCastJS.Exception(this.player.id, 'init() failed.');
        }
    }
};

//!
//! function: GoCastJS.PeerConnection.AddStream(stream)
//!
//! arguments:
//!     stream <obj> : stream to be added (given by GetUserMedia's
//!                    success callback)
//!
GoCastJS.PeerConnection.prototype.AddStream = function(stream) {
    if (false === this.player.addStream(stream)) {
        throw new GoCastJS.Exception(this.player.id, 'addStream() failed.');
    }
};

//!
//! function: GoCastJS.PeerConnection.RemoveStream(stream)
//!
//! arguments:
//!     stream <obj> : stream to be removed (given by GetUserMedia's
//!                    success callback)
//!
GoCastJS.PeerConnection.prototype.RemoveStream = function(stream) {
    if (false === this.player.removeStream(stream)) {
        throw new GoCastJS.Exception(this.player.id, 'removeStream() failed.');
    }
};

//!
//! function: GoCastJS.PeerConnection.CreateOffer(mediaHints)
//!
//! arguments:
//!     mediaHints <obj> : see GoCastJS.GetUserMedia()
//!
//! returns: sdp <string>
//!
GoCastJS.PeerConnection.prototype.CreateOffer = function(mediaHints) {
    var offer = this.player.createOffer(mediaHints);
    if ('' === offer) {
        throw new GoCastJS.Exception(this.player.id, 'createOffer() failed.');
    }
    return offer;
};

//!
//! function: GoCastJS.PeerConnection.CreateAnswer(offer, mediaHints)
//!
//! arguments:
//!     offer      <string> : sdp offer of remote peer
//!     mediaHints <obj>    : see GoCastJS.GetUserMedia()
//!
//! returns: sdp <string>
//!
GoCastJS.PeerConnection.prototype.CreateAnswer = function(offer, mediaHints) {
    var answer = this.player.createAnswer(offer, mediaHints);
    if ('' === answer) {
        throw new GoCastJS.Exception(this.player.id, 'createAnswer() failed.');
    }
    return answer;
};

//!
//! function: GoCastJS.PeerConnection.SetLocalDescription(action,
//!                                                       sdp,
//!                                                       success,
//!                                                       failure)
//!
//! arguments:
//!     action <string> : 'OFFER' (if offer) or 'ANSWER' (if Ôanswer)
//!     sdp    <string> : sdp to be used as local peer's description
//!     success <function()>        : success callback
//!     failure <function(message)> : failure callback with message
//!
GoCastJS.PeerConnection.prototype.SetLocalDescription = function(action,
                                                                 sdp,
                                                                 success,
                                                                 failure) {
    this.player.setLocalDescription(
        action,
        sdp,
        function() {
            if ('undefined' !== typeof(success) && null !== success) {
                success();
            }
        },
        function(message) {
            if ('undefined' !== typeof(failure) && null !== failure) {
                failure(message);
            }
        }
    );
};

//!
//! function: GoCastJS.PeerConnection.SetRemoteDescription(action, sdp)
//!
//! arguments:
//!     action <string> : 'OFFER' (if offer) or 'ANSWER' (if answer)
//!     sdp    <string> : sdp to be used as remote peer's description
//!
GoCastJS.PeerConnection.prototype.SetRemoteDescription = function(action,
                                                                  sdp) {
    if (false === this.player.setRemoteDescription(action, sdp)) {
        throw new GoCastJS.Exception(this.player.id, 'setRemoteSdp() failed.');
    }
};

//!
//! function: GoCastJS.PeerConnection.ProcessIceMessage(sdp)
//!
//! arguments:
//!     sdp <string> : sdp of remote peer's ice candidate
//!
GoCastJS.PeerConnection.prototype.ProcessIceMessage = function(sdp) {
    if (false === this.player.processIceMessage(sdp)) {
        throw new GoCastJS.Exception(this.player.id, 'procIceMsg() failed.');
    }
};

//!
//! function: GoCastJS.PeerConnection.StartIce()
//!
//! NOTE: should be called after GoCastJS.PeerConnection.SetLocalDescription()
//!
GoCastJS.PeerConnection.prototype.StartIce = function() {
    if (false === this.player.startIce()) {
        throw new GoCastJS.Exception(this.player.id, 'startIce() failed.');
    }
};

//!
//! function: GoCastJS.PeerConnection.Deinit()
//!
//! NOTE: preferably should be called on an init-ed player instance
//!
GoCastJS.PeerConnection.prototype.Deinit = function() {
    if (false === this.player.deinit()) {
        throw new GoCastJS.Exception(this.player.id, 'deinit() failed.');
    }
};

//!
//! function: GoCastJS.PeerConnection.ReadyState()
//!
//! returns: ['INVALID' | 'PRENEW' | 'NEW' | 'NEGOTIATING' |
//!           'ACTIVE' | 'CLOSING' | 'CLOSED'];
//!
GoCastJS.PeerConnection.prototype.ReadyState = function() {
    return this.player.readyState;
};

//!
//! function: GoCast.PeerConnection.Width([width])
//!
//! arguments:
//!     width <int> (optional) : new width value for the plugin instance
//!
//! returns:
//!     current width value of the plugin instance
//!
GoCastJS.PeerConnection.prototype.Width = function(width) {
    if ('undefined' !== typeof(width) && null !== width) {
        this.player.width = width;
    }
    return this.player.width;
};

//!
//! function: GoCast.PeerConnection.Height([height])
//!
//! arguments:
//!     height <int> (optional) : new height value for the plugin instance
//!
//! returns:
//!     current height value of the plugin instance
//!
GoCastJS.PeerConnection.prototype.Height = function(height) {
    if ('undefined' !== typeof(height) && null !== height) {
        this.player.height = height;
    }
    return this.player.height;
};
