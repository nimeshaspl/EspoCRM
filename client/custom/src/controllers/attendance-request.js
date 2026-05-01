Espo.define('custom:controllers/attendance-request', 'controller', function (Dep) {
    return Dep.extend({
        defaultAction: 'view',
 
        actionView: function () {
            this.main('custom:views/attendance-request/view', {
                displayTitle: true
            }, function (view) {
                view.render();
            });
        }
    });
});
