define('custom:views/dashlets/employee-profile', 'view', function (Dep) {
    return Dep.extend({
        template: 'custom:dashlets/employee-profile',
        setup: function () {
            this.userId = this.getUser().get('id');
            this.createView('profile', 'views/user/record/panels/side', {
                el: this.options.el + ' .profile-container',
                model: this.getUser()
            }, function (view) {});
        }
    });
});
