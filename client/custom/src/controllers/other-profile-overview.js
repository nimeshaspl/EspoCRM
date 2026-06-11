Espo.define('custom:controllers/other-profile-overview', 'controller', function (Dep) {
    return Dep.extend({
        defaultAction: 'view',
 
        actionView: function () {
            this.main('custom:views/other-profile-overview/view', {
                displayTitle: true
            }, function (view) {
                view.render();
            });
        }
    });
});
