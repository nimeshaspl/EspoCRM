Espo.define('custom:controllers/c-runpayroll', 'controller', function (Dep) {
    return Dep.extend({
        defaultAction: 'view',
 
        actionView: function () {
            this.main('custom:views/c-runpayroll/view', {
                displayTitle: true
            }, function (view) {
                view.render();
            });
        }
    });
});
