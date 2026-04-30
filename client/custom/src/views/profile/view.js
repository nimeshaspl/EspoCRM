define('custom:views/profile/view', ['view'], function (Dep) {

    return Dep.extend({

        template: 'custom:profile/view',

        events: {
            'click .profile-main-tab': function (e) {
                var tab = e.currentTarget.getAttribute('data-main-tab');
                this.$el.find('.profile-main-tab').removeClass('active');
                this.$el.find('.profile-main-panel').removeClass('active');
                this.$el.find('[data-main-tab="' + tab + '"]').addClass('active');
                var $panel = this.$el.find('#panel-' + tab);
                $panel.addClass('active');
                // If no subnav item is active in this panel, activate the first one
                if ($panel.find('.profile-subnav-item.active').length === 0) {
                    $panel.find('.profile-subnav-item').first().addClass('active');
                    $panel.find('.profile-sub-panel').first().addClass('active');
                }
            },
            'click .profile-subnav-item': function (e) {
                var sub = e.currentTarget.getAttribute('data-sub-tab');
                // Scope changes to the currently active main panel only
                var $activePanel = this.$el.find('.profile-main-panel.active');
                $activePanel.find('.profile-subnav-item').removeClass('active');
                $activePanel.find('.profile-sub-panel').removeClass('active');
                e.currentTarget.classList.add('active');
                this.$el.find('#sub-' + sub).addClass('active');
            },
            'click [data-action="editAbout"]': 'actionEditAbout',
            'click [data-action="editPermanentAddress"]': 'actionEditPermanentAddress',
            'click [data-action="editCurrentAddress"]': 'actionEditCurrentAddress',
            'click [data-action="editContact"]': 'actionEditContact',
            'click [data-action="editJob"]': 'actionEditJob'
        },
        data: function () {
            var user = this.userData || {};
            var name = ((user.firstName || '') + ' ' + (user.middleName || '') + ' ' + (user.lastName || '')).trim();
            var parts = name.split(/\s+/);
            var initials = parts.length >= 2
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : name.slice(0, 2).toUpperCase();

            return {
                userName: name || '--',
                userInitials: initials || 'AD',
                userEmail: user.emailAddress || '--',
                userPhone: user.phoneNumber || '--',
                designation: user.cDesignationName || '--',
                department: user.cDepartmentName || '--',
                userGender: user.gender || '--',
                userBloodGroup: user.cBloodGroup || '--',
                userMaritalStatus: user.cMaritialStatus || '--',
                userDob: user.cDob || '--',
                userDoj: user.cDoj || '--',
                userReportingManager: user.reportsToName || '--',
                avatarUrl: user.avatarUrl || null,
                managerData: this.managerData || null,
                teamMembers: this.teamMembers || [],
                hasTeamMembers: (this.teamMembers || []).length > 0
            };
        },
        setup: function () {
            var self = this;
            var userId = this.getUser().id;

            function getInitials(name) {
                if (!name) return '?';
                var p = name.trim().split(/\s+/);
                return p.length >= 2
                    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
                    : name.slice(0, 2).toUpperCase();
            }

            this.getModelFactory().create('User', function (model) {
                model.id = userId;

                model.fetch().then(function () {
                    self.userData = model.attributes;

                    var managerPromise = Espo.Ajax.getRequest('ManagerMapping', {
                        where: [{ type: 'equals', attribute: 'assignedUserId', value: userId }],
                        maxSize: 1
                    });

                    var teamPromise = Espo.Ajax.getRequest('ManagerMapping', {
                        where: [{ type: 'equals', attribute: 'approverId', value: userId }],
                        maxSize: 100
                    });

                    Promise.all([managerPromise, teamPromise]).then(function (results) {
                        var managerResult = results[0];
                        var teamResult = results[1];

                        self.managerData = null;
                        if (managerResult.list && managerResult.list.length > 0) {
                            var rec = managerResult.list[0];
                            var mName = rec.approverName || '';
                            self.managerData = {
                                id: rec.approverId,
                                name: mName,
                                initials: getInitials(mName)
                            };
                        }

                        self.teamMembers = [];
                        if (teamResult.list && teamResult.list.length > 0) {
                            teamResult.list.forEach(function (rec) {
                                var eName = rec.assignedUserName || rec.name || '';
                                self.teamMembers.push({
                                    id: rec.assignedUserId,
                                    name: eName,
                                    initials: getInitials(eName)
                                });
                            });
                        }

                        self.reRender();
                    });
                });
            });
        },
        actionEditAbout: function () {
            var self = this;
            var user = this.userData || {};
            var userId = this.getUser().id;

            function makeSelect(id, options, selected) {
                var html = '<select id="' + id + '" style="width:100%;padding:8px 10px;border:1px solid #ced4da;border-radius:4px;font-size:14px;color:#333;">';
                html += '<option value="">-- Select --</option>';
                options.forEach(function (opt) {
                    html += '<option value="' + opt + '"' + (opt === selected ? ' selected' : '') + '>' + opt + '</option>';
                });
                html += '</select>';
                return html;
            }

            var formHtml = '<div style="padding:20px;">' +
                '<form id="aboutEditForm" novalidate>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +

                '<div>' +
                '<label style="display:block;font-size:12px;font-weight:600;color:#6c757d;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Gender <span style="color:red">*</span></label>' +
                makeSelect('edit-gender', ['Male', 'Female', 'Neutral'], user.gender || '') +
                '<div id="err-gender" style="color:red;font-size:12px;margin-top:4px;display:none;">Gender is required.</div>' +
                '</div>' +

                '<div>' +
                '<label style="display:block;font-size:12px;font-weight:600;color:#6c757d;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Blood Group <span style="color:red">*</span></label>' +
                makeSelect('edit-bloodGroup', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], user.cBloodGroup || '') +
                '<div id="err-bloodGroup" style="color:red;font-size:12px;margin-top:4px;display:none;">Blood Group is required.</div>' +
                '</div>' +

                '<div>' +
                '<label style="display:block;font-size:12px;font-weight:600;color:#6c757d;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Marital Status <span style="color:red">*</span></label>' +
                makeSelect('edit-maritalStatus', ['Married', 'Unmarried'], user.cMaritialStatus || '') +
                '<div id="err-maritalStatus" style="color:red;font-size:12px;margin-top:4px;display:none;">Marital Status is required.</div>' +
                '</div>' +

                '<div>' +
                '<label style="display:block;font-size:12px;font-weight:600;color:#6c757d;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Date of Birth <span style="color:red">*</span></label>' +
                '<input type="date" id="edit-dob" value="' + (user.cDob || '') + '" style="width:100%;padding:8px 10px;border:1px solid #ced4da;border-radius:4px;font-size:14px;color:#333;box-sizing:border-box;" />' +
                '<div id="err-dob" style="color:red;font-size:12px;margin-top:4px;display:none;">Date of Birth is required.</div>' +
                '</div>' +

                '<div>' +
                '<label style="display:block;font-size:12px;font-weight:600;color:#6c757d;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Date of Joining <span style="color:red">*</span></label>' +
                '<input type="date" id="edit-doj" value="' + (user.cDoj || '') + '" style="width:100%;padding:8px 10px;border:1px solid #ced4da;border-radius:4px;font-size:14px;color:#333;box-sizing:border-box;" />' +
                '<div id="err-doj" style="color:red;font-size:12px;margin-top:4px;display:none;">Date of Joining is required.</div>' +
                '</div>' +

                '</div>' +
                '<div id="about-form-error" style="color:red;font-size:13px;margin-top:12px;display:none;"></div>' +
                '<div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px;">' +
                '<button type="button" id="aboutCancelBtn" style="padding:8px 20px;border:1px solid #ced4da;background:#fff;border-radius:4px;cursor:pointer;font-size:14px;">Cancel</button>' +
                '<button type="submit" id="aboutSaveBtn" style="padding:8px 20px;background:#1f4a7a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;">Save</button>' +
                '</div>' +
                '</form>' +
                '</div>';

            var modal = this.simpleModal('Edit About', formHtml);
            var $modal = $('#' + modal.modalId);

            $modal.find('#aboutCancelBtn').on('click', function () {
                modal.closeModal();
            });

            $modal.find('#aboutEditForm').on('submit', function (e) {
                e.preventDefault();

                var gender = $modal.find('#edit-gender').val();
                var bloodGroup = $modal.find('#edit-bloodGroup').val();
                var maritalStatus = $modal.find('#edit-maritalStatus').val();
                var dob = $modal.find('#edit-dob').val();
                var doj = $modal.find('#edit-doj').val();

                // Clear previous errors
                $modal.find('#err-gender, #err-bloodGroup, #err-maritalStatus, #err-dob, #err-doj').hide();
                $modal.find('#about-form-error').hide();

                // Validate — no field may be empty
                var valid = true;
                if (!gender)       { $modal.find('#err-gender').show();        valid = false; }
                if (!bloodGroup)   { $modal.find('#err-bloodGroup').show();    valid = false; }
                if (!maritalStatus){ $modal.find('#err-maritalStatus').show(); valid = false; }
                if (!dob)          { $modal.find('#err-dob').show();           valid = false; }
                if (!doj)          { $modal.find('#err-doj').show();           valid = false; }

                if (!valid) return;

                var $saveBtn = $modal.find('#aboutSaveBtn');
                $saveBtn.prop('disabled', true).text('Saving...');

                Espo.Ajax.putRequest('User/' + userId, {
                    gender: gender,
                    cBloodGroup: bloodGroup,
                    cMaritialStatus: maritalStatus,
                    cDob: dob,
                    cDoj: doj
                }).then(function () {
                    // Sync local cache
                    self.userData.gender = gender;
                    self.userData.cBloodGroup = bloodGroup;
                    self.userData.cMaritialStatus = maritalStatus;
                    self.userData.cDob = dob;
                    self.userData.cDoj = doj;

                    // Update visible values in the About card without full re-render
                    self.$el.find('#pf-val-gender').text(gender);
                    self.$el.find('#pf-val-bloodGroup').text(bloodGroup);
                    self.$el.find('#pf-val-maritalStatus').text(maritalStatus);
                    self.$el.find('#pf-val-dob').text(dob);
                    self.$el.find('#pf-val-doj').text(doj);

                    modal.closeModal();
                }).catch(function () {
                    $saveBtn.prop('disabled', false).text('Save');
                    $modal.find('#about-form-error').text('Failed to save changes. Please try again.').show();
                });
            });
        },
        actionEditPermanentAddress: function () {
            console.log('Edit Permanent Address clicked');
            var htmlContent = `<div style="padding: 20px;">
                <p>This is where the Permanent Address editing form would go.</p>
            </div>
        `;
            this.simpleModal('Personal Data', htmlContent);
            // this.getRouter().navigate('Profile/About', {trigger: true});
        },
        actionEditCurrentAddress: function () {
            console.log('Edit Current Address clicked');
            var htmlContent = `<div style="padding: 20px;">
                <p>This is where the Current Address editing form would go.</p>
            </div>
        `;
            this.simpleModal('Personal Data', htmlContent);
            // this.getRouter().navigate('Profile/About', {trigger: true});
        },



        afterRender: function () {
            // defaults already set via .active classes in the template
        },
        simpleModal: function (title, htmlContent) {
            var backdropId = 'helloBackdrop-' + Date.now();
            var modalId = 'helloModal-' + Date.now();

            var backdropHtml = `<div id="${backdropId}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 999;"></div>`;

            var modalHtml = `
        <div id="${modalId}" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; width: 100%; max-width: 650px;">
            <div style="background: white; border-radius: 4px; box-shadow: 0 3px 12px rgba(0, 0, 0, 0.5); overflow: hidden; width: 100%;">
                <div style="padding: 20px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                    <h5 style="margin: 0; color: #333; font-weight: 500;">${title}</h5>
                    <button class="modalCloseBtn" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0; color: #333;">×</button>
                </div>
                ${htmlContent}
            </div>
        </div>
    `;

            // Remove any existing hello modals
            $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').remove();

            // Add backdrop and modal to body
            $(backdropHtml).appendTo('body');
            var $modal = $(modalHtml).appendTo('body');

            // Disable page scroll
            var scrollY = window.scrollY;
            $('body').css({
                position: 'fixed',
                top: `-${scrollY}px`,
                width: '100%'
            });

            // Close modal function
            function closeModal() {
                $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').fadeOut(200, function () {
                    $(this).remove();
                });
                var scrollTop = parseInt($('body').css('top')) * -1;
                $('body').css({ position: '', top: '', width: '' });
                window.scrollTo(0, scrollTop);
            }

            $modal.find('.modalCloseBtn').one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });

            $('#' + backdropId).one('click', function (e) {
                if (e.target.id === backdropId) {
                    closeModal();
                }
            });

            $modal.on('click', function (e) {
                e.stopPropagation();
            });

            console.log('Modal overlay displayed:', modalId);

            // ✅ Return both modalId and closeModal function
            return {
                modalId: modalId,
                closeModal: closeModal
            };
        },
    });
});