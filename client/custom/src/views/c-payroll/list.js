
define('custom:views/c-payroll/list', ['views/list'], function (Dep) {

    return Dep.extend({

        template: 'custom:/c-payroll/list',

        events: {
            'change #payrollType': 'handlePayrollType',
            'click .close--payroll--btn': 'actionClosePayroll',
            'click .run--payroll--btn': 'actionRunPayroll',
            'click .generate--payroll--data--btn': 'actionGeneratePayrollData',
            'click .take-action-btn': 'handleTakeAction',
            'click .view--salary--sheet--btn': 'actionViewSalarySheet',
            'click .bank--sheet--btn': 'actionViewBankSheet',
            'click .delete--payslip--btn': 'actionDeletePayslip',
            'click .delete--payroll--data--btn': 'actionDeletePayrollData',
            'click .generate--payslip--btn': 'actionGeneratePayslip',
            'click .close--payroll--container--btn': 'actionClosePayrollContainer',
            'click .refresh--btn': 'refreshPayrollData'
        },
        setup: function () {
            Dep.prototype.setup.call(this);
            console.log('Custom Payroll List View Initialized');
            this.employeeCount = 0;
            console.log('Initial Employee Count:', this.employeeCount);
            this.latestPayroll = 0;
            this.salarySheetData = [];
            this.loadSalarySheet();
            Espo.Ajax.getRequest('CPayroll/action/latestPayroll').then((response) => {
                console.log('Latest Payroll Data:', response);
                if (response) {
                    this.latestPayroll = response;   // or any field you want
                } else {
                    this.latestPayroll = 0;
                }

                this.reRender();
            });


        },
        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            var self = this;

            Espo.Ajax.getRequest('CEmployee', {
                maxSize: 0
            }).then(function (response) {
                self.employeeCount = response.total;
                self.$el.find('#employee-count').text(self.employeeCount);
                console.log('Updated Employee Count:', self.employeeCount);
            });

            // Safe delegated event
            $('body')
                .off('click', '.take-action-btn')
                .on('click', '.take-action-btn', function () {
                    self.handleTakeAction();
                });
        },
        loadSalarySheet: function () {

            const today = new Date();
            let month = today.getMonth();
            let year = today.getFullYear();

            if (month === 0) {
                month = 12;
                year--;
            }

            Espo.Ajax.postRequest('CPayslip/action/getPreviousMonthPayslips', {
                month: month,
                year: year
            }).then((response) => {

                console.log('Salary Sheet Data:', response);

                this.salarySheetData = response || [];

                this.reRender();

            });

        },
        refreshPayrollData: function () {
            console.log('Refresh button clicked');
            // location.reload();
            this.reRender();
        },
        handlePayrollType: function (e) {
            console.log('Payroll type changed:', e.currentTarget.value);
            const type = e.currentTarget.value;

            if (type === 'specific') {
                this.$el.find('#employeeInput').show();
            } else {
                this.$el.find('#employeeInput').hide();
            }
        },
        actionClosePayroll: function () {
            console.log('Close Payroll button clicked');
            Espo.Ajax.postRequest('CPayroll/action/closePayroll')
                .then(function () {
                    Espo.Ui.success('Payroll closed successfully');
                });

        },
        actionRunPayroll: function () {
            console.log('Run Payroll button clicked');

            // Hide first container
            this.$el.find('.payroll--container').addClass('hidden');

            // Show second container
            this.$el.find('.run--payroll--container').removeClass('hidden');

            Espo.Ajax.postRequest('CPayroll/action/runPayroll')
                .then(function (response) {

                    if (response.success) {
                        Espo.Ui.success('Payroll started');
                    } else {
                        Espo.Ui.warning(response.message);
                    }

                });
        },
        actionClosePayrollContainer: function () {

            console.log('Close Payroll container button clicked');

            // Hide run payroll container
            this.$el.find('.run--payroll--container').addClass('hidden');

            // Show original container
            this.$el.find('.payroll--container').removeClass('hidden');

            // Espo.Ajax.postRequest('CPayroll/action/closePayroll')
            //     .then(function (response) {

            //         if (response.success) {
            //             Espo.Ui.success('Payroll closed successfully');
            //         } else {
            //             Espo.Ui.warning(response.message);
            //         }

            //     });
        },
        handleTakeAction: function () {
            console.log('Take Action button clicked');
            title = 'Confirmation';
            htmlContent = `<div style="padding: 20px; color: #333; line-height: 1.6;">
                            <input type="checkbox" id="confirm" name="confirm" value="true" required style="margin-right: 10px;">
                            <label for="confirm">I confirm that I run the payroll</label>
                        </div>
                        <div style="padding: 15px 20px; border-top: 1px solid #e9ecef; text-align: right;">
                            <button class="confirmPayrollBtn" style="background-color: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 3px; cursor: pointer; font-size: 14px;">OK</button>
                        </div>`;

            this.simpleModal(title, htmlContent);
            var self = this;

            $(document).on('click', '.confirmPayrollBtn', function (e) {

                e.preventDefault();

                var isChecked = $('#confirm').is(':checked');

                if (!isChecked) {
                    Espo.Ui.error("You can't close without checked");
                    return;
                }

                Espo.Ui.success("It Confirmed");

                // close modal
                $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').fadeOut(300, function () {
                    $(this).remove();
                });

                // call your function
                self.confirmRunPayroll();
            });
        },
        confirmRunPayroll: function () {

            console.log('Payroll confirmed by admin');

            Espo.Ajax.postRequest('CPayroll/action/confirmRunPayroll')
                .then(function (response) {
                    if (response.success) {
                        Espo.Ui.success(response.message);
                    } else {
                        Espo.Ui.error(response.message);
                    }

                });

        },
        actionGeneratePayrollData: function () {
            console.log('Generate Payroll Data button clicked');
            const payrollType = this.$el.find('#payrollType').val();
            const employeeName = this.$el.find('#employeeName').val();

            Espo.Ajax.postRequest('CPayroll/action/generatePayrollData', {
                payrollType: payrollType,
                employeeName: employeeName
            })
                .then(function (response) {

                    if (!response.success) {
                        Espo.Ui.error(response.message);
                        return;
                    }
                    if (response.issues.length > 0) {
                        this.showPayrollIssuesModal(response.issues);
                    } else {
                        console.log('No payroll issues found');
                        Espo.Ui.success('No payroll issues found');
                        this.handleTakeAction();
                    }

                    console.log(response.issues);
                    setTimeout(function () {
                        Espo.Ui.success('Payroll data generated');
                    }, 1000);
                }.bind(this))

                .catch(function () {
                    Espo.Ui.error('Payroll generation failed');
                });


        },
        showPayrollIssuesModal: function (issues) {

            let rows = '';

            issues.forEach(function (issue) {

                rows += `
        <tr>
            <td>${issue.employee}</td>
            <td>${issue.reason}</td>

        </tr>
        `;
            });

            const html = `
        <div class="modal fade" id="payrollIssueModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">

                    <div class="modal-header">
                        <h4>Payroll Issues</h4>
                    </div>

                    <div class="modal-body">

                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Issue</th>
                                </tr>
                            </thead>

                            <tbody>
                                ${rows}
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary take-action-btn">
                            Take Action
                        </button>
                        <button class="close--payroll--btn btn btn-default" data-dismiss="modal">
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </div>
    `;

            $('body').append(html);
            $('#payrollIssueModal').modal('show');
        },
        actionViewSalarySheet: function () {

            const title = 'Salary Sheet';

            let rows = '';

            this.salarySheetData.forEach(function (item) {

                rows += `
                    <tr>
                        <td>${item.employeeName}</td>
                        <td>${item.departmentName}</td>
                        <td>${item.workRoleName}</td>
                        <td>${item.location}</td>
                        <td>${item.salary}</td>
                    </tr>
                `;
            });

            let htmlContent = `
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Employee Name</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Location</th>
                            <th>Salary</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            `;

            this.simpleModal(title, htmlContent);

        },
        actionViewBankSheet: function () {
            console.log('View Bank Sheet button clicked');
            Espo.Ui.warning('View Bank Sheet functionality is not implemented yet.');
        }
        ,
        actionDeletePayslip: function () {
            console.log('Delete Payslip button clicked');
        },
        actionDeletePayrollData: function () {
            console.log('Delete Payroll Data button clicked');
        },
        actionGeneratePayslip: function () {
            console.log('Generate Payslip button clicked');
            Espo.Ajax.postRequest('CPayroll/action/generatePayslip')
                .then(function (response) {
                    Espo.Ui.success(response.message);
                });
        },
        // Simple Modal
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
        data: function () {
            return {
                latestPayroll: this.latestPayroll,
                salarySheetData: this.salarySheetData
            };

        }


    });

});



