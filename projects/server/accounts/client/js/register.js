/*jslint sloppy: false, todo: true, white: true, browser: true, devel: true */
/*global document */

(function() { if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };
} }());

var RegisterView = {
    $forms: {},
    init: function() {
        var i;

        for (i=0; i<document.forms.length; i++) {
            this.$forms[document.forms[i].id] = $(document.forms[i]);
        }
        this.displaydefaultform($.urlvars.defaultaction);

        if ($.urlvars.utm_source && 'coursera' === $.urlvars.utm_source.toLowerCase()) {
            $('.span12 img').attr('src','images/molanding_banner_coursera.png');
            this.$forms['courses-form'].addClass('show');
        } else {
            $('.span12 img').attr('src','images/molanding_banner.png');
        }
    },
    setupPlaceholders: function(id) {
        var $textfields, $pwdfields, $pwdfield,
            $placeholders, $placeholder, $loginform;

        if ($.browser.msie && 10.0 > parseFloat($.browser.version)) {
            $textfields = $('form#' + id + ' input[type="text"][name], form input[type="email"][name]');
            $pwdfields = $('form#' + id + ' input[type="password"][name]');
            $placeholders = $('form#' + id + ' input.ie-pwd-placeholder');

            $textfields.focus(function() {
                if ($(this).attr('placeholder') === $(this).val()) {
                    $(this).val('');
                }
            }).blur(function() {
                if (!$(this).val()) {
                    $(this).val($(this).attr('placeholder'));
                }
            }).each(function() {
                $(this).val($(this).attr('placeholder'));
            });

            $pwdfields.blur(function() {
                if (!$(this).val()) {
                    $placeholder = $('form#' + id + ' #' + $(this).attr('id') + '_placeholder');
                    $(this).addClass('hide');
                    $placeholder.addClass('show').val($(this).attr('placeholder'));
                }
            }).each(function() {
                $placeholder = $('#' + id + ' #' + $(this).attr('id') + '_placeholder');
                $(this).addClass('hide');
                $placeholder.addClass('show').val($(this).attr('placeholder'));
            });

            $placeholders.focus(function() {
                $pwdfield = $('#' + id + ' #' + $(this).attr('id').split('_')[0]);
                $(this).removeClass('show');
                $pwdfield.removeClass('hide');
                $pwdfield.focus();
            });
        }
    },
    displayform: function(id) {
        for (i in this.$forms) {
            this.$forms[i].removeClass('show');
            $('.alert', this.$forms[i]).removeClass('show');
        }
        this.$forms[id].addClass('show');
        this.$forms[id].clearForm();
        this.setupPlaceholders(id);
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
    },
    showloader: function(formid, $button) {
        var $btn = $button || $('.btn[type="submit"]', this.$forms[formid]);
        $btn.addClass('disabled').html('<i class="icon-spinner icon-spin icon-2x"></i>');
    },
    cancelloader: function(formid, $button, text) {
        var submittexts = {
                'register-form': 'Sign me up'
            },
            $btn = $button || $('.btn[type="submit"]', this.$forms[formid]),
            btntext = text || submittexts[formid];
        $btn.removeClass('disabled').html(btntext);
    },
};

var RegisterApp = {
    $forms: {},
    formSubmitResultCallbacks: {
        'register-form': {
            success: function() {
                return function(response) {
                    var $desiredroomname = $('#input-desiredroomname', RegisterApp.$forms['register-form']),
                        $email = $('#input-email', RegisterApp.$forms['register-form']),
                        $name = $('#input-name', RegisterApp.$forms['register-form']),
                        $passwd = $('#input-password', RegisterApp.$forms['register-form']),
                        msg = 'Thanks for signing up, ' + $name.val() + '!<br>Your account has been created. ' +
                              'Look in your inbox for an activation email from GoCast Support, and ' +
                              'follow the instructions in it.<br><br><span class="label label-info">' +
                              'If the email isn\'t in your inbox, check your spam folder.</span>';

                    RegisterView.cancelloader('register-form');
                    if ('success' === response.result) {
                        if ($desiredroomname.length && 'undefined' !== typeof(Storage)) {
                            localStorage.gcpDesiredRoomname = $desiredroomname.val();
                        }
                        RegisterView.displayform('activate-form');
                        RegisterView.displayalert('activate-form', 'success', msg);
                        $('#input-email', RegisterApp.$forms['activate-form'])
                            .val($('#input-email', RegisterApp.$forms['register-form']).val());
                    } else if ('inuse' === response.result) {
                        RegisterView.displayalert('register-form', 'error', 'An account for the email address ' +
                                                  'you\'ve provided already exists. Choose a different email address.');
                        $email.focus();
                    } else if ('registered' === response.result) {
                        RegisterView.displayalert('register-form', 'error', 'There is already an account present for ' +
                                                  $email.val() + '. It has not been activated yet. If you have not ' +
                                                  'received an activation email yet, please click below.<br><br>' +
                                                  '<button class="btn btn-block btn-danger" onclick=' +
                                                  '"RegisterApp.sendactemail(event, \'' + $email.val() + '\', this);">' +
                                                  'Send me an activation email</button>');
                    } else if ('no email' === response.result) {
                        RegisterView.displayalert('register-form', 'error', 'Please enter a valid email address.');
                        $email.focus();
                    } else if ('no name' === response.result) {
                        RegisterView.displayalert('register-form', 'error', 'Please enter your name.');
                        $name.focus();
                    } else if ('no password' === response.result) {
                        RegisterView.displayalert('register-form', 'error', 'Please choose a password.');
                        $passwd.focus();
                    } else {
                        RegisterView.displayalert('register-form', 'error', 'There was a problem signing up for your new account.');
                    }
                };
            },
            failure: function() {
                return function(error) {
                    RegisterView.cancelloader('register-form');
                    RegisterView.displayalert('register-form', 'error', 'There was a problem signing up for your new account.');
                };
            }
        },
        'activate-form': {
            success: function() {
                return function(response) {
                    var desturl;

                    if ('success' === response.result) {
                        desturl = $.urlvars.baseurl.replace(/(register|myroom)\.html/, 'dashboard.html') +
                                  '?justactivated=true&ecode=' + $.roomcode.cipher($('#input-email',
                                                                                   RegisterApp.$forms['activate-form']).val(),
                                                                                   'gcst');
                        window.location.href = ($.urlvars.utm_source && 'adwords' === $.urlvars.utm_source.toLowerCase()) ?
                                               (desturl + '&sendconversion=1') : desturl;
                    } else if ('incorrect' === response.result) {
                        RegisterView.displayalert('activate-form', 'error', 'The activation code you\'ve provided is wrong. ' +
                                                'Please provide the correct activation code.');
                        $('#input-activation-code', RegisterApp.$forms['activate-form']).val('').focus();
                    } else if ('noaccount' === response.result) {
                        RegisterView.displayalert('activate-form', 'error', 'The activation code you\'ve provided is bad. ' +
                                                'There is no account for the email address you\'ve provided.');
                        $('#input-email', RegisterApp.$forms['activate-form']).focus();
                    } else if ('usedorexpired' === response.result) {
                        RegisterView.displayalert('activate-form', 'error', 'The activation code you\'ve provided has expired ' +
                                                'or has already been used to activate your account.');
                        $('#input-email', RegisterApp.$forms['activate-form']).focus();
                    } else {
                        RegisterView.displayalert('activate-form', 'error', 'There was a problem activating your account.');
                    }
                };
            },
            failure: function() {
                return function(error) {
                    RegisterView.displayalert('activate-form', 'error', 'There was a problem activating your account.');
                };
            }
        },
        'courses-form': {
            success: function() { return function(response) {}; },
            failure: function() { return function(error) {}; }
        }
    },
    init: function() {
        var urlvars = $.urlvars,
            self = this;

        for (var i=0; i<document.forms.length; i++) {
            var options = {
                dataType: 'json',
                success: this.formSubmitResultCallbacks[document.forms[i].id].success(),
                error: this.formSubmitResultCallbacks[document.forms[i].id].failure()
            }, campaign = {}, campaignstr = '';

            if ('register-form' === document.forms[i].id) {
                options.data = {
                    baseurl: urlvars.baseurl
                };

                if ($.urlvars.utm_source) {
                    campaign.utm_source = $.urlvars.utm_source;
                }
                if ($.urlvars.utm_campaign) {
                    campaign.utm_campaign = $.urlvars.utm_campaign;
                }
                if ($.urlvars.utm_medium) {
                    campaign.utm_medium = $.urlvars.utm_medium;
                }
                campaignstr = JSON.stringify(campaign);
                if ('{}' !== campaignstr) {
                    options.data.extra_fields = campaignstr;
                }

                options.beforeSubmit = function(arr, $form, options) {
                    var email;

                    if ($('#input-password', $form).val() !== $('#input-confirmpassword', $form).val()) {
                        RegisterView.displayalert('register-form', 'error', 'The password fields don\'t match.');
                        $('#input-password', $form).focus();
                        return false;
                    }

                    email = $('#input-email', $form).val().trim();
                    $('#input-email', $form).val(email);
                    if (1 < email.split(' ').length || -1 === email.indexOf('@')) {
                        RegisterView.displayalert('register-form', 'error', 'Please enter a valid email address.');
                        $('#input-email', $form).focus();
                        return false;
                    }

                    RegisterView.showloader('register-form');
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
    sendactemail: function(evt, email, sendbtn) {
        var $sendbtn = $(sendbtn),
            _email = email,
            self = this;

        if (evt.preventDefault) {
            evt.preventDefault();
        } else {
            evt.returnValue = false;
        }

        RegisterView.showloader('register-form', $sendbtn);
        $.ajax({
            url: '/acct/sendemailagain/',
            type: 'POST',
            dataType: 'json',
            data: {
                email: _email,
                baseurl: $.urlvars.baseurl
            },
            success: function(response) {
                RegisterView.cancelloader('register-form', $sendbtn, 'Send me an activation email');
                RegisterView.displayform('activate-form');
                RegisterView.displayalert('activate-form', 'success', 'Look in your inbox for an activation email ' +
                                          'from GoCast Support, and follow the instructions in it.<br><br>' +
                                          '<span class="label label-info">If the email isn\'t in your '+
                                          'inbox, check your spam folder.</span>');
                $('#input-email', self.$forms['activate-form']).val(_email);
            },
            failure: function() {
                RegisterView.cancelloader('register-form', $sendbtn, 'Send me an activation email');
                RegisterView.displayalert('register-form', 'error', 'There was a problem sending the activation email.');
            }
        });
    }
};

$(document).ready(function() {
    RegisterView.init();
    RegisterApp.init();
});
