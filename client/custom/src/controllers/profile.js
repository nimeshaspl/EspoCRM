Espo.define('custom:controllers/profile', 'controller', function (Dep) {
    return Dep.extend({
        defaultAction: 'view',
 
        actionView: function () {
            this.main('custom:views/profile/view', {
                displayTitle: true
            }, function (view) {
                view.render();
            });
        }
    });
});
