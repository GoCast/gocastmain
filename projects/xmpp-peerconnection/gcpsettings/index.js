var SettingsUI = {
	$camselect: null,
	$micselect: null,
	$spkselect: null,

	init: function(camselect, micselect, spkselect) {
		this.$camselect = $(camselect);
		this.$micselect = $(micselect);
		this.$spkselect = $(spkselect);
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
	}
};

var SettingsApp = {
	$localplayer: null,
	$remoteplayer: null,

	init: function(local, remote) {
		this.$localplayer = $(local);
		this.$remoteplayer = $(remote);
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
	}
};

$(document).ready(function() {
	SettingsUI.init('#cameraselect', '#micselect', '#spkselect');
	SettingsApp.init(document.getElementById('local'),
			 document.getElementById('remote'));
	GoCastJS.SetDevicesChangedListener(1000, SettingsApp.$localplayer.get(0),
									   SettingsApp.devicesChangedCallback());
});
