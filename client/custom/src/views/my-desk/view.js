define('custom:views/my-desk/view', ['view'], function (Dep) {
    return Dep.extend({
        template: 'custom:my-desk/view',

        data: function () {
            Espo.Ajax.getRequest('User/' + this.getUser().id).then(function (user) {
                console.log(user.gender);   // ✅ This will work
            }); // Debug log to verify user data
            return {
                title: 'My Desk',
                userName: this.getUser().get('name') || ''
            };
        }
    });
});
