Espo.define('custom:views/dashlets/attendance-summary', 'views/dashlets/abstract/base', function (Dep) {
    return Dep.extend({
        name: 'AttendanceSummary',
        
        templateContent: '<div class="attendance-summary-container">' +
            '<div class="panel-body">' +
            '<div class="row">' +
            '<div class="col-md-4">' +
            '<div class="well text-center">' +
            '<h4>Today\'s Status</h4>' +
            '<div class="today-status">{{todayStatus}}</div>' +
            '<div class="today-hours" style="font-size: 24px;">{{todayHours}}h</div>' +
            '</div>' +
            '</div>' +
            '<div class="col-md-8">' +
            '<h4>Recent Activity</h4>' +
            '<div class="recent-activity">{{{recentActivity}}}</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            
        setup: function () {
            this.wait(true);
            
            this.ajaxGetRequest('CEmployee/action/attendanceHistory', {})
                .then(function (history) {
                    this.todayStatus = this.getTodayStatus(history);
                    this.todayHours = this.getTodayHours(history);
                    this.recentActivity = this.getRecentActivity(history);
                    this.wait(false);
                }.bind(this));
        },
        
        getTodayStatus: function (history) {
            let today = moment().format('YYYY-MM-DD');
            let todayRecord = history.find(r => r.date === today);
            
            if (!todayRecord) return 'Not Clocked In';
            if (todayRecord.lastClockOut) return 'Clocked Out';
            return 'Currently Working';
        },
        
        getTodayHours: function (history) {
            let today = moment().format('YYYY-MM-DD');
            let todayRecord = history.find(r => r.date === today);
            return todayRecord && todayRecord.totalHours ? todayRecord.totalHours : 0;
        },
        
        getRecentActivity: function (history) {
            let recent = history.slice(0, 5);
            let html = '<ul class="list-group">';
            recent.forEach(function (record) {
                html += '<li class="list-group-item">' +
                    record.date + ' - ' + (record.totalHours ? record.totalHours + ' hours' : 'Incomplete') +
                    '</li>';
            });
            html += '</ul>';
            return html;
        }
    });
});