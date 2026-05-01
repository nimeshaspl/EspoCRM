define('custom:views/dashlets/quick-attendance', 'views/dashlets/abstract/base', function (Dep) {

    return Dep.extend({
        name: 'QuickAttendance',
        
        templateContent: `
            <div class="quick-attendance-dashlet">
                <div class="panel-body">
                    <div class="row">
                        <div class="col-md-12 text-center">
                            <h4>{{today}}</h4>
                            <div style="margin: 20px 0;">
                                <button class="btn btn-success btn-lg clock-in-btn" style="width: 150px; margin: 5px;">
                                    <span class="fas fa-sign-in-alt"></span> Clock In
                                </button>
                                <button class="btn btn-danger btn-lg clock-out-btn" style="width: 150px; margin: 5px;">
                                    <span class="fas fa-sign-out-alt"></span> Clock Out
                                </button>
                            </div>
                            <div class="status-message" style="margin-top: 15px;">
                                {{{statusMessage}}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        setup: function () {
            this.today = moment().format('dddd, MMMM D, YYYY');
            this.statusMessage = '<span class="text-muted">Checking status...</span>';
            this.wait(true);
            
            this.getTodayStatus();
        },
        
        afterRender: function () {
            this.$el.find('.clock-in-btn').click(this.actionClockIn.bind(this));
            this.$el.find('.clock-out-btn').click(this.actionClockOut.bind(this));
        },
        
        getTodayStatus: function () {
            Espo.Ajax.getRequest('CAttendance/action/todayStatus')
                .then(function (data) {
                    this.wait(false);
                    
                    if (data.isClockedIn && !data.isClockedOut) {
                        this.statusMessage = '<span class="text-success">✓ You are currently clocked in</span>';
                        this.$el.find('.clock-in-btn').prop('disabled', true);
                        this.$el.find('.clock-out-btn').prop('disabled', false);
                    } else if (data.isClockedIn && data.isClockedOut) {
                        this.statusMessage = '<span class="text-info">✓ Completed: ' + 
                            (data.attendance ? data.attendance.totalHours + ' hours' : '') + 
                            '</span>';
                        this.$el.find('.clock-in-btn').prop('disabled', true);
                        this.$el.find('.clock-out-btn').prop('disabled', true);
                    } else {
                        this.statusMessage = '<span class="text-warning">⚠ Not clocked in today</span>';
                        this.$el.find('.clock-in-btn').prop('disabled', false);
                        this.$el.find('.clock-out-btn').prop('disabled', true);
                    }
                    
                    this.$el.find('.status-message').html(this.statusMessage);
                }.bind(this));
        },
        
        actionClockIn: function () {
            this.actionHandler('clockIn');
        },
        
        actionClockOut: function () {
            this.actionHandler('clockOut');
        },
        
        actionHandler: function (action) {
            Espo.Ajax.postRequest('CAttendance/action/' + action, {})
                .then(function (response) {
                    Espo.Ui.success(response.message);
                    this.getTodayStatus();
                }.bind(this))
                .fail(function (xhr) {
                    var msg = xhr.getResponseHeader('X-Status-Reason') || action + ' failed';
                    Espo.Ui.error(msg);
                });
        }
    });
});