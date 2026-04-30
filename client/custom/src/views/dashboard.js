define('custom:views/dashboard', 'views/dashboard', function (Dep) {

    return Dep.extend({

        setupCurrentTabLayout: function (tabLayoutData) {
            // Custom 3-column layout for first row
            this.dashboardTabLayout[0] = [
                {name: 'stream', view: 'views/stream/record/list', isLarge: true, noStretch: true},
                {name: 'activities-tasks', view: 'views/dashboard/record/list-activities', currentTab: this.getCurrentTab(), noStretch: false},
                {name: 'calendar-small', view: 'views/calendar/calendar-small', currentTab: this.getCurrentTab()}
            ];
            Dep.prototype.setupCurrentTabLayout.call(this, tabLayoutData);
        }
    });
});
