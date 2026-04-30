define('custom:views/cemployee/record/detail', ['views/record/detail'], function (Dep) {
    return Dep.extend({
        template: 'custom:cemployee/record/detail',

        actionAddAddress: function () {
            this.actionEdit();
        },
        events: _.extend({
            'click .side-link': 'onSideLinkClick',
            'click .top-tab': 'onTopTabClick',
            'click [data-action="edit-address-action"]': function (e) { this.onEditAddressModal(e); },
            'click [data-action="add-address-action"]': 'onAddAddressModal',
            'click [data-action="edit-contact-action"]': function (e) { this.onEditContactModal(e); },
            'click [data-action="add-contact-action"]': 'onAddContactModal',
            'click [data-action="edit-dependent-action"]': function (e) { this.onEditDependentModal(e); },
            'click [data-action="add-dependent-action"]': 'onAddDependentModal',
            'click [data-action="edit-past-exp-action"]': 'onEditPastExperienceModal',
            'click [data-action="edit-aadhaar-action"]': 'onEditAadhaarModal',
            'click [data-action="edit-driving-action"]': 'onEditDrivingModal',
            'click [data-action="edit-voter-action"]': 'onEditVoterModal',
            'click .js-edit-aadhar': 'editAadhar',
            'click [data-action="edit-pan-action"]': 'onEditPanModal',
            'click [data-action="edit-passport-action"]': 'onEditPassportModal',
            'click [data-action="edit-bank-action"]': 'onEditBankModal',
            // 'click [data-action="edit-bank-record-action"]': function (e) { this.onEditBankRecordModal(e); },

            'click .changeActiveBank': 'onChangeActiveBankClick',

        }, Dep.prototype.events || {}),

        setup: function () {
            Dep.prototype.setup.call(this);
            this.relatedRecordIds = {};
            this.paneIdRegistry = {};
            this.addressDataMap = {}; // Store address data for quick access when opening edit form
            this.addressRecordStore = {};
            this.addressDataStore = {};
            this.contactData = null;
            this.contactEditModel = null;
            this.dependentData = null;
            this.dependentEditModel = null;
            this.pastExperienceDataMap = {};
            this.pastExperienceEditModel = null;
            this.drivingRecordId = null;
            this.panRecordId = null;
            this.passportRecordId = null;
            this.bankDataMap = {};
            this.bankEditModel = null;
            this.addressData = null;
            this.loadEmployeeBanks(this.model.id);

            this.listenToOnce(this.model, 'sync', function () {
                this.loadAddressData();
            });
            this.listenToOnce(this.model, 'sync', function () {
                this.loadDependentsData();
            });
            this.listenToOnce(this.model, 'sync', function () {
                this.loadPastExperienceData();
            });
            this.listenToOnce(this.model, 'sync', function () {
                this.loadBioData();
            });


        },

        onChangeActiveBankClick: function () {

            var self = this;
            console.log("Employee Banks:", this.employeeBanks);
            if (!this.employeeBanks || this.employeeBanks.length === 0) {
                Espo.Ui.notify('No bank accounts found.', 'warning');
                return;
            }

            let html = `<div style="padding:20px">`;

            this.employeeBanks.forEach(function (bank) {

                let checked = bank.isActive ? 'checked' : '';

                html += `
            <div style="margin-bottom:10px">
                <label>
                    <input type="radio" name="activeBank" value="${bank.id}" ${checked}>
                    <b>${bank.banksName || ''}</b> - ${bank.accountNO}
                </label>
            </div>
        `;
            });

            html += `
        <div style="margin-top:15px">
            <button class="btn btn-primary saveActiveBank">
                Save
            </button>
        </div>
    </div>`;

            this.simpleModal('Change Active Bank', html);

            // ⭐ prevent duplicate binding
            $(document).off('click', '.saveActiveBank');
            $(document).on('click', '.saveActiveBank', function () {

                var bankId = $('input[name="activeBank"]:checked').val();

                if (!bankId) {
                    Espo.Ui.notify('Please select a bank', 'warning');
                    return;
                }

                Espo.Ajax.postRequest('CEmployeeBank/action/setActiveBank', {
                    employeeId: self.model.id,
                    bankId: bankId
                }).then(function () {

                    Espo.Ui.notify('Active bank updated', 'success');

                    // update local array
                    self.employeeBanks.forEach(function (bank) {
                        bank.isActive = bank.id === bankId;
                    });

                    self.showActiveBank(self.employeeBanks);

                });

            });

        },
        showActiveBank: function (banks) {

            var activeBank = banks.find(bank => bank.isActive);

            if (!activeBank) {
                $('#active-bank-details .bank-name').text('--');
                $('#active-bank-details .account').text('--');
                $('#active-bank-details .ifsc').text('--');
                return;
            }

            $('#active-bank-details .bank-name').text(activeBank.banksName || '');
            $('#active-bank-details .account').text(activeBank.accountNO || '');
            $('#active-bank-details .ifsc').text(activeBank.iFSCCode || '');

        },

        simpleModal: function (title, htmlContent) {
            var backdropId = 'helloBackdrop-' + Date.now();
            var modalId = 'helloModal-' + Date.now();

            var backdropHtml = `<div id="${backdropId}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 9998;"></div>`;

            var modalHtml = `
                <div id="${modalId}" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; width: 90%; max-width: 500px;">
                    <div style="background: white; border-radius: 4px; box-shadow: 0 3px 12px rgba(0, 0, 0, 0.5); overflow: hidden;">
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

            // Close button functionality
            $(document).on('click', '.modalCloseBtn', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').fadeOut(300, function () {
                    $(this).remove();
                });
                $(document).off('click', '.modalCloseBtn');
                $(document).off('click', '#' + backdropId);
            });

            // Close on backdrop click
            $(document).on('click', '#' + backdropId, function (e) {
                if (e.target.id === backdropId) {
                    $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').fadeOut(300, function () {
                        $(this).remove();
                    });
                    $(document).off('click', '.modalCloseBtn');
                    $(document).off('click', '#' + backdropId);
                }
            });

            console.log('Modal overlay displayed:', modalId);
        },

        loadBioData: function () {
            // ✅ Get parent data first
            var self = this;



        },


        updateButton: function () {

            const hasAddress =
                this.model.get('address') ||
                this.model.get('city') ||
                this.model.get('state') ||
                this.model.get('country');

            const editButton = this.getButton('edit');
            if (!editButton) return;

            if (!hasAddress) {
                editButton.label = 'Add Address';
                editButton.style = 'primary';
            } else {
                editButton.label = 'Edit';
            }

            this.reRenderHeader();
        },

        data: function () {
            // ✅ ALWAYS get parent data first
            var data = Dep.prototype.data.call(this);

            // ✅ Safe default
            data.hasAddress = false;

            // ✅ Only check when addressData exists
            if (this.addressData && typeof this.addressData === 'object') {
                data.hasAddress = true;
            }

            return data;
        },

        actionAddAddress: function () {
            var self = this;

            this.createView('addAddressModal', 'views/modal', {
                headerText: 'Add Address',
                templateContent: '<div class="address-form"></div>'
            }, function (modal) {

                modal.render();

                self.getModelFactory().create('CEmployeeAddress', function (model) {
                    model.set('employeeId', self.model.id);

                    self.createView('addressForm', 'views/record/edit-small', {
                        model: model,
                        entityType: 'CEmployeeAddress',
                        el: '.address-form',
                        containerEl: modal.el,
                        hideHeader: true
                    }, function (form) {
                        form.render();

                        self.listenToOnce(model, 'after:save', function () {
                            self.addressData = model.getClonedAttributes();
                            self.updateAddressPane(self.addressData);
                            self.renderEditButton();
                            modal.close();
                        });
                    });
                });
            });
        },

        actionEditAddress: function () {
            var self = this;

            if (!this.addressData) return;

            this.createView('editAddressModal', 'views/modal', {
                headerText: 'Edit Address',
                templateContent: '<div class="address-form"></div>'
            }, function (modal) {

                modal.render();

                self.getModelFactory().create('CEmployeeAddress', function (model) {
                    model.set(self.addressData);
                    model.id = self.addressData.id;

                    self.createView('addressForm', 'views/record/edit-small', {
                        model: model,
                        entityType: 'CEmployeeAddress',
                        el: '.address-form',
                        containerEl: modal.el,
                        hideHeader: true
                    }, function (form) {
                        form.render();

                        self.listenToOnce(model, 'after:save', function () {
                            self.addressData = model.getClonedAttributes();
                            self.updateAddressPane(self.addressData);
                            modal.close();
                        });
                    });
                });
            });
        },


        checkAddress: function () {
            const hasAddress =
                this.model.get('address') ||
                this.model.get('city') ||
                this.model.get('state') ||
                this.model.get('country');

            // ❌ Remove default Edit button
            if (!hasAddress) {
                this.removeMenuItem('buttons', 'edit');

                // ✅ Add custom Add Address button
                this.addMenuItem('buttons', {
                    name: 'addAddress',
                    label: 'Add Address',
                    style: 'primary',
                    action: 'addAddress'
                });
            }
        },

        actionAddAddress: function () {
            this.actionEdit(); // Opens edit form
        },

        //vertical tab switching logic
        onSideLinkClick: function (e) {
            if (e && e.preventDefault) e.preventDefault();

            var $clicked = $(e.currentTarget);
            var targetPane = $clicked.data('target');
            if (!targetPane) return;

            // Sidebar active state
            this.$el.find('.side-link').removeClass('active');
            $clicked.addClass('active');

            // Show correct pane
            this.$el.find('.doc-pane').addClass('hidden');
            this.$el.find('#' + targetPane).removeClass('hidden');

            var sidebarText = $.trim($clicked.text()).replace(/[\s\n]+/g, ' ').trim();
            var isPastExperience = targetPane === 'past-experience';

            if (!isPastExperience) {
                // Update ALL pane headings with sidebar text
                this.$el.find('.doc-pane #' + targetPane + ' .sec-header').text(sidebarText);
            }

            /* ✅ CORE LOGIC — CHANGE HEADING */
            var headingText = $.trim($clicked.text());
            this.$el.find('#dynamic-pane-heading').text(headingText);

            /* ✅ OPTIONAL: Edit button visibility */
            this.$el.find('#dynamic-edit-btn').removeClass('hidden');
        },



        onTopTabClick: function (e) {
            if (e && typeof e === 'object' && e.preventDefault && typeof e.preventDefault === 'function') {
                e.preventDefault();
            }

            var $clicked;
            if (e && e.currentTarget) {
                $clicked = $(e.currentTarget);
            } else {
                $clicked = $(this);
            }

            var targetMod = $clicked.data('target');
            if (!targetMod) return;

            this.$el.find('.top-tab').removeClass('active');
            $clicked.addClass('active');

            this.$el.find('.sidebar-group').addClass('hidden');
            var $newSidebar = this.$el.find('.sidebar-group[data-module="' + targetMod + '"]');
            $newSidebar.removeClass('hidden');

            var $firstLink = $newSidebar.find('.side-link').first();
            if ($firstLink.length) {
                // ✅ Direct method call without event
                this.onSideLinkClick.call(this, { currentTarget: $firstLink[0] });
            }
        },

        // Click hone par Form open karne ka logic
        onOpenEditFormModal: function (e) {
            e.preventDefault();
            var $btn = $(e.currentTarget);
            var scope = $btn.data('scope'); // Will be CEmployeeAddress
            var id = this.paneIdRegistry[scope]; // Get the ID we stored during load

            if (!id) {
                Espo.Ui.notify("No record exists to edit. Please create one first.", 'warning');
                return;
            }

            var self = this;
            // Native Espo View to show a side pop-up editor
            this.createView('sideEditor', 'views/modal/edit', {
                scope: scope,
                id: id
            }, function (view) {
                view.render();
                // Logic to REFRESH the UI after saving in the Modal
                self.listenToOnce(view, 'after:save', function () {
                    self.loadAddressData(); // Only re-fetch address details
                    Espo.Ui.notify('Address updated successfully', 'success');
                });
            });
        },

        actionEdit: function () {
            Dep.prototype.actionEdit.call(this);
        },

        afterRender: function () {
            if (typeof this._super == 'function') {
                this._super('afterRender');
            }
            if (this.addressData) {
                this.updateAddressPane(this.addressData);
            }
            Dep.prototype.afterRender.call(this);
            var self = this;

            // Show first pane
            var $firstPane = this.$el.find('.doc-pane').first();
            if ($firstPane.length) {
                this.$el.find('.doc-pane').addClass('hidden');
                $firstPane.removeClass('hidden');
            }

            // Mark first link as active
            var $firstLink = this.$el.find('.side-link').first();
            if ($firstLink.length) {
                $firstLink.addClass('active');
            }

            // Mark first top tab as active
            var $firstTab = this.$el.find('.top-tab').first();
            if ($firstTab.length) {
                $firstTab.addClass('active');
            }

            // Hide all sidebar groups except first
            this.$el.find('.sidebar-group').addClass('hidden');
            this.$el.find('.sidebar-group').first().removeClass('hidden');

            // Load related data
            this.loadContactData();
            this.loadDependentsData();
            this.loadPastExperienceData();
            this.loadDocumentsData();
            this.loadContactData();
            this.loadAddressData();
            this.loadVoterData();
            this.loadDrivingData(this.model.id);
            this.loadPanData();
            // this.loadEmployeeBanks();

            const employeeId = this.model.get('id') || this.options.id;
            console.log('Employee ID:', employeeId);
            setTimeout(() => this.loadEmployeeBanks(employeeId), 1000);

            if (employeeId) {
                this.loadBankRecords(employeeId);
            }

            // Remove side panel completely
            this.$el.find('.side').remove();
            this.$el.find('[data-name="employeeBanks"]').closest('.panel').remove();
        },

        loadDocumentsData: function () {
            var self = this;
            var employeeId = this.model.id;
            if (!employeeId) return;

            // Candidates for each document entity (tries in order)
            // Use the actual controllers present in the codebase to avoid 404s
            var candidates = {
                aadhaar: ['CADHAR'],
                driving: ['CDrivingLicense'],
                pan: ['CPanCard'],
                passport: ['CPassport'],
                voter: ['CVoterIdCard']
            };

            var fetchOne = function (names, callback) {
                var attempt = function (idx) {
                    if (idx >= names.length) return callback(null);
                    Espo.Ajax.getRequest(names[idx], { where: [{ type: 'equals', attribute: 'employeeId', value: employeeId }], limit: 50 }).then(function (resp) {
                        if (resp && resp.list && resp.list.length) return callback(resp.list);
                        attempt(idx + 1);
                    }).catch(function () { attempt(idx + 1); });
                };
                attempt(0);
            };

            // Aadhaar
            fetchOne(candidates.aadhaar, function (list) {
                self.updateAadhaarPane(Array.isArray(list) ? list : []);
            });

            // Driving
            fetchOne(candidates.driving, function (list) { if (list) self.updateDrivingPane(list); else self.updateDrivingPane([]); });
            // PAN
            fetchOne(candidates.pan, function (list) { if (list) self.updatePanPane(list); else self.updatePanPane([]); });
            // Passport
            fetchOne(candidates.passport, function (list) { if (list) self.updatePassportPane(list); else self.updatePassportPane([]); });
            // Voter
            fetchOne(candidates.voter, function (list) { if (list) self.updateVoterPane(list); else self.updateVoterPane([]); });
        },

        _renderAttachments: function ($container, attachments) {
            $container.empty();

            if (!attachments) return;

            var ids = [];
            if (Array.isArray(attachments)) {
                ids = attachments;
            } else if (typeof attachments === 'string') {
                ids = [attachments];
            }

            if (!ids.length) return;

            ids.forEach(function (id) {
                var thumbUrl = '?entryPoint=image&id=' + id + '&size=small';
                var fullUrl = '?entryPoint=image&id=' + id;

                var imgWrapper = document.createElement('div');
                imgWrapper.className = 'thumbnail-wrapper';
                imgWrapper.style.display = 'inline-block';
                imgWrapper.style.margin = '2px';

                var img = document.createElement('img');
                img.src = thumbUrl;
                img.className = 'doc-thumb-image';
                img.dataset.fullUrl = fullUrl;
                img.style.width = '70px';
                img.style.height = '70px';
                img.style.maxWidth = '80px';
                img.style.maxHeight = '80px';
                img.style.objectFit = 'cover';
                img.style.display = 'block';

                // SAME PERFECT VIEWER for both Aadhaar & Driving!
                img.onclick = function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var viewerWindow = window.open('', '_blank', 'width=1400,height=900');
                    viewerWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Aadhaar Image Preview</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            background: #000;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            font-family: Arial, sans-serif;
                            padding: 20px;
                        }
                        .image-container {
                            max-width: 95vw;
                            max-height: 95vh;
                            text-align: center;
                        }
                        .main-image {
                            max-width: 100%;
                            max-height: 90vh;
                            object-fit: contain;
                            border-radius: 12px;
                            box-shadow: 0 20px 60px rgba(255,255,255,0.1);
                            cursor: zoom-in;
                            transition: transform 0.3s ease;
                        }
                        .main-image.zoomed {
                            cursor: zoom-out;
                            transform: scale(1.5);
                        }
                        .controls {
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            background: rgba(0,0,0,0.8);
                            color: white;
                            padding: 10px 20px;
                            border-radius: 25px;
                            font-size: 14px;
                            cursor: pointer;
                            backdrop-filter: blur(10px);
                        }
                        .close-btn {
                            position: fixed;
                            top: 20px;
                            left: 20px;
                            background: #ff4757;
                            color: white;
                            border: none;
                            border-radius: 50%;
                            width: 45px;
                            height: 45px;
                            font-size: 20px;
                            cursor: pointer;
                            box-shadow: 0 4px 15px rgba(255,71,87,0.4);
                            transition: all 0.3s ease;
                        }
                        .close-btn:hover {
                            transform: scale(1.1);
                            background: #ff3742;
                        }
                    </style>
                </head>
                <body>                    
                    <div class="image-container">
                        <img src="${fullUrl}" class="main-image" id="mainImage" onload="imageLoaded()" onerror="imageError()">
                    </div>

                    <script>
                        let isZoomed = false;
                        const img = document.getElementById('mainImage');
                        
                        function imageLoaded() {
                            console.log('Image loaded successfully');
                        }
                        
                        function imageError() {
                            document.body.innerHTML = '<div style="color:white;text-align:center;padding:50px;font-size:20px;">Image not found</div>';
                        }
                        
                        function toggleZoom() {
                            isZoomed = !isZoomed;
                            img.classList.toggle('zoomed');
                        }
                        
                        // Double click zoom
                        img.ondblclick = toggleZoom;
                        
                        // ESC key to close
                        document.onkeydown = function(e) {
                            if (e.key === 'Escape') window.close();
                        };
                    </script>
                </body>
                </html>
            `);
                    viewerWindow.document.close();
                };

                imgWrapper.appendChild(img);
                $container.append(imgWrapper);
            });
        },




        //Image Preview Modal logic
        openImagePreview: function (src) {
            this.createView('imagePreviewModal', 'views/modal', {
                headerText: 'Document Preview',
                backdrop: true,
                templateContent:
                    '<div style="text-align:center;">' +
                    '<img src="' + src + '" class="aadhaar-full-image" />' +
                    '</div>'
            }, function (modalView) {
                modalView.render();
            });
        },



        //Adhar card functions including EDIT
        createAadhaarEditModal: function (id) {
            var self = this;

            this.createView('aadhaarEditModal', 'views/modal', {
                headerText: 'Edit Aadhaar',
                backdrop: true,
                templateContent: '<div class="aadhaar-edit-form"></div>'
            }, function (modalView) {

                modalView.render();

                self.getModelFactory().create('CADHAR', function (model) {

                    model.set('id', id);

                    model.fetch().then(function () {

                        self.aadhaarEditModel = model;

                        self.createView(
                            'aadhaarForm',
                            'views/record/edit-small',
                            {
                                model: model,
                                entityType: 'CADHAR',
                                layoutName: 'detailSmall',
                                hideHeader: true,
                                el: '.aadhaar-edit-form',
                                containerEl: modalView.el
                            },
                            function (formView) {
                                formView.render();
                                //edited below 3 lines to stop the navigation of form
                                formView.getRouter().navigate = function () { };
                                formView.getRouter().dispatch = function () { };
                                formView.getRouter().navigateBack = function () { };
                                formView.listenTo(model, 'after:save', function () {
                                    self.updateAadhaarPane([model.getClonedAttributes()]);
                                    self.getView('aadhaarEditModal').close();
                                });
                            }
                        );
                    });
                });
            });
        },
        onEditAadhaarModal: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var id = this.relatedRecordIds['CADHAR'];

            if (!id) {
                Espo.Ui.notify('Aadhaar record not found', 'warning');
                return;
            }

            this.createAadhaarEditModal(id);
        },

        updateAadhaarPane: function (list) {
            var $pane = this.$el.find('#aadhaar');
            if (!$pane.length) return;

            $pane.removeClass('hidden');

            // 🔒 SAFETY: list must be array with record
            if (!Array.isArray(list) || !list.length || !list[0]) {
                $pane.find('[data-field="aadharName"]').text('--');
                $pane.find('[data-field="adharEnrollementNumber"]').text('--');
                $pane.find('[data-field="aadharNumber"]').text('--');
                $pane.find('[data-field="addressAsPerAadhar"]').text('--');
                $pane.find('[data-field="aadharAttachments"]').empty();
                return;
            }

            var rec = list[0]; // ✅ NOW SAFE

            console.log('AADHAAR RECORD:', rec); // keep for now

            this.relatedRecordIds['CADHAR'] = rec.id;

            $pane.find('[data-field="aadharName"]').text(
                rec.name || rec.nameAsPerAadhar || '--'
            );
            $pane.find('[data-field="adharEnrollementNumber"]').text(
                rec.adharEnrollementNumber || '--'
            );
            $pane.find('[data-field="aadharNumber"]').text(
                rec.adharNumber || '--'
            );
            $pane.find('[data-field="addressAsPerAadhar"]').text(
                rec.addressAsPerAadhar || '--'
            );

            this._renderAttachments(
                $pane.find('[data-field="aadharAttachments"]'),
                rec.attachmentsId || rec.attachmentIds || []
            );
        },


        // Driving License functions including Edit
        createDrivingEditModal: function (id) {
            var self = this;

            this.createView('drivingEditModal', 'views/modal', {
                headerText: 'Edit Driving License',
                backdrop: true,
                templateContent: '<div class="driving-edit-form"></div>'
            }, function (modalView) {

                modalView.render();

                self.getModelFactory().create('CDrivingLicense', function (model) {

                    model.set('id', id);

                    model.fetch().then(function () {

                        self.createView(
                            'drivingForm',
                            'views/record/edit-small',
                            {
                                model: model,
                                entityType: 'CDrivingLicense',
                                layoutName: 'detailSmall',
                                hideHeader: true,
                                el: '.driving-edit-form',
                                containerEl: modalView.el
                            },
                            function (formView) {
                                formView.render();
                                //edited below 3 lines to stop the navigation of form
                                formView.getRouter().navigate = function () { };
                                formView.getRouter().dispatch = function () { };
                                formView.getRouter().navigateBack = function () { };
                                formView.listenTo(model, 'after:save', function () {
                                    self.updateDrivingPane([model.getClonedAttributes()]);
                                    self.getView('drivingEditModal').close();
                                });
                            }
                        );
                    });
                });
            });
        },

        onEditDrivingModal: function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (!this.drivingRecordId) {
                Espo.Ui.notify('Driving License record not found', 'warning');
                return;
            }

            this.createDrivingEditModal(this.drivingRecordId);
        },


        // Correct query using foreign key
        loadDrivingData: function () {
            var self = this;

            Espo.Ajax.getRequest('CDrivingLicense', {
                where: [{
                    type: 'equals',
                    attribute: 'employeeId',
                    value: this.model.id
                }],
                limit: 1
            }).then(function (response) {
                self.updateDrivingPane(response.list || []);
            });
        },


        updateDrivingPane: function (list) {
            var $pane = this.$el.find('#driving');
            if (!$pane.length) return;

            $pane.removeClass('hidden');

            // 🔒 SAFETY: list must be array with record (same as Aadhaar)
            if (!Array.isArray(list) || !list.length || !list[0]) {
                $pane.find('[data-field="drivingLicenseNumber"]').text('--');
                $pane.find('[data-field="dateOfIssue"]').text('--');
                $pane.find('[data-field="expiryDate"]').text('--');
                $pane.find('[data-field="drivingAttachments"]').empty();  // ✅ Same pattern
                return;
            }

            var rec = list[0]; // ✅ NOW SAFE (same as Aadhaar)

            console.log('🚗 DRIVING RECORD:', rec); // Debug log

            this.drivingRecordId = rec.id;  // Save for edit

            $pane.find('[data-field="drivingLicenseNumber"]').text(
                rec.drivingLicenseNumber || '--'
            );
            $pane.find('[data-field="dateOfIssue"]').text(
                rec.dateOfIssue || '--'
            );
            $pane.find('[data-field="expiryDate"]').text(
                rec.expiryDate || '--'
            );

            // ✅ EXACT SAME AS AADHAAR - Perfect!
            this._renderAttachments(
                $pane.find('[data-field="drivingAttachments"]'),  // ✅ Match TPL field
                rec.attachmentsId || rec.attachmentIds || []      // ✅ Same field names!
            );
        },



        // PAN card functions including Edit
        loadPanData: function () {
            var self = this;

            Espo.Ajax.getRequest('CPanCard', {
                where: [{
                    type: 'equals',
                    attribute: 'employeeId',   // ✅ SAME LOGIC
                    value: this.model.id
                }],
                limit: 1
            }).then(function (response) {
                // console.log('PAN API RESPONSE:', response);
                self.updatePanPane(response.list || []);
            }).catch(function (e) {
                console.error('❌ PAN API ERROR:', e);
            });
        },
        onEditPanModal: function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (!this.panRecordId) {
                Espo.Ui.notify('PAN Card record not found', 'warning');
                return;
            }

            this.createPanEditModal(this.panRecordId);
        },
        createPanEditModal: function (id) {
            var self = this;

            this.createView('panEditModal', 'views/modal', {
                headerText: 'Edit PAN Card',
                backdrop: true,
                templateContent: '<div class="pan-edit-form"></div>'
            }, function (modalView) {

                modalView.render();

                self.getModelFactory().create('CPanCard', function (model) {

                    model.set('id', id);

                    model.fetch().then(function () {

                        self.createView(
                            'panForm',
                            'views/record/edit-small',
                            {
                                model: model,
                                entityType: 'CPanCard',
                                layoutName: 'detailSmall',
                                hideHeader: true,
                                el: '.pan-edit-form',
                                containerEl: modalView.el
                            },
                            function (formView) {
                                formView.render();
                                //edited below 3 lines to stop the navigation of form
                                formView.getRouter().navigate = function () { };
                                formView.getRouter().dispatch = function () { };
                                formView.getRouter().navigateBack = function () { };
                                formView.listenTo(model, 'after:save', function () {
                                    self.updatePanPane([model.getClonedAttributes()]);
                                    self.getView('panEditModal').close();
                                });
                            }
                        );
                    });
                });
            });
        },

        updatePanPane: function (list) {
            var $pane = this.$el.find('#pan');
            if (!$pane.length) return;

            $pane.removeClass('hidden');

            // 🔒 SAFETY CHECK - EXACT SAME AS AADHAAR
            if (!Array.isArray(list) || !list.length || !list[0]) {
                $pane.find('[data-field="panCardNumber"]').text('--');
                $pane.find('[data-field="panName"]').text('--');
                $pane.find('[data-field="panDob"]').text('--');
                $pane.find('[data-field="panDescription"]').text('--');
                $pane.find('[data-field="panAttachments"]').empty();
                return;
            }

            var rec = list[0]; // ✅ NOW SAFE - SAME AS AADHAAR

            console.log('💳 PAN RECORD:', rec); // Debug log - SAME AS AADHAAR

            this.panRecordId = rec.id; // ✅ STORE ID FOR EDIT

            $pane.find('[data-field="panCardNumber"]').text(
                rec.panCardNumber || '--'
            );
            $pane.find('[data-field="panName"]').text(
                rec.nameAsPerPanCard || '--'
            );
            $pane.find('[data-field="panDob"]').text(
                rec.dateOfBirthAsPerPanCard || '--'
            );
            $pane.find('[data-field="panDescription"]').text(
                rec.description || '--'
            );

            // 🔥 EXACT SAME LINE AS AADHAAR - THIS IS KEY!
            this._renderAttachments(
                $pane.find('[data-field="panAttachments"]'),     // ✅ Matches TPL
                rec.attachmentsId || rec.attachmentIds || []     // ✅ EXACT Aadhaar fields!
            );
        },


        // Passport functions including Edit
        loadPassportData: function () {
            var self = this;

            Espo.Ajax.getRequest('CPassport', {
                where: [{
                    type: 'equals',
                    attribute: 'employeeId',   // ✅ SAME AS DRIVING & PAN
                    value: this.model.id
                }],
                limit: 1
            }).then(function (response) {
                // console.log('PASSPORT API RESPONSE:', response);
                self.updatePassportPane(response.list || []);
            }).catch(function (e) {
                console.error('❌ PASSPORT API ERROR:', e);
            });
        },
        onEditPassportModal: function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (!this.passportRecordId) {
                Espo.Ui.notify('No Passport record found', 'warning');
                return;
            }

            this.openPassportEditModal(this.passportRecordId);
        },

        openPassportEditModal: function (id) {
            var self = this;

            this.createView('passportModal', 'views/modal', {
                headerText: 'Edit Passport',
                backdrop: true,
                templateContent: '<div class="passport-edit"></div>'
            }, function (modal) {

                modal.render();

                self.getModelFactory().create('CPassport', function (model) {

                    model.set('id', id);

                    model.fetch().then(function () {

                        self.createView(
                            'passportEditForm',
                            'views/record/edit-small',
                            {
                                model: model,
                                entityType: 'CPassport',
                                layoutName: 'detailSmall',
                                el: '.passport-edit',
                                containerEl: modal.el,
                                hideHeader: true
                            },
                            function (view) {
                                view.render();
                                //edited below 3 lines to stop the navigation of form   
                                view.getRouter().navigate = function () { };
                                view.getRouter().dispatch = function () { };
                                view.getRouter().navigateBack = function () { };
                                view.listenTo(model, 'after:save', function () {
                                    self.updatePassportPane([model.getClonedAttributes()]);
                                    modal.close();
                                });
                            }
                        );
                    });
                });
            });
        },

        updatePassportPane: function (list) {
            var $pane = this.$el.find('#passport');
            if (!$pane.length) return;

            $pane.removeClass('hidden');

            // 🔒 SAFETY CHECK - EXACT SAME AS AADHAAR
            if (!Array.isArray(list) || !list.length || !list[0]) {
                $pane.find('[data-field="passportNumber"]').text('--');
                $pane.find('[data-field="passportName"]').text('--');
                $pane.find('[data-field="passportDateOfIssue"]').text('--');
                $pane.find('[data-field="passportExpiryDate"]').text('--');
                $pane.find('[data-field="passportPlaceOfBirth"]').text('--');
                $pane.find('[data-field="passportDescription"]').text('--');
                $pane.find('[data-field="passportAttachments"]').empty();
                return;
            }

            var rec = list[0]; // ✅ NOW SAFE - SAME AS AADHAAR

            console.log('🛂 PASSPORT RECORD:', rec); // Debug log

            this.passportRecordId = rec.id; // ✅ STORE ID FOR EDIT

            $pane.find('[data-field="passportNumber"]').text(
                rec.passportNumber || '--'
            );
            $pane.find('[data-field="passportName"]').text(
                rec.nameAsPerPassport || '--'
            );
            $pane.find('[data-field="passportDateOfIssue"]').text(
                rec.dateOfIssue || '--'
            );
            $pane.find('[data-field="passportExpiryDate"]').text(
                rec.expiryDate || '--'
            );
            $pane.find('[data-field="passportPlaceOfBirth"]').text(
                rec.placeOfBirth || '--'
            );
            $pane.find('[data-field="passportDescription"]').text(
                rec.description || '--'
            );

            // 🔥 EXACT SAME LINE AS AADHAAR - KEY FIX!
            this._renderAttachments(
                $pane.find('[data-field="passportAttachments"]'),  // ✅ Matches your TPL
                rec.attachmentsId || rec.attachmentIds || []       // ✅ EXACT Aadhaar pattern!
            );
        },




        //voter id wale functions including edit
        createVoterEditModal: function (id) {
            var self = this;

            this.createView('voterEditModal', 'views/modal', {
                headerText: 'Edit Voter ID',
                backdrop: true,
                templateContent: '<div class="voter-edit-form"></div>'
            }, function (modalView) {

                modalView.render();

                self.getModelFactory().create('CVoterIdCard', function (model) {

                    model.set('id', id);

                    model.fetch().then(function () {

                        self.createView(
                            'voterForm',
                            'views/record/edit-small',
                            {
                                model: model,
                                entityType: 'CVoterIdCard',
                                layoutName: 'detailSmall',
                                hideHeader: true,
                                el: '.voter-edit-form',
                                containerEl: modalView.el
                            },
                            function (formView) {
                                formView.render();
                                //edited below 3 lines to stop the navigation of form
                                formView.getRouter().navigate = function () { };
                                formView.getRouter().dispatch = function () { };
                                formView.getRouter().navigateBack = function () { };
                                formView.listenTo(model, 'after:save', function () {
                                    self.updateVoterPane([model.getClonedAttributes()]);
                                    self.getView('voterEditModal').close();
                                });
                            }
                        );
                    });
                });
            });
        },

        onEditVoterModal: function (e) {
            e.preventDefault();
            e.stopPropagation();

            // ✅ SAFE SOURCE
            var id = this.voterRecordId;

            if (!id) {
                Espo.Ui.notify('Voter ID record not found', 'warning');
                return;
            }

            this.createVoterEditModal(id);
        },

        loadVoterData: function () {
            var self = this;

            Espo.Ajax.getRequest('CVoterIdCard', {
                where: [{
                    type: 'equals',
                    attribute: 'assignedUserId',
                    value: this.model.get('assignedUserId')
                }],
                limit: 1
            }).then(function (response) {
                self.updateVoterPane(response.list || []);
            });
        },

        updateVoterPane: function (list) {
            var $pane = this.$el.find('#voter');
            if (!$pane.length) return;

            $pane.removeClass('hidden');

            // 🔒 SAFETY CHECK - EXACT SAME AS AADHAAR
            if (!Array.isArray(list) || !list.length || !list[0]) {
                $pane.find('[data-field="voterIDNumber"]').text('--');
                $pane.find('[data-field="voterName"]').text('--');
                $pane.find('[data-field="voterDob"]').text('--');
                $pane.find('[data-field="voterFather"]').text('--');
                $pane.find('[data-field="voterDescription"]').text('--');
                $pane.find('[data-field="voterAttachments"]').empty();
                return;
            }

            var rec = list[0]; // ✅ NOW SAFE - SAME AS AADHAAR

            console.log('🗳️ VOTER RECORD:', rec); // Debug log

            this.voterRecordId = rec.id; // ✅ STORE ID FOR EDIT

            $pane.find('[data-field="voterIDNumber"]').text(
                rec.voterIDNumber || '--'
            );
            $pane.find('[data-field="voterName"]').text(
                rec.nameAsPerVoterIDCard || '--'
            );
            $pane.find('[data-field="voterDob"]').text(
                rec.dateOfBirth || '--'
            );
            $pane.find('[data-field="voterFather"]').text(
                rec.fathersNameAsPerVoterIDCard || '--'
            );
            $pane.find('[data-field="voterDescription"]').text(
                rec.description || '--'
            );

            // 🔥 EXACT SAME LINE AS AADHAAR - KEY FIX!
            this._renderAttachments(
                $pane.find('[data-field="voterAttachments"]'),   // ✅ Matches your TPL
                rec.attachmentsId || rec.attachmentIds || []     // ✅ EXACT Aadhaar pattern!
            );
        },



        // Past Experience functions including Edit
        createPastExperienceEditModal: function (id) {
            var self = this;

            this.createView('pastExpEditModal', 'views/modal', {
                headerText: 'Edit Past Experience',
                backdrop: true,
                templateContent: '<div class="past-exp-edit-form"></div>',
            }, function (modalView) {

                modalView.render();

                self.getModelFactory().create('CEmployeePastExperience', function (model) {

                    model.set('id', id);

                    model.fetch().then(function () {

                        self.pastExperienceEditModel = model;

                        self.createView(
                            'pastExpForm',
                            'views/record/edit-small',
                            {
                                model: model,
                                entityType: 'CEmployeePastExperience',
                                layoutName: 'detailSmall',
                                hideHeader: true,
                                el: '.past-exp-edit-form',
                                containerEl: modalView.el
                            },
                            function (formView) {

                                formView.render();
                                //edited below 3 lines to stop the navigation of form
                                formView.getRouter().navigate = function () { };
                                formView.getRouter().dispatch = function () { };
                                formView.getRouter().navigateBack = function () { };
                                formView.listenTo(model, 'after:save', function () {

                                    // 🔄 reload whole list
                                    self.loadPastExperienceData();

                                    self.getView('pastExpEditModal').close();
                                });
                            }
                        );
                    });
                });
            });
        },

        loadPastExperienceData: function () {
            var self = this;
            var employeeId = this.model.id;
            // console.log('🔍 Employee ID:', employeeId); 

            if (!employeeId) return;

            Espo.Ajax.getRequest('CEmployeePastExperience', {
                select: 'id,name,workRole,workRoleName,companyName,startDate,endDate,country,countryName,state,stateName,city,cityName,companyAddress',
                where: [{ type: 'equals', attribute: 'employeeId', value: employeeId }],  // ✅ YE FIELD CHECK KARO
                limit: 10
            }).then(function (response) {
                // console.log('🔍 FULL API RESPONSE:', response); 
                // console.log('🔍 Response List Length:', response.list ? response.list.length : 'NO LIST');

                if (response.list && response.list.length > 0) {
                    // console.log('🔍 First Item:', response.list[0]); 
                    self.updatePastExperiencePane(response.list);
                } else {
                    console.log('❌ No records found');
                    var $pane = self.$el.find('#past-experience');
                    $pane.find('.past-experience-list').html('<div class="muted">-- No past experience found --</div>');
                }
            }).catch(function (error) {
                console.error('❌ API ERROR:', error);
            });
        },
        onEditPastExperienceModal: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var id = $(e.currentTarget).data('id');

            if (!id) {
                Espo.Ui.notify('Past Experience record not found', 'warning');
                return;
            }

            this.createPastExperienceEditModal(id);
        },

        updatePastExperiencePane: function (items) {
            var $pane = this.$el.find('#past-experience');
            if (!$pane.length) return;

            var $list = $pane.find('.past-experience-list');
            $list.empty();

            if (!items || !items.length) {
                $list.html('<div class="muted">-- No past experience found --</div>');
                return;
            }

            items.forEach(function (it) {
                this.pastExperienceDataMap[it.id] = it;
                var company = it.companyName || it.name || '--';
                var role = it.workRoleName || it.workRole || '--';
                var addr = it.companyAddress || '--';
                var country = it.countryName || it.country || '--';
                var state = it.stateName || it.state || '--';
                var city = it.cityName || it.city || '--';
                var startDate = it.startDate || '--';
                var endDate = it.endDate || '--';

                var $card = $('<div/>').addClass('past-exp-card').css({
                    'border': '1px solid #e1e5e9',
                    'border-radius': '6px',
                    'padding': '12px',
                    'margin-bottom': '12px',
                    'background': '#fff',
                    'box-shadow': '0 1px 3px rgba(0,0,0,0.1)'
                });

                // Header with labels
                var $header = $('<div/>').css({
                    display: 'flex',
                    'justify-content': 'space-between',
                    'align-items': 'flex-start',
                    'margin-bottom': '12px',
                    'padding': '8px',
                    'background': '#f8f9fa',
                    'border-radius': '4px'
                });

                var $headerLeft = $('<div/>').css({
                    display: 'flex',
                    'flex-direction': 'column',
                    'align-items': 'flex-start'
                });

                var $editBtn = $('<button/>')
                    .addClass('btn btn-primary btn-xs')
                    .attr('data-action', 'edit-past-exp-action')
                    .attr('data-id', it.id)
                    .text('Edit');


                $headerLeft.append(
                    $('<div/>').css({ 'font-size': '11px', color: '#666', 'font-weight': '500', 'margin-bottom': '2px' }).text('Company:')
                );
                $headerLeft.append(
                    $('<div/>').css({ 'font-weight': '600', 'font-size': '14px', color: '#333' }).text(company)
                );
                $headerLeft.append(
                    $('<div/>').css({ 'font-size': '11px', color: '#666', 'font-weight': '500', 'margin-top': '4px', 'margin-bottom': '2px' }).text('Role:')
                );
                $headerLeft.append(
                    $('<div/>').css({ 'font-weight': '500', 'font-size': '13px', color: '#2c5aa0' }).text(role)
                );

                $header.append($headerLeft).append($editBtn);

                var $table = $('<div/>').css({ 'font-size': '13px', color: '#333' });
                var addRow = function (label, value) {
                    var $row = $('<div/>').css({ display: 'flex', padding: '4px 0', 'border-bottom': '1px solid #f0f0f0' });
                    var $lab = $('<div/>').css({ width: '120px', color: '#444', 'font-weight': '600' }).text(label + ':');
                    var $val = $('<div/>').css({ color: '#333', flex: 1 }).text(value || '--');
                    $row.append($lab).append($val);
                    $table.append($row);
                };

                addRow('Period', startDate + ' → ' + endDate);
                addRow('Location', city + ', ' + state + ', ' + country);
                addRow('Address', addr);

                $card.append($header).append($table);
                $list.append($card);
            }.bind(this));
        },


        _resolveWorkRole: function (roleVal) {
            var self = this;
            return new Promise(function (resolve) {
                if (!roleVal) return resolve('--');

                // If it's an object with name
                if (typeof roleVal === 'object') {
                    if (Array.isArray(roleVal)) {
                        var names = roleVal.map(function (r) { return (r && r.name) ? r.name : (r && r.id) ? r.id : null; }).filter(Boolean);
                        return resolve(names.join(', ') || '--');
                    }
                    return resolve(roleVal.name || roleVal.label || roleVal.id || '--');
                }

                // If it's a comma-separated list
                if (typeof roleVal === 'string' && roleVal.indexOf(',') !== -1) {
                    var parts = roleVal.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
                    var promises = parts.map(function (p) { return self._fetchWorkRoleNameById(p); });
                    Promise.all(promises).then(function (results) {
                        var names = results.filter(Boolean);
                        resolve(names.join(', ') || '--');
                    }).catch(function () { resolve('--'); });
                    return;
                }

                // Single id (string or number)
                var id = roleVal;
                self._fetchWorkRoleNameById(id).then(function (name) { resolve(name || id); }).catch(function () { resolve(id); });
            });
        },

        _fetchWorkRoleNameById: function (id) {
            var tryEntities = ['CWorkRole', 'WorkRole', 'CJobRole', 'JobRole'];
            var attempt = function (idx) {
                if (idx >= tryEntities.length) return Promise.resolve(null);
                var entity = tryEntities[idx];
                return Espo.Ajax.getRequest(entity, { where: [{ type: 'equals', attribute: 'id', value: id }], select: 'id,name', limit: 1 }).then(function (resp) {
                    if (resp && resp.list && resp.list.length) return resp.list[0].name || null;
                    return attempt(idx + 1);
                }).catch(function () { return attempt(idx + 1); });
            };
            return attempt(0);
        },

        _resolveDependantRelation: function (relationValue) {
            return new Promise(function (resolve) {
                if (!relationValue) return resolve('--');
                if (typeof relationValue === 'object') {
                    return resolve(relationValue.name || relationValue.id || '--');
                }
                // assume id string
                Espo.Ajax.getRequest('CDependantRelation', { where: [{ type: 'equals', attribute: 'id', value: relationValue }], select: 'id,name', limit: 1 })
                    .then(function (resp) {
                        if (resp && resp.list && resp.list.length) {
                            resolve(resp.list[0].name || '--');
                        } else {
                            resolve('--');
                        }
                    }).catch(function () { resolve('--'); });
            });
        },

        //Dependents functions including Edit
        createDependentEditModal: function (id) {
            var self = this;

            this.createView('dependentEditModal', 'views/modal', {
                headerText: 'Edit Dependent',
                backdrop: true,
                templateContent: '<div class="dependent-edit-form"></div>',
            }, function (modalView) {

                modalView.render();

                self.getModelFactory().create('CEmployeeDependent', function (model) {

                    model.set('id', id);

                    model.fetch().then(function () {

                        self.dependentEditModel = model;

                        self.createView(
                            'dependentForm',
                            'views/record/edit-small',
                            {
                                model: model,
                                entityType: 'CEmployeeDependent',
                                layoutName: 'detailSmall',
                                hideHeader: true,
                                el: '.dependent-edit-form',
                                containerEl: modalView.el
                            },
                            function (formView) {

                                formView.render();
                                //edited below 3 lines to stop the navigation of form
                                formView.getRouter().navigate = function () { };
                                formView.getRouter().dispatch = function () { };
                                formView.getRouter().navigateBack = function () { };
                                formView.listenTo(model, 'after:save', function () {
                                    self.dependentData = model.getClonedAttributes();
                                    self.updateDependentsPane(self.dependentData);
                                    self.getView('dependentEditModal').close();
                                });

                            }
                        );
                    });
                });
            });
        },
        onEditDependentModal: function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (!this.relatedRecordIds['CEmployeeDependent']) {
                Espo.Ui.notify('Dependent record not found', 'warning');
                return;
            }

            this.createDependentEditModal(this.relatedRecordIds['CEmployeeDependent']);
        },

        loadDependentsData: function () {
            var self = this;

            return Espo.Ajax.getRequest('CEmployeeDependent', {
                where: [{
                    type: 'equals',
                    attribute: 'employeeId',
                    value: this.model.id
                }],
            }).then(function (res) {

                if (!res.list || !res.list.length) {
                    self.dependentData = null;
                    self.showAddDependentButton();
                    self.clearDependentsPane();
                    return;
                }

                self.dependentData = res.list[0];
                self.updateDependentsPane(self.dependentData);
                self.showEditDependentButton();
            });
        },

        updateDependentsPane: function (dependentData) {
            var self = this;
            if (dependentData && dependentData.id) this.relatedRecordIds['CEmployeeDependent'] = dependentData.id;
            var $dependentsPane = this.$el.find('#dependents');
            if (!$dependentsPane.length) return;

            var name = dependentData.name || dependentData.firstName || '--';
            var dob = dependentData.birthDate || '--';
            var emergency = dependentData.emergencyContactNumber || '--';
            var relationName = dependentData.dependantRelationName || '--';  // Ye API se direct milega

            $dependentsPane.find('[data-field="dependentName"]').text(name);
            $dependentsPane.find('[data-field="dependentDOB"]').text(dob);
            $dependentsPane.find('[data-field="emergencyNumber"]').text(emergency);
            $dependentsPane.find('[data-field="dependentRelation"]').text(relationName);
        },
        createDependentAddModal: function () {
            var self = this;

            this.createView('dependentAddModal', 'views/modal', {
                headerText: 'Add Dependent',
                backdrop: true,
                templateContent: '<div class="dependent-add-form"></div>',
            }, function (modalView) {

                modalView.render();

                self.getModelFactory().create('CEmployeeDependent', function (model) {

                    // 🔗 EMPLOYEE LINK
                    model.set('employeeId', self.model.id);

                    self.createView(
                        'dependentAddForm',
                        'views/record/edit-small',
                        {
                            model: model,
                            entityType: 'CEmployeeDependent',
                            layoutName: 'detailSmall',
                            hideHeader: true,
                            navigate: false,
                            el: '.dependent-add-form',
                            containerEl: modalView.el
                        },
                        function (formView) {
                            formView.render();

                            // 🛑 STOP NAVIGATION
                            formView.getRouter().navigate = function () { };
                            formView.getRouter().dispatch = function () { };
                            formView.getRouter().navigateBack = function () { };

                            formView.listenTo(model, 'after:save', function () {
                                self.dependentData = model.getClonedAttributes();
                                self.updateDependentsPane(self.dependentData);
                                self.showEditDependentButton();
                                modalView.close();
                            });
                        }
                    );
                });
            });
        },
        onAddDependentModal: function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.createDependentAddModal();
        },
        showAddDependentButton: function () {
            this.$el.find('#add-dependent-btn').removeClass('hidden');
            this.$el.find('#edit-dependent-btn').addClass('hidden');
        },

        showEditDependentButton: function () {
            this.$el.find('#edit-dependent-btn').removeClass('hidden');
            this.$el.find('#add-dependent-btn').addClass('hidden');
        },

        clearDependentsPane: function () {
            var $pane = this.$el.find('#dependents');
            $pane.find('[data-field]').text('--');
        },


        //Contact functions including Edit
        createContactEditModal: function (id) {
            var self = this;

            this.createView('contactEditModal', 'views/modal', {
                headerText: 'Edit Contact',
                backdrop: true,
                templateContent: '<div class="contact-edit-form"></div>',
            }, function (modalView) {

                modalView.render();

                self.getModelFactory().create('CEmployeeContact', function (model) {

                    model.set('id', id);

                    model.fetch().then(function () {

                        self.contactEditModel = model;

                        self.createView(
                            'contactForm',
                            'views/record/edit-small',
                            {
                                model: model,
                                entityType: 'CEmployeeContact',
                                layoutName: 'detailSmall',
                                hideHeader: true,
                                relatedFieldList: ['contactTypes'],
                                isWide: true,
                                el: '.contact-edit-form',
                                containerEl: modalView.el
                            },
                            function (formView) {
                                formView.render();
                                //edited below 3 lines to stop the navigation of form
                                formView.getRouter().navigate = function () { };
                                formView.getRouter().dispatch = function () { };
                                formView.getRouter().navigateBack = function () { };
                                formView.listenTo(model, 'after:save', function () {
                                    self.contactData = model.getClonedAttributes();
                                    self.updateContactPane(self.contactData);
                                    self.getView('contactEditModal').close();
                                });
                            }
                        );
                    });
                });
            });
        },
        onEditContactModal: function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (!this.contactData || !this.contactData.id) {
                Espo.Ui.notify('Contact record not found', 'warning');
                return;
            }

            // ✅ SIDE / MODAL edit form
            this.createContactEditModal(this.contactData.id);
        },

        loadContactData: function () {
            var self = this;
            var employeeId = this.model.id;
            if (typeof employeeId === 'object') {
                employeeId = employeeId.id || this.model.get('id');
            }

            // console.log('🔍 TARGET Employee ID:', employeeId);
            // console.log('🔍 FULL Model:', this.model.attributes);

            Espo.Ajax.getRequest('CEmployeeContact', {
                select: 'id,name,no,contactTag,contactTypesIds,contactTypesNames,employeeId,employee,parentId,parent,assignedUserId',
                limit: 10
            }).then(function (response) {
                // console.log('🔍 ALL CEmployeeContact RECORDS:');
                console.table(response.list);  // Table format me exact fields dikhega

                if (response.list && response.list.length > 0) {
                    response.list.forEach(function (record, index) {
                        // console.log(`Record ${index}:`, {id: record.id,name: record.name,employeeId: record.employeeId,employee: record.employee,parentId: record.parentId,parent: record.parent});
                    });

                    // Try ALL possible matching patterns
                    var matchingRecord = response.list.find(function (record) {
                        var matches = false;
                        if (record.employeeId === employeeId) matches = true;
                        if (record.employee && record.employee.id === employeeId) matches = true;
                        if (record.parentId === employeeId) matches = true;
                        if (record.id === employeeId) matches = true;

                        // if (matches) console.log('✅ MATCH FOUND:', record);
                        return matches;
                    });

                    if (matchingRecord) {
                        self.contactData = matchingRecord;
                        self.updateContactPane(matchingRecord);
                        self.showEditContactButton();   // ✅ RECORD EXISTS
                    } else {
                        self.contactData = null;
                        self.showAddContactButton();    // ✅ NO RECORD
                    }
                }
            }).catch(function (error) {
                console.error('❌ API FAILED:', error);
            });
        },

        updateContactPane: function (contactData) {
            var $contactPane = this.$el.find('#contact');
            if (!$contactPane.length) return;

            // console.log('Updating contact pane with:', contactData);

            // ✅ EXACT FIELD MAPPING
            var name = contactData.name || '--';
            var noField = contactData.no || '--';  // "Enter Details" field
            var tag = contactData.contactTagName || contactData.contactTag || '--';
            var types = '';
            if (contactData.contactTypesIds && contactData.contactTypesNames) {
                // Match IDs with Names object
                contactData.contactTypesIds.forEach(function (id) {
                    if (contactData.contactTypesNames[id]) {
                        types += contactData.contactTypesNames[id] + ', ';
                    }
                });
                // Remove last comma
                types = types.replace(/, $/, '').trim();
            }
            // console.log('✅ Contact Types extracted:', types);

            $contactPane.find('[data-field="contactName"]').text(
                contactData.name || '--'
            );
            $contactPane.find('[data-field="contactNumber"]').text(noField);  // no field ko number me show
            $contactPane.find('[data-field="contactTag"]').text(tag);
            $contactPane.find('[data-field="contactTypes"]').text(types);
        },
        createContactAddModal: function () {
            var self = this;

            this.createView('contactAddModal', 'views/modal', {
                headerText: 'Add Contact',
                backdrop: true,
                templateContent: '<div class="contact-add-form"></div>',
            }, function (modalView) {

                modalView.render();

                self.getModelFactory().create('CEmployeeContact', function (model) {

                    // ✅ THIS IS THE KEY FIX
                    model.set({
                        employeeId: self.model.id,
                        employeeName: self.model.get('name'),
                        prentId: self.model.id,
                        parentType: 'CEmployee'
                    });

                    self.createView(
                        'contactAddForm',
                        'views/record/edit-small',
                        {
                            model: model,
                            entityType: 'CEmployeeContact',
                            layoutName: 'detailSmall',
                            hideHeader: true,
                            navigate: false,
                            readOnly: false,
                            isWide: true,
                            realtedFieldList: ['contactTypes'],
                            el: '.contact-add-form',
                            containerEl: modalView.el
                        },
                        function (formView) {
                            formView.render();

                            // 🚫 STOP PAGE REDIRECT
                            formView.getRouter().navigate = function () { };
                            formView.getRouter().dispatch = function () { };
                            formView.getRouter().navigateBack = function () { };

                            formView.listenTo(model, 'after:save', function () {
                                self.contactData = model.getClonedAttributes();
                                self.updateContactPane(self.contactData);
                                modalView.close();
                            });
                        }
                    );
                });
            });
        },
        onAddContactModal: function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.createContactAddModal();
        },
        showAddContactButton: function () {
            this.$el.find('#add-contact-btn').removeClass('hidden');
            this.$el.find('#edit-contact-btn').addClass('hidden');
        },

        showEditContactButton: function () {
            this.$el.find('#edit-contact-btn').removeClass('hidden');
            this.$el.find('#add-contact-btn').addClass('hidden');
        },
        clearContactPane: function () {
            var $pane = this.$el.find('#contact');
            $pane.find('[data-field]').text('--');
        },

        //Address functions including Edit
        createAddressEditModal: function (id) {
            var self = this;

            this.createView('addressEditModal', 'views/modal', {
                headerText: 'Edit Address',
                backdrop: true,
                templateContent: '<div class="address-edit-form"></div>',
            }, function (modalView) {

                modalView.render();

                /* ✅ REAL ENTITY MODEL */
                self.getModelFactory().create('CEmployeeAddress', function (model) {

                    model.set('id', id);

                    /* ✅ FETCH FIRST */
                    model.fetch().then(function () {

                        self.addressEditModel = model;
                        self.createView(
                            'addressForm',
                            'views/record/edit-small',
                            {
                                model: model,
                                entityType: 'CEmployeeAddress',
                                layoutName: 'detailSmall',
                                hideHeader: true,
                                //to stop the navigation of form
                                navigate: false,

                                /* 👇 THIS MUST BE STRING */
                                el: '.address-edit-form',

                                /* 👇 TELL ESPo WHERE TO SEARCH */
                                containerEl: modalView.el
                            },
                            function (formView) {
                                formView.render();
                                //edited below 3 lines to stop the navigation of form
                                formView.getRouter().navigate = function () { };
                                formView.getRouter().dispatch = function () { };
                                formView.getRouter().navigateBack = function () { };
                                formView.listenTo(model, 'after:save', function () {
                                    model.trigger('sync');
                                    self.addressData = model.getClonedAttributes();
                                    self.updateAddressPane(self.addressData);
                                    self.getView('addressEditModal').close();
                                });

                            }
                        );
                    });
                });
            });
        },

        // ✅ UPDATED: Your original onEditAddressModal - now super simple
        onEditAddressModal: function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (!this.addressData || !this.addressData.id) {
                Espo.Ui.notify('Address record not found', 'warning');
                return;
            }

            // ✅ Open SIDE / MODAL edit form instead of navigating
            this.createAddressEditModal(this.addressData.id);
        },

        // Update loadAddressData to store full data
        loadAddressData: function () {
            var self = this;

            return Espo.Ajax.getRequest('CEmployeeAddress', {
                where: [{
                    type: 'equals',
                    attribute: 'employeeId',
                    value: this.model.id
                }],
                limit: 1
            }).then(function (res) {

                if (!res.list || !res.list.length) {
                    self.addressData = null;

                    self.showAddAddressButton();
                    self.clearAddressPane();
                    return;
                }

                // 🟢 ADDRESS RECORD FOUND
                self.addressData = res.list[0];
                self.updateAddressPane(self.addressData);
                self.showEditAddressButton();
            });
        },

        updateAddressPane: function (data) {
            var $pane = this.$el.find('#address');

            $pane.find('[data-field="address"]').text(data.address || '--');
            $pane.find('[data-field="addressType"]').text(
                data.addressType || '--'
            );
            $pane.find('[data-field="city"]').text(data.cityName || '--');
            $pane.find('[data-field="state"]').text(data.stateName || '--');
            $pane.find('[data-field="country"]').text(data.countryName || '--');
        },

        showAddAddressButton: function () {
            this.$el.find('#add-address-btn').removeClass('hidden');
            this.$el.find('#edit-address-btn').addClass('hidden');
        },

        showEditAddressButton: function () {
            this.$el.find('#edit-address-btn').removeClass('hidden');
            this.$el.find('#add-address-btn').addClass('hidden');
        },

        clearAddressPane: function () {
            var $pane = this.$el.find('#address');

            $pane.find('[data-field]').text('--');
        },
        createAddressAddModal: function () {
            var self = this;

            this.createView('addressAddModal', 'views/modal', {
                headerText: 'Add Address',
                backdrop: true,
                templateContent: '<div class="address-add-form"></div>',
            }, function (modalView) {

                modalView.render();

                self.getModelFactory().create('CEmployeeAddress', function (model) {

                    // 🔗 LINK employee
                    model.set('employeeId', self.model.id);

                    self.createView(
                        'addressAddForm',
                        'views/record/edit-small',
                        {
                            model: model,
                            entityType: 'CEmployeeAddress',
                            layoutName: 'detailSmall',
                            hideHeader: true,
                            navigate: false,
                            el: '.address-add-form',
                            containerEl: modalView.el
                        },
                        function (formView) {
                            formView.render();
                            formView.getRouter().navigate = function () { };
                            formView.getRouter().dispatch = function () { };
                            formView.getRouter().navigateBack = function () { };
                            formView.listenTo(model, 'after:save', function () {
                                self.addressData = model.getClonedAttributes();
                                self.updateAddressPane(self.addressData);
                                self.showEditAddressButton();
                                modalView.close();
                            });
                        }
                    );
                });
            });
        },
        onAddAddressModal: function (e) {
            e.preventDefault();
            e.stopPropagation();

            this.createAddressAddModal();
        },
        renderAddButton: function () {
            var $container = this.$el.find('#address-action-buttons');
            $container.html(`
                <button class="btn btn-primary btn-sm"
                    data-action="add-address">
                    <i class="fas fa-plus"></i> Add
                </button>
            `);
        },
        renderEditButton: function () {
            var $container = this.$el.find('#address-action-buttons');
            $container.html(`
                <button class="btn btn-primary btn-sm"
                    data-action="edit-address">
                    <i class="fas fa-pencil-alt"></i> Edit
                </button>
            `);
        },


        //bank details functions including Edit
        loadBankData: function () {
            var self = this;
            var employeeId = this.model.id;
            self.employeeBanks = response.list;
            console.log('🔍 Loading bank data for Employee ID:', self.employeeBanks);
            if (!employeeId) return;

            Espo.Ajax.getRequest('CEmployeeBank', {
                select: 'id,name,bankHolderName,accountNO,accountType,banks,banksName,branchName,iFSCCode',
                where: [{ type: 'equals', attribute: 'employeeId', value: employeeId }],
                maxSize: 20,
                orderBy: 'createdAt',
                order: 'desc'
            }).then(function (response) {
                console.log('✅ Bank records loaded:', response.list.length);
                if (response.list && response.list.length > 0) {
                    self.updateBankPane(response.list);
                } else {
                    var $pane = self.$el.find('#bank-details');
                    $pane.find('.bank-records-list').html('<div class="muted">-- No bank accounts found --</div>');
                }
            }).catch(function (error) {
                console.error('❌ Bank load error:', error);
            });
        },


        createBankEditModal: function (id) {
            var self = this;

            this.createView('bankEditModal', 'views/modal', {
                headerText: 'Edit Bank Account',
                backdrop: true,
                templateContent: '<div class="bank-edit-form"></div>',
            }, function (modalView) {

                modalView.render();

                self.getModelFactory().create('CEmployeeBank', function (model) {

                    model.set('id', id);
                    model.fetch().then(function () {

                        self.bankEditModel = model;

                        self.createView(
                            'bankForm',
                            'views/record/edit-small',
                            {
                                model: model,
                                entityType: 'CEmployeeBank',
                                layoutName: 'detailSmall',
                                hideHeader: true,
                                el: '.bank-edit-form',
                                containerEl: modalView.el
                            },
                            function (formView) {

                                formView.render();

                                // 🔥 STOP NAVIGATION (same as your code)
                                formView.getRouter().navigate = function () { };
                                formView.getRouter().dispatch = function () { };
                                formView.getRouter().navigateBack = function () { };

                                formView.listenTo(model, 'after:save', function () {
                                    // 🔄 Reload bank list
                                    self.loadBankData();
                                    self.getView('bankEditModal').close();
                                });
                            }
                        );
                    });
                });
            });
        },
        onEditBankModal: function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Create new bank record
            Espo.Ui.notify('Create new bank functionality coming soon', 'info');
        },

        onEditBankModal: function (e) {
            e.preventDefault();
            e.stopPropagation();

            // 🔥 NEW BANK CREATE (Not placeholder)
            var self = this;

            this.createView('bankEditModal', 'views/modal', {
                headerText: 'Add New Bank Account',
                backdrop: true,
                templateContent: '<div class="bank-edit-form"></div>',
            }, function (modalView) {

                modalView.render();

                self.getModelFactory().create('CEmployeeBank', function (model) {
                    // 🔥 AUTO SET EMPLOYEE ID
                    model.set('employeeId', self.model.id);

                    self.createView(
                        'bankForm',
                        'views/record/edit-small',
                        {
                            model: model,
                            entityType: 'CEmployeeBank',
                            layoutName: 'detailSmall',
                            hideHeader: true,
                            el: '.bank-edit-form',
                            containerEl: modalView.el
                        },
                        function (formView) {
                            formView.render();

                            // Stop navigation (same as your pattern)
                            formView.getRouter().navigate = function () { };
                            formView.getRouter().dispatch = function () { };
                            formView.getRouter().navigateBack = function () { };

                            formView.listenTo(model, 'after:save', function () {
                                self.loadBankData();  // Reload list
                                self.getView('bankEditModal').close();
                                Espo.Ui.notify('Bank account saved', 'success', 2000);
                            });
                        }
                    );
                });
            });
        },


        updateBankPane: function (items) {
            var self = this;
            var $pane = this.$el.find('#bank-details');
            if (!$pane.length) return;

            var $list = $pane.find('.bank-records-list');
            $list.empty();

            if (!items || !items.length) {
                $list.html('<div class="muted">-- No bank accounts found --</div>');
                return;
            }

            items.forEach(function (bank) {
                self.bankDataMap[bank.id] = bank;

                var $card = $('<div/>').addClass('bank-card').css({
                    'border': '1px solid #e1e5e9',
                    'border-radius': '6px',
                    'padding': '12px',
                    'margin-bottom': '12px',
                    'background': '#fff',
                    'box-shadow': '0 1px 3px rgba(0,0,0,0.1)'
                });

                // 🔥 HEADER WITH BANK NAME + EDIT BUTTON (Past Experience jaisa)
                var $header = $('<div/>').css({
                    display: 'flex',
                    'justify-content': 'space-between',
                    'align-items': 'flex-start',
                    'margin-bottom': '12px',
                    'padding': '8px',
                    'background': '#f8f9fa',
                    'border-radius': '4px'
                });

                var $headerLeft = $('<div/>').css({
                    display: 'flex',
                    'flex-direction': 'column',
                    'align-items': 'flex-start'
                });

                // 🔥 EDIT BUTTON (Past Experience exact copy)
                var $editBtn = $('<button/>')
                    .addClass('btn btn-primary btn-xs')
                    .attr('data-action', 'edit-bank-record-action')
                    .attr('data-id', bank.id)
                    .text('Edit');

                // 🔥 BANK NAME (Account Holder HATAYA)
                $headerLeft.append(
                    $('<div/>').css({
                        'font-size': '11px',
                        color: '#666',
                        'font-weight': '500',
                        'margin-bottom': '2px'
                    }).text('Bank:')
                );
                $headerLeft.append(
                    $('<div/>').css({
                        'font-weight': '600',
                        'font-size': '14px',
                        color: '#333'
                    }).text(bank.banksName || bank.name || '--')
                );

                $header.append($headerLeft).append($editBtn);

                // 🔥 DETAILS TABLE (Past Experience jaisa)
                var $table = $('<div/>').css({ 'font-size': '13px', color: '#333' });
                var addRow = function (label, value) {
                    var $row = $('<div/>').css({
                        display: 'flex',
                        padding: '4px 0',
                        'border-bottom': '1px solid #f0f0f0'
                    });
                    var $lab = $('<div/>').css({
                        width: '120px',
                        color: '#444',
                        'font-weight': '600'
                    }).text(label + ':');
                    var $val = $('<div/>').css({ color: '#333', flex: 1 }).text(value || '--');
                    $row.append($lab).append($val);
                    $table.append($row);
                };

                // 🔥 NO Account Holder - Only Important Fields
                addRow('Account Number', bank.accountNO);
                addRow('Account Type', bank.accountType);
                addRow('Branch', bank.branchName);
                addRow('IFSC Code', bank.iFSCCode);

                $card.append($header).append($table);
                $list.append($card);
            });
        },

        loadBankRecords: function (employeeId) {
            console.log('📊 Loading banks for:', employeeId);

            const self = this;

            this.getCollectionFactory().create('CEmployeeBank', function (collection) {

                collection.where = [{
                    type: 'equals',
                    attribute: 'employeeId',
                    value: employeeId
                }];

                collection.fetch().then(function () {
                    console.log('✅ Bank data:', collection.models);
                    self.renderBankRecords(collection.models);
                }).catch(function (e) {
                    console.error('❌ Bank load error:', e);
                    self.$el.find('.bank-records-list').html(
                        '<div style="color:#ff4444;">Error loading bank records</div>'
                    );
                });
            });
        },

        loadEmployeeBanks: function (employeeId) {
            console.log('📊 Fetching banks for employee:', employeeId);

            // ✅ DIRECT CEmployeeBank API - Filter by employee field
            Espo.Ajax.getRequest('CEmployeeBank/action/list', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'employeeId',
                        value: employeeId
                    }
                ],
                maxSize: 20,
                orderBy: 'createdAt',
                order: 'desc'
            }).then(response => {
                this.employeeBanks = response.list;

                console.log('✅ SUCCESS - Banks found:', response.list.length);
                this.renderBanks(response.list);
            }).catch(error => {
                console.error('❌ API Error:', error);
                // FALLBACK: Try alternative endpoint
                this.loadBanksFallback(employeeId);
            });
        },

        loadBanksFallback: function (employeeId) {
            // ✅ FALLBACK METHOD - Raw SQL-like query
            $.ajax({
                url: 'api/v1/CEmployeeBank',
                type: 'GET',
                data: {
                    maxSize: 20,
                    where: [{
                        type: 'equals',
                        field: 'employeeId',
                        value: employeeId
                    }]
                },
                success: response => this.renderBanks(response.list),
                error: () => {
                    $('.bank-records-list').html('<div style="color:#ff6b6b;">No bank records found</div>');
                }
            });
        },

        renderBanks: function (banks) {
            const $list = $('.bank-records-list');

            if (!banks || banks.length === 0) {
                $list.html(`
            <div style="text-align:center; padding:80px 20px; color:#999;">
                <i class="fas fa-university" style="font-size:48px; opacity:0.3; margin-bottom:20px;"></i>
                <div style="font-size:18px; margin-bottom:10px;">No bank accounts</div>
                <div style="font-size:14px; opacity:0.7;">Add bank details to see here</div>
            </div>
        `);
                return;
            }

            // Clear loading
            $list.empty();

            // Render beautiful cards
            banks.forEach((bank, index) => {
                const html = `
            <div style="padding:20px; margin-bottom:15px; border:1px solid #e1e5e9; border-radius:12px; background:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.08); transition:all 0.3s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <h5 style="margin:0; font-size:18px; color:#2c3e50; font-weight:600;">
                        ${bank.bankHolderName || 'Account'}
                    </h5>
                    <span style="background:linear-gradient(135deg,#007bff,#0056b3); color:white; padding:6px 14px; border-radius:25px; font-size:12px; font-weight:500;">
                        ${bank.accountType || 'Bank Account'}
                    </span>
                </div>
                <strong style="color:#495057;">Account Number</strong>
                <div style="font-family:'Courier New',monospace; font-size:15px; color:#007bff; background:#f8f9ff; padding:12px; border-radius:8px; word-break:break-all; margin:12px 0; letter-spacing:1px;">
                    ${bank.accountNO || '**** **** ****'}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:13px; margin-top:8px;">
                    <div>
                        <strong style="color:#495057;">Bank:</strong> 
                        <span style="color:#6c757d;">${bank.banksName || 'N/A'}</span><br>
                        <strong style="color:#495057;">Branch:</strong> 
                        <span style="color:#6c757d;">${bank.branchName || 'N/A'}</span>
                    </div>
                    <div style="text-align:right;">
                        <strong style="color:#495057;">IFSC:</strong><br>
                        <code style="color:#28a745; background:#d4edda; padding:6px 12px; border-radius:6px; font-size:13px; font-weight:500; font-family:monospace;">
                            ${bank.iFSCCode || 'N/A'}
                        </code>
                    </div>
                </div>
            </div>
        `;
                $list.append(html);
            });
        },
        renderBankRecords: function (models) {
            var $list = this.$el.find('.bank-records-list');

            if (!models || !models.length) {
                $list.html('<div class="text-muted">No bank records found</div>');
                return;
            }

            var html = '';

            models.forEach(function (model) {
                var data = model.attributes;

                html += `
            <div class="bank-record">
                <div><strong>Bank:</strong> ${data.name || '--'}</div>
                <div><strong>Account No:</strong> ${data.accountNumber || '--'}</div>
            </div>
            <hr/>
        `;
            });

            $list.html(html);
        },

    });
});