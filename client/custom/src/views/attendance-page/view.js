define('custom:views/attendance-page/view', ['view', 'date-time'], function (Dep, DateTime) {
    return Dep.extend({

        template: 'custom:attendance-page/view',

        events: {
            'change #employeeFilter': 'filterByEmployee',
            'click [data-action="clockIn"]': 'actionClockIn',
            'click [data-action="clockOut"]': 'actionClockOut',
            'click [data-action="clockInRequest"]': 'actionClockInRequest',
            'click [data-action="attendanceUpdate"]': 'actionAttendanceUpdate',
            'click [data-action="createAttendanceUpdate"]': 'actionCreateAttendance',
            'click [data-action="editAttendance"]': 'actionEditAttendance'
        },

        setup: function () {
            Dep.prototype.setup.call(this);
            console.log("Attendance Page Loaded");

            this.attendanceList = [];
            this.employeeList = [];
            this.selectedEmployeeId = null;
            this.employeeId = null;

            this.isEmployee = false;
            this.isHR = false;
            this.clockStatus = 'not_started';

            this.isRenderedOnce = false;

            this.summaryData = {
                presentDays: 0,
                absentDays: 0,
                leaveDays: 0,
                totalWorkingDays: 0,
                totalWork: "00:00:00",
                totalOt: "00:00:00",
                avgWork: "00:00:00",
                avgOt: "00:00:00"
            };

            this.getUserRoles();
            this.loadEmployeeList();
            this.initializePage();
        },

        initializePage: function () {
            Espo.Ajax.getRequest('CAttendance/action/todayStatus')
                .then(function (response) {
                    this.isEmployee = response.isEmployee || false;
                    this.employeeId = response.employeeId || null;

                    if (this.isEmployee) {
                        this.selectedEmployeeId = this.employeeId;
                    }

                    if (response.isClockedIn && !response.isClockedOut) {
                        this.clockStatus = 'clocked_in';
                    } else if (response.isClockedIn && response.isClockedOut) {
                        this.clockStatus = 'clocked_out';
                    } else {
                        this.clockStatus = 'not_started';
                    }

                    // Load summary first → THEN attendance
                    this.loadSummary().then(function () {
                        this.loadAttendance();
                    }.bind(this));

                }.bind(this))
                .catch(function () {
                    console.error('Status API failed');
                    this.loadAttendance(); // fallback
                }.bind(this));
        },

        afterRender: function () {
            if (this.selectedEmployeeId) {
                var filterEl = this.el.querySelector('#employeeFilter');
                if (filterEl) {
                    filterEl.value = this.selectedEmployeeId;
                }
            }

            this.$el.find('[data-action="clockIn"]').addClass('hidden');
            this.$el.find('[data-action="clockOut"]').addClass('hidden');

            this.updateClockButtons(this.clockStatus);
            console.log("Summary Data:", this.summaryData);
            // this.getUserRoles();
        },

        data: function () {
            var processedList = this.employeeList.map(function (emp) {
                return {
                    id: emp.id,
                    name: emp.name,
                    selected: emp.id === this.selectedEmployeeId
                };
            }.bind(this));
            console.log("this.isadmin:", this.getUser().isAdmin());
            console.log("this.isHR:", this.isHR);

            return {
                userName: this.getUser().get('name') || '',
                attendanceList: this.attendanceList || [],
                isAdmin: this.getUser().isAdmin() || this.isHR,
                isEmployee: this.isEmployee,
                employeeList: processedList,
                selectedEmployeeId: this.selectedEmployeeId,
                // ✅ Attendance Summary
                presentDays: this.summaryData.presentDays,
                absentDays: this.summaryData.absentDays,
                leaveDays: this.summaryData.leaveDays,
                totalWorkingDays: this.summaryData.totalWorkingDays,
                totalWork: this.summaryData.totalWork,
                totalOt: this.summaryData.totalOt,
                avgWork: this.summaryData.avgWork,
                avgOt: this.summaryData.avgOt
            };
        },
        getUserRoles: function () {
            var self = this;
            return Espo.Ajax.getRequest('CAttendance/action/userRoles')
                .then(function (response) {
                    console.log('User Roles Response:', response);
                    // console.log('User Roles :', response.roles);
                    // console.log('User Roles :', response.roles.some(role => role.name === 'HR'));
                    self.isHR = response.roles.some(role => role.name === 'HR');
                    // console.log('Is HR:', self.isHR);
                    return response.roles || [];
                })
                .catch(function (error) {
                    console.error('User Roles Error:', error);
                    return [];
                });
        },

        loadAttendance: function () {
            var url = 'CAttendance?maxSize=200';
            url += '&orderBy=date';
            url += '&order=desc';

            if (this.selectedEmployeeId) {
                url += '&where[0][type]=equals';
                url += '&where[0][attribute]=employeeId';
                url += '&where[0][value]=' + this.selectedEmployeeId;
            }

            Espo.Ajax.getRequest(url)
                .then(function (response) {
                    var today = moment().format('YYYY-MM-DD');

                    this.attendanceList = (response.list || []).map(function (item) {
                        return {
                            ...item,
                            clockInTime: item.firstClockIn ? moment.utc(item.firstClockIn).local().format('HH:mm') : '',
                            clockOutTime: item.lastClockOut ? moment.utc(item.lastClockOut).local().format('HH:mm') : '',
                            isToday: item.date === today
                        };
                    });

                    this.render();
                }.bind(this));
        },

        // =========================
        // LOAD MONTHLY SUMMARY
        // =========================
        loadSummary: function () {
            var self = this;

            var employeeId = this.selectedEmployeeId;

            // ✅ Admin without selection → ZERO
            if (!employeeId) {
                self.summaryData = {
                    presentDays: 0,
                    absentDays: 0,
                    leaveDays: 0,
                    totalWorkingDays: 0,
                    totalWork: "00:00:00",
                    totalOt: "00:00:00",
                    avgWork: "00:00:00",
                    avgOt: "00:00:00"
                };
                return Promise.resolve();
            }

            // ✅ Current Month Start & End
            var startOfMonth = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
            var endOfMonth = moment().endOf('month').format('YYYY-MM-DD 23:59:59');

            return Espo.Ajax.getRequest('CMonthlyAttendanceSummary', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'employeeId',
                        value: employeeId
                    },
                    {
                        type: 'greaterThanOrEquals',
                        attribute: 'createdAt',
                        value: startOfMonth
                    },
                    {
                        type: 'lessThanOrEquals',
                        attribute: 'createdAt',
                        value: endOfMonth
                    }
                ],
                orderBy: 'createdAt',
                order: 'desc',
                maxSize: 1
            }).then(function (response) {

                var summary = (response.list && response.list[0]) || null;

                // ✅ If no record → ZERO
                if (!summary) {
                    self.summaryData = {
                        presentDays: 0,
                        absentDays: 0,
                        leaveDays: 0,
                        totalWorkingDays: 0,
                        totalWork: "00:00:00",
                        totalOt: "00:00:00",
                        avgWork: "00:00:00",
                        avgOt: "00:00:00"
                    };
                    return;
                }

                // ✅ Map fields (INCLUDING totalWorkingDays)
                self.summaryData = {
                    presentDays: summary.presentDays || 0,
                    absentDays: summary.absentDays || 0,
                    leaveDays: summary.leaveDays || 0,
                    totalWorkingDays: summary.totalWorkingDays || 0,
                    totalWork: summary.workDuration || "00:00:00",
                    totalOt: summary.overtime || "00:00:00",
                    avgWork: summary.avgWorkDuration || "00:00:00",
                    avgOt: summary.avgOvertime || "00:00:00"
                };

            }).catch(function (err) {
                console.error('Failed to load summary', err);

                // ✅ Safety fallback
                self.summaryData = {
                    presentDays: 0,
                    absentDays: 0,
                    leaveDays: 0,
                    totalWorkingDays: 0,
                    totalWork: "00:00:00",
                    totalOt: "00:00:00",
                    avgWork: "00:00:00",
                    avgOt: "00:00:00"
                };
            });
        },

        filterByEmployee: function (e) {
            this.selectedEmployeeId = e.currentTarget.value;
            this.loadSummary().then(function () {
                this.loadAttendance();
            }.bind(this));
        },


        // =========================
        // LOAD EMPLOYEES
        // =========================
        loadEmployeeList: function () {
            Espo.Ajax.getRequest('CEmployee', { maxSize: 200 })
                .then(function (response) {

                    if (response && response.list) {
                        this.employeeList = response.list.map(function (emp) {
                            return {
                                id: emp.id,
                                name: emp.name
                            };
                        });
                    }

                }.bind(this));
        },
        // =========================
        // BUTTON VISIBILITY
        // =========================
        updateClockButtons: function (status) {

            let clockInBtn = this.$el.find('[data-action="clockIn"]');
            let clockOutBtn = this.$el.find('[data-action="clockOut"]');

            if (!clockInBtn.length || !clockOutBtn.length) return;

            if (status === 'not_started') {
                clockInBtn.removeClass('hidden').prop('disabled', false);
                clockOutBtn.addClass('hidden').prop('disabled', true);
            }

            else if (status === 'clocked_in') {
                clockInBtn.addClass('hidden').prop('disabled', true);
                clockOutBtn.removeClass('hidden').prop('disabled', false);
            }

            else if (status === 'clocked_out' || status === 'completed') {
                clockInBtn.addClass('hidden');
                clockOutBtn.addClass('hidden');
            }
        },

        // =========================
        // CLOCK IN
        // =========================
        actionClockIn: function () {
            var isWFH = this.getUser().get('cIsWorkFromHome');
            // console.log(this.getUser().attributes);
            console.log("Is Work From Home:", isWFH);
            if (!isWFH) {
                Espo.Ui.notify('You can\'t clock in/out manually because it\'s  only for work from home employees', 1000);
                return;
            }

            if (this.clockStatus !== 'not_started') {
                Espo.Ui.warning('Already clocked in');
                return;
            }

            // ✅ STEP 1: Set status immediately
            this.clockStatus = 'waiting'; // custom temporary state

            // ✅ Hide both buttons instantly
            this.$el.find('[data-action="clockIn"]').addClass('hidden');
            this.$el.find('[data-action="clockOut"]').addClass('hidden');

            // Greeting
            var hour = new Date().getHours();
            var greeting = '';

            if (hour < 12) {
                greeting = 'Good morning ! ';
            } else if (hour < 17) {
                greeting = 'Good afternoon ! ';
            } else {
                greeting = 'Good evening ! ';
            }

            Espo.Ajax.postRequest('CAttendance/action/clockIn', {})
                .then(function (response) {

                    if (response.status === 'success') {

                        Espo.Ui.success(greeting + 'You have successfully clocked in.', 5000);

                        // ✅ STEP 2: DO NOT call loadAttendance immediately
                        // (this breaks timer UI)

                        // ✅ STEP 3: Start timer
                        setTimeout(function () {

                            this.clockStatus = 'clocked_in';
                            this.updateClockButtons('clocked_in');

                            // ✅ NOW load attendance AFTER button visible
                            this.loadAttendance();

                        }.bind(this), 1000);

                    } else {
                        Espo.Ui.error(response.message || 'Clock In failed');

                        this.clockStatus = 'not_started';
                        this.updateClockButtons(this.clockStatus);
                    }

                }.bind(this))
                .catch(function () {
                    Espo.Ui.error('Clock In failed');

                    this.clockStatus = 'not_started';
                    this.updateClockButtons(this.clockStatus);
                });
        },

        // =========================
        // CLOCK OUT
        // =========================
        actionClockOut: function () {
            var isWFH = this.getUser().get('cIsWorkFromHome');
            // console.log(this.getUser().attributes);
            console.log("Is Work From Home:", isWFH);
            if (!isWFH) {
                Espo.Ui.notify('You can\'t clock in/out manually because it\'s  only for work from home employees', 1000);
                return;
            }
            if (this.clockStatus !== 'clocked_in') {
                Espo.Ui.warning('Clock in first');
                return;
            }

            this.clockStatus = 'clocked_out';
            this.updateClockButtons(this.clockStatus);

            // =========================
            // TIME-BASED FAREWELL
            // =========================
            var hour = new Date().getHours();
            var message = '';


            if (hour < 18) {
                message = 'Have a great day!';
            } else {
                message = 'Good night ! ';
            }

            Espo.Ajax.postRequest('CAttendance/action/clockOut', {})
                .then(function (response) {
                    if (response.status === 'success') {
                        Espo.Ui.success("You have successfully clocked out. " + message, 5000);
                        this.loadAttendance();
                    } else {
                        Espo.Ui.error(response.message || 'Clock Out failed', 5000);
                        this.clockStatus = 'clocked_in'; // revert
                        this.updateClockButtons(this.clockStatus);
                    }
                }.bind(this))
                .catch(function () {
                    Espo.Ui.error('Clock Out failed', 5000);
                    this.clockStatus = 'clocked_in'; // revert
                    this.updateClockButtons(this.clockStatus);
                });
        },
        actionAttendanceUpdate: function () {
            console.log("actionAttendanceUpdate function called.!");
            var self = this;
            console.log("Self:", self);
            if (!self.attendanceList || self.attendanceList.length === 0) {
                Espo.Ui.warning('No attendance record found to update . First clock in to update attendance');
                return;
            }
            console.log("Employee ID:", self.attendanceList[0].employeeId);

            const today = new Date();

            // ❌ Max = yesterday
            const max = new Date();
            max.setDate(today.getDate() - 1);

            // ❌ Min = 7 days before today
            const min = new Date();
            min.setDate(today.getDate() - 7);

            // ✅ Format function (local)
            function formatDate(d) {
                return d.getFullYear() + '-' +
                    String(d.getMonth() + 1).padStart(2, '0') + '-' +
                    String(d.getDate()).padStart(2, '0');
            }

            const maxDate = formatDate(max);
            const minDate = formatDate(min);

            var htmlContent = `
            <div class="container" style="margin:12px;">
                <form id="attendanceUpdateForm">
                    <div class="row mb-4">
                        <div class="col-12">
                            <label class="form-label">Date</label>
                            <input type="date" class="form-control" min="${minDate}"  max="${maxDate}" id="date" required>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Clock In Time</label>
                            <input type="time" min="08:00"  class="form-control" id="clockIn" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Clock Out Time</label>
                            <input type="time" min="08:00"  class="form-control" id="clockOut" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-12">
                            <label class="form-label">Reason</label>
                            <textarea class="form-control" id="reason" required></textarea>
                        </div>
                    </div>
                    <div class="text-right">
                        <button type="submit" class="btn btn-primary px-5" style="margin: 10px 0px;">Submit</button>
                    </div>
                </form>
            </div>
            `;

            this.simpleModal("Attendance Update Form", htmlContent);

            setTimeout(function () {
                var systemClockIn = null;
                var systemClockOut = null;

                $('#date').on('change', function () {

                    var selectedDate = $(this).val();
                    var employeeId = self.attendanceList[0].employeeId;

                    if (!selectedDate) return;

                    Espo.Ajax.getRequest('CAttendance', {
                        where: [
                            { type: 'equals', attribute: 'employeeId', value: employeeId },
                            { type: 'equals', attribute: 'date', value: selectedDate }
                        ],
                        maxSize: 1
                    }).then(function (response) {

                        var record = response.list[0];

                        if (!record) {
                            Espo.Ui.warning('Attendance record not found for selected date');

                            // ❌ Clear values
                            $('#clockIn').val('');
                            $('#clockOut').val('');

                            systemClockIn = null;
                            systemClockOut = null;

                            return;
                        }

                        // ✅ Convert UTC to local time (important)
                        if (record.firstClockIn) {
                            var clockIn = moment.utc(record.firstClockIn).local().format('HH:mm');
                            $('#clockIn').val(clockIn);
                            systemClockIn = record.firstClockIn;
                        }

                        if (record.lastClockOut) {
                            var clockOut = moment.utc(record.lastClockOut).local().format('HH:mm');
                            $('#clockOut').val(clockOut);
                            systemClockOut = record.lastClockOut;
                        }

                    }).catch(function () {
                        Espo.Ui.error('Error fetching attendance record');
                    });

                });

                $('#attendanceUpdateForm').on('submit', function (e) {
                    e.preventDefault();

                    // ✅ PREVENT DOUBLE SUBMIT (VERY IMPORTANT)
                    var $form = $(this);
                    var $submitBtn = $form.find('button[type="submit"]');

                    if ($submitBtn.prop('disabled')) {
                        return; // already submitting
                    }

                    $submitBtn.prop('disabled', true).text('Submitting...');

                    var reason = $('#reason').val();
                    var clockInTime = $('#clockIn').val();
                    var clockOutTime = $('#clockOut').val();
                    var date = $('#date').val();

                    if (!reason || !clockInTime || !clockOutTime || !date) {
                        Espo.Ui.warning('Please fill all fields');

                        $submitBtn.prop('disabled', false).text('Submit');
                        return;
                    }

                    var userId = self.getUser().get('id');

                    Espo.Ajax.getRequest('CLeaveRequest', {
                        where: [
                            { type: 'equals', attribute: 'assignedUserId', value: userId },
                            { type: 'equals', attribute: 'status', value: 'Approved' }
                        ],
                        maxSize: 200
                    }).then(function (response) {

                        var leaveList = response.list || [];

                        var isOnLeave = leaveList.some(function (leave) {
                            return date >= leave.startDate && date <= leave.endDate;
                        });

                        if (isOnLeave) {
                            Espo.Ui.warning("You have leave on that date.");

                            $submitBtn.prop('disabled', false).text('Submit');
                            return;
                        }

                        var clockInDateTime = moment(date + ' ' + clockInTime, 'YYYY-MM-DD HH:mm')
                            .utc()
                            .format('YYYY-MM-DD HH:mm:ss');

                        var clockOutDateTime = moment(date + ' ' + clockOutTime, 'YYYY-MM-DD HH:mm')
                            .utc()
                            .format('YYYY-MM-DD HH:mm:ss');

                        var data = {
                            reason: reason,
                            description: reason,
                            date: date,
                            clockIn: clockInDateTime,
                            clockOut: clockOutDateTime,
                            systemClockIn: systemClockIn,   // ✅ hidden but sent
                            systemClockOut: systemClockOut, // ✅ hidden but sent
                            name: self.getUser().get('name'),
                            assignedUserId: userId,
                            employeeId: self.attendanceList[0].employeeId
                        };

                        // ✅ CLOSE MODAL IMMEDIATELY (important fix)
                        $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').remove();

                        Espo.Ajax.postRequest('CAttendanceRequest', data)
                            .then(function () {
                                Espo.Ui.success('Attendance Update Request Created');
                                self.reRender();
                            })
                            .catch(function () {
                                Espo.Ui.error('Failed to create request');
                            })
                            .finally(function () {
                                // safety reset (if modal still exists in future reuse)
                                $submitBtn.prop('disabled', false).text('Submit');
                            });

                    }).catch(function () {
                        Espo.Ui.error('Error checking leave request');

                        $submitBtn.prop('disabled', false).text('Submit');
                    });
                });
            }, 10);
        },
        actionEditAttendance: function (e) {
            console.log("actionEditAttendance function called");

            var self = this;
            var recordId = $(e.currentTarget).data('id');

            if (!recordId) {
                Espo.Ui.warning('Record ID not found');
                return;
            }

            Espo.Ajax.getRequest('CAttendance/' + recordId).then(function (response) {

                var clockIn = '';
                var clockOut = '';

                if (response.firstClockIn) {
                    clockIn = moment.utc(response.firstClockIn).local().format('HH:mm');

                }

                if (response.lastClockOut) {
                    clockOut = moment.utc(response.lastClockOut).local().format('HH:mm');
                }

                var htmlContent = `
                <div class="container" style="margin:12px;">
                    <form id="editAttendanceForm">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label>Clock In Time</label>
                                <input type="time" class="form-control" id="clockIn" value="${clockIn || ''}" required>
                            </div>
                            <div class="col-md-6">
                                <label>Clock Out Time</label>
                                <input type="time" class="form-control" id="clockOut" value="${clockOut || ''}" required>
                            </div>
                        </div>
                        <div class="text-right" style="margin: 12px 0px;">
                            <button type="submit" class="btn btn-primary px-5">Submit</button>
                        </div>
                    </form>
                </div>
                `;

                self.simpleModal("Edit Attendance", htmlContent);

                // ✅ Attach submit AFTER modal is rendered
                setTimeout(function () {

                    $('#editAttendanceForm').off('submit').on('submit', function (event) {
                        event.preventDefault();

                        var updatedClockIn = $('#clockIn').val();   // HH:MM
                        var updatedClockOut = $('#clockOut').val(); // HH:MM

                        if (!updatedClockIn || !updatedClockOut) {
                            Espo.Ui.warning('Please fill both times');
                            return;
                        }

                        // 🔹 Convert time to seconds
                        function toSeconds(time) {
                            var parts = time.split(':');
                            return (+parts[0]) * 3600 + (+parts[1]) * 60;
                        }

                        var inSeconds = toSeconds(updatedClockIn);
                        var outSeconds = toSeconds(updatedClockOut);

                        // 🔥 Handle invalid case
                        if (outSeconds <= inSeconds) {
                            Espo.Ui.warning('Clock-out must be after clock-in');
                            return;
                        }

                        // 🔹 Calculate duration
                        var diff = outSeconds - inSeconds;

                        var hours = Math.floor(diff / 3600);
                        var minutes = Math.floor((diff % 3600) / 60);
                        var seconds = diff % 60;

                        // 🔹 Format HH:MM:SS
                        function pad(n) {
                            return n < 10 ? '0' + n : n;
                        }

                        var totalHours = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);

                        // 🔹 Combine with original date
                        var datePart = response.date
                            ? response.date
                            : null;

                        var updatedData = {
                            firstClockIn: datePart
                                ? moment(datePart + ' ' + updatedClockIn).utc().format('YYYY-MM-DD HH:mm:ss')
                                : null,

                            lastClockOut: datePart
                                ? moment(datePart + ' ' + updatedClockOut).utc().format('YYYY-MM-DD HH:mm:ss')
                                : null,
                            // ✅ NEW FIELDS
                            totalHours: totalHours,
                            status: "Present"
                        };

                        console.log("Updating with:", updatedData);

                        Espo.Ajax.putRequest('CAttendance/' + recordId, updatedData)
                            .then(function () {
                                Espo.Ui.success('Attendance updated successfully');
                                location.reload();
                            })
                            .catch(function (err) {
                                console.error(err);
                                Espo.Ui.error('Update failed');
                            });

                    });

                }, 100);
            });
        },
        actionCreateAttendance: function () {
            console.log("actionCreateAttendance function called");
            var self = this;
            const today = new Date();

            // 🔹 Max = yesterday
            const max = new Date();
            max.setDate(today.getDate() - 1);

            // 🔹 Min = 7 days before
            const min = new Date();
            min.setDate(today.getDate() - 7);

            function formatDate(d) {
                return d.getFullYear() + '-' +
                    String(d.getMonth() + 1).padStart(2, '0') + '-' +
                    String(d.getDate()).padStart(2, '0');
            }

            const maxDate = formatDate(max);
            const minDate = formatDate(min);

            // ✅ Modal HTML
            var htmlContent = `
            <div class="container" style="margin:12px;">
                <form id="attendanceUpdateForm">

                    <div class="row mb-3">
                        <div class="col-12">
                            <label class="form-label">Employee</label>
                            <select class="form-control" id="employee" required>
                                <option value="">Select Employee</option>
                            </select>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-12">
                            <label class="form-label">Date</label>
                            <input type="date" class="form-control" min="${minDate}" max="${maxDate}" id="date" required>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Clock In Time</label>
                            <input type="time" class="form-control" id="clockIn" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Clock Out Time</label>
                            <input type="time" class="form-control" id="clockOut" required>
                        </div>
                    </div>

                    <div class="text-right">
                        <button type="submit" class="btn btn-primary px-5">Submit</button>
                    </div>
                </form>
            </div>
            `;

            this.simpleModal("Create Attendance", htmlContent);

            setTimeout(function () {

                // ✅ Load Employees
                Espo.Ajax.getRequest('CEmployee', {
                    maxSize: 200
                }).then(function (response) {

                    var list = response.list || [];
                    var options = '<option value="">Select Employee</option>';

                    list.forEach(function (emp) {
                        options += `<option value="${emp.id}" data-user="${emp.userId || ''}">
                    ${emp.name}
                </option>`;
                    });

                    $('#employee').html(options);
                });

                // ✅ Submit Handler
                $('#attendanceUpdateForm').off('submit').on('submit', function (e) {
                    e.preventDefault();

                    var employeeId = $('#employee').val();
                    var userId = $('#employee option:selected').data('user');

                    var clockInTime = $('#clockIn').val();
                    var clockOutTime = $('#clockOut').val();
                    var date = $('#date').val();
                    console.log("Form Data:", { employeeId, userId, clockInTime, clockOutTime, date });

                    if (!employeeId) {
                        Espo.Ui.warning('Please select employee');
                        return;
                    }

                    if (!userId) {
                        Espo.Ui.warning('Selected employee has no linked user');
                        return;
                    }

                    if (!clockInTime || !clockOutTime || !date) {
                        Espo.Ui.warning('Please fill all fields');
                        return;
                    }

                    // 🔹 Convert time to seconds
                    function toSeconds(time) {
                        var parts = time.split(':');
                        return (+parts[0]) * 3600 + (+parts[1]) * 60;
                    }

                    var inSeconds = toSeconds(clockInTime);
                    var outSeconds = toSeconds(clockOutTime);

                    if (outSeconds <= inSeconds) {
                        Espo.Ui.warning('Clock-out must be after clock-in');
                        return;
                    }

                    // 🔹 Calculate total hours
                    var diff = outSeconds - inSeconds;

                    var hours = Math.floor(diff / 3600);
                    var minutes = Math.floor((diff % 3600) / 60);
                    var seconds = diff % 60;

                    function pad(n) {
                        return n < 10 ? '0' + n : n;
                    }

                    var totalHours = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);

                    // ✅ Leave Check
                    Espo.Ajax.getRequest('CLeaveRequest', {
                        where: [
                            {
                                type: 'equals',
                                attribute: 'assignedUserId',
                                value: userId
                            },
                            {
                                type: 'equals',
                                attribute: 'status',
                                value: 'Approved'
                            }
                        ],
                        maxSize: 200
                    }).then(function (response) {

                        var leaveList = response.list || [];

                        var isOnLeave = leaveList.some(function (leave) {
                            return date >= leave.startDate && date <= leave.endDate;
                        });

                        if (isOnLeave) {
                            Espo.Ui.warning("Employee is on leave for selected date");
                            $('#date').val('').focus();
                            return;
                        }

                        // ✅ DUPLICATE CHECK
                        Espo.Ajax.getRequest('CAttendance', {
                            where: [
                                {
                                    type: 'equals',
                                    attribute: 'employeeId',
                                    value: employeeId
                                },
                                {
                                    type: 'equals',
                                    attribute: 'date',
                                    value: date
                                }
                            ],
                            maxSize: 1
                        }).then(function (attendanceResponse) {

                            if ((attendanceResponse.list || []).length > 0) {
                                Espo.Ui.warning('Attendance already exists for this employee on selected date');
                                return;
                            }

                            // 🔹 Convert datetime
                            // var clockInDateTime = moment(date + ' ' + clockInTime).utc().format('YYYY-MM-DD HH:mm:ss');
                            // var clockOutDateTime = moment(date + ' ' + clockOutTime).utc().format('YYYY-MM-DD HH:mm:ss');
                            var clockInDateTime = date + ' ' + clockInTime + ':00';
                            var clockOutDateTime = date + ' ' + clockOutTime + ':00';
                            // ✅ Save Attendance
                            var data = {
                                name: self.getUser().get('name') + ' - ' + date,
                                date: date,
                                firstClockIn: clockInDateTime,
                                lastClockOut: clockOutDateTime,
                                totalHours: totalHours,
                                status: "Present",
                                assignedUserId: userId,
                                employeeId: employeeId
                            };

                            Espo.Ajax.postRequest('CAttendance', data)
                                .then(function () {
                                    Espo.Ui.success('Attendance created successfully');
                                    $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').remove();
                                    self.reRender();
                                })
                                .catch(function () {
                                    Espo.Ui.error('Failed to create attendance');
                                });

                        }).catch(function () {
                            Espo.Ui.error('Error checking duplicate attendance');
                        });

                    }).catch(function () {
                        Espo.Ui.error('Error checking leave');
                    });

                });

            }, 10);
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