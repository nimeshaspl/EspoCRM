define('custom:views/profile/view', ['view'], function (Dep) {

    return Dep.extend({

        template: 'custom:profile/view',

        events: {
            'click .profile-main-tab': function (e) {
                var tab = e.currentTarget.getAttribute('data-main-tab');
                this.activeMainTab = tab;
                this.$el.find('.profile-main-tab').removeClass('active');
                this.$el.find('.profile-main-panel').removeClass('active');
                this.$el.find('[data-main-tab="' + tab + '"]').addClass('active');
                var $panel = this.$el.find('#panel-' + tab);
                $panel.addClass('active');
                if ($panel.find('.profile-subnav-item.active').length === 0) {
                    $panel.find('.profile-subnav-item').first().addClass('active');
                    $panel.find('.profile-sub-panel').first().addClass('active');
                    this.activeSubTab = $panel.find('.profile-subnav-item').first().attr('data-sub-tab');
                }
            },
            'click .profile-subnav-item': function (e) {
                var sub = e.currentTarget.getAttribute('data-sub-tab');
                this.activeSubTab = sub;
                var $activePanel = this.$el.find('.profile-main-panel.active');
                $activePanel.find('.profile-subnav-item').removeClass('active');
                $activePanel.find('.profile-sub-panel').removeClass('active');
                e.currentTarget.classList.add('active');
                this.$el.find('#sub-' + sub).addClass('active');
            },
            'click #profile-avatar-overlay': 'actionEditAvatar',
            'change #profile-avatar-input': 'actionUploadAvatar',
            'click [data-action="editAbout"]': 'actionEditAbout',
            'click [data-action="editPermanentAddress"]': 'actionEditPermanentAddress',
            'click [data-action="editCurrentAddress"]': 'actionEditCurrentAddress',
            'click [data-edit-section="bank"]': 'actionEditBank',
            'click [data-action="editAadhaar"]': 'actionEditAadhaar',
            'click [data-action="editDrivingLicence"]': 'actionEditDrivingLicence',
            'click [data-action="editPanCard"]': 'actionEditPanCard',
            'click [data-action="editPassport"]': 'actionEditPassport',
            'click [data-action="editVoterId"]': 'actionEditVoterId',
            'click .pf-doc-attachment-thumb': 'actionPreviewDocAttachment',
            'click [data-action="addOtherDocument"]': 'actionAddOtherDocument',
            'click [data-action="editOtherDocument"]': 'actionEditOtherDocument',
            'click [data-action="deleteOtherDocument"]': 'actionDeleteOtherDocument',
            'click [data-action="openOtherDocument"]': 'actionOpenOtherDocument',
            'click [data-action="addContact"]': 'actionAddContact',
            'click [data-action="editContact"]': 'actionEditContact',
            'click [data-action="deleteContact"]': 'actionDeleteContact',
            'click [data-action="addDependent"]': 'actionAddDependent',
            'click [data-action="editDependent"]': 'actionEditDependent',
            'click [data-action="deleteDependent"]': 'actionDeleteDependent',
            'click [data-action="addExperience"]': 'actionAddExperience',
            'click [data-action="editExperience"]': 'actionEditExperience',
            'click [data-action="deleteExperience"]': 'actionDeleteExperience',
            'click [data-action="editJob"]': 'actionEditJob'
        },

        // Prepare all values rendered by the profile template.
        data: function () {
            var user = this.userData || {};
            var userId = user.id;
            var avatarUrl = '?entryPoint=avatar&id=' + userId;
            var firstName = user.firstName || '';
            var middleName = user.middleName || '';
            var lastName = user.lastName || '';
            var nameParts = [firstName, middleName, lastName].filter(Boolean);
            var name = nameParts.join(' ') || '--';
            var initials = nameParts.length >= 2
                ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                : name.slice(0, 2).toUpperCase();

            var permAddr = this.permanentAddress || {};
            var currAddr = this.currentAddress || {};
            var bank = this.employeeBank || {};
            var aadhaar = this.aadhaarRecord || {};
            var drivingLicence = this.drivingLicenceRecord || {};
            var panCard = this.panCardRecord || {};
            var passport = this.passportRecord || {};
            var voterId = this.voterIdRecord || {};
            var contactRecords = this.prepareContactRecords();
            var dependentRecords = this.prepareDependentRecords();
            var experienceRecords = this.prepareExperienceRecords();
            var otherDocumentRecords = this.prepareOtherDocumentRecords();

            var aadhaarAttachmentId = this.extractAttachmentId(aadhaar);
            var drivingAttachmentId = this.extractAttachmentId(drivingLicence);
            var panAttachmentId = this.extractAttachmentId(panCard);
            var passportAttachmentId = this.extractAttachmentId(passport);
            var voterAttachmentId = this.extractAttachmentId(voterId);

            // Detect PDF by filename stored in the record's attachmentsNames field.
            var isAadhaarPdf = this.isRecordAttachmentPdf(aadhaar);
            var isDrivingPdf = this.isRecordAttachmentPdf(drivingLicence);
            var isPanPdf = this.isRecordAttachmentPdf(panCard);
            var isPassportPdf = this.isRecordAttachmentPdf(passport);
            var isVoterPdf = this.isRecordAttachmentPdf(voterId);

            // PDFs must use entryPoint=attachment; images use entryPoint=image.
            var aadhaarFullUrl = isAadhaarPdf ? this.getFileAttachmentUrl(aadhaarAttachmentId) : this.getAttachmentUrl(aadhaarAttachmentId);
            var drivingFullUrl = isDrivingPdf ? this.getFileAttachmentUrl(drivingAttachmentId) : this.getAttachmentUrl(drivingAttachmentId);
            var panFullUrl     = isPanPdf     ? this.getFileAttachmentUrl(panAttachmentId)     : this.getAttachmentUrl(panAttachmentId);
            var passportFullUrl = isPassportPdf ? this.getFileAttachmentUrl(passportAttachmentId) : this.getAttachmentUrl(passportAttachmentId);
            var voterFullUrl   = isVoterPdf   ? this.getFileAttachmentUrl(voterAttachmentId)   : this.getAttachmentUrl(voterAttachmentId);

            return {
                // Header
                userName: name,
                userInitials: initials || 'AD',
                userEmail: user.emailAddress || '--',
                userPhone: user.phoneNumber || '--',
                designation: user.cDesignationName || '--',
                department: user.cDepartmentName || '--',
                avatarUrl: avatarUrl,

                // Manager / Team
                managerData: this.managerData || null,
                teamMembers: this.teamMembers || [],
                hasTeamMembers: (this.teamMembers || []).length > 0,

                // Bio Data
                userGender: user.gender || '--',
                userBloodGroup: user.cBloodGroup || '--',
                userMaritalStatus: user.cMaritialStatus || '--',
                userDob: user.cDob || '--',
                userDoj: user.cDoj || '--',

                // Permanent Address (from CEmployeeAddress entity)
                userPermStreet: permAddr.name || '--',
                userPermCity: permAddr.cityName || '--',
                userPermState: permAddr.stateName || '--',
                userPermPostal: permAddr.pincode || '--',
                userPermCountry: permAddr.countryName || '--',

                // Current Address (from CEmployeeAddress entity)
                userCurrStreet: currAddr.name || '--',
                userCurrCity: currAddr.cityName || '--',
                userCurrState: currAddr.stateName || '--',
                userCurrPostal: currAddr.pincode || '--',
                userCurrCountry: currAddr.countryName || '--',

                // Employment
                userWorkLocation: user.cLocation || '--',
                userIsWFH: user.cIsWorkFromHome ? 'Yes' : 'No',

                // Bank
                userBankName: bank.bankName || bank.banksName || '--',
                userBranchName: bank.branchName || '--',
                userAccountHolderName: bank.bankHolderName || '--',
                userAccountNumber: bank.accountNO || '--',
                userAccountType: bank.accountType || '--',
                userIfscCode: bank.iFSCCode || '--',
                userBankPhoneNo: bank.phoneNo || '--',

                // Aadhaar
                userAadhaarName: aadhaar.name || user.cAadhaarName || '--',
                userAadhaarNumber: aadhaar.adharNumber || user.cAadhaarNumber || '--',
                userAadhaarEnrollment: aadhaar.adharEnrollementNumber || user.cAadhaarEnrollment || '--',
                userAadhaarAddress: aadhaar.addressAsPerAadhar || user.cAadhaarAddress || '--',

                // Driving Licence
                userDlNumber: drivingLicence.drivingLicenseNumber || user.cDlNumber || '--',
                userDlExpiry: drivingLicence.expiryDate || user.cDlExpiry || '--',

                // PAN
                userPanName: panCard.nameAsPerPanCard || user.cPanName || '--',
                userPanNumber: panCard.panCardNumber || user.cPanNumber || '--',

                // Passport
                userPassportNumber: passport.passportNumber || user.cPassportNumber || '--',
                userPassportExpiry: passport.expiryDate || user.cPassportExpiry || '--',

                // Voter ID
                userVoterIdNumber: voterId.voterIDNumber || user.cVoterIdNumber || '--',

                // Contacts
                contactRecords: contactRecords,
                hasContactRecords: contactRecords.length > 0,
                dependentRecords: dependentRecords,
                hasDependentRecords: dependentRecords.length > 0,
                experienceRecords: experienceRecords,
                hasExperienceRecords: experienceRecords.length > 0,
                otherDocumentRecords: otherDocumentRecords,
                hasOtherDocumentRecords: otherDocumentRecords.length > 0,

                // Document attachment previews.
                // For PDFs the thumb URL is intentionally left empty so the template
                // shows the PDF icon branch; only FullUrl is needed.
                aadhaarAttachmentThumbUrl: isAadhaarPdf ? '' : this.getAttachmentUrl(aadhaarAttachmentId, 'small'),
                aadhaarAttachmentFullUrl: aadhaarFullUrl,
                drivingAttachmentThumbUrl: isDrivingPdf ? '' : this.getAttachmentUrl(drivingAttachmentId, 'small'),
                drivingAttachmentFullUrl: drivingFullUrl,
                panAttachmentThumbUrl: isPanPdf ? '' : this.getAttachmentUrl(panAttachmentId, 'small'),
                panAttachmentFullUrl: panFullUrl,
                passportAttachmentThumbUrl: isPassportPdf ? '' : this.getAttachmentUrl(passportAttachmentId, 'small'),
                passportAttachmentFullUrl: passportFullUrl,
                voterAttachmentThumbUrl: isVoterPdf ? '' : this.getAttachmentUrl(voterAttachmentId, 'small'),
                voterAttachmentFullUrl: voterFullUrl,

                // Presence flags so the template knows to show the icon block for PDFs.
                hasAadhaarAttachment: !!aadhaarAttachmentId,
                hasDrivingAttachment: !!drivingAttachmentId,
                hasPanAttachment: !!panAttachmentId,
                hasPassportAttachment: !!passportAttachmentId,
                hasVoterAttachment: !!voterAttachmentId,

                isAadhaarPdf: isAadhaarPdf,
                isDrivingPdf: isDrivingPdf,
                isPanPdf: isPanPdf,
                isPassportPdf: isPassportPdf,
                isVoterPdf: isVoterPdf
            };
        },

        // Load the user, employee, and related profile records.
        setup: function () {
            var self = this;
            var userId = this.getUser().id;

            this.profileCompletionStatus = null;
            this.profileCompletionModal = null;
            this.profileCompletionFlowPromise = null;
            this.profileCompletionStepKey = null;
            this.profileCompletionIntroShown = false;
            this.profileCompletionDoneAck = this.isCompletionDoneAcknowledged();

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
                    self.userData.id = userId;
                    self.employeeBank = null;

                    // Fetch employee record linked to user
                    var employeePromise = Espo.Ajax.getRequest('CEmployee', {
                        where: [{ type: 'equals', attribute: 'userId', value: userId }],
                        maxSize: 1
                    });

                    var managerPromise = Espo.Ajax.getRequest('ManagerMapping', {
                        where: [{ type: 'equals', attribute: 'assignedUserId', value: userId }],
                        maxSize: 1
                    });

                    var teamPromise = Espo.Ajax.getRequest('ManagerMapping', {
                        where: [{ type: 'equals', attribute: 'approverId', value: userId }],
                        maxSize: 100
                    });

                    Promise.all([employeePromise, managerPromise, teamPromise]).then(function (results) {
                        var employeeResult = results[0];
                        var managerResult = results[1];
                        var teamResult = results[2];

                        // Store employee record
                        self.employeeRecord = null;
                        if (employeeResult.list && employeeResult.list.length > 0) {
                            self.employeeRecord = employeeResult.list[0];
                        }

                        // Fetch address records if employee exists
                        var addressPromise = Promise.resolve({ list: [] });
                        var bankPromise = Promise.resolve({ list: [] });
                        var aadhaarPromise = Promise.resolve({ list: [] });
                        var drivingLicencePromise = Promise.resolve({ list: [] });
                        var panCardPromise = Promise.resolve({ list: [] });
                        var passportPromise = Promise.resolve({ list: [] });
                        var voterIdPromise = Promise.resolve({ list: [] });
                        var contactPromise = Promise.resolve({ list: [] });
                        var contactTypePromise = self.loadContactTypeOptions();
                        var dependentPromise = Promise.resolve({ list: [] });
                        var dependantRelationPromise = self.loadDependantRelationOptions();
                        var experiencePromise = Promise.resolve({ list: [] });
                        var workRolePromise = self.loadWorkRoleOptions();
                        var countryPromise = self.loadCountryOptions();
                        var otherDocumentPromise = Promise.resolve({ list: [] });
                        if (self.employeeRecord) {
                            addressPromise = Espo.Ajax.getRequest('CEmployeeAddress', {
                                where: [{ type: 'equals', attribute: 'employeeId', value: self.employeeRecord.id }],
                                maxSize: 10
                            });

                            bankPromise = Espo.Ajax.getRequest('CEmployeeBank', {
                                where: [{ type: 'equals', attribute: 'employeeId', value: self.employeeRecord.id }],
                                maxSize: 10,
                                orderBy: 'modifiedAt',
                                order: 'desc'
                            });

                            aadhaarPromise = Espo.Ajax.getRequest('CADHAR', {
                                where: [{ type: 'equals', attribute: 'employeeId', value: self.employeeRecord.id }],
                                maxSize: 1,
                                orderBy: 'modifiedAt',
                                order: 'desc'
                            });

                            drivingLicencePromise = Espo.Ajax.getRequest('CDrivingLicense', {
                                where: [{ type: 'equals', attribute: 'employeeId', value: self.employeeRecord.id }],
                                maxSize: 1,
                                orderBy: 'modifiedAt',
                                order: 'desc'
                            });

                            panCardPromise = Espo.Ajax.getRequest('CPanCard', {
                                where: [{ type: 'equals', attribute: 'employeeId', value: self.employeeRecord.id }],
                                maxSize: 1,
                                orderBy: 'modifiedAt',
                                order: 'desc'
                            });

                            passportPromise = Espo.Ajax.getRequest('CPassport', {
                                where: [{ type: 'equals', attribute: 'employeeId', value: self.employeeRecord.id }],
                                maxSize: 1,
                                orderBy: 'modifiedAt',
                                order: 'desc'
                            });

                            voterIdPromise = Espo.Ajax.getRequest('CVoterIdCard', {
                                where: [{ type: 'equals', attribute: 'employeeId', value: self.employeeRecord.id }],
                                maxSize: 1,
                                orderBy: 'modifiedAt',
                                order: 'desc'
                            });

                            contactPromise = self.loadContactRecords();
                            dependentPromise = self.loadDependentRecords();
                            experiencePromise = self.loadExperienceRecords();
                            otherDocumentPromise = self.loadOtherDocumentRecords();
                        }

                        return Promise.all([
                            addressPromise,
                            bankPromise,
                            aadhaarPromise,
                            drivingLicencePromise,
                            panCardPromise,
                            passportPromise,
                            voterIdPromise,
                            contactPromise,
                            contactTypePromise,
                            dependentPromise,
                            dependantRelationPromise,
                            experiencePromise,
                            workRolePromise,
                            countryPromise,
                            otherDocumentPromise
                        ]).then(function (recordsResult) {
                            var addrResult = recordsResult[0];
                            var bankResult = recordsResult[1];
                            var aadhaarResult = recordsResult[2];
                            var drivingLicenceResult = recordsResult[3];
                            var panCardResult = recordsResult[4];
                            var passportResult = recordsResult[5];
                            var voterIdResult = recordsResult[6];
                            var contactResult = recordsResult[7];
                            var contactTypeResult = recordsResult[8];
                            var dependentResult = recordsResult[9];
                            var dependantRelationResult = recordsResult[10];
                            var experienceResult = recordsResult[11];
                            var workRoleResult = recordsResult[12];
                            var countryResult = recordsResult[13];
                            var otherDocumentResult = recordsResult[14];

                            self.permanentAddress = null;
                            self.currentAddress = null;

                            if (addrResult.list && addrResult.list.length > 0) {
                                addrResult.list.forEach(function (addr) {
                                    if (addr.addressType === 'Permanent') {
                                        self.permanentAddress = addr;
                                    } else if (addr.addressType === 'Current') {
                                        self.currentAddress = addr;
                                    }
                                });
                            }

                            self.employeeBank = null;
                            if (bankResult.list && bankResult.list.length > 0) {
                                var activeBank = bankResult.list.find(function (record) {
                                    return !!record.isActive;
                                });

                                self.employeeBank = activeBank || bankResult.list[0];
                            }

                            self.aadhaarRecord = (aadhaarResult.list && aadhaarResult.list.length > 0) ? aadhaarResult.list[0] : null;
                            self.drivingLicenceRecord = (drivingLicenceResult.list && drivingLicenceResult.list.length > 0) ? drivingLicenceResult.list[0] : null;
                            self.panCardRecord = (panCardResult.list && panCardResult.list.length > 0) ? panCardResult.list[0] : null;
                            self.passportRecord = (passportResult.list && passportResult.list.length > 0) ? passportResult.list[0] : null;
                            self.voterIdRecord = (voterIdResult.list && voterIdResult.list.length > 0) ? voterIdResult.list[0] : null;
                            self.contactRecords = ((contactResult && contactResult.list) || []).map(function (record) {
                                return self.normalizeContactRecord(record);
                            });
                            self.contactTypeOptions = self.mapContactTypeOptions(contactTypeResult.list || []);
                            self.dependentRecords = ((dependentResult && dependentResult.list) || []).map(function (record) {
                                return self.normalizeDependentRecord(record);
                            });
                            self.dependantRelationOptions = self.mapDependantRelationOptions(dependantRelationResult.list || []);
                            self.experienceRecords = ((experienceResult && experienceResult.list) || []).map(function (record) {
                                return self.normalizeExperienceRecord(record);
                            });
                            self.workRoleOptions = self.mapSimpleOptions(workRoleResult.list || []);
                            self.countryOptions = self.mapSimpleOptions(countryResult.list || []);
                            self.otherDocumentRecords = ((otherDocumentResult && otherDocumentResult.list) || []).map(function (record) {
                                return self.normalizeOtherDocumentRecord(record);
                            });

                            // Manager
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

                            // Team
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
            });
        },

        // Avatar actions and upload helpers.

        actionEditAvatar: function () {
            this.$el.find('#profile-avatar-input').trigger('click');
        },

        actionUploadAvatar: function (e) {
            var self = this;
            var file = e.currentTarget.files[0];
            var userId = this.getUser().id;

            if (!file) return;

            if (!file.type.startsWith('image/')) {
                self.showAvatarToast('Please select a valid image file.', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                self.showAvatarToast('Image must be under 5 MB.', 'error');
                return;
            }

            var reader = new FileReader();
            reader.onload = function (evt) {
                var dataUri = evt.target.result;
                var base64Data = dataUri.split(',')[1];
                var mimeType = file.type;
                var ext = file.name.split('.').pop();

                var $avatar = self.$el.find('#profile-avatar-display');
                $avatar.find('#profile-avatar-initials').remove();
                var $img = $avatar.find('img#profile-avatar-img');
                if ($img.length) {
                    $img.attr('src', dataUri);
                } else {
                    $avatar.prepend(
                        '<img src="' + dataUri + '" alt="Avatar" id="profile-avatar-img" ' +
                        'style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">'
                    );
                }

                Espo.Ajax.postRequest('Attachment', {
                    name: 'avatar.' + ext,
                    type: mimeType,
                    size: file.size,
                    relatedType: 'User',
                    field: 'avatar',
                    file: dataUri
                }).then(function (attachment) {
                    if (!attachment || !attachment.id) throw new Error('No attachment ID returned.');
                    return Espo.Ajax.putRequest('User/' + userId, { avatarId: attachment.id });
                }).then(function () {
                    self.userData.avatarUrl = dataUri;
                    self.showAvatarToast('Profile photo updated successfully!', 'success');
                    self.$el.find('#profile-avatar-input').val('');
                }).catch(function (err) {
                    console.error('Avatar upload error:', err);
                    self.showAvatarToast('Failed to update photo. Please try again.', 'error');
                    var $av = self.$el.find('#profile-avatar-display');
                    $av.find('img#profile-avatar-img').remove();
                    if (self.userData && self.userData.avatarUrl) {
                        $av.prepend('<img src="' + self.userData.avatarUrl + '" alt="Avatar" id="profile-avatar-img" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">');
                    } else {
                        $av.prepend('<span id="profile-avatar-initials">' + (self.userData.userInitials || 'AD') + '</span>');
                    }
                    self.$el.find('#profile-avatar-input').val('');
                });
            };
            reader.readAsDataURL(file);
        },

        // Show a short toast message in the profile page.
        showAvatarToast: function (message, type) {
            var $toast = $('body').find('#pf-toast');
            if (!$toast.length) return;
            $toast.removeClass('success error').addClass(type).text(message);
            $toast.addClass('show');
            setTimeout(function () { $toast.removeClass('show'); }, 3000);
        },

        // About section editing.

        actionEditAbout: function () {
            var self = this;
            var user = this.userData || {};
            var userId = this.getUser().id;

            var s = 'width:100%;padding:8px 10px;border:1px solid #ced4da;border-radius:4px;font-size:14px;color:#333;box-sizing:border-box;';
            var lbl = 'display:block;font-size:12px;font-weight:600;color:#6c757d;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;';

            var g = user.gender || '';
            var bg = user.cBloodGroup || '';
            var ms = user.cMaritialStatus || '';
            var fn = user.firstName || '';
            var mn = user.middleName || '';
            var ln = user.lastName || '';

            var bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
                .map(function(o) { return '<option value="' + o + '" ' + (bg === o ? 'selected' : '') + '>' + o + '</option>'; })
                .join('');

            var formHtml = '<div style="padding:20px;">' +
                '<form id="aboutEditForm" novalidate>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
                '<div><label style="' + lbl + '">First Name <span style="color:red">*</span></label><input type="text" id="edit-firstName" value="' + fn + '" placeholder="First Name" style="' + s + '" /></div>' +
                '<div><label style="' + lbl + '">Middle Name</label><input type="text" id="edit-middleName" value="' + mn + '" placeholder="Middle Name" style="' + s + '" /></div>' +
                '<div><label style="' + lbl + '">Last Name <span style="color:red">*</span></label><input type="text" id="edit-lastName" value="' + ln + '" placeholder="Last Name" style="' + s + '" /></div>' +
                '<div><label style="' + lbl + '">Gender <span style="color:red">*</span></label><select id="edit-gender" style="' + s + '"><option value="">-- Select --</option><option value="Male" ' + (g === 'Male' ? 'selected' : '') + '>Male</option><option value="Female" ' + (g === 'Female' ? 'selected' : '') + '>Female</option><option value="Other" ' + (g === 'Other' ? 'selected' : '') + '>Other</option></select></div>' +
                '<div><label style="' + lbl + '">Blood Group <span style="color:red">*</span></label><select id="edit-bloodGroup" style="' + s + '"><option value="">-- Select --</option>' + bloodGroupOptions + '</select></div>' +
                '<div><label style="' + lbl + '">Marital Status <span style="color:red">*</span></label><select id="edit-maritalStatus" style="' + s + '"><option value="">-- Select --</option><option value="Married" ' + (ms === 'Married' ? 'selected' : '') + '>Married</option><option value="Unmarried" ' + (ms === 'Unmarried' ? 'selected' : '') + '>Unmarried</option></select></div>' +
                '<div><label style="' + lbl + '">Date of Birth <span style="color:red">*</span></label><input type="date" id="edit-dob" value="' + (user.cDob || '') + '" style="' + s + '" /></div>' +
                '</div>' +
                '<div id="about-form-error" style="color:red;font-size:13px;margin-top:12px;display:none;"></div>' +
                '<div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px;">' +
                '<button type="button" id="aboutCancelBtn" style="padding:8px 20px;border:1px solid #ced4da;background:#fff;border-radius:4px;cursor:pointer;font-size:14px;">Cancel</button>' +
                '<button type="submit" id="aboutSaveBtn" style="padding:8px 20px;background:#1f4a7a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;">Save</button>' +
                '</div></form></div>';

            var modal = this.simpleModal('Edit About', formHtml);
            var $modal = $('#' + modal.modalId);

            $modal.find('#aboutCancelBtn').on('click', function () { modal.closeModal(); });

            $modal.find('#aboutEditForm').on('submit', function (e) {
                e.preventDefault();

                var firstName = $modal.find('#edit-firstName').val().trim();
                var middleName = $modal.find('#edit-middleName').val().trim();
                var lastName = $modal.find('#edit-lastName').val().trim();
                var gender = $modal.find('#edit-gender').val();
                var bloodGroup = $modal.find('#edit-bloodGroup').val();
                var maritalStatus = $modal.find('#edit-maritalStatus').val();
                var dob = $modal.find('#edit-dob').val();

                $modal.find('#edit-firstName, #edit-lastName, #edit-gender, #edit-bloodGroup, #edit-maritalStatus, #edit-dob').css('border-color', '#ced4da');
                $modal.find('#about-form-error').hide();

                var fields = [
                    { selector: '#edit-firstName', val: firstName },
                    { selector: '#edit-lastName', val: lastName },
                    { selector: '#edit-gender', val: gender },
                    { selector: '#edit-bloodGroup', val: bloodGroup },
                    { selector: '#edit-maritalStatus', val: maritalStatus },
                    { selector: '#edit-dob', val: dob }
                ];

                var firstInvalid = null;
                fields.forEach(function (f) {
                    if (!f.val) {
                        $modal.find(f.selector).css('border-color', 'red');
                        if (!firstInvalid) firstInvalid = f.selector;
                    }
                });

                if (firstInvalid) {
                    $modal.find(firstInvalid).focus();
                    return;
                }

                var $saveBtn = $modal.find('#aboutSaveBtn');
                $saveBtn.prop('disabled', true).text('Saving...');

                Espo.Ajax.putRequest('User/' + userId, {
                    firstName: firstName,
                    middleName: middleName,
                    lastName: lastName,
                    gender: gender,
                    cBloodGroup: bloodGroup,
                    cMaritialStatus: maritalStatus,
                    cDob: dob
                }).then(function () {
                    self.userData.firstName = firstName;
                    self.userData.middleName = middleName;
                    self.userData.lastName = lastName;
                    self.userData.gender = gender;
                    self.userData.cBloodGroup = bloodGroup;
                    self.userData.cMaritialStatus = maritalStatus;
                    self.userData.cDob = dob;

                    var fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
                    self.$el.find('#pf-val-userName').text(fullName);
                    self.$el.find('.profile-header-info h3').text(fullName);
                    self.$el.find('#pf-val-gender').text(gender);
                    self.$el.find('#pf-val-bloodGroup').text(bloodGroup);
                    self.$el.find('#pf-val-maritalStatus').text(maritalStatus);
                    self.$el.find('#pf-val-dob').text(dob);

                    modal.closeModal();
                    self.showAvatarToast('About updated successfully!', 'success');
                    self.handleProfileCompletionUpdate();
                }).catch(function () {
                    $saveBtn.prop('disabled', false).text('Save');
                    $modal.find('#about-form-error').text('Failed to save changes. Please try again.').show();
                });
            });
        },

        // ─── Address Edit (shared logic) ─────────────────────────────────────────

        /**
         * Opens the address edit modal for either 'Permanent' or 'Current' address type.
         * @param {string} addressType  'Permanent' or 'Current'  (these are the display labels;
         *   the actual enum KEY sent to the API is resolved from entity metadata below)
         */
        // Shared address modal for permanent and current address.
        actionOpenAddressModal: function (addressType) {
            var self = this;
            var userId = this.getUser().id;
            var s = 'width:100%;padding:8px 10px;border:1.5px solid #ced4da;border-radius:6px;font-size:14px;color:#333;box-sizing:border-box;background:#fff;';
            var lbl = 'display:block;font-size:12px;font-weight:600;color:#6c757d;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;';

            // Get existing address record (if any)
            var existingAddr = addressType === 'Permanent' ? self.permanentAddress : self.currentAddress;

            var formHtml = `
                <div style="padding:20px;">
                    <form id="addressEditForm" novalidate>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">

                            <div style="grid-column:1/-1;">
                                <label style="${lbl}">Street <span style="color:red">*</span></label>
                                <input type="text" id="addr-street" placeholder="Street / House No / Area" style="${s}" value="${existingAddr ? (existingAddr.name || '') : ''}" />
                            </div>

                            <div>
                                <label style="${lbl}">Country <span style="color:red">*</span></label>
                                <select id="addr-country" style="${s}">
                                    <option value="">-- Loading... --</option>
                                </select>
                            </div>

                            <div>
                                <label style="${lbl}">State <span style="color:red">*</span></label>
                                <select id="addr-state" style="${s}" disabled>
                                    <option value="">-- Select Country first --</option>
                                </select>
                            </div>

                            <div>
                                <label style="${lbl}">City <span style="color:red">*</span></label>
                                <select id="addr-city" style="${s}" disabled>
                                    <option value="">-- Select State first --</option>
                                </select>
                            </div>

                            <div>
                                <label style="${lbl}">Postal Code</label>
                                <input type="text" id="addr-pincode" placeholder="e.g. 411001" maxlength="10" style="${s}" value="${existingAddr ? (existingAddr.pincode || '') : ''}" />
                            </div>

                        </div>
                        <div id="addr-form-error" style="color:red;font-size:13px;margin-top:12px;display:none;"></div>
                        <div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px;">
                            <button type="button" id="addrCancelBtn" style="padding:8px 20px;border:1px solid #ced4da;background:#fff;border-radius:4px;cursor:pointer;font-size:14px;">Cancel</button>
                            <button type="submit" id="addrSaveBtn" style="padding:8px 20px;background:#1f4a7a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;"><span id="addrSaveBtnText">Save</span></button>
                        </div>
                    </form>
                </div>
            `;

            var modal = self.simpleModal('Edit ' + addressType + ' Address', formHtml);
            var $modal = $('#' + modal.modalId);

            // ── Resolve the exact enum key from entity metadata ──────────────────
            // EspoCRM validates enums against the key list from entity defs.
            // We fetch the metadata to find which key corresponds to the label
            // "Permanent" or "Current". If metadata fetch fails we fall back to the
            // raw label (works when key === label, which is common).
            var resolvedAddressTypeKey = addressType; // optimistic default
            var resolveAddressTypeKeyPromise = Espo.Ajax.getRequest('Metadata', {
                key: 'entityDefs.CEmployeeAddress.fields.addressType'
            }).then(function (meta) {
                // meta.options  -> array of keys  e.g. ['Permanent','Current'] or ['permanent','current']
                // meta.optionsIds -> same as options in many versions; labels are in meta.optionItems
                var options = (meta && meta.options) ? meta.options : [];
                var optionLabels = (meta && (meta.translatedOptions || meta.optionItems)) ? (meta.translatedOptions || meta.optionItems) : {};

                // Try to find the key whose translated label matches addressType (case-insensitive)
                var found = null;
                options.forEach(function (key) {
                    var label = optionLabels[key] || key;
                    if (label.toLowerCase() === addressType.toLowerCase() || key.toLowerCase() === addressType.toLowerCase()) {
                        found = key;
                    }
                });

                if (found) {
                    resolvedAddressTypeKey = found;
                }
            }).catch(function () {
                // metadata fetch failed — keep default label as key
            });

            // ── Cascading dropdown helpers ────────────────────────────────────────

            function setSelectOptions($sel, items, selectedId) {
                $sel.empty().append('<option value="">-- Select --</option>');
                items.forEach(function (item) {
                    var opt = $('<option></option>').val(item.id).text(item.name);
                    if (item.id === selectedId) opt.attr('selected', true);
                    $sel.append(opt);
                });
                $sel.prop('disabled', false);
            }

            function loadStates(countryId, selectedStateId) {
                var $state = $modal.find('#addr-state');
                var $city  = $modal.find('#addr-city');
                $state.empty().append('<option value="">-- Loading... --</option>').prop('disabled', true);
                $city.empty().append('<option value="">-- Select State first --</option>').prop('disabled', true);

                if (!countryId) {
                    $state.empty().append('<option value="">-- Select Country first --</option>');
                    return;
                }

                Espo.Ajax.getRequest('CState', {
                    where: [{ type: 'equals', attribute: 'countryId', value: countryId }],
                    maxSize: 200,
                    orderBy: 'name',
                    order: 'asc'
                }).then(function (res) {
                    setSelectOptions($state, res.list || [], selectedStateId);
                    if (selectedStateId) {
                        loadCities(selectedStateId, existingAddr ? existingAddr.cityId : null);
                    }
                }).catch(function () {
                    $state.empty().append('<option value="">-- Failed to load --</option>');
                });
            }

            function loadCities(stateId, selectedCityId) {
                var $city = $modal.find('#addr-city');
                $city.empty().append('<option value="">-- Loading... --</option>').prop('disabled', true);

                if (!stateId) {
                    $city.empty().append('<option value="">-- Select State first --</option>');
                    return;
                }

                Espo.Ajax.getRequest('CCity', {
                    where: [{ type: 'equals', attribute: 'stateId', value: stateId }],
                    maxSize: 200,
                    orderBy: 'name',
                    order: 'asc'
                }).then(function (res) {
                    setSelectOptions($city, res.list || [], selectedCityId);
                }).catch(function () {
                    $city.empty().append('<option value="">-- Failed to load --</option>');
                });
            }

            // ── Load countries on open ────────────────────────────────────────────
            Espo.Ajax.getRequest('CCountry', {
                maxSize: 200,
                orderBy: 'name',
                order: 'asc'
            }).then(function (res) {
                var $country = $modal.find('#addr-country');
                var selectedCountryId = existingAddr ? existingAddr.countryId : null;
                setSelectOptions($country, res.list || [], selectedCountryId);

                if (selectedCountryId) {
                    loadStates(selectedCountryId, existingAddr ? existingAddr.stateId : null);
                } else {
                    $modal.find('#addr-state').empty().append('<option value="">-- Select Country first --</option>');
                    $modal.find('#addr-city').empty().append('<option value="">-- Select State first --</option>');
                }
            }).catch(function () {
                $modal.find('#addr-country').empty().append('<option value="">-- Failed to load countries --</option>');
            });

            // ── Cascading change handlers ─────────────────────────────────────────
            $modal.on('change', '#addr-country', function () {
                loadStates($(this).val(), null);
            });

            $modal.on('change', '#addr-state', function () {
                loadCities($(this).val(), null);
            });

            // ── Cancel ───────────────────────────────────────────────────────────
            $modal.find('#addrCancelBtn').on('click', function () { modal.closeModal(); });

            // ── Submit ───────────────────────────────────────────────────────────
            $modal.find('#addressEditForm').on('submit', function (e) {
                e.preventDefault();

                var street    = $modal.find('#addr-street').val().trim();
                var countryId = $modal.find('#addr-country').val();
                var stateId   = $modal.find('#addr-state').val();
                var cityId    = $modal.find('#addr-city').val();
                var pincode   = $modal.find('#addr-pincode').val().trim();

                // Reset validation borders
                $modal.find('#addr-street, #addr-country, #addr-state, #addr-city').css('border-color', '#ced4da');
                $modal.find('#addr-form-error').hide();

                var valid = true;
                if (!street)    { $modal.find('#addr-street').css('border-color', 'red');   valid = false; }
                if (!countryId) { $modal.find('#addr-country').css('border-color', 'red');  valid = false; }
                if (!stateId)   { $modal.find('#addr-state').css('border-color', 'red');    valid = false; }
                if (!cityId)    { $modal.find('#addr-city').css('border-color', 'red');     valid = false; }

                if (!valid) {
                    $modal.find('#addr-form-error').text('Please fill in all required fields.').show();
                    return;
                }

                if (!self.employeeRecord) {
                    $modal.find('#addr-form-error').text('Employee record not found. Please contact admin.').show();
                    return;
                }

                var $saveBtn = $modal.find('#addrSaveBtn');
                var $saveTxt = $modal.find('#addrSaveBtnText');
                $saveBtn.prop('disabled', true);
                $saveTxt.text('Saving...');

                var countryName = $modal.find('#addr-country option:selected').text();
                var stateName   = $modal.find('#addr-state option:selected').text();
                var cityName    = $modal.find('#addr-city option:selected').text();

                var upsertTargetId = null;

                resolveAddressTypeKeyPromise.then(function () {
                    // Build payload after enum-key resolution and stamp ownership to logged-in user.
                    var payload = {
                        name:           street,
                        addressType:    resolvedAddressTypeKey,
                        employeeId:     self.employeeRecord.id,
                        assignedUserId: userId,
                        countryId:      countryId,
                        stateId:        stateId,
                        cityId:         cityId,
                        pincode:        pincode
                    };

                    return Espo.Ajax.getRequest('CEmployeeAddress', {
                        where: [{ type: 'equals', attribute: 'employeeId', value: self.employeeRecord.id }],
                        maxSize: 100
                    }).then(function (res) {
                        var list = (res && res.list) ? res.list : [];
                        var byType = list.find(function (rec) {
                            var recType = (rec && rec.addressType) ? String(rec.addressType).toLowerCase() : '';
                            return recType === String(resolvedAddressTypeKey).toLowerCase() || recType === String(addressType).toLowerCase();
                        });

                        var targetRecord = byType || existingAddr || null;
                        upsertTargetId = targetRecord && targetRecord.id ? targetRecord.id : null;

                        if (upsertTargetId) {
                            return Espo.Ajax.putRequest('CEmployeeAddress/' + upsertTargetId, payload);
                        }

                        return Espo.Ajax.postRequest('CEmployeeAddress', payload);
                    });
                }).then(function (savedRecord) {
                    var savedId = (savedRecord && savedRecord.id) ? savedRecord.id : upsertTargetId;

                    var updatedAddr = {
                        id:          savedId,
                        name:        street,
                        addressType: resolvedAddressTypeKey,
                        employeeId:  self.employeeRecord.id,
                        assignedUserId: userId,
                        countryId:   countryId,
                        stateId:     stateId,
                        cityId:      cityId,
                        pincode:     pincode,
                        countryName: countryName,
                        stateName:   stateName,
                        cityName:    cityName
                    };

                    if (addressType === 'Permanent') {
                        self.permanentAddress = updatedAddr;
                        self.$el.find('#pf-val-permStreet').text(street || '--');
                        self.$el.find('#pf-val-permCity').text(cityName || '--');
                        self.$el.find('#pf-val-permState').text(stateName || '--');
                        self.$el.find('#pf-val-permCountry').text(countryName || '--');
                        self.$el.find('#pf-val-permPostal').text(pincode || '--');
                    } else {
                        self.currentAddress = updatedAddr;
                        self.$el.find('#pf-val-currStreet').text(street || '--');
                        self.$el.find('#pf-val-currCity').text(cityName || '--');
                        self.$el.find('#pf-val-currState').text(stateName || '--');
                        self.$el.find('#pf-val-currCountry').text(countryName || '--');
                        self.$el.find('#pf-val-currPostal').text(pincode || '--');
                    }

                    modal.closeModal();
                    self.showAvatarToast(addressType + ' address saved successfully!', 'success');
                    self.handleProfileCompletionUpdate();
                }).catch(function (err) {
                    console.error('Address save error:', err);
                    $saveBtn.prop('disabled', false);
                    $saveTxt.text('Save');
                    $modal.find('#addr-form-error').text('Failed to save address. Please try again.').show();
                });
            });
        },

        actionEditPermanentAddress: function () {
            this.actionOpenAddressModal('Permanent');
        },

        actionEditCurrentAddress: function () {
            this.actionOpenAddressModal('Current');
        },

        // ─── Bank Details Edit ─────────────────────────────────────────────────
        // Salary bank account editing.
        actionEditBank: function () {
            var self = this;
            var userId = this.getUser().id;
            var existingBank = self.employeeBank || {};
            var s = 'width:100%;padding:8px 10px;border:1.5px solid #ced4da;border-radius:6px;font-size:14px;color:#333;box-sizing:border-box;background:#fff;';
            var lbl = 'display:block;font-size:12px;font-weight:600;color:#6c757d;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;';

            if (!self.employeeRecord) {
                self.showAvatarToast('Employee record not found. Please contact admin.', 'error');
                return;
            }

            var selectedAccountType = existingBank.accountType || 'Saving';
            var formHtml = '<div style="padding:20px;">' +
                '<form id="bankEditForm" novalidate>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
                        '<div>' +
                            '<label style="' + lbl + '">Bank Name <span style="color:red">*</span></label>' +
                            '<input type="text" id="bank-bankName" value="' + (existingBank.bankName || existingBank.banksName || '') + '" style="' + s + '" />' +
                        '</div>' +
                        '<div>' +
                            '<label style="' + lbl + '">Branch Name <span style="color:red">*</span></label>' +
                            '<input type="text" id="bank-branchName" value="' + (existingBank.branchName || '') + '" style="' + s + '" />' +
                        '</div>' +
                        '<div>' +
                            '<label style="' + lbl + '">Account Holder Name <span style="color:red">*</span></label>' +
                            '<input type="text" id="bank-holderName" value="' + (existingBank.bankHolderName || '') + '" style="' + s + '" />' +
                        '</div>' +
                        '<div>' +
                            '<label style="' + lbl + '">Account Number <span style="color:red">*</span></label>' +
                            '<input type="text" id="bank-accountNo" value="' + (existingBank.accountNO || '') + '" style="' + s + '" />' +
                        '</div>' +
                        '<div>' +
                            '<label style="' + lbl + '">Account Type <span style="color:red">*</span></label>' +
                            '<select id="bank-accountType" style="' + s + '">' +
                                '<option value="">-- Select --</option>' +
                                '<option value="Saving" ' + (selectedAccountType === 'Saving' ? 'selected' : '') + '>Saving</option>' +
                                '<option value="Current" ' + (selectedAccountType === 'Current' ? 'selected' : '') + '>Current</option>' +
                            '</select>' +
                        '</div>' +
                        '<div>' +
                            '<label style="' + lbl + '">IFSC Code <span style="color:red">*</span></label>' +
                            '<input type="text" id="bank-ifsc" value="' + (existingBank.iFSCCode || '') + '" style="' + s + '" />' +
                        '</div>' +
                        '<div>' +
                            '<label style="' + lbl + '">Phone No. <span style="color:red">*</span></label>' +
                            '<input type="text" id="bank-phoneNo" value="' + (existingBank.phoneNo || '') + '" style="' + s + '" />' +
                        '</div>' +
                        '<div>' +
                            '<label style="' + lbl + '">Email Address</label>' +
                            '<input type="text" id="bank-email" value="' + (existingBank.emailAddress || '') + '" style="' + s + '" />' +
                        '</div>' +
                    '</div>' +
                    '<div id="bank-form-error" style="color:red;font-size:13px;margin-top:12px;display:none;"></div>' +
                    '<div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px;">' +
                        '<button type="button" id="bankCancelBtn" style="padding:8px 20px;border:1px solid #ced4da;background:#fff;border-radius:4px;cursor:pointer;font-size:14px;">Cancel</button>' +
                        '<button type="submit" id="bankSaveBtn" style="padding:8px 20px;background:#1f4a7a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;"><span id="bankSaveBtnText">Save</span></button>' +
                    '</div>' +
                '</form>' +
            '</div>';

            var modal = self.simpleModal('Edit Salary Deposit Bank A/c', formHtml);
            var $modal = $('#' + modal.modalId);

            $modal.find('#bankCancelBtn').on('click', function () {
                modal.closeModal();
            });

            $modal.find('#bankEditForm').on('submit', function (e) {
                e.preventDefault();

                var bankName = $modal.find('#bank-bankName').val().trim();
                var branchName = $modal.find('#bank-branchName').val().trim();
                var bankHolderName = $modal.find('#bank-holderName').val().trim();
                var accountNO = $modal.find('#bank-accountNo').val().trim();
                var accountType = $modal.find('#bank-accountType').val();
                var iFSCCode = $modal.find('#bank-ifsc').val().trim();
                var phoneNo = $modal.find('#bank-phoneNo').val().trim();
                var emailAddress = $modal.find('#bank-email').val().trim();

                $modal.find('#bank-bankName, #bank-branchName, #bank-holderName, #bank-accountNo, #bank-accountType, #bank-ifsc, #bank-phoneNo').css('border-color', '#ced4da');
                $modal.find('#bank-form-error').hide();

                var isValid = true;

                if (!bankName) { $modal.find('#bank-bankName').css('border-color', 'red'); isValid = false; }
                if (!branchName) { $modal.find('#bank-branchName').css('border-color', 'red'); isValid = false; }
                if (!bankHolderName) { $modal.find('#bank-holderName').css('border-color', 'red'); isValid = false; }
                if (!accountNO) { $modal.find('#bank-accountNo').css('border-color', 'red'); isValid = false; }
                if (!accountType) { $modal.find('#bank-accountType').css('border-color', 'red'); isValid = false; }
                if (!iFSCCode) { $modal.find('#bank-ifsc').css('border-color', 'red'); isValid = false; }
                if (!phoneNo) { $modal.find('#bank-phoneNo').css('border-color', 'red'); isValid = false; }

                if (!isValid) {
                    $modal.find('#bank-form-error').text('Please fill in all required fields.').show();
                    return;
                }

                var $saveBtn = $modal.find('#bankSaveBtn');
                var $saveTxt = $modal.find('#bankSaveBtnText');
                $saveBtn.prop('disabled', true);
                $saveTxt.text('Saving...');

                var payload = {
                    employeeId: self.employeeRecord.id,
                    assignedUserId: userId,
                    bankName: bankName,
                    branchName: branchName,
                    bankHolderName: bankHolderName,
                    accountNO: accountNO,
                    accountType: accountType,
                    iFSCCode: iFSCCode,
                    phoneNo: phoneNo,
                    emailAddress: emailAddress,
                    isActive: true
                };

                var upsertRecordId = null;

                Espo.Ajax.getRequest('CEmployeeBank', {
                    where: [{ type: 'equals', attribute: 'employeeId', value: self.employeeRecord.id }],
                    maxSize: 100,
                    orderBy: 'modifiedAt',
                    order: 'desc'
                }).then(function (res) {
                    var list = (res && res.list) ? res.list : [];
                    var activeRecord = list.find(function (record) {
                        return !!record.isActive;
                    });

                    var targetRecord = activeRecord || list[0] || existingBank;
                    upsertRecordId = targetRecord && targetRecord.id ? targetRecord.id : null;

                    if (upsertRecordId) {
                        return Espo.Ajax.putRequest('CEmployeeBank/' + upsertRecordId, payload);
                    }

                    return Espo.Ajax.postRequest('CEmployeeBank', payload);
                }).then(function (savedRecord) {
                    self.employeeBank = {
                        id: (savedRecord && savedRecord.id) ? savedRecord.id : upsertRecordId,
                        employeeId: self.employeeRecord.id,
                        assignedUserId: userId,
                        bankName: bankName,
                        branchName: branchName,
                        bankHolderName: bankHolderName,
                        accountNO: accountNO,
                        accountType: accountType,
                        iFSCCode: iFSCCode,
                        phoneNo: phoneNo,
                        emailAddress: emailAddress,
                        isActive: true
                    };

                    self.$el.find('#pf-val-bankName').text(bankName || '--');
                    self.$el.find('#pf-val-branchName').text(branchName || '--');
                    self.$el.find('#pf-val-accountHolderName').text(bankHolderName || '--');
                    self.$el.find('#pf-val-accountNumber').text(accountNO || '--');
                    self.$el.find('#pf-val-accountType').text(accountType || '--');
                    self.$el.find('#pf-val-ifscCode').text(iFSCCode || '--');
                    self.$el.find('#pf-val-bankPhoneNo').text(phoneNo || '--');

                    modal.closeModal();
                    self.showAvatarToast('Bank details saved successfully!', 'success');
                }).catch(function (err) {
                    console.error('Bank save error:', err);
                    $saveBtn.prop('disabled', false);
                    $saveTxt.text('Save');
                    $modal.find('#bank-form-error').text('Failed to save bank details. Please try again.').show();
                });
            });
        },

        // Document attachment helpers.
        extractAttachmentId: function (record) {
            if (!record) return null;

            if (record.attachmentsId) {
                if (Array.isArray(record.attachmentsId)) {
                    return record.attachmentsId[0] || null;
                }

                return record.attachmentsId;
            }

            if (record.attachmentId) {
                return record.attachmentId;
            }

            if (Array.isArray(record.attachmentIds) && record.attachmentIds.length) {
                return record.attachmentIds[0];
            }

            if (Array.isArray(record.attachmentsIds) && record.attachmentsIds.length) {
                return record.attachmentsIds[0];
            }

            if (record.attachment && record.attachment.id) {
                return record.attachment.id;
            }

            return null;
        },

        // Extract the original filename of the attachment from the record.
        // EspoCRM stores names in attachmentsNames as {id: filename} for link-multiple fields.
        extractAttachmentName: function (record) {
            if (!record) return '';
            var id = this.extractAttachmentId(record);
            if (!id) return '';

            if (record.attachmentsNames && typeof record.attachmentsNames === 'object') {
                return record.attachmentsNames[id] || '';
            }
            if (record.attachmentNames && typeof record.attachmentNames === 'object') {
                return record.attachmentNames[id] || '';
            }
            if (typeof record.attachmentsName === 'string') return record.attachmentsName;
            if (typeof record.attachmentName === 'string') return record.attachmentName;
            if (record.attachment && record.attachment.name) return record.attachment.name;

            return '';
        },

        // Returns true if the attachment in the record is a PDF file.
        isRecordAttachmentPdf: function (record) {
            if (!record) return false;
            var fname = this.extractAttachmentName(record);
            return fname.toLowerCase().slice(-4) === '.pdf';
        },

        // URL for viewing/downloading any attachment type (works for both images and PDFs).
        getFileAttachmentUrl: function (attachmentId) {
            if (!attachmentId) return '';
            return '?entryPoint=download&id=' + attachmentId;
        },

        // URL for image thumbnails only (does NOT work for PDFs — returns 403).
        getAttachmentUrl: function (attachmentId, size) {
            if (!attachmentId) return '';

            var url = '?entryPoint=image&id=' + attachmentId;
            if (size) {
                url += '&size=' + size;
            }

            return url;
        },

        setDocAttachmentPreview: function (docType, attachmentId, isPdf) {
            var $box = this.$el.find('[data-doc-attachment="' + docType + '"]');
            if (!$box.length) return;

            if (!attachmentId) {
                $box.html(
                    '<div class="pf-doc-attachment-empty">' +
                        '<i class="fa fa-file"></i>' +
                    '</div>'
                );

                return;
            }

            // For PDFs use entryPoint=attachment; for images use entryPoint=image.
            var fullUrl = isPdf ? this.getFileAttachmentUrl(attachmentId) : this.getAttachmentUrl(attachmentId);

            if (isPdf) {
                $box.html(
                    '<div class="pf-doc-attachment-thumb pdf-thumb" data-full-url="' + fullUrl + '" data-is-pdf="true" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#fef2f2;color:#dc2626;cursor:pointer;font-size:1.8rem;">' +
                        '<i class="fa fa-file-pdf-o"></i>' +
                    '</div>'
                );
            } else {
                var thumbUrl = this.getAttachmentUrl(attachmentId, 'small');
                $box.html(
                    '<img src="' + thumbUrl + '" class="pf-doc-attachment-thumb" data-full-url="' + fullUrl + '" alt="Document Attachment">'
                );
            }
        },

        actionPreviewDocAttachment: function (e) {
            e.preventDefault();

            var fullUrl = e.currentTarget.getAttribute('data-full-url') || e.currentTarget.getAttribute('src');
            if (!fullUrl) return;

            // Rely on the data-is-pdf flag set in the template/setDocAttachmentPreview.
            var isPdf = e.currentTarget.getAttribute('data-is-pdf') === 'true';

            var contentHtml = '';
            if (isPdf) {
                contentHtml = '<div style="padding:16px;">' +
                    '<iframe src="' + fullUrl + '" style="width:100%;height:70vh;border:1px solid #e2e8f0;border-radius:8px;"></iframe>' +
                '</div>';
            } else {
                contentHtml = '<div style="padding:16px;text-align:center;">' +
                    '<img src="' + fullUrl + '" alt="Attachment" style="max-width:100%;max-height:70vh;object-fit:contain;border-radius:8px;border:1px solid #e2e8f0;">' +
                '</div>';
            }

            contentHtml += '<div style="padding:0 16px 16px;text-align:center;">' +
                '<a href="' + fullUrl + '" target="_blank" rel="noopener" style="display:inline-block;padding:8px 14px;border-radius:6px;background:#1f4a7a;color:#fff;text-decoration:none;font-size:13px;">Open in New Tab</a>' +
            '</div>';

            this.simpleModal('Attachment Preview', contentHtml);
        },

        uploadDocumentAttachmentImage: function (file, relatedType) {
            var self = this;

            return new Promise(function (resolve, reject) {
                if (!file) {
                    resolve(null);
                    return;
                }

                var allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
                if (!file.type || allowedTypes.indexOf(file.type) === -1) {
                    reject('Please select an image (JPG, PNG, GIF) or PDF file.');
                    return;
                }

                if (file.size > 10 * 1024 * 1024) {
                    reject('File must be under 10 MB.');
                    return;
                }

                var reader = new FileReader();

                reader.onload = function (evt) {
                    var dataUri = evt.target.result;
                    var ext = (file.name && file.name.indexOf('.') > -1)
                        ? file.name.split('.').pop().toLowerCase()
                        : (file.type === 'application/pdf' ? 'pdf' : 'png');

                    Espo.Ajax.postRequest('Attachment', {
                        name: file.name || ('document-' + Date.now() + '.' + ext),
                        type: file.type,
                        size: file.size,
                        relatedType: relatedType || 'CEmployee',
                        field: 'attachments',
                        file: dataUri
                    }).then(function (attachment) {
                        if (!attachment || !attachment.id) {
                            reject('Failed to create attachment.');
                            return;
                        }

                        resolve(attachment.id);
                    }).catch(function () {
                        reject('Failed to upload attachment.');
                    });
                };

                reader.onerror = function () {
                    reject('Unable to read selected file.');
                };

                reader.readAsDataURL(file);
            });
        },

        uploadDocumentAttachmentFile: function (file, relatedType, fieldName) {
            return new Promise(function (resolve, reject) {
                if (!file) {
                    resolve(null);
                    return;
                }

                if (file.size > 10 * 1024 * 1024) {
                    reject('File must be under 10 MB.');
                    return;
                }

                var reader = new FileReader();

                reader.onload = function (evt) {
                    var dataUri = evt.target.result;
                    var ext = (file.name && file.name.indexOf('.') > -1)
                        ? file.name.split('.').pop().toLowerCase()
                        : 'bin';

                    Espo.Ajax.postRequest('Attachment', {
                        name: file.name || ('document-' + Date.now() + '.' + ext),
                        type: file.type || 'application/octet-stream',
                        size: file.size,
                        relatedType: relatedType || 'CEmployeeDocuments',
                        field: fieldName || 'attachment',
                        file: dataUri
                    }).then(function (attachment) {
                        if (!attachment || !attachment.id) {
                            reject('Failed to create attachment.');
                            return;
                        }

                        resolve({
                            id: attachment.id,
                            name: attachment.name || file.name || ''
                        });
                    }).catch(function () {
                        reject('Failed to upload attachment.');
                    });
                };

                reader.onerror = function () {
                    reject('Unable to read selected file.');
                };

                reader.readAsDataURL(file);
            });
        },

        // Reusable document modal for Aadhaar, PAN, Passport, etc.
        actionOpenSingleDocumentModal: function (config) {
            var self = this;
            var userId = this.getUser().id;
            var record = this[config.recordProp] || {};
            var currentAttachmentId = this.extractAttachmentId(record);
            var removeCurrentAttachment = false;
            var s = 'width:100%;padding:8px 10px;border:1.5px solid #ced4da;border-radius:6px;font-size:14px;color:#333;box-sizing:border-box;background:#fff;';
            var lbl = 'display:block;font-size:12px;font-weight:600;color:#6c757d;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;';

            if (!self.employeeRecord) {
                self.showAvatarToast('Employee record not found. Please contact admin.', 'error');
                return;
            }

            function esc(val) {
                return String(val || '')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
            }

            var fieldHtml = config.fields.map(function (field) {
                var rawValue = record[field.key] || '';
                var value = esc(rawValue);
                var requiredMark = field.required ? '<span style="color:red">*</span>' : '';
                var inputHtml = '';

                if (field.type === 'textarea') {
                    inputHtml = `<textarea id="${field.id}" placeholder="${field.placeholder || ''}" style="${s};min-height:84px;resize:vertical;">${value}</textarea>`;
                } else {
                    inputHtml = `<input type="${field.type || 'text'}" id="${field.id}" value="${value}" placeholder="${field.placeholder || ''}" style="${s}" />`;
                }

                var fullWidthStyle = field.fullWidth ? 'grid-column:1/-1;' : '';

                return `
                    <div style="${fullWidthStyle}">
                        <label style="${lbl}">${field.label} ${requiredMark}</label>
                        ${inputHtml}
                    </div>
                `;
            }).join('');

            var formHtml = `
                <div style="padding:20px;">
                    <form id="docEditForm" novalidate>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            ${fieldHtml}
                            <div style="grid-column:1/-1;">
                                <label style="${lbl}">Attachment (Image or PDF)</label>
                                <div id="doc-attachment-preview-wrap" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                                    ${currentAttachmentId
                                        ? (function() {
                                            var existingIsPdf = self.isRecordAttachmentPdf(record);
                                            var fullUrl = existingIsPdf
                                                ? self.getFileAttachmentUrl(currentAttachmentId)
                                                : self.getAttachmentUrl(currentAttachmentId);
                                            if (existingIsPdf) {
                                                return `<div id="doc-attachment-preview" class="pdf-thumb" data-full-url="${fullUrl}" data-is-pdf="true" style="width:78px;height:78px;display:flex;align-items:center;justify-content:center;background:#fef2f2;color:#dc2626;cursor:pointer;font-size:1.5rem;">` +
                                                    '<i class="fa fa-file-pdf-o"></i>' +
                                                '</div>';
                                            }
                                            return `<img id="doc-attachment-preview" src="${self.getAttachmentUrl(currentAttachmentId, 'small')}" alt="Attachment" style="width:78px;height:78px;object-fit:cover;border-radius:8px;border:1px solid #d0dae7;cursor:pointer;" data-full-url="${fullUrl}">`;
                                          })()
                                        : '<div id="doc-attachment-empty" style="width:78px;height:78px;border-radius:8px;border:1px dashed #b9c7d9;display:flex;align-items:center;justify-content:center;color:#7d8ea4;"><i class="fa fa-file"></i></div>'
                                    }
                                    <input type="file" id="doc-attachment-file" accept="image/*,application/pdf" style="${s};max-width:260px;">
                                    ${currentAttachmentId ? '<button type="button" id="doc-remove-attachment" style="padding:7px 12px;border:1px solid #ced4da;background:#fff;border-radius:6px;color:#6b7280;cursor:pointer;">Remove</button>' : ''}
                                </div>
                            </div>
                        </div>
                        <div id="doc-form-error" style="color:red;font-size:13px;margin-top:12px;display:none;"></div>
                        <div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px;">
                            <button type="button" id="docCancelBtn" style="padding:8px 20px;border:1px solid #ced4da;background:#fff;border-radius:4px;cursor:pointer;font-size:14px;">Cancel</button>
                            <button type="submit" id="docSaveBtn" style="padding:8px 20px;background:#1f4a7a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;"><span id="docSaveBtnText">Save</span></button>
                        </div>
                    </form>
                </div>
            `;

            var modal = self.simpleModal(config.title, formHtml);
            var $modal = $('#' + modal.modalId);

            $modal.find('#docCancelBtn').on('click', function () {
                modal.closeModal();
            });

            $modal.on('click', '#doc-attachment-preview', function () {
                var fullUrl = this.getAttribute('data-full-url') || this.getAttribute('src');
                if (!fullUrl) return;

                var isPdf = this.getAttribute('data-is-pdf') === 'true';

                var contentHtml = '';
                if (isPdf) {
                    contentHtml = '<div style="padding:16px;">' +
                        '<iframe src="' + fullUrl + '" style="width:100%;height:70vh;border:1px solid #e2e8f0;border-radius:8px;"></iframe>' +
                    '</div>';
                } else {
                    contentHtml = '<div style="padding:16px;text-align:center;">' +
                        '<img src="' + fullUrl + '" alt="Attachment" style="max-width:100%;max-height:70vh;object-fit:contain;border-radius:8px;border:1px solid #e2e8f0;">' +
                    '</div>';
                }

                contentHtml += '<div style="padding:0 16px 16px;text-align:center;">' +
                    '<a href="' + fullUrl + '" target="_blank" rel="noopener" style="display:inline-block;padding:8px 14px;border-radius:6px;background:#1f4a7a;color:#fff;text-decoration:none;font-size:13px;">Open in New Tab</a>' +
                '</div>';

                self.simpleModal('Attachment Preview', contentHtml);
            });

            $modal.on('change', '#doc-attachment-file', function (event) {
                var file = event.currentTarget.files && event.currentTarget.files[0];
                if (!file) return;

                var allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
                if (!file.type || allowedTypes.indexOf(file.type) === -1) {
                    $modal.find('#doc-form-error').text('Please select an image or PDF file.').show();
                    event.currentTarget.value = '';
                    return;
                }

                var reader = new FileReader();
                reader.onload = function (evt) {
                    var src = evt.target.result;
                    var isPdf = file.type === 'application/pdf';
                    var $previewContainer = $modal.find('#doc-attachment-preview-wrap');
                    
                    $modal.find('#doc-attachment-preview').remove();
                    $modal.find('#doc-attachment-empty').remove();

                    if (isPdf) {
                        $('<div id="doc-attachment-preview" class="pdf-thumb" style="width:78px;height:78px;display:flex;align-items:center;justify-content:center;background:#fef2f2;color:#dc2626;cursor:pointer;font-size:1.5rem;">' +
                            '<i class="fa fa-file-pdf-o"></i>' +
                        '</div>')
                            .attr('data-full-url', src)
                            .attr('data-is-pdf', 'true')
                            .prependTo($previewContainer);
                    } else {
                        $('<img id="doc-attachment-preview" alt="Attachment" style="width:78px;height:78px;object-fit:cover;border-radius:8px;border:1px solid #d0dae7;cursor:pointer;">')
                            .attr('src', src)
                            .attr('data-full-url', src)
                            .prependTo($previewContainer);
                    }

                    if (!$modal.find('#doc-remove-attachment').length) {
                        $('<button type="button" id="doc-remove-attachment" style="padding:7px 12px;border:1px solid #ced4da;background:#fff;border-radius:6px;color:#6b7280;cursor:pointer;">Remove</button>')
                            .appendTo($previewContainer);
                    }

                    removeCurrentAttachment = false;
                    $modal.find('#doc-form-error').hide();
                };

                reader.readAsDataURL(file);
            });

            $modal.on('click', '#doc-remove-attachment', function () {
                removeCurrentAttachment = true;
                $modal.find('#doc-attachment-file').val('');
                $modal.find('#doc-attachment-preview').remove();

                if (!$modal.find('#doc-attachment-empty').length) {
                    $('<div id="doc-attachment-empty" style="width:78px;height:78px;border-radius:8px;border:1px dashed #b9c7d9;display:flex;align-items:center;justify-content:center;color:#7d8ea4;"><i class="fa fa-file"></i></div>')
                        .prependTo($modal.find('#doc-attachment-preview-wrap'));
                }

                $(this).remove();
            });

            $modal.find('#docEditForm').on('submit', function (e) {
                e.preventDefault();

                $modal.find('#doc-form-error').hide();
                var isValid = true;
                var payload = {
                    employeeId: self.employeeRecord.id,
                    assignedUserId: userId
                };

                config.fields.forEach(function (field) {
                    var $input = $modal.find('#' + field.id);
                    var val = ($input.val() || '').trim();
                    $input.css('border-color', '#ced4da');

                    if (field.required && !val) {
                        $input.css('border-color', 'red');
                        isValid = false;
                    }

                    payload[field.key] = val;
                });

                if (!isValid) {
                    $modal.find('#doc-form-error').text('Please fill in all required fields.').show();
                    return;
                }

                var $saveBtn = $modal.find('#docSaveBtn');
                var $saveTxt = $modal.find('#docSaveBtnText');
                $saveBtn.prop('disabled', true);
                $saveTxt.text('Saving...');

                var attachmentInput = $modal.find('#doc-attachment-file').get(0);
                var selectedAttachmentFile = attachmentInput && attachmentInput.files
                    ? attachmentInput.files[0]
                    : null;

                // Track whether the final attachment will be a PDF.
                var newFileIsPdf = selectedAttachmentFile
                    ? selectedAttachmentFile.type === 'application/pdf'
                    : (!removeCurrentAttachment && self.isRecordAttachmentPdf(self[config.recordProp] || {}));

                var attachmentPromise = Promise.resolve(currentAttachmentId);

                if (selectedAttachmentFile) {
                    attachmentPromise = self.uploadDocumentAttachmentImage(selectedAttachmentFile, config.entityType);
                } else if (removeCurrentAttachment) {
                    attachmentPromise = Promise.resolve(null);
                }

                var upsertRecordId = null;

                attachmentPromise.then(function (resolvedAttachmentId) {
                    payload.attachmentsId = resolvedAttachmentId || null;

                    return Espo.Ajax.getRequest(config.entityType, {
                    where: [{ type: 'equals', attribute: 'employeeId', value: self.employeeRecord.id }],
                    maxSize: 1,
                    orderBy: 'modifiedAt',
                    order: 'desc'
                    }).then(function (res) {
                    var list = (res && res.list) ? res.list : [];
                    var existing = list[0] || self[config.recordProp] || null;
                    upsertRecordId = existing && existing.id ? existing.id : null;

                    if (upsertRecordId) {
                        return Espo.Ajax.putRequest(`${config.entityType}/${upsertRecordId}`, payload);
                    }

                    return Espo.Ajax.postRequest(config.entityType, payload);
                    }).then(function (savedRecord) {
                    self[config.recordProp] = Object.assign({}, self[config.recordProp] || {}, payload, {
                        id: (savedRecord && savedRecord.id) ? savedRecord.id : upsertRecordId,
                        attachmentsId: resolvedAttachmentId || null
                    });

                    currentAttachmentId = resolvedAttachmentId || null;

                    if (config.docType) {
                        self.setDocAttachmentPreview(config.docType, currentAttachmentId, currentAttachmentId ? newFileIsPdf : false);
                    }

                    if (typeof config.onSaved === 'function') {
                        config.onSaved(self[config.recordProp]);
                    }

                    modal.closeModal();
                    self.showAvatarToast(config.successMessage, 'success');
                    self.handleProfileCompletionUpdate();
                    });
                }).catch(function (err) {
                    console.error(`${config.entityType} save error:`, err);
                    $saveBtn.prop('disabled', false);
                    $saveTxt.text('Save');
                    var msg = (typeof err === 'string' && err) ? err : 'Failed to save details. Please try again.';
                    $modal.find('#doc-form-error').text(msg).show();
                });
            });
        },

        actionEditAadhaar: function () {
            this.actionOpenSingleDocumentModal({
                title: 'Edit Aadhaar',
                entityType: 'CADHAR',
                recordProp: 'aadhaarRecord',
                docType: 'aadhaar',
                successMessage: 'Aadhaar details saved successfully!',
                fields: [
                    { id: 'aadhaar-name', key: 'name', label: 'Name as per Aadhaar', required: true, type: 'text' },
                    { id: 'aadhaar-number', key: 'adharNumber', label: 'Aadhaar Number', required: true, type: 'text', pattern: '^\d{12}$', errorMessage: 'Aadhaar Number must be 12 digits.' },
                    { id: 'aadhaar-enrollment', key: 'adharEnrollementNumber', label: 'Aadhaar Enrollment Number', required: false, type: 'text', pattern: '^\d{24}$', errorMessage: 'Aadhaar Enrollment Number must be 24 digits.' },
                    { id: 'aadhaar-address', key: 'addressAsPerAadhar', label: 'Address as per Aadhaar', required: false, type: 'textarea', fullWidth: true }
                ],
                onSaved: function (doc) {
                    this.$el.find('[data-doc-field="aadhaarName"]').text(doc.name || '--');
                    this.$el.find('[data-doc-field="aadhaarNumber"]').text(doc.adharNumber || '--');
                    this.$el.find('[data-doc-field="aadhaarEnrollment"]').text(doc.adharEnrollementNumber || '--');
                    this.$el.find('[data-doc-field="aadhaarAddress"]').text(doc.addressAsPerAadhar || '--');
                }.bind(this)
            });
        },

        actionEditDrivingLicence: function () {
            this.actionOpenSingleDocumentModal({
                title: 'Edit Driving Licence',
                entityType: 'CDrivingLicense',
                recordProp: 'drivingLicenceRecord',
                docType: 'driving',
                successMessage: 'Driving licence details saved successfully!',
                fields: [
                    { id: 'dl-number', key: 'drivingLicenseNumber', label: 'Driving Licence Number', required: true, type: 'text', pattern: '^[a-zA-Z0-9]{15,16}$', errorMessage: 'Driving Licence Number must be 15-16 alphanumeric characters.' },
                    { id: 'dl-issue-date', key: 'dateOfIssue', label: 'Date of Issue', required: false, type: 'date' },
                    { id: 'dl-expiry-date', key: 'expiryDate', label: 'Expiry Date', required: false, type: 'date' }
                ],
                onSaved: function (doc) {
                    this.$el.find('[data-doc-field="dlNumber"]').text(doc.drivingLicenseNumber || '--');
                    this.$el.find('[data-doc-field="dlExpiry"]').text(doc.expiryDate || '--');
                }.bind(this)
            });
        },

        actionEditPanCard: function () {
            this.actionOpenSingleDocumentModal({
                title: 'Edit PAN Card',
                entityType: 'CPanCard',
                recordProp: 'panCardRecord',
                docType: 'pan',
                successMessage: 'PAN card details saved successfully!',
                fields: [
                    { id: 'pan-name', key: 'nameAsPerPanCard', label: 'Name as per PAN', required: true, type: 'text' },
                    { id: 'pan-number', key: 'panCardNumber', label: 'PAN Number', required: true, type: 'text', pattern: '^[a-zA-Z0-9]{10}$', errorMessage: 'PAN Number must be 10 alphanumeric characters.' },
                    { id: 'pan-middle-name', key: 'middleNameAsPerPANCard', label: 'Middle Name as per PAN', required: false, type: 'text' },
                    { id: 'pan-dob', key: 'dateOfBirthAsPerPanCard', label: 'Date of Birth as per PAN', required: false, type: 'date' }
                ],
                onSaved: function (doc) {
                    this.$el.find('[data-doc-field="panName"]').text(doc.nameAsPerPanCard || '--');
                    this.$el.find('[data-doc-field="panNumber"]').text(doc.panCardNumber || '--');
                }.bind(this)
            });
        },

        actionEditPassport: function () {
            this.actionOpenSingleDocumentModal({
                title: 'Edit Passport',
                entityType: 'CPassport',
                recordProp: 'passportRecord',
                docType: 'passport',
                successMessage: 'Passport details saved successfully!',
                fields: [
                    { id: 'passport-name', key: 'nameAsPerPassport', label: 'Name as per Passport', required: false, type: 'text' },
                    { id: 'passport-number', key: 'passportNumber', label: 'Passport Number', required: true, type: 'text' },
                    { id: 'passport-dob', key: 'dateOfBirth', label: 'Date of Birth', required: false, type: 'date' },
                    { id: 'passport-issue-date', key: 'dateOfIssue', label: 'Date of Issue', required: false, type: 'date' },
                    { id: 'passport-expiry-date', key: 'expiryDate', label: 'Expiry Date', required: false, type: 'date' },
                    { id: 'passport-place-birth', key: 'placeOfBirth', label: 'Place of Birth', required: false, type: 'text' },
                    { id: 'passport-place-issue', key: 'placeOfIssue', label: 'Place of Issue', required: false, type: 'text' }
                ],
                onSaved: function (doc) {
                    this.$el.find('[data-doc-field="passportNumber"]').text(doc.passportNumber || '--');
                    this.$el.find('[data-doc-field="passportExpiry"]').text(doc.expiryDate || '--');
                }.bind(this)
            });
        },

        actionEditVoterId: function () {
            this.actionOpenSingleDocumentModal({
                title: 'Edit Voter ID',
                entityType: 'CVoterIdCard',
                recordProp: 'voterIdRecord',
                docType: 'voter',
                successMessage: 'Voter ID details saved successfully!',
                fields: [
                    { id: 'voter-name', key: 'nameAsPerVoterIDCard', label: 'Name as per Voter ID', required: false, type: 'text' },
                    { id: 'voter-number', key: 'voterIDNumber', label: 'Voter ID Number', required: true, type: 'text' },
                    { id: 'voter-father-name', key: 'fathersNameAsPerVoterIDCard', label: "Father's Name as per Voter ID", required: false, type: 'text' },
                    { id: 'voter-dob', key: 'dateOfBirth', label: 'Date of Birth', required: false, type: 'date' }
                ],
                onSaved: function (doc) {
                    this.$el.find('[data-doc-field="voterIdNumber"]').text(doc.voterIDNumber || '--');
                }.bind(this)
            });
        },

        // ─── Other stubs ─────────────────────────────────────────────────────────

        // Contact data and dropdown loading.
        loadContactRecords: function () {
            if (!this.employeeRecord || !this.employeeRecord.id) {
                return Promise.resolve({ list: [] });
            }

            return Espo.Ajax.getRequest('CEmployeeContact', {
                where: [{ type: 'equals', attribute: 'employeeId', value: this.employeeRecord.id }],
                select: 'id,name,no,description,contactTag,contactTypesIds,contactTypesNames,employeeId,employeeName',
                maxSize: 100,
                orderBy: 'createdAt',
                order: 'desc'
            });
        },

        loadDependentRecords: function () {
            if (!this.employeeRecord || !this.employeeRecord.id) {
                return Promise.resolve({ list: [] });
            }

            return Espo.Ajax.getRequest('CEmployeeDependent', {
                where: [{ type: 'equals', attribute: 'employeeId', value: this.employeeRecord.id }],
                select: 'id,name,lastName,no,emergencyContactNumber,dependantRelationId,dependantRelationName,employeeId,employeeName',
                maxSize: 100,
                orderBy: 'createdAt',
                order: 'desc'
            });
        },

        loadExperienceRecords: function () {
            if (!this.employeeRecord || !this.employeeRecord.id) {
                return Promise.resolve({ list: [] });
            }

            return Espo.Ajax.getRequest('CEmployeePastExperience', {
                where: [{ type: 'equals', attribute: 'employeeId', value: this.employeeRecord.id }],
                select: 'id,name,companyName,companyAddress,startDate,endDate,workRoleId,workRoleName,countryId,countryName,stateId,stateName,cityId,cityName,employeeId,employeeName',
                maxSize: 100,
                orderBy: 'startDate',
                order: 'desc'
            });
        },

        loadOtherDocumentRecords: function () {
            if (!this.employeeRecord || !this.employeeRecord.id) {
                return Promise.resolve({ list: [] });
            }

            return Espo.Ajax.getRequest('CEmployeeDocuments', {
                where: [{ type: 'equals', attribute: 'employeeId', value: this.employeeRecord.id }],
                select: 'id,name,description,attachmentId,attachmentName,employeeId,employeeName',
                maxSize: 100,
                orderBy: 'createdAt',
                order: 'desc'
            });
        },

        loadContactTypeOptions: function () {
            var self = this;

            return Espo.Ajax.getRequest('CContactType', {
                select: 'id,name,isActive,employeeContactId,employeeContactName',
                maxSize: 200,
                orderBy: 'name',
                order: 'asc'
            }).then(function (response) {
                response = response || {};
                response.list = self.mapContactTypeOptions(response.list || []);

                return response;
            }).catch(function (err) {
                console.error('CContactType fetch error:', err);

                return { list: [] };
            });
        },

        loadWorkRoleOptions: function () {
            var self = this;

            return Espo.Ajax.getRequest('CWorkRole', {
                select: 'id,name,isActive',
                maxSize: 200,
                orderBy: 'name',
                order: 'asc'
            }).then(function (response) {
                response = response || {};
                response.list = self.mapSimpleOptions(response.list || []);

                return response;
            }).catch(function (err) {
                console.error('CWorkRole fetch error:', err);

                return { list: [] };
            });
        },

        loadCountryOptions: function () {
            var self = this;

            return Espo.Ajax.getRequest('CCountry', {
                select: 'id,name,isActive',
                maxSize: 200,
                orderBy: 'name',
                order: 'asc'
            }).then(function (response) {
                response = response || {};
                response.list = self.mapSimpleOptions(response.list || []);

                return response;
            }).catch(function (err) {
                console.error('CCountry fetch error:', err);

                return { list: [] };
            });
        },

        loadStateOptions: function (countryId) {
            var self = this;

            if (!countryId) {
                return Promise.resolve({ list: [] });
            }

            return Espo.Ajax.getRequest('CState', {
                where: [{ type: 'equals', attribute: 'countryId', value: countryId }],
                select: 'id,name,isActive,countryId',
                maxSize: 200,
                orderBy: 'name',
                order: 'asc'
            }).then(function (response) {
                response = response || {};
                response.list = self.mapSimpleOptions(response.list || []);

                return response;
            }).catch(function (err) {
                console.error('CState fetch error:', err);

                return { list: [] };
            });
        },

        loadCityOptions: function (stateId) {
            var self = this;

            if (!stateId) {
                return Promise.resolve({ list: [] });
            }

            return Espo.Ajax.getRequest('CCity', {
                where: [{ type: 'equals', attribute: 'stateId', value: stateId }],
                select: 'id,name,isActive,stateId',
                maxSize: 200,
                orderBy: 'name',
                order: 'asc'
            }).then(function (response) {
                response = response || {};
                response.list = self.mapSimpleOptions(response.list || []);

                return response;
            }).catch(function (err) {
                console.error('CCity fetch error:', err);

                return { list: [] };
            });
        },

        loadDependantRelationOptions: function () {
            var self = this;

            return Espo.Ajax.getRequest('CDependantRelation', {
                select: 'id,name,isActive',
                maxSize: 200,
                orderBy: 'name',
                order: 'asc'
            }).then(function (response) {
                response = response || {};
                response.list = self.mapDependantRelationOptions(response.list || []);

                return response;
            }).catch(function (err) {
                console.error('CDependantRelation fetch error:', err);

                return { list: [] };
            });
        },

        // Normalize dropdown option lists.
        mapContactTypeOptions: function (list) {
            return (list || []).filter(function (record) {
                if (!record) {
                    return false;
                }

                if (record.isActive === false) {
                    return false;
                }

                return !!record.name;
            }).map(function (record) {
                return {
                    id: record.id,
                    name: record.name || '',
                    isActive: record.isActive,
                    employeeContactId: record.employeeContactId || null,
                    employeeContactName: record.employeeContactName || ''
                };
            });
        },

        mapDependantRelationOptions: function (list) {
            return (list || []).filter(function (record) {
                if (!record) {
                    return false;
                }

                if (record.isActive === false) {
                    return false;
                }

                return !!record.name;
            }).map(function (record) {
                return {
                    id: record.id,
                    name: record.name || '',
                    isActive: record.isActive
                };
            });
        },

        mapSimpleOptions: function (list) {
            return (list || []).filter(function (record) {
                if (!record) {
                    return false;
                }

                if (record.isActive === false) {
                    return false;
                }

                return !!record.name;
            }).map(function (record) {
                return {
                    id: record.id,
                    name: record.name || '',
                    isActive: record.isActive
                };
            });
        },

        // Normalize records before rendering them in the template.
        normalizeContactRecord: function (record) {
            var contact = record || {};
            var ids = contact.contactTypesIds || [];
            var namesMap = contact.contactTypesNames || {};
            var names = [];

            ids.forEach(function (id) {
                if (namesMap[id]) {
                    names.push(namesMap[id]);
                }
            });

            if (!names.length && Array.isArray(contact.contactTypes)) {
                contact.contactTypes.forEach(function (item) {
                    if (item && item.name) {
                        names.push(item.name);
                    }
                });
            }

            contact.contactTypesText = names.join(', ');
            contact.contactValue = contact.no || contact.description || '';
            contact.displayType = contact.contactTypesText || contact.name || '';
            contact.iconClass = this.getContactIconClass(contact.displayType, contact.contactValue);

            return contact;
        },

        normalizeDependentRecord: function (record) {
            var dependent = record || {};
            var firstName = dependent.name || '';
            var lastName = dependent.lastName || '';
            var fullName = [firstName, lastName].filter(Boolean).join(' ');

            dependent.fullName = fullName || firstName || '--';
            dependent.relationName = dependent.dependantRelationName || dependent.relationName || '';
            dependent.phoneValue = dependent.emergencyContactNumber || dependent.no || '';

            return dependent;
        },

        normalizeExperienceRecord: function (record) {
            var experience = record || {};

            experience.displayCompanyName = experience.companyName || experience.name || '--';
            experience.displayWorkRole = experience.workRoleName || '--';
            experience.displayAddress = experience.companyAddress || '--';
            experience.displayPeriod = this.formatExperiencePeriod(experience.startDate, experience.endDate);

            return experience;
        },

        normalizeOtherDocumentRecord: function (record) {
            var doc = record || {};
            var attachmentId = this.extractAttachmentId(doc);

            doc.attachmentResolvedId = attachmentId;
            doc.fileName = doc.attachmentName || '';
            doc.downloadUrl = attachmentId ? ('?entryPoint=download&id=' + attachmentId) : '';

            return doc;
        },

        formatExperiencePeriod: function (startDate, endDate) {
            var startText = startDate || '--';
            var endText = endDate || 'Present';

            return startText + ' to ' + endText;
        },

        getContactIconClass: function (contactType, value) {
            var type = String(contactType || '').toLowerCase();
            var text = String(value || '').toLowerCase();

            if (text.indexOf('@') !== -1 || type.indexOf('mail') !== -1 || type.indexOf('email') !== -1) {
                return 'fa fa-at';
            }

            if (type.indexOf('whatsapp') !== -1) {
                return 'fa fa-whatsapp';
            }

            if (type.indexOf('linkedin') !== -1) {
                return 'fa fa-linkedin';
            }

            if (type.indexOf('skype') !== -1) {
                return 'fa fa-skype';
            }

            if (type.indexOf('mobile') !== -1 || type.indexOf('phone') !== -1 || type.indexOf('contact') !== -1) {
                return 'fa fa-mobile';
            }

            return 'fa fa-phone';
        },

        // Build display-ready collections for the UI.
        prepareContactRecords: function () {
            var self = this;

            return (this.contactRecords || []).map(function (record) {
                return self.normalizeContactRecord(record);
            });
        },

        prepareDependentRecords: function () {
            var self = this;

            return (this.dependentRecords || []).map(function (record) {
                return self.normalizeDependentRecord(record);
            });
        },

        prepareExperienceRecords: function () {
            var self = this;

            return (this.experienceRecords || []).map(function (record) {
                return self.normalizeExperienceRecord(record);
            });
        },

        prepareOtherDocumentRecords: function () {
            var self = this;

            return (this.otherDocumentRecords || []).map(function (record) {
                return self.normalizeOtherDocumentRecord(record);
            });
        },

        escapeHtml: function (value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        },

        getContactById: function (contactId) {
            return (this.contactRecords || []).find(function (item) {
                return item.id === contactId;
            }) || null;
        },

        // Refresh list sections after create, update, or delete.
        refreshContactRecords: function (options) {
            var self = this;
            options = options || {};

            if (options.preserveTab !== false) {
                self.rememberActiveTabs();
            }

            return self.loadContactRecords().then(function (response) {
                self.contactRecords = ((response && response.list) || []).map(function (record) {
                    return self.normalizeContactRecord(record);
                });
                self.reRender();
            });
        },

        refreshDependentRecords: function (options) {
            var self = this;
            options = options || {};

            if (options.preserveTab !== false) {
                self.rememberActiveTabs();
            }

            return self.loadDependentRecords().then(function (response) {
                self.dependentRecords = ((response && response.list) || []).map(function (record) {
                    return self.normalizeDependentRecord(record);
                });
                self.reRender();
            });
        },

        refreshExperienceRecords: function (options) {
            var self = this;
            options = options || {};

            if (options.preserveTab !== false) {
                self.rememberActiveTabs();
            }

            return self.loadExperienceRecords().then(function (response) {
                self.experienceRecords = ((response && response.list) || []).map(function (record) {
                    return self.normalizeExperienceRecord(record);
                });
                self.reRender();
            });
        },

        refreshOtherDocumentRecords: function (options) {
            var self = this;
            options = options || {};

            if (options.preserveTab !== false) {
                self.rememberActiveTabs();
            }

            return self.loadOtherDocumentRecords().then(function (response) {
                self.otherDocumentRecords = ((response && response.list) || []).map(function (record) {
                    return self.normalizeOtherDocumentRecord(record);
                });
                self.reRender();
            });
        },

        // Keep CContactType linked to the selected contact record.
        syncContactTypeLink: function (contactId, contactName, selectedTypeId, previousTypeId) {
            var requests = [];

            if (previousTypeId && previousTypeId !== selectedTypeId) {
                requests.push(
                    Espo.Ajax.putRequest('CContactType/' + previousTypeId, {
                        employeeContactId: null,
                        employeeContactName: null
                    })
                );
            }

            if (selectedTypeId) {
                requests.push(
                    Espo.Ajax.putRequest('CContactType/' + selectedTypeId, {
                        employeeContactId: contactId,
                        employeeContactName: contactName
                    })
                );
            }

            if (!requests.length) {
                return Promise.resolve();
            }

            return Promise.all(requests);
        },

        unlinkContactTypeLinks: function (contact) {
            var ids = (contact && contact.contactTypesIds) || [];

            if (!ids.length) {
                return Promise.resolve();
            }

            return Promise.all(ids.map(function (id) {
                return Espo.Ajax.putRequest('CContactType/' + id, {
                    employeeContactId: null,
                    employeeContactName: null
                });
            }));
        },

        getDependentById: function (dependentId) {
            return (this.dependentRecords || []).find(function (item) {
                return item.id === dependentId;
            }) || null;
        },

        getExperienceById: function (experienceId) {
            return (this.experienceRecords || []).find(function (item) {
                return item.id === experienceId;
            }) || null;
        },

        getOtherDocumentById: function (documentId) {
            return (this.otherDocumentRecords || []).find(function (item) {
                return item.id === documentId;
            }) || null;
        },

        rememberActiveTabs: function () {
            var $main = this.$el.find('.profile-main-tab.active');
            var $sub = this.$el.find('.profile-subnav-item.active');

            if ($main.length) {
                this.activeMainTab = $main.attr('data-main-tab');
            }

            if ($sub.length) {
                this.activeSubTab = $sub.attr('data-sub-tab');
            }
        },

        // Contact CRUD actions.
        openContactModal: function (contact) {
            var self = this;
            var contactData = self.normalizeContactRecord(contact || {});
            var isEdit = !!contactData.id;
            var contactTypes = this.contactTypeOptions || [];
            var selectedIds = contactData.contactTypesIds || [];
            var selectedTypeId = selectedIds.length ? selectedIds[0] : '';
            var optionHtml = contactTypes.map(function (item) {
                var selected = item.id === selectedTypeId ? ' selected' : '';

                return '<option value="' + self.escapeHtml(item.id) + '"' + selected + '>' +
                    self.escapeHtml(item.name) +
                    '</option>';
            }).join('');
            var tag = contactData.contactTag || '';
            var formHtml = '<div style="padding:28px 34px;background:#fff;">' +
                '<form id="contactEditForm" novalidate>' +
                '<div style="max-width:430px;">' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Contact Type</label>' +
                '<select id="contact-type" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;background:#fff;">' +
                '<option value="">Select Contact Type</option>' + optionHtml +
                '</select>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Contact Tag</label>' +
                '<select id="contact-tag" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;background:#fff;">' +
                '<option value="">Select Contact Tag</option>' +
                '<option value="Work/Business"' + (tag === 'Work/Business' ? ' selected' : '') + '>Work/Business</option>' +
                '<option value="Personal"' + (tag === 'Personal' ? ' selected' : '') + '>Personal</option>' +
                '<option value="Other"' + (tag === 'Other' ? ' selected' : '') + '>Other</option>' +
                '</select>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Enter Details</label>' +
                '<input type="text" id="contact-no" value="' + self.escapeHtml(contactData.no || '') + '" placeholder="" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;" />' +
                '</div>' +
                '<div id="contact-form-error" style="color:#d93025;font-size:13px;margin-top:-6px;margin-bottom:14px;display:none;"></div>' +
                '<div style="display:flex;align-items:center;gap:14px;">' +
                '<button type="submit" id="contactSaveBtn" style="min-width:98px;height:40px;padding:0 20px;background:#1577d3;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:600;">' + (isEdit ? 'UPDATE' : 'SAVE') + '</button>' +
                '<button type="button" id="contactCancelBtn" style="height:40px;padding:0 14px;border:none;background:transparent;color:#444;cursor:pointer;font-size:14px;font-weight:500;letter-spacing:.4px;">CANCEL</button>' +
                '</div>' +
                '</div></form></div>';

            var modal = self.simpleModal(isEdit ? 'Edit Contact' : 'Add Contact', formHtml);
            var $modal = $('#' + modal.modalId);

            $modal.find('#contactCancelBtn').on('click', function () {
                modal.closeModal();
            });

            $modal.find('#contactEditForm').on('submit', function (e) {
                e.preventDefault();

                var selectedTypeId = $modal.find('#contact-type').val();
                var selectedType = contactTypes.find(function (item) {
                    return item.id === selectedTypeId;
                }) || null;
                var noValue = $modal.find('#contact-no').val().trim();
                var contactTag = $modal.find('#contact-tag').val();
                var error = '';

                $modal.find('#contact-type, #contact-no').css('border-color', '#d7dde5');
                $modal.find('#contact-form-error').hide();

                if (!self.employeeRecord || !self.employeeRecord.id) {
                    error = 'Employee record not found. Please contact admin.';
                } else if (!selectedTypeId) {
                    error = 'Contact Type is required.';
                    $modal.find('#contact-type').css('border-color', 'red').focus();
                } else if (!noValue) {
                    error = 'Enter Details is required.';
                    $modal.find('#contact-no').css('border-color', 'red').focus();
                }

                if (error) {
                    $modal.find('#contact-form-error').text(error).show();
                    return;
                }

                var payload = {
                    name: selectedType ? selectedType.name : (contactData.name || ''),
                    no: noValue,
                    description: noValue,
                    contactTag: contactTag,
                    employeeId: self.employeeRecord.id,
                    employeeName: self.employeeRecord.name || self.userData.name || (selectedType ? selectedType.name : ''),
                    assignedUserId: self.userData.id
                };
                var request = isEdit
                    ? Espo.Ajax.putRequest('CEmployeeContact/' + contactData.id, payload)
                    : Espo.Ajax.postRequest('CEmployeeContact', payload);
                var $saveBtn = $modal.find('#contactSaveBtn');

                $saveBtn.prop('disabled', true).text(isEdit ? 'Updating...' : 'Saving...');

                request.then(function (savedContact) {
                    var savedId = (savedContact && savedContact.id) || contactData.id;
                    var savedName = payload.name;

                    return self.syncContactTypeLink(
                        savedId,
                        savedName,
                        selectedTypeId,
                        selectedIds.length ? selectedIds[0] : null
                    ).then(function () {
                        return self.loadContactTypeOptions().then(function (response) {
                            self.contactTypeOptions = response.list || [];
                        }).then(function () {
                            self.rememberActiveTabs();

                            return self.refreshContactRecords({ preserveTab: false }).then(function () {
                                self.showAvatarToast(isEdit ? 'Contact updated successfully!' : 'Contact added successfully!', 'success');
                                modal.closeModal();
                                self.handleProfileCompletionUpdate();
                            });
                        });
                    });
                }).catch(function (err) {
                    console.error('Contact save error:', err);
                    $modal.find('#contact-form-error').text('Failed to save contact. Please try again.').show();
                }).finally(function () {
                    $saveBtn.prop('disabled', false).text(isEdit ? 'Update' : 'Save');
                });
            });
        },

        actionAddContact: function () {
            var self = this;

            this.loadContactTypeOptions().then(function (response) {
                self.contactTypeOptions = response.list || [];
                self.openContactModal();
            });
        },

        actionEditContact: function (e) {
            var self = this;
            var contactId = $(e.currentTarget).attr('data-record-id');
            var contact = this.getContactById(contactId);

            if (!contact) {
                self.showAvatarToast('Contact record not found.', 'error');
                return;
            }

            this.loadContactTypeOptions().then(function (response) {
                self.contactTypeOptions = response.list || [];
                self.openContactModal(contact);
            });
        },

        actionDeleteContact: function (e) {
            var self = this;
            var contactId = $(e.currentTarget).attr('data-record-id');
            var contact = this.getContactById(contactId);

            if (!contact) {
                self.showAvatarToast('Contact record not found.', 'error');
                return;
            }

            if (!window.confirm('Delete this contact?')) {
                return;
            }

            self.rememberActiveTabs();

            self.unlinkContactTypeLinks(contact).then(function () {
                return Espo.Ajax.deleteRequest('CEmployeeContact/' + contactId);
            }).then(function () {
                return self.loadContactTypeOptions().then(function (response) {
                    self.contactTypeOptions = response.list || [];
                }).then(function () {
                    return self.refreshContactRecords({ preserveTab: false }).then(function () {
                        self.showAvatarToast('Contact deleted successfully!', 'success');
                    });
                });
            }).catch(function (err) {
                console.error('Contact delete error:', err);
                self.showAvatarToast('Failed to delete contact. Please try again.', 'error');
            });
        },

        // Dependent CRUD actions.
        openDependentModal: function (dependent) {
            var self = this;
            var dependentData = self.normalizeDependentRecord(dependent || {});
            var isEdit = !!dependentData.id;
            var relationOptions = this.dependantRelationOptions || [];
            var selectedRelationId = dependentData.dependantRelationId || '';
            var optionHtml = relationOptions.map(function (item) {
                var selected = item.id === selectedRelationId ? ' selected' : '';

                return '<option value="' + self.escapeHtml(item.id) + '"' + selected + '>' +
                    self.escapeHtml(item.name) +
                    '</option>';
            }).join('');
            var formHtml = '<div style="padding:28px 34px;background:#fff;">' +
                '<form id="dependentEditForm" novalidate>' +
                '<div style="max-width:430px;">' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Dependents</label>' +
                '<select id="dependent-relation" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;background:#fff;">' +
                '<option value="">Select Dependents</option>' + optionHtml +
                '</select>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">First Name</label>' +
                '<input type="text" id="dependent-name" value="' + self.escapeHtml(dependentData.name || '') + '" placeholder="First Name" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;" />' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Last Name(Optional)</label>' +
                '<input type="text" id="dependent-lastName" value="' + self.escapeHtml(dependentData.lastName || '') + '" placeholder="Last Name" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;" />' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Emergency contact number</label>' +
                '<input type="text" id="dependent-emergencyContactNumber" value="' + self.escapeHtml(dependentData.emergencyContactNumber || '') + '" placeholder="" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;" />' +
                '</div>' +
                '<div id="dependent-form-error" style="color:#d93025;font-size:13px;margin-top:-6px;margin-bottom:14px;display:none;"></div>' +
                '<div style="display:flex;align-items:center;gap:14px;">' +
                '<button type="submit" id="dependentSaveBtn" style="min-width:98px;height:40px;padding:0 20px;background:#1577d3;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:600;">' + (isEdit ? 'UPDATE' : 'SAVE') + '</button>' +
                '<button type="button" id="dependentCancelBtn" style="height:40px;padding:0 14px;border:none;background:transparent;color:#444;cursor:pointer;font-size:14px;font-weight:500;letter-spacing:.4px;">CANCEL</button>' +
                '</div>' +
                '</div></form></div>';

            var modal = self.simpleModal(isEdit ? 'Edit Dependent' : 'Add Dependent', formHtml);
            var $modal = $('#' + modal.modalId);

            $modal.find('#dependentCancelBtn').on('click', function () {
                modal.closeModal();
            });

            $modal.on('change', '#dependent-relation', function (event) {
                var selectedRelationId = event.currentTarget.value;
                var selectedRelation = relationOptions.find(function (item) {
                    return item.id === selectedRelationId;
                }) || null;
                var dependentName = $modal.find('#dependent-name').val().trim();
                var dependentLastName = $modal.find('#dependent-lastName').val().trim();
                var emergencyContactNumber = $modal.find('#dependent-emergencyContactNumber').val().trim();
                var error = '';

                $modal.find('#dependent-relation, #dependent-name, #dependent-emergencyContactNumber').css('border-color', '#d7dde5');
                $modal.find('#dependent-form-error').hide();

                if (!self.employeeRecord || !self.employeeRecord.id) {
                    error = 'Employee record not found. Please contact admin.';
                } else if (!selectedRelationId) {
                    error = 'Dependent relation is required.';
                    $modal.find('#dependent-relation').css('border-color', 'red').focus();
                } else if (!dependentName) {
                    error = 'First Name is required.';
                    $modal.find('#dependent-name').css('border-color', 'red').focus();
                } else if (!emergencyContactNumber) {
                    error = 'Emergency contact number is required.';
                    $modal.find('#dependent-emergencyContactNumber').css('border-color', 'red').focus();
                }

                if (error) {
                    $modal.find('#dependent-form-error').text(error).show();
                    return;
                }

                var payload = {
                    name: dependentName,
                    lastName: dependentLastName,
                    emergencyContactNumber: emergencyContactNumber,
                    dependantRelationId: selectedRelationId,
                    dependantRelationName: selectedRelation ? selectedRelation.name : '',
                    employeeId: self.employeeRecord.id,
                    employeeName: self.employeeRecord.name || self.userData.name || dependentName,
                    assignedUserId: self.userData.id,
                    assignedUserName: self.userData.name || ''
                };
                var request = isEdit
                    ? Espo.Ajax.putRequest('CEmployeeDependent/' + dependentData.id, payload)
                    : Espo.Ajax.postRequest('CEmployeeDependent', payload);
                var $saveBtn = $modal.find('#dependentSaveBtn');

                $saveBtn.prop('disabled', true).text(isEdit ? 'Updating...' : 'Saving...');

                request.then(function () {
                    return self.loadDependantRelationOptions().then(function (response) {
                        self.dependantRelationOptions = response.list || [];
                    }).then(function () {
                        self.rememberActiveTabs();

                        return self.refreshDependentRecords({ preserveTab: false }).then(function () {
                            self.showAvatarToast(isEdit ? 'Dependent updated successfully!' : 'Dependent added successfully!', 'success');
                            modal.closeModal();
                            self.handleProfileCompletionUpdate();
                        });
                    });
                }).catch(function (err) {
                    console.error('Dependent save error:', err);
                    $modal.find('#dependent-form-error').text('Failed to save dependent. Please try again.').show();
                }).finally(function () {
                    $saveBtn.prop('disabled', false).text(isEdit ? 'Update' : 'Save');
                });
            });
        },

        actionAddDependent: function () {
            var self = this;

            this.loadDependantRelationOptions().then(function (response) {
                self.dependantRelationOptions = response.list || [];
                self.openDependentModal();
            });
        },

        actionEditDependent: function (e) {
            var self = this;
            var dependentId = $(e.currentTarget).attr('data-record-id');
            var dependent = this.getDependentById(dependentId);

            if (!dependent) {
                self.showAvatarToast('Dependent record not found.', 'error');
                return;
            }

            this.loadDependantRelationOptions().then(function (response) {
                self.dependantRelationOptions = response.list || [];
                self.openDependentModal(dependent);
            });
        },

        actionDeleteDependent: function (e) {
            var self = this;
            var dependentId = $(e.currentTarget).attr('data-record-id');
            var dependent = this.getDependentById(dependentId);

            if (!dependent) {
                self.showAvatarToast('Dependent record not found.', 'error');
                return;
            }

            if (!window.confirm('Delete this dependent?')) {
                return;
            }

            self.rememberActiveTabs();

            Espo.Ajax.deleteRequest('CEmployeeDependent/' + dependentId).then(function () {
                return self.loadDependantRelationOptions().then(function (response) {
                    self.dependantRelationOptions = response.list || [];
                }).then(function () {
                    return self.refreshDependentRecords({ preserveTab: false }).then(function () {
                        self.showAvatarToast('Dependent deleted successfully!', 'success');
                    });
                });
            }).catch(function (err) {
                console.error('Dependent delete error:', err);
                self.showAvatarToast('Failed to delete dependent. Please try again.', 'error');
            });
        },

        // Past experience CRUD actions.
        openExperienceModal: function (experience) {
            var self = this;
            var experienceData = self.normalizeExperienceRecord(experience || {});
            var isEdit = !!experienceData.id;
            var workRoleOptions = this.workRoleOptions || [];
            var countryOptions = this.countryOptions || [];
            var workRoleHtml = workRoleOptions.map(function (item) {
                var selected = item.id === experienceData.workRoleId ? ' selected' : '';

                return '<option value="' + self.escapeHtml(item.id) + '"' + selected + '>' + self.escapeHtml(item.name) + '</option>';
            }).join('');
            var countryHtml = countryOptions.map(function (item) {
                var selected = item.id === experienceData.countryId ? ' selected' : '';

                return '<option value="' + self.escapeHtml(item.id) + '"' + selected + '>' + self.escapeHtml(item.name) + '</option>';
            }).join('');
            var formHtml = '<div style="padding:28px 34px;background:#fff;">' +
                '<form id="experienceEditForm" novalidate>' +
                '<div style="max-width:430px;">' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Company name</label>' +
                '<input type="text" id="experience-companyName" value="' + self.escapeHtml(experienceData.companyName || '') + '" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;" />' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Start Date</label>' +
                '<input type="date" id="experience-startDate" value="' + self.escapeHtml(experienceData.startDate || '') + '" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;" />' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">End Date (Optional)</label>' +
                '<input type="date" id="experience-endDate" value="' + self.escapeHtml(experienceData.endDate || '') + '" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;" />' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Select Work Role</label>' +
                '<select id="experience-workRole" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;background:#fff;">' +
                '<option value="">Select Work Role</option>' + workRoleHtml +
                '</select>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Company Address</label>' +
                '<textarea id="experience-companyAddress" rows="3" style="width:100%;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;resize:vertical;">' + self.escapeHtml(experienceData.companyAddress || '') + '</textarea>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Select Country</label>' +
                '<select id="experience-country" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;background:#fff;">' +
                '<option value="">Select Country</option>' + countryHtml +
                '</select>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Select State</label>' +
                '<select id="experience-state" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;background:#fff;" disabled>' +
                '<option value="">Select State</option>' +
                '</select>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Select City</label>' +
                '<select id="experience-city" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;background:#fff;" disabled>' +
                '<option value="">Select City</option>' +
                '</select>' +
                '</div>' +
                '<div id="experience-form-error" style="color:#d93025;font-size:13px;margin-top:-6px;margin-bottom:14px;display:none;"></div>' +
                '<div style="display:flex;align-items:center;gap:14px;">' +
                '<button type="submit" id="experienceSaveBtn" style="min-width:98px;height:40px;padding:0 20px;background:#1577d3;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:600;">' + (isEdit ? 'UPDATE' : 'SAVE') + '</button>' +
                '<button type="button" id="experienceCancelBtn" style="height:40px;padding:0 14px;border:none;background:transparent;color:#444;cursor:pointer;font-size:14px;font-weight:500;letter-spacing:.4px;">CANCEL</button>' +
                '</div>' +
                '</div></form></div>';

            var modal = self.simpleModal(isEdit ? 'Edit Past Experience' : 'Add Past Experience', formHtml);
            var $modal = $('#' + modal.modalId);

            function setOptions($select, items, selectedId, placeholder) {
                $select.empty().append('<option value="">' + placeholder + '</option>');
                (items || []).forEach(function (item) {
                    var selected = item.id === selectedId ? ' selected' : '';
                    $select.append('<option value="' + self.escapeHtml(item.id) + '"' + selected + '>' + self.escapeHtml(item.name) + '</option>');
                });
                $select.prop('disabled', !(items || []).length);
            }

            function loadExperienceStates(countryId, selectedStateId, selectedCityId) {
                var $state = $modal.find('#experience-state');
                var $city = $modal.find('#experience-city');

                setOptions($state, [], null, 'Loading...');
                setOptions($city, [], null, 'Select City');

                if (!countryId) {
                    setOptions($state, [], null, 'Select State');
                    setOptions($city, [], null, 'Select City');
                    return Promise.resolve();
                }

                return self.loadStateOptions(countryId).then(function (response) {
                    setOptions($state, response.list || [], selectedStateId, 'Select State');

                    if (selectedStateId) {
                        return loadExperienceCities(selectedStateId, selectedCityId);
                    }
                });
            }

            function loadExperienceCities(stateId, selectedCityId) {
                var $city = $modal.find('#experience-city');

                setOptions($city, [], null, 'Loading...');

                if (!stateId) {
                    setOptions($city, [], null, 'Select City');
                    return Promise.resolve();
                }

                return self.loadCityOptions(stateId).then(function (response) {
                    setOptions($city, response.list || [], selectedCityId, 'Select City');
                });
            }

            $modal.find('#experienceCancelBtn').on('click', function () {
                modal.closeModal();
            });

            $modal.on('change', '#experience-country', function () {
                loadExperienceStates($(this).val(), null, null);
            });

            $modal.on('change', '#experience-state', function () {
                loadExperienceCities($(this).val(), null);
            });

            if (experienceData.countryId) {
                loadExperienceStates(experienceData.countryId, experienceData.stateId || null, experienceData.cityId || null);
            }

            $modal.find('#experienceEditForm').on('submit', function (e) {
                e.preventDefault();

                var companyName = $modal.find('#experience-companyName').val().trim();
                var startDate = $modal.find('#experience-startDate').val();
                var endDate = $modal.find('#experience-endDate').val();
                var workRoleId = $modal.find('#experience-workRole').val();
                var companyAddress = $modal.find('#experience-companyAddress').val().trim();
                var countryId = $modal.find('#experience-country').val();
                var stateId = $modal.find('#experience-state').val();
                var cityId = $modal.find('#experience-city').val();
                var workRole = workRoleOptions.find(function (item) { return item.id === workRoleId; }) || null;
                var error = '';

                $modal.find('#experience-companyName, #experience-startDate, #experience-workRole, #experience-companyAddress, #experience-country, #experience-state, #experience-city').css('border-color', '#d7dde5');
                $modal.find('#experience-form-error').hide();

                if (!self.employeeRecord || !self.employeeRecord.id) {
                    error = 'Employee record not found. Please contact admin.';
                } else if (!companyName) {
                    error = 'Company name is required.';
                    $modal.find('#experience-companyName').css('border-color', 'red').focus();
                } else if (!startDate) {
                    error = 'Start Date is required.';
                    $modal.find('#experience-startDate').css('border-color', 'red').focus();
                } else if (!workRoleId) {
                    error = 'Work Role is required.';
                    $modal.find('#experience-workRole').css('border-color', 'red').focus();
                } else if (!companyAddress) {
                    error = 'Company Address is required.';
                    $modal.find('#experience-companyAddress').css('border-color', 'red').focus();
                } else if (!countryId) {
                    error = 'Country is required.';
                    $modal.find('#experience-country').css('border-color', 'red').focus();
                } else if (!stateId) {
                    error = 'State is required.';
                    $modal.find('#experience-state').css('border-color', 'red').focus();
                } else if (!cityId) {
                    error = 'City is required.';
                    $modal.find('#experience-city').css('border-color', 'red').focus();
                }

                if (error) {
                    $modal.find('#experience-form-error').text(error).show();
                    return;
                }

                var payload = {
                    name: companyName,
                    companyName: companyName,
                    startDate: startDate,
                    endDate: endDate,
                    workRoleId: workRoleId,
                    workRoleName: workRole ? workRole.name : '',
                    companyAddress: companyAddress,
                    countryId: countryId,
                    countryName: $modal.find('#experience-country option:selected').text(),
                    stateId: stateId,
                    stateName: $modal.find('#experience-state option:selected').text(),
                    cityId: cityId,
                    cityName: $modal.find('#experience-city option:selected').text(),
                    employeeId: self.employeeRecord.id,
                    employeeName: self.employeeRecord.name || self.userData.name || companyName
                };

                if (!isEdit) {
                    payload.assignedUserId = self.userData.id;
                    payload.assignedUserName = self.userData.name || '';
                }

                var request = isEdit
                    ? Espo.Ajax.putRequest('CEmployeePastExperience/' + experienceData.id, payload)
                    : Espo.Ajax.postRequest('CEmployeePastExperience', payload);
                var $saveBtn = $modal.find('#experienceSaveBtn');

                $saveBtn.prop('disabled', true).text(isEdit ? 'Updating...' : 'Saving...');

                request.then(function () {
                    return Promise.all([
                        self.loadWorkRoleOptions(),
                        self.loadCountryOptions()
                    ]).then(function (responses) {
                        self.workRoleOptions = responses[0].list || [];
                        self.countryOptions = responses[1].list || [];
                    }).then(function () {
                        self.rememberActiveTabs();

                        return self.refreshExperienceRecords({ preserveTab: false }).then(function () {
                            self.showAvatarToast(isEdit ? 'Past experience updated successfully!' : 'Past experience added successfully!', 'success');
                            modal.closeModal();
                        });
                    });
                }).catch(function (err) {
                    console.error('Experience save error:', err);
                    $modal.find('#experience-form-error').text(typeof err === 'string' ? err : 'Failed to save past experience. Please try again.').show();
                }).finally(function () {
                    $saveBtn.prop('disabled', false).text(isEdit ? 'Update' : 'Save');
                });
            });
        },

        actionAddExperience: function () {
            var self = this;

            Promise.all([
                this.loadWorkRoleOptions(),
                this.loadCountryOptions()
            ]).then(function (responses) {
                self.workRoleOptions = responses[0].list || [];
                self.countryOptions = responses[1].list || [];
                self.openExperienceModal();
            });
        },

        actionEditExperience: function (e) {
            var self = this;
            var experienceId = $(e.currentTarget).attr('data-record-id');
            var experience = this.getExperienceById(experienceId);

            if (!experience) {
                self.showAvatarToast('Past experience record not found.', 'error');
                return;
            }

            Promise.all([
                this.loadWorkRoleOptions(),
                this.loadCountryOptions()
            ]).then(function (responses) {
                self.workRoleOptions = responses[0].list || [];
                self.countryOptions = responses[1].list || [];
                self.openExperienceModal(experience);
            });
        },

        actionDeleteExperience: function (e) {
            var self = this;
            var experienceId = $(e.currentTarget).attr('data-record-id');
            var experience = this.getExperienceById(experienceId);

            if (!experience) {
                self.showAvatarToast('Past experience record not found.', 'error');
                return;
            }

            if (!window.confirm('Delete this past experience?')) {
                return;
            }

            self.rememberActiveTabs();

            Espo.Ajax.deleteRequest('CEmployeePastExperience/' + experienceId).then(function () {
                return self.refreshExperienceRecords({ preserveTab: false }).then(function () {
                    self.showAvatarToast('Past experience deleted successfully!', 'success');
                });
            }).catch(function (err) {
                console.error('Experience delete error:', err);
                self.showAvatarToast('Failed to delete past experience. Please try again.', 'error');
            });
        },

        openOtherDocumentModal: function (doc) {
            var self = this;
            var docData = self.normalizeOtherDocumentRecord(doc || {});
            var isEdit = !!docData.id;
            var formHtml = '<div style="padding:28px 34px;background:#fff;">' +
                '<form id="otherDocumentEditForm" novalidate>' +
                '<div style="max-width:430px;">' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Document\'s Name</label>' +
                '<input type="text" id="other-document-name" value="' + self.escapeHtml(docData.name || '') + '" style="width:100%;height:38px;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;" />' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Description</label>' +
                '<textarea id="other-document-description" rows="3" style="width:100%;padding:8px 12px;border:1px solid #d7dde5;border-radius:3px;font-size:14px;color:#333;box-sizing:border-box;resize:vertical;">' + self.escapeHtml(docData.description || '') + '</textarea>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:14px;font-weight:600;color:#2d8ae3;margin-bottom:8px;">Attachment</label>' +
                '<input type="file" id="other-document-file" style="width:100%;padding:8px 0;font-size:14px;color:#333;box-sizing:border-box;" />' +
                '<div style="font-size:12px;color:#9aa2af;margin-top:8px;">Supported files up to 10 MB.</div>' +
                (docData.fileName ? '<div id="other-document-current-file" style="margin-top:10px;font-size:13px;color:#475569;">Current file: ' + self.escapeHtml(docData.fileName) + '</div>' : '') +
                '</div>' +
                '<div id="other-document-form-error" style="color:#d93025;font-size:13px;margin-top:-6px;margin-bottom:14px;display:none;"></div>' +
                '<div style="display:flex;align-items:center;gap:14px;">' +
                '<button type="submit" id="otherDocumentSaveBtn" style="min-width:98px;height:40px;padding:0 20px;background:#1577d3;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:600;">' + (isEdit ? 'UPDATE' : 'SAVE') + '</button>' +
                '<button type="button" id="otherDocumentCancelBtn" style="height:40px;padding:0 14px;border:none;background:transparent;color:#444;cursor:pointer;font-size:14px;font-weight:500;letter-spacing:.4px;">CANCEL</button>' +
                '</div>' +
                '</div></form></div>';

            var modal = self.simpleModal(isEdit ? 'Edit Other Document' : 'Add Other Document', formHtml);
            var $modal = $('#' + modal.modalId);

            $modal.find('#otherDocumentCancelBtn').on('click', function () {
                modal.closeModal();
            });

            $modal.find('#otherDocumentEditForm').on('submit', function (e) {
                e.preventDefault();

                var name = $modal.find('#other-document-name').val().trim();
                var description = $modal.find('#other-document-description').val().trim();
                var fileInput = $modal.find('#other-document-file').get(0);
                var selectedFile = fileInput && fileInput.files ? fileInput.files[0] : null;
                var error = '';

                $modal.find('#other-document-name').css('border-color', '#d7dde5');
                $modal.find('#other-document-form-error').hide();

                if (!self.employeeRecord || !self.employeeRecord.id) {
                    error = 'Employee record not found. Please contact admin.';
                } else if (!name) {
                    error = 'Document name is required.';
                    $modal.find('#other-document-name').css('border-color', 'red').focus();
                } else if (!isEdit && !selectedFile) {
                    error = 'Attachment is required.';
                }

                if (error) {
                    $modal.find('#other-document-form-error').text(error).show();
                    return;
                }

                var $saveBtn = $modal.find('#otherDocumentSaveBtn');
                $saveBtn.prop('disabled', true).text(isEdit ? 'Updating...' : 'Saving...');

                var attachmentPromise = selectedFile
                    ? self.uploadDocumentAttachmentFile(selectedFile, 'CEmployeeDocuments', 'attachment')
                    : Promise.resolve(docData.attachmentResolvedId ? { id: docData.attachmentResolvedId, name: docData.fileName } : null);

                attachmentPromise.then(function (attachmentInfo) {
                    var payload = {
                        name: name,
                        description: description,
                        employeeId: self.employeeRecord.id,
                        employeeName: self.employeeRecord.name || self.userData.name || name,
                        attachmentId: attachmentInfo ? attachmentInfo.id : null,
                        attachmentName: attachmentInfo ? attachmentInfo.name : (docData.fileName || '')
                    };

                    if (!isEdit) {
                        payload.assignedUserId = self.userData.id;
                        payload.assignedUserName = self.userData.name || '';
                    }

                    var request = isEdit
                        ? Espo.Ajax.putRequest('CEmployeeDocuments/' + docData.id, payload)
                        : Espo.Ajax.postRequest('CEmployeeDocuments', payload);

                    return request.then(function () {
                        self.rememberActiveTabs();

                        return self.refreshOtherDocumentRecords({ preserveTab: false }).then(function () {
                            self.showAvatarToast(isEdit ? 'Other document updated successfully!' : 'Other document added successfully!', 'success');
                            modal.closeModal();
                        });
                    });
                }).catch(function (err) {
                    console.error('Other document save error:', err);
                    $modal.find('#other-document-form-error').text(typeof err === 'string' ? err : 'Failed to save document. Please try again.').show();
                }).finally(function () {
                    $saveBtn.prop('disabled', false).text(isEdit ? 'UPDATE' : 'SAVE');
                });
            });
        },

        actionAddOtherDocument: function () {
            this.openOtherDocumentModal();
        },

        actionEditOtherDocument: function (e) {
            var docId = $(e.currentTarget).attr('data-record-id');
            var doc = this.getOtherDocumentById(docId);

            if (!doc) {
                this.showAvatarToast('Other document record not found.', 'error');
                return;
            }

            this.openOtherDocumentModal(doc);
        },

        actionDeleteOtherDocument: function (e) {
            var self = this;
            var docId = $(e.currentTarget).attr('data-record-id');
            var doc = this.getOtherDocumentById(docId);

            if (!doc) {
                self.showAvatarToast('Other document record not found.', 'error');
                return;
            }

            if (!window.confirm('Delete this document?')) {
                return;
            }

            self.rememberActiveTabs();

            Espo.Ajax.deleteRequest('CEmployeeDocuments/' + docId).then(function () {
                return self.refreshOtherDocumentRecords({ preserveTab: false }).then(function () {
                    self.showAvatarToast('Other document deleted successfully!', 'success');
                });
            }).catch(function (err) {
                console.error('Other document delete error:', err);
                self.showAvatarToast('Failed to delete document. Please try again.', 'error');
            });
        },

        actionOpenOtherDocument: function (e) {
            e.preventDefault();

            var docId = $(e.currentTarget).attr('data-record-id');
            var doc = this.getOtherDocumentById(docId);

            if (!doc || !doc.downloadUrl) {
                this.showAvatarToast('Attachment not found.', 'error');
                return;
            }

            window.open(doc.downloadUrl, '_blank', 'noopener');
        },


        // Restore the selected tab after rerendering the view.
        afterRender: function () {
            var mainTab = this.activeMainTab;
            var subTab = this.activeSubTab;

            // This view can re-render multiple times while loading data.
            // Don't remove overlays while a completion modal is active.
            if (!this.profileCompletionModal) {
                this.cleanupTransientModals();
            }

            if (mainTab) {
                this.$el.find('.profile-main-tab').removeClass('active');
                this.$el.find('.profile-main-panel').removeClass('active');
                this.$el.find('[data-main-tab="' + mainTab + '"]').addClass('active');
                this.$el.find('#panel-' + mainTab).addClass('active');
            }

            if (subTab) {
                this.$el.find('.profile-subnav-item').removeClass('active');
                this.$el.find('.profile-sub-panel').removeClass('active');
                this.$el.find('[data-sub-tab="' + subTab + '"]').addClass('active');
                this.$el.find('#sub-' + subTab).addClass('active');
            }

            this.ensureProfileCompletionFlow();
        },

        onRemove: function () {
            this.closeProfileCompletionModal();
            this.cleanupTransientModals();

            if (Dep.prototype.onRemove) {
                Dep.prototype.onRemove.call(this);
            }
        },

        cleanupTransientModals: function () {
            var bodyTop = parseInt($('body').css('top'), 10);

            $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').remove();
            $('body').css({ position: '', top: '', width: '' });

            if (!isNaN(bodyTop) && bodyTop < 0) {
                window.scrollTo(0, bodyTop * -1);
            }
        },

        clearProfileCompletionModalState: function () {
            this.profileCompletionModal = null;
            this.profileCompletionStepKey = null;
        },

        fetchProfileCompletionStatus: function (forceRefresh) {
            var self = this;

            if (!forceRefresh && this.profileCompletionStatus) {
                return Promise.resolve(this.profileCompletionStatus);
            }

            function fetchStatusViaApiUrl() {
                return window.fetch('api/v1/UserEmployee/action/profileCompletionStatus', {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }).then(function (response) {
                    if (!response.ok) {
                        throw new Error('Profile status request failed with code ' + response.status);
                    }

                    return response.json();
                });
            }

            return Espo.Ajax.getRequest('UserEmployee/action/profileCompletionStatus').then(function (status) {
                self.profileCompletionStatus = status || null;
                self.profileCompletionIntroShown = self.isCompletionIntroShown();

                return self.profileCompletionStatus;
            }).catch(function () {
                return fetchStatusViaApiUrl().then(function (status) {
                    self.profileCompletionStatus = status || null;
                    self.profileCompletionIntroShown = self.isCompletionIntroShown();

                    return self.profileCompletionStatus;
                }).catch(function () {
                    return self.profileCompletionStatus;
                });
            });
        },

        ensureProfileCompletionFlow: function (forceRefresh) {
            var self = this;

            if (this.profileCompletionFlowPromise) {
                return this.profileCompletionFlowPromise;
            }

            this.profileCompletionFlowPromise = this.fetchProfileCompletionStatus(forceRefresh).then(function (status) {
                if (!status || !status.isEmployee) {
                    self.closeProfileCompletionModal();
                    return;
                }

                if (status.isComplete) {
                    if (!self.isCompletionDoneAcknowledged()) {
                        self.openProfileCompletionDone();
                        return;
                    }

                    self.closeProfileCompletionModal();
                    return;
                }

                self.clearCompletionDoneAcknowledged();

                if (!self.profileCompletionIntroShown) {
                    self.openProfileCompletionIntro(status);
                    return;
                }

                self.openProfileCompletionStep(status.primaryMissingStep);
            }).finally(function () {
                self.profileCompletionFlowPromise = null;
            });

            return this.profileCompletionFlowPromise;
        },

        handleProfileCompletionUpdate: function () {
            var self = this;

            window.setTimeout(function () {
                self.ensureProfileCompletionFlow(true);
            }, 250);
        },

        getProfileCompletionIntroStorageKey: function () {
            return 'employee-profile-completion-intro:' + this.getUser().id;
        },

        getProfileCompletionDoneStorageKey: function () {
            return 'employee-profile-completion-done:' + this.getUser().id;
        },

        isCompletionIntroShown: function () {
            try {
                return window.sessionStorage.getItem(this.getProfileCompletionIntroStorageKey()) === '1';
            } catch (e) {
                return !!this.profileCompletionIntroShown;
            }
        },

        markCompletionIntroShown: function () {
            this.profileCompletionIntroShown = true;

            try {
                window.sessionStorage.setItem(this.getProfileCompletionIntroStorageKey(), '1');
            } catch (e) {}
        },

        isCompletionDoneAcknowledged: function () {
            try {
                return window.localStorage.getItem(this.getProfileCompletionDoneStorageKey()) === '1';
            } catch (e) {
                return !!this.profileCompletionDoneAck;
            }
        },

        markCompletionDoneAcknowledged: function () {
            this.profileCompletionDoneAck = true;

            try {
                window.localStorage.setItem(this.getProfileCompletionDoneStorageKey(), '1');
            } catch (e) {}
        },

        clearCompletionDoneAcknowledged: function () {
            this.profileCompletionDoneAck = false;

            try {
                window.localStorage.removeItem(this.getProfileCompletionDoneStorageKey());
            } catch (e) {}
        },

        closeProfileCompletionModal: function () {
            if (!this.profileCompletionModal) {
                return;
            }

            var modal = this.profileCompletionModal;
            modal.closeModal();
        },

        openProfileCompletionIntro: function () {
            var self = this;

            if (this.profileCompletionModal || this.profileCompletionIntroShown) {
                return;
            }

            var html = '' +
                '<div style="padding:26px 30px;background:linear-gradient(180deg,#f8fbff 0%,#ffffff 72%);color:#334155;">' +
                    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">' +
                        '<span style="width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#0d2b4e;color:#fff;font-size:14px;">i</span>' +
                        '<span style="font-size:16px;font-weight:700;color:#0f172a;">Mandatory Profile Completion</span>' +
                    '</div>' +
                    '<div style="font-size:15px;line-height:1.7;margin-bottom:16px;">' +
                        'Your profile must be completed before you can continue to other pages.' +
                    '</div>' +
                    '<div style="font-size:14px;line-height:1.8;margin-bottom:22px;">' +
                        'Mandatory sections: Bio Data, Address, Contact, Dependant, and Aadhaar document. Please complete them one by one in this order.' +
                    '</div>' +
                    '<div style="display:flex;justify-content:flex-end;">' +
                        '<button type="button" id="profile-completion-intro-btn" style="padding:10px 20px;background:#0f4b81;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;">Continue</button>' +
                    '</div>' +
                '</div>';

            this.profileCompletionModal = this.simpleModal('Complete Your Profile', html, {
                hideCloseButton: true,
                disableBackdropClose: true,
                onClose: function () {
                    self.clearProfileCompletionModalState();
                }
            });

            $('#' + this.profileCompletionModal.modalId).find('#profile-completion-intro-btn').on('click', function () {
                self.markCompletionIntroShown();
                self.closeProfileCompletionModal();
                self.ensureProfileCompletionFlow(true);
            });
        },

        openProfileCompletionStep: function (step) {
            var self = this;

            if (!step || !step.key) {
                return;
            }

            if (this.profileCompletionModal && this.profileCompletionStepKey === step.key) {
                return;
            }

            this.closeProfileCompletionModal();
            this.profileCompletionStepKey = step.key;

            var html = '' +
                '<div style="padding:26px 30px;background:linear-gradient(180deg,#f8fbff 0%,#ffffff 72%);color:#334155;">' +
                    '<div style="font-size:15px;font-weight:600;color:#0f172a;margin-bottom:10px;">' + this.escapeHtml(step.title || 'Profile Update') + '</div>' +
                    '<div style="font-size:14px;line-height:1.7;margin-bottom:22px;">' + this.escapeHtml(step.message || 'Please complete this section.') + '</div>' +
                    '<div style="display:flex;justify-content:flex-end;">' +
                        '<button type="button" id="profile-completion-step-btn" style="padding:10px 20px;background:#0f4b81;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;">Fill Now</button>' +
                    '</div>' +
                '</div>';

            this.profileCompletionModal = this.simpleModal('Profile Completion Required', html, {
                hideCloseButton: true,
                disableBackdropClose: true,
                onClose: function () {
                    self.clearProfileCompletionModalState();
                }
            });

            $('#' + this.profileCompletionModal.modalId).find('#profile-completion-step-btn').on('click', function () {
                self.closeProfileCompletionModal();
                window.setTimeout(function () {
                    self.runProfileCompletionStep(step);
                }, 60);
            });
        },

        openProfileCompletionDone: function () {
            var self = this;

            if (this.profileCompletionModal && this.profileCompletionStepKey === 'completion-done') {
                return;
            }

            this.closeProfileCompletionModal();
            this.profileCompletionStepKey = 'completion-done';

            var html = '' +
                '<div style="padding:28px 30px;background:linear-gradient(180deg,#f7fcfb 0%,#ffffff 72%);color:#334155;">' +
                    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">' +
                        '<span style="width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#0f7d4a;color:#fff;font-size:16px;">&#10003;</span>' +
                        '<span style="font-size:17px;font-weight:700;color:#0f172a;">Profile Completed</span>' +
                    '</div>' +
                    '<div style="font-size:14px;line-height:1.8;margin-bottom:22px;">' +
                        'Great job. Your mandatory profile details are now complete. Click Done to continue using other pages.' +
                    '</div>' +
                    '<div style="display:flex;justify-content:flex-end;">' +
                        '<button type="button" id="profile-completion-done-btn" style="padding:10px 22px;background:#0f7d4a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;">Done</button>' +
                    '</div>' +
                '</div>';

            this.profileCompletionModal = this.simpleModal('Completion Confirmed', html, {
                hideCloseButton: true,
                disableBackdropClose: true,
                onClose: function () {
                    self.clearProfileCompletionModalState();
                }
            });

            $('#' + this.profileCompletionModal.modalId).find('#profile-completion-done-btn').on('click', function () {
                self.markCompletionDoneAcknowledged();
                self.closeProfileCompletionModal();
            });
        },

        runProfileCompletionStep: function (step) {
            if (!step || !step.key) {
                return;
            }

            if (step.key === 'employee-record') {
                this.showAvatarToast(step.message || 'Employee record is missing. Please contact admin.', 'error');
                return;
            }

            if (step.key === 'bio') {
                this.activateProfileSection('personal-data', 'bio-data');
                this.actionEditAbout();
                return;
            }

            if (step.key === 'address-permanent') {
                this.activateProfileSection('personal-data', 'address');
                this.actionEditPermanentAddress();
                return;
            }

            if (step.key === 'address-current') {
                this.activateProfileSection('personal-data', 'address');
                this.actionEditCurrentAddress();
                return;
            }

            if (step.key === 'contact') {
                this.activateProfileSection('personal-data', 'contact');
                this.actionAddContact();
                return;
            }

            if (step.key === 'dependent') {
                this.activateProfileSection('personal-data', 'dependents');
                this.actionAddDependent();
                return;
            }

            if (step.key === 'document-aadhaar') {
                this.activateProfileSection('documents', 'doc-all');
                this.actionEditAadhaar();
            }
        },

        activateProfileSection: function (mainTab, subTab) {
            this.activeMainTab = mainTab;
            this.activeSubTab = subTab;

            this.$el.find('.profile-main-tab').removeClass('active');
            this.$el.find('.profile-main-panel').removeClass('active');
            this.$el.find('[data-main-tab="' + mainTab + '"]').addClass('active');
            this.$el.find('#panel-' + mainTab).addClass('active');

            this.$el.find('.profile-subnav-item').removeClass('active');
            this.$el.find('.profile-sub-panel').removeClass('active');
            this.$el.find('[data-sub-tab="' + subTab + '"]').addClass('active');
            this.$el.find('#sub-' + subTab).addClass('active');
        },

        // Shared modal renderer used by custom profile forms.

        simpleModal: function (title, htmlContent, options) {
            options = options || {};

            var backdropId = 'helloBackdrop-' + Date.now();
            var modalId    = 'helloModal-' + Date.now();
            var isClosed = false;
            var self = this;

            var backdropHtml = '<div id="' + backdropId + '" style="position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.5);z-index:999;"></div>';

            var modalHtml = '<div id="' + modalId + '" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;width:100%;max-width:650px;">' +
                '<div style="background:white;border-radius:4px;box-shadow:0 3px 12px rgba(0,0,0,0.5);overflow:hidden;width:100%;max-height:90vh;display:flex;flex-direction:column;">' +
                '<div style="padding:20px;border-bottom:1px solid #e9ecef;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
                '<h5 style="margin:0;color:#333;font-weight:500;">' + title + '</h5>' +
                (options.hideCloseButton ? '' : '<button class="modalCloseBtn" style="background:none;border:none;font-size:24px;cursor:pointer;padding:0;color:#333;">&times;</button>') +
                '</div>' +
                '<div style="overflow-y:auto;flex:1;">' + htmlContent + '</div>' +
                '</div></div>';

            this.cleanupTransientModals();

            $(backdropHtml).appendTo('body');
            var $modal = $(modalHtml).appendTo('body');

            var scrollY = window.scrollY;
            $('body').css({ position: 'fixed', top: '-' + scrollY + 'px', width: '100%' });

            function closeModal() {
                if (isClosed) {
                    return;
                }

                isClosed = true;

                $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').fadeOut(200, function () {
                    $(this).remove();
                });
                var scrollTop = parseInt($('body').css('top')) * -1;
                $('body').css({ position: '', top: '', width: '' });
                window.scrollTo(0, scrollTop);

                if (typeof options.onClose === 'function') {
                    options.onClose.call(self);
                }
            }

            if (!options.hideCloseButton) {
                $modal.find('.modalCloseBtn').one('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal();
                });
            }

            $('#' + backdropId).one('click', function (e) {
                if (options.disableBackdropClose) {
                    return;
                }

                if (e.target.id === backdropId) closeModal();
            });

            $modal.on('click', function (e) { e.stopPropagation(); });

            return { modalId: modalId, closeModal: closeModal };
        }
    });
});
