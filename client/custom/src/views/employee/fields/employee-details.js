define('custom:views/employee/fields/employee-details', 'view', function (Dep) {
    return Dep.extend({
        template: 'custom:fields/employee-details',
        
        data: function () {
            return {
                fullName: this.model.get('name'),
                title: this.model.get('title') || 'Employee',
                email: this.model.get('emailAddress'),
                phone: this.model.get('phoneNumber'),
                department: this.model.get('departmentName'),
                status: this.model.get('status') || 'Active'
            };
        }
    });
});
