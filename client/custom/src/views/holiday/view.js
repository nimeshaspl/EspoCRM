define('custom:views/holiday/view', ['view'], function (Dep) {
    return Dep.extend({
        template: 'custom:holiday/view',

        events: {
            'change #employeeFilter': 'actionFilterByEmployee',
            'click [data-action="createHoliday"]': 'actionCreateHoliday'

        },

        setup: function () {
            Dep.prototype.setup.call(this);
            console.log("Holiday view setup called");
            this.employeeList = [];
            this.selectedEmployeeId = null;
            this.isHR = false;
            this.holidayList = [];
            this.isRenderedOnce = false;
            var self = this;

            this.getUserRoles().then(function () {
                if (self.getUser().isAdmin() || self.isHR) {
                    self.loadEmployeeList();
                }
                if (self.isRenderedOnce) {
                    self.render();
                }
            });

            this.loadHolidays();
        },

        data: function () {
            console.log("this.isadmin:", this.getUser().isAdmin());
            console.log("this.isHR:", this.isHR);
            return {
                title: 'Holiday',
                userName: this.getUser().get('name') || '',
                holidayList: this.holidayList || [],
                isAdmin: this.getUser().isAdmin() || this.isHR, // ✅ FIXED
                employeeList: this.employeeList || [],
                selectedEmployeeId: this.selectedEmployeeId
            };
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            console.log("Holiday view afterRender called");
            console.log("Selected Employee ID:", this.isHR);
            if (this.selectedEmployeeId) {
                this.el.querySelector('#employeeFilter').value = this.selectedEmployeeId;
            }

            if (!this.isRenderedOnce) {
                this.isRenderedOnce = true;
            }

            var self = this;

            this.$el.off('click', '[data-action="selectOptionalHoliday"]');
            this.$el.on('click', '[data-action="selectOptionalHoliday"]', function (e) {
                e.preventDefault();
                self.actionSelectOptionalHoliday(e);
            });
            this.$el.off('click', '[data-action="RedoSelectOptionalHoliday"]');
            this.$el.on('click', '[data-action="RedoSelectOptionalHoliday"]', function (e) {
                e.preventDefault();
                self.actionRedoSelectOptionalHoliday(e);
            });
        },
        getUserRoles: function () {
            var self = this;
            return Espo.Ajax.getRequest('CAttendance/action/userRoles')
                .then(function (response) {
                    console.log('User Roles Response:', response);
                    // console.log('User Roles :', response.roles);
                    // console.log('User Roles :', response.roles.some(role => role.name === 'HR'));
                    self.isHR = response.roles.some(role => role.name === 'HR');

                    console.log('Is HR:', self.isHR);
                    return response.roles || [];
                })
                .catch(function (error) {
                    console.error('User Roles Error:', error);
                    return [];
                });
        },
        actionFilterByEmployee: function (e) {
            console.log("actionFilterByEmployee function is called");
            var selectedId = $(e.currentTarget).val();
            this.selectedEmployeeId = selectedId || null;

            this.loadHolidays(); // ✅ FIXED
        },
        actionCreateHoliday: function () {
            var self = this;
            console.log("Hodlilafj");
            var htmlContent = `
            <div class="container" style="margin:12px;">
                <form id="createHolidayForm">
                    <div class="row mb-3">
                        <div class="col-12">
                            <label class="form-label">Holiday Name</label>
                            <input type="text" class="form-control" id="name" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-12">
                            <label class="form-label">Type</label>
                            <select id="type" name="type" class="form-control" >
                                <option value="Optional" >Optional </option>
                                <option value="Mendatory" >Mandatory </option>
                            </select>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-12">
                            <label class="form-label">Location</label>
                            <select id="location" name="location" class="form-control">
                                <option value="India" >India</option>
                                <option value="USA" >USA</option>
                            </select>
                        </div>
                    </div>
                    <div class="row mb-4">
                        <div class="col-12">
                            <label class="form-label">Date</label>
                            <input type="date" class="form-control" id="date" required>
                        </div>
                    </div>

                    <div class="text-right">
                        <button type="submit" class="btn btn-primary px-5">Submit</button>
                    </div>
                </form>
            </div>
            `;

            this.simpleModal("Create Holiday Form", htmlContent);
            setTimeout(function () {

                $('#createHolidayForm').on('submit', function (e) {
                    e.preventDefault();

                    // ✅ Get values
                    var name = $('#name').val();
                    var type = $('#type').val();
                    var location = $('#location').val();
                    var date = $('#date').val();

                    if (!name || !type || !location || !date) {
                        Espo.Ui.warning('Please fill all fields');
                        return;
                    }

                    // ✅ Prepare payload
                    var data = {
                        name: name,
                        type: type,
                        location: location,
                        date: date,
                    };

                    // ✅ API call
                    Espo.Ajax.postRequest('CHoliday', data)
                        .then(function () {
                            Espo.Ui.success('Holiday Created Successfully');

                            // close modal
                            $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').remove();

                            self.reRender();
                        })
                        .catch(function () {
                            Espo.Ui.error('Failed to create holiday request');
                        });

                });

            }, 10);
        },

        loadEmployeeList: function () {
            var self = this;

            // Request users and include role names for client-side filtering when available
            Espo.Ajax.getRequest('User', {
                maxSize: 200,  // Limit for performance; adjust as needed
                select: 'id,name,roleNames',
                where: [
                    {
                        attribute: 'type',
                        type: 'equals',
                        value: 'regular' // Assuming 'regular' is the type for employees; adjust if different
                    }
                ]
            }).then(function (response) {
                console.log("Loaded Users: ", response);
                if (response && response.list) {
                    self.employeeList = response.list
                        .filter(function (user) {
                            if (typeof user.roleNames === 'undefined' || user.roleNames === null) {
                                return true; // fallback: show all users if role names are unavailable
                            }
                            return user.roleNames.includes('Employee');
                        })
                        .map(function (user) {
                            return {
                                id: user.id,
                                name: user.name
                            };
                        });

                    if (self.isRenderedOnce) {
                        self.render();
                        return;
                    }

                    var $dropdown = self.$el.find('#employeeFilter');
                    if ($dropdown.length) {
                        $dropdown.empty();
                        $dropdown.append('<option value="">All Employees</option>');

                        self.employeeList.forEach(function (user) {
                            var selected = user.id === self.selectedEmployeeId ? 'selected' : '';
                            $dropdown.append(
                                '<option value="' + user.id + '" ' + selected + '>' + user.name + '</option>'
                            );
                        });
                    }
                }
            }).catch(function (error) {
                console.error("Error loading users:", error);
            });
        },
        /**
         * Load holidays and the user's selection
         */
        loadHolidays: function () {
            var self = this;
            var userId = this.selectedEmployeeId || this.getUser().id;
            Espo.Ajax.getRequest('User/' + userId).then(function (response) {
                var userLocation = response.cLocation;
                console.log('User Location:', userLocation);

                // Fetch all holidays
                Espo.Ajax.getRequest('CHoliday?maxSize=100&orderBy=date&order=asc&where[0][attribute]=location&where[0][type]=equals&where[0][value]=' + userLocation)
                    .then(function (response) {
                        console.log("Loaded Holidays: ", response);
                        var list = response.list || [];

                        // Fetch user's selections
                        Espo.Ajax.getRequest(
                            'CHolidaySelection?where[0][attribute]=userId&where[0][type]=equals&where[0][value]=' + userId
                        ).then(function (response) {
                            var selections = response.list || [];
                            var selectionMap = {};
                            selections.forEach(function (sel) {
                                selectionMap[sel.holidayId] = sel.isSelected;
                            });

                            list.forEach(function (item) {
                                if (item.date) {
                                    var d = new Date(item.date + 'T00:00:00');
                                    item.formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                                    item.dayName = d.toLocaleDateString('en-GB', { weekday: 'long' });
                                }

                                item.statusText = selectionMap[item.id] ? 'Yes' : 'No';

                                item.imageUrl = item.holidayImageId ? '?entryPoint=image&id=' + item.holidayImageId : '';
                            });

                            self.holidayList = list;
                            self.render();
                        });
                    });
            });



        },

        /**
         * Toggle holiday selection for current user
         */
        actionSelectOptionalHoliday: function (e) {
            var self = this;
            var holidayId = $(e.currentTarget).data('id');

            if (!holidayId) return;

            if (!window.confirm("Are you sure you want to apply for your Optional leave?")) return;

            // Count selected optional holidays
            var selectedOptionalCount = self.holidayList.filter(h => h.type === "Optional" && h.statusText === "Yes").length;
            var holidayItem = self.holidayList.find(h => h.id === holidayId);
            var isAlreadySelected = holidayItem?.statusText === "Yes";

            if (!isAlreadySelected && selectedOptionalCount >= 3) {
                return Espo.Ui.info('You can only select a maximum of 3 optional holidays..', 5000);
            }

            var userId = self.selectedEmployeeId || self.getUser().id;

            // Optimized API: only fetch 1 record
            Espo.Ajax.getRequest(`CHolidaySelection?maxSize=1&select=id,isSelected&where[0][attribute]=userId&where[0][type]=equals&where[0][value]=${userId}&where[1][attribute]=holidayId&where[1][type]=equals&where[1][value]=${holidayId}`)
                .then(function (response) {
                    var records = response.list || [];
                    var promise;

                    if (records.length) {
                        // Toggle selection
                        var newStatus = !records[0].isSelected;
                        promise = Espo.Ajax.putRequest('CHolidaySelection/' + records[0].id, { isSelected: newStatus });
                        holidayItem.statusText = newStatus ? 'Yes' : 'No'; // update UI locally
                    } else {
                        promise = Espo.Ajax.postRequest('CHolidaySelection', {
                            userId: userId,
                            holidayId: holidayId,
                            isSelected: true
                        });
                        holidayItem.statusText = 'Yes'; // update UI locally
                    }

                    return promise;
                })
                .then(() => self.render()) // render updated list without full reload
                .catch(err => {
                    console.error(err);
                    Espo.Ui.error("Something went wrong");
                });
        },
        actionRedoSelectOptionalHoliday: function (e) {
            var self = this;
            var holidayId = $(e.currentTarget).data('id');

            if (!holidayId) return;

            if (!window.confirm("Are you sure you want to remove this optional holiday selection?")) return;

            var userId = self.selectedEmployeeId || self.getUser().id;

            // Step 1: Find the selection record
            Espo.Ajax.getRequest(
                `CHolidaySelection?maxSize=1&select=id&where[0][attribute]=userId&where[0][type]=equals&where[0][value]=${userId}&where[1][attribute]=holidayId&where[1][type]=equals&where[1][value]=${holidayId}`
            )
                .then(function (response) {
                    var records = response.list || [];

                    if (!records.length) {
                        return Espo.Ui.warning("No selection found to remove.");
                    }

                    var recordId = records[0].id;

                    // Step 2: Delete the record
                    return Espo.Ajax.deleteRequest('CHolidaySelection/' + recordId)
                        .then(function () {
                            Espo.Ui.success("Holiday selection removed");

                            // Step 3: Update UI locally (no full reload needed)
                            var holidayItem = self.holidayList.find(h => h.id === holidayId);
                            if (holidayItem) {
                                holidayItem.statusText = 'No';
                            }

                            self.render();
                        });
                })
                .catch(function (err) {
                    console.error(err);
                    Espo.Ui.error("Failed to remove selection");
                });
        },
        simpleModal: function (title, htmlContent) {
            var backdropId = 'helloBackdrop-' + Date.now();
            var modalId = 'helloModal-' + Date.now();

            var backdropHtml = `<div id="${backdropId}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 9998;"></div>`;

            var modalHtml = `
        <div id="${modalId}" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; width: 100%; max-width: 650px;">
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