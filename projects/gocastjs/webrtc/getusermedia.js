var GoCastJS = ("undefined" !== typeof(GoCastJS))? GoCastJS: {};
GoCastJS = (null !== GoCastJS)? GoCastJS: {};

GoCastJS.CheckGoCastPlayer = function() {
	for(i in navigator.plugins) {
		if("GoCastPlayer" === navigator.plugins[i].name) {
			return true;
		}
	}
	return false;
};

GoCastJS.UserMediaOptions = function(mediaHints, width, height, videoId, containerId) {
	this.mediaHints = mediaHints;
	this.width = width;
	this.height = height;
	this.videoId = videoId;
	this.containerId = containerId;
};

GoCastJS.PeerConnectionOptions = function(iceConfig,
										  onIceMessage,
										  onAddStream,
										  onRemoveStream,
										  width, 
										  height, 
										  videoId, 
										  containerId) {
	this.iceConfig = iceConfig;
	this.onIceMessage = onIceMessage;
	this.onAddStream = onAddStream;
	this.onRemoveStream = onRemoveStream;
	this.width = width;
	this.height = height;
	this.videoId = videoId;
	this.containerId = containerId;
};

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
					
					if("undefined" !== typeof(success)) {
						success(stream);
					}
				}, 
				function(message){
					if("undefined" !== typeof(failure)) {
						failure(message);
					}
				}
			);
		} else {
			if("undefined" !== typeof(failure)) {
				failure("GoCastJS: getUserMedia() API not supported.");
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
					//player.renderStream(stream);
					
					if("undefined" !== typeof(success)) {
						success(stream);
					}
				},
				function(message) {
					if("undefined" !== typeof(failure)) {
						failure(message);
					}
				}
			);
		} else {
			if("undefined" !== typeof(failure)) {
				failure("GoCastJS: getUserMedia API (GoCast) not supported.");
			}
		}
	}
};

GoCastJS.PeerConnection = function(options, bUseGoCastAPI) {
	if(false == bUseGoCastAPI) {
		if("undefined" !== typeof(webkitPeerConnection00)) {
			this.peerConn = new webkitPeerConnection00(
								options.iceConfig,
								function(candidate, moreComing) {
									options.onIceMessage(candidate.toSdp(), moreComing);
								}
							);
							
			//onaddstream callback
			this.peerConn.onaddstream = function(stream) {
				var container = document.getElementById(options.containerId);
				var video = document.createElement("video");
				video.id = options.videoId;
				video.width = options.width;
				video.height = options.height;
				video.autoplay = true;
				video.src = webkitURL.createObjectURL(stream.stream);
				container.appendChild(video);
				
				if("undefined" !== typeof(options.onAddStream)) {
					options.onAddStream(stream.stream);
				}		
			};
			
			//onremovestream callback
			this.peerConn.onremovestream = function(stream) {
				if("undefined" !== typeof(options.onRemoveStream)) {
					options.onRemoveStream(stream.stream);
				}
			};
		} else {
			alert("GoCastJS: PeerConnection API not supported.");
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
			
			//At this point the plugin instance is loaded
			this.peerConn.init(options.videoId, options.iceConfig, options.onIceMessage);
			
			//onaddstream callback
			var peerConnRef = this.peerConn;
			this.peerConn.onaddstream = function(stream) {
				peerConnRef.source = stream;
				if("undefined" !== typeof(options.onAddStream)) {
					options.onAddStream(stream);
				} 
			};
			
			//onremovestream callback
			this.peerConn.onremovestream = function(stream) {
				if("undefined" !== typeof(options.onRemoveStream)) {
					options.onRemoveStream(stream);
				}
			};
		} else {
			alert("GoCastJS: PeerConnection API (GoCast) not supported.");
		}
	}
};

GoCastJS.PeerConnection.prototype.AddStream = function(stream) {
	if("undefined" !== typeof(this.peerConn)) {
		this.peerConn.addStream(stream);
	}	
};

GoCastJS.PeerConnection.prototype.RemoveStream = function(stream) {
	if("undefined" !== typeof(this.peerConn)) {
		this.peerConn.removeStream(stream);
	}
};

GoCastJS.PeerConnection.prototype.CreateOffer = function(mediaHints) {
	if("undefined" !== typeof(this.peerConn)) {
		if(null !== this.peerConn.toString().match(/PeerConnection00/g)) {
			var offer = this.peerConn.createOffer(mediaHints);
			return offer.toSdp();
		} else {
			return this.peerConn.createOffer(mediaHints);
		}
	};
	
	return null;
};

GoCastJS.PeerConnection.prototype.CreateAnswer = function(offer, mediaHints) {
	if("undefined" !== typeof(this.peerConn)) {
		if(null !== this.peerConn.toString().match(/PeerConnection00/g)) {
			var answer = this.peerConn.createAnswer(offer, mediaHints);
			return answer.toSdp();
		} else {
			return this.peerConn.createAnswer(offer, mediaHints);
		}
	}
	
	return null;
};

GoCastJS.PeerConnection.prototype.SetLocalDescription = function(action,
																 sdp,
																 succCb,
																 failCb) {
	if("undefined" !== typeof(this.peerConn)) {
		if(null !== this.peerConn.toString().match(/PeerConnection00/g)) {
			var actionId = ("OFFER" === action)? 
						   this.peerConn.SDP_OFFER:
						   this.peerConn.SDP_ANSWER;
			this.peerConn.setLocalDescription(actionId, new SessionDescription(sdp));
		} else {
			this.peerConn.setLocalDescription(action, sdp, succCb, failCb);
		}
	}
};

GoCastJS.PeerConnection.prototype.SetRemoteDescription = function(action, sdp) {
	if("undefined" !== typeof(this.peerConn)) {
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

GoCastJS.PeerConnection.prototype.ProcessIceMessage = function(sdp) {
	if("undefined" !== typeof(this.peerConn)) {
		if(null !== this.peerConn.toString().match(/PeerConnection00/g)) {
			this.peerConn.processIceMessage(new IceCandidate("0", sdp));
		} else {
			this.peerConn.processIceMessage(sdp);
		}
	}
};

GoCastJS.PeerConnection.prototype.StartIce = function() {
	if("undefined" !== typeof(this.peerConn)) {
		this.peerConn.startIce();
	}
};
