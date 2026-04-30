Espo.define('custom:controllers/attendance-page', 'controller', function (Dep) {
    return Dep.extend({
        defaultAction: 'view',
 
        actionView: function () {
            this.main('custom:views/attendance-page/view', {
                displayTitle: true
            }, function (view) {
                view.render();
            });
        }
    });
});
