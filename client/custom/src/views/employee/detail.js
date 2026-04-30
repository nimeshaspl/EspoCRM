define('custom:views/employee/detail', ['views/detail'], function (Dep) {
    return Dep.extend({
        setup: function () {
            Dep.prototype.setup.call(this);
            this.createView('employeeDetails', 'custom:views/employee/fields/employee-details', {
                el: this.options.el + ' .employee-details-container',
                model: this.model,
                mode: 'detail'
            });
        }
    });
});
