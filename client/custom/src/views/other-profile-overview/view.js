define('custom:views/other-profile-overview/view', ['view'], function (Dep) {

    return Dep.extend({

        template: 'custom:other-profile-overview/view',

            setup: function () {
                var self = this;
                console.log("Model data:"); // Log model data for debugging
            },
            data : function () {
                return {
                   
                    title: "Other Profile Overview",
                };
            }
    });
});
