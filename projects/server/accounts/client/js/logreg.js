var LogregView = {
  $forms: {},
  init: function() {
    for (var i=0; i<document.forms.length; i++) {
      this.$forms[document.forms[i].id] = $(document.forms[i]);
      $('[targetform].btn', this.$forms[document.forms[i].id]).click(this.changeformCallback());
    }
    this.displaydefaultform(LogregApp.urlvars().defaultaction);
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
  displayalert: function(formid, type, message) {
    var $alert = $('.alert-' + type, this.$forms[formid]).addClass('show');
    $('span', $alert).text(' ' + message);
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
  formSubmitResultCallbacks: {
    'register-form': {
      success: function() {
        return function(response) {
          if ('success' === response.result) {
            LogregView.displayform('activate-form');
            LogregView.displayalert('activate-form', 'success', 'Account created and activation email sent to ' + response.email);
          }
        };
      },
      failure: function() {
        return function(error) {
          LogregView.displayalert('register-form', 'error', 'Problem signing up.');
        };
      }
    },
    'activate-form': {
      success: function() {
        return function(response) {
          if ('success' === response.result) {
            LogregView.displayform('login-form');
            LogregView.displayalert('login-form', 'success', 'Account activated, please sign in.');
          }
        };
      },
      failure: function() {
        return function(error) {
          LogregView.displayalert('activate-form', 'error', 'Problem activating your account.');
        }
      }
    },
    'login-form': {
      success: function() { return function(response) {}; },
      failure: function() { return function(error) {}; }
    }
  },
  init: function() {
    for (var i=0; i<document.forms.length; i++) {
      this.$forms[document.forms[i].id] = $(document.forms[i]);
      this.$forms[document.forms[i].id].ajaxForm({
        dataType: 'json',
        success: this.formSubmitResultCallbacks[document.forms[i].id].success(),
        error: this.formSubmitResultCallbacks[document.forms[i].id].failure()
      });
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
