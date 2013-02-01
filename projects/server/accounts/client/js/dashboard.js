/*jslint sloppy: false, white: true, todo: true, browser: true, devel: true */
/*global document, window, DashApp */
'use strict';

(function() { if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };
} }());

var DashView = {
    $forms: {},
    init: function() {
        var i;

        for (i = 0; i < document.forms.length; i += 1) {
            this.$forms[document.forms[i].id] = $(document.forms[i]);
        }

        if ($.urlvars.action && 'resetpassword' === $.urlvars.action) {
            this.displayform('resetpwd-form');
        } else {
            this.displayform('login-form');
        }

        $('body > .navbar .formlink').click(this.changeformCallback());
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
        var i, email,
            formtips = {
                'login-form': 'Log in with your GoCast account and create your own meeting room on the web!',
                'changepwd-form': 'Submit your new password. Then, use it the next time you log in to GoCast.',
                'startmeeting-form': 'Enter the name of the room which you want to create or go into. You will ' +
                                     'then be provided with a unique link for that room. You can invite others ' +
                                     'by emailing that link to them.<br>Click on the \'Take me to my room\' button ' +
                                     'to enter the room.',
                'reqresetpwd-form': 'An email will be sent to the address associated with your account. Follow the ' +
                                    'instructions in it to reset the password for your account.',
                'resetpwd-form': 'Submit your new password and use it to log in to GoCast from now on.'
            };

        for (i in this.$forms) {
            this.$forms[i].removeClass('show');
            $('.alert', this.$forms[i]).removeClass('show');
        }

        this.$forms[id].addClass('show');
        this.$forms[id].clearForm();
        this.setupPlaceholders(id);

        if ('changepwd-form' === id) {
            $('#input-email', this.$forms[id]).val(DashApp.boshconn.getEmailFromJid());
        } else if ('login-form' === id && $.urlvars.ecode) {
            email = $.roomcode.decipheruname($.urlvars.ecode);
            $('#input-email', this.$forms[id]).val(email);
        } else if ('startmeeting-form' === id) {
            if ($.browser.msie) {
                $('#input-roomname', this.$forms[id]).blur();
            }
            if ('undefined' !== typeof(Storage) && localStorage.gcpDesiredRoomname) {
                $('#input-roomname', this.$forms[id]).val(decodeURI(localStorage.gcpDesiredRoomname));
                delete localStorage.gcpDesiredRoomname;
            }
        } else if ('reqresetpwd-form' === id && !$.browser.msie) {
            $('#input-email', this.$forms[id]).focus();
        } else if ('resetpwd-form' === id) {
            $('#input-email', this.$forms[id]).val($.urlvars.email||'');
            if (!$.browser.msie) {
                $('#input-password', this.$forms[id]).focus();
            }
        }

        this.displayformtip(formtips[id]);
    },
    displayalert: function(formid, type, message) {
        var $alert = null;

        $('.alert', this.$forms[formid]).removeClass('show');
        $alert = $('.alert-' + type, this.$forms[formid]).addClass('show');
        $('p', $alert).html(message);
    },
    displayformtip: function(message) {
        $('.alert-info p').html(message);
    },
    showloader: function(formid) {
        $('.btn[type="submit"]', this.$forms[formid]).addClass('disabled')
                                                     .html('<i class="icon-spinner icon-spin icon-2x"></i>');
    },
    cancelloader: function(formid) {
        var submittexts = {
            'login-form': 'Log me in',
            'changepwd-form': 'Change my password',
            'startmeeting-form': 'Create my room',
            'reqresetpwd-form': 'Send me a password reset email',
            'resetpwd-form': 'Reset my password'
        };
        $('.btn[type="submit"]', this.$forms[formid]).removeClass('disabled')
                                                          .html(submittexts[formid]);

    },
    changeformCallback: function() {
        var self = this;

        return function(e) {
            var evt = e || window.event;
            self.displayform($(this).attr('href').replace(/^#/, ''));

            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
        };
    }
};

var DashApp = {
    email: null,
    boshconn: null,
    $forms: {},
    formCallbacks: {
        'login-form': {
            success: function() {
                return function(response) {
                };
            },
            failure: function() {
                return function(error) {
                };
            },
            beforesubmit: function() {
                return function(arr, $form, options) {
                    var email = $('#input-email', $form).val().trim();

                    $('#input-email', $form).val(email);
                    if (1 < email.split(' ').length || -1 === email.indexOf('@')) {
                        RegisterView.displayalert('register-form', 'error', 'Please enter a valid email address.');
                        $('#input-email', $form).focus();
                    } else {
                        DashApp.boshconn.connect({
                            username: $('#input-email', $form).val(),
                            password: $('#input-password', $form).val()
                        });
                        DashView.showloader('login-form');
                    }

                    return false;
                };
            }
        },
        'changepwd-form': {
            success: function() {
                return function(response) {
                    DashView.cancelloader('changepwd-form');
                    if ('success' === response.result) {
                        DashView.displayform('startmeeting-form');
                        DashView.displayalert('startmeeting-form', 'success', 'Your password has been changed. Use your ' +
                                              'new password to login from now on.');
                    } else {
                        DashView.displayalert('changepwd-form', 'error', 'There was an error changing the password for ' +
                                              'your account.');
                    }
                };
            },
            failure: function() {
                return function(error) {
                    DashView.cancelloader('changepwd-form');
                    DashView.displayalert('changepwd-form', 'error', 'There was an error changing the password for ' +
                                          'your account.');
                };
            },
            beforesubmit: function() {
                return function(arr, $form, options) {
                    if ($('#input-password', $form).val() !== $('#input-confirmpassword', $form).val()) {
                        DashView.displayalert('changepwd-form', 'error', 'The password fields don\'t match.');
                        $('#input-password', $form).focus();
                        return false;
                    }
                    DashView.showloader('changepwd-form');
                };
            }
        },
        'startmeeting-form': {
            success: function() {
                return function(response) {
                    var roomlinkrel, atag, rcode,
                        roomname = $('#input-roomname', DashApp.$forms['startmeeting-form']).val();

                    DashView.cancelloader('startmeeting-form');
                    if('success' === response.result) {
                        rcode = $.roomcode.cipher(DashApp.boshconn.getEmailFromJid().replace(/@/, '~'), roomname);
                        roomlinkrel = window.location.pathname.replace(/dashboard\.html*$/, '') + '?roomname=' + rcode;
                        atag = document.createElement('a');

                        atag.href = roomlinkrel;
                        DashView.displayalert('startmeeting-form', 'success', 'You\'re room has been ' +
                                              'created. The unique link for this room is:<br><br>' +
                                              '<input class="input-block-level" type="text" value="' + atag.href + '">' +
                                              '<br><br><a href="' + roomlinkrel + '" class="btn btn-block btn-success">' +
                                              'Take me to my room</a>');
                    } else {
                        DashView.displayalert('startmeeting-form', 'error', 'There was an error while creating your ' +
                                              'desired room.');
                    }
                };
            },
            failure: function() {
                return function(error) {
                    DashView.cancelloader('startmeeting-form');
                    DashView.displayalert('startmeeting-form', 'error', 'There was an error while creating your desired room.');
                };
            },
            beforesubmit: function() {
                return function(arr, $form, options) {
                    DashView.showloader('startmeeting-form');
                };
            },
            data: function() { return {email: DashApp.boshconn.getEmailFromJid()}; }
        },
        'reqresetpwd-form': {
            success: function() {
                return function(response) {
                    DashView.cancelloader('reqresetpwd-form');
                    if ('success' === response.result) {
                        DashView.displayform('login-form');
                        DashView.displayalert('login-form', 'success', 'An email has been sent to the address you ' +
                                              'provided. Follow the instructions in it to reset your password. ' +
                                              '<br><br><span class="label label-info">If the email isn\'t in your ' +
                                              'inbox, check your spam folder.</span>');
                    } else {
                        DashView.displayalert('reqresetpwd-form', 'error', 'There was a problem requesting your password ' +
                                              'reset.');
                    }
                };
            },
            failure: function() {
                return function(error) {
                    DashView.cancelloader('reqresetpwd-form');
                    DashView.displayalert('reqresetpwd-form', 'error', 'There was a problem requesting your password ' +
                                          'reset.');
                };
            },
            beforesubmit: function() {
                return function(arr, $form, options) {
                    var email = $('#input-email', $form).val().trim();

                    $('#input-email', $form).val(email);
                    if (1 < email.split(' ').length || -1 === email.indexOf('@')) {
                        RegisterView.displayalert('reqresetpwd-form', 'error', 'Please enter a valid email address.');
                        $('#input-email', $form).focus();
                        return false;
                    }
                    DashView.showloader('reqresetpwd-form');
                };
            },
            data: function() { return {baseurl: $.urlvars.baseurl}; }
        },
        'resetpwd-form': {
            success: function() {
                return function(response) {
                    DashView.cancelloader('resetpwd-form');
                    if ('success' === response.result) {
                        DashView.displayform('login-form');
                        $('#input-email', DashApp.$forms['login-form']).val($.urlvars.email||'');
                        DashView.displayalert('login-form', 'success', 'You have successfully reset your password. ' +
                                              'You can now use your new password to log in.');
                    } else if ('bad resetcode' === response.result) {
                        DashView.displayalert('resetpwd-form', 'error', 'Password reset failed. The reset code you\'ve ' +
                                              'provided is invalid.');
                    } else if ('not activated' === response.result) {
                        DashView.displayalert('resetpwd-form', 'error', 'Password reset failed. The account asssociated ' +
                                              'with the email address has not been activated yet.');
                    } else if ('no account' === response.result) {
                        DashView.displayalert('resetpwd-form', 'error', 'Password reset failed. There is no account ' +
                                              'associated with this email address.');
                    } else {
                        DashView.displayalert('resetpwd-form', 'error', 'There was a problem resetting your password.');
                    }
                };
            },
            failure: function() {
                return function(error) {
                    DashView.cancelloader('resetpwd-form');
                    DashView.displayalert('resetpwd-form', 'error', 'There was a problem resetting your password.');
                };
            },
            beforesubmit: function() {
                return function(arr, $form, options) {
                    if ($('#input-password', $form).val() !== $('#input-confirmpassword', $form).val()) {
                        DashView.displayalert('resetpwd-form', 'error', 'The password fields don\'t match.');
                        $('#input-password', $form).focus();
                        return false;
                    }
                    DashView.showloader('resetpwd-form');
                };
            },
            data: function() { return {resetcode: $.urlvars.resetcode||''}; }
        }
    },
    setupForm: function(id) {
        var options = {
            dataType: 'json',
            beforeSubmit: this.formCallbacks[id].beforesubmit(),
            success: this.formCallbacks[id].success(),
            error: this.formCallbacks[id].failure()
        };

        if (this.formCallbacks[id].data) {
            options.data = this.formCallbacks[id].data();
        }
        this.$forms[id].ajaxForm(options);
    },
    init: function() {
        var urlvars = $.urlvars,
            self = this, i;

        for (i=0; i<document.forms.length; i += 1) {
            this.$forms[document.forms[i].id] = $(document.forms[i]);
        }

        this.settings = new GoCastJS.CallcastSettings(window.location.hostname);

        this.setupForm('login-form');
        this.setupForm('reqresetpwd-form');
        this.setupForm('resetpwd-form');
        this.boshconn = new GoCastJS.StropheConnection({
            boshurl: '/xmpp-httpbind',
            xmppserver: this.settings.get('CALLCAST_XMPPSERVER'),
            statusCallback: this.boshconnstatusCallback()
        });

        $('body > .navbar .logoutlink').click(this.logoutCallback());

        if ('true' === urlvars.justactivated) {
            DashView.displayalert('login-form', 'success', 'Your account has been activated. ' +
                                  'You can now login with your new account.');
        }

        if ('resetpassword' !== $.urlvars.action && this.boshconn.hasSavedRegisteredLoginInfo()) {
            this.boshconn.autoConnect();
            DashView.showloader('login-form');
        }
    },
    queryName: function(gotName) {
        var succCb = gotName || function(name) {},
            _email = this.boshconn.getEmailFromJid();

        $.ajax({
            url: '/acct/getprofile/',
            type: 'POST',
            dataType: 'json',
            data: { email: _email },
            success: function(response) {
                if ('success' === response.result) {
                    succCb(response.data.name || _email);
                }
            }
        });
    },
    boshconnstatusCallback: function() {
        var self = this;

        return function(status) {
            if (Strophe.Status.CONNECTED === status ||
                Strophe.Status.ATTACHED === status) {
                self.setupForm('startmeeting-form');
                self.setupForm('changepwd-form');
                DashView.displayform('startmeeting-form');
                $('body > .navbar .nav').addClass('show');
                self.queryName(function(name) {
                    $('body > .navbar .label').html('Hi ' + name + '!');
                });
            } else if (Strophe.Status.DISCONNECTED === status ||
                       Strophe.Status.TERMINATED === status) {
                DashView.cancelloader('login-form');
                DashView.displayform('login-form');
                $('body > .navbar .nav').removeClass('show');
            } else if (Strophe.Status.AUTHFAIL === status) {
                DashView.cancelloader('login-form');
                DashView.displayform('login-form');
                DashView.displayalert('login-form', 'error', 'Login failed. The email and/or password that you provided ' +
                                      'is invalid.');
            } else if (Strophe.Status.CONNFAIL === status) {
                DashView.cancelloader('login-form');
                DashView.displayform('login-form');
                DashView.displayalert('login-form', 'error', 'There was a problem logging in to your account.');
            }
        };
    },
    logoutCallback: function() {
        var self = this;

        return function(e) {
            var evt = e || window.event;
            self.boshconn.disconnect();

            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
        };
    }
};

$(document).ready(function() {
    DashView.init();
    DashApp.init();
});
