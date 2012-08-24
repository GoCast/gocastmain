var SettingsUI = {
	$camselect: null,
	$micselect: null,
	$spkselect: null,
	$effects: null,
	$testsettings: null,

	init: function(camselect, micselect, spkselect, effects, testsettings) {
		this.$camselect = $(camselect);
		this.$micselect = $(micselect);
		this.$spkselect = $(spkselect);
		this.$effects = $(effects);
		this.$testsettings = $(testsettings);
		this.$effects.change(this.effectChangedCallback());
		this.$effects.attr('disabled', 'true');
		this.$testsettings.click(this.testSettingsClickedCallback());
	},

	enableEffectsSelect: function(enable) {
		this.$effects.attr('disabled', !enable);
		if (false === enable) {
			this.$effects.val('');
		}
	},

	updateCameras: function(cameras) {
		this.$camselect.html('');
		var firstOption = '<option value="" disabled="disabled">' +
						  'choose a camera</option>';
		$(firstOption).appendTo(this.$camselect);

		for (i in cameras) {
			if('default' !== i) {
				var option = '<option value="' + i + '">' +
							 cameras[i] + '</option>';
				$(option).appendTo(this.$camselect);
			}
		}

		this.$camselect.val(GoCastJS.Video.captureDevice);
	},

	updateMics: function(mics) {
		this.$micselect.html('');
		var firstOption = '<option value="" disabled="disabled">' +
						  'choose a microphone</option>';
		$(firstOption).appendTo(this.$micselect);

		for (i in mics) {
			var option = '<option value="' + mics[i] + '">' +
						 mics[i] + '</option>';
			$(option).appendTo(this.$micselect);
		}

		this.$micselect.val(GoCastJS.Audio.inputDevice);
	},

	updateSpks: function(spks) {
		this.$spkselect.html('');
		var firstOption = '<option value="" disabled="disabled">' +
						  'choose a speaker</option>';
		$(firstOption).appendTo(this.$spkselect);

		for (i in spks) {
			var option = '<option value="' + spks[i] + '">' +
						 spks[i] + '</option>';
			$(option).appendTo(this.$spkselect);
		}

		this.$spkselect.val(GoCastJS.Audio.outputDevice);
	},

	effectChangedCallback: function() {
		var self = this;

		return function() {
			SettingsApp.applyEffect(self.$effects.val());
		};
	},

	testSettingsClickedCallback: function() {
		var self = this;

		return function() {
			if ('' === self.$camselect.val()) {
				alert('Please choose a camera');
			} else if ('' === self.$micselect.val()) {
				alert('Please choose a microphone');
			} else if ('' === self.$spkselect.val()) {
				alert('Please choose a speaker');
			} else {
				SettingsApp.testSettings({
					video: true,
					audio: true,
					videoin: self.$camselect.val(),
					audioin: self.$micselect.val(),
					audioout: self.$spkselect.val()
				});
			}
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

	init: function(local, remote) {
		this.$localplayer = $(local);
		this.$remoteplayer = $(remote);
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

		return function(camsAdded, camsRemoved, micsAdded,
						micsRemoved, spksAdded, spksRemoved) {
			if (0 < camsAdded.length || 0 < camsRemoved.length) {
				var cameras = localplayer.videoinopts;
				SettingsUI.updateCameras(cameras);
			}

			if (0 < micsAdded.length || 0 < micsRemoved.length) {
				var mics = localplayer.audioinopts;
				SettingsUI.updateMics(mics);
			}

			if (0 < spksAdded.length || 0 < spksRemoved.length) {
				var spks = localplayer.audiooutopts;
				SettingsUI.updateSpks(spks);
			}
		}
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
			console.log('PeerConnection: ReadyState = ' + self.peerConnection.ReadyState());
		};
	}
};

$(document).ready(function() {
	SettingsUI.init('#cameraselect', '#micselect',
					'#spkselect', '#effectselect', '#testsettings');
	SettingsApp.init(document.getElementById('local'),
			 		 document.getElementById('remote'));
	GoCastJS.SetDevicesChangedListener(1000, SettingsApp.$localplayer.get(0),
									   SettingsApp.devicesChangedCallback());
});
