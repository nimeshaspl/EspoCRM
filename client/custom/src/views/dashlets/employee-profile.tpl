<div class="profile-container">
    <div class="user-avatar">{{avatar view=userAvatarField model=user}}</div>
    <h4>{{user.fullName}}</h4>
    <div class="employee-details">
        <div><strong>Role:</strong> {{#user}}Employee{{/user}}</div>
        <div><strong>Attendance:</strong> {{assignedAttendanceCount}}</div>
    </div>
</div>
