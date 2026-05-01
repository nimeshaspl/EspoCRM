Espo.define('custom:controllers/leave', 'controller', function (Dep) {
    return Dep.extend({
        defaultAction: 'view',
 
        actionView: function () {
            this.main('custom:views/leave/view', {
                displayTitle: true
            }, function (view) {
                view.render();
            });
        }
    });
});
