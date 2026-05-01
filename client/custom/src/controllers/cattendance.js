Espo.define('custom:controllers/cattendance', 'controllers/record', function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);
            console.log('✓ CAttendance controller loaded');
        }

    });

});
