define('custom:views/c-attendance/list', ['views/list'], function (Dep) {

    return Dep.extend({

        template: 'custom:/c-attendance/list',

        events: {
            'change #employeeFilter': 'filterByEmployee',
            // 'click .clockIn': 'actionClockIn',  // Add this line to bind clockIn
            'click [data-action="clockIn"]': 'actionClockIn', // Updated selector for clockIn
            'click [data-action="clockOut"]': 'actionClockOut', // Updated selector for clockOut
            'click [data-action="clockInRequest"]': 'actionClockInRequest', // Placeholder for future implementation
            'click [data-action="attendanceUpdate"]': 'actionAttendanceUpdate', // Placeholder for future implementation
            'click [data-action="truncateTable"]': 'actionTruncateTable'
        },

        actionTruncateTable: function () {
            var tableName = prompt("Enter table name to truncate:");

            if (!tableName) return;

            Espo.Ajax.postRequest('TruncateTable/action/truncate', {
                tableName: tableName
            }).then(response => {
                Espo.Ui.success(response.message);
            }).catch(error => {
                Espo.Ui.error(error.message || 'Error occurred');
            });
        },

        actionClockInRequest: function () {
            // Espo.Ajax.postRequest('CAttendance/action/clockInRequest', {})
            //     .then(function (response) {
            //         console.log('Clock In Request Response:', response);
            //         this.checkTodayStatus();

            //     }.bind(this))
            //     .catch(function (error) {
            //         console.error('Clock In Error:', error);
            //         Espo.Ui.error('Clock In Request failed.');
            //     });
            Espo.Ui.warning('Clock-In Request functionality is not implemented yet.');
        },

        actionAttendanceUpdate: function () {
            console.log('Attendance Update button clicked');
            Espo.Ui.warning('Attendance Update functionality is not implemented yet.');
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            console.log('CAttendance List View initialized....!!!!!!!!!');

            this.summaryData = {
                presentDays: 0,
                absentDays: 0,
                leaveDays: 0,
                leaveHours: 0,
                totalWork: '00:00:00',
                totalOt: '00:00:00',
                avgWork: '00:00:00',
                avgOt: '00:00:00'
            };

            this.isAdmin = this.getUser().isAdmin();
            console.log('Is Admin:', this.isAdmin);
            this.employeeList = [];
            this.selectedEmployeeId = '';
            this.currentFilterWhere = [];

            if (this.isAdmin) {
                this.loadEmployeeList();
            }

            this.listenTo(this.collection, 'sync', function () {
                this.calculateSummary();
                this.reRender();
            }.bind(this));

            // this.checkTodayStatus();
        },

        // ===============================
        // PASS DATA TO TEMPLATE
        // ===============================
        data: function () {

            // Mark selected employee manually (NO eq helper needed)
            var processedList = this.employeeList.map(function (emp) {
                return {
                    id: emp.id,
                    name: emp.name,
                    selected: emp.id === this.selectedEmployeeId
                };
            }.bind(this));

            return _.extend(
                Dep.prototype.data.call(this),
                this.summaryData,
                {
                    isAdmin: this.isAdmin,
                    employeeList: processedList,
                    selectedEmployeeId: this.selectedEmployeeId
                }
            );
        },

        // ===============================
        // LOAD EMPLOYEES
        // ===============================
        loadEmployeeList: function () {
            Espo.Ajax.getRequest('CEmployee', {
                maxSize: 200
            }).then(function (response) {

                if (response && response.list) {

                    this.employeeList = response.list.map(function (emp) {
                        return {
                            id: emp.id,
                            name: emp.name
                        };
                    });
                    this.reRender();
                }

            }.bind(this));
        },



        // ===============================
        // FILTER BY EMPLOYEE (FINAL WORKING)
        // ===============================
        filterByEmployee: function (e) {

            var employeeId = e.currentTarget.value;

            this.selectedEmployeeId = employeeId;

            if (!employeeId) {

                // 🔥 Reset collection completely
                this.collection.fetch({
                    where: []
                });

                return;
            }

            this.collection.fetch({
                where: [
                    {
                        type: 'equals',
                        attribute: 'employeeId',
                        value: employeeId
                    }
                ]
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);

            if (this.selectedEmployeeId) {
                this.el.querySelector('#employeeFilter').value = this.selectedEmployeeId;

            }
            this.checkTodayStatus(); // Ensure buttons are correct after render
            this.getUserRoles(); // Fetch user roles
        },

        // ===============================
        // SUMMARY CALCULATION
        // ===============================
        calculateSummary: function () {

            if (!this.collection || !this.collection.models) return;

            var present = 0;
            var absent = 0;
            var leave = 0;

            var totalWorkSeconds = 0;
            var totalOtSeconds = 0;

            this.collection.models.forEach(function (model) {

                var status = model.get('status');
                var work = model.get('totalHours');

                if (status === 'Present') present++;
                if (status === 'Absent') absent++;
                if (status === 'Leave') leave++;

                if (typeof work === 'number' && !isNaN(work)) {

                    totalWorkSeconds += work * 3600;

                    if (work > 9) {
                        var overtime = work - 9;
                        totalOtSeconds += overtime * 3600;
                    }
                }

            });

            var avgWorkSeconds = present > 0 ? totalWorkSeconds / present : 0;
            var avgOtSeconds = present > 0 ? totalOtSeconds / present : 0;

            function secondsToTime(sec) {
                sec = Math.floor(sec);

                var h = Math.floor(sec / 3600);
                var m = Math.floor((sec % 3600) / 60);
                var s = sec % 60;

                return ('0' + h).slice(-2) + ':' +
                    ('0' + m).slice(-2) + ':' +
                    ('0' + s).slice(-2);
            }

            this.summaryData.presentDays = present;
            this.summaryData.absentDays = absent;
            this.summaryData.leaveDays = leave;
            this.summaryData.leaveHours = leave * 8;

            this.summaryData.totalWork = secondsToTime(totalWorkSeconds);
            this.summaryData.avgWork = secondsToTime(avgWorkSeconds);

            this.summaryData.totalOt = secondsToTime(totalOtSeconds);
            this.summaryData.avgOt = secondsToTime(avgOtSeconds);
        },

        // ===============================
        // TODAY STATUS
        // ===============================
        checkTodayStatus: function () {
            Espo.Ajax.getRequest('CAttendance/action/todayStatus')
                .then(function (response) {

                    console.log('Today Status Full Response:', response);

                    if (response.isEmployee) {

                        // ✅ Decide status from booleans (fixed backend)
                        let status = '';

                        if (response.isClockedIn) {
                            status = 'clocked_in';
                            Espo.Ui.success('You are clocked in.');

                        } else if (response.isClockedOut) {
                            status = 'clocked_out';
                            Espo.Ui.warning('You already clocked out today.');

                        } else {
                            status = 'not_started';
                            Espo.Ui.success('You have not clocked in yet.');
                        }

                        // ✅ Update buttons correctly
                        this.updateClockButtons(status);

                    } else {
                        Espo.Ui.warning('You are not an employee. Clock In/Out actions are unavailable.');
                    }

                    return response;

                }.bind(this))
                .catch(function (error) {
                    console.error('Today Status Error:', error);
                    Espo.Ui.error('Error fetching today status.');
                });
        },
        getUserRoles: function () {
            return Espo.Ajax.getRequest('CAttendance/action/userRoles')
                .then(function (response) {
                    console.log('User Roles Response:', response);
                    return response.roles || [];
                })
                .catch(function (error) {
                    console.error('User Roles Error:', error);
                    return [];
                });
        },

        actionClockIn: function () {
            Espo.Ajax.postRequest('CAttendance/action/clockIn', {})
                .then(function (response) {

                    console.log('Clock In Response:', response);

                    if (response.status === 'success') {
                        Espo.Ui.success(response.message);
                        this.updateClockButtons('clocked_in');
                    } else {
                        Espo.Ui.error(response.message);
                    }

                    this.collection.fetch();

                }.bind(this))
                .catch(function (error) {
                    console.error('Clock In Error:', error);
                    Espo.Ui.error('Clock In failed.');
                });
        },

        actionClockOut: function () {

            Espo.Ajax.postRequest('CAttendance/action/clockOut', {})
                .then(function (response) {

                    console.log('Clock Out Response:', response);

                    if (response.status === 'success') {
                        Espo.Ui.success(response.message);
                        // ✅ Immediately reflect UI
                        this.updateClockButtons('clocked_out');
                    } else {
                        Espo.Ui.error(response.message);
                    }

                    this.collection.fetch();

                }.bind(this))
                .catch(function (error) {
                    console.error('Clock Out Error:', error);
                    Espo.Ui.error('Clock Out failed.');
                });
        },
        updateClockButtons: function (status) {

            if (status === 'clocked_in') {
                this.$el.find('[data-action="clockIn"]').addClass('hidden');
                this.$el.find('[data-action="clockOut"]').removeClass('hidden');
            } else {
                this.$el.find('[data-action="clockIn"]').removeClass('hidden');
                this.$el.find('[data-action="clockOut"]').addClass('hidden');
            }
        }




    });

});
