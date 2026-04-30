define('custom:views/c-loan/list', ['views/list'], function (Dep) {

    return Dep.extend({

        template: 'custom:c-loan/list', // FIXED
        events: {
            'click [data-action="skipEmi"]': 'skipEmi'
        },

        selectedType: 'Loan for Home',
        selectedYear: null,

        setup: function () {

            Dep.prototype.setup.call(this);

            this.loanData = [];
            this.timelineData = []; // FIXED

            this.isAdmin = this.getUser().isAdmin();

            this.employeeList = [];
            this.selectedEmployee = '';

            // Prevent infinite render loop
            this.isInitialLoad = true;

            if (this.isAdmin) {
                this.loadEmployees();
            }

            this.financialYears = this.getFinancialYears();
            this.selectedYear = this.getCurrentFinancialYear();
        },

        loadEmployees: function () {

            var self = this;

            Espo.Ajax.getRequest('CEmployee', {
                maxSize: 200,
                orderBy: 'name',
                order: 'asc'
            }).then(function (response) {

                console.log('Employee API Response:', response);

                self.employeeList = response.list || [];

                console.log('Employee List Loaded:', self.employeeList);

                self.reRender();
            });
        },

        afterRender: function () {

            Dep.prototype.afterRender.call(this);

            var self = this;

            // Maintain active loan type button
            this.$el.find('.loan-type-btn').removeClass('active');
            this.$el.find('.loan-type-btn[data-type="' + this.selectedType + '"]').addClass('active');

            // Set selected financial year
            this.$el.find('#loan-year').val(this.selectedYear);

            // Set selected employee dropdown
            this.$el.find('#employee-filter').val(this.selectedEmployee);

            // Loan Type Click
            this.$el.find('.loan-type-btn').off('click').on('click', function () {

                self.$el.find('.loan-type-btn').removeClass('active');
                $(this).addClass('active');

                self.selectedType = $(this).data('type');

                console.log('Selected Loan Type:', self.selectedType);

                self.loadLoanData();
            });

            // Financial Year Change
            this.$el.find('#loan-year').off('change').on('change', function () {

                self.selectedYear = $(this).val();

                console.log('Selected Financial Year:', self.selectedYear);

                self.loadLoanData();
            });

            // Employee Filter Change
            this.$el.find('#employee-filter').off('change').on('change', function () {

                self.selectedEmployee = $(this).val();

                console.log('Selected Employee:', self.selectedEmployee);

                self.loadLoanData();
            });

            // Load data only first time
            if (this.isInitialLoad) {

                this.isInitialLoad = false;

                this.loadLoanData();
            }
        },

        // Convert date → Month Year
        formatMonthYear: function (dateStr) {

            if (!dateStr) return '';

            var date = new Date(dateStr);

            return date.toLocaleString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        },

        loadTimeline: function () {

            if (!this.model || !this.model.id) {
                return;
            }

            var loanId = arguments[0];

            Espo.Ajax.getRequest('CTransactionTimeline', {

                where: [
                    {
                        type: 'equals',
                        attribute: 'loanId',
                        value: loanId
                    }
                ],

                sortBy: 'month',
                sortOrder: 'asc',
                maxSize: 100

            }).then(response => {

                this.timelineData = response.list.map(row => {

                    return {

                        id: row.id,
                        month: row.month,
                        principalPaid: row.principalPaid,
                        interestCharged: row.interestCharged,
                        amount: row.amount,
                        balance: row.balance,
                        status: row.status,

                        isDeducted: row.status === 'Deducted',
                        isSkipped: row.status === 'Skipped'

                    };

                });
                this.reRender();

            });
        },
        createExtraInstallment: function () {

            if (!this.model || !this.model.id) {
                return;
            }

            Espo.Ajax.postRequest('CLoan/action/addExtraInstallment', {

                loanId: this.model.id

            }).then(() => {

                this.loadLoanData();

            });
        },

        loadLoanData: function () {

            var self = this;

            var fromDate = this.selectedYear + '-04-01';
            var toDate = (parseInt(this.selectedYear) + 1) + '-03-31';

            var where = [

                {
                    type: 'equals',
                    attribute: 'type',
                    value: this.selectedType
                },

                {
                    type: 'between',
                    attribute: 'createdAt',
                    value: [fromDate, toDate]
                }

            ];

            // Employee filter
            if (this.selectedEmployee) {

                where.push({

                    type: 'equals',
                    attribute: 'employeeId',
                    value: this.selectedEmployee

                });
            }

            console.log('Loan Where Condition:', where);

            Espo.Ajax.getRequest('CLoan', {

                where: where,
                maxSize: 200,
                orderBy: 'createdAt',
                order: 'desc'

            }).then(function (response) {

                console.log('Loan API Response:', response);

                var loanList = response.list || [];

                if (!loanList.length) {

                    self.loanData = [];
                    self.reRender();
                    return;
                }

                var loans = loanList;
                var promises = [];

                loans.forEach(function (loan) {

                    var promise = Espo.Ajax.getRequest('CTransactionTimeline', {

                        where: [
                            {
                                type: 'equals',
                                attribute: 'loanId',
                                value: loan.id
                            }
                        ],

                        maxSize: 200,
                        orderBy: 'month',
                        order: 'asc'

                    }).then(function (timelineRes) {

                        var timelines = timelineRes.list || [];

                        timelines.forEach(function (timeline) {

                            timeline.monthLabel = self.formatMonthYear(timeline.month);

                        });

                        loan.timelines = timelines;

                    });

                    promises.push(promise);

                });

                Promise.all(promises).then(function () {

                    self.loanData = loans;

                    console.log('Final Loan Data:', self.loanData);

                    if (loans.length) {
                        self.loadTimeline(loans[0].id); // ✅ load EMI schedule
                    }

                    self.reRender();

                });

            });

        },
        generateEmiSchedule: function (loan) {

            let schedule = [];

            let balance = loan.loanAmount;

            let principalPerMonth = loan.loanAmount / loan.numberOfInstallments;

            let interestPerMonth = loan.interest / loan.numberOfInstallments;

            let month = moment(loan.recoveryStartMonth);

            for (let i = 0; i < loan.numberOfInstallments; i++) {

                let principal = principalPerMonth;

                let interest = interestPerMonth;

                let payment = principal + interest;

                balance = balance - principal;

                schedule.push({

                    id: loan.id + '_' + i,

                    month: month.format("MMM YYYY"),

                    principalPaid: principal.toFixed(2),

                    interestCharged: interest.toFixed(2),

                    amount: payment.toFixed(2),

                    balance: balance > 0 ? balance.toFixed(2) : 0,

                    isDeducted: false,

                    isSkipped: false

                });

                month.add(1, 'months');
            }

            return schedule;
        },
        mergeTimelineData: function (schedule, timelines) {

            timelines.forEach(function (t) {

                schedule.forEach(function (row) {

                    if (row.month === t.monthLabel) {

                        if (t.status === "Deducted") {
                            row.isDeducted = true;
                        }

                        if (t.status === "Skipped") {
                            row.isSkipped = true;
                        }

                    }

                });

            });

            return schedule;
        },
        skipEmi: function (e) {

            let id = $(e.currentTarget).data('id');

            if (!confirm("Are you sure you want to skip this EMI?")) {
                return;
            }

            this.ajaxPostRequest('CLoan/action/skipEmi', {
                id: id
            }).then(() => {

                this.notify("EMI skipped");

                this.reRender();

            });

        },

        data: function () {
            return {

                loans: this.loanData || [],

                timelineData: this.timelineData || [],   // ✅ IMPORTANT

                isHomeLoan: this.selectedType === 'Loan for Home',
                isPersonalLoan: this.selectedType === 'Personal Loan',
                isCarLoan: this.selectedType === 'Car Loan',

                financialYears: this.financialYears,
                selectedYear: this.selectedYear,

                isAdmin: this.isAdmin,
                employees: this.employeeList,
                selectedEmployee: this.selectedEmployee

            };
        },

        getCurrentFinancialYear: function () {

            var today = new Date();
            var year = today.getFullYear();
            var month = today.getMonth() + 1;

            if (month >= 4) {
                return year;
            }

            return year - 1;
        },

        getFinancialYears: function () {

            var years = [];
            var currentFY = this.getCurrentFinancialYear();

            for (var i = currentFY - 5; i <= currentFY + 1; i++) {

                years.push({
                    start: i,
                    end: i + 1,
                    label: 'Apr-' + i + ' to Mar-' + (i + 1),
                    value: i,
                    selected: i === currentFY
                });
            }

            return years;
        }

    });

});