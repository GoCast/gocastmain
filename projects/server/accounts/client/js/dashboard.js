var DashView = {
    $forms: {},
    init: function() {
        for (var i=0; i<document.forms.length; i++) {
            this.$forms[document.forms[i].id] = $(document.forms[i]);
        }
        this.displayform('login-form');
        $('.navbar .formlink').click(this.changeformCallback());
    },
    displayform: function(id) {
        for (i in this.$forms) {
            this.$forms[i].removeClass('show');
            $('.alert', this.$forms[i]).removeClass('show');
        }
        this.$forms[id].addClass('show');
    },
    displayalert: function(formid, type, message) {
        var $alert = null;

        $('.alert', this.$forms[formid]).removeClass('show');
        $alert = $('.alert-' + type, this.$forms[formid]).addClass('show');
        $('p', $alert).html(message);
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

            }
        },
        'changepwd-form': {
            success: function() {
                return function(response) {
                };
            },
            failure: function() {
                return function(error) {
                };
            },
            beforesubmit: function() {
                return function() {

                };
            }
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
                return function() {

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

        if ('true' === urlvars.justactivated) {
            DashView.displayalert('login-form', 'success', 'Your account has been activated. ' +
                                  'You can now login with your new account.')
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
    DashView.init();
    DashApp.init();
});
