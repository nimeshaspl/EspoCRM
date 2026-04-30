Espo.define('custom:controllers/my-desk', 'controller', function (Dep) {
    return Dep.extend({
        defaultAction: 'view',
 
        actionView: function () {
            this.main('custom:views/my-desk/view', {
                displayTitle: true
            }, function (view) {
                view.render();
            });
        }
    });
});
