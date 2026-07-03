define('custom:views/leave/view', ['view'], function (Dep) {
    return Dep.extend({

        template: 'custom:leave/view',

        events: {
            'click [data-action="creditLeave"]': 'actionCreditLeave',
            'click [data-action="debitLeave"]': 'actionDebitLeave',
            'click [data-action="applyForLeave"]': 'actionApplyForLeave',
            'click [data-action="applyForEmployeeLeave"]': 'actionApplyForEmployeeLeave',
            'change #employeeFilter': 'actionFilterByEmployee',
            'change #yearFilter': 'actionFilterByYear',
            'click [data-action="prevPage"]': 'actionPrevPage',
            'click [data-action="nextPage"]': 'actionNextPage',
            'change [data-action="changePageSize"]': 'actionChangePageSize',
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

            this.pagination = {
                pendingLeaveList: { page: 1, pageSize: 10 },
                myLeaveHistoryList: { page: 1, pageSize: 10 },
                pendingAllLeaveList: { page: 1, pageSize: 10 },
                allLeaveList: { page: 1, pageSize: 10 }
            };

            this.yearList = [];
            this.selectedYear = '';
            this.selectedEmployeeName = '';
            this.selectedLeaveBalance = 0;
            this.selectedUnpaidLeaves = 0;
            this.visibleEmployeeIds = [];

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

            var self = this;
            this.getUserRoles().then(function () {
                self.loadEmployeeList();
                self.loadYearList().then(function () {
                    self.initializePage();
                });
            });
        },

        data: function () {
            var pendingLeavePager = this.getPagedData(this.pendingLeaveList, 'pendingLeaveList');
            var myHistoryPager = this.getPagedData(this.myLeaveHistoryList, 'myLeaveHistoryList');
            var pendingAllPager = this.getPagedData(this.pendingAllLeaveList, 'pendingAllLeaveList');
            var filteredAllLeaveList = (this.allLeaveList || []).filter(function (item) {
                return item.status !== 'Pending';
            });
            var allLeavePager = this.getPagedData(filteredAllLeaveList, 'allLeaveList');

            return {
                title: 'Leave',
                userName: this.getUser().get('name'),
                loginUserId: this.getUser().get('id'),
                isAdmin: this.getUser().isAdmin() || this.isHR,
                isEmployee: this.isEmployee,
                leaveBalance: this.leaveBalance || 0,
                totalUnpaidLeaves: this.totalUnpaidLeaves || 0,
                employeeList: this.employeeList,
                selectedEmployeeId: this.selectedEmployeeId || null,
                selectedEmployeeName: this.selectedEmployeeName,
                selectedLeaveBalance: this.selectedLeaveBalance || 0,
                selectedUnpaidLeaves: this.selectedUnpaidLeaves || 0,
                hasSelectedEmployee: !!this.selectedEmployeeId,
                yearList: this.yearList,
                selectedYear: this.selectedYear,
                pendingLeaveList: pendingLeavePager.list,
                myLeaveHistoryList: myHistoryPager.list,
                pendingAllLeaveList: pendingAllPager.list,
                allLeaveList: allLeavePager.list,
                pendingLeavePager: pendingLeavePager,
                myHistoryPager: myHistoryPager,
                pendingAllPager: pendingAllPager,
                allLeavePager: allLeavePager
            };
        },

        getPaginationOptions: function (selectedSize) {
            return [
                { value: 5, label: '5', selected: String(selectedSize) === '5' },
                { value: 10, label: '10', selected: String(selectedSize) === '10' },
                { value: 15, label: '15', selected: String(selectedSize) === '15' },
                { value: 20, label: '20', selected: String(selectedSize) === '20' },
                { value: 'all', label: 'All', selected: String(selectedSize).toLowerCase() === 'all' }
            ];
        },

        getPagedData: function (list, key) {
            list = list || [];
            if (!this.pagination[key]) {
                this.pagination[key] = { page: 1, pageSize: 10 };
            }
            var pager = this.pagination[key];
            var total = list.length;
            var isAll = String(pager.pageSize).toLowerCase() === 'all';
            var totalPages = isAll ? 1 : Math.max(1, Math.ceil(total / pager.pageSize));
            var page = Math.min(pager.page, totalPages);
            if (page < 1) page = 1;
            this.pagination[key].page = page;
            var start = isAll ? 0 : (page - 1) * pager.pageSize;
            var end = isAll ? total : start + pager.pageSize;
            return {
                list: list.slice(start, end),
                page: page,
                pageSize: pager.pageSize,
                total: total,
                totalPages: totalPages,
                hasPrev: !isAll && page > 1,
                hasNext: !isAll && page < totalPages,
                start: total ? start + 1 : 0,
                end: total ? Math.min(end, total) : 0,
                isAll: isAll,
                sizeOptions: this.getPaginationOptions(pager.pageSize)
            };
        },

        changePage: function (key, direction) {
            if (!this.pagination[key]) return;
            var pager = this.pagination[key];
            if (String(pager.pageSize).toLowerCase() === 'all') return;
            pager.page = Math.max(1, pager.page + direction);
            this.reRender();
        },

        changePageSize: function (key, value) {
            if (!this.pagination[key]) return;
            this.pagination[key].pageSize = value === 'all' ? 'all' : parseInt(value, 10);
            this.pagination[key].page = 1;
            this.reRender();
        },

        resetPagination: function () {
            var self = this;
            Object.keys(this.pagination || {}).forEach(function (key) {
                self.pagination[key].page = 1;
            });
        },

        actionPrevPage: function (e) {
            e.preventDefault();
            var key = $(e.currentTarget).data('key');
            this.changePage(key, -1);
        },

        actionNextPage: function (e) {
            e.preventDefault();
            var key = $(e.currentTarget).data('key');
            this.changePage(key, 1);
        },

        actionChangePageSize: function (e) {
            var key = $(e.currentTarget).data('key');
            var value = $(e.currentTarget).val();
            this.changePageSize(key, value);
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
                years.sort(function (a, b) { return b - a; });
                self.yearList = years;
                self.selectedYear = years.length > 0 ? years[0] : new Date().getFullYear().toString();
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
            var selectedYear = e.currentTarget.value || $(e.currentTarget).val();
            this.selectedYear = selectedYear || this.yearList[0] || new Date().getFullYear().toString();
            this.resetPagination();
            this.refreshYearFilteredData();
        },

        actionFilterByEmployee: function (e) {
            var selectedId = e.currentTarget.value || $(e.currentTarget).val();
            this.selectedEmployeeId = selectedId || null;
            if (selectedId) {
                var selectedOption = e.currentTarget.options
                    ? e.currentTarget.options[e.currentTarget.selectedIndex]
                    : $(e.currentTarget).find('option:selected')[0];
                this.selectedEmployeeName = selectedOption ? selectedOption.text : '';
            } else {
                this.selectedEmployeeName = '';
                this.selectedLeaveBalance = 0;
                this.selectedUnpaidLeaves = 0;
            }
            this.resetPagination();
            this.loadAllLeaveRequests();
            this.loadSelectedEmployeeUnpaidLeaves(this.selectedEmployeeId);
            this.fetchSelectedEmployeeLeaveBalance(this.selectedEmployeeId);
        },

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
                self.reRender();
                return self.selectedLeaveBalance;
            }).catch(function (err) {
                console.error('Error fetching selected employee leave balance:', err);
                self.selectedLeaveBalance = 0;
                self.reRender();
                return 0;
            });
        },

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

        fetchSubordinateIds: function (managerIds, alreadyFetched) {
            var self = this;
            alreadyFetched = alreadyFetched || [];
            var newManagerIds = managerIds.filter(function (id) {
                return alreadyFetched.indexOf(id) === -1;
            });
            if (!newManagerIds.length) return Promise.resolve([]);
            newManagerIds.forEach(function (id) { alreadyFetched.push(id); });
            return Espo.Ajax.getRequest('ManagerMapping', {
                where: [{ type: 'in', attribute: 'approverId', value: newManagerIds }],
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
                if (!uniqueDirectReports.length) return [];
                return self.fetchSubordinateIds(uniqueDirectReports, alreadyFetched)
                    .then(function (deeperIds) {
                        return uniqueDirectReports.concat(deeperIds);
                    });
            }).catch(function (err) {
                console.error('Error fetching subordinate IDs:', err);
                return [];
            });
        },

        loadEmployeeList: function () {
            var self = this;
            var currentUserId = this.getUser().get('id');
            if (this.getUser().isAdmin() || this.isHR) {
                Espo.Ajax.getRequest('CAttendance/action/employeeList')
                    .then(function (response) {
                        self.employeeList = (response.list || []).map(function (u) {
                            return { id: u.id, name: u.name, isIntern: u.cIsIntern === true };
                        });
                        self.visibleEmployeeIds = self.employeeList.map(function (e) { return e.id; });
                        self.populateEmployeeDropdown();
                    })
                    .catch(function (err) { console.error('Error loading employee list:', err); });
                return;
            }
            self.fetchSubordinateIds([currentUserId], []).then(function (allSubordinateIds) {
                var allVisibleIds = [currentUserId].concat(allSubordinateIds).filter(function (id, idx, arr) {
                    return arr.indexOf(id) === idx;
                });
                if (!allVisibleIds.length) {
                    self.employeeList = [];
                    self.visibleEmployeeIds = [];
                    self.populateEmployeeDropdown();
                    return;
                }
                Espo.Ajax.getRequest('User', {
                    where: [{ type: 'in', attribute: 'id', value: allVisibleIds }],
                    maxSize: 200
                }).then(function (res) {
                    self.employeeList = (res.list || []).map(function (u) {
                        return { id: u.id, name: u.name, isIntern: u.cIsIntern === true };
                    });
                    self.visibleEmployeeIds = self.employeeList.map(function (e) { return e.id; });
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
            Espo.Ajax.getRequest('CLeaveRequest', { where: where, maxSize: 200 })
                .then(function (response) {
                    var list = response.list || [];
                    self.myLeaveList = list;
                    self.leaveList = list;
                    self.pendingLeaveList = list.filter(function (item) { return item.status === 'Pending'; });
                    self.myLeaveHistoryList = list.filter(function (item) { return item.status !== 'Pending'; });
                    self.render();
                })
                .catch(function (err) { console.error('Error loading my leave requests:', err); });
        },

        loadAllLeaveRequests: function () {
            var self = this;
            var currentUserId = this.getUser().get('id');

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
                            return Object.assign({}, item, { userName: item.user ? item.user.name : (item.userName || '') });
                        });
                        self.allLeaveList = all.filter(function (item) { return item.userId !== self.getUser().get('id'); });
                        self.pendingAllLeaveList = self.allLeaveList.filter(function (item) { return item.status === 'Pending'; });
                        self.reRender();
                    })
                    .catch(function (err) { console.error('Error loading employee leave requests:', err); });
                return;
            }

            if (this.selectedEmployeeId) {
                var url = 'CLeaveRequest?maxSize=200&expand=user';
                url += '&where[0][type]=equals&where[0][attribute]=userId&where[0][value]=' + this.selectedEmployeeId;
                if (this.getFilterYear()) {
                    url += '&where[1][type]=equals&where[1][attribute]=fiscalYear&where[1][value]=' + this.getFilterYear();
                }
                Espo.Ajax.getRequest(url)
                    .then(function (response) {
                        var all = (response.list || []).map(function (item) {
                            return Object.assign({}, item, { userName: item.user ? item.user.name : (item.userName || '') });
                        });
                        self.allLeaveList = all.filter(function (item) { return item.userId !== self.getUser().get('id'); });
                        self.pendingAllLeaveList = self.allLeaveList.filter(function (item) { return item.status === 'Pending'; });
                        self.reRender();
                    })
                    .catch(function (err) { console.error('Error loading leave requests for selected employee:', err); });
                return;
            }

            var fetchLeavesByIds = function (employeeIds) {
                if (!employeeIds || !employeeIds.length) employeeIds = [currentUserId];
                Espo.Ajax.getRequest('CLeaveRequest', {
                    where: self.appendFiscalYearWhere([{ type: 'in', attribute: 'userId', value: employeeIds }]),
                    maxSize: 200
                }).then(function (response) {
                    var all = (response.list || []).map(function (item) {
                        return Object.assign({}, item, { userName: item.user ? item.user.name : (item.userName || '') });
                    });
                    self.allLeaveList = all.filter(function (item) { return item.userId !== self.getUser().get('id'); });
                    self.pendingAllLeaveList = self.allLeaveList.filter(function (item) { return item.status === 'Pending'; });
                    self.reRender();
                }).catch(function (err) { console.error('Error loading leave requests by employee IDs:', err); });
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
                where: this.appendFiscalYearWhere([{ type: 'equals', attribute: 'userId', value: userId }])
            }).then(function (response) {
                var list = response.list || [];
                self.leaveBalance = list.length > 0 ? (parseFloat(list[0].balance) || 0) : 0;
                self.reRender();
                return self.leaveBalance;
            }).catch(function (err) {
                console.error('Error fetching leave balance:', err);
                self.leaveBalance = 0;
                return 0;
            });
        },

        loadUnpaidLeaves: function (userId) {
            var self = this;
            var currentUserId = this.getUser().get('id');
            var where = [
                { type: 'equals', attribute: 'status', value: 'Approved' },
                { type: 'equals', attribute: 'leaveType', value: 'Unpaid' },
            ];
            if (this.getUser().isAdmin() || this.isHR) {
                if (!userId) { this.totalUnpaidLeaves = 0; this.reRender(); return; }
                where.push({ type: 'equals', attribute: 'userId', value: userId });
            } else {
                where.push({ type: 'equals', attribute: 'userId', value: userId || currentUserId });
            }
            Espo.Ajax.getRequest('CLeaveRequest', {
                where: this.appendFiscalYearWhere(where),
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
                self.totalUnpaidLeaves = total;
                self.reRender();
            }).catch(function (err) {
                console.error('Error fetching unpaid leaves:', err);
                self.totalUnpaidLeaves = 0;
                self.reRender();
            });
        },

        // =====================================================================
        // SHARED SANDWICH HELPERS
        // =====================================================================

        /**
         * swIsPrevMonth(startDate, endDate, today)
         * Returns true when the leave is (even partially) in a previous month.
         * Used consistently in BOTH the normal path AND the sandwich path.
         */
        swIsPrevMonth: function (startDate, endDate, today) {
            var fmt = this.swFormatDate.bind(this);
            var currentMonth = fmt(today).substring(0, 7); // "YYYY-MM"
            var startMonth = startDate.substring(0, 7);
            var endMonth = endDate.substring(0, 7);
            return (startMonth < currentMonth || endMonth < currentMonth);
        },
        /**
         * swNormalizeDates(startDate, endDate)
         * Ensures the returned pair is always in ascending order,
         * regardless of how the caller supplied them.
        */
        swNormalizeDates: function (startDate, endDate) {
            if (!startDate || !endDate) {
                return { startDate: startDate, endDate: endDate || startDate };
            }
            if (startDate > endDate) {
                return { startDate: endDate, endDate: startDate };
            }
            return { startDate: startDate, endDate: endDate };
        },

        /**
         * swEffectiveBalance(rawBalance, startDate, endDate, today)
         * Returns the balance to use for all checks/display.
         * If the leave is for a previous month → rawBalance - 1, else rawBalance.
         */
        swEffectiveBalance: function (rawBalance, startDate, endDate, today) {
            return this.swIsPrevMonth(startDate, endDate, today)
                ? rawBalance - 1
                : rawBalance;
        },

        /** Format a Date object → "YYYY-MM-DD". */
        swFormatDate: function (d) {
            return d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0');
        },

        /** Format a "YYYY-MM-DD" string → human-readable label. */
        swFormatDisplayDate: function (dateStr) {
            var d = new Date(dateStr + 'T00:00:00');
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
        },

        /** Show the floating sandwich-rule confirmation overlay. */
        swShowDialog: function (bodyHtml, onYes) {
            var overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
                'background:rgba(0,0,0,0.55);z-index:9998;display:flex;align-items:center;' +
                'justify-content:center;padding:12px;box-sizing:border-box;';
            overlay.innerHTML = bodyHtml;
            document.body.appendChild(overlay);
            function closeDialog() { overlay.remove(); }
            var yesBtn = overlay.querySelector('#sw-yes');
            var noBtn = overlay.querySelector('#sw-no');
            if (yesBtn) yesBtn.addEventListener('click', function () { closeDialog(); if (onYes) onYes(); });
            if (noBtn) noBtn.addEventListener('click', function () { closeDialog(); });
            overlay.addEventListener('click', function (e) { if (e.target === overlay) closeDialog(); });
        },

        /**
         * Build the full sandwich-notification HTML from a config object.
         *
         * cfg = {
         *   title           : String
         *   applying        : { date, type, duration }
         *   sandwichedLabel : String   e.g. "Weekend" | "Holiday" | "Weekend + Holiday"
         *   sandwichedRows  : [{l, v, c?}]
         *   impact          : { applied, sandwiched, total, balance?, balanceAfter? }
         *   adjacent?       : { day, period, status, isPending, type }
         *   pendingWarning? : String (HTML)
         *   bottomSection   : String (HTML)
         *   yesLabel        : String
         *   yesColor        : String (css colour)
         * }
         */
        swBuildHtml: function (cfg) {
            function infoRow(label, value, vc) {
                return '<div style="display:flex;justify-content:space-between;align-items:baseline;' +
                    'padding:5px 0;border-bottom:1px solid #f1f5f9;">' +
                    '<span style="color:#64748b;font-size:12.5px;">' + label + '</span>' +
                    '<span style="color:' + (vc || '#1a2233') + ';font-size:13px;font-weight:600;text-align:right;">' + value + '</span>' +
                    '</div>';
            }
            function card(icon, heading, rows, bg) {
                var rowsHtml = rows.map(function (r) { return infoRow(r.l, r.v, r.c); }).join('');
                return '<div style="background:' + (bg || '#f8fafc') + ';border:1px solid #e2e8f0;' +
                    'border-radius:8px;padding:12px 14px;margin-bottom:10px;">' +
                    '<div style="font-size:11.5px;font-weight:700;color:#475569;text-transform:uppercase;' +
                    'letter-spacing:.5px;margin-bottom:8px;">' + icon + ' ' + heading + '</div>' +
                    rowsHtml + '</div>';
            }

            var impactRows = [
                { l: 'Applied days', v: cfg.impact.applied + ' day(s)' },
                { l: cfg.sandwichedLabel + ' counted as leave', v: '+' + cfg.impact.sandwiched + ' day(s)', c: '#d97706' },
                { l: 'Total effective days', v: cfg.impact.total + ' day(s)', c: '#dc2626' }
            ];
            if (typeof cfg.impact.balance === 'number')
                impactRows.push({ l: 'Effective paid balance', v: cfg.impact.balance + ' day(s)', c: '#0f766e' });
            if (cfg.impact.balanceAfter !== undefined)
                impactRows.push({ l: 'Balance after deduction', v: cfg.impact.balanceAfter + ' day(s)', c: '#2563eb' });

            var pendingBanner = '';
            if (cfg.pendingWarning) {
                pendingBanner = '<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;' +
                    'padding:12px 14px;margin-bottom:10px;font-size:13px;">' +
                    '<div style="font-weight:700;color:#92400e;margin-bottom:5px;">\u23f3 Adjacent Leave is Still Pending</div>' +
                    '<div style="color:#78350f;line-height:1.5;">' + cfg.pendingWarning + '</div></div>';
            }

            var adjCard = '';
            if (cfg.adjacent) {
                var adjBg = cfg.adjacent.isPending ? '#fffbeb' : '#f0fdf4';
                var adjSt = cfg.adjacent.isPending ? '#92400e' : '#166534';
                adjCard = card('\ud83d\udcc5', 'Adjacent ' + cfg.adjacent.day + ' Leave Detected', [
                    { l: 'Period', v: cfg.adjacent.period },
                    { l: 'Status', v: cfg.adjacent.status, c: adjSt },
                    { l: 'Leave Type', v: cfg.adjacent.type }
                ], adjBg);
            }

            return '<div style="background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.22);' +
                'width:100%;max-width:510px;max-height:90vh;overflow-y:auto;' +
                'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">' +
                '<div style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:16px 20px;' +
                'border-radius:12px 12px 0 0;color:#fff;">' +
                '<div style="font-size:17px;font-weight:700;">\u26a0\ufe0f Sandwich Rule Notification</div>' +
                '<div style="font-size:12px;opacity:.85;margin-top:3px;">' + cfg.title + '</div></div>' +
                '<div style="padding:16px 18px 4px;">' +
                card('\ud83d\udcc5', 'Leave Being Applied', [
                    { l: 'Date', v: cfg.applying.date },
                    { l: 'Leave Type', v: cfg.applying.type },
                    { l: 'Duration', v: cfg.applying.duration }
                ]) +
                adjCard +
                card('\ud83d\udcc6', 'Sandwiched ' + cfg.sandwichedLabel, cfg.sandwichedRows, '#f0f9ff') +
                card('\ud83d\udcca', 'Leave Impact (Sandwich Rule)', impactRows, '#fff7ed') +
                pendingBanner +
                cfg.bottomSection +
                '</div>' +
                '<div style="padding:14px 18px;border-top:1px solid #e5e7eb;display:flex;gap:10px;' +
                'justify-content:flex-end;flex-wrap:wrap;">' +
                '<button id="sw-no" style="padding:9px 18px;border:1.5px solid #d1d5db;background:#fff;' +
                'color:#374151;border-radius:7px;font-size:13.5px;font-weight:500;cursor:pointer;">Cancel</button>' +
                '<button id="sw-yes" style="padding:9px 18px;background:' + (cfg.yesColor || '#2563eb') + ';' +
                'color:#fff;border:none;border-radius:7px;font-size:13.5px;font-weight:600;cursor:pointer;">' +
                cfg.yesLabel + '</button>' +
                '</div></div>';
        },

        /**
         * swCheckSandwich(startDate, endDate, dayMode, userId)
         *
         * Detects ALL sandwich patterns:
         *   A) Leave – [Weekend / Holiday / Weekend+Holiday gap] – Leave  (LHL)
         *   B) Holiday – Leave – Holiday  (HLH)  — new leave must be Full Day
         *
         * Returns Promise resolving to:
         *   { isSandwich: false }
         *   OR
         *   {
         *     isSandwich      : true,
         *     sandwichedDays  : Number,
         *     sandwichedLabel : String,  // "Weekend" | "Holiday" | "Weekend + Holiday"
         *     sandwichedRows  : [{l,v,c}],
         *     scenario        : 'LHL' | 'HLH',
         *     // LHL only:
         *     adjDay, adjDate, adjLeaveStart, adjLeaveEnd, adjLeaveType, isPending,
         *     thisDate, thisDay
         *   }
         */
        swCheckSandwich: function (startDate, endDate, dayMode, userId) {
            var self = this;
            var norm = this.swNormalizeDates(startDate, endDate);
            startDate = norm.startDate;
            endDate = norm.endDate;

            function addDays(dateStr, n) {
                var d = new Date(dateStr + 'T00:00:00');
                d.setDate(d.getDate() + n);
                return self.swFormatDate(d);
            }
            function dow(dateStr) {
                return new Date(dateStr + 'T00:00:00').getDay();
            }
            function isWeekend(dateStr) {
                var d = dow(dateStr); return d === 0 || d === 6;
            }

            var windowStart = addDays(startDate, -15);
            var windowEnd = addDays(endDate, +15);

            var holidayPromise = Espo.Ajax.getRequest('CHoliday', {
                where: [
                    { type: 'greaterThanOrEquals', attribute: 'date', value: windowStart },
                    { type: 'lessThanOrEquals', attribute: 'date', value: windowEnd }
                ],
                maxSize: 200
            });

            var selectionPromise = Espo.Ajax.getRequest('CHolidaySelection', {
                where: [{ type: 'equals', attribute: 'userId', value: userId }],
                maxSize: 200
            });

            var leavePromise = Espo.Ajax.getRequest('CLeaveRequest', {
                where: [
                    { type: 'equals', attribute: 'userId', value: userId },
                    { type: 'in', attribute: 'status', value: ['Approved', 'Pending'] }
                ],
                maxSize: 200
            });

            return Promise.all([holidayPromise, selectionPromise, leavePromise])
                .then(function (results) {
                    var holidays = results[0].list || [];
                    var selections = results[1].list || [];
                    var leaves = results[2].list || [];

                    // Build set of optional holiday IDs the user applied for
                    var appliedOptionalIds = {};
                    selections.forEach(function (s) {
                        if (s.holidayId) appliedOptionalIds[s.holidayId] = true;
                    });

                    // Map: dateStr → holiday record (only holidays that count for this user)
                    var holidayMap = {};
                    holidays.forEach(function (h) {
                        if (!h.date) return;
                        if (h.type === 'Mandatory') {
                            holidayMap[h.date] = h;
                        } else if (h.type === 'Optional' && appliedOptionalIds[h.id]) {
                            holidayMap[h.date] = h;
                        }
                    });

                    function isNonWorking(dateStr) {
                        return isWeekend(dateStr) || !!holidayMap[dateStr];
                    }
                    function nonWorkingLabel(dateStr) {
                        if (isWeekend(dateStr) && holidayMap[dateStr])
                            return 'Weekend + Holiday (' + (holidayMap[dateStr].name || '') + ')';
                        if (holidayMap[dateStr])
                            return 'Holiday (' + (holidayMap[dateStr].name || '') + ')';
                        return 'Weekend';
                    }

                    // ── SCENARIO A: Leave – gap – Leave  (LHL) ──────────────

                    function findLeaveContaining(dateStr) {
                        for (var i = 0; i < leaves.length; i++) {
                            var l = leaves[i];
                            var ls = l.startDate;
                            var le = l.endDate || l.startDate;
                            if (dateStr >= ls && dateStr <= le) return l;
                        }
                        return null;
                    }

                    function collectNonWorkingBlock(fromDate, direction) {
                        // direction: +1 forward, -1 backward
                        var block = [];
                        var step = 1;
                        while (true) {
                            var d = addDays(fromDate, direction * step);
                            if (!isNonWorking(d)) break;
                            if (direction > 0) block.push(d); else block.unshift(d);
                            step++;
                            if (step > 14) break; // safety cap
                        }
                        return block;
                    }

                    function tryLHL() {
                        // ── Check BEFORE side (existing leave … gap … new leave) ──
                        // New leave must not start with Second Half (that side is exempt)
                        if (dayMode !== 'Second Half') {
                            var blockBefore = collectNonWorkingBlock(startDate, -1);
                            if (blockBefore.length) {
                                var edgeBefore = addDays(blockBefore[0], -1);
                                var adjLeave = findLeaveContaining(edgeBefore);
                                if (adjLeave) {
                                    // Exempt if adjacent leave's last day is First Half
                                    var adjDm = adjLeave.dayMode || 'Full';
                                    if (adjDm !== 'First Half') {
                                        var swDates = blockBefore;
                                        var hasWeekend = swDates.some(function (d) { return isWeekend(d); });
                                        var hasHoliday = swDates.some(function (d) { return !!holidayMap[d]; });
                                        var gapLabel = (hasWeekend && hasHoliday) ? 'Weekend + Holiday'
                                            : hasHoliday ? 'Holiday' : 'Weekend';
                                        return {
                                            isSandwich: true,
                                            scenario: 'LHL',
                                            sandwichedDays: swDates.length,
                                            sandwichedLabel: gapLabel,
                                            sandwichedRows: swDates.map(function (d) {
                                                return { l: self.swFormatDisplayDate(d), v: nonWorkingLabel(d), c: '#d97706' };
                                            }),
                                            thisDate: startDate,
                                            thisDay: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow(startDate)],
                                            adjDay: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow(edgeBefore)],
                                            adjDate: edgeBefore,
                                            adjLeaveStart: adjLeave.startDate,
                                            adjLeaveEnd: adjLeave.endDate || adjLeave.startDate,
                                            adjLeaveType: adjLeave.leaveType || 'Paid',
                                            isPending: adjLeave.status === 'Pending',
                                            // NEW: extend the record to cover the sandwiched gap on this side
                                            rangeStartDate: swDates[0],   // earliest gap day (e.g. 30 May)
                                            rangeEndDate: endDate,        // applied end date, unchanged (e.g. 1 Jun)
                                        };
                                        // return {
                                        //     isSandwich: true,
                                        //     scenario: 'LHL',
                                        //     sandwichedDays: swDates.length,
                                        //     sandwichedLabel: gapLabel,
                                        //     sandwichedRows: swDates.map(function (d) {
                                        //         return { l: self.swFormatDisplayDate(d), v: nonWorkingLabel(d), c: '#d97706' };
                                        //     }),
                                        //     thisDate: startDate,
                                        //     thisDay: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow(startDate)],
                                        //     adjDay: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow(edgeBefore)],
                                        //     adjDate: edgeBefore,
                                        //     adjLeaveStart: adjLeave.startDate,
                                        //     adjLeaveEnd: adjLeave.endDate || adjLeave.startDate,
                                        //     adjLeaveType: adjLeave.leaveType || 'Paid',
                                        //     isPending: adjLeave.status === 'Pending',
                                        // };
                                    }
                                }
                            }
                        }

                        // ── Check AFTER side (new leave … gap … existing leave) ──
                        // New leave must not end with First Half (that side is exempt)
                        if (dayMode !== 'First Half') {
                            var blockAfter = collectNonWorkingBlock(endDate, +1);
                            if (blockAfter.length) {
                                var edgeAfter = addDays(blockAfter[blockAfter.length - 1], +1);
                                var adjLeave = findLeaveContaining(edgeAfter);
                                if (adjLeave) {
                                    // Exempt if adjacent leave's first day is Second Half
                                    var adjDm = adjLeave.dayMode || 'Full';
                                    if (adjDm !== 'Second Half') {
                                        var swDates = blockAfter;
                                        var hasWeekend = swDates.some(function (d) { return isWeekend(d); });
                                        var hasHoliday = swDates.some(function (d) { return !!holidayMap[d]; });
                                        var gapLabel = (hasWeekend && hasHoliday) ? 'Weekend + Holiday'
                                            : hasHoliday ? 'Holiday' : 'Weekend';
                                        return {
                                            isSandwich: true,
                                            scenario: 'LHL',
                                            sandwichedDays: swDates.length,
                                            sandwichedLabel: gapLabel,
                                            sandwichedRows: swDates.map(function (d) {
                                                return { l: self.swFormatDisplayDate(d), v: nonWorkingLabel(d), c: '#d97706' };
                                            }),
                                            thisDate: endDate,
                                            thisDay: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow(endDate)],
                                            adjDay: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow(edgeAfter)],
                                            adjDate: edgeAfter,
                                            adjLeaveStart: adjLeave.startDate,
                                            adjLeaveEnd: adjLeave.endDate || adjLeave.startDate,
                                            adjLeaveType: adjLeave.leaveType || 'Paid',
                                            isPending: adjLeave.status === 'Pending',
                                            // NEW: extend the record to cover the sandwiched gap on this side
                                            rangeStartDate: startDate,               // applied start date, unchanged (e.g. 29 May)
                                            rangeEndDate: swDates[swDates.length - 1], // latest gap day (e.g. 31 May)
                                        };
                                    }
                                }
                            }
                        }

                        return null;
                    }

                    // ── SCENARIO B: Holiday – Leave – Holiday  (HLH) ────────
                    // Only applies when the new leave is Full Day
                    function tryHLH() {
                        if (dayMode !== 'Full') return null;
                        var dayBefore = addDays(startDate, -1);
                        var dayAfter = addDays(endDate, +1);
                        var hBefore = holidayMap[dayBefore];
                        var hAfter = holidayMap[dayAfter];
                        if (!hBefore || !hAfter) return null;
                        return {
                            isSandwich: true,
                            scenario: 'HLH',
                            sandwichedDays: 2,
                            sandwichedLabel: 'Holiday',
                            sandwichedRows: [
                                { l: self.swFormatDisplayDate(dayBefore), v: 'Holiday (' + (hBefore.name || '') + ')', c: '#d97706' },
                                { l: self.swFormatDisplayDate(dayAfter), v: 'Holiday (' + (hAfter.name || '') + ')', c: '#d97706' }
                            ],
                            thisDate: startDate,
                            thisDay: 'Leave',
                            // NEW: extend the saved record to span both bordering holidays
                            rangeStartDate: dayBefore,
                            rangeEndDate: dayAfter,
                        };
                    }

                    var lhlResult = tryLHL();
                    if (lhlResult) return lhlResult;
                    var hlhResult = tryHLH();
                    if (hlhResult) return hlhResult;
                    return { isSandwich: false };
                })
                .catch(function (err) {
                    console.error('Sandwich check error:', err);
                    return { isSandwich: false };
                });
        },

        /**
         * swHandleResult(opts)
         *
         * Called after swCheckSandwich resolves.  Applies the previous-month
         * balance rule (effectiveBalance = rawBalance - 1) CONSISTENTLY in
         * ALL code paths: canApplyPaid check, dialog display, and deduction.
         *
         * opts = {
         *   self, sandwich, leaveDays, leaveTypeVal,
         *   startDate, endDate, duration, userId,
         *   displayName, isSelf, today,
         *   processLeaveWithBalance(effectiveDays, overrideType?),
         *   createLeave(effectiveDays, overrideType?)
         * }
         *
         * NOTE: processLeaveWithBalance already handles the actual DB deduction
         * using effectiveBalance internally — we only need it for dialog display
         * and the canApplyPaid gate here.
         */
        swHandleResult: function (opts) {
            var self = opts.self;
            var sandwich = opts.sandwich;
            var leaveDays = opts.leaveDays;
            var leaveTypeVal = opts.leaveTypeVal;
            var startDate = opts.startDate;
            var endDate = opts.endDate;
            var userId = opts.userId;
            var displayName = opts.displayName;
            var isSelf = opts.isSelf;
            var today = opts.today;
            var processLeaveWithBalance = opts.processLeaveWithBalance;
            var createLeave = opts.createLeave;

            if (!sandwich.isSandwich) {
                processLeaveWithBalance(leaveDays);
                return;
            }

            var totalDays = leaveDays + sandwich.sandwichedDays;

            // Extend the outer startDate/endDate closures to cover the sandwiched holidays
            // (HLH: holiday-leave-holiday), so createLeave() persists the full span
            // instead of just the applied date. (LHL is intentionally excluded here —
            // its gap boundary is bounded by another leave record, handled separately.)
            if (opts.setDates && sandwich.scenario === 'HLH' &&
                (sandwich.rangeStartDate || sandwich.rangeEndDate)) {
                opts.setDates(
                    sandwich.rangeStartDate || startDate,
                    sandwich.rangeEndDate || endDate
                );
            }

            // ── Build "applying" date label ──
            var applyingDateLabel = self.swFormatDisplayDate(startDate);

            // ── Adjacent-leave block (LHL only) ──
            var adjacentCfg = null;
            var pendingWarning = null;
            if (sandwich.scenario === 'LHL' && sandwich.adjLeaveStart) {
                var adjRangeTxt = sandwich.adjLeaveStart === sandwich.adjLeaveEnd
                    ? self.swFormatDisplayDate(sandwich.adjLeaveStart)
                    : self.swFormatDisplayDate(sandwich.adjLeaveStart) + ' to ' +
                    self.swFormatDisplayDate(sandwich.adjLeaveEnd);

                adjacentCfg = {
                    day: sandwich.adjDay,
                    period: adjRangeTxt,
                    status: sandwich.isPending ? '\u23f3 Pending Approval' : '\u2705 Approved',
                    isPending: sandwich.isPending,
                    type: sandwich.adjLeaveType
                };

                if (sandwich.isPending) {
                    var ownerWord = isSelf ? 'Your' : (displayName + '\'s');
                    pendingWarning = ownerWord + ' <strong>' + sandwich.adjDay + '</strong> leave (' +
                        adjRangeTxt + ') is currently <strong>Pending</strong>. ' +
                        'The sandwich deduction is being applied now. ' +
                        'If that leave is <strong>approved</strong>, the full deduction (' +
                        totalDays + ' days) stands. ' +
                        'If it is <strong>rejected</strong>, no sandwich rule applies and the ' +
                        'extra days will <strong>not</strong> be counted.';
                }
            }

            var titleStr = sandwich.scenario === 'HLH'
                ? 'Corporate sandwich rule applies: leave is surrounded by holidays'
                : 'Corporate sandwich rule applies to ' + (isSelf ? 'your' : (displayName + '\'s')) + ' leave request';

            var baseCfg = {
                title: titleStr,
                applying: { date: applyingDateLabel, type: leaveTypeVal, duration: leaveDays + ' day(s)' },
                adjacent: adjacentCfg,
                sandwichedLabel: sandwich.sandwichedLabel,
                sandwichedRows: sandwich.sandwichedRows,
                impact: { applied: leaveDays, sandwiched: sandwich.sandwichedDays, total: totalDays },
                pendingWarning: pendingWarning,
            };

            if (leaveTypeVal === 'Paid') {
                self.fetchLeaveBalance(userId).then(function (rawBalance) {
                    // ── Apply previous-month rule CONSISTENTLY ──
                    var isPrevMonth = self.swIsPrevMonth(startDate, endDate, today);
                    var effectiveBalance = isPrevMonth ? rawBalance - 1 : rawBalance;

                    var prevMonthNote = isPrevMonth
                        ? ' <span style="color:#92400e;font-size:11.5px;">(previous month: balance&minus;1 applied)</span>'
                        : '';

                    var canApplyPaid = effectiveBalance >= 3 && effectiveBalance >= totalDays;

                    if (canApplyPaid) {
                        var balanceAfter = (effectiveBalance - totalDays).toFixed(1);
                        var cfg = Object.assign({}, baseCfg, {
                            impact: Object.assign({}, baseCfg.impact, {
                                balance: effectiveBalance,
                                balanceAfter: balanceAfter
                            }),
                            bottomSection:
                                '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;' +
                                'padding:11px 14px;margin-bottom:14px;font-size:13px;color:#1e40af;font-weight:600;">' +
                                '\ud83d\udcb3 Paid Balance After Deduction: ' + balanceAfter + ' day(s)' +
                                prevMonthNote + '</div>',
                            yesLabel: 'Yes, proceed with Paid leave',
                            yesColor: '#2563eb'
                        });
                        self.swShowDialog(self.swBuildHtml(cfg), function () {
                            processLeaveWithBalance(totalDays);
                        });
                    } else {
                        // Cannot apply as Paid → offer Unpaid
                        var reasonHtml = effectiveBalance < 3
                            ? (isSelf ? 'Your' : 'Employee\'s') + ' paid balance (<strong>' +
                            effectiveBalance + ' day(s)</strong>) is below the minimum of ' +
                            '<strong>3 days</strong> required under the sandwich rule.' +
                            (isPrevMonth ? ' <em>(previous month: 1 day reserved)</em>' : '')
                            : (isSelf ? 'Your' : 'Employee\'s') + ' paid balance (<strong>' +
                            effectiveBalance + ' day(s)</strong>) is insufficient for the ' +
                            'total deduction of <strong>' + totalDays + ' days</strong> (applied ' +
                            leaveDays + ' + ' + sandwich.sandwichedDays + ' sandwiched).' +
                            (isPrevMonth ? ' <em>(previous month: 1 day reserved)</em>' : '');

                        var cfg = Object.assign({}, baseCfg, {
                            impact: Object.assign({}, baseCfg.impact, { balance: effectiveBalance }),
                            bottomSection:
                                '<div style="background:#fff1f2;border:1px solid #fecaca;border-radius:8px;' +
                                'padding:11px 14px;margin-bottom:10px;font-size:13px;">' +
                                '<div style="font-weight:700;color:#991b1b;margin-bottom:4px;">\u274c Cannot Apply as Paid Leave</div>' +
                                '<div style="color:#7f1d1d;line-height:1.5;">' + reasonHtml + '</div></div>' +
                                '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;' +
                                'padding:11px 14px;margin-bottom:14px;font-size:13px;">' +
                                '<div style="font-weight:700;color:#166534;margin-bottom:4px;">\u2705 ' +
                                (isSelf ? 'You Can' : 'Can') + ' Apply as Unpaid Leave</div>' +
                                '<div style="color:#14532d;line-height:1.6;">\u2022 No paid balance will be checked or deducted<br>' +
                                '\u2022 ' + leaveDays + ' day(s) recorded as unpaid<br>' +
                                '\u2022 Sandwiched days are <strong>not</strong> extra-counted for unpaid leaves</div></div>',
                            yesLabel: 'Apply as Unpaid Leave',
                            yesColor: '#16a34a'
                        });
                        self.swShowDialog(self.swBuildHtml(cfg), function () {
                            createLeave(leaveDays, 'Unpaid');
                        });
                    }
                });
            } else {
                // Unpaid sandwich: days still counted
                var cfg = Object.assign({}, baseCfg, {
                    bottomSection:
                        '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;' +
                        'padding:11px 14px;margin-bottom:14px;font-size:13px;color:#1e40af;">' +
                        '<strong>\u2139\ufe0f Unpaid Leave \u2014 Sandwich Rule Applies</strong><br>' +
                        '<div style="margin-top:5px;line-height:1.6;">\u2022 No paid balance will be deducted<br>' +
                        '\u2022 ' + totalDays + ' day(s) recorded as unpaid (including ' +
                        sandwich.sandwichedDays + ' sandwiched day(s))</div></div>',
                    yesLabel: 'Yes, I want to proceed',
                    yesColor: '#2563eb'
                });
                self.swShowDialog(self.swBuildHtml(cfg), function () {
                    createLeave(totalDays);
                });
            }
        },

        // =====================================================================
        // actionCreditLeave
        // =====================================================================
        actionCreditLeave: function () {
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
                </form>`;
            var modalData = self.simpleModal('Credit Leave', htmlContent);
            var closeModal = modalData.closeModal;
            setTimeout(function () {
                var employeeSelect = document.getElementById('employee');
                if (employeeSelect) {
                    employeeSelect.innerHTML = '<option value="">-- Select Employee --</option>';
                    (self.employeeList || []).forEach(function (emp) {
                        if (emp.isIntern === true) return;
                        var opt = document.createElement('option');
                        opt.value = emp.id;
                        opt.textContent = emp.name;
                        employeeSelect.appendChild(opt);
                    });
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
                        Espo.Ajax.putRequest('CLeaveBalance/' + record.id, {
                            balance: (parseFloat(record.balance) || 0) + leaveAmount,
                            reason: leaveReason
                        }).then(function () {
                            Espo.ui.success('Leave balance updated successfully!');
                            closeModal();
                        }, function () { Espo.ui.warning('Failed to update leave balance.'); });
                    } else {
                        Espo.Ajax.postRequest('CLeaveBalance', {
                            name: $('#employee option:selected').text() + ' Leave Balance',
                            userId: employeeId, balance: leaveAmount, reason: leaveReason, assignedUserId: employeeId
                        }).then(function () {
                            Espo.ui.success('Leave balance record created successfully!');
                            closeModal();
                        }, function () { Espo.ui.notify('Failed to create leave balance.'); });
                    }
                }, function () { Espo.ui.warning('Failed to fetch leave balance.'); });
            });
        },

        // =====================================================================
        // actionDebitLeave
        // =====================================================================
        actionDebitLeave: function () {
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
                </form>`;
            var modalData = self.simpleModal('Debit Leave', htmlContent);
            var closeModal = modalData.closeModal;
            setTimeout(function () {
                var employeeSelect = document.getElementById('employee');
                if (employeeSelect) {
                    employeeSelect.innerHTML = '<option value="">-- Select Employee --</option>';
                    (self.employeeList || []).forEach(function (emp) {
                        if (emp.isIntern === true) return;
                        var opt = document.createElement('option');
                        opt.value = emp.id;
                        opt.textContent = emp.name;
                        employeeSelect.appendChild(opt);
                    });
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
                        Espo.Ajax.putRequest('CLeaveBalance/' + record.id, {
                            balance: (parseFloat(record.balance) || 0) - leaveAmount,
                            reason: leaveReason
                        }).then(function () {
                            Espo.ui.success('Leave balance debited successfully!');
                            closeModal();
                        }, function () { Espo.ui.warning('Failed to update leave balance.'); });
                    } else {
                        Espo.ui.warning('No leave balance record found for this employee.');
                    }
                }, function () { Espo.ui.warning('Failed to fetch leave balance.'); });
            });
        },

        // =====================================================================
        // actionApplyForLeave  (login user applies for their own leave)
        // =====================================================================
        actionApplyForLeave: function () {
            var self = this;
            var today = new Date();

            function formatDate(d) {
                return d.getFullYear() + '-' +
                    String(d.getMonth() + 1).padStart(2, '0') + '-' +
                    String(d.getDate()).padStart(2, '0');
            }

            var minDate = formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
            var isIntern = !!this.getUser().get('cIsIntern');

            var leaveTypeOptions = isIntern
                ? '<option value="Unpaid">Unpaid</option>'
                : '<option value="Paid">Paid</option><option value="Unpaid">Unpaid</option>';

            var htmlContent = `
            <div class="form-box" style="padding:20px;">
                <div class="form-row mb-3">
                    <label class="form-label">Leave Type <span class="text-danger">*</span></label>
                    <select id="leaveType" class="form-select" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
                        ${leaveTypeOptions}
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
            </div>`;

            var modalObj = this.simpleModal('Apply Leave', htmlContent);

            setTimeout(function () {
                var modal = document.getElementById(modalObj.modalId);
                var leaveType = modal.querySelector('#leaveType');
                var singleDate = modal.querySelector('#singleDate');
                var fromDate = modal.querySelector('#fromDate');
                var toDate = modal.querySelector('#toDate');
                var reason = modal.querySelector('#reason');
                var singleRadio = modal.querySelector('#single');
                var multipleRadio = modal.querySelector('#multiple');
                var singleDateRow = modal.querySelector('#singleDateRow');
                var multipleDateRow = modal.querySelector('#multipleDateRow');
                var firstHalfOpt = modal.querySelector('#firstHalfOpt');
                var secondHalfOpt = modal.querySelector('#secondHalfOpt');

                function markInvalid(el) {
                    if (!el) return;
                    el.classList.add('is-invalid', 'shake');
                    if (navigator.vibrate) navigator.vibrate(150);
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(function () { el.classList.remove('shake'); }, 400);
                }
                function clearInvalid(el) { if (el) el.classList.remove('is-invalid'); }

                [leaveType, singleDate, fromDate, toDate, reason].forEach(function (el) {
                    if (!el) return;
                    el.addEventListener('input', function () { clearInvalid(el); });
                    el.addEventListener('change', function () { clearInvalid(el); });
                    el.addEventListener('focus', function () { clearInvalid(el); });
                });

                function toggleDateFields() {
                    if (singleRadio.checked) {
                        singleDateRow.style.display = 'block';
                        multipleDateRow.style.display = 'none';
                        firstHalfOpt.style.display = '';
                        secondHalfOpt.style.display = '';
                    } else {
                        singleDateRow.style.display = 'none';
                        multipleDateRow.style.display = 'flex';
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
                        if (new Date(fromDate.value) > new Date(toDate.value)) {
                            toDate.focus(); markInvalid(toDate); return false;
                        }
                    }
                    if (!reason.value.trim()) { reason.focus(); markInvalid(reason); return false; }
                    return true;
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
                    // normalize regardless of how they were entered
                    var normalized = self.swNormalizeDates(startDate, endDate);
                    startDate = normalized.startDate;
                    endDate = normalized.endDate;
                    var userId = self.getUser().get('id');

                    // lets swHandleResult grow startDate/endDate to cover a sandwiched gap
                    function setDates(sd, ed) { startDate = sd; endDate = ed; }

                    function calcDays(sd, ed, dm) {
                        var isHalf = (dm === 'First Half' || dm === 'Second Half');
                        var diff = (new Date(ed) - new Date(sd)) / 86400000 + 1;
                        return isHalf ? diff * 0.5 : diff;
                    }
                    var leaveDays = calcDays(startDate, endDate, duration);

                    // ── createLeave: POST the leave record ──────────────────
                    function createLeave(effectiveDays, overrideType) {
                        var finalType = overrideType || leaveTypeVal;
                        Espo.Ajax.postRequest('CLeaveRequest', {
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
                        }).then(function () {
                            Espo.Ui.success('Leave Applied Successfully' + (overrideType ? ' as ' + overrideType : ''));
                            modal.remove();
                            self.loadLeaveRequests();
                        });
                    }

                    // ── processLeaveWithBalance: balance check + deduct + create ──
                    // Uses swEffectiveBalance for the previous-month rule so the
                    // same logic applies whether we arrive from normal or sandwich path.
                    function processLeaveWithBalance(effectiveDays, overrideType) {
                        var finalType = overrideType || leaveTypeVal;
                        if (finalType === 'Paid') {
                            self.fetchLeaveBalance(userId).then(function (rawBalance) {
                                var isPrevMonth = self.swIsPrevMonth(startDate, endDate, today);
                                var effectiveBalance = isPrevMonth ? rawBalance - 1 : rawBalance;
                                var prevMonthSuffix = isPrevMonth ? ' for previous month.' : '.';

                                if (effectiveDays > effectiveBalance) {
                                    Espo.Ui.error(
                                        'Insufficient paid leave balance. You need ' + effectiveDays +
                                        ' day(s) but have ' + effectiveBalance + ' day(s) available' +
                                        prevMonthSuffix,
                                        5000
                                    );
                                    return;
                                }
                                Espo.Ajax.getRequest('CLeaveBalance', {
                                    where: [{ type: 'equals', attribute: 'userId', value: userId }]
                                }).then(function (res) {
                                    var record = res.list[0];
                                    var deductFrom = isPrevMonth
                                        ? parseFloat(record.balance) - 1
                                        : parseFloat(record.balance);
                                    Espo.Ajax.putRequest('CLeaveBalance/' + record.id, {
                                        balance: deductFrom - effectiveDays
                                    }).then(function () { createLeave(effectiveDays, overrideType); });
                                });
                            });
                        } else {
                            createLeave(leaveDays, overrideType);
                        }
                    }

                    // ── Sandwich check → shared handler ─────────────────────
                    self.swCheckSandwich(startDate, endDate, duration, userId).then(function (sandwich) {
                        self.swHandleResult({
                            self: self,
                            sandwich: sandwich,
                            leaveDays: leaveDays,
                            leaveTypeVal: leaveTypeVal,
                            startDate: startDate,
                            endDate: endDate,
                            duration: duration,
                            userId: userId,
                            displayName: self.getUser().get('name'),
                            isSelf: true,
                            today: today,
                            processLeaveWithBalance: processLeaveWithBalance,
                            createLeave: createLeave,
                            setDates: setDates,   // NEW
                        });
                    });
                });
            }, 50);
        },

        // =====================================================================
        // actionApplyForEmployeeLeave  (admin / manager applying for someone)
        // =====================================================================
        actionApplyForEmployeeLeave: function () {
            var self = this;
            this.loadEmployeeList();

            var today = new Date();

            function formatDate(d) {
                return d.getFullYear() + '-' +
                    String(d.getMonth() + 1).padStart(2, '0') + '-' +
                    String(d.getDate()).padStart(2, '0');
            }

            var minDate = formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));

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
            </div>`;

            var modalObj = this.simpleModal('Apply Leave for Employee', htmlContent);

            setTimeout(function () {
                var modal = document.getElementById(modalObj.modalId);
                var employeeSelect = modal.querySelector('#employeeSelect');
                var leaveType = modal.querySelector('#leaveType');
                var singleDate = modal.querySelector('#singleDate');
                var fromDate = modal.querySelector('#fromDate');
                var toDate = modal.querySelector('#toDate');
                var reason = modal.querySelector('#reason');
                var singleRadio = modal.querySelector('#single');
                var multipleRadio = modal.querySelector('#multiple');
                var singleDateRow = modal.querySelector('#singleDateRow');
                var multipleDateRow = modal.querySelector('#multipleDateRow');
                var firstHalfOpt = modal.querySelector('#firstHalfOpt');
                var secondHalfOpt = modal.querySelector('#secondHalfOpt');

                function markInvalid(el) {
                    if (!el) return;
                    el.classList.add('is-invalid', 'shake');
                    if (navigator.vibrate) navigator.vibrate(150);
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(function () { el.classList.remove('shake'); }, 400);
                }
                function clearInvalid(el) { if (el) el.classList.remove('is-invalid'); }

                [employeeSelect, leaveType, singleDate, fromDate, toDate, reason].forEach(function (el) {
                    if (!el) return;
                    el.addEventListener('input', function () { clearInvalid(el); });
                    el.addEventListener('change', function () { clearInvalid(el); });
                    el.addEventListener('focus', function () { clearInvalid(el); });
                });

                function toggleDateFields() {
                    if (singleRadio.checked) {
                        singleDateRow.style.display = 'block';
                        multipleDateRow.style.display = 'none';
                        firstHalfOpt.style.display = '';
                        secondHalfOpt.style.display = '';
                    } else {
                        singleDateRow.style.display = 'none';
                        multipleDateRow.style.display = 'flex';
                        firstHalfOpt.style.display = 'none';
                        secondHalfOpt.style.display = 'none';
                        modal.querySelector('input[name="duration"][value="Full"]').checked = true;
                    }
                }
                singleRadio.addEventListener('change', toggleDateFields);
                multipleRadio.addEventListener('change', toggleDateFields);

                // Populate employee dropdown
                var interval = setInterval(function () {
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
                        if (new Date(fromDate.value) > new Date(toDate.value)) {
                            markInvalid(toDate); toDate.focus(); return false;
                        }
                    }
                    if (!reason.value.trim()) { reason.focus(); markInvalid(reason); return false; }
                    return true;
                }

                modal.querySelector('#submitLeaveBtn').addEventListener('click', function (e) {
                    e.preventDefault();
                    if (!validateForm()) return;

                    var employeeId = employeeSelect.value;
                    var employeeName = employeeSelect.options[employeeSelect.selectedIndex]
                        ? employeeSelect.options[employeeSelect.selectedIndex].text : '';
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

                    var normalized = self.swNormalizeDates(startDate, endDate);
                    startDate = normalized.startDate;
                    endDate = normalized.endDate;

                    function setDates(sd, ed) { startDate = sd; endDate = ed; }

                    function calcDays(sd, ed, dm) {
                        var isHalf = (dm === 'First Half' || dm === 'Second Half');
                        var diff = (new Date(ed) - new Date(sd)) / 86400000 + 1;
                        return isHalf ? diff * 0.5 : diff;
                    }
                    var leaveDays = calcDays(startDate, endDate, duration);

                    // ── createLeave ──────────────────────────────────────────
                    function createLeave(effectiveDays, overrideType) {
                        var finalType = overrideType || leaveTypeVal;
                        Espo.Ajax.postRequest('CLeaveRequest', {
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
                        }).then(function () {
                            Espo.Ui.success('Leave Applied for ' + employeeName + (overrideType ? ' as ' + overrideType : ''));
                            modal.remove();
                            self.loadLeaveRequests();
                        });
                    }

                    // ── processLeaveWithBalance ──────────────────────────────
                    // Uses swIsPrevMonth / swEffectiveBalance consistently.
                    function processLeaveWithBalance(effectiveDays, overrideType) {
                        var finalType = overrideType || leaveTypeVal;
                        if (finalType === 'Paid') {
                            self.fetchLeaveBalance(employeeId).then(function (rawBalance) {
                                var isPrevMonth = self.swIsPrevMonth(startDate, endDate, today);
                                var effectiveBalance = isPrevMonth ? rawBalance - 1 : rawBalance;
                                var prevMonthSuffix = isPrevMonth ? ' for previous month.' : '.';

                                if (effectiveDays > effectiveBalance) {
                                    Espo.Ui.error(
                                        'Insufficient paid leave balance. Employee needs ' + effectiveDays +
                                        ' day(s) but has ' + effectiveBalance + ' day(s) available' +
                                        prevMonthSuffix,
                                        5000
                                    );
                                    return;
                                }
                                Espo.Ajax.getRequest('CLeaveBalance', {
                                    where: [{ type: 'equals', attribute: 'userId', value: employeeId }] // or employeeId
                                }).then(function (res) {
                                    var record = res.list[0];
                                    Espo.Ajax.putRequest('CLeaveBalance/' + record.id, {
                                        balance: parseFloat(record.balance) - effectiveDays
                                    }).then(function () { createLeave(effectiveDays, overrideType); });
                                });
                            });
                        } else {
                            createLeave(leaveDays, overrideType);
                        }
                    }

                    // ── Sandwich check → shared handler ─────────────────────
                    self.swCheckSandwich(startDate, endDate, duration, employeeId).then(function (sandwich) {
                        self.swHandleResult({
                            self: self,
                            sandwich: sandwich,
                            leaveDays: leaveDays,
                            leaveTypeVal: leaveTypeVal,
                            startDate: startDate,
                            endDate: endDate,
                            duration: duration,
                            userId: employeeId,
                            displayName: employeeName,
                            isSelf: false,
                            today: today,
                            processLeaveWithBalance: processLeaveWithBalance,
                            createLeave: createLeave,
                            setDates: setDates,   // NEW
                        });
                    });
                });
            }, 100);
        },

        // =====================================================================
        // Approve / Reject / Cancel / Revoke / Delete — unchanged
        // =====================================================================
        actionApproveRequest: function (e) {
            e.preventDefault();
            var self = this;
            var recordId = $(e.currentTarget).data('id');
            if (!recordId) { Espo.Ui.warning('Record ID not found'); return; }
            if (!confirm('Approve this leave?')) return;
            Espo.Ajax.putRequest('CLeaveRequest/' + recordId, { status: 'Approved' }).then(function () {
                Espo.Ui.success('Leave Approved');
                self.loadLeaveRequests();
            });
        },

        actionCancelLeaveRequest: function (e) {
            e.preventDefault();
            var self = this;
            var recordId = $(e.currentTarget).data('id');
            if (!recordId) { Espo.Ui.warning('Record ID not found'); return; }
            if (!confirm('Cancel this leave?')) return;
            Espo.Ajax.getRequest('CLeaveRequest/' + recordId).then(function (leave) {
                if (leave.status === 'Rejected' || leave.status === 'Approved') {
                    Espo.Ui.warning("You can't cancel a leave that is already " + leave.status + '. Please refresh your page.');
                    return;
                }
                Espo.Ajax.putRequest('CLeaveRequest/' + recordId, { status: 'Cancelled' });
                if (leave.leaveType === 'Paid') {
                    var leaveDays = leave.days || 0;
                    Espo.Ajax.getRequest('CLeaveBalance', {
                        where: [{ type: 'equals', attribute: 'userId', value: leave.userId }]
                    }).then(function (res) {
                        var record = res.list[0];
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
            if (!confirm('Reject this leave?')) return;
            Espo.Ajax.getRequest('CLeaveRequest/' + recordId).then(function (leave) {
                Espo.Ajax.putRequest('CLeaveRequest/' + recordId, { status: 'Rejected' });
                if (leave.leaveType === 'Paid') {
                    var leaveDays = leave.days || 0;
                    Espo.Ajax.getRequest('CLeaveBalance', {
                        where: [{ type: 'equals', attribute: 'userId', value: leave.userId }]
                    }).then(function (res) {
                        var record = res.list[0];
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
            var self = this;
            var recordId = $(e.currentTarget).data('id');
            if (!recordId) { Espo.Ui.warning('Record ID not found'); return; }
            if (!confirm('Revoke this leave request?')) return;
            Espo.Ajax.getRequest('CLeaveRequest/' + recordId).then(function (leave) {
                if (!leave) { Espo.Ui.error('Leave not found'); return; }
                if (leave.status === 'Approved') {
                    Espo.Ajax.putRequest('CLeaveRequest/' + recordId, { status: 'Pending' }).then(function () {
                        Espo.Ui.success('Leave moved back to Pending');
                        self.loadLeaveRequests();
                    });
                    return;
                }
                if (leave.status === 'Rejected') {
                    var leaveDays = leave.days || 0;
                    if (!leaveDays || leaveDays <= 0) { Espo.Ui.error('Invalid leave days'); return; }
                    Espo.Ajax.getRequest('CLeaveBalance', {
                        where: [{ type: 'equals', attribute: 'userId', value: leave.userId }]
                    }).then(function (res) {
                        var record = res.list[0];
                        if (!record) { Espo.Ui.error('Leave balance record not found'); return; }
                        var currentBalance = record.balance || 0;
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
                Espo.Ui.error("You can't revoke this record");
            });
        },

        actionDeleteLeaveRequest: function (e) {
            e.preventDefault();
            var self = this;
            var recordId = $(e.currentTarget).data('id');
            if (!recordId) { Espo.Ui.warning('Record ID not found'); return; }
            if (!window.confirm('Are you sure you want to delete this leave request?')) return;
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

        // =====================================================================
        // simpleModal — unchanged
        // =====================================================================
        simpleModal: function (title, htmlContent) {
            var backdropId = 'helloBackdrop-' + Date.now();
            var modalId = 'helloModal-' + Date.now();

            var backdropHtml = '<div id="' + backdropId + '" style="position:fixed;top:0;left:0;' +
                'width:100%;height:100%;background-color:rgba(0,0,0,0.5);z-index:1030;"></div>';

            var modalHtml = `
            <style>
                .is-invalid { border: 1.5px solid #dc3545 !important; box-shadow: 0 0 4px rgba(220,53,69,0.4) !important; }
                @keyframes shake {
                    0%   { transform: translateX(0);   }
                    25%  { transform: translateX(-4px); }
                    50%  { transform: translateX(4px);  }
                    75%  { transform: translateX(-4px); }
                    100% { transform: translateX(0);   }
                }
                .shake { animation: shake 0.3s linear; }
            </style>
            <div id="${modalId}" style="position:fixed;top:0;right:0;bottom:0;z-index:1040;width:100%;max-width:650px;">
                <div style="background:white;height:100%;box-shadow:-3px 0 12px rgba(0,0,0,0.5);overflow-y:auto;width:100%;display:flex;flex-direction:column;">
                    <div style="padding:20px;border-bottom:1px solid #e9ecef;display:flex;justify-content:space-between;align-items:center;">
                        <h5 style="margin:0;color:#333;font-weight:500;">${title}</h5>
                        <button class="modalCloseBtn" style="background:none;border:none;font-size:24px;cursor:pointer;padding:0;color:#333;">×</button>
                    </div>
                    ${htmlContent}
                </div>
            </div>`;

            $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').remove();
            $(backdropHtml).appendTo('body');
            var $modal = $(modalHtml).appendTo('body');

            var scrollY = window.scrollY;
            $('body').css({ position: 'fixed', top: '-' + scrollY + 'px', width: '100%' });

            function closeModal() {
                $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').fadeOut(200, function () { $(this).remove(); });
                var scrollTop = parseInt($('body').css('top')) * -1;
                $('body').css({ position: '', top: '', width: '' });
                window.scrollTo(0, scrollTop);
            }

            $modal.find('.modalCloseBtn').one('click', function (e) {
                e.preventDefault(); e.stopPropagation(); closeModal();
            });
            $('#' + backdropId).one('click', function (e) {
                if (e.target.id === backdropId) closeModal();
            });
            $modal.on('click', function (e) { e.stopPropagation(); });

            return { modalId: modalId, closeModal: closeModal };
        },

    });
});