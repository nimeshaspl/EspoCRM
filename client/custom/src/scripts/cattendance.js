define('custom:scripts/cattendance', [], function () {
    
    return function (view) {
        // Only apply to CAttendance list views
        if (!view || !view.collection || view.collection.entityType !== 'CAttendance') {
            return;
        }
        
        console.log('Attendance script loaded for:', view.name);
        
        // Wait for view to be ready
        view.once('after:render', function () {
            console.log('CAttendance list rendered, attaching handlers...');
            
            // Attach click handlers directly to buttons
            attachButtonHandlers(view);
            
            // Initial button visibility
            adjustButtonVisibility(view);
        });
        
        // Re-attach handlers after collection fetch
        view.listenTo(view.collection, 'sync', function () {
            attachButtonHandlers(view);
            adjustButtonVisibility(view);
        });
        
        // Helper function to attach button handlers
        function attachButtonHandlers(view) {
            // Find Clock In button
            var $clockInBtn = view.$el.find('button[name="clockIn"], button[data-name="clockIn"], .action[data-action="clockIn"]');
            $clockInBtn.off('click.attendance').on('click.attendance', function (e) {
                e.preventDefault();
                e.stopPropagation();
                actionClockIn(view);
            });
            
            // Find Clock Out button
            var $clockOutBtn = view.$el.find('button[name="clockOut"], button[data-name="clockOut"], .action[data-action="clockOut"]');
            $clockOutBtn.off('click.attendance').on('click.attendance', function (e) {
                e.preventDefault();
                e.stopPropagation();
                actionClockOut(view);
            });
            
            console.log('Button handlers attached:', $clockInBtn.length, 'Clock In buttons,', $clockOutBtn.length, 'Clock Out buttons');
        }
        
        function adjustButtonVisibility(view) {
            var user = view.getUser();
            var isAdmin = user.isAdmin();
            
            var $clockInBtn = view.$el.find('button[name="clockIn"], button[data-name="clockIn"]');
            var $clockOutBtn = view.$el.find('button[name="clockOut"], button[data-name="clockOut"]');
            
            if (isAdmin) {
                $clockInBtn.show();
                $clockOutBtn.show();
                return;
            }
            
            // Hide both initially
            $clockInBtn.hide();
            $clockOutBtn.hide();
            
            // Fetch status
            Espo.Ajax.getRequest('CAttendance/action/todayStatus')
                .then(function (data) {
                    console.log('Today status:', data);
                    if (data.canClockIn) $clockInBtn.show();
                    if (data.canClockOut) $clockOutBtn.show();
                })
                .fail(function (error) {
                    console.error('Failed to fetch status:', error);
                    $clockInBtn.show();
                    $clockOutBtn.hide();
                });
        }
        
        function actionClockIn(view) {
            console.log('Clock In clicked');
            Espo.Ui.notify('Clocking in...');
            
            Espo.Ajax.postRequest('CAttendance/action/clockIn', {})
                .then(function (response) {
                    Espo.Ui.success(response.message);
                    if (view.collection) {
                        view.collection.fetch();
                    }
                    adjustButtonVisibility(view);
                })
                .fail(function (xhr) {
                    var msg = xhr.getResponseHeader('X-Status-Reason') || 'Clock In failed';
                    console.error('Clock In error:', xhr.responseText || msg);
                    Espo.Ui.error(msg);
                });
        }
        
        function actionClockOut(view) {
            console.log('Clock Out clicked');
            Espo.Ui.notify('Clocking out...');
            
            Espo.Ajax.postRequest('CAttendance/action/clockOut', {})
                .then(function (response) {
                    Espo.Ui.success(response.message);
                    if (view.collection) {
                        view.collection.fetch();
                    }
                    adjustButtonVisibility(view);
                })
                .fail(function (xhr) {
                    var msg = xhr.getResponseHeader('X-Status-Reason') || 'Clock Out failed';
                    console.error('Clock Out error:', xhr.responseText || msg);
                    Espo.Ui.error(msg);
                });
        }
    };
});