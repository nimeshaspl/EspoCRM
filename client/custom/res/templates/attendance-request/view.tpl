<style>
    .wrapper {
        width: 100%;
        margin: 12px auto;
        background: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .pull-right {
        display: hidden;
    }


    .attendance-summary {
        margin: 20px 0;
    }

    .attendance-top {
        background: #e8f5e9;
        padding: 10px 15px;
        border-radius: 6px;
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        font-weight: 600;
    }

    .attendance-cards {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
    }

    .card-box {
        flex: 1;
        background: #f7f7f7;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #ddd;
    }

    /* Top buttons */
    .btn-container {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    .top-btns {
        background-color: transparent;
        color: #6262a3;
        border: 1px solid #6262a3;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s ease;
        height: 50px;
        width: 300px;
    }
</style>

<h1>{{userName}}</h1>

<div class="wrapper">
    {{#if isAdmin}}
    <div class="panel panel-default" style="padding:10px;margin-bottom:15px;">
        <label><strong>Filter by Employee:</strong></label>
        <select id="employeeFilter" class="form-control">
            <option value="">All Employees</option>
            {{#each employeeList}}
            <option value="{{id}}" {{#if selected}}selected{{/if}}>
                {{name}}
            </option>
            {{/each}}
        </select>
    </div>
    {{else}}
    <div style="display: flex;justify-content: space-between;margin: 12px 0px;">
        <div>
            <h3>Attendance</h3>
        </div>
        <div style="margin: 12px 0px;justify-content: end;gap: 20px;">
            <a class="btn btn-success action" data-action="clockIn">
                <span>Clock In</span>
            </a>

            <a class="btn btn-danger action hidden" data-action="clockOut">
                <span>Clock Out</span>
            </a>
        </div>
    </div>
    {{/if}}

    <table class="table">
        <thead>
            <tr>
                {{#if isAdmin}}
                <th>Employee</th>
                {{/if}}
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Status</th>
                {{#if isAdmin}}
                <th colspan="2">Action</th>
                {{/if}}
            </tr>
        </thead>
        <tbody>
            {{#each attendanceList}}
            <tr>
                {{#if ../isAdmin}}
                <td>{{this.name}}</td>
                {{/if}}
                <td>{{this.date}}</td>
                <td>{{this.clockInTime}}</td>
                <td>{{this.clockOutTime}}</td>
                <td>{{this.status}}</td>
                {{#if ../isAdmin}}
                {{#ifEqual this.status 'Pending' }}
                <td>
                    <a role="button" tabindex="0" class="btn btn-success btn-xs-wide action"
                        data-action="approveAttendanceRequest" data-id="{{id}}">
                        <span>Approved</span>
                    </a>
                </td>
                <td>
                    <a role="button" tabindex="0" class="btn btn-danger btn-xs-wide action"
                        data-action="rejectAttendanceRequest" data-id="{{id}}">
                        <span>Rejected</span>
                    </a>
                </td>
                {{else}}
                <td>
                    <a role="button" tabindex="0" class="btn btn-success btn-xs-wide action"
                        style="cursor: not-allowed;" aria-disabled="true">
                        <span>Approved</span>
                    </a>
                </td>
                <td>
                    <a role="button" tabindex="0" class="btn btn-danger btn-xs-wide action"
                        style="cursor: not-allowed;" aria-disabled="true">
                        <span>Rejected</span>
                    </a>
                </td>
                {{/ifEqual}}

                {{/if}}
            </tr>
            {{/each}}
        </tbody>
    </table>


</div>