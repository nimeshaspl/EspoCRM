define('custom:views/c-package/list', ['views/list'], function (Dep) {

    return Dep.extend({

        template: 'custom:c-package/list',

        events: {
            'click .date-tab-btn': 'actionSelectPackage',
            'change #employee-filter': 'actionEmployeeFilter'
        },

        setup: function () {
            Dep.prototype.setup.call(this);
            Handlebars.registerHelper('ifCond', function (v1, v2, options) {
                if (v1 == v2) {
                    return options.fn(this);
                }
                return options.inverse(this);
            });

            this.employee = null;
            this.package = null;

            // 🔥 IMPORTANT CHANGE
            this.payPackages = [];
            this.payPackageData = null;   // single record storage

            this.selectedPackage = null;
            this.assignedCTC = 0;

            this.isAdmin = this.getUser().isAdmin();
            this.employeeList = [];
            this.selectedEmployee = '';

            this.filterByLoggedEmployee();
            this.loadEmployeeData();

            console.log('Custom Package List View Initialized');

            if (this.getUser().isAdmin()) {
                this.loadEmployees();
            }

            this.listenTo(this.collection, 'sync', function () {
                this.prepareDefaultPackage();
            });
        },
        loadEmployees: function () {

            var self = this;

            Espo.Ajax.getRequest('CEmployee', {
                maxSize: 200,
                orderBy: 'name',
                order: 'asc'
            }).then(function (response) {
                console.log('Employee API Response:', response);
                console.log('Employee List Loaded:', response.list);

                self.employeeList = response.list || [];
                self.reRender();
            });
        },
        filterBySelectedEmployee: function () {

            if (!this.selectedEmployee) {
                this.collection.where = [];
            } else {

                this.collection.where = [
                    {
                        type: 'equals',
                        attribute: 'employeeId',
                        value: this.selectedEmployee
                    }
                ];
            }

            this.collection.fetch();
        },
        actionEmployeeFilter: function (e) {

            this.selectedEmployee = e.currentTarget.value;

            this.filterBySelectedEmployee();
        },
        /* ===============================
           FILTER COLLECTION (UNCHANGED)
        =============================== */

        filterByLoggedEmployee: function () {

            let userId = this.getUser().id;
            let self = this;

            Espo.Ajax.getRequest('CEmployee', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'userId',
                        value: userId
                    }
                ]
            }).then(function (response) {

                if (!response.list.length) return;

                let employeeId = response.list[0].id;

                self.collection.where = [
                    {
                        type: 'equals',
                        attribute: 'employeeId',
                        value: employeeId
                    }
                ];

                self.collection.fetch();
            });
        },

        /* ===============================
           AUTO SELECT LATEST PACKAGE
        =============================== */

        prepareDefaultPackage: function () {

            let models = this.collection.models;
            if (!models.length) return;

            models.sort(function (a, b) {
                return new Date(b.get('effectiveFrom')) - new Date(a.get('effectiveFrom'));
            });

            // ✅ Select latest automatically
            this.selectPackage(models[0].id);
        },

        actionSelectPackage: function (e) {
            let id = $(e.currentTarget).data('id');
            this.selectPackage(id);
        },

        /* ===============================
           SELECT PACKAGE (FIXED)
        =============================== */

        selectPackage: function (packageId) {

            let self = this;
            let model = this.collection.get(packageId);
            if (!model) return;

            this.selectedPackage = model;

            // 🔥 Reset old data before loading new
            this.payPackageData = null;
            this.assignedCTC = 0;

            // ✅ Relationship: payPackage
            Espo.Ajax.getRequest('CPackage/' + packageId + '/payPackage')
                .then(function (response) {

                    console.log('PayPackage response:', response);

                    if (response.list && response.list.length) {
                        // 🔥 Only ONE record per package
                        self.payPackageData = response.list[0];
                    } else {
                        self.payPackageData = null;
                    }

                    self.calculateCTC();
                    self.reRender();
                });
        },

        /* ===============================
           UPDATED CTC CALCULATION
        =============================== */

        calculateCTC: function () {

            if (!this.payPackageData) {
                this.assignedCTC = 0;
                this.monthlyData = {};
                return;
            }

            let p = this.payPackageData;

            let basic = parseFloat(p.basicPay) || 0;
            let conveyance = parseFloat(p.conveyanceAllowance) || 0;
            let hra = parseFloat(p.hRAGross) || 0;
            let medical = parseFloat(p.medical) || 0;
            let special = parseFloat(p.specialAllowance) || 0;
            let balance = parseFloat(p.balancingFigure) || 0;
            let pt = parseFloat(p.pTGross) || 0;

            // ✅ Annual CTC
            this.assignedCTC =
                (basic + conveyance + hra + medical + special + balance) - pt;

            // ✅ Monthly Calculation
            this.monthlyData = {
                basicPay: Math.round(basic / 12),
                conveyanceAllowance: Math.round(conveyance / 12),
                hRAGross: Math.round(hra / 12),
                medical: Math.round(medical / 12),
                specialAllowance: Math.round(special / 12),
                balancingFigure: Math.round(balance / 12),
                pTGross: Math.round(pt / 12)
            };
            console.log('Monthly Data Calculated:', this.monthlyData);
        },

        /* ===============================
           ORIGINAL LOGIC (UNCHANGED)
        =============================== */

        loadEmployeeData: function () {

            let userId = this.getUser().id;
            let self = this;

            Espo.Ajax.getRequest('CEmployee', {
                where: [{
                    type: 'equals',
                    attribute: 'userId',
                    value: userId
                }]
            }).then(function (response) {

                if (!response.list.length) return;

                self.employee = response.list[0];

                if (!self.employee.packageId) return;

                return Espo.Ajax.getRequest('CPackage/' + self.employee.packageId);

            }).then(function (packageData) {

                if (!packageData) return;

                self.package = packageData;

                return Espo.Ajax.getRequest('CPayPackage', {
                    where: [{
                        type: 'equals',
                        attribute: 'cPackageId',
                        value: self.package.id
                    }]
                });

            }).then(function (payPackageResponse) {

                if (!payPackageResponse) return;

                if (payPackageResponse.list.length) {
                    self.payPackageData = payPackageResponse.list[0];
                }

                self.calculateCTC();
                self.reRender();
            });
        },

        /* ===============================
           PASS DATA TO TEMPLATE
        =============================== */

        formatDateParts: function (dateStr) {

            if (!dateStr) return { day: '', monthYear: '' };

            let d = new Date(dateStr);

            let day = d.getDate();
            let month = d.toLocaleString('default', { month: 'long' });
            let year = d.getFullYear();

            return {
                day: day,
                monthYear: month + ' ' + year
            };
        },

        data: function () {
            let formattedModels = [];

            if (this.collection && this.collection.models) {

                let self = this;

                formattedModels = this.collection.models.map(function (model) {

                    let parts = self.formatDateParts(model.get('effectiveFrom'));

                    return {
                        id: model.id,
                        day: parts.day,
                        monthYear: parts.monthYear
                    };
                });
            }
            return {
                employee: this.employee,
                package: this.package,
                payPackages: this.payPackages, // kept for compatibility
                payPackageData: this.payPackageData, // 🔥 new
                selectedPackage: this.selectedPackage,
                monthlyData: this.monthlyData,
                assignedCTC: this.assignedCTC,
                formattedModels: formattedModels,

                isAdmin: this.isAdmin,
                employees: this.employeeList,
                selectedEmployee: this.selectedEmployee
            };
        }

    });

});