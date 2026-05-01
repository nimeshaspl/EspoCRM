define('custom:views/leave/view', ['view'], function (Dep) {
    return Dep.extend({

        template: 'custom:leave/view',

        events: {
            'click [data-action="creditLeave"]': 'actionCreditLeave',
            'click [data-action="debitLeave"]': 'actionDebitLeave',
            'click [data-action="applyForLeave"]': 'actionApplyForLeave',
            'click [data-action="applyForEmployeeLeave"]': 'actionApplyForEmployeeLeave',
            'change #employeeFilter': 'actionFilterByEmployee',
            'change #yearFilter': 'actionFilterByYear'
        },

        data: function () {
            return {
                title: 'Leave',
                userName: this.getUser().get('name') || '',
                loginUserId: this.getUser().get('id'),
                isAdmin: this.getUser().isAdmin() || this.isHR,
                isEmployee: this.isEmployee,
                leaveList: this.leaveList || [],
                pendingLeaveList: this.pendingLeaveList || [],
                myLeaveList: this.myLeaveList || [],
                myLeaveHistoryList: this.myLeaveHistoryList || [],
                allLeaveList: this.allLeaveList || [],
                pendingAllLeaveList: this.pendingAllLeaveList || [],
                employeeList: this.employeeList || [],
                // ── Login user's own balance (My Leave section)
                leaveBalance: this.leaveBalance || 0,
                totalUnpaidLeaves: this.totalUnpaidLeaves || 0,
                // ── Selected employee's balance (Team Leave section)
                selectedEmployeeId: this.selectedEmployeeId || null,
                selectedEmployeeName: this.selectedEmployeeName || '',
                selectedLeaveBalance: this.selectedLeaveBalance || 0,
                selectedUnpaidLeaves: this.selectedUnpaidLeaves || 0,
                hasSelectedEmployee: !!this.selectedEmployeeId,
                // ── Year filter options
                yearList: this.yearList || [],
                selectedYear: this.selectedYear || '',
            };
        },

        getFilterYear: function () {
            return this.selectedYear || new Date().getFullYear().toString();
        },

        appendFiscalYearWhere: function (where) {
            where = where || [];

            var year = this.getFilterYear();

            if (year) {
                where.push({ type: 'equals', attribute: 'fiscalYear', value: year });
            }

            return where;
        },

        refreshYearFilteredData: function () {
            this.loadLeaveRequests();

            if (!this.getUser().isAdmin() && !this.isHR) {
                this.fetchLeaveBalance();
                this.loadUnpaidLeaves();
            }

            if ((this.getUser().isAdmin() || this.isHR) && this.isEmployee) {
                this.fetchLeaveBalance(this.getUser().get('id'));
                this.loadUnpaidLeaves(this.getUser().get('id'));
            }

            this.loadSelectedEmployeeUnpaidLeaves(this.selectedEmployeeId);
            this.fetchSelectedEmployeeLeaveBalance(this.selectedEmployeeId);
        },

        setup: function () {
            Dep.prototype.setup.call(this);
            this.leaveBalance = 0;
            this.isRenderedOnce = false;
            this.isEmployee = false;
            this.isHR = false;
            this.currentTab = 'tab1';
            this.leaveList = [];
            this.pendingLeaveList = [];
            this.myLeaveList = [];
            this.myLeaveHistoryList = [];
            this.allLeaveList = [];
            this.pendingAllLeaveList = [];
            this.employeeList = [];
            this.selectedEmployeeId = null;
            this.totalUnpaidLeaves = 0;

            // Year filter options
            this.yearList = [];
            this.selectedYear = '';

            // ✅ Selected employee balance (shown in Team Leave section)
            this.selectedEmployeeName = '';
            this.selectedLeaveBalance = 0;
            this.selectedUnpaidLeaves = 0;

            // ✅ Store all employee IDs visible to the login user (for leave filtering)
            this.visibleEmployeeIds = [];

            // ✅ Register Handlebars helper: ifNotEqual
            if (typeof Handlebars !== 'undefined') {
                if (!Handlebars.helpers['ifNotEqual']) {
                    Handlebars.registerHelper('ifNotEqual', function (a, b, options) {
                        return (a !== b) ? options.fn(this) : options.inverse(this);
                    });
                }
                if (!Handlebars.helpers['statusBadgeClass']) {
                    Handlebars.registerHelper('statusBadgeClass', function (status) {
                        var map = {
                            'Pending': 'badge-pending',
                            'Approved': 'badge-approved',
                            'Rejected': 'badge-rejected',
                            'Cancelled': 'badge-cancelled',
                        };
                        return map[status] || 'badge-pending';
                    });
                }
            }

            // Wait for roles to resolve before loading any data,
            // so this.isHR is correctly set for all downstream checks.
            var self = this;
            this.getUserRoles().then(function () {
                self.loadEmployeeList();
                self.loadYearList().then(function () {
                    self.initializePage();
                });
            });
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            var self = this;

            if (this.selectedEmployeeId) {
                var filterEl = this.el.querySelector('#employeeFilter');
                if (filterEl) filterEl.value = this.selectedEmployeeId;
            }

            if (this.selectedYear) {
                var yearFilterEl = this.el.querySelector('#yearFilter');
                if (yearFilterEl) yearFilterEl.value = this.selectedYear;
            }

            if (!this.isRenderedOnce) {
                this.isRenderedOnce = true;
            }

            // ✅ Remove previous bindings (important)
            this.$el.off('click', '[data-action="approveRequest"]');
            this.$el.off('click', '[data-action="rejectRequest"]');
            this.$el.off('click', '[data-action="deleteLeaveRequest"]');
            this.$el.off('click', '[data-action="cancelLeaveRequest"]');
            this.$el.off('click', '[data-action="revokeRequest"]');

            this.$el.on('click', '[data-action="approveRequest"]', function (e) {
                e.preventDefault();
                self.actionApproveRequest(e);
            });

            this.$el.on('click', '[data-action="rejectRequest"]', function (e) {
                e.preventDefault();
                self.actionRejectRequest(e);
            });

            this.$el.on('click', '[data-action="cancelLeaveRequest"]', function (e) {
                e.preventDefault();
                self.actionCancelLeaveRequest(e);
            });

            this.$el.on('click', '[data-action="deleteLeaveRequest"]', function (e) {
                e.preventDefault();
                self.actionDeleteLeaveRequest(e);
            });

            this.$el.on('click', '[data-action="revokeRequest"]', function (e) {
                e.preventDefault();
                self.actionRevokeRequest(e);
            });
        },
        loadYearList: function () {
            var self = this;

            return Espo.Ajax.getRequest('CLeaveBalance', {
                select: ['fiscalYear'],
                maxSize: 200,
            }).then(function (response) {

                var years = [];

                response.list.forEach(function (item) {
                    if (item.fiscalYear && years.indexOf(item.fiscalYear) === -1) {
                        years.push(item.fiscalYear);
                    }
                });

                // Sort descending (latest first)
                years.sort(function (a, b) {
                    return b - a;
                });

                self.yearList = years;

                // ✅ Default select latest year
                if (years.length > 0) {
                    self.selectedYear = years[0];
                } else {
                    self.selectedYear = new Date().getFullYear().toString();
                }

                self.reRender();

                return years;
            }).catch(function (err) {
                console.error('Error loading year list:', err);
                self.yearList = [new Date().getFullYear().toString()];
                self.selectedYear = self.yearList[0];
                self.reRender();
                return self.yearList;
            });
        },

        actionFilterByYear: function (e) {
            var selectedYear = $(e.currentTarget).val();

            this.selectedYear = selectedYear || (this.yearList[0] || new Date().getFullYear().toString());
            this.refreshYearFilteredData();
        },

        actionFilterByEmployee: function (e) {
            var selectedId = $(e.currentTarget).val();
            this.selectedEmployeeId = selectedId || null;

            // ✅ Store selected employee name for display in Team Leave section
            if (selectedId) {
                var selectedOption = $(e.currentTarget).find('option:selected');
                this.selectedEmployeeName = selectedOption.text() || '';
            } else {
                this.selectedEmployeeName = '';
                this.selectedLeaveBalance = 0;
                this.selectedUnpaidLeaves = 0;
            }

            this.loadAllLeaveRequests();
            this.loadSelectedEmployeeUnpaidLeaves(this.selectedEmployeeId);
            this.fetchSelectedEmployeeLeaveBalance(this.selectedEmployeeId);
        },

        // =====================================================================
        // ✅ Fetch leave balance for selected employee (Team Leave section only)
        // Does NOT affect login user's own leaveBalance in My Leave section
        // =====================================================================
        fetchSelectedEmployeeLeaveBalance: function (userId) {
            var self = this;

            if (!userId) {
                self.selectedLeaveBalance = 0;
                self.reRender();
                return Promise.resolve(0);
            }

            return Espo.Ajax.getRequest('CLeaveBalance', {
                where: this.appendFiscalYearWhere([
                    { type: 'equals', attribute: 'userId', value: userId },
                ])
            }).then(function (response) {
                var list = response.list || [];
                self.selectedLeaveBalance = list.length > 0 ? (parseFloat(list[0].balance) || 0) : 0;
                // console.log('Selected Employee Paid Balance:', self.selectedLeaveBalance);
                self.reRender();
                return self.selectedLeaveBalance;
            }).catch(function (err) {
                console.error('Error fetching selected employee leave balance:', err);
                self.selectedLeaveBalance = 0;
                self.reRender();
                return 0;
            });
        },

        // =====================================================================
        // ✅ Fetch unpaid leaves for selected employee (Team Leave section only)
        // Does NOT affect login user's own totalUnpaidLeaves in My Leave section
        // =====================================================================
        loadSelectedEmployeeUnpaidLeaves: function (userId) {
            var self = this;

            if (!userId) {
                self.selectedUnpaidLeaves = 0;
                self.reRender();
                return;
            }

            Espo.Ajax.getRequest('CLeaveRequest', {
                where: this.appendFiscalYearWhere([
                    { type: 'equals', attribute: 'status', value: 'Approved' },
                    { type: 'equals', attribute: 'leaveType', value: 'Unpaid' },
                    { type: 'equals', attribute: 'userId', value: userId },
                ]),
                maxSize: 200
            }).then(function (response) {
                var list = response.list || [];
                var total = 0;
                list.forEach(function (leave) {
                    if (leave.days) {
                        total += parseFloat(leave.days) || 0;
                    } else if (leave.startDate && leave.endDate) {
                        var start = moment(leave.startDate);
                        var end = moment(leave.endDate);
                        total += end.diff(start, 'days') + 1;
                    }
                });
                self.selectedUnpaidLeaves = total;
                // console.log('Selected Employee Unpaid Leaves:', total);
                self.reRender();
            }).catch(function (err) {
                console.error('Error fetching selected employee unpaid leaves:', err);
                self.selectedUnpaidLeaves = 0;
                self.reRender();
            });
        },

        initializePage: function () {
            Espo.Ajax.getRequest('CAttendance/action/todayStatus')
                .then(function (response) {
                    // console.log('Today Status:', response);
                    this.isEmployee = response.isEmployee || false;

                    this.loadLeaveRequests();

                    if (!this.getUser().isAdmin() && !this.isHR) {
                        this.fetchLeaveBalance();
                        this.loadUnpaidLeaves();
                    }

                    if ((this.getUser().isAdmin() || this.isHR) && this.isEmployee) {
                        this.fetchLeaveBalance(this.getUser().get('id'));
                        this.loadUnpaidLeaves(this.getUser().get('id'));
                    }

                }.bind(this))
                .catch(function () {
                    console.error('Status API failed');
                    this.loadLeaveRequests();
                }.bind(this));
        },

        getUserRoles: function () {
            var self = this;
            return Espo.Ajax.getRequest('CAttendance/action/userRoles')
                .then(function (response) {
                    self.isHR = response.roles.some(function (role) { return role.name === 'HR'; });
                    return response.roles || [];
                })
                .catch(function (error) {
                    console.error('User Roles Error:', error);
                    return [];
                });
        },

        // =====================================================================
        // ✅ Recursively fetch all subordinate employee IDs under given managers
        // Walks ManagerMapping: approverId → assignedUserId (recursive)
        // =====================================================================
        fetchSubordinateIds: function (managerIds, alreadyFetched) {
            var self = this;
            alreadyFetched = alreadyFetched || [];

            var newManagerIds = managerIds.filter(function (id) {
                return alreadyFetched.indexOf(id) === -1;
            });

            if (!newManagerIds.length) {
                return Promise.resolve([]);
            }

            newManagerIds.forEach(function (id) {
                alreadyFetched.push(id);
            });

            return Espo.Ajax.getRequest('ManagerMapping', {
                where: [{
                    type: 'in',
                    attribute: 'approverId',
                    value: newManagerIds
                }],
                maxSize: 200
            }).then(function (mapRes) {

                var directReportIds = (mapRes.list || []).map(function (m) {
                    return m.assignedUserId;
                }).filter(function (id) {
                    return !!id && alreadyFetched.indexOf(id) === -1;
                });

                var uniqueDirectReports = directReportIds.filter(function (id, idx) {
                    return directReportIds.indexOf(id) === idx;
                });

                if (!uniqueDirectReports.length) {
                    return [];
                }

                return self.fetchSubordinateIds(uniqueDirectReports, alreadyFetched)
                    .then(function (deeperIds) {
                        return uniqueDirectReports.concat(deeperIds);
                    });

            }).catch(function (err) {
                console.error('Error fetching subordinate IDs:', err);
                return [];
            });
        },

        // =====================================================================
        // ✅ loadEmployeeList
        // - Admin/HR → all employees with Employee role
        // - Regular user (manager) → login user + all subordinates recursively
        // =====================================================================
        loadEmployeeList: function () {
            var self = this;
            var currentUserId = this.getUser().get('id');

            // ✅ ADMIN / HR → ALL employees via custom backend endpoint (avoids Role ACL restriction)
            if (this.getUser().isAdmin() || this.isHR) {

                Espo.Ajax.getRequest('CAttendance/action/employeeList')
                    .then(function (response) {
                        console.log('Employee List Response:', response);
                        self.employeeList = (response.list || []).map(function (u) {
                            return {
                                id: u.id,
                                name: u.name,
                                isIntern: u.cIsIntern === true
                            };
                        });

                        self.visibleEmployeeIds = self.employeeList.map(function (e) {
                            return e.id;
                        });

                        self.populateEmployeeDropdown();
                    })
                    .catch(function (err) {
                        console.error('Error loading employee list:', err);
                    });

                return;
            }

            // =====================================================================
            // ✅ Non-admin: login user + all recursive subordinates
            // =====================================================================
            self.fetchSubordinateIds([currentUserId], []).then(function (allSubordinateIds) {

                var allVisibleIds = [currentUserId].concat(allSubordinateIds).filter(function (id, idx, arr) {
                    return arr.indexOf(id) === idx;
                });

                console.log('All visible employee IDs (login user + subordinates):', allVisibleIds);

                if (!allVisibleIds.length) {
                    self.employeeList = [];
                    self.visibleEmployeeIds = [];
                    self.populateEmployeeDropdown();
                    return;
                }

                Espo.Ajax.getRequest('User', {
                    where: [{
                        type: 'in',
                        attribute: 'id',
                        value: allVisibleIds
                    }],
                    maxSize: 200
                }).then(function (res) {

                    self.employeeList = (res.list || []).map(function (u) {
                        return {
                            id: u.id,
                            name: u.name,
                            isIntern: u.cIsIntern === true
                        };
                    });

                    self.visibleEmployeeIds = self.employeeList.map(function (e) {
                        return e.id;
                    });

                    console.log('Employee list loaded:', self.employeeList.length, 'employees');

                    self.populateEmployeeDropdown();
                });
            });
        },

        populateEmployeeDropdown: function () {
            var $dropdown = this.$el.find('#employeeFilter');
            if (!$dropdown.length) return;

            $dropdown.empty();
            $dropdown.append('<option value="">All Employees</option>');

            this.employeeList.forEach(function (user) {
                var selected = user.id === this.selectedEmployeeId ? 'selected' : '';
                $dropdown.append('<option value="' + user.id + '" ' + selected + '>' + user.name + '</option>');
            }.bind(this));
        },

        loadLeaveRequests: function () {
            this.loadMyLeaveRequests();
            this.loadAllLeaveRequests();
        },

        loadMyLeaveRequests: function () {
            var self = this;
            var currentUserId = this.getUser().get('id');
            var where = this.appendFiscalYearWhere([
                { type: 'equals', attribute: 'userId', value: currentUserId }
            ]);

            Espo.Ajax.getRequest('CLeaveRequest', {
                where: where,
                maxSize: 200
            })
                .then(function (response) {
                    var list = response.list || [];
                    self.myLeaveList = list;
                    self.leaveList = list;

                    // Split pending vs history for "My Leave" section
                    self.pendingLeaveList = list.filter(function (item) {
                        return item.status === 'Pending';
                    });
                    self.myLeaveHistoryList = list.filter(function (item) {
                        return item.status !== 'Pending';
                    });

                    self.render();
                })
                .catch(function (err) {
                    console.error('Error loading my leave requests:', err);
                });
        },

        // =====================================================================
        // ✅ loadAllLeaveRequests
        // - Admin + selectedEmployeeId → filter by that employee
        // - Admin, no selection → fetch all
        // - Non-admin + selectedEmployeeId → filter by that employee
        // - Non-admin, no selection → fetch all visible employees' leaves
        // =====================================================================
        loadAllLeaveRequests: function () {
            var self = this;
            var currentUserId = this.getUser().get('id');

            // ✅ ADMIN / HR: same logic
            if (this.getUser().isAdmin() || this.isHR) {
                var url = 'CLeaveRequest?maxSize=200&expand=user';
                var filterIndex = 0;

                if (this.selectedEmployeeId) {
                    url += '&where[' + filterIndex + '][type]=equals';
                    url += '&where[' + filterIndex + '][attribute]=userId';
                    url += '&where[' + filterIndex + '][value]=' + this.selectedEmployeeId;
                    filterIndex++;
                }

                if (this.getFilterYear()) {
                    url += '&where[' + filterIndex + '][type]=equals';
                    url += '&where[' + filterIndex + '][attribute]=fiscalYear';
                    url += '&where[' + filterIndex + '][value]=' + this.getFilterYear();
                }

                Espo.Ajax.getRequest(url)
                    .then(function (response) {
                        var all = (response.list || []).map(function (item) {
                            return Object.assign({}, item, {
                                userName: item.user ? item.user.name : (item.userName || '')
                            });
                        });
                        // Exclude own data from team leave
                        self.allLeaveList = all.filter(function (item) {
                            return item.userId !== self.getUser().get('id');
                        });
                        self.pendingAllLeaveList = self.allLeaveList.filter(function (item) {
                            return item.status === 'Pending';
                        });
                        self.reRender();
                    })
                    .catch(function (err) {
                        console.error('Error loading employee leave requests:', err);
                    });

                return;
            }

            // ✅ Non-admin: specific employee selected
            if (this.selectedEmployeeId) {
                var url = 'CLeaveRequest?maxSize=200&expand=user';
                url += '&where[0][type]=equals';
                url += '&where[0][attribute]=userId';
                url += '&where[0][value]=' + this.selectedEmployeeId;

                if (this.getFilterYear()) {
                    url += '&where[1][type]=equals';
                    url += '&where[1][attribute]=fiscalYear';
                    url += '&where[1][value]=' + this.getFilterYear();
                }

                Espo.Ajax.getRequest(url)
                    .then(function (response) {
                        var all = (response.list || []).map(function (item) {
                            return Object.assign({}, item, {
                                userName: item.user ? item.user.name : (item.userName || '')
                            });
                        });
                        // Exclude own data from team leave
                        self.allLeaveList = all.filter(function (item) {
                            return item.userId !== self.getUser().get('id');
                        });
                        self.pendingAllLeaveList = self.allLeaveList.filter(function (item) {
                            return item.status === 'Pending';
                        });
                        self.reRender();
                    })
                    .catch(function (err) {
                        console.error('Error loading leave requests for selected employee:', err);
                    });

                return;
            }

            // ✅ Non-admin: no specific employee → fetch all visible employees' leaves
            var fetchLeavesByIds = function (employeeIds) {
                if (!employeeIds || !employeeIds.length) {
                    employeeIds = [currentUserId];
                }

                Espo.Ajax.getRequest('CLeaveRequest', {
                    where: self.appendFiscalYearWhere([{
                        type: 'in',
                        attribute: 'userId',
                        value: employeeIds
                    }]),
                    maxSize: 200
                }).then(function (response) {
                    var all = (response.list || []).map(function (item) {
                        return Object.assign({}, item, {
                            userName: item.user ? item.user.name : (item.userName || '')
                        });
                    });
                    // Exclude own data from team leave
                    self.allLeaveList = all.filter(function (item) {
                        return item.userId !== self.getUser().get('id');
                    });
                    self.pendingAllLeaveList = self.allLeaveList.filter(function (item) {
                        return item.status === 'Pending';
                    });
                    self.reRender();
                }).catch(function (err) {
                    console.error('Error loading leave requests by employee IDs:', err);
                });
            };

            if (self.visibleEmployeeIds && self.visibleEmployeeIds.length > 0) {
                fetchLeavesByIds(self.visibleEmployeeIds);
            } else {
                self.fetchSubordinateIds([currentUserId], []).then(function (subordinateIds) {
                    var allIds = [currentUserId].concat(subordinateIds).filter(function (id, idx, arr) {
                        return arr.indexOf(id) === idx;
                    });
                    self.visibleEmployeeIds = allIds;
                    fetchLeavesByIds(allIds);
                });
            }
        },

        fetchLeaveBalance: function (userId) {
            var self = this;

            if (typeof userId === 'undefined') {
                if ((this.getUser().isAdmin() || this.isHR) && this.currentTab === 'tab2') {
                    if (!this.selectedEmployeeId) {
                        this.leaveBalance = 0;
                        this.reRender();
                        return Promise.resolve(0);
                    }
                    userId = this.selectedEmployeeId;
                } else {
                    userId = this.getUser().get('id');
                }
            }

            return Espo.Ajax.getRequest('CLeaveBalance', {
                where: this.appendFiscalYearWhere([{
                    type: 'equals',
                    attribute: 'userId',
                    value: userId
                }])
            }).then(function (response) {
                console.log('Leave Balance Response:', response);
                var list = response.list || [];

                if (list.length > 0) {
                    self.leaveBalance = parseFloat(list[0].balance) || 0;
                } else {
                    self.leaveBalance = 0;
                }

                console.log('Leave Balance:', self.leaveBalance);
                self.reRender();
                return self.leaveBalance;

            }).catch(function (err) {
                console.error('Error fetching leave balance:', err);
                self.leaveBalance = 0;
                return 0;
            });
        },

        loadUnpaidLeaves: function (userId) {
            var currentUserId = this.getUser().get('id');

            var where = [
                { type: 'equals', attribute: 'status', value: 'Approved' },
                { type: 'equals', attribute: 'leaveType', value: 'Unpaid' }
            ];

            if (this.getUser().isAdmin() || this.isHR) {
                if (!userId) {
                    this.totalUnpaidLeaves = 0;
                    this.reRender();
                    return;
                }
                where.push({ type: 'equals', attribute: 'userId', value: userId });
            } else {
                where.push({ type: 'equals', attribute: 'assignedUserId', value: currentUserId });
            }

            Espo.Ajax.getRequest('CLeaveRequest', {
                where: this.appendFiscalYearWhere(where),
                maxSize: 200
            }).then(function (response) {
                var list = response.list || [];
                var total = 0;

                list.forEach(function (leave) {
                    if (leave.days) {
                        total += parseInt(leave.days);
                    } else if (leave.startDate && leave.endDate) {
                        var start = moment(leave.startDate);
                        var end = moment(leave.endDate);
                        total += end.diff(start, 'days') + 1;
                    }
                });

                this.totalUnpaidLeaves = total;
                console.log('Total Unpaid Leaves:', total);
                this.reRender();
            }.bind(this));
        },

        actionCreditLeave: function () {
            console.log('Credit Leave button clicked');
            var self = this;

            var htmlContent = `
                <form id="creditLeaveForm" style="padding: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label for="employee" style="display: block; margin-bottom: 5px; font-weight: 500;">Select Employee:</label>
                        <select id="employee" name="employee" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                            <option value="">-- Select Employee --</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="leaveAmount" style="display: block; margin-bottom: 5px; font-weight: 500;">Enter leave amount to credit:</label>
                        <input type="number" inputmode="decimal" id="leaveAmount" name="leaveAmount" min="0" step="any" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="leaveReason" style="display: block; margin-bottom: 5px; font-weight: 500;">Reason for crediting leave:</label>
                        <textarea id="leaveReason" name="leaveReason" rows="4" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                    </div>
                    <div style="text-align: right;">
                        <button type="submit" style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Credit Leave</button>
                    </div>
                </form>
            `;

            var modalData = self.simpleModal('Credit Leave', htmlContent);
            var closeModal = modalData.closeModal;
            // Populate employee dropdown using employeeList (same as actionApplyForEmployeeLeave)
            setTimeout(function () {
                var employeeSelect = document.getElementById('employee');
                if (employeeSelect) {
                    employeeSelect.innerHTML = '<option value="">-- Select Employee --</option>';
                    if (self.employeeList && self.employeeList.length > 0) {
                        self.employeeList.forEach(function (emp) {
                            if (emp.isIntern === true) {
                                return;
                            }

                            var opt = document.createElement('option');
                            opt.value = emp.id;
                            opt.textContent = emp.name;
                            employeeSelect.appendChild(opt);
                        });
                    }
                }
            }, 100);

            $(document).off('submit', '#creditLeaveForm');
            $(document).on('submit', '#creditLeaveForm', function (e) {
                e.preventDefault();

                var employeeId = $('#employee').val();
                var leaveAmount = parseFloat($('#leaveAmount').val()) || 0;
                var leaveReason = $('#leaveReason').val();

                if (!employeeId || leaveAmount <= 0) {
                    Espo.ui.warning('Please select an employee and enter a valid leave amount.');
                    return;
                }

                Espo.Ajax.getRequest('CLeaveBalance', {
                    where: [
                        { type: 'equals', attribute: 'userId', value: employeeId },
                        { type: 'equals', attribute: 'fiscalYear', value: (new Date()).getFullYear().toString() }

                    ]
                }).then(function (response) {
                    var records = response.list || [];

                    if (records.length > 0) {
                        var record = records[0];
                        var newBalance = (parseFloat(record.balance) || 0) + leaveAmount;

                        Espo.Ajax.putRequest('CLeaveBalance/' + record.id, {
                            balance: newBalance,
                            reason: leaveReason
                        }).then(function () {
                            Espo.ui.success('Leave balance updated successfully!');
                            closeModal();
                        }, function (err) {
                            console.error('Error updating leave balance:', err);
                            Espo.ui.warning('Failed to update leave balance.');
                        });
                    } else {
                        console.log('Creating new leave balance record for userId:', employeeId, 'with balance:', leaveAmount);
                        Espo.Ajax.postRequest('CLeaveBalance', {
                            name: $('#employee option:selected').text() + ' Leave Balance',
                            userId: employeeId,
                            balance: leaveAmount,
                            reason: leaveReason,
                            assignedUserId: employeeId
                        }).then(function () {
                            Espo.ui.success('Leave balance record created successfully!');
                            closeModal();
                        }, function (err) {
                            console.error('Error creating leave balance:', err);
                            Espo.ui.notify('Failed to create leave balance.');
                        });
                    }
                }, function (err) {
                    console.error('Error fetching leave balance:', err);
                    Espo.ui.warning('Failed to fetch leave balance.');
                });
            });
        },

        actionDebitLeave: function () {
            console.log('Debit Leave button clicked');
            var self = this;

            var htmlContent = `
                <form id="debitLeaveForm" style="padding: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label for="employee" style="display: block; margin-bottom: 5px; font-weight: 500;">Select Employee:</label>
                        <select id="employee" name="employee" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                            <option value="">-- Select Employee --</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="leaveAmount" style="display: block; margin-bottom: 5px; font-weight: 500;">Enter leave amount to debit:</label>
                        <input type="number" inputmode="decimal" id="leaveAmount" name="leaveAmount" min="0" step="any" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="leaveReason" style="display: block; margin-bottom: 5px; font-weight: 500;">Reason for debiting leave:</label>
                        <textarea id="leaveReason" name="leaveReason" rows="4" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                    </div>
                    <div style="text-align: right;">
                        <button type="submit" style="background-color: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Debit Leave</button>
                    </div>
                </form>
            `;

            var modalData = self.simpleModal('Debit Leave', htmlContent);
            // Populate employee dropdown using employeeList (same as actionApplyForEmployeeLeave)
            setTimeout(function () {
                var employeeSelect = document.getElementById('employee');
                if (employeeSelect) {
                    employeeSelect.innerHTML = '<option value="">-- Select Employee --</option>';
                    if (self.employeeList && self.employeeList.length > 0) {
                        self.employeeList.forEach(function (emp) {
                            if (emp.isIntern === true) {
                                return;
                            }

                            var opt = document.createElement('option');
                            opt.value = emp.id;
                            opt.textContent = emp.name;
                            employeeSelect.appendChild(opt);
                        });
                    }
                }
            }, 100);

            $(document).off('submit', '#debitLeaveForm');
            $(document).on('submit', '#debitLeaveForm', function (e) {
                e.preventDefault();

                var employeeId = $('#employee').val();
                var leaveAmount = parseFloat($('#leaveAmount').val()) || 0;
                var leaveReason = $('#leaveReason').val();

                if (!employeeId || leaveAmount <= 0) {
                    Espo.ui.warning('Please select an employee and enter a valid leave amount.');
                    return;
                }

                Espo.Ajax.getRequest('CLeaveBalance', {
                    where: [{ type: 'equals', attribute: 'userId', value: employeeId }]
                }).then(function (response) {
                    var records = response.list || [];

                    if (records.length > 0) {
                        var record = records[0];

                        if (parseFloat(record.balance) < leaveAmount) {
                            Espo.ui.warning('Insufficient leave balance to debit. Current balance: ' + record.balance);
                            return;
                        }

                        var newBalance = (parseFloat(record.balance) || 0) - leaveAmount;

                        Espo.Ajax.putRequest('CLeaveBalance/' + record.id, {
                            balance: newBalance,
                            reason: leaveReason
                        }).then(function () {
                            Espo.ui.success('Leave balance debited successfully!');
                            closeModal();
                        }, function (err) {
                            console.error('Error updating leave balance:', err);
                            Espo.ui.warning('Failed to update leave balance.');
                        });
                    } else {
                        Espo.ui.warning('No leave balance record found for this employee.');
                    }
                }, function (err) {
                    console.error('Error fetching leave balance:', err);
                    Espo.ui.warning('Failed to fetch leave balance.');
                });
            });
        },

        actionApplyForLeave: function () {
            console.log("actionApplyForLeave function called.");

            var self = this;
            const today = new Date();
            const min = new Date(today.getFullYear(), today.getMonth(), 1);

            function formatDate(d) {
                return d.getFullYear() + '-' +
                    String(d.getMonth() + 1).padStart(2, '0') + '-' +
                    String(d.getDate()).padStart(2, '0');
            }

            const minDate = formatDate(min);

            var htmlContent = `
            <div class="form-box" style="padding:20px;">
                <div class="form-row mb-3">
                    <label class="form-label">Leave Type <span class="text-danger">*</span></label>
                    <select id="leaveType" class="form-select" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        <option value="">Select Leave Type</option>
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                    </select>
                </div>

                <div class="form-row mb-3">
                    <label class="form-label">Apply Leave for <span class="text-danger">*</span></label>
                    <div class="form-check">
                        <input type="radio" id="single" name="leaveMode" value="single" class="form-check-input" checked>
                        <label class="form-check-label">Single Day</label>
                    </div>
                    <div class="form-check">
                        <input type="radio" id="multiple" name="leaveMode" value="multiple" class="form-check-input">
                        <label class="form-check-label">Multiple Days</label>
                    </div>
                </div>

                <div class="form-row mb-3" id="singleDateRow">
                    <label class="form-label">Leave Date <span class="text-danger">*</span></label>
                    <input type="date" id="singleDate" class="form-control" min="${minDate}">
                </div>

                <div class="form-row mb-3" id="multipleDateRow" style="display:none; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label class="form-label">From Date <span class="text-danger">*</span></label>
                        <input type="date" id="fromDate" class="form-control" min="${minDate}">
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label class="form-label">To Date <span class="text-danger">*</span></label>
                        <input type="date" id="toDate" class="form-control" min="${minDate}">
                    </div>
                </div>

                <div class="form-row mb-3">
                    <label class="form-label">Leave Duration <span class="text-danger">*</span></label>
                    <div class="form-check">
                        <input type="radio" name="duration" value="Full" class="form-check-input" checked>
                        <label class="form-check-label">Full Day</label>
                    </div>
                    <div class="form-check" id="firstHalfOpt">
                        <input type="radio" name="duration" value="First Half" class="form-check-input">
                        <label class="form-check-label">1st Half</label>
                    </div>
                    <div class="form-check" id="secondHalfOpt">
                        <input type="radio" name="duration" value="Second Half" class="form-check-input">
                        <label class="form-check-label">2nd Half</label>
                    </div>
                </div>

                <div class="form-row mb-3">
                    <label class="form-label">Reason <span class="text-danger">*</span></label>
                    <textarea id="reason" class="form-control"></textarea>
                </div>

                <div class="text-center">
                    <button id="submitLeaveBtn" class="btn btn-primary">Apply Leave</button>
                </div>
            </div>
            `;

            var modalObj = this.simpleModal("Apply Leave", htmlContent);

            setTimeout(function () {
                const modal = document.getElementById(modalObj.modalId);
                const leaveType = modal.querySelector('#leaveType');
                const singleDate = modal.querySelector('#singleDate');
                const fromDate = modal.querySelector('#fromDate');
                const toDate = modal.querySelector('#toDate');
                const reason = modal.querySelector('#reason');
                const singleRadio = modal.querySelector('#single');
                const multipleRadio = modal.querySelector('#multiple');
                const singleDateRow = modal.querySelector('#singleDateRow');
                const multipleDateRow = modal.querySelector('#multipleDateRow');
                const firstHalfOpt = modal.querySelector('#firstHalfOpt');
                const secondHalfOpt = modal.querySelector('#secondHalfOpt');

                function markInvalid(el) {
                    if (!el) return;
                    el.classList.add('is-invalid', 'shake');
                    if (navigator.vibrate) navigator.vibrate(150);
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => el.classList.remove('shake'), 400);
                }

                function clearInvalid(el) {
                    if (!el) return;
                    el.classList.remove('is-invalid');
                }

                [leaveType, singleDate, fromDate, toDate, reason].forEach(function (el) {
                    if (!el) return;
                    el.addEventListener('input', function () { clearInvalid(el); });
                    el.addEventListener('change', function () { clearInvalid(el); });
                    el.addEventListener('focus', function () { clearInvalid(el); });
                });

                // ── Toggle date fields AND hide half-day for multiple days ──
                function toggleDateFields() {
                    if (singleRadio.checked) {
                        singleDateRow.style.display = 'block';
                        multipleDateRow.style.display = 'none';
                        // Single day: show all duration options
                        firstHalfOpt.style.display = '';
                        secondHalfOpt.style.display = '';
                    } else {
                        singleDateRow.style.display = 'none';
                        multipleDateRow.style.display = 'flex';
                        // Multiple days: Full Day only — hide half-day options
                        firstHalfOpt.style.display = 'none';
                        secondHalfOpt.style.display = 'none';
                        modal.querySelector('input[name="duration"][value="Full"]').checked = true;
                    }
                }

                singleRadio.addEventListener('change', toggleDateFields);
                multipleRadio.addEventListener('change', toggleDateFields);

                function validateForm() {
                    if (!leaveType.value) { leaveType.focus(); markInvalid(leaveType); return false; }

                    var leaveMode = modal.querySelector('input[name="leaveMode"]:checked').value;

                    if (leaveMode === 'single') {
                        if (!singleDate.value) { singleDate.focus(); markInvalid(singleDate); return false; }
                    } else {
                        if (!fromDate.value) { fromDate.focus(); markInvalid(fromDate); return false; }
                        if (!toDate.value) { toDate.focus(); markInvalid(toDate); return false; }
                        if (new Date(fromDate.value) > new Date(toDate.value)) { toDate.focus(); markInvalid(toDate); return false; }
                    }

                    if (!reason.value.trim()) { reason.focus(); markInvalid(reason); return false; }
                    return true;
                }

                // ── Sandwich Rule helper ──
                // Corporate sandwich rule: taking Paid leave on Friday AND Monday means
                // the Saturday & Sunday in between are also counted as leave days.
                // Eligibility threshold: paid balance >= 3 days AND balance >= totalDays.
                // Returns rich info for dynamic messaging.
                function formatDisplayDate(dateStr) {
                    var d = new Date(dateStr + 'T00:00:00');
                    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
                }

                function checkSandwichRule(startDate, endDate, userId) {
                    function getAdjacentInfo(dateStr) {
                        var d = new Date(dateStr + 'T00:00:00');
                        var day = d.getDay();
                        if (day === 5) { // Friday → check next Monday
                            var sat = new Date(d); sat.setDate(sat.getDate() + 1);
                            var sun = new Date(d); sun.setDate(sun.getDate() + 2);
                            var mon = new Date(d); mon.setDate(mon.getDate() + 3);
                            return {
                                adjDate: formatDate(mon),
                                thisDate: dateStr,
                                thisDay: 'Friday',
                                adjDay: 'Monday',
                                satDate: formatDate(sat),
                                sunDate: formatDate(sun)
                            };
                        }
                        if (day === 1) { // Monday → check previous Friday
                            var fri = new Date(d); fri.setDate(fri.getDate() - 3);
                            var sat = new Date(d); sat.setDate(sat.getDate() - 2);
                            var sun = new Date(d); sun.setDate(sun.getDate() - 1);
                            return {
                                adjDate: formatDate(fri),
                                thisDate: dateStr,
                                thisDay: 'Monday',
                                adjDay: 'Friday',
                                satDate: formatDate(sat),
                                sunDate: formatDate(sun)
                            };
                        }
                        return null;
                    }

                    var checks = [];
                    var startInfo = getAdjacentInfo(startDate);
                    var endInfo = (endDate && endDate !== startDate) ? getAdjacentInfo(endDate) : null;
                    if (startInfo) checks.push(startInfo);
                    if (endInfo && (!startInfo || endInfo.adjDate !== startInfo.adjDate)) checks.push(endInfo);
                    if (!checks.length) return Promise.resolve({ isSandwich: false });

                    return Espo.Ajax.getRequest('CLeaveRequest', {
                        where: [
                            { type: 'equals', attribute: 'userId', value: userId },
                            { type: 'in', attribute: 'status', value: ['Approved', 'Pending'] }
                        ],
                        maxSize: 200
                    }).then(function (res) {
                        var leaves = res.list || [];
                        for (var i = 0; i < checks.length; i++) {
                            var info = checks[i];
                            for (var j = 0; j < leaves.length; j++) {
                                var l = leaves[j];
                                var ls = l.startDate;
                                var le = l.endDate || l.startDate;
                                if (info.adjDate >= ls && info.adjDate <= le) {
                                    return {
                                        isSandwich: true,
                                        isPending: l.status === 'Pending',
                                        thisDay: info.thisDay,
                                        adjDay: info.adjDay,
                                        thisDate: info.thisDate,
                                        adjDate: info.adjDate,
                                        satDate: info.satDate,
                                        sunDate: info.sunDate,
                                        adjLeaveType: l.leaveType || 'Paid',
                                        adjLeaveStart: l.startDate,
                                        adjLeaveEnd: l.endDate || l.startDate,
                                        weekendDays: 2
                                    };
                                }
                            }
                        }
                        return { isSandwich: false };
                    });
                }

                modal.querySelector('#submitLeaveBtn').addEventListener('click', function (e) {
                    e.preventDefault();
                    if (!validateForm()) return;

                    var leaveTypeVal = leaveType.value;
                    var leaveMode = modal.querySelector('input[name="leaveMode"]:checked').value;
                    var duration = modal.querySelector('input[name="duration"]:checked').value;
                    var startDate, endDate;

                    if (leaveMode === 'single') {
                        startDate = singleDate.value;
                        endDate = startDate;
                    } else {
                        startDate = fromDate.value;
                        endDate = toDate.value;
                    }

                    var userId = self.getUser().id;

                    function calculateLeaveDays(leave) {
                        var isHalf = (leave.dayMode === 'First Half' || leave.dayMode === 'Second Half');
                        var start = new Date(leave.startDate);
                        var end = new Date(leave.endDate);
                        var diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
                        return isHalf ? diff * 0.5 : diff;
                    }

                    var leaveDays = calculateLeaveDays({ startDate: startDate, endDate: endDate, dayMode: duration });

                    function createLeave(effectiveDays, overrideType) {
                        var finalType = overrideType || leaveTypeVal;
                        var payload = {
                            name: self.getUser().get('name'),
                            leaveType: finalType,
                            startDate: startDate,
                            endDate: endDate,
                            reason: reason.value,
                            dayMode: duration,
                            days: effectiveDays,
                            status: 'Pending',
                            userId: userId,
                            assignedUserId: userId
                        };
                        Espo.Ajax.postRequest('CLeaveRequest', payload).then(function () {
                            Espo.Ui.success('Leave Applied Successfully' + (overrideType ? ' as ' + overrideType : ''));
                            modal.remove();
                            self.loadLeaveRequests();
                        });
                    }

                    function processLeaveWithBalance(effectiveDays, overrideType) {
                        var finalType = overrideType || leaveTypeVal;
                        if (finalType === 'Paid') {
                            self.fetchLeaveBalance(userId).then(function (balance) {
                                if (effectiveDays > balance) {
                                    Espo.Ui.error('Insufficient paid leave balance. You need ' + effectiveDays + ' day(s) but have ' + balance + ' day(s) available.');
                                    return;
                                }
                                Espo.Ajax.getRequest('CLeaveBalance', {
                                    where: [{ type: 'equals', attribute: 'userId', value: userId }]
                                }).then(function (res) {
                                    var record = res.list[0];
                                    Espo.Ajax.putRequest('CLeaveBalance/' + record.id, {
                                        balance: record.balance - effectiveDays
                                    }).then(function () { createLeave(effectiveDays, overrideType); });
                                });
                            });
                        } else {
                            createLeave(leaveDays, overrideType);
                        }
                    }

                    // ── Sandwich HTML modal helpers (user) ──
                    function showSandwichDialog(bodyHtml, onYes) {
                        var sid = 'sw-dlg-' + Date.now();
                        var overlay = document.createElement('div');
                        overlay.id = sid;
                        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.55);z-index:9998;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;';
                        overlay.innerHTML = bodyHtml;
                        document.body.appendChild(overlay);
                        function closeDialog() { overlay.remove(); }
                        var yesBtn = overlay.querySelector('#sw-yes');
                        var noBtn = overlay.querySelector('#sw-no');
                        if (yesBtn) yesBtn.addEventListener('click', function () { closeDialog(); if (onYes) onYes(); });
                        if (noBtn) noBtn.addEventListener('click', function () { closeDialog(); });
                        overlay.addEventListener('click', function (e) { if (e.target === overlay) closeDialog(); });
                    }

                    function buildSandwichHtml(cfg) {
                        function infoRow(label, value, vc) {
                            return '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;border-bottom:1px solid #f1f5f9;">' +
                                '<span style="color:#64748b;font-size:12.5px;">' + label + '</span>' +
                                '<span style="color:' + (vc || '#1a2233') + ';font-size:13px;font-weight:600;text-align:right;">' + value + '</span>' +
                                '</div>';
                        }
                        function card(icon, heading, rows, bg) {
                            var rowsHtml = rows.map(function (r) { return infoRow(r.l, r.v, r.c); }).join('');
                            return '<div style="background:' + (bg || '#f8fafc') + ';border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:10px;">' +
                                '<div style="font-size:11.5px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">' + icon + ' ' + heading + '</div>' +
                                rowsHtml + '</div>';
                        }

                        var adjBg = cfg.adjacent.isPending ? '#fffbeb' : '#f0fdf4';
                        var adjSt = cfg.adjacent.isPending ? '#92400e' : '#166534';

                        var impactRows = [
                            { l: 'Applied days', v: cfg.impact.applied + ' day(s)' },
                            { l: 'Weekend counted as leave', v: '+' + cfg.impact.weekend + ' day(s)', c: '#d97706' },
                            { l: 'Total effective days', v: cfg.impact.total + ' day(s)', c: '#dc2626' }
                        ];
                        if (typeof cfg.impact.balance === 'number') impactRows.push({ l: 'Current paid balance', v: cfg.impact.balance + ' day(s)', c: '#0f766e' });
                        if (cfg.impact.balanceAfter !== undefined) impactRows.push({ l: 'Balance after deduction', v: cfg.impact.balanceAfter + ' day(s)', c: '#2563eb' });

                        var pendingBanner = '';
                        if (cfg.pendingWarning) {
                            pendingBanner = '<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 14px;margin-bottom:10px;font-size:13px;">' +
                                '<div style="font-weight:700;color:#92400e;margin-bottom:5px;">\u23f3 Adjacent Leave is Still Pending</div>' +
                                '<div style="color:#78350f;line-height:1.5;">' + cfg.pendingWarning + '</div></div>';
                        }

                        return '<div style="background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.22);width:100%;max-width:510px;max-height:90vh;overflow-y:auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">' +
                            '<div style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:16px 20px;border-radius:12px 12px 0 0;color:#fff;">' +
                            '<div style="font-size:17px;font-weight:700;">\u26a0\ufe0f Sandwich Rule Notification</div>' +
                            '<div style="font-size:12px;opacity:.85;margin-top:3px;">' + cfg.title + '</div></div>' +
                            '<div style="padding:16px 18px 4px;">' +
                            card('\ud83d\udcc5', 'Leave You Are Applying', [
                                { l: 'Date', v: cfg.applying.date },
                                { l: 'Leave Type', v: cfg.applying.type },
                                { l: 'Duration', v: cfg.applying.duration }
                            ]) +
                            card('\ud83d\udcc5', 'Adjacent ' + cfg.adjacent.day + ' Leave Detected', [
                                { l: 'Period', v: cfg.adjacent.period },
                                { l: 'Status', v: cfg.adjacent.status, c: adjSt },
                                { l: 'Leave Type', v: cfg.adjacent.type }
                            ], adjBg) +
                            card('\ud83d\udcc6', 'Sandwiched Weekend', [
                                { l: 'Saturday', v: cfg.weekend.sat },
                                { l: 'Sunday', v: cfg.weekend.sun }
                            ]) +
                            card('\ud83d\udcca', 'Leave Impact (Sandwich Rule)', impactRows, '#fff7ed') +
                            pendingBanner +
                            cfg.bottomSection +
                            '</div>' +
                            '<div style="padding:14px 18px;border-top:1px solid #e5e7eb;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">' +
                            '<button id="sw-no" style="padding:9px 18px;border:1.5px solid #d1d5db;background:#fff;color:#374151;border-radius:7px;font-size:13.5px;font-weight:500;cursor:pointer;">Cancel</button>' +
                            '<button id="sw-yes" style="padding:9px 18px;background:' + (cfg.yesColor || '#2563eb') + ';color:#fff;border:none;border-radius:7px;font-size:13.5px;font-weight:600;cursor:pointer;">' + cfg.yesLabel + '</button>' +
                            '</div></div>';
                    }

                    // ── Run sandwich check then submit ──
                    checkSandwichRule(startDate, endDate, userId).then(function (sandwich) {
                        if (!sandwich.isSandwich) {
                            processLeaveWithBalance(leaveDays);
                            return;
                        }

                        var totalDays = leaveDays + sandwich.weekendDays;
                        var thisDateFmt = formatDisplayDate(sandwich.thisDate);
                        var satDateFmt = formatDisplayDate(sandwich.satDate);
                        var sunDateFmt = formatDisplayDate(sandwich.sunDate);
                        var adjRangeTxt = sandwich.adjLeaveStart === sandwich.adjLeaveEnd
                            ? formatDisplayDate(sandwich.adjLeaveStart)
                            : formatDisplayDate(sandwich.adjLeaveStart) + ' to ' + formatDisplayDate(sandwich.adjLeaveEnd);

                        var pendingWarning = sandwich.isPending
                            ? 'Your <strong>' + sandwich.adjDay + '</strong> leave (' + adjRangeTxt + ') is currently <strong>Pending</strong>. ' +
                            'The sandwich weekend deduction is being applied now. ' +
                            'If that leave is <strong>approved</strong>, the full deduction (' + totalDays + ' days) stands. ' +
                            'If it is <strong>rejected</strong>, no sandwich rule applies and the weekend days will <strong>not</strong> be counted.So if you don\'t want to apply When your detected request rejected or cancelled and re-apply after the pending request is processed.'
                            : null;

                        var baseCfg = {
                            title: 'Corporate sandwich rule applies to your leave request',
                            applying: {
                                date: thisDateFmt + ' (' + sandwich.thisDay + ')',
                                type: leaveTypeVal,
                                duration: leaveDays + ' day(s)'
                            },
                            adjacent: {
                                day: sandwich.adjDay,
                                period: adjRangeTxt,
                                status: sandwich.isPending ? '\u23f3 Pending Approval' : '\u2705 Approved',
                                isPending: sandwich.isPending,
                                type: sandwich.adjLeaveType
                            },
                            weekend: { sat: satDateFmt, sun: sunDateFmt },
                            impact: { applied: leaveDays, weekend: sandwich.weekendDays, total: totalDays },
                            pendingWarning: pendingWarning
                        };

                        if (leaveTypeVal === 'Paid') {
                            self.fetchLeaveBalance(userId).then(function (balance) {
                                var canApplyPaid = balance >= 3 && balance >= totalDays;

                                if (canApplyPaid) {
                                    var balanceAfter = (balance - totalDays).toFixed(1);
                                    var cfg = {
                                        title: baseCfg.title, applying: baseCfg.applying,
                                        adjacent: baseCfg.adjacent, weekend: baseCfg.weekend,
                                        impact: { applied: leaveDays, weekend: sandwich.weekendDays, total: totalDays, balance: balance, balanceAfter: balanceAfter },
                                        pendingWarning: pendingWarning,
                                        bottomSection: '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:11px 14px;margin-bottom:14px;font-size:13px;color:#1e40af;font-weight:600;">' +
                                            '\ud83d\udcb3 Paid Balance After Deduction: ' + balanceAfter + ' day(s)</div>',
                                        yesLabel: 'Yes, I want to proceed with Paid leave',
                                        yesColor: '#2563eb'
                                    };
                                    showSandwichDialog(buildSandwichHtml(cfg), function () {
                                        processLeaveWithBalance(totalDays);
                                    });
                                } else {
                                    var reasonHtml = balance < 3
                                        ? 'Your paid balance (<strong>' + balance + ' day(s)</strong>) is below the minimum of <strong>3 days</strong> required under the sandwich rule.'
                                        : 'Your paid balance (<strong>' + balance + ' day(s)</strong>) is insufficient for the total deduction of <strong>' + totalDays + ' days</strong> (applied ' + leaveDays + ' + 2 weekend).';
                                    var cfg = {
                                        title: baseCfg.title, applying: baseCfg.applying,
                                        adjacent: baseCfg.adjacent, weekend: baseCfg.weekend,
                                        impact: { applied: leaveDays, weekend: sandwich.weekendDays, total: totalDays, balance: balance },
                                        pendingWarning: pendingWarning,
                                        bottomSection:
                                            '<div style="background:#fff1f2;border:1px solid #fecaca;border-radius:8px;padding:11px 14px;margin-bottom:10px;font-size:13px;">' +
                                            '<div style="font-weight:700;color:#991b1b;margin-bottom:4px;">\u274c Cannot Apply as Paid Leave</div>' +
                                            '<div style="color:#7f1d1d;line-height:1.5;">' + reasonHtml + '</div></div>' +
                                            '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:11px 14px;margin-bottom:14px;font-size:13px;">' +
                                            '<div style="font-weight:700;color:#166534;margin-bottom:4px;">\u2705 You Can Apply as Unpaid Leave</div>' +
                                            '<div style="color:#14532d;line-height:1.6;">\u2022 No paid balance will be checked or deducted<br>' +
                                            '\u2022 ' + leaveDays + ' day(s) recorded as unpaid<br>' +
                                            '\u2022 Weekend days are <strong>not</strong> extra-counted for unpaid leaves</div></div>',
                                        yesLabel: 'Apply as Unpaid Leave',
                                        yesColor: '#16a34a'
                                    };
                                    showSandwichDialog(buildSandwichHtml(cfg), function () {
                                        createLeave(leaveDays, 'Unpaid');
                                    });
                                }
                            });
                        } else {
                            // Unpaid: no paid balance deduction, but weekend days still counted
                            var cfg = {
                                title: baseCfg.title, applying: baseCfg.applying,
                                adjacent: baseCfg.adjacent, weekend: baseCfg.weekend,
                                impact: { applied: leaveDays, weekend: sandwich.weekendDays, total: totalDays },
                                pendingWarning: pendingWarning,
                                bottomSection:
                                    '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:11px 14px;margin-bottom:14px;font-size:13px;color:#1e40af;">' +
                                    '<strong>\u2139\ufe0f Unpaid Leave \u2014 Sandwich Rule Applies</strong><br>' +
                                    '<div style="margin-top:5px;line-height:1.6;">\u2022 No paid balance will be deducted<br>' +
                                    '\u2022 ' + totalDays + ' day(s) recorded as unpaid (including ' + sandwich.weekendDays + ' weekend day(s))</div></div>',
                                yesLabel: 'Yes, I want to proceed',
                                yesColor: '#2563eb'
                            };
                            showSandwichDialog(buildSandwichHtml(cfg), function () {
                                createLeave(totalDays);
                            });
                        }
                    });
                });
            }, 50);
        },

        actionApplyForEmployeeLeave: function () {
            var self = this;
            this.loadEmployeeList();

            const today = new Date();
            const min = new Date(today.getFullYear(), today.getMonth(), 1);

            function formatDate(d) {
                return d.getFullYear() + '-' +
                    String(d.getMonth() + 1).padStart(2, '0') + '-' +
                    String(d.getDate()).padStart(2, '0');
            }

            const minDate = formatDate(min);

            var htmlContent = `
            <div class="form-box" style="padding:20px;">

                <div class="form-row mb-3">
                    <label class="form-label">Employee <span class="text-danger">*</span></label>
                    <select id="employeeSelect" class="form-select">
                        <option value="">Loading...</option>
                    </select>
                </div>

                <div class="form-row mb-3">
                    <label class="form-label">Leave Type <span class="text-danger">*</span></label>
                    <select id="leaveType" class="form-select">
                        <option value="">Select Leave Type</option>
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                    </select>
                </div>

                <div class="form-row mb-3">
                    <label class="form-label">Apply Leave for <span class="text-danger">*</span></label>
                    <div class="form-check">
                        <input type="radio" id="single" name="leaveMode" value="single" class="form-check-input" checked>
                        <label class="form-check-label">Single Day</label>
                    </div>
                    <div class="form-check">
                        <input type="radio" id="multiple" name="leaveMode" value="multiple" class="form-check-input">
                        <label class="form-check-label">Multiple Days</label>
                    </div>
                </div>

                <div class="form-row mb-3" id="singleDateRow">
                    <label class="form-label">Leave Date <span class="text-danger">*</span></label>
                    <input type="date" id="singleDate" class="form-control" min="${minDate}">
                </div>

                <div class="form-row mb-3" id="multipleDateRow" style="display:none; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label class="form-label">From <span class="text-danger">*</span></label>
                        <input type="date" id="fromDate" class="form-control" min="${minDate}">
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label class="form-label">To <span class="text-danger">*</span></label>
                        <input type="date" id="toDate" class="form-control" min="${minDate}">
                    </div>
                </div>

                <div class="form-row mb-3">
                    <label class="form-label">Leave Duration <span class="text-danger">*</span></label>
                    <div class="form-check">
                        <input type="radio" name="duration" value="Full" class="form-check-input" checked>
                        <label class="form-check-label">Full Day</label>
                    </div>
                    <div class="form-check" id="firstHalfOpt">
                        <input type="radio" name="duration" value="First Half" class="form-check-input">
                        <label class="form-check-label">1st Half</label>
                    </div>
                    <div class="form-check" id="secondHalfOpt">
                        <input type="radio" name="duration" value="Second Half" class="form-check-input">
                        <label class="form-check-label">2nd Half</label>
                    </div>
                </div>

                <div class="form-row mb-3">
                    <label class="form-label">Reason <span class="text-danger">*</span></label>
                    <textarea id="reason" class="form-control"></textarea>
                </div>

                <div class="text-center">
                    <button id="submitLeaveBtn" class="btn btn-primary">Apply Leave</button>
                </div>
            </div>
            `;

            var modalObj = this.simpleModal("Apply Leave for Employee", htmlContent);

            setTimeout(function () {
                const modal = document.getElementById(modalObj.modalId);
                const employeeSelect = modal.querySelector('#employeeSelect');
                const leaveType = modal.querySelector('#leaveType');
                const singleDate = modal.querySelector('#singleDate');
                const fromDate = modal.querySelector('#fromDate');
                const toDate = modal.querySelector('#toDate');
                const reason = modal.querySelector('#reason');
                const singleRadio = modal.querySelector('#single');
                const multipleRadio = modal.querySelector('#multiple');
                const singleDateRow = modal.querySelector('#singleDateRow');
                const multipleDateRow = modal.querySelector('#multipleDateRow');
                const firstHalfOpt = modal.querySelector('#firstHalfOpt');
                const secondHalfOpt = modal.querySelector('#secondHalfOpt');

                function markInvalid(el) {
                    if (!el) return;
                    el.classList.add('is-invalid', 'shake');
                    if (navigator.vibrate) navigator.vibrate(150);
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => el.classList.remove('shake'), 400);
                }

                function clearInvalid(el) {
                    if (!el) return;
                    el.classList.remove('is-invalid');
                }

                [employeeSelect, leaveType, singleDate, fromDate, toDate, reason].forEach(function (el) {
                    if (!el) return;
                    el.addEventListener('input', function () { clearInvalid(el); });
                    el.addEventListener('change', function () { clearInvalid(el); });
                    el.addEventListener('focus', function () { clearInvalid(el); });
                });

                // ── Toggle date fields AND hide half-day for multiple days ──
                function toggleDateFields() {
                    if (singleRadio.checked) {
                        singleDateRow.style.display = 'block';
                        multipleDateRow.style.display = 'none';
                        // Single day: show all duration options
                        firstHalfOpt.style.display = '';
                        secondHalfOpt.style.display = '';
                    } else {
                        singleDateRow.style.display = 'none';
                        multipleDateRow.style.display = 'flex';
                        // Multiple days: Full Day only — hide half-day options
                        firstHalfOpt.style.display = 'none';
                        secondHalfOpt.style.display = 'none';
                        modal.querySelector('input[name="duration"][value="Full"]').checked = true;
                    }
                }

                singleRadio.addEventListener('change', toggleDateFields);
                multipleRadio.addEventListener('change', toggleDateFields);

                // Populate employees from self.employeeList (login user + subordinates)
                let interval = setInterval(function () {
                    if (self.employeeList && self.employeeList.length > 0) {
                        employeeSelect.innerHTML = '<option value="">Select Employee</option>';
                        self.employeeList.forEach(function (emp) {
                            employeeSelect.innerHTML += '<option value="' + emp.id + '">' + emp.name + '</option>';
                        });
                        clearInterval(interval);
                    }
                }, 200);

                function validateForm() {
                    if (!employeeSelect.value) { employeeSelect.focus(); markInvalid(employeeSelect); return false; }
                    if (!leaveType.value) { leaveType.focus(); markInvalid(leaveType); return false; }

                    var leaveMode = modal.querySelector('input[name="leaveMode"]:checked').value;

                    if (leaveMode === 'single') {
                        if (!singleDate.value) { singleDate.focus(); markInvalid(singleDate); return false; }
                    } else {
                        if (!fromDate.value) { fromDate.focus(); markInvalid(fromDate); return false; }
                        if (!toDate.value) { toDate.focus(); markInvalid(toDate); return false; }
                        if (new Date(fromDate.value) > new Date(toDate.value)) { markInvalid(toDate); toDate.focus(); return false; }
                    }

                    if (!reason.value.trim()) { reason.focus(); markInvalid(reason); return false; }
                    return true;
                }

                // ── Sandwich Rule helper (admin) ──
                // Corporate sandwich rule: Fri leave + Mon leave → Sat & Sun counted as leave.
                // Eligibility for Paid: balance >= 3 AND balance >= totalDays.
                function formatDisplayDate(dateStr) {
                    var d = new Date(dateStr + 'T00:00:00');
                    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
                }

                function checkSandwichRule(startDate, endDate, userId) {
                    function getAdjacentInfo(dateStr) {
                        var d = new Date(dateStr + 'T00:00:00');
                        var day = d.getDay();
                        if (day === 5) { // Friday
                            var sat = new Date(d); sat.setDate(sat.getDate() + 1);
                            var sun = new Date(d); sun.setDate(sun.getDate() + 2);
                            var mon = new Date(d); mon.setDate(mon.getDate() + 3);
                            return { adjDate: formatDate(mon), thisDate: dateStr, thisDay: 'Friday', adjDay: 'Monday', satDate: formatDate(sat), sunDate: formatDate(sun) };
                        }
                        if (day === 1) { // Monday
                            var fri = new Date(d); fri.setDate(fri.getDate() - 3);
                            var sat = new Date(d); sat.setDate(sat.getDate() - 2);
                            var sun = new Date(d); sun.setDate(sun.getDate() - 1);
                            return { adjDate: formatDate(fri), thisDate: dateStr, thisDay: 'Monday', adjDay: 'Friday', satDate: formatDate(sat), sunDate: formatDate(sun) };
                        }
                        return null;
                    }

                    var checks = [];
                    var startInfo = getAdjacentInfo(startDate);
                    var endInfo = (endDate && endDate !== startDate) ? getAdjacentInfo(endDate) : null;
                    if (startInfo) checks.push(startInfo);
                    if (endInfo && (!startInfo || endInfo.adjDate !== startInfo.adjDate)) checks.push(endInfo);
                    if (!checks.length) return Promise.resolve({ isSandwich: false });

                    return Espo.Ajax.getRequest('CLeaveRequest', {
                        where: [
                            { type: 'equals', attribute: 'userId', value: userId },
                            { type: 'in', attribute: 'status', value: ['Approved', 'Pending'] }
                        ],
                        maxSize: 200
                    }).then(function (res) {
                        var leaves = res.list || [];
                        for (var i = 0; i < checks.length; i++) {
                            var info = checks[i];
                            for (var j = 0; j < leaves.length; j++) {
                                var l = leaves[j];
                                var ls = l.startDate;
                                var le = l.endDate || l.startDate;
                                if (info.adjDate >= ls && info.adjDate <= le) {
                                    return {
                                        isSandwich: true,
                                        isPending: l.status === 'Pending',
                                        thisDay: info.thisDay,
                                        adjDay: info.adjDay,
                                        thisDate: info.thisDate,
                                        adjDate: info.adjDate,
                                        satDate: info.satDate,
                                        sunDate: info.sunDate,
                                        adjLeaveType: l.leaveType || 'Paid',
                                        adjLeaveStart: l.startDate,
                                        adjLeaveEnd: l.endDate || l.startDate,
                                        weekendDays: 2
                                    };
                                }
                            }
                        }
                        return { isSandwich: false };
                    });
                }

                modal.querySelector('#submitLeaveBtn').addEventListener('click', function (e) {
                    e.preventDefault();
                    if (!validateForm()) return;

                    var employeeId = employeeSelect.value;
                    var employeeName = employeeSelect.options[employeeSelect.selectedIndex] ? employeeSelect.options[employeeSelect.selectedIndex].text : '';
                    var leaveTypeVal = leaveType.value;
                    var leaveMode = modal.querySelector('input[name="leaveMode"]:checked').value;
                    var duration = modal.querySelector('input[name="duration"]:checked').value;
                    var startDate, endDate;

                    if (leaveMode === 'single') {
                        startDate = singleDate.value;
                        endDate = startDate;
                    } else {
                        startDate = fromDate.value;
                        endDate = toDate.value;
                    }

                    function calculateLeaveDays(data) {
                        var isHalf = (data.dayMode === 'First Half' || data.dayMode === 'Second Half');
                        var start = new Date(data.startDate);
                        var end = new Date(data.endDate);
                        var diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
                        return isHalf ? diff * 0.5 : diff;
                    }

                    var leaveDays = calculateLeaveDays({ startDate: startDate, endDate: endDate, dayMode: duration });

                    function createLeave(effectiveDays, overrideType) {
                        var finalType = overrideType || leaveTypeVal;
                        var payload = {
                            name: 'Leave for ' + employeeName,
                            leaveType: finalType,
                            startDate: startDate,
                            endDate: endDate,
                            reason: reason.value,
                            dayMode: duration,
                            days: effectiveDays,
                            status: 'Pending',
                            userId: employeeId,
                            assignedUserId: employeeId
                        };
                        Espo.Ajax.postRequest('CLeaveRequest', payload).then(function () {
                            Espo.Ui.success('Leave Applied for ' + employeeName + (overrideType ? ' as ' + overrideType : ''));
                            modal.remove();
                            self.loadLeaveRequests();
                        });
                    }

                    function processLeaveWithBalance(effectiveDays, overrideType) {
                        var finalType = overrideType || leaveTypeVal;
                        if (finalType === 'Paid') {
                            self.fetchLeaveBalance(employeeId).then(function (balance) {
                                if (effectiveDays > balance) {
                                    Espo.Ui.error('Insufficient paid leave balance. Employee needs ' + effectiveDays + ' day(s) but has ' + balance + ' day(s) available.');
                                    return;
                                }
                                Espo.Ajax.getRequest('CLeaveBalance', {
                                    where: [{ type: 'equals', attribute: 'userId', value: employeeId }]
                                }).then(function (res) {
                                    var record = res.list[0];
                                    Espo.Ajax.putRequest('CLeaveBalance/' + record.id, {
                                        balance: record.balance - effectiveDays
                                    }).then(function () { createLeave(effectiveDays, overrideType); });
                                });
                            });
                        } else {
                            createLeave(leaveDays, overrideType);
                        }
                    }

                    // ── Sandwich HTML modal helper (admin) ──
                    function showSandwichDialog(bodyHtml, onYes) {
                        var sid = 'sw-dlg-' + Date.now();
                        var overlay = document.createElement('div');
                        overlay.id = sid;
                        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.55);z-index:9998;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;';
                        overlay.innerHTML = bodyHtml;
                        document.body.appendChild(overlay);
                        function closeDialog() { overlay.remove(); }
                        var yesBtn = overlay.querySelector('#sw-yes');
                        var noBtn = overlay.querySelector('#sw-no');
                        if (yesBtn) yesBtn.addEventListener('click', function () { closeDialog(); if (onYes) onYes(); });
                        if (noBtn) noBtn.addEventListener('click', function () { closeDialog(); });
                        overlay.addEventListener('click', function (e) { if (e.target === overlay) closeDialog(); });
                    }

                    function buildSandwichHtml(cfg) {
                        function infoRow(label, value, vc) {
                            return '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;border-bottom:1px solid #f1f5f9;">' +
                                '<span style="color:#64748b;font-size:12.5px;">' + label + '</span>' +
                                '<span style="color:' + (vc || '#1a2233') + ';font-size:13px;font-weight:600;text-align:right;">' + value + '</span>' +
                                '</div>';
                        }
                        function card(icon, heading, rows, bg) {
                            var rowsHtml = rows.map(function (r) { return infoRow(r.l, r.v, r.c); }).join('');
                            return '<div style="background:' + (bg || '#f8fafc') + ';border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:10px;">' +
                                '<div style="font-size:11.5px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">' + icon + ' ' + heading + '</div>' +
                                rowsHtml + '</div>';
                        }

                        var adjBg = cfg.adjacent.isPending ? '#fffbeb' : '#f0fdf4';
                        var adjSt = cfg.adjacent.isPending ? '#92400e' : '#166534';

                        var impactRows = [
                            { l: 'Applied days', v: cfg.impact.applied + ' day(s)' },
                            { l: 'Weekend counted as leave', v: '+' + cfg.impact.weekend + ' day(s)', c: '#d97706' },
                            { l: 'Total effective days', v: cfg.impact.total + ' day(s)', c: '#dc2626' }
                        ];
                        if (typeof cfg.impact.balance === 'number') impactRows.push({ l: 'Current paid balance', v: cfg.impact.balance + ' day(s)', c: '#0f766e' });
                        if (cfg.impact.balanceAfter !== undefined) impactRows.push({ l: 'Balance after deduction', v: cfg.impact.balanceAfter + ' day(s)', c: '#2563eb' });

                        var pendingBanner = '';
                        if (cfg.pendingWarning) {
                            pendingBanner = '<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 14px;margin-bottom:10px;font-size:13px;">' +
                                '<div style="font-weight:700;color:#92400e;margin-bottom:5px;">⏳ Adjacent Leave is Still Pending</div>' +
                                '<div style="color:#78350f;line-height:1.5;">' + cfg.pendingWarning + '</div></div>';
                        }

                        return '<div style="background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.22);width:100%;max-width:510px;max-height:90vh;overflow-y:auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">' +
                            '<div style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:16px 20px;border-radius:12px 12px 0 0;color:#fff;">' +
                            '<div style="font-size:17px;font-weight:700;">⚠️ Sandwich Rule Notification</div>' +
                            '<div style="font-size:12px;opacity:.85;margin-top:3px;">' + cfg.title + '</div></div>' +
                            '<div style="padding:16px 18px 4px;">' +
                            card('📅', 'Leave Being Applied', [
                                { l: 'Date', v: cfg.applying.date },
                                { l: 'Leave Type', v: cfg.applying.type },
                                { l: 'Duration', v: cfg.applying.duration }
                            ]) +
                            card('📅', 'Adjacent ' + cfg.adjacent.day + ' Leave Detected', [
                                { l: 'Period', v: cfg.adjacent.period },
                                { l: 'Status', v: cfg.adjacent.status, c: adjSt },
                                { l: 'Leave Type', v: cfg.adjacent.type }
                            ], adjBg) +
                            card('📆', 'Sandwiched Weekend', [
                                { l: 'Saturday', v: cfg.weekend.sat },
                                { l: 'Sunday', v: cfg.weekend.sun }
                            ]) +
                            card('📊', 'Leave Impact (Sandwich Rule)', impactRows, '#fff7ed') +
                            pendingBanner +
                            cfg.bottomSection +
                            '</div>' +
                            '<div style="padding:14px 18px;border-top:1px solid #e5e7eb;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">' +
                            '<button id="sw-no" style="padding:9px 18px;border:1.5px solid #d1d5db;background:#fff;color:#374151;border-radius:7px;font-size:13.5px;font-weight:500;cursor:pointer;">Cancel</button>' +
                            '<button id="sw-yes" style="padding:9px 18px;background:' + (cfg.yesColor || '#2563eb') + ';color:#fff;border:none;border-radius:7px;font-size:13.5px;font-weight:600;cursor:pointer;">' + cfg.yesLabel + '</button>' +
                            '</div></div>';
                    }

                    // ── Run sandwich check then submit ──
                    checkSandwichRule(startDate, endDate, employeeId).then(function (sandwich) {
                        if (!sandwich.isSandwich) {
                            processLeaveWithBalance(leaveDays);
                            return;
                        }

                        var totalDays = leaveDays + sandwich.weekendDays;
                        var thisDateFmt = formatDisplayDate(sandwich.thisDate);
                        var satDateFmt = formatDisplayDate(sandwich.satDate);
                        var sunDateFmt = formatDisplayDate(sandwich.sunDate);
                        var adjRangeTxt = sandwich.adjLeaveStart === sandwich.adjLeaveEnd
                            ? formatDisplayDate(sandwich.adjLeaveStart)
                            : formatDisplayDate(sandwich.adjLeaveStart) + ' to ' + formatDisplayDate(sandwich.adjLeaveEnd);

                        var pendingWarning = sandwich.isPending
                            ? 'Employee\'s <strong>' + sandwich.adjDay + '</strong> leave (' + adjRangeTxt + ') is currently <strong>Pending</strong>. ' +
                            'The sandwich weekend deduction is being applied now. ' +
                            'If that leave is <strong>approved</strong>, the full deduction (' + totalDays + ' days) stands. ' +
                            'If it is <strong>rejected</strong>, no sandwich rule applies and the weekend days will <strong>not</strong> be counted.'
                            : null;

                        var baseCfg = {
                            title: 'Corporate sandwich rule applies to ' + employeeName + '\'s leave request',
                            applying: {
                                date: thisDateFmt + ' (' + sandwich.thisDay + ')',
                                type: leaveTypeVal,
                                duration: leaveDays + ' day(s)'
                            },
                            adjacent: {
                                day: sandwich.adjDay,
                                period: adjRangeTxt,
                                status: sandwich.isPending ? '⏳ Pending Approval' : '✅ Approved',
                                isPending: sandwich.isPending,
                                type: sandwich.adjLeaveType
                            },
                            weekend: { sat: satDateFmt, sun: sunDateFmt },
                            impact: { applied: leaveDays, weekend: sandwich.weekendDays, total: totalDays },
                            pendingWarning: pendingWarning
                        };

                        if (leaveTypeVal === 'Paid') {
                            self.fetchLeaveBalance(employeeId).then(function (balance) {
                                var canApplyPaid = balance >= 3 && balance >= totalDays;

                                if (canApplyPaid) {
                                    var balanceAfter = (balance - totalDays).toFixed(1);
                                    var cfg = {
                                        title: baseCfg.title, applying: baseCfg.applying,
                                        adjacent: baseCfg.adjacent, weekend: baseCfg.weekend,
                                        impact: { applied: leaveDays, weekend: sandwich.weekendDays, total: totalDays, balance: balance, balanceAfter: balanceAfter },
                                        pendingWarning: pendingWarning,
                                        bottomSection: '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:11px 14px;margin-bottom:14px;font-size:13px;color:#1e40af;font-weight:600;">' +
                                            '💳 Balance After Deduction: ' + balanceAfter + ' day(s)</div>',
                                        yesLabel: 'Yes, proceed with Paid leave',
                                        yesColor: '#2563eb'
                                    };
                                    showSandwichDialog(buildSandwichHtml(cfg), function () {
                                        processLeaveWithBalance(totalDays);
                                    });
                                } else {
                                    var reasonHtml = balance < 3
                                        ? 'Employee\'s paid balance (<strong>' + balance + ' day(s)</strong>) is below the minimum of <strong>3 days</strong> required under the sandwich rule.'
                                        : 'Employee\'s paid balance (<strong>' + balance + ' day(s)</strong>) is insufficient for the total deduction of <strong>' + totalDays + ' days</strong> (applied ' + leaveDays + ' + 2 weekend).';
                                    var cfg = {
                                        title: baseCfg.title, applying: baseCfg.applying,
                                        adjacent: baseCfg.adjacent, weekend: baseCfg.weekend,
                                        impact: { applied: leaveDays, weekend: sandwich.weekendDays, total: totalDays, balance: balance },
                                        pendingWarning: pendingWarning,
                                        bottomSection:
                                            '<div style="background:#fff1f2;border:1px solid #fecaca;border-radius:8px;padding:11px 14px;margin-bottom:10px;font-size:13px;">' +
                                            '<div style="font-weight:700;color:#991b1b;margin-bottom:4px;">❌ Cannot Apply as Paid Leave</div>' +
                                            '<div style="color:#7f1d1d;line-height:1.5;">' + reasonHtml + '</div></div>' +
                                            '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:11px 14px;margin-bottom:14px;font-size:13px;">' +
                                            '<div style="font-weight:700;color:#166534;margin-bottom:4px;">✅ Can Apply as Unpaid Leave</div>' +
                                            '<div style="color:#14532d;line-height:1.6;">• No paid balance will be checked or deducted<br>' +
                                            '• ' + leaveDays + ' day(s) recorded as unpaid<br>' +
                                            '• Weekend days are <strong>not</strong> extra-counted for unpaid leaves</div></div>',
                                        yesLabel: 'Apply as Unpaid Leave',
                                        yesColor: '#16a34a'
                                    };
                                    showSandwichDialog(buildSandwichHtml(cfg), function () {
                                        createLeave(leaveDays, 'Unpaid');
                                    });
                                }
                            });
                        } else {
                            // Unpaid: no paid balance deduction, but weekend days still counted
                            var cfg = {
                                title: baseCfg.title, applying: baseCfg.applying,
                                adjacent: baseCfg.adjacent, weekend: baseCfg.weekend,
                                impact: { applied: leaveDays, weekend: sandwich.weekendDays, total: totalDays },
                                pendingWarning: pendingWarning,
                                bottomSection:
                                    '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:11px 14px;margin-bottom:14px;font-size:13px;color:#1e40af;">' +
                                    '<strong>ℹ️ Unpaid Leave — Sandwich Rule Applies</strong>' +
                                    '<div style="margin-top:5px;line-height:1.6;">• No paid balance will be deducted<br>' +
                                    '• ' + totalDays + ' day(s) recorded as unpaid (including ' + sandwich.weekendDays + ' weekend day(s))</div></div>',
                                yesLabel: 'Yes, I want to proceed',
                                yesColor: '#2563eb'
                            };
                            showSandwichDialog(buildSandwichHtml(cfg), function () {
                                createLeave(totalDays);
                            });
                        }
                    });
                });
            }, 100);
        },

        actionApproveRequest: function (e) {
            e.preventDefault();

            var self = this;
            var recordId = $(e.currentTarget).data('id');

            if (!recordId) { Espo.Ui.warning('Record ID not found'); return; }
            if (!confirm("Approve this leave?")) return;

            Espo.Ajax.putRequest('CLeaveRequest/' + recordId, { status: 'Approved' }).then(function () {
                Espo.Ui.success('Leave Approved');
                self.loadLeaveRequests();
            });
        },

        actionCancelLeaveRequest: function (e) {
            console.log('Cancel button clicked');
            e.preventDefault();

            var self = this;
            var recordId = $(e.currentTarget).data('id');

            if (!recordId) { Espo.Ui.warning('Record ID not found'); return; }
            if (!confirm("Cancel this leave?")) return;

            Espo.Ajax.getRequest('CLeaveRequest/' + recordId).then(function (leave) {
                Espo.Ajax.putRequest('CLeaveRequest/' + recordId, { status: 'Cancelled' });

                if (leave.leaveType === 'Paid') {
                    let leaveDays = leave.days || 0;
                    Espo.Ajax.getRequest('CLeaveBalance', {
                        where: [{ type: 'equals', attribute: 'userId', value: leave.userId }]
                    }).then(function (res) {
                        let record = res.list[0];
                        Espo.Ajax.putRequest('CLeaveBalance/' + record.id, {
                            balance: (record.balance || 0) + leaveDays
                        }).then(function () {
                            Espo.Ui.success('Leave Cancelled & Balance Restored');
                            self.loadLeaveRequests();
                        });
                    });
                } else {
                    Espo.Ui.success('Leave Cancelled');
                    self.loadLeaveRequests();
                }
            });
        },

        actionRejectRequest: function (e) {
            e.preventDefault();

            var self = this;
            var recordId = $(e.currentTarget).data('id');

            if (!recordId) { Espo.Ui.warning('Record ID not found'); return; }
            if (!confirm("Reject this leave?")) return;

            Espo.Ajax.getRequest('CLeaveRequest/' + recordId).then(function (leave) {
                Espo.Ajax.putRequest('CLeaveRequest/' + recordId, { status: 'Rejected' });

                if (leave.leaveType === 'Paid') {
                    let leaveDays = leave.days || 0;
                    Espo.Ajax.getRequest('CLeaveBalance', {
                        where: [{ type: 'equals', attribute: 'userId', value: leave.userId }]
                    }).then(function (res) {
                        let record = res.list[0];
                        Espo.Ajax.putRequest('CLeaveBalance/' + record.id, {
                            balance: (record.balance || 0) + leaveDays
                        }).then(function () {
                            Espo.Ui.success('Leave Rejected & Balance Restored');
                            self.loadLeaveRequests();
                        });
                    });
                } else {
                    Espo.Ui.success('Leave Rejected');
                    self.loadLeaveRequests();
                }
            });
        },

        actionRevokeRequest: function (e) {
            e.preventDefault();
            console.log('Revoke button clicked');

            var self = this;
            var recordId = $(e.currentTarget).data('id');

            if (!recordId) { Espo.Ui.warning('Record ID not found'); return; }
            if (!confirm("Revoke this leave request?")) return;

            Espo.Ajax.getRequest('CLeaveRequest/' + recordId).then(function (leave) {
                if (!leave) { Espo.Ui.error('Leave not found'); return; }

                // CASE 1: APPROVED → move back to Pending
                if (leave.status === 'Approved') {
                    Espo.Ajax.putRequest('CLeaveRequest/' + recordId, { status: 'Pending' }).then(function () {
                        Espo.Ui.success('Leave moved back to Pending');
                        self.loadLeaveRequests();
                    });
                    return;
                }

                // CASE 2: REJECTED → restore balance (Paid only)
                if (leave.status === 'Rejected') {
                    let leaveDays = leave.days || 0;

                    if (!leaveDays || leaveDays <= 0) { Espo.Ui.error("Invalid leave days"); return; }

                    Espo.Ajax.getRequest('CLeaveBalance', {
                        where: [{ type: 'equals', attribute: 'userId', value: leave.userId }]
                    }).then(function (res) {
                        let record = res.list[0];

                        if (!record) { Espo.Ui.error("Leave balance record not found"); return; }

                        let currentBalance = record.balance || 0;

                        if (currentBalance - leaveDays < 0) {
                            Espo.Ui.error("You can't revoke this record due to insufficient leave balance");
                            return;
                        }

                        Espo.Ajax.putRequest('CLeaveBalance/' + record.id, {
                            balance: currentBalance - leaveDays
                        }).then(function () {
                            Espo.Ui.success('Leave balance restored');
                            Espo.Ajax.putRequest('CLeaveRequest/' + recordId, { status: 'Pending' }).then(function () {
                                self.loadLeaveRequests();
                            });
                        });
                    });

                    return;
                }

                // CASE 3: NOT ALLOWED
                Espo.Ui.error("You can't revoke this record");
            });
        },

        actionDeleteLeaveRequest: function (e) {
            e.preventDefault();

            var self = this;
            var recordId = $(e.currentTarget).data('id');

            if (!recordId) { Espo.Ui.warning('Record ID not found'); return; }

            if (!window.confirm("Are you sure you want to delete this leave request?")) return;

            Espo.Ajax.deleteRequest('CLeaveRequest/' + recordId)
                .then(function () {
                    Espo.Ui.success('Leave Request deleted Successfully!');
                    self.loadLeaveRequests();
                })
                .catch(function (err) {
                    console.error(err);
                    Espo.Ui.error('Error deleting leave');
                });
        },

        simpleModal: function (title, htmlContent) {
            var backdropId = 'helloBackdrop-' + Date.now();
            var modalId = 'helloModal-' + Date.now();

            var backdropHtml = '<div id="' + backdropId + '" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 1030;"></div>';

            var modalHtml = `
            <style>
                .is-invalid {
                    border: 1.5px solid #dc3545 !important;
                    box-shadow: 0 0 4px rgba(220, 53, 69, 0.4) !important;
                }
                @keyframes shake {
                    0% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    50% { transform: translateX(4px); }
                    75% { transform: translateX(-4px); }
                    100% { transform: translateX(0); }
                }
                .shake { animation: shake 0.3s linear; }
            </style>
            <div id="${modalId}" style="position: fixed; top: 0; right: 0; bottom: 0; z-index: 1040; width: 100%; max-width: 650px;">
                <div style="background: white; height: 100%; box-shadow: -3px 0 12px rgba(0,0,0,0.5); overflow-y: auto; width: 100%; display: flex; flex-direction: column;">
                    <div style="padding: 20px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                        <h5 style="margin: 0; color: #333; font-weight: 500;">${title}</h5>
                        <button class="modalCloseBtn" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0; color: #333;">×</button>
                    </div>
                    ${htmlContent}
                </div>
            </div>
            `;

            $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').remove();

            $(backdropHtml).appendTo('body');
            var $modal = $(modalHtml).appendTo('body');

            var scrollY = window.scrollY;
            $('body').css({ position: 'fixed', top: '-' + scrollY + 'px', width: '100%' });

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
                if (e.target.id === backdropId) closeModal();
            });

            $modal.on('click', function (e) {
                e.stopPropagation();
            });

            console.log('Modal overlay displayed:', modalId);

            return { modalId: modalId, closeModal: closeModal };
        },

    });
});