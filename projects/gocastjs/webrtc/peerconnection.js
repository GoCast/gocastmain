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
GoCastJS.UserMediaOptions = function(constraints, player, apitype) {
    var defaultwebrtcvideoconstraints = {
        mandatory: {
            minWidth: '160', maxWidth: '160',
            minHeight: '120', maxHeight: '120',
            minFrameRate: '14', maxFrameRate: '14'
        }
    }, nativeConstraints = {};

    if (!apitype || 'gcp' === apitype) {
        if (constraints.video) {
            constraints.videoconstraints = constraints.videoconstraints || {};
            constraints.videoconstraints.webrtc = constraints.videoconstraints.webrtc ||
                                                  defaultwebrtcvideoconstraints;
        }
        if (constraints.audio) {
            constraints.audioconstraints = constraints.audioconstraints || {};
        }
    } else {
        nativeConstraints.audio = constraints.audio;
        nativeConstraints.video = constraints.video ? constraints.videoconstraints.webrtc :
                                  constraints.video;
    }

    this.constraints = constraints;
    this.player = player;
    this.apitype = apitype || 'gcp';
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
    var player = options.player,
        apitype = options.apitype;

    GoCastJS.Video.captureDevice = '';
    GoCastJS.Audio.inputDevice = '';
    GoCastJS.Audio.outputDevice = '';

    if ('gcp' === apitype) {
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
    } else {
        navigator.webkitGetUserMedia(
            options.constraints,
            function(stream) {
                var s = success || function(stream) {};
                player.autoplay = 'true';
                player.src = webkitURL.createObjectURL(stream);
                player.style.transform = 'rotateY(180deg)';
                player.style.webkitTransform = 'rotateY(180deg)';
                s(stream);
            },
            function() {
                var f = failure || function(error) {};
                f('GoCastJS.getUserMedia: failed');
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
                                      onSpkVolChanged,
                                      apitype) {
    apitype = apitype || 'gcp';
    if ('gcp' === apitype) {
        return setInterval(function() {
            if (GoCastJS.Audio.spkVol !== localplayer.volume) {
                GoCastJS.Audio.spkVol = localplayer.volume;
                onSpkVolChanged(GoCastJS.Audio.spkVol);
            }
        }, checkInterval);
    }

    return null;
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
                                      onMicVolChanged,
                                      apitype) {
    apitype = apitype || 'gcp';
    if ('gcp' === apitype) {
        return setInterval(function() {
            if (GoCastJS.Audio.micVol !== localplayer.micvolume) {
                GoCastJS.Audio.micVol = localplayer.micvolume;
                onMicVolChanged(GoCastJS.Audio.micVol);
            }
        }, checkInterval);
    }

    return null;
};

GoCastJS.SetPluginCrashMonitor = function(checkInterval,
                                          localplayer,
                                          onCrashed,
                                          apitype) {
    apitype = apitype || 'gcp';
    if ('gcp' === apitype) {
        return setInterval(function() {
            if (localplayer && onCrashed && ('undefined' === typeof(localplayer.volume))) {
                localplayer.width = 0;
                localplayer.height = 0;
                onCrashed();
            }
        }, checkInterval);
    }

    return null;
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
                                              onChanged,
                                              apitype) {
    var videoInOpts = (!apitype || 'gcp' === apitype) ? localplayer.videoinopts : '';
    var audioInOpts = (!apitype || 'gcp' === apitype) ? localplayer.audioinopts : '';
    var audioOutOpts = (!apitype || 'gcp' === apitype) ? localplayer.audiooutopts : '';

    GoCastJS.Video.devices = [];
    GoCastJS.Audio.inputDevices = [];
    GoCastJS.Audio.outputDevices = [];

    apitype = apitype || 'gcp';
    if ('gcp' === apitype) {
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
    }

    return null;
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
GoCastJS.PeerConnectionOptions = function(player,
                                          pcid, iceServers,
                                          onIceMessage,
                                          onAddStream,
                                          onRemoveStream,
                                          onSignalingStateChange,
                                          onConnStateChange,
                                          apitype) {
    this.iceServers = iceServers;
    this.onIceMessage = onIceMessage;
    this.onAddStream = onAddStream;
    this.onRemoveStream = onRemoveStream;
    this.onSignalingStateChange = onSignalingStateChange;
    this.onConnStateChange = onConnStateChange;
    this.player = player;
    this.pcid = pcid;
    this.apitype = apitype || 'gcp';
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
    var self = this, apitype = options.apitype, server,
        player = options.player, onstatechange, i,
        onicechange, onicecandidate, iceservers = [];

    this.apitype = options.apitype;
    this.player = options.player;
    this.pcid = options.pcid;
    this.sigState = 'preinit';
    this.connState = 'preinit';
    this.pendingCandidates = [];
    this.connTimer = null;
    this.connTimeout = 5000;
    this.peerconn = null;

    if ('native' === apitype) {
        for (i=0; i<options.iceServers.length; i++) {
            server = {url: options.iceServers[i].uri};
            if (options.iceServers[i].password) {
                server.password = options.iceServers[i].password;
            }
            iceservers.push(server);
        }

        this.peerconn = new webkitRTCPeerConnection({iceServers: iceservers});
        this.peerconn.onaddstream = function(e) {
            player.src = webkitURL.createObjectURL(e.stream);
            if (options.onAddStream) {
                options.onAddStream(e.stream);
            }
        }
    } else if ('gcp' === apitype) {
        this.player.onaddstream = function(stream) {
            player.source = stream;
            if ('undefined' !== typeof(options.onAddStream) &&
                null !== options.onAddStream) {
                options.onAddStream(stream);
            }
        };
    }

    if ('native' === apitype) {
        this.peerconn.onremovestream = function(e) {
            if (options.onRemoveStream) {
                options.onRemoveStream(e.stream);
            }
        }
    } else if ('gcp' === apitype) {
        this.player.onremovestream = function(stream) {
            if ('undefined' !== typeof(options.onRemoveStream) &&
                null !== options.onRemoveStream) {
                options.onRemoveStream(stream);
            }
        };
    }

    onstatechange = function(newState) {
        var i;

        self.sigState = newState;
        if ('stable' === newState || 'active' === newState) {
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

    if ('native' === apitype) {
        this.peerconn.onstatechange = function() { 
            onstatechange(self.peerconn.readyState);
        };
    } else if ('gcp' === apitype) {
        this.player.onstatechange = onstatechange;
    }

    onicechange = function(newState) {
        self.connState = newState;

        if ('checking' === newState || 'disconnected' === newState) {
            if (!self.connTimer) {
                self.connTimer = setTimeout(function() {
                    self.connTimer = null;
                    self.connState = 'timedout';
                    self.connTimeout = 10000;

                    if (options.onConnStateChange) {
                        options.onConnStateChange(self.connState);
                    }
                }, self.connTimeout);
            }
        }
        if ('connected' === newState && self.connTimer) {
            if (self.connTimer) {
                clearTimeout(self.connTimer);
                self.connTimer = null;                    
            }
        }
        if ('undefined' !== typeof(options.onConnStateChange) &&
            null !== options.onConnStateChange &&
            'defunct' !== self.connState) {
            options.onConnStateChange(newState);
        }
    };

    if ('native' === apitype) {
        this.peerconn.onicechange = function() {
            onicechange(self.peerconn.iceState);
        };
    } else if ('gcp' === apitype) {
        this.player.onicechange = onicechange;
    }

    onicecandidate = function(candidate) {
        if ('undefined' !== typeof(options.onIceMessage) &&
           null !== options.onIceMessage) {
            options.onIceMessage(candidate.replace(/\r\n/, ''));
        }
    };

    if ('native' === apitype) {
        this.peerconn.onicecandidate = function(e) {
            if (e.candidate) {
                onicecandidate(JSON.stringify(e.candidate));
            }
        };
    } else if ('gcp' === apitype) {
        if (false === this.player.init(options.pcid,
                                       options.iceServers,
                                       onicecandidate)) {
            throw new GoCastJS.Exception(options.pcid, 'init() failed.');
        }
    }

    this.sigState = 'new';
    this.connState = 'starting';
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
    if ('gcp' === this.apitype) {
        this.player.onnegotiationneeded = negotiationCallback || function() {};
        if (false === this.player.addStream(stream)) {
            throw new GoCastJS.Exception(this.pcid, 'addStream() failed.');
        }
    } else if ('native' === this.apitype) {
        this.peerconn.onnegotiationneeded = negotiationCallback || function() {};
        this.peerconn.addStream(stream);
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
    if ('gcp' === this.apitype) {
        this.player.onnegotiationneeded = negotiationCallback || function() {};
        if (false === this.player.removeStream(stream)) {
            throw new GoCastJS.Exception(this.pcid, 'removeStream() failed.');
        }
    } else if ('native' === this.apitype) {
        this.peerconn.onnegotiationneeded = negotiationCallback || function() {};
        this.peerconn.removeStream(stream);
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

    if ('gcp' === this.apitype) {
        this.player.createOffer(success, failure, constraints || {});
    } else if ('native' === this.apitype) {
        this.peerconn.createOffer(function(sdp) {
            success(sdp.sdp);
        }, function() {
            failure('setLocalDescription failed.');
        }, constraints.sdpconstraints);
    }
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

    if ('gcp' === this.apitype) {
        this.player.createAnswer(success, failure, constraints || {});
    } else if ('native' === this.apitype) {
        this.peerconn.createAnswer(function(sdp) {
            success(sdp.sdp);
        }, function() {
            failure('setLocalDescription failed.');
        }, constraints.sdpconstraints);
    }
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
    success = success || function() {};
    failure = failure || function(error) {};

    if ('gcp' === this.apitype) {
        this.player.setLocalDescription(action, sdp, success, failure);
    } else if ('native' === this.apitype) {
        this.peerconn.setLocalDescription(
            new RTCSessionDescription({sdp: sdp, type: action}),
            success, function() {
                failure('setLocalDescription failed.');
            }
        );
    }
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
    success = success || function() {};
    failure = failure || function(error) {};

    if ('gcp' === this.apitype) {
        this.player.setRemoteDescription(action, sdp, success, failure);
    } else if ('native' === this.apitype) {
        this.peerconn.setRemoteDescription(
            new RTCSessionDescription({sdp: sdp, type: action}),
            success, function() {
                failure('setRemoteDescription failed.');
            }
        );
    }
};

//!
//! function: GoCastJS.PeerConnection.AddIceCandidate(sdp)
//!
//! arguments:
//!     sdp <string> : sdp of remote peer's ice candidate
//!
GoCastJS.PeerConnection.prototype.AddIceCandidate = function(sdp) {
    var candidate = JSON.parse(sdp);

    if ('stable' === this.sigState || 'active' === this.sigState) {
        if ('gcp' === this.apitype) {
            if (false === this.player.addIceCandidate(candidate.sdp_mid,
                                                      candidate.sdp_mline_index,
                                                      candidate.sdp)) {
                    throw new GoCastJS.Exception(this.pcid, 'procIceMsg() failed.');
            }
        } else if ('native' === this.apitype) {
            this.peerconn.addIceCandidate(new RTCIceCandidate(candidate));
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
    if ('gcp' === this.apitype) {
        if (false === this.player.deinit()) {
            throw new GoCastJS.Exception(this.pcid, 'deinit() failed.');
        }
    } else if ('native' === this.apitype) {
        this.peerconn.close();
        this.peerconn = null;
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
GoCastJS.PluginLog = function(localplayer, logCallback, apitype) {
    if ('gcp' === apitype) {
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
    }
};
