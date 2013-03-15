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
                if ('startmeeting-form' === i) {
                    $('a.btn-inverse', this.$forms[i]).removeClass('show');
                }
            }
        }

        this.$forms[id].addClass('show');
        this.$forms[id].clearForm();
        this.setupPlaceholders(id);

        if ('changepwd-form' === id) {
            $('#input-email', this.$forms[id]).val(DashApp.boshconn.getEmailFromJid());
        } else if ('login-form' === id) {
            if ($.urlvars.ecode) {
                email = $.roomcode.decipheruname($.urlvars.ecode);
            }
            else if (typeof (Storage) !== 'undefined' && localStorage.gocastusername) {
                email = localStorage.gocastusername;
            }

            if (email) {
                $('#input-email', this.$forms[id]).val(email);
                $('#input-password', this.$forms[id]).focus();
            }
            else {
                $('#input-email', this.$forms[id]).focus();
            }
        } else if ('startmeeting-form' === id) {
            if ($.browser.msie) {
                $('#input-roomname', this.$forms[id]).blur();
            }
            if ('undefined' !== typeof(Storage) && localStorage.gcpDesiredRoomname) {
                $('#input-roomname', this.$forms[id]).val(decodeURI(localStorage.gcpDesiredRoomname));
                $('a.btn-inverse', this.$forms[id]).addClass('show');
                delete localStorage.gcpDesiredRoomname;
            }
            if (defs['input-roomname']) {
                $('a.btn-inverse', this.$forms[id]).addClass('show');
            }

            $('#input-roomname', this.$forms[id]).unbind('keydown').keydown(this.strtmtgRoomnameValChngCallback());
            $('a.btn-inverse', this.$forms[id]).unbind('click').click(this.strtmtgInviteOthersClickCallback());
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
                defs.ampm = ampm;
            }
            $('a.btn-link', this.$forms[id]).unbind('click').click(this.schedmtgCancelClickCallback());
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
            'schedulemeeting-form': 'Send invitation'
        };
        $('.btn[type="submit"]', this.$forms[formid]).removeClass('disabled')
                                                          .html(submittexts[formid]);

    },
    displayRoomList: function(formid, roomlist, dontShowMessage) {
        var template = '', i, self = this,
            linkpopoverhtml, roomlink;

        $('.or', this.$forms[formid]).text('');
        if (roomlist && roomlist.length) {
            template = template + ('<table class="table table-bordered">' +
                                   '<thead><tr><th>Choose one of your existing rooms</th></tr></thead>' +
                                   '<tbody>');
            for (i=0; i<roomlist.length; i++) {
                template = template + ('<tr><td roomname="' + roomlist[i] +
                           '""><a class="roomname" href="javascript:void(0);">' + roomlist[i] + '</a>' +
                           '<a class="deleteroom btn btn-danger btn-mini pull-right" href="#" roomname="' + roomlist[i] +
                           '" title="Destroy room"><i class="icon-trash"></i></a>' +
                           '<a class="roomlink btn btn-mini pull-right" href="#" roomname="' + roomlist[i] +
                           '"><i class="icon-link"></i></a><div class="areyousure"></div></td></tr>');
            }
            template = template + ('</tbody></table>');
            $('.or', this.$forms[formid]).text('OR');
            $('#roomlist', this.$forms[formid]).addClass('well');
        } else if (!dontShowMessage) {
            template = '<p align="left">You have not created any rooms yet. ';
            if ('startmeeting-form' === formid) {
                template = template + 'To create a room, simply enter the name you want for it in the above text box, and ' +
                           'then, click on "Take me to my room". And, that\'s it. You\'re in!<br><br>You can also invite ' +
                           'others to your room via email by clicking on "Invite others" after you have chosen a room.</p>';
            } else if ('schedulemeeting-form' === formid) {
                template = template + 'Create a room first, by going to "Start Meeting" in the "My Meetings" menu.</p>';
            }
            $('#roomlist', this.$forms[formid]).addClass('well');
        } else if ($('#roomlist', this.$forms[formid]).hasClass('well')) {
            $('#roomlist', this.$forms[formid]).removeClass('well');
        }

        $('#roomlist', this.$forms[formid]).html(template);
        $('#roomlist a.roomname', this.$forms[formid]).click(function() {
            $('#roomlist table td', self.$forms[formid]).removeClass('selected');
            $(this).parent().addClass('selected');
            $('#input-roomname', self.$forms[formid]).val($(this).text());
            if ('startmeeting-form' === formid && !$('a.btn-link', self.$forms[formid]).hasClass('show')) {
                $('a.btn-inverse', self.$forms[formid]).addClass('show');
            }
        });

        linkpopoverhtml = '<textarea style="resize: none; font-size: 10px; width: {{width}}px;">{{link}}</textarea>';
        $('#roomlist a.roomlink', this.$forms[formid]).click(function(e) {
            var evt = e || window.event, popped = $(this).attr('popped');

            evt.preventDefault();
            $('#roomlist a.roomlink[popped]', self.$forms[formid]).popover('hide').button('toggle').removeAttr('popped');
            if (!popped) {
                $(this).popover('show').button('toggle').attr('popped', 'popped');
            }
        }).each(function() {
            var rcode = $.roomcode.cipher(DashApp.boshconn.getEmailFromJid(), $(this).attr('roomname')),
                _title = 'Link for ' + $(this).attr('roomname');
            $(this).popover({
                title: _title,
                content: linkpopoverhtml.replace(/\{\{link\}\}/, $.roomcode.roomurl(DashApp.boshconn.getEmailFromJid(),
                                                                                    DashApp.fullname, $(this).attr('roomname')))
                                        .replace(/\{\{width\}\}/, (rcode.length*6).toString()),
                placement: 'left',
                html: true,
                trigger: 'manual'
            });
        });

        $('#roomlist a.deleteroom', this.$forms[formid]).click(function(e) {
            var evt = e || window.event;

            evt.preventDefault();
            $('.areyousure', $(this).parent()).html('<div class="alert alert-warning show"><button type="button" ' +
                                                    'class="close" data-dismiss="alert">&times;</button>' +
                                                    'All room content will be lost. Are you sure?<br><br>&nbsp;' +
                                                    '<button type="button" class="btn btn-danger btn-mini pull-right" ' +
                                                    'roomname="' + $(this).attr('roomname') + '">I\'m sure</button>'+
                                                    '<button type="button" class="btn btn-success btn-mini pull-right">' +
                                                    'Cancel</button></div>');

            $('.areyousure .btn-danger', $(this).parent()).click(function(e) {
                var evt = e || window.event, _roomname = $(this).attr('roomname'),
                _self = this, _email = DashApp.boshconn.getEmailFromJid();

                evt.preventDefault();
                $.ajax({
                    url: '/acct/deleteroom/',
                    type: 'POST',
                    dataType: 'json',
                    data: {email: _email, roomname: _roomname},
                    success: function(response) {
                        if('success' === response.result) {
                            DashApp.roomlist.splice(DashApp.roomlist.indexOf(_roomname), 1);
                            self.displayRoomList(formid, DashApp.roomlist);
                            self.displayalert(formid, 'success', 'Your room "' + _roomname + '" has been destroyed.');
                            if (_roomname === $('#input-roomname', self.$forms[formid]).val()) {
                                $('#input-roomname', self.$forms[formid]).val('');
                                $('.btn-inverse', self.$forms[formid]).removeClass('show');
                            }
                        } else {
                            if ('no email' === response.result) {
                                self.displayalert(formid, 'error', 'No account exists for ' + _email + '.');
                            } else if ('no roomname' === response.result) {
                                self.displayalert(formid, 'error', 'You have not selected any room to be destroyed.');
                            } else {
                                self.displayalert(formid, 'error', 'There was a problem destroying your room.');
                            }
                            $('.close', $(_self).parent()).click();
                        }
                    },
                    failure: function(error) {
                        self.displayalert(formid, 'error', 'There was a problem destroying your room.');
                        $('.close', $(_self).parent()).click();
                    }
                });
            });

            $('.areyousure .btn-success', $(this).parent()).click(function(e) {
                var evt = e || window.event;
                evt.preventDefault();
                $('.close', $(this).parent()).click();
            });
        });
    },
    displayRoomsAccordion: function(rooms, options) {
        var formtemplate = '<form id="rooms-form" class="show"><fieldset>' +
                           '<legend>&nbsp;' + (options.title || 'Rooms') + '</legend>',
            roomtemplate = '<div class="accordion-group{{sd}}" roomname="{{room}}" {{partsAttr}}>' +
                           '<div class="accordion-heading">' +
                           '<a class="accordion-toggle" data-toggle="collapse" data-parent="#rooms" href="#{{room}}">' +
                           '{{name}} <small class="pull-right">&gt;&gt;</small></a></div>' +
                           '<div id="{{room}}" class="accordion-body collapse"><div class="accordion-inner">' +
                           '{{description}}<br><br><a class="btn btn-success pull-right" href="{{link}}">' +
                           'Take me to this room</a><br>&nbsp;</div></div></div>', i, roomshtml = '',
            participantsAttribute, partsAttrVal, $roomitem, rcode, link, title, roomids = [],
            $container = options.container || $('body');

        if (options.note) {
            formtemplate = formtemplate + '<div class="alert alert-success"><a class="close" href="#" data-dismiss="alert">&times;</a>' +
                           '<strong>Note</strong><br><p style="text-align:justify;">' + options.note + '</p></div>';
        }
        formtemplate = formtemplate + '<div class="accordion" id="rooms"></div></fieldset></form>';

        if (!$container.html()) {
            $container.html(formtemplate);
        }

        for (i=0; i<rooms.length; i++) {
            partsAttrVal = parseInt($(rooms[i]).attr('numparticipants'));
            participantsAttribute = partsAttrVal ? ('participants="' + partsAttrVal.toString() + '"') : '';
            rcode = $.roomcode.cipher($(rooms[i]).attr('room').split('#')[0], $(rooms[i]).attr('room').split('#')[1]);
            link = $.roomcode.roomurl($(rooms[i]).attr('room').split('#')[0],
                                      $(rooms[i]).attr('owner'), $(rooms[i]).attr('room').split('#')[1]);
            title = ($(rooms[i]).attr('owner') ? $(rooms[i]).attr('owner') + '\'s ' : '') + $(rooms[i]).attr('room').split('#')[1];
            $roomitem = $('.accordion-group[roomname="' + $container.attr('id') + rcode.replace(/\=/g, '_eq').replace(/\+/g, '_plus') +
                        '"]', $container);
            roomids.push($container.attr('id') + rcode.replace(/\=/g, '_eq').replace(/\+/g, '_plus'));

            if ($roomitem.length) {
                if (!partsAttrVal) {
                    $roomitem.removeAttr('participants');
                } else if (10 > $(rooms[i]).attr('numparticipants')) {
                    $roomitem.addClass('singledigit').attr('participants', partsAttrVal.toString());
                } else {
                    $roomitem.removeClass('singledigit').attr('participants', partsAttrVal.toString());;
                }
            } else {
                roomshtml  = roomshtml + (roomtemplate.replace(/\{\{index\}\}/g, i.toString())
                                                      .replace(/\{\{room\}\}/g, $container.attr('id') +
                                                                                rcode.replace(/\=/g, '_eq')
                                                                                     .replace(/\+/g, '_plus'))
                                                      .replace(/\{\{name\}\}/g, title)
                                                      .replace(/\{\{description\}\}/g, $(rooms[i]).attr('description'))
                                                      .replace(/\{\{link\}\}/g, link)
                                                      .replace(/\{\{partsAttr\}\}/g, participantsAttribute)
                                                      .replace(/\{\{sd\}\}/, (10 > $(rooms[i]).attr('numparticipants')) ?
                                                               ' singledigit' : ''));
            }

        }

        $('form > fieldset > .accordion', $container).append(roomshtml);
        $('.accordion-group[roomname]', $container).each(function() {
            if (-1 === roomids.indexOf($(this).attr('roomname'))) {
                $(this).remove();
            }
        });
    },
    changeformCallback: function() {
        var self = this;

        return function(e) {
            var evt = e || window.event, formid = $(this).attr('href').replace(/^#/, '');

            self.displayform(formid);

            if (0 <= ['startmeeting-form', 'schedulemeeting-form'].indexOf(formid)) {
                self.displayRoomList(formid, DashApp.roomlist);
            }
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
        };
    },
    strtmtgRoomnameValChngCallback: function() {
        var self = this, id = 'startmeeting-form';

        return function(e) {
            var _self = this;

            setTimeout(function() {
                $('#roomlist table td', self.$forms[id]).removeClass('selected');
                $('#roomlist table td[roomname="' + $(_self).val() + '"]', self.$forms[id]).addClass('selected');
                if ($(_self).val() && !$('a.btn-inverse', self.$forms[id]).hasClass('show')) {
                    $('a.btn-inverse', self.$forms[id]).addClass('show');
                } else if (!$(_self).val() && $('a.btn-inverse', self.$forms[id]).hasClass('show')) {
                    $('a.btn-inverse', self.$forms[id]).removeClass('show');
                }
            }, 500);
        };
    },
    strtmtgInviteOthersClickCallback: function() {
        var self = this;

        return function() {
            self.displayform('schedulemeeting-form', {
                'input-roomname': $('#input-roomname', self.$forms['startmeeting-form']).val()
            });
            self.displayRoomList('schedulemeeting-form', [], true);
        };
    },
    schedmtgCancelClickCallback: function() {
        var self = this;

        return function() {
            self.displayform('startmeeting-form', {
                'input-roomname': $('#input-roomname', self.$forms['schedulemeeting-form']).val()
            });
        };
    }
};

var DashApp = {
    email: null,
    fullname: null,
    boshconn: null,
    $forms: {},
    roomlist: [],
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
                        DashView.displayalert('login-form', 'error', 'Please enter a valid email address.');
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
                    var roomlinkrel, rcode,
                        roomname = $('#input-roomname', DashApp.$forms['startmeeting-form']).val();

                    DashView.cancelloader('startmeeting-form');
                    if('success' === response.result) {
                        window.location.href = $.roomcode.roomurl(DashApp.boshconn.getEmailFromJid(),
                                                                  DashApp.fullname, roomname);
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
                        DashView.displayalert('reqresetpwd-form', 'error', 'Please enter a valid email address.');
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
                        DashView.displayform('startmeeting-form', {
                            'input-roomname': $('#input-roomname', DashApp.$forms['schedulemeeting-form']).val()
                        });
                        DashView.displayalert('startmeeting-form', 'success', 'The invites have been sent. You can now ' +
                                              'come here to start your meeting at the scheduled date/time.');
                    } else if ('no account' === response.result) {
                        DashView.displayalert('schedulemeeting-form', 'error', 'Sending invites failed. There is no account ' +
                                              'associated with your email address.');
                    } else if ('not activated' === response.result) {
                        DashView.displayalert('schedulemeeting-form', 'error', 'Sending invites failed. Your account ' +
                                              'hasn\'t been activated yet. Please activate your account first.');
                    } else if ('no toemailarray' === response.result) {
                        DashView.displayalert('schedulemeeting-form', 'error', 'Sending invites failed. Please ' +
                                              'specify a list of valid email addresses to send your invites.');
                    } else if ('no link' === response.result) {
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
                var emails = $('#input-emails', DashApp.$forms['schedulemeeting-form']).val(),
                    roomname = $('#input-roomname', DashApp.$forms['schedulemeeting-form']).val(),
                    extradata = {
                        when: (new Date($('#input-date', DashApp.$forms['schedulemeeting-form']).val() + ' ' +
                                        $('#input-time', DashApp.$forms['schedulemeeting-form']).val() + ' ' +
                                        $('#ampm', DashApp.$forms['schedulemeeting-form']).val())).toString(),
                        fromemail: DashApp.boshconn.getEmailFromJid()
                    }, genEmailArray = function (str, cb) {
                        var arr = [];
                        str.split(',').forEach(function(commas) {
                            commas.trim().split(';').forEach(function(semis) {
                                semis.trim().split(' ').forEach(function(spaces) {
                                    if (spaces.trim()) {
                                        arr.push(spaces.trim());
                                    }
                                });
                            });
                        });
                        cb(arr);
                    };

                if (emails) {
                    genEmailArray(emails.replace(/[\n\t]+/g, ','), function(arr) {
                        extradata.toemailarray = JSON.stringify(arr);
                    });
                }
                if (roomname) {
                    extradata.link = $.roomcode.roomurl(DashApp.boshconn.getEmailFromJid(),
                                                        DashApp.fullname, roomname);
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
            anon_username: this.settings.get('ANON_USERNAME'),
            anon_password: this.settings.get('ANON_PASSWORD'),
            public_room_node: this.settings.get('CALLCAST_ROOMS') + '/public',
            statusCallback: this.boshconnstatusCallback()
        });

        this.boshconn.subscribePublicRooms(function(data) {
/*            console.log('Subscribe-Callback-Dashboard: data length: ' + data.length);
            for (i = 0 ; i < data.length ; i += 1) {
                console.log('Subscribe-Callback-Dashboard item room: ' + ($(data[i]).attr('room') || '') + ', owner: ' + ($(data[i]).attr('owner') || '') + ', numparticipants: ' + ($(data[i]).attr('numparticipants') || ''));
            }
            */
            DashView.displayRoomsAccordion(data, {
                title: 'Public Rooms',
                container: $('#publicrooms'),
                note: 'This is a list of public rooms showing the number of people currently in each one. ' +
                      'If you\'re a new user and/or you don\'t own any rooms, feel free to try one of these rooms out!'
            });
            /*DashView.displayRoomsAccordion(data, {
                title: 'Recently Visited Rooms',
                container: $('#visitedrooms'),
                note: (optional) 'This is a list of rooms you recently visited.'
            });*/
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
    //RMW use queryName in index.js for finding the user's name to auto-populate nickname.
    queryName: function(gotName) {
        var succCb = gotName || function(name) {},
            _email = this.boshconn.getEmailFromJid(),
            self = this;

        $.ajax({
            url: '/acct/getprofile/',
            type: 'POST',
            dataType: 'json',
            data: { email: _email },
            success: function(response) {
                if ('success' === response.result) {
                    self.fullname = response.data.name || _email;
                    succCb(response.data.name || _email);
                }
            }
        });
    },
    queryRoomList: function(gotList) {
        var cb = gotList || function(roomlist) {},
            _email = this.boshconn.getEmailFromJid();

        $.ajax({
            url: '/acct/listrooms/',
            type: 'POST',
            dataType: 'json',
            data: {email: _email},
            success: function(response) {
                cb(response.data || []);
            },
            failure: function(error) {
                cb(error.data || []);
            }
        });
    },
    boshconnstatusCallback: function() {
        var self = this;

        return function(status) {
            if (Strophe.Status.CONNECTED === status ||
                Strophe.Status.ATTACHED === status) {
                if (typeof (Storage) !== 'undefined' && !DashApp.boshconn.isAnonymous()) {
                    localStorage.gocastusername = DashApp.boshconn.getEmailFromJid();
                }
                self.setupForm('startmeeting-form');
                self.setupForm('changepwd-form');
                self.setupForm('schedulemeeting-form', true);
                DashView.displayform('startmeeting-form');
                $('body > .navbar .nav').addClass('show');
                self.queryName(function(name) {
                    $('body > .navbar .label').html('Hi ' + name + '!');
                });
                self.queryRoomList(function(roomlist) {
                    self.roomlist = roomlist;
                    DashView.displayRoomList('startmeeting-form', self.roomlist);
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
