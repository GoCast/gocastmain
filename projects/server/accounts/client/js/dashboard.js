var DashView = {
    $forms: {},
    init: function() {
        for (var i=0; i<document.forms.length; i++) {
            this.$forms[document.forms[i].id] = $(document.forms[i]);
        }
        this.displayform('login-form');
        $('body > .navbar .formlink').click(this.changeformCallback());
    },
    displayform: function(id) {
        for (i in this.$forms) {
            this.$forms[i].removeClass('show');
            $('.alert', this.$forms[i]).removeClass('show');
        }
        this.$forms[id].addClass('show');

        if ('changepwd-form' === id) {
            $('#input-email', this.$forms[id]).val(DashApp.boshconn.getEmailFromJid());
        }
    },
    displayalert: function(formid, type, message) {
        var $alert = null;

        $('.alert', this.$forms[formid]).removeClass('show');
        $alert = $('.alert-' + type, this.$forms[formid]).addClass('show');
        $('p', $alert).html(message);
    },
    showloginloader: function() {
        $('.btn[type="submit"]', this.$forms['login-form']).addClass('disabled')
                                                           .html('<i class="icon-spinner icon-spin icon-2x"></i>');
    },
    cancelloginloader: function() {
        $('.btn[type="submit"]', this.$forms['login-form']).removeClass('disabled')
                                                          .html('Login');

    },
    changeformCallback: function() {
        var self = this;

        return function(e) {
            self.displayform($(this).attr('href').replace(/^#/, ''));
            e.preventDefault();
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
                    DashApp.boshconn.connect({
                        username: $('#input-email', $form).val(),
                        password: $('#input-password', $form).val()
                    });
                    DashView.showloginloader();
                    return false;
                };
            }
        },
        'changepwd-form': {
            success: function() {
                return function(response) {
                    if ('success' === response.result) {
                        DashView.displayform('startmeeting-form');
                        DashView.displayalert('startmeeting-form', 'success', 'Your password has been changed. Use your' +
                                              'new password to login from now on.');
                    } else {
                        DashView.displayalert('startmeeting-form', 'error', 'There was an error changing the password for ' +
                                              'your account.');
                    }
                };
            },
            failure: function() {
                return function(error) {
                    DashView.displayalert('startmeeting-form', 'error', 'There was an error changing the password for ' +
                                          'your account.');
                };
            },
            beforesubmit: function() {
                return function(arr, $form, options) {
                };
            },
        },
        'startmeeting-form': {
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
                    var rcode = $.roomcode.cipher(DashApp.boshconn.getEmailFromJid().replace(/@/, '~'),
                                                  $('#input-roomname', $form).val());

                    DashView.displayalert('startmeeting-form', 'success', 'Room Code: ' +
                                          rcode + '<br>Room Id: ' + $.roomcode.decipher(rcode));
                    return false;
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
                beforeSubmit: this.formCallbacks[document.forms[i].id].beforesubmit(),
                success: this.formCallbacks[document.forms[i].id].success(),
                error: this.formCallbacks[document.forms[i].id].failure()        
            };

            this.$forms[document.forms[i].id] = $(document.forms[i]);
            this.$forms[document.forms[i].id].ajaxForm(options);
        }

        this.boshconn = new GoCastJS.StropheConnection({
            boshurl: '/xmpp-httpbind',
            xmppserver: 'dev.gocast.it',
            statusCallback: this.boshconnstatusCallback()
        });

        $('body > .navbar .logoutlink').click(this.logoutCallback());

        if ('true' === urlvars.justactivated) {
            DashView.displayalert('login-form', 'success', 'Your account has been activated. ' +
                                  'You can now login with your new account.')
        }

        if (this.boshconn.hasSavedRegisteredLoginInfo()) {
            this.boshconn.autoConnect();
            DashView.showloginloader();
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
    },
    boshconnstatusCallback: function() {
        var self = this;

        return function(status) {
            if (Strophe.Status.CONNECTED === status ||
                Strophe.Status.ATTACHED === status) {
                DashView.displayform('startmeeting-form');
                $('body > .navbar .nav').addClass('show');
            } else if (Strophe.Status.DISCONNECTED === status) {
                DashView.cancelloginloader();
                DashView.displayform('login-form');
                $('body > .navbar .nav').removeClass('show');
            } else if (Strophe.Status.AUTHFAIL === status) {
                DashView.cancelloginloader();
                DashView.displayform('login-form');
                DashView.displayalert('login-form', 'error', 'Login failed. The email and/or password that you provided ' +
                                      'is invalid.');
            } else if (Strophe.Status.CONNFAIL === status) {
                DashView.cancelloginloader();
                DashView.displayform('login-form');
                DashView.displayalert('login-form', 'error', 'There was a problem logging in to your account.');
            }
        };
    },
    logoutCallback: function() {
        var self = this;

        return function(e) {
            self.boshconn.disconnect();
            e.preventDefault();
        };
    }
};

$(document).ready(function() {
    DashView.init();
    DashApp.init();
});
