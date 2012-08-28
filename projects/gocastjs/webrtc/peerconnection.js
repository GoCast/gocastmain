var GoCastJS = ('undefined' !== typeof(GoCastJS)) ? GoCastJS : {};
GoCastJS = (null !== GoCastJS) ? GoCastJS : {};

GoCastJS.Utils = {
    joinObjects: function(a, b) {
        return (JSON.parse((JSON.stringify(a) + JSON.stringify(b)).
                replace(/}{/g, ',').
                replace(/{,/g, '{').
                replace(/,}/g, '}')));
    }
};

//!
//! GoCastJS.Video.devices[]     : array of available video devices (guids)
//! GoCastJS.Video.captureDevice : current capture device (guid)
//!
//! NOTE: these are populated by GoCastJS.SetDevicesChangedListener()
//!
GoCastJS.Video = {
    devices: [],
    captureDevice: ''
};

//!
//! GoCastJS.Audio.inputDevices[]  : array of available audio inputs
//! GoCastJS.Audio.inputDevice     : current audio input
//! GoCastJS.Audio.outputDevices[] : array of available audio outputs
//! GoCastJS.Audio.outputDevice    : current audio output
//! GoCastJS.Audio.spkVol          : current speaker volume
//!
//! NOTE: spkVol is populated by GoCastJS.SetSpkVolListener()
//! NOTE: the rest are populated bu GoCastJS.SetDevicesChangedListener()
//!
GoCastJS.Audio = {
    inputDevices: [],
    inputDevice: '',
    outputDevices: [],
    outputDevice: '',
    spkVol: 256,
    micVol: 256
};

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
//!     mediaHints  <obj>        : {audio: <bool>, video: <bool>,
//!                                 [videoin: <string>]}
//!     player      <HtmlObject> : plugin instance used for local preview
//!     videoin     <string>     : guid of the camera you want to use
//!
//! NOTE: if 'videoin' is not given the 'default' camera is used.
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
    GoCastJS.Video.captureDevice = '';
    GoCastJS.Audio.inputDevice = '';
    GoCastJS.Audio.outputDevice = '';

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
                    return;
                } else {
                    options.mediaHints.videoin = player.videoinopts['default'];
                }
            }

            console.log('GoCastJS.getUserMedia(): Choosing video: ' +
                        player.videoinopts[options.mediaHints.videoin]);
            GoCastJS.Video.captureDevice = options.mediaHints.videoin;
        }

        if (true === options.mediaHints.audio) {
            if ('undefined' === typeof(options.mediaHints.audioin) ||
                null === options.mediaHints.audioin) {
                if (0 >= player.audioinopts.length) {
                    failure('GoCastJS.getUserMedia(): ' +
                            'No audio input devices detected');
                    return;
                } else {
                    options.mediaHints.audioin = player.audioinopts[0];
                }
            }

            if ('undefined' === typeof(options.mediaHints.audioout) ||
                null === options.mediaHints.audioout) {
                if (0 >= player.audiooutopts.length) {
                    failure('GoCastJS.getUserMedia(): ' +
                            'No audio output devices detected');
                    return;
                } else {
                    options.mediaHints.audioout = player.audiooutopts[0];
                }
            }

            console.log('GoCastJS.getUserMedia(): Choosing audio input: ' +
                        options.mediaHints.audioin);
            GoCastJS.Audio.inputDevice = options.mediaHints.audioin;

            console.log('GoCastJS.getUserMedia(): Choosing audio output: ' +
                        options.mediaHints.audioout);
            GoCastJS.Audio.outputDevice = options.mediaHints.audioout;
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

                var hints = {
                    video: options.mediaHints.video,
                    audio: options.mediaHints.audio
                };

                player.setLocalDescription(
                    'OFFER',
                    player.createOffer(hints),
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
//!     checkInterval    <milliseconds>     : interval for volume check
//!     localPlayer      <HtmlObject>       : plugin used for local preview
//!     onSpkVolChanged  <function(newVol)> : callback for volume change
//!
//! returns: the setInterval identifier (used to clear interval)
//!
GoCastJS.SetSpkVolListener = function(checkInterval,
                                      localplayer,
                                      onSpkVolChanged) {
    return setInterval(function() {
        if (GoCastJS.Audio.spkVol !== localplayer.volume) {
            GoCastJS.Audio.spkVol = localplayer.volume;
            onSpkVolChanged(GoCastJS.Audio.spkVol);
        }
    }, checkInterval);
};

//!
//! function: GoCastJS.SetMicVolListener(volCheckInterval,
//!                                      localplayer,
//!                                      onMicVolChanged)
//!
//! arguments:
//!     checkInterval    <milliseconds>     : interval for volume check
//!     localPlayer      <HtmlObject>       : plugin used for local preview
//!     onMicVolChanged  <function(newVol)> : callback for volume change
//!
//! returns: the setInterval identifier (used to clear interval)
//!
GoCastJS.SetMicVolListener = function(checkInterval,
                                      localplayer,
                                      onMicVolChanged) {
    return setInterval(function() {
        if (GoCastJS.Audio.micVol !== localplayer.micvolume) {
            GoCastJS.Audio.micVol = localplayer.micvolume;
            onMicVolChanged(GoCastJS.Audio.micVol);
        }
    }, checkInterval);
}

//!
//! function: GoCastJS.SetDevicesChangedListener(checkInterval,
//!                                              localplayer,
//!                                              onChanged)
//!
//! arguments:
//!     checkInterval <milliseconds>       : interval for check
//!     localPlayer   <HtmlObject>         : plugin used for local preview
//!     oChanged      <function(va, vr,
//!                             aia, air,
//!                             aoa, aor)> : callback with
//!                                          'va' (added video devices),
//!                                          'vr' (removed video devices),
//!                                          'aia' (added audio inputs),
//!                                          'air' (removed audio inputs),
//!                                          'aoa' (added audio outputs),
//!                                          'aor' (removed audio outputs),
//!
//! returns: the setInterval identifier (used to clear interval)
//!
GoCastJS.SetDevicesChangedListener = function(checkInterval,
                                              localplayer,
                                              onChanged) {
    var videoInOpts = localplayer.videoinopts;
    var audioInOpts = localplayer.audioinopts;
    var audioOutOpts = localplayer.audiooutopts;

    GoCastJS.Video.devices = [];
    GoCastJS.Audio.inputDevices = [];
    GoCastJS.Audio.outputDevices = [];

    return setInterval(function() {
        var videoDevicesDeleted = [];
        var videoDevicesAdded = [];
        var audioInDevicesDeleted = [];
        var audioInDevicesAdded = [];
        var audioOutDevicesDeleted = [];
        var audioOutDevicesAdded = [];
        var vInOpts = localplayer.videoinopts;
        var aInOpts = localplayer.audioinopts;
        var aOutOpts = localplayer.audiooutopts;

        // Check for newly deleted devices
        for (i in GoCastJS.Video.devices) {
            if ('undefined' === typeof(vInOpts[GoCastJS.Video.devices[i]])) {
                videoDevicesDeleted.push(GoCastJS.Video.devices[i]);
            }
        }

        for (i in GoCastJS.Audio.inputDevices) {
            if (-1 === aInOpts.indexOf(GoCastJS.Audio.inputDevices[i])) {
                audioInDevicesDeleted.push(GoCastJS.Audio.inputDevices[i]);
            }
        }

        for (i in GoCastJS.Audio.outputDevices) {
            if (-1 === aOutOpts.indexOf(GoCastJS.Audio.outputDevices[i])) {
                audioOutDevicesDeleted.push(GoCastJS.Audio.outputDevices[i]);
            }
        }

        // Check for newly added devices
        for (j in vInOpts) {
            if (-1 === GoCastJS.Video.devices.indexOf(j)) {
                videoDevicesAdded.push(j);
            }
        }

        for (j in aInOpts) {
            if (-1 === GoCastJS.Audio.inputDevices.indexOf(aInOpts[j])) {
                audioInDevicesAdded.push(aInOpts[j]);
            }
        }

        for (j in aOutOpts) {
            if (-1 === GoCastJS.Audio.outputDevices.indexOf(aOutOpts[j])) {
                audioOutDevicesAdded.push(aOutOpts[j]);
            }
        }

        // Refresh the current devices list
        if (0 < videoDevicesAdded.length || 0 < videoDevicesDeleted.length) {
            GoCastJS.Video.devices = [];
            for (i in vInOpts) {
                GoCastJS.Video.devices.push(i);
            }
        }

        if (0 < audioInDevicesAdded.length ||
            0 < audioInDevicesDeleted.length) {
            GoCastJS.Audio.inputDevices = [];
            for (i in aInOpts) {
                GoCastJS.Audio.inputDevices.push(aInOpts[i]);
            }
        }

        if (0 < audioOutDevicesAdded.length ||
            0 < audioOutDevicesDeleted.length) {
            GoCastJS.Audio.outputDevices = [];
            for (i in aOutOpts) {
                GoCastJS.Audio.outputDevices.push(aOutOpts[i]);
            }
        }

        // Call callback if device list has changed
        if (0 < videoDevicesAdded.length ||
            0 < videoDevicesDeleted.length ||
            0 < audioInDevicesAdded.length ||
            0 < audioInDevicesDeleted.length ||
            0 < audioOutDevicesAdded.length ||
            0 < audioOutDevicesDeleted.length) {
            onChanged(videoDevicesAdded, videoDevicesDeleted,
                      audioInDevicesAdded, audioInDevicesDeleted,
                      audioOutDevicesAdded, audioOutDevicesDeleted);
        }
    }, checkInterval);
};

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
        this.connState = 'CONNECTING';
        this.connTimer = null;

        var self = this;
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
            if ('CONNECTING' === self.ReadyState() &&
                null === self.connTimer) {
                self.connTimer = setTimeout(function() {
                    self.connState = 'CONNECTED';
                    playerRef.onreadystatechange();
                }, 2000);
            }

            if ('undefined' !== typeof(options.onReadyStateChange) &&
                null !== options.onReadyStateChange) {
                options.onReadyStateChange();
            }
        };

        var iceCallback = function(candidate, moreComing) {
            var prevState = self.connState;
            self.connState = 'CONNECTING';

            if (prevState !== self.connState) {
                self.connTimer = null;
                playerRef.onreadystatechange();
            } else {
                clearTimeout(self.connTimer);
                self.connTimer = setTimeout(function() {
                    self.connState = 'CONNECTED';
                    playerRef.onreadystatechange();
                }, 2000);                    
            }

            if ('undefined' !== typeof(options.onIceMessage) &&
               null !== options.onIceMessage) {
                options.onIceMessage(candidate, moreComing);
            }
        };

        if (false === this.player.init(this.player.id,
                                       options.iceConfig,
                                       iceCallback)) {
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
//!           'ACTIVE' | 'CONNECTING' | 'CONNECTED' | 'BLOCKED' |
//!           'CLOSING' | 'CLOSED'];
//!
GoCastJS.PeerConnection.prototype.ReadyState = function() {
    if ('ACTIVE' === this.player.readyState) {
        return this.connState;
    } else {
        return this.player.readyState;
    }
};

//!
//! function: GoCastJS.PeerConnection.Width([width])
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
//! function: GoCastJS.PeerConnection.Height([height])
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

//!
//! function: GoCastJS.PluginLog(localplayer, logCallback)
//!
//! arguments:
//!     localplayer <HtmlObject>        : plugin instance for local preview
//!     logCallback <function(entries)> : callback with array of log entries
//!
GoCastJS.PluginLog = function(localplayer, logCallback) {
    if ('undefined' === localplayer || null === localplayer) {
        return;
    } else if ('undefined' === logCallback || null === logCallback) {
        localplayer.logFunction(null);
    } else {
        localplayer.logFunction(function() {
            var entries = localplayer.logentries;
            if(0 < entries.length) {
                logCallback(entries);
            }
        });
    }
};
