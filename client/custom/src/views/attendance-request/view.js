define('custom:views/attendance-request/view', ['view', 'date-time'], function (Dep, DateTime) {
    return Dep.extend({
        template: 'custom:attendance-request/view',

        events: {
            'change #employeeFilter': 'filterByEmployee',
            // 'click .clockIn': 'actionClockIn',  // Add this line to bind clockIn
            'click [data-action="clockIn"]': 'actionClockIn', // Updated selector for clockIn
            'click [data-action="clockOut"]': 'actionClockOut', // Updated selector for clockOut
            'click [data-action="clockInRequest"]': 'actionClockInRequest', // Placeholder for future implementation
            'click [data-action="attendanceUpdate"]': 'actionAttendanceUpdate', // Placeholder for future implementation
            'click [data-action="editAttendance"]': 'actionEditAttendance' // Placeholder for future implementation
        },

        setup: function () {
            Dep.prototype.setup.call(this);
            console.log("Attendance Request View setup calleld");
            this.attendanceList = [];
            this.employeeList = [];
            this.isRenderedOnce = false; // ✅ NEW
            this.clockStatus = 'not_started';

            this.loadAttendanceRequest();
            this.loadEmployeeList(); // ✅ ALSO CALL THIS
        },
        afterRender: function () {
            if (this.selectedEmployeeId) {
                this.el.querySelector('#employeeFilter').value = this.selectedEmployeeId;
            }

            var self = this;

            // ✅ Remove previous bindings (important)
            this.$el.off('click', '[data-action="approveAttendanceRequest"]');
            this.$el.off('click', '[data-action="rejectAttendanceRequest"]');

            // ✅ Approve
            this.$el.on('click', '[data-action="approveAttendanceRequest"]', function (e) {
                e.preventDefault();
                self.actionApproveAttendanceRequest(e);
            });

            // ✅ Reject
            this.$el.on('click', '[data-action="rejectAttendanceRequest"]', function (e) {
                e.preventDefault();
                self.actionRejectAttendanceRequest(e);
            });
        },
        data: function () {
            // Mark selected employee manually (NO eq helper needed)
            var processedList = this.employeeList.map(function (emp) {
                return {
                    id: emp.id,
                    name: emp.name,
                    selected: emp.id === this.selectedEmployeeId
                };
            }.bind(this));

            return {
                userName: this.getUser().get('name') || '',
                attendanceList: this.attendanceList || [],
                isAdmin: this.getUser().isAdmin(),
                employeeList: processedList,
                selectedEmployeeId: this.selectedEmployeeId
            };
        },
        loadAttendanceRequest: function () {
            var self = this;

            var url = 'CAttendanceRequest?maxSize=200';

            if (this.selectedEmployeeId) {
                url += '&where[0][type]=equals';
                url += '&where[0][attribute]=assignedUserId';
                url += '&where[0][value]=' + this.selectedEmployeeId;
            }

            Espo.Ajax.getRequest(url)
                .then(function (response) {
                    console.log("Loaded attendance requests: ", response);

                    self.attendanceList = (response.list || []).map(function (item) {
                        return {
                            ...item,
                            clockInTime: item.clockIn
                                ? moment(item.clockIn, 'YYYY-MM-DD HH:mm:ss').format('HH:mm')
                                : '',
                            clockOutTime: item.clockOut
                                ? moment(item.clockOut, 'YYYY-MM-DD HH:mm:ss').format('HH:mm')
                                : ''
                            // clockInTime: item.clockIn
                            //     ? moment.utc(item.clockIn, 'YYYY-MM-DD HH:mm:ss').local().format('HH:mm')
                            //     : '',
                            // clockOutTime: item.clockOut
                            //     ? moment.utc(item.clockOut, 'YYYY-MM-DD HH:mm:ss').local().format('HH:mm')
                            //     : ''
                        };
                    });

                    self.render();

                }.bind(this));
        },
        loadEmployeeList: function () {
            var self = this;

            Espo.Ajax.getRequest('User', {
                maxSize: 200,
                where: [
                    {
                        type: 'equals',
                        attribute: 'type',
                        value: 'regular'
                    }
                ]
            }).then(function (response) {

                if (response && response.list) {

                    // Store users
                    self.employeeList = response.list.map(function (user) {
                        return {
                            id: user.id,
                            name: user.name
                        };
                    });

                    // Populate dropdown
                    var $dropdown = $('#employeeFilter');

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
        // ===============================
        // FILTER BY EMPLOYEE (FINAL WORKING)
        // ===============================
        filterByEmployee: function (e) {

            this.selectedEmployeeId = e.currentTarget.value;

            // ✅ Just reload data instead of collection.fetch
            this.loadAttendanceRequest();
        },
        actionApproveAttendanceRequest: function (e) {
            e.preventDefault();

            var self = this;
            var recordId = $(e.currentTarget).data('id');

            console.log("Reject clicked for ID:", recordId);
            if (!recordId) {
                Espo.Ui.warning('Record ID not found');
                return;
            }

            // ✅ Native JS Confirm Popup
            var isConfirmed = window.confirm("Are you sure you want to approve this attendance request?");

            if (!isConfirmed) {
                return; // ❌ Cancel → stop here
            }

            // ✅ Proceed if OK
            Espo.Ajax.putRequest('CAttendanceRequest/' + recordId, {
                status: 'Approved'
            }).then(function () {
                Espo.Ui.success('Attedance Approved');
                // ✅ Get user who created the request
                // var assignedUserId = response.createdById; // or use assignedUserId if applicable
                self.loadAttendanceRequest();
            }).catch(function (err) {
                // console.error(err);
                Espo.Ui.error('Error rejecting leave');
            });
        },

        actionRejectAttendanceRequest: function (e) {
            e.preventDefault();

            var self = this;
            var recordId = $(e.currentTarget).data('id');

            console.log("Reject clicked for ID:", recordId);

            if (!recordId) {
                Espo.Ui.warning('Record ID not found');
                return;
            }

            // ✅ Native JS Confirm Popup
            var isConfirmed = window.confirm("Are you sure you want to reject this attendance request?");

            if (!isConfirmed) {
                return; // ❌ Cancel → stop here
            }

            // ✅ Proceed if OK
            Espo.Ajax.putRequest('CAttendanceRequest/' + recordId, {
                status: 'Rejected'
            }).then(function () {
                Espo.Ui.success('Attendance Update Request is Rejected successfully.....!');
                self.loadAttendanceRequest();
            }).catch(function (err) {
                console.error(err);
                Espo.Ui.error('Error rejecting leave');
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

        initApprove: function () {
        },
        approve: function () {
            console.log("Approving Attendance Request...");
            if (!this.model) {
                Espo.Ui.warning('No record selected to approve');
                return;
            }
            if (this.model.get('status') === 'Approved') {
                Espo.Ui.warning('This request is already approved');
                return;
            }
            this.model.set('status', 'Approved'); // or your actual field value

            this.model.save().then(function () {
                Espo.Ui.success('Request Approved Successfully');
            }.bind(this)).catch(function () {
                Espo.Ui.error('Failed to approve request');
            });

        },
        initReject: function () {

        },
        reject: function () {

            console.log("Rejecting Attendance Request...");
            if (!this.model) {
                Espo.Ui.warning('No record selected to reject');
                return;
            }
            if (this.model.get('status') === 'Rejected') {
                Espo.Ui.warning('This request is already rejected');
                return;
            }
            this.model.set('status', 'Rejected'); // or your actual field value

            this.model.save().then(function () {
                Espo.Ui.success('Request Rejected Successfully');
            }.bind(this)).catch(function () {
                Espo.Ui.error('Failed to reject request');
            });
        },
    });
});