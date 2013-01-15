var LogregView = {
    $forms: {},
    init: function() {
        for (var i=0; i<document.forms.length; i++) {
            this.$forms[document.forms[i].id] = $(document.forms[i]);
        }
        this.displaydefaultform(LogregApp.urlvars().defaultaction);
    },
    displayform: function(id) {
        for (i in this.$forms) {
            this.$forms[i].removeClass('show');
            $('.alert', this.$forms[i]).removeClass('show');
        }
        this.$forms[id].addClass('show');
    },
    displaydefaultform: function(action) {
        var actions = ['register', 'activate'];
        var formids = {register: 'register-form', activate: 'activate-form'};

        if (!action || -1 === actions.indexOf(action)) {
            this.displayform('register-form');
        } else {
            this.displayform(formids[action]);
        }
    },
    displayalert: function(formid, type, message) {
        var $alert = null;

        $('.alert', this.$forms[formid]).removeClass('show');
        $alert = $('.alert-' + type, this.$forms[formid]).addClass('show');
        $('p', $alert).html(message);
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
                        LogregView.displayalert('activate-form', 'success', 'Your account has been created. ' +
                                                'An activation email has been sent to the address you just provided. ' +
                                                'Follow the instructions in the email to activate your account.');
                    } else if ('inuse' === response.result) {
                        LogregView.displayalert('register-form', 'error', 'An account for the email address you\'ve provided ' +
                                                'already exists. Choose a different email address.');
                        $('#input-email', LogregApp.$forms['register-form']).focus();
                    } else {
                        LogregView.displayalert('register-form', 'error', 'There was a problem signing up for your new account.');
                    }
                };
            },
            failure: function() {
                return function(error) {
                    LogregView.displayalert('register-form', 'error', 'There was a problem signing up for your new account.');
                };
            }
        },
        'activate-form': {
            success: function() {
                return function(response) {
                    if ('success' === response.result) {
                        window.location.href = LogregApp.urlvars()
                                                .baseurl
                                                .replace(/logreg\.html/, 'dashboard.html')
                                                + '?justactivated=true';
                    } else if ('incorrect' === response.result) {
                        LogregView.displayalert('activate-form', 'error', 'The activation code you\'ve provided is wrong. ' +
                                                'Please provide the correct activation code.');
                        $('#input-activation-code', $LogregApp.$forms['activate-form']).val('').focus();
                    } else if ('noaccount' === response.result) {
                        LogregView.displayalert('activate-form', 'error', 'The activation code you\'ve provided is bad. ' +
                                                'There is no account for the email address you\'ve provided.');
                        $('#input-email', $LogregApp.$forms['activate-form']).focus();
                    } else if ('usedorexpired' === response.result) {
                        LogregView.displayalert('activate-form', 'error', 'The activation code you\'ve provided has expired ' +
                                                'or has already been used to activate your account.');
                        $('#input-email', $LogregApp.$forms['activate-form']).focus();
                    } else {
                        LogregView.displayalert('activate-form', 'error', 'There was a problem activating your account.');
                    }
                };
            },
            failure: function() {
                return function(error) {
                    LogregView.displayalert('activate-form', 'error', 'There was a problem activating your account.');
                };
            }
        }
    },
    init: function() {
        var urlvars = this.urlvars(),
            self = this;

        for (var i=0; i<document.forms.length; i++) {
            var options = {
                dataType: 'json',
                resetForm: true,
                success: this.formSubmitResultCallbacks[document.forms[i].id].success(),
                error: this.formSubmitResultCallbacks[document.forms[i].id].failure()        
            };

            if ('register-form' === document.forms[i].id) {
                options.data = {baseurl: urlvars.baseurl};
                options.beforeSubmit = function(arr, $form, options) {
                    $('#input-email', self.$forms['activate-form']).val($('#input-email', $form).val());
                    if ($('#input-password', $form).val() !==$('#input-confirm-password', $form).val()) {
                        LogregView.displayalert('register-form', 'error', 'The password fields don\'t match. Make sure ' +
                                                'you\'ve entered the same password in both fields.');
                        $('#input-password', $form).focus();
                        return false;
                    }
                };
            }
            this.$forms[document.forms[i].id] = $(document.forms[i]);
            this.$forms[document.forms[i].id].ajaxForm(options);
        }

        if ('activate' === urlvars.defaultaction && urlvars.code && urlvars.email) {
            $('#input-email', this.$forms['activate-form']).val(urlvars.email);
            $('#input-activation-code', this.$forms['activate-form']).val(urlvars.code);
            $('[type="submit"].btn', this.$forms['activate-form']).click();
        }
    },
    urlvars: function() {
        var urlvarsobj = {},
        varstring = window.location.href.split('?')[1];

        urlvarsobj['baseurl'] = window.location.href.split('?')[0];
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
