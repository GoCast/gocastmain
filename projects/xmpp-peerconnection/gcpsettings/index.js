var SettingsUI = {
	$camselect: null,
	$micselect: null,
	$spkselect: null,
	$effects: null,
	$spkvol: null,
	$savesettings: null,
	timer: null,

	init: function() {
		this.$camselect = $('#cameraselect');
		this.$camselect.change(this.deviceChangedCallback());
		this.$micselect = $('#micselect');
		this.$micselect.change(this.deviceChangedCallback());
		this.$spkselect = $('#spkselect');
		this.$spkselect.change(this.deviceChangedCallback());
		this.$effects = $('#effectselect');
		this.$effects.change(this.effectChangedCallback());

		this.$spkvol = $('#spkvol');
		this.$spkvol.slider({
			min: 0,
			max: 255,
			step: 25,
			value: SettingsApp.spkVol(),
			slide: function(evt, ui) { SettingsApp.spkVol(ui.value); }
		});

		this.$micvol = $('#micvol');
		this.$micvol.slider({
			min: 0,
			max: 255,
			step: 25,
			value: SettingsApp.micVol(),
			slide: function(evt, ui) { SettingsApp.micVol(ui.value); }
		});

		this.$walkytalky = $('#walkytalky');
		this.$walkytalky.mousedown(function() { SettingsApp.setMicMute(false); });
		this.$walkytalky.mouseup(function() { SettingsApp.setMicMute(true); });

		this.$savesettings = $('#savesettings');
		this.$savesettings.click(this.savesettingsClickedCallback());
		$('.ui-slider-handle').css({
			'border': '1px #2E8B57 solid',
			'background-color': '#2E8B57'
		});

		if (/linux/.test(navigator.userAgent.toLowerCase())) {
			this.$walkytalky.css({
				'bottom': '235px',
				'left'  : '243px'
			});
			$('#settingspanel').css('bottom', '0px');
		}
	},

	enableEffectsSelect: function(enable) {
		var settings = JSON.parse(window.localStorage['gcpsettings'] || '{}');
		this.$effects.attr('disabled', !enable);
		if (false === enable) {
			this.$effects.val('');
		} else {
			this.$effects.val(settings['effect'] || 'none');
			this.effectChangedCallback()();
		}
	},

	updateCameras: function(cameras, newCamera) {
		var oldCamera = this.$camselect.val() || '';
		var firstOption = '<option value="">no camera</option>';

		this.$camselect.html(firstOption);
		for (i in cameras) {
			if('default' !== i) {
				var option = '<option value="' + i + '">' +
							 cameras[i] + '</option>';
				$(option).appendTo(this.$camselect);
			}
		}

		if (newCamera !== oldCamera) {
			this.$camselect.val(newCamera);
			this.deviceChangedCallback()();
		}
	},

	updateMics: function(mics, newMic) {
		var oldMic = this.$micselect.val() || '';
		var firstOption = '<option value="">no microphone</option>';

		this.$micselect.html(firstOption);
		for (i in mics) {
			var option = '<option value="' + mics[i] + '">' +
						 mics[i] + '</option>';
			$(option).appendTo(this.$micselect);
		}

		if (newMic !== oldMic) {
			this.$micselect.val(newMic);
			this.deviceChangedCallback()();
		}
	},

	updateSpks: function(spks, newSpk) {
		var oldSpk = this.$spkselect.val() || '';

		this.$spkselect.html('');
		for (i in spks) {
			var option = '<option value="' + spks[i] + '">' +
						 spks[i] + '</option>';
			$(option).appendTo(this.$spkselect);
		}

		if (newSpk !== oldSpk) {
			this.$spkselect.val(newSpk);
			this.deviceChangedCallback()();
		}
	},

	updateSpkVol: function(newVol) {
		this.$spkvol.slider('option', 'value', newVol);
	},

	updateMicVol: function(newVol) {
		this.$micvol.slider('option', 'value', newVol);
	},

	deviceChangedCallback: function() {
		var self = this;

		return function() {
			if (null !== self.timer) {
				clearTimeout(self.timer);
			}

			self.timer = setTimeout(function() {
				var vin = self.$camselect.val() || '';
				var ain = self.$micselect.val() || '';
				var aout = self.$spkselect.val() || '';

				SettingsApp.testSettings({
					video: ('' !== vin),
					audio: ('' !== ain),
					videoconstraints: {
						videoin: vin,
						webrtc: {
							mandatory: {
								minWidth: '320',
								maxWidth: '320',
								minHeight: '240',
								maxHeight: '240',
								minFrameRate: '15',
								maxFrameRate: '30'
							}
						}
					},
					audioconstraints: {
						audioin: ain,
						audioout: aout
					}
				});

				self.timer = null;
			}, 1000);
		};
	},

	effectChangedCallback: function() {
		var self = this;

		return function() {
			SettingsApp.applyEffect(self.$effects.val());
		};
	},

	savesettingsClickedCallback: function() {
		var self = this;

		return function() {
			var settings = {
				videoin: self.$camselect.val() || '',
				audioin: self.$micselect.val() || '',
				audioout: self.$spkselect.val() || '',
				effect: (('' !== self.$effects.val()) ? 
						 self.$effects.val() : 'none')
			};
			var targetUrl = ('' !== document.referrer)?
							document.referrer:
							('http://' + window.location.hostname);

			window.localStorage['gcpsettings'] = JSON.stringify(settings);
			window.location.href = targetUrl;
		};
	}
};

var SettingsApp = {
	$localplayer: null,
	$remoteplayer: null,
	clearPlayers: null,
	localStream: null,
	remoteStream: null,
	peerConnection: null,
	deviceChecker: null,
	createsdpconstraints: {
		sdpconstraints: {
			mandatory: {
				OfferToReceiveAudio: 'true',
                OfferToReceiveVideo: 'true'
            }
        }
    },

	init: function() {	 		 
		this.$localplayer = $(document.getElementById('local'));
		this.$remoteplayer = $(document.getElementById('remote'));
		GoCastJS.SetDevicesChangedListener(1000, this.$localplayer.get(0),
									   	   this.devicesChangedCallback());
		GoCastJS.SetSpkVolListener(500, this.$localplayer.get(0),
								   this.spkVolChangedCallback());
		GoCastJS.SetMicVolListener(500, this.$localplayer.get(0),
								   this.micVolChangedCallback());
		GoCastJS.PluginLog(
			this.$localplayer.get(0),
		   	function(entries) {
		   		for (i in entries) {
		   			console.log('PLUGIN: ' +
		   						entries[i]);
		   		}
		   	}
		);

		if (/linux/.test(navigator.userAgent.toLowerCase())) {
			this.$localplayer.get(0).width = 240;
			this.$localplayer.get(0).height = 190;
		}
	},

	spkVol: function(level) {
		if (level) {
			this.$localplayer.get(0).volume = level;
		} else {
			return this.$localplayer.get(0).volume;
		}
	},

	micVol: function(level) {
		if (level) {
			this.$localplayer.get(0).micvolume = level;
		} else {
			return this.$localplayer.get(0).micvolume;
		}
	},

	testSettings: function(mediaHints) {
		if (null !== this.clearPlayers) {
			this.clearPlayers();
		} else {
			this.clearPlayers = function() {
				this.$localplayer.get(0).deinit();
				this.peerConnection.Deinit();
				this.peerConnection = null;
				this.localStream = null;
				SettingsUI.enableEffectsSelect(false);
			};
		}

		var options = new GoCastJS.UserMediaOptions(mediaHints,
													this.$localplayer.get(0));
		GoCastJS.getUserMedia(options, this.getUserMediaSuccessCallback(),
							  this.getUserMediaFailureCallback());
	},

	applyEffect: function(effect) {
		if (null !== this.localStream) {
			if (0 < this.localStream.videoTracks.length) {
				this.localStream.videoTracks[0].effect = effect;
			}
		}
	},

	setMicMute: function(enable) {
		if (this.localStream && this.localStream.audioTracks.length) {
			this.localStream.audioTracks[0].enabled = !enable;
		}
	},

	devicesChangedCallback: function() {
		var localplayer = this.$localplayer.get(0);
		var firstCall = true;
		var settings = JSON.parse(window.localStorage['gcpsettings'] || '{}');

		return function(camsAdded, camsRemoved, micsAdded,
						micsRemoved, spksAdded, spksRemoved) {
			if (0 < camsAdded.length || 0 < camsRemoved.length) {
				var cameras = localplayer.videoinopts;
				var newCamera = GoCastJS.Video.captureDevice;
				if (0 < camsAdded.length) {
					if ('undefined' === typeof(settings.videoin) ||
						!firstCall) {
						newCamera = camsAdded[0];
					} else {
						if ('' === settings.videoin ||
							cameras[settings.videoin]) {
							newCamera = settings.videoin;
						} else {
							newCamera = (cameras['default'] || '');
						}
					}
				} else if (GoCastJS.Video.captureDevice === camsRemoved[0]) {
					newCamera = (cameras['default'] || '');
				}

				SettingsUI.updateCameras(cameras, newCamera);
			}

			if (0 < micsAdded.length || 0 < micsRemoved.length) {
				var mics = localplayer.audioinopts;
				var newMic = GoCastJS.Audio.inputDevice;
				if (0 < micsAdded.length) {
					if ('undefined' === typeof(settings.audioin) ||
						!firstCall) {
						newMic = micsAdded[0];
					} else {
						if ('' === settings.audioin ||
							0 <= mics.indexOf(settings.audioin)) {
							newMic = settings.audioin;
						} else {
							newMic = (mics[0] || '');
						}
					}
				} else if (GoCastJS.Audio.inputDevice === micsRemoved[0]) {
					newMic = (mics[0] || '');
				}

				SettingsUI.updateMics(mics, newMic);
			}

			if (0 < spksAdded.length || 0 < spksRemoved.length) {
				var spks = localplayer.audiooutopts;
				var newSpk = GoCastJS.Audio.outputDevice;
				if (0 < spksAdded.length) {
					if ('undefined' === typeof(settings.audioout) ||
						!firstCall) {
						newSpk = spksAdded[0];
					} else {
						if ('' === settings.audioout ||
							0 <= spks.indexOf(settings.audioout)) {
							newSpk = settings.audioout;
						} else {
							newSpk = (spks[0] || '');
						}
					}
				} else if (GoCastJS.Audio.outputDevice === spksRemoved[0]) {
					newSpk = (spks[0] || '');
				}

				SettingsUI.updateSpks(spks, newSpk);
			}

			firstCall = false;
		};
	},

	spkVolChangedCallback: function() {
		return function(newVol) {
			SettingsUI.updateSpkVol(newVol);
		};
	},

	micVolChangedCallback: function() {
		return function(newVol) {
			SettingsUI.updateMicVol(newVol);
		};
	},

	getUserMediaSuccessCallback: function() {
		var self = this;

		return function(stream) {
			self.localStream = stream;

			var hints = {video: false, audio: false};
			if (0 < self.localStream.videoTracks.length) {
				hints.video = true;

				if (/linux/.test(navigator.userAgent.toLowerCase())) {
					self.$localplayer.get(0).width = 240;
					self.$localplayer.get(0).height = 190;
				} else {
					self.$localplayer.get(0).width = 320;
					self.$localplayer.get(0).height = 240;					
				}

				SettingsUI.enableEffectsSelect(true);
			} else {
				self.$localplayer.get(0).width = 1;
				self.$localplayer.get(0).width = 1;				
			}

			if (0 < self.localStream.audioTracks.length) {
				hints.audio = true;
				self.setMicMute(true);
			}

			var options = new GoCastJS.PeerConnectionOptions(
				self.$remoteplayer.get(0),
				'remoteVideo', [],
				self.iceCallback(),
				self.addStreamCallback(),
				self.removeStreamCallback(),
				self.sigStateChangedCallback(),
				self.connStateChangedCallback()
			);

			self.peerConnection = new GoCastJS.PeerConnection(options);

			if (hints.audio || hints.video) {
				self.peerConnection.AddStream(self.localStream,
											  self.negotiationCallback(self.peerConnection));
			}
		};
	},

	getUserMediaFailureCallback: function() {
		var self = this;

		return function(msg) {
			console.log('SettingsApp.getUserMedia(): ' + msg);
			self.clearPlayers = null;
		};
	},

	iceCallback: function() {
		var self = this;

		return function(candidate) {
			self.peerConnection.AddIceCandidate(candidate);
		};
	},

	addStreamCallback: function() {
		var self = this;

		return function(stream) {
			self.remoteStream = stream;
		};
	},

	removeStreamCallback: function() {
		var self = this;

		return function(stream) {
			self.remoteStream = null;
		};
	},

	sigStateChangedCallback: function() {
		var self = this;

		return function(state) {
			console.log('PeerConnection: SigState = ' + state);
		};
	},

	connStateChangedCallback: function() {
		var self = this;

		return function(state) {
			console.log('PeerConnection: ConnState = ' + state);
		};
	},

	negotiationCallback: function(pc) {
		var self = this;

		return function() {
			pc.CreateOffer(function(sdp) {
				pc.SetLocalDescription('offer', sdp, function() {
					pc.SetRemoteDescription('answer', sdp, function() {
						console.log('Offer/Answer negotiation complete');
					}, function(err) {
						console.log('SetRemoteDescription: ' + err);
					});
				}, function(err) {
					console.log('SetLocalDescription: ' + err);
				});
			}, function(err) {
				console.log('CreateOffer: ' + err);
			}, self.createsdpconstraints);
		};
	}
};

$(document).ready(function() {
	SettingsApp.init();
	SettingsUI.init();
});
