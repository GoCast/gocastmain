var GoCastJS = ("undefined" !== typeof(GoCastJS))? GoCastJS: {};
GoCastJS = (null !== GoCastJS)? GoCastJS: {};

//!
//! function: GoCastJS.CheckGoCastPlayer()
//! 
//! returns: 'true' if "GoCastPlayer" detected, 'false' if not.
//!
GoCastJS.CheckGoCastPlayer = function() {
	for(i in navigator.plugins) {
		if("GoCastPlayer" === navigator.plugins[i].name) {
			return true;
		}
	}
	return false;
};

//!
//! constructor: GoCastJS.UserMediaOptions(mediaHints, width, height, videoId, containerId)
//!
//! members:
//!		mediaHints <obj>	: {audio: <bool>, video:<bool>}
//!		width <int>			: width of video element or plugin window
//!		height <int>		: height of video element or plugin window
//!		videoId <string>	: unique id of video element or plugin object
//!		containerId <string>: unique id of div element that contains 'videoId'
//!
GoCastJS.UserMediaOptions = function(mediaHints, width, height, videoId, containerId) {
	this.mediaHints = mediaHints;
	this.width = width;
	this.height = height;
	this.videoId = videoId;
	this.containerId = containerId;
};

//!
//! function: GoCastJS.getUserMedia(options, success, failure, bUseGoCastAPI)
//!
//! arguments:
//!		options <GoCastJS.UserMediaOptions>	: options for obtaining user media
//!		success <function(stream)>			: success callback with stream object
//!		failure <function(message)>			: failure callback with message
//!		bUseGoCastAPI <bool>				: 'true' for using GoCastPlayer API, 'false'
//!											  for using in-browser API
//!
GoCastJS.getUserMedia = function(options, success, failure, bUseGoCastAPI) {
	if(false === bUseGoCastAPI) {
		if("undefined" !== typeof(navigator.webkitGetUserMedia)) {
			navigator.webkitGetUserMedia(
				options.mediaHints, 
				function(stream){
					var container = document.getElementById(options.containerId);
					var video = document.createElement("video");
					video.id = options.videoId;
					video.width = options.width;
					video.height = options.height;
					video.autoplay = true;
					video.src = webkitURL.createObjectURL(stream);
					container.appendChild(video);
					
					if("undefined" !== typeof(success) && null !== success) {
						success(stream);
					}
				}, 
				function(message){
					if("undefined" !== typeof(failure) && null !== failure) {
						failure(message);
					}
				}
			);
		} else {
			if("undefined" !== typeof(failure) && null !== failure) {
				failure("GoCastJS.getUserMedia(): getUserMedia() API not supported.");
			}
		}
	} else {
		if(true === this.CheckGoCastPlayer()) {
			var container = document.getElementById(options.containerId);
			var player = document.createElement("object");
			
			player.id = options.videoId;
			player.type = "application/x-gocastplayer";
			player.width = options.width;
			player.height = options.height;
			container.appendChild(player);
			
			player.getUserMedia(
				options.mediaHints,
				function(stream) {					
					player.init(
						"localPlayer",
						"STUN stun.l.google.com:19302",
						null
					);
					player.addStream(stream);
					player.setLocalDescription(
						"OFFER",
						player.createOffer({audio: true, video: true}),
						function() { player.source = stream; },
						function(message) {
							console.log("localPlayer.setLocalDescription(): ", message);
						}
					);
					
					if("undefined" !== typeof(success) && null !== success) {
						success(stream);
					}
				},
				function(message) {
					if("undefined" !== typeof(failure) && null !== success) {
						failure(message);
					}
				}
			);
		} else {
			if("undefined" !== typeof(failure) && null !== failure) {
				failure("GoCastJS.getUserMedia(): GoCastPlayer not detected.");
			}
		}
	}
};

//!
//! constructor: GoCastJS.PeerConnectionOptions(mediaHints, width, height, videoId, containerId)
//!
//! members:
//!		iceConfig <string>	: "STUN <ip>:<port>"
//!		width <int>			: width of video element or plugin window
//!		height <int>		: height of video element or plugin window
//!		videoId <string>	: unique id of video element or plugin object
//!		containerId <string>: unique id of div element that contains 'videoId'
//!		onIceMessage <function(candidateSdp, moreComing)>	: new ice candidate callback
//!		onAddStream <function(stream)> 						: new remote stream added
//!		onRemoveStream <function(stream)>					: remote stream removed
//!
GoCastJS.PeerConnectionOptions = function(iceConfig,
										  onIceMessage,
										  onAddStream,
										  onRemoveStream,
										  onReadyStateChange,
										  width, 
										  height, 
										  videoId, 
										  containerId) {
	this.iceConfig = iceConfig;
	this.onIceMessage = onIceMessage;
	this.onAddStream = onAddStream;
	this.onRemoveStream = onRemoveStream;
	this.onReadyStateChange = onReadyStateChange;
	this.width = width;
	this.height = height;
	this.videoId = videoId;
	this.containerId = containerId;
};

//!
//! constructor: GoCastJS.PeerConnection(options, bUseGoCastAPI)
//!
//! arguments:
//!		options <GoCastJS.PeerConnectionOptions>	: options for creating peerconnection
//!		bUseGoCastAPI							 	: see GoCastJS.GetUserMedia()
//!
GoCastJS.PeerConnection = function(options, bUseGoCastAPI) {
	if(false == bUseGoCastAPI) {
		if("undefined" !== typeof(webkitPeerConnection00)) {
			this.peerConn = new webkitPeerConnection00(
								options.iceConfig,
								function(candidate, moreComing) {
									options.onIceMessage(candidate.toSdp(), moreComing);
								}
							);
							
			this.peerConn.onaddstream = function(stream) {
				var container = document.getElementById(options.containerId);
				var video = document.createElement("video");
				video.id = options.videoId;
				video.width = options.width;
				video.height = options.height;
				video.autoplay = true;
				video.src = webkitURL.createObjectURL(stream.stream);
				container.appendChild(video);
				
				if("undefined" !== typeof(options.onAddStream) &&
				   null !== options.onAddStream) {
					options.onAddStream(stream.stream);
				}		
			};
			
			this.peerConn.onremovestream = function(stream) {
				if("undefined" !== typeof(options.onRemoveStream) &&
				   null !== options.onRemoveStream) {
					options.onRemoveStream(stream.stream);
				}
			};
		} else {
			alert("GoCastJS.PeerConnection(): PeerConnection API not supported.");
		}
	} else {
		if(true === GoCastJS.CheckGoCastPlayer()) {
			var container = document.getElementById(options.containerId);
			this.peerConn = document.createElement("object");
			this.peerConn.id = options.videoId;
			this.peerConn.type = "application/x-gocastplayer";
			this.peerConn.width = options.width;
			this.peerConn.height = options.height;
			container.appendChild(this.peerConn);
			
			//At this point the plugin instance is loaded because of appendChild()
			this.peerConn.init(options.videoId, options.iceConfig, options.onIceMessage);
			
			var peerConnRef = this.peerConn;
			this.peerConn.onaddstream = function(stream) {
				peerConnRef.source = stream;
				if("undefined" !== typeof(options.onAddStream) &&
				   null !== options.onAddStream) {
					options.onAddStream(stream);
				} 
			};
			
			this.peerConn.onremovestream = function(stream) {
				if("undefined" !== typeof(options.onRemoveStream) &&
				   null !== options.onRemoveStream) {
					options.onRemoveStream(stream);
				}
			};
			
			this.peerConn.onreadystatechange = function() {
				if("undefined" !== typeof(options.onReadyStateChange) &&
				   null !== options.onReadyStateChange) {
					options.onReadyStateChange();
				}
			};
		} else {
			alert("GoCastJS.PeerConnection(): PeerConnection API (GoCast) not supported.");
		}
	}
};

//!
//! function: GoCastJS.PeerConnection.AddStream(stream)
//!
//! arguments:
//!		stream<obj>	: stream to be added (returned by GetUserMedia's success callback)
//!
GoCastJS.PeerConnection.prototype.AddStream = function(stream) {
	if("undefined" !== typeof(this.peerConn) && null !== this.peerConn) {
		this.peerConn.addStream(stream);
	}	
};

//!
//! function: GoCastJS.PeerConnection.RemoveStream(stream)
//!
//! arguments:
//!		stream<obj>	: stream to be removed (returned by GetUserMedia's success callback)
//!
GoCastJS.PeerConnection.prototype.RemoveStream = function(stream) {
	if("undefined" !== typeof(this.peerConn) && null !== this.peerConn) {
		this.peerConn.removeStream(stream);
	}
};

//!
//! function: GoCastJS.PeerConnection.CreateOffer(mediaHints)
//!
//! arguments:
//!		mediaHints<obj>	: see GoCastJS.GetUserMedia()
//!
//! returns: sdp<string>
//!
GoCastJS.PeerConnection.prototype.CreateOffer = function(mediaHints) {
	if("undefined" !== typeof(this.peerConn) && null !== this.peerConn) {
		if(null !== this.peerConn.toString().match(/PeerConnection00/g)) {
			var offer = this.peerConn.createOffer(mediaHints);
			return offer.toSdp();
		} else {
			return this.peerConn.createOffer(mediaHints);
		}
	};
	
	return null;
};

//!
//! function: GoCastJS.PeerConnection.CreateAnswer(offer, mediaHints)
//!
//! arguments:
//! 	offer<string>	: sdp offer of remote peer
//!		mediaHints<obj>	: see GoCastJS.GetUserMedia()
//!
//! returns: sdp<string>
//!
GoCastJS.PeerConnection.prototype.CreateAnswer = function(offer, mediaHints) {
	if("undefined" !== typeof(this.peerConn) && null !== this.peerConn) {
		if(null !== this.peerConn.toString().match(/PeerConnection00/g)) {
			var answer = this.peerConn.createAnswer(offer, mediaHints);
			return answer.toSdp();
		} else {
			return this.peerConn.createAnswer(offer, mediaHints);
		}
	}
	
	return null;
};

//!
//! function: GoCastJS.PeerConnection.SetLocalDescription(action, sdp, success, failure)
//!
//! arguments:
//!		action<string>	: "OFFER" (if sdp is an offer) or "ANSWER" (if sdp is an answer) 
//!		sdp<string>		: sdp to be used as local peer's description
//!		success<function()>			: success callback
//!		failure<function(message)>	: failure callback with message 
//!
GoCastJS.PeerConnection.prototype.SetLocalDescription = function(action,
																 sdp,
																 success,
																 failure) {
	if("undefined" !== typeof(this.peerConn) && null !== this.peerConn) {
		if(null !== this.peerConn.toString().match(/PeerConnection00/g)) {
			var actionId = ("OFFER" === action)? 
						   this.peerConn.SDP_OFFER:
						   this.peerConn.SDP_ANSWER;
			
			this.peerConn.setLocalDescription(actionId, new SessionDescription(sdp));
			if("undefined" !== typeof(success) && null !== success) {
				success();
			}
		} else {
			this.peerConn.setLocalDescription(
				action,
				sdp,
				function() {
					if("undefined" !== typeof(success) && null !== success) {
						success();
					}
				}, 
				function(message) {
					if("undefined" !== typeof(failure) && null !== failure) {
						failure(message);
					}
				}
			);
		}
	}
};

//!
//! function: GoCastJS.PeerConnection.SetRemoteDescription(action, sdp)
//!
//! arguments:
//!		action<string>	: "OFFER" (if sdp is an offer) or "ANSWER" (if sdp is an answer) 
//!		sdp<string>		: sdp to be used as remote peer's description
//!
GoCastJS.PeerConnection.prototype.SetRemoteDescription = function(action, sdp) {
	if("undefined" !== typeof(this.peerConn) && null !== this.peerConn) {
		if(null !== this.peerConn.toString().match(/PeerConnection00/g)) {
			var actionId = ("OFFER" === action)? 
						   this.peerConn.SDP_OFFER:
						   this.peerConn.SDP_ANSWER;
			this.peerConn.setRemoteDescription(actionId, new SessionDescription(sdp));
		} else {
			this.peerConn.setRemoteDescription(action, sdp);
		}
	}
};

//!
//! function: GoCastJS.PeerConnection.ProcessIceMessage(sdp)
//!
//! arguments:
//!		sdp<string>		: sdp of remote peer's ice candidate
//!
GoCastJS.PeerConnection.prototype.ProcessIceMessage = function(sdp) {
	if("undefined" !== typeof(this.peerConn) && null !== this.peerConn) {
		if(null !== this.peerConn.toString().match(/PeerConnection00/g)) {
			this.peerConn.processIceMessage(new IceCandidate("0", sdp));
		} else {
			this.peerConn.processIceMessage(sdp);
		}
	}
};

//!
//! function: GoCastJS.PeerConnection.StartIce()
//!
//! NOTE: should be called after GoCastJS.PeerConnection.SetLocalDescription()
//!
GoCastJS.PeerConnection.prototype.StartIce = function() {
	if("undefined" !== typeof(this.peerConn) && null !== this.peerConn) {
		this.peerConn.startIce();
	}
};

//!
//! function: GoCastJS.PeerConnection.ReadyState()
//!
//! returns: ["INVALID" | "PRENEW" | "NEW" | "NEGOTIATING" | 
//!			  "ACTIVE" | "CLOSING" | "CLOSED"];
//!
GoCastJS.PeerConnection.prototype.ReadyState = function() {
	if("undefined" !== typeof(this.peerConn) && null !== this.peerConn) {
		return this.peerConn.readyState;
	}
	return "INVALID";
};