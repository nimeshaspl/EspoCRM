define('custom:views/c-runpayroll/view', ['view'], function (Dep) {

    return Dep.extend({

        template: 'custom:c-runpayroll/view',

            setup: function () {
                var self = this;
                console.log("Model data:"); // Log model data for debugging
            },
            data : function () {
                return {
                    title: "Run Payroll",
                    isAdmin: this.getUser().isAdmin() // Example of using user data in the view
                };
            }
    });
});
