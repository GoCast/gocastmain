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
            $placeholders, $placeholder, $loginform,
            self = this;

        if ($.browser.msie && 10.0 > parseFloat($.browser.version)) {
            $textfields = $('input[type="text"][name], input[type="email"][name], textarea', this.$forms[id]);
            $pwdfields = $('input[type="password"][name]', this.$forms[id]);
            $placeholders = $('input.ie-pwd-placeholder', this.$forms[id]);

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
                    $placeholder = $('#' + $(this).attr('id') + '_placeholder', self.$forms[id]);
                    $(this).addClass('hide');
                    $placeholder.addClass('show').val($(this).attr('placeholder'));
                }
            }).each(function() {
                $placeholder = $('#' + $(this).attr('id') + '_placeholder', self.$forms[id]);
                $(this).addClass('hide');
                $placeholder.addClass('show').val($(this).attr('placeholder'));
            });

            $placeholders.focus(function() {
                $pwdfield = $('#' + $(this).attr('id').split('_')[0], self.$forms[id]);
                $(this).removeClass('show');
                $pwdfield.removeClass('hide');
                $pwdfield.focus();
            });
        }
    },
    displayform: function(id, defaults) {
        var i, email, defs = defaults || {}, date, hours, ampm,
            formtips = {
                'login-form': 'Log in with your GoCast account and create your own meeting room on the web!',
                'changepwd-form': 'Submit your new password. Then, use it the next time you log in to GoCast.',
                'startmeeting-form': 'Create a new room, or choose one of your existing rooms for your meeting. You will ' +
                                     'then be provided with a unique link for that room. You can invite others ' +
                                     'by emailing that link to them.',
                'reqresetpwd-form': 'An email will be sent to the address associated with your account. Follow the ' +
                                    'instructions in it to reset the password for your account.',
                'resetpwd-form': 'Submit your new password and use it to log in to GoCast from now on.',
                'schedulemeeting-form': 'Schedule a meeting by inviting others via email. Specify a date and time.'
            };

        for (i in this.$forms) {
            if (this.$forms.hasOwnProperty(i)) {
                this.$forms[i].removeClass('show');
                $('.alert', this.$forms[i]).removeClass('show');
            }
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
            $('select', this.$forms[id]).val('');
        } else if ('reqresetpwd-form' === id && !$.browser.msie) {
            $('#input-email', this.$forms[id]).focus();
        } else if ('resetpwd-form' === id) {
            $('#input-email', this.$forms[id]).val($.urlvars.email||'');
            if (!$.browser.msie) {
                $('#input-password', this.$forms[id]).focus();
            }
        } else if ('schedulemeeting-form' === id) {
            date = new Date();
            if (!defs.hasOwnProperty('input-date')) {
                defs['input-date'] = (date.getMonth() + 1) + '/' +
                                     date.getDate() + '/' +
                                     date.getFullYear();
            }
            if (!defs.hasOwnProperty('input-time')) {
                hours = date.getHours();
                if (!hours) { 
                    hours = 12;
                    ampm = 'AM';
                } else {
                    if (hours < 12) {
                        ampm = 'AM';
                    } else {
                        ampm = 'PM';
                        if (hours > 12) {
                            hours = hours - 12;
                        }
                    }
                }
                defs['input-time'] = hours + ':' + ((date.getMinutes() < 10) ? '0' : '') +
                                     date.getMinutes();
                defs['ampm'] = ampm;
            }
        }

        for (i in defs) {
            if (defs.hasOwnProperty(i)) {
                $('#'+i, this.$forms[id]).val(defs[i]);
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
            'startmeeting-form': 'Take me to my room',
            'reqresetpwd-form': 'Send me a password reset email',
            'resetpwd-form': 'Reset my password',
            'schedulemeeting-form': 'Send invites'
        };
        $('.btn[type="submit"]', this.$forms[formid]).removeClass('disabled')
                                                          .html(submittexts[formid]);

    },
    displayRoomList: function(formid, roomlist) {
        var template = '<table class="table table-bordered">' +
                       '<thead><tr><th>Choose one of your existing rooms</th></tr></thead>' +
                       '<tbody>', i, self = this;

        for (i=0; i<roomlist.length; i++) {
            template = template + ('<tr><td><a href="javascript:void(0);">' + roomlist[i] + '</a></td></tr>');
        }
        template = template + ('</tbody></table>');
        $('#roomlist', this.$forms[formid]).html(template);
        $('#roomlist a').click(function() { $('#input-roomname', self.$forms[formid]).val($(this).text()); });
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
                    var roomlinkrel, rcode, pathname = window.location.pathname,
                        roomname = $('#input-roomname', DashApp.$forms['startmeeting-form']).val();

                    DashView.cancelloader('startmeeting-form');
                    if('success' === response.result) {
                        rcode = $.roomcode.cipher(DashApp.boshconn.getEmailFromJid().replace(/@/, '~'), roomname);
                        roomlinkrel = pathname.substring(0, pathname.lastIndexOf('/') + 1) + '?roomname=' + rcode;
                        window.location.href = roomlinkrel;
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
                    } else if ('not activated' === response.result) {
                        DashView.displayalert('reqresetpwd-form', 'error', 'The account asssociated ' +
                                              'with the email address has not been activated yet.');
                    } else if ('no account' === response.result) {
                        DashView.displayalert('reqresetpwd-form', 'error', 'There is no account ' +
                                              'associated with this email address.');
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
        },
        'schedulemeeting-form': {
            success: function() {
                return function(response) {
                    DashView.cancelloader('schedulemeeting-form');
                    if ('success' === response.result) {
                        DashView.displayform('startmeeting-form');
                        DashView.displayalert('startmeeting-form', 'success', 'The invites have been sent. You can now ' +
                                              'come here to start your meeting at the scheduled date/time.');
                    } else if ('no account' === response.result) {
                        DashView.displayalert('schedulemeeting-form', 'error', 'Sending invites failed. There is no account ' +
                                              'associated with your email address.');
                    } else if ('not activated' === response.result) {
                        DashView.displayalert('schedulemeeting-form', 'error', 'Sending invites failed. Your account ' +
                                              'hasn\'t been activated yet. Please activate your account first.');
                    } else if ('no toemailarray') {
                        DashView.displayalert('schedulemeeting-form', 'error', 'Sending invites failed. Please ' +
                                              'specify a list of valid email addresses to send your invites.');
                    } else if ('no link') {
                        DashView.displayalert('schedulemeeting-form', 'error', 'Sending invites failed. Please ' +
                                              'choose one of your rooms for the meeting.');
                    } else {
                        DashView.cancelloader('schedulemeeting-form');
                        DashView.displayalert('schedulemeeting-form', 'error', 'There was a problem sending the invites.');
                    }
                };
            },
            failure: function() {
                return function(error) {
                    DashView.cancelloader('schedulemeeting-form');
                    DashView.displayalert('schedulemeeting-form', 'error', 'There was a problem sending the invites.');
                };
            },
            beforesubmit: function() {
                return function(arr, $form, options) {
                    DashView.showloader('schedulemeeting-form');
                };
            },
            data: function() {
                var href = window.location.href,
                    emails = $('#input-emails', DashApp.$forms['schedulemeeting-form']).val(),
                    roomname = $('#input-roomname', DashApp.$forms['schedulemeeting-form']).val(),
                    extradata = {
                        when: (new Date($('#input-date', DashApp.$forms['schedulemeeting-form']).val() + ' ' +
                                        $('#input-time', DashApp.$forms['schedulemeeting-form']).val() + ' ' +
                                        $('#ampm', DashApp.$forms['schedulemeeting-form']).val())).toString(),
                        fromemail: DashApp.boshconn.getEmailFromJid(),
                        note: $('#input-note', DashApp.$forms['schedulemeeting-form']).val()
                    };

                if (emails) {
                    extradata.toemailarray = JSON.stringify(emails.replace(/[\s\n\t]+/g, '')
                                                                  .split(','));
                }
                if (roomname) {
                    extradata.link = href.substring(0, href.lastIndexOf('/') + 1) + '?roomname=' +
                                     $.roomcode.cipher(DashApp.boshconn.getEmailFromJid(), roomname);
                }

                return extradata;
            }
        }
    },
    setupOptions: function(id) {
        var options = {
            dataType: 'json',
            beforeSubmit: this.formCallbacks[id].beforesubmit(),
            success: this.formCallbacks[id].success(),
            error: this.formCallbacks[id].failure()
        };

        if (this.formCallbacks[id].data) {
            options.data = this.formCallbacks[id].data();
        }

        return options;
    },
    setupForm: function(id, useAjaxSubmit) {
        var self = this;

        if(useAjaxSubmit) {
            this.$forms[id].submit(function() {
                $(this).ajaxSubmit(self.setupOptions(id));
                return false;
            });
        } else {
            this.$forms[id].ajaxForm(this.setupOptions(id));
        }
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
    queryRoomList: function(gotList) {
        var succCb = gotList || function(roomlist) {},
        _email = this.boshconn.getEmailFromJid();

        $.ajax({
            url: '/acct/listrooms/',
            type: 'POST',
            dataType: 'json',
            data: {email: _email},
            success: function(response) {
                if ('success' === response.result) {
                    succCb(response.data || []);
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
                self.setupForm('schedulemeeting-form', true);
                DashView.displayform('startmeeting-form');
                $('body > .navbar .nav').addClass('show');
                self.queryName(function(name) {
                    $('body > .navbar .label').html('Hi ' + name + '!');
                });
                self.queryRoomList(function(roomlist) {
                    DashView.displayRoomList('startmeeting-form', roomlist);
                    DashView.displayRoomList('schedulemeeting-form', roomlist);
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
