define('custom:views/c-paypackage/list', ['views/list'], function (Dep) {

    return Dep.extend({

        // template: 'custom:/c-paypackage/list',

        setup : function () {
            Dep.prototype.setup.call(this);
            console.log('Custom PayPackage List View Initialized');

        },


    });

});
