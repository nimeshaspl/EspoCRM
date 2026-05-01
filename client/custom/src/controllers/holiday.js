Espo.define('custom:controllers/holiday', 'controller', function (Dep) {
    return Dep.extend({
        defaultAction: 'view',
 
        actionView: function () {
            this.main('custom:views/holiday/view', {
                displayTitle: true
            }, function (view) {
                view.render();
            });
        }
    });
});
