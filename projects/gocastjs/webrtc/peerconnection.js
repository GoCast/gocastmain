var GoCastJS = ('undefined' !== typeof(GoCastJS)) ? GoCastJS : {};
GoCastJS = (null !== GoCastJS) ? GoCastJS : {};

GoCastJS.Utils = {
    joinObjects: function(a, b) {
        a = a || {};
        b = b || {};

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
        if (navigator.plugins.hasOwnProperty(i) && 'GoCastPlayer' === navigator.plugins[i].name) {
            return true;
        }
    }
    return false;
};

//!
//! constructor: GoCastJS.UserMediaOptions(constraints, player)
//!
//! arguments/members:
//!     constraints  <obj>        : {audio: <bool>, video: <bool>
//!                                 [, videoconstraints: object]
//!                                 [, audioconstraints: object]}
//!     player      <HtmlObject> : plugin instance used for local preview
//!
GoCastJS.UserMediaOptions = function(constraints, player) {
    var defaultwebrtcvideoconstraints = {
        mandatory: {
            minWidth: '160', maxWidth: '160',
            minHeight: '120', maxHeight: '120',
            minFrameRate: '14', maxFrameRate: '14'
        }
    };

    if (constraints.video) {
        constraints.videoconstraints = constraints.videoconstraints || {};
        constraints.videoconstraints.webrtc = constraints.videoconstraints.webrtc ||
                                              defaultwebrtcvideoconstraints;
    }

    if (constraints.audio) {
        constraints.audioconstraints = constraints.audioconstraints || {};
    }

    this.constraints = constraints;
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
    var player = options.player;

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
        if (true === options.constraints.video) {
            if ('undefined' === typeof(options.constraints.videoconstraints.videoin) ||
                null === options.constraints.videoconstraints.videoin) {
                if ('undefined' === typeof(player.videoinopts['default'])) {
                    failure('GoCastJS.getUserMedia(): ' +
                            'No video devices detected');
                    return;
                } else {
                    options.constraints.videoconstraints.videoin = player.videoinopts['default'];
                }
            }

            console.log('GoCastJS.getUserMedia(): Choosing video: ' +
                        player.videoinopts[options.constraints.videoconstraints.videoin]);
            GoCastJS.Video.captureDevice = options.constraints.videoconstraints.videoin;
        }

        if (true === options.constraints.audio) {
            if ('undefined' === typeof(options.constraints.audioconstraints.audioin) ||
                null === options.constraints.audioconstraints.audioin) {
                if (0 >= player.audioinopts.length) {
                    failure('GoCastJS.getUserMedia(): ' +
                            'No audio input devices detected');
                    return;
                } else {
                    options.constraints.audioconstraints.audioin = player.audioinopts[0];
                }
            }

            if ('undefined' === typeof(options.constraints.audioconstraints.audioout) ||
                null === options.constraints.audioconstraints.audioout) {
                if (0 >= player.audiooutopts.length) {
                    failure('GoCastJS.getUserMedia(): ' +
                            'No audio output devices detected');
                    return;
                } else {
                    options.constraints.audioconstraints.audioout = player.audiooutopts[0];
                }
            }

            console.log('GoCastJS.getUserMedia(): Choosing audio input: ' +
                        options.constraints.audioconstraints.audioin);
            GoCastJS.Audio.inputDevice = options.constraints.audioconstraints.audioin;

            console.log('GoCastJS.getUserMedia(): Choosing audio output: ' +
                        options.constraints.audioconstraints.audioout);
            GoCastJS.Audio.outputDevice = options.constraints.audioconstraints.audioout;
        }

        player.getUserMedia(
            options.constraints,
            function(stream) {
                var hints = {
                    video: options.constraints.video,
                    audio: options.constraints.audio
                };

                player.onnegotiationneeded = function() {
                    player.createOffer(function(sdp) {
                        player.setLocalDescription('offer', sdp, function() {
                            player.source = stream;
                            if ('undefined' !== typeof(success) && null !== success) {
                                success(stream);
                            }
                        }, function(error) {
                            console.log('localPlayer.setLocalDescription(): ', error);
                            if ('undefined' !== typeof(failure) && null !== failure) {
                                failure(error);
                            }
                        });
                    }, function(error) {
                        console.log('localPlayer.createOffer(): ', error);
                        if ('undefined' !== typeof(failure) && null !== failure) {
                            failure(error);
                        }
                    }, null);
                };

                if (false === player.init('localPlayer', [], null)) {
                    throw new GoCastJS.Exception('localPlayer', 'init() failed.');
                }

                if (hints.audio || hints.video) {
                    if (false === player.addStream(stream)) {
                        throw new GoCastJS.Exception('localPlayer',
                                                     'addStream() failed.');
                    }
                } else {
                    player.onnegotiationneeded();
                }
            },
            function(error) {
                if ('undefined' !== typeof(failure) && null !== success) {
                    failure(error);
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
};

GoCastJS.SetPluginCrashMonitor = function(checkInterval,
                                          localplayer,
                                          onCrashed) {
    return setInterval(function() {
        if (localplayer && onCrashed && ('undefined' === typeof(localplayer.volume))) {
            localplayer.width = 0;
            localplayer.height = 0;
            onCrashed();
        }
    }, checkInterval);
};

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
            if (GoCastJS.Video.devices.hasOwnProperty(i) &&
                'undefined' === typeof(vInOpts[GoCastJS.Video.devices[i]])) {
                videoDevicesDeleted.push(GoCastJS.Video.devices[i]);
            }
        }

        for (i in GoCastJS.Audio.inputDevices) {
            if (GoCastJS.Audio.inputDevices.hasOwnProperty(i) &&
                -1 === aInOpts.indexOf(GoCastJS.Audio.inputDevices[i])) {
                audioInDevicesDeleted.push(GoCastJS.Audio.inputDevices[i]);
            }
        }

        for (i in GoCastJS.Audio.outputDevices) {
            if (GoCastJS.Audio.outputDevices.hasOwnProperty(i) &&
                -1 === aOutOpts.indexOf(GoCastJS.Audio.outputDevices[i])) {
                audioOutDevicesDeleted.push(GoCastJS.Audio.outputDevices[i]);
            }
        }

        // Check for newly added devices
        for (j in vInOpts) {
            if (vInOpts.hasOwnProperty(j) && -1 === GoCastJS.Video.devices.indexOf(j)) {
                videoDevicesAdded.push(j);
            }
        }

        for (j in aInOpts) {
            if (aInOpts.hasOwnProperty(j) && -1 === GoCastJS.Audio.inputDevices.indexOf(aInOpts[j])) {
                audioInDevicesAdded.push(aInOpts[j]);
            }
        }

        for (j in aOutOpts) {
            if (aOutOpts.hasOwnProperty(j) && -1 === GoCastJS.Audio.outputDevices.indexOf(aOutOpts[j])) {
                audioOutDevicesAdded.push(aOutOpts[j]);
            }
        }

        // Refresh the current devices list
        if (0 < videoDevicesAdded.length || 0 < videoDevicesDeleted.length) {
            GoCastJS.Video.devices = [];
            for (i in vInOpts) {
                if (vInOpts.hasOwnProperty(i)) {
                    GoCastJS.Video.devices.push(i);
                }
            }
        }

        if (0 < audioInDevicesAdded.length ||
            0 < audioInDevicesDeleted.length) {
            GoCastJS.Audio.inputDevices = [];
            for (i in aInOpts) {
                if (aInOpts.hasOwnProperty(i)) {
                    GoCastJS.Audio.inputDevices.push(aInOpts[i]);
                }
            }
        }

        if (0 < audioOutDevicesAdded.length ||
            0 < audioOutDevicesDeleted.length) {
            GoCastJS.Audio.outputDevices = [];
            for (i in aOutOpts) {
                if (aOutOpts.hasOwnProperty(i)) {
                    GoCastJS.Audio.outputDevices.push(aOutOpts[i]);
                }
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
//!     iceServers  <Object>     : [{uri: 'stun:video.gocast.it:19302'},
//!                                 {uri: <addr>, password: <pwd>}]
//!     player      <HtmlObject> : width of plugin window
//!     onIceMessage       <function(candidate)>    : new ice candidate
//!     onAddStream        <function(stream)>       : new remote stream
//!     onRemoveStream     <function(stream)>       : remote stream removed
//!     onSignalingStateChange <function(newState)> : signaling state changed
//!     onConnStateChange <function(newState)>      : connection state changed
//!
GoCastJS.PeerConnectionOptions = function(player, pcid,
                                          iceServers,
                                          onIceMessage,
                                          onAddStream,
                                          onRemoveStream,
                                          onSignalingStateChange,
                                          onConnStateChange) {
    this.iceServers = iceServers;
    this.onIceMessage = onIceMessage;
    this.onAddStream = onAddStream;
    this.onRemoveStream = onRemoveStream;
    this.onSignalingStateChange = onSignalingStateChange;
    this.onConnStateChange = onConnStateChange;
    this.player = player;
    this.pcid = pcid;
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
        throw new GoCastJS.Exception(options.pcid, 'Browser unsupported.');
    } else if (false === GoCastJS.CheckGoCastPlayer()) {
        throw new GoCastJS.Exception(options.pcid, 'Plugin undetected.');
    } else {
        this.player = options.player;
        this.pcid = options.pcid;
        this.sigState = 'preinit';
        this.connState = 'preinit';
        this.pendingCandidates = [];
        this.connTimer = null;
        this.connTimeout = 5000;

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

        this.player.onstatechange = function(newState) {
            var i;

            self.sigState = newState;
            if ('stable' === newState) {
                for (i=0; i<self.pendingCandidates.length; i++) {
                    self.AddIceCandidate(self.pendingCandidates[i]);
                }
                self.pendingCandidates = [];
            }
            if ('undefined' !== typeof(options.onSignalingStateChange) &&
                null !== options.onSignalingStateChange) {
                options.onSignalingStateChange(newState);
            }
        };

        this.player.onicechange = function(newState) {
            self.connState = newState;

            if ('checking' === newState) {
                self.connTimer = setTimeout(function() {
                    self.connTimer = null;
                    self.connState = 'timedout';
                    self.connTimeout = 10000;

                    if (options.onConnStateChange) {
                        options.onConnStateChange(self.connState);
                    }
                }, self.connTimeout);
            }
            if ('connected' === newState && self.connTimer) {
                clearTimeout(self.connTimer);
                self.connTimer = null;
            }
            if ('undefined' !== typeof(options.onConnStateChange) &&
                null !== options.onConnStateChange &&
                'defunct' !== self.connState) {
                options.onConnStateChange(newState);
            }
        }

        var iceCallback = function(candidate) {
            if ('undefined' !== typeof(options.onIceMessage) &&
               null !== options.onIceMessage) {
                options.onIceMessage(candidate.replace(/\r\n/, ''));
            }
        };

        if (false === this.player.init(options.pcid,
                                       options.iceServers,
                                       iceCallback)) {
            throw new GoCastJS.Exception(options.pcid, 'init() failed.');
        }

        this.sigState = 'new';
        this.connState = 'new';
    }
};

//!
//! function: GoCastJS.PeerConnection.AddStream(stream)
//!
//! arguments:
//!     stream <obj>        : stream to be added (given by GetUserMedia's
//!                           success callback)
//!     negotiationCallback : offer/answer negotiation function
//!
GoCastJS.PeerConnection.prototype.AddStream = function(stream, negotiationCallback) {
    this.player.onnegotiationneeded = negotiationCallback || function() {};
    if (false === this.player.addStream(stream)) {
        throw new GoCastJS.Exception(this.pcid, 'addStream() failed.');
    }
};

//!
//! function: GoCastJS.PeerConnection.RemoveStream(stream)
//!
//! arguments:
//!     stream <obj>        : stream to be removed
//!     negotiationCallback : offer/answer negotiation function
//!
GoCastJS.PeerConnection.prototype.RemoveStream = function(stream, negotiationCallback) {
    this.player.onnegotiationneeded = negotiationCallback || function() {};
    if (false === this.player.removeStream(stream)) {
        throw new GoCastJS.Exception(this.pcid, 'removeStream() failed.');
    }
};

//!
//! function: GoCastJS.PeerConnection.CreateOffer(success, failure, constraints)
//!
//! arguments:
//!     success    : function(sdp)
//!     failure    : function(error)
//!     constraints: {sdpconstraints: {mandatory: {OfferToReceiveAudio: 'true/false',
//!                                                OfferToReceiveVideo: 'true/false'}}}
//!
GoCastJS.PeerConnection.prototype.CreateOffer = function(success, failure, constraints) {
    success = success || function(sdp) {};
    failure = failure || function(error) {};
    this.player.createOffer(success, failure, constraints || {});
};

//!
//! function: GoCastJS.PeerConnection.CreateAnswer(success, failure, constraints)
//!
//! arguments:
//!     success    : function(sdp)
//!     failure    : function(error)
//!     constraints: {sdpconstraints: {mandatory: {OfferToReceiveAudio: 'true/false',
//!                                                OfferToReceiveVideo: 'true/false'}}}
//!
GoCastJS.PeerConnection.prototype.CreateAnswer = function(success, failure, constraints) {
    success = success || function(sdp) {};
    failure = failure || function(error) {};
    this.player.createAnswer(success, failure, constraints || {});
};

//!
//! function: GoCastJS.PeerConnection.SetLocalDescription(action,
//!                                                       sdp,
//!                                                       success,
//!                                                       failure)
//!
//! arguments:
//!     action <string> : 'offer' (if offer) or 'answer' (if Ôanswer)
//!     sdp    <string> : sdp to be used as local peer's description
//!     success <function()>        : success callback
//!     failure <function(message)> : failure callback with message
//!
GoCastJS.PeerConnection.prototype.SetLocalDescription = function(action,
                                                                 sdp,
                                                                 success,
                                                                 failure) {
    success = success || function(sdp) {};
    failure = failure || function(error) {};
    this.player.setLocalDescription(action, sdp, success, failure);
};

//!
//! function: GoCastJS.PeerConnection.SetRemoteDescription(action,
//!                                                        sdp,
//!                                                        success,
//!                                                        failure)
//!
//! arguments:
//!     action <string> : 'offer' (if offer) or 'answer' (if answer)
//!     sdp    <string> : sdp to be used as remote peer's description
//!     success <function()>        : success callback
//!     failure <function(message)> : failure callback with message
//!
GoCastJS.PeerConnection.prototype.SetRemoteDescription = function(action,
                                                                  sdp,
                                                                  success,
                                                                  failure) {
    success = success || function(sdp) {};
    failure = failure || function(error) {};
    this.player.setRemoteDescription(action, sdp, success, failure);
};

//!
//! function: GoCastJS.PeerConnection.AddIceCandidate(sdp)
//!
//! arguments:
//!     sdp <string> : sdp of remote peer's ice candidate
//!
GoCastJS.PeerConnection.prototype.AddIceCandidate = function(sdp) {
    var candidate = JSON.parse(sdp);

    if ('stable' === this.sigState) {
        if (false === this.player.addIceCandidate(candidate.sdp_mid,
                                                  candidate.sdp_mline_index,
                                                  candidate.sdp)) {
            throw new GoCastJS.Exception(this.pcid, 'procIceMsg() failed.');
        }
    } else {
        this.pendingCandidates.push(sdp);
    }
};

//!
//! function: GoCastJS.PeerConnection.Deinit()
//!
//! NOTE: preferably should be called on an init-ed player instance
//!
GoCastJS.PeerConnection.prototype.Deinit = function() {
    if (false === this.player.deinit()) {
        throw new GoCastJS.Exception(this.pcid, 'deinit() failed.');
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
