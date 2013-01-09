var LogregView = {
	$forms: {},
	init: function() {
		for (i in document.forms) {
			this.$forms[document.forms[i].id] = $(document.forms[i]);
			$('[targetform].btn', this.$forms[document.forms[i].id]).click(this.changeformCallback());
		}
		this.displaydefaultform(LogregApp.urlvars().action);
	},
	displayform: function(id) {
		for (i in this.$forms) {
			this.$forms[i].removeClass('show');
		}
		this.$forms[id].addClass('show');
	},
	displaydefaultform: function(action) {
		var actions = ['login', 'register', 'activate'];
		var formids = {login: 'login-form', register: 'register-form', activate: 'activate-form'};

		if (!action || -1 === actions.indexOf(action)) {
			this.displayform('login-form');
		} else {
			this.displayform(formids[action]);
		}
	},
	changeformCallback: function() {
		var self = this;

		return function() {
			self.displayform($(this).attr('targetform'));
		};
	}
};

var LogregApp = {
	$forms: {},
	init: function() {
		for (i in document.forms) {
			this.$forms[document.forms[i].id] = $(document.forms[i]);
		}
	},
	urlvars: function() {
		var urlvarsobj = {},
			varstring = window.location.href.split('?')[1];

		if (varstring) {
			var nvpairs = varstring.split('&');
			for (i in nvpairs) {
				urlvarsobj[decodeURI(nvpairs[i].split('=')[0])] = decodeURI(nvpairs[i].split('=')[1]);
			}
		}

		return urlvarsobj;
	}
};

$(document).ready(function() {
	LogregView.init();
	LogregApp.init();
});