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

		this.$savesettings = $('#savesettings');
		this.$savesettings.click(this.savesettingsClickedCallback());
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
		this.$camselect.html('');
		this.$camselect.attr('disabled', true);

		for (i in cameras) {
			if('default' !== i) {
				var option = '<option value="' + i + '">' +
							 cameras[i] + '</option>';
				$(option).appendTo(this.$camselect);
			} else {
				this.$camselect.attr('disabled', false);
			}
		}

		this.$camselect.val(newCamera);
		this.deviceChangedCallback()();
	},

	updateMics: function(mics, newMic) {
		this.$micselect.html('');
		this.$micselect.attr('disabled', true);

		for (i in mics) {
			var option = '<option value="' + mics[i] + '">' +
						 mics[i] + '</option>';
			$(option).appendTo(this.$micselect);

			if ('0' === i) {
				this.$micselect.attr('disabled', false);
			}
		}

		this.$micselect.val(newMic);
		this.deviceChangedCallback()();
	},

	updateSpks: function(spks, newSpk) {
		this.$spkselect.html('');
		this.$spkselect.attr('disabled', true);

		for (i in spks) {
			var option = '<option value="' + spks[i] + '">' +
						 spks[i] + '</option>';
			$(option).appendTo(this.$spkselect);

			if ('0' === i) {
				this.$spkselect.attr('disabled', false);
			}
		}

		this.$spkselect.val(newSpk);
		this.deviceChangedCallback()();
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
				SettingsApp.testSettings({
					video: true,
					audio: true,
					videoin: (self.$camselect.val() || ''),
					audioin: (self.$micselect.val() || ''),
					audioout: (self.$spkselect.val() || '')
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
				videoin: self.$camselect.val(),
				audioin: self.$micselect.val(),
				audioout: self.$spkselect.val(),
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

	init: function() {	 		 
		this.$localplayer = $(document.getElementById('local'));
		this.$remoteplayer = $(document.getElementById('remote'));
		GoCastJS.SetDevicesChangedListener(1000, this.$localplayer.get(0),
									   	   this.devicesChangedCallback());
		GoCastJS.SetSpkVolListener(500, this.$localplayer.get(0),
								   this.spkVolChangedCallback());
		GoCastJS.SetMicVolListener(500, this.$localplayer.get(0),
								   this.micVolChangedCallback());
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
		GoCastJS.getUserMedia(options,
							  this.getUserMediaSuccessCallback(),
							  this.getUserMediaFailureCallback());
	},

	devicesChangedCallback: function() {
		var localplayer = this.$localplayer.get(0);
		var firstCall = true;
		var settings = JSON.parse(window.localStorage['gcpsettings'] || '{}');

		return function(camsAdded, camsRemoved, micsAdded,
						micsRemoved, spksAdded, spksRemoved) {
			if (0 < camsAdded.length || 0 < camsRemoved.length) {
				var cameras = localplayer.videoinopts;
				var newCamera = '';
				if (0 < camsAdded.length) {
					newCamera = firstCall ? (settings.videoin||camsAdded[0]) :
					            camsAdded[0];
				} else if (GoCastJS.Video.captureDevice === camsRemoved[0]) {
					newCamera = (newCamera || cameras['default']);
				}

				SettingsUI.updateCameras(cameras, newCamera);
			}

			if (0 < micsAdded.length || 0 < micsRemoved.length) {
				var mics = localplayer.audioinopts;
				var newMic = '';
				if (0 < micsAdded.length) {
					newMic = firstCall ? (settings.audioin||micsAdded[0]) :
					         micsAdded[0];
				} else if (GoCastJS.Audio.inputDevice === micsRemoved[0]) {
					newMic = (newMic || mics['default']);
				}

				SettingsUI.updateMics(mics, newMic);
			}

			if (0 < spksAdded.length || 0 < spksRemoved.length) {
				var spks = localplayer.audiooutopts;
				var newSpk = '';
				if (0 < spksAdded.length) {
					newSpk = firstCall ? (settings.audioout||spksAdded[0]) :
					         spksAdded[0];
				} else if (GoCastJS.Audio.outputDevice === spksRemoved[0]) {
					newSpk = (newSpk || spks['default']);
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
			SettingsUI.enableEffectsSelect(true);

			var hints = {};
			if (0 < self.localStream.videoTracks.length) {
				hints.video = true;
			} else {
				hints.video = false;
			}
			if (0 < self.localStream.audioTracks.length) {
				hints.audio = true;
			} else {
				hints.audio = false;
			}

			var options = new GoCastJS.PeerConnectionOptions(
				'STUN video.gocast.it:19302',
				self.iceCallback(),
				self.addStreamCallback(),
				self.removeStreamCallback(),
				self.readyStateChangedCallback(),
				self.$remoteplayer.get(0)
			);

			self.peerConnection = new GoCastJS.PeerConnection(options);
			self.peerConnection.AddStream(self.localStream);

			var offer = self.peerConnection.CreateOffer(hints);
			self.peerConnection.SetLocalDescription(
				'OFFER',
				offer,
				function() {
					self.peerConnection.SetRemoteDescription('ANSWER', offer);
					self.peerConnection.StartIce();
				},
				function(msg) {
					console.log('PeerConnection: ' + msg);
				}
			);
		};
	},

	applyEffect: function(effect) {
		if (null !== this.localStream) {
			if (0 < this.localStream.videoTracks.length) {
				this.localStream.videoTracks[0].effect = effect;
			}
		}
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

		return function(candidate, moreComing) {
			if (true === moreComing) {
				self.peerConnection.ProcessIceMessage(candidate);
			}
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

	readyStateChangedCallback: function() {
		var self = this;

		return function() {
			console.log('PeerConnection: ReadyState = ' +
						self.peerConnection.ReadyState());
		};
	}
};

$(document).ready(function() {
	$('body').fadeIn('slow', function() {
		SettingsApp.init();
		SettingsUI.init();
	});
});
