define('custom:views/dashlets/attendance-overview', 
    ['views/dashlets/abstract/record-list'], 
    function (Dep) {
    
    return Dep.extend({
        name: 'AttendanceOverview',
        scope: 'AttendanceRecord',
        listLayout: {
            rows: [
                [{name: 'employeeName'}, {name: 'status'}],
                [{name: 'attendanceDate', view: 'views/fields/date'}]
            ]
        }
    });
});
