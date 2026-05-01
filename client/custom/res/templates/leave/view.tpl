<style>
    /* Form */
    .form-box {
        border: 1px solid #ddd;
        padding: 20px;
        border-radius: 6px;
        margin-bottom: 30px;
    }

    .form-row {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 15px;
    }

    .form-row label {
        width: 120px;
        font-weight: 500;
    }

    .form-row input,
    .form-row select,
    .form-row textarea {
        flex: 1;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    textarea {
        height: 60px;
    }

    .form-center {
        text-align: center;
    }

    button {
        background: #2f5ea7;
        color: #fff;
        border: none;
        padding: 10px 30px;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background: #244b86;
    }

    /* ── RESET & BASE ── */
    .lm-page * { box-sizing: border-box; }

    .lm-page {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1a2233;
        max-width: 1100px;
        margin: 0 auto;
        padding: 20px 16px 48px;
    }

    /* ── PAGE HEADER ── */
    .lm-page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 4px;
    }

    .lm-page-header h1 {
        font-size: 22px;
        font-weight: 600;
        color: #1a2233;
        margin: 0;
        letter-spacing: -0.3px;
    }

    .lm-subtitle {
        font-size: 13.5px;
        color: #64748b;
        margin: 4px 0 22px;
    }

    .lm-header-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
    }

    .lm-year-filter {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .lm-year-filter label {
        font-size: 13px;
        font-weight: 600;
        color: #475569;
        margin: 0;
    }

    .lm-year-filter select {
        min-width: 120px;
        height: 36px;
        padding: 6px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        background: #fff;
        color: #1a2233;
    }

    /* ── BUTTONS ── */
    .lm-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 7px 14px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        text-decoration: none;
        transition: opacity .15s, transform .1s;
        white-space: nowrap;
        line-height: 1.4;
    }
    .lm-btn:hover { opacity: .85; text-decoration: none; }
    .lm-btn:active { transform: scale(.97); }
    .lm-btn-primary  { background: #2f5ea7; color: #fff !important; }
    .lm-btn-success  { background: #16a34a; color: #fff !important; }
    .lm-btn-danger   { background: #dc2626; color: #fff !important; }
    .lm-btn-warning  { background: #d97706; color: #fff !important; }
    .lm-btn-outline  { background: #fff; color: #2f5ea7 !important; border: 1.5px solid #2f5ea7; }
    .lm-btn-sm { padding: 4px 10px; font-size: 12px; }

    /* ── SECTION CARD ── */
    .lm-section {
        background: #ffffff;
        border: 1px solid rgba(0,0,0,.09);
        border-radius: 10px;
        box-shadow: 0 1px 4px rgba(0,0,0,.06);
        margin-bottom: 20px;
        overflow: hidden;
    }

    .lm-section-header {
        padding: 13px 20px;
        border-bottom: 1px solid rgba(0,0,0,.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        background: #f7f9fc;
    }

    .lm-section-title {
        font-size: 14px;
        font-weight: 600;
        color: #1a2233;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .lm-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
        flex-shrink: 0;
    }
    .lm-dot-blue  { background: #2f5ea7; }
    .lm-dot-green { background: #16a34a; }

    .lm-section-body { padding: 20px; }

    /* ── STAT CARDS ── */
    .lm-stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 220px));
        gap: 12px;
        margin-bottom: 24px;
    }

    .lm-stat-card {
        background: #f7f9fc;
        border: 1px solid rgba(0,0,0,.08);
        border-radius: 8px;
        padding: 16px 18px;
        text-align: center;
    }

    .lm-stat-label {
        font-size: 11.5px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: .5px;
        margin-bottom: 8px;
    }

    .lm-stat-value {
        font-size: 30px;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 4px;
    }

    .lm-stat-unit {
        font-size: 12px;
        color: #94a3b8;
    }

    .lm-stat-paid   .lm-stat-value { color: #16a34a; }
    .lm-stat-unpaid .lm-stat-value { color: #dc2626; }

    /* ── SUB HEADING ── */
    .lm-sub-heading {
        font-size: 11.5px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: .6px;
        margin: 0 0 10px;
    }

    /* ── TABLE ── */
    .lm-table-wrap {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid rgba(0,0,0,.08);
        margin-bottom: 22px;
    }

    .lm-table-wrap:last-child { margin-bottom: 0; }

    .lm-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
        min-width: 540px;
    }

    .lm-table thead th {
        background: #f1f5f9;
        color: #64748b;
        font-weight: 700;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: .45px;
        padding: 10px 12px;
        border-bottom: 1px solid rgba(0,0,0,.08);
        text-align: left;
        white-space: nowrap;
    }

    .lm-table tbody tr:hover { background: #f8fafc; }

    .lm-table td {
        padding: 9px 12px;
        border-bottom: 1px solid rgba(0,0,0,.06);
        color: #1a2233;
        vertical-align: middle;
    }

    .lm-table tbody tr:last-child td { border-bottom: none; }

    .lm-table .lm-no-data td {
        text-align: center;
        color: #94a3b8;
        padding: 28px;
        font-size: 13px;
        font-style: italic;
    }


    .lm-td-wrap {
        max-width: 260px;
        max-height: 100px;
        white-space: pre-line;
        word-break: break-word;
        overflow-y: auto;
        display: block;
    }
    .lm-td-wrap::-webkit-scrollbar {
        display: none;
    }

    .lm-td-bold { font-weight: 600; }

    /* ── BADGES ── */
    .lm-badge {
        display: inline-block;
        padding: 3px 9px;
        border-radius: 20px;
        font-size: 11.5px;
        font-weight: 600;
        white-space: nowrap;
    }

    .lm-badge-pending   { background: #fef3c7; color: #92400e; }
    .lm-badge-approved  { background: #dcfce7; color: #166534; }
    .lm-badge-rejected  { background: #fee2e2; color: #991b1b; }
    .lm-badge-cancelled { background: #f1f5f9; color: #475569; }
    .lm-badge-paid      { background: #dbeafe; color: #1e40af; }
    .lm-badge-unpaid    { background: #fce7f3; color: #9d174d; }

    /* ── FILTER ROW ── */
    .lm-filter-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }

    .lm-filter-row label {
        font-size: 12.5px;
        font-weight: 500;
        color: #64748b;
        white-space: nowrap;
    }

    .lm-filter-row select {
        padding: 6px 10px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 13px;
        background: #fff;
        color: #1a2233;
        cursor: pointer;
        min-width: 180px;
        max-width: 260px;
    }

    /* ── ACTION CELL ── */
    .lm-action-cell {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
    }

    /* ── DIVIDER ── */
    .lm-divider {
        height: 1px;
        background: rgba(0,0,0,.07);
        margin: 22px 0;
    }

    /* ── SELECTED EMPLOYEE BALANCE BAR ── */
    .lm-emp-balance-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 14px;
        padding: 14px 20px;
        background: linear-gradient(90deg, #eef4ff 0%, #f0fdf4 100%);
        border-bottom: 1px solid rgba(0,0,0,.08);
    }

    .lm-emp-balance-label {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13.5px;
        font-weight: 600;
        color: #1a2233;
    }

    .lm-emp-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #2f5ea7;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        flex-shrink: 0;
        overflow: hidden;
    }

    .lm-emp-balance-cards {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .lm-emp-bal-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 120px;
        padding: 10px 18px;
        border-radius: 8px;
        border: 1px solid rgba(0,0,0,.08);
        text-align: center;
    }

    .lm-emp-bal-paid   { background: #f0fdf4; }
    .lm-emp-bal-unpaid { background: #fff1f2; }

    .lm-emp-bal-top {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .45px;
        color: #64748b;
        margin-bottom: 4px;
    }

    .lm-emp-bal-value {
        font-size: 26px;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 2px;
    }

    .lm-emp-bal-paid   .lm-emp-bal-value { color: #16a34a; }
    .lm-emp-bal-unpaid .lm-emp-bal-value { color: #dc2626; }

    .lm-emp-bal-unit {
        font-size: 11px;
        color: #94a3b8;
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 640px) {
        .lm-page-header { flex-direction: column; align-items: flex-start; }
        .lm-stat-grid { grid-template-columns: 1fr 1fr; }
        .lm-section-header { flex-direction: column; align-items: flex-start; }
    }
</style>

<div class="lm-page">

    {{!-- ══════════════════════════════════════════
         PAGE HEADER
    ══════════════════════════════════════════ --}}
    <div class="lm-page-header">
        <h1>Leave Management</h1>
        <div class="lm-header-actions">
            <div class="lm-year-filter">
                <label for="yearFilter">Year</label>
                <select id="yearFilter">
                    {{#each yearList}}
                    <option value="{{this}}" {{#ifEqual this ../selectedYear}}selected{{/ifEqual}}>{{this}}</option>
                    {{/each}}
                </select>
            </div>
            {{#if isEmployee}}
            <a role="button" tabindex="0" class="lm-btn lm-btn-primary action" data-action="applyForLeave">
                + Apply for Leave
            </a>
            {{/if}}
            {{#if isAdmin}}
            <a role="button" tabindex="0" class="lm-btn lm-btn-success action" data-action="applyForEmployeeLeave">
                + Apply for Employee
            </a>
            <a role="button" tabindex="0" class="lm-btn lm-btn-outline action" data-action="creditLeave">
                ↑ Credit Leave
            </a>
            <a role="button" tabindex="0" class="lm-btn lm-btn-outline action" data-action="debitLeave">
                ↓ Debit Leave
            </a>
            {{/if}}
        </div>
    </div>
    <p class="lm-subtitle">Welcome, <strong>{{userName}}</strong>. View your leave balance and manage team leave requests below.</p>


    {{!-- ══════════════════════════════════════════
         MY LEAVE OVERVIEW (always visible for login user)
    ══════════════════════════════════════════ --}}
    <div class="lm-section">
        <div class="lm-section-header">
            <h2 class="lm-section-title">
                <span class="lm-dot lm-dot-blue"></span>
                My Leave Overview
            </h2>
        </div>

        <div class="lm-section-body">

            {{!-- Balance Stats --}}
            <div class="lm-stat-grid">
                <div class="lm-stat-card lm-stat-paid">
                    <div class="lm-stat-label">Paid Leave Balance</div>
                    <div class="lm-stat-value">{{leaveBalance}}</div>
                    <div class="lm-stat-unit">days available</div>
                </div>
                <div class="lm-stat-card lm-stat-unpaid">
                    <div class="lm-stat-label">Unpaid Leaves Taken</div>
                    <div class="lm-stat-value">{{totalUnpaidLeaves}}</div>
                    <div class="lm-stat-unit">days used</div>
                </div>
            </div>

            {{!-- My Pending Requests --}}
            <p class="lm-sub-heading">My Pending Requests</p>
            <div class="lm-table-wrap">
                <table class="lm-table">
                    <thead>
                        <tr>
                            <th>Leave Type</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Days</th>
                            <th>Day Mode</th>
                            <th>Reason</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#each pendingLeaveList}}
                        <tr>
                            <td>
                                <span class="lm-badge {{#ifEqual leaveType 'Paid'}}lm-badge-paid{{else}}lm-badge-unpaid{{/ifEqual}}">
                                    {{leaveType}}
                                </span>
                            </td>
                            <td>{{startDate}}</td>
                            <td>{{#if endDate}}{{endDate}}{{else}}{{startDate}}{{/if}}</td>
                            <td>{{days}}</td>
                            <td>{{dayMode}}</td>
                            <td class="lm-td-wrap">{{reason}}</td>
                            <td>
                                <div class="lm-action-cell">
                                    <button class="lm-btn lm-btn-sm lm-btn-warning action"
                                        data-action="cancelLeaveRequest" data-id="{{id}}">
                                        Cancel
                                    </button>
                                </div>
                            </td>
                        </tr>
                        {{/each}}
                        {{^pendingLeaveList}}
                        <tr class="lm-no-data"><td colspan="8">No pending requests</td></tr>
                        {{/pendingLeaveList}}
                    </tbody>
                </table>
            </div>

            {{!-- My Leave History --}}
            <p class="lm-sub-heading">My Leave History</p>
            <div class="lm-table-wrap">
                <table class="lm-table">
                    <thead>
                        <tr>
                            <th>Leave Type</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Days</th>
                            <th>Day Mode</th>
                            <th>Reason</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#each myLeaveHistoryList}}
                        {{#ifNotEqual status 'Pending'}}
                        <tr>
                            <td>
                                <span class="lm-badge {{#ifEqual leaveType 'Paid'}}lm-badge-paid{{else}}lm-badge-unpaid{{/ifEqual}}">
                                    {{leaveType}}
                                </span>
                            </td>
                            <td>{{startDate}}</td>
                            <td>{{#if endDate}}{{endDate}}{{else}}{{startDate}}{{/if}}</td>
                            <td>{{days}}</td>
                            <td>{{dayMode}}</td>
                            <td class="lm-td-wrap" title="{{reason}}">{{reason}}</td>
                            <td>
                                <span class="lm-badge
                                    {{#ifEqual status 'Approved'}}lm-badge-approved{{/ifEqual}}
                                    {{#ifEqual status 'Rejected'}}lm-badge-rejected{{/ifEqual}}
                                    {{#ifEqual status 'Cancelled'}}lm-badge-cancelled{{/ifEqual}}">
                                    {{status}}
                                </span>
                            </td>
                        </tr>
                        {{/ifNotEqual}}
                        {{/each}}
                        {{^myLeaveHistoryList}}
                        <tr class="lm-no-data"><td colspan="7">No leave history found</td></tr>
                        {{/myLeaveHistoryList}}
                    </tbody>
                </table>
            </div>

        </div>
    </div>


    {{!-- ══════════════════════════════════════════
         Subordinates LEAVE (employee filter + all records)
    ══════════════════════════════════════════ --}}
    <div class="lm-section">
        <div class="lm-section-header">
            <h2 class="lm-section-title">
                <span class="lm-dot lm-dot-green"></span>
                Subordinates Leave Requests
            </h2>
            <div class="lm-filter-row">
                <label for="employeeFilter">Filter by Employee:</label>
                <select id="employeeFilter">
                    <option value="">All Employees</option>
                    {{#each employeeList}}
                    {{#ifNotEqual id ../loginUserId}}
                    <option value="{{id}}" {{#if selected}}selected{{/if}}>{{name}}</option>
                    {{/ifNotEqual}}
                    {{/each}}
                </select>
            </div>
        </div>

        {{!-- ── Selected Employee Balance Strip ── --}}
        {{#if hasSelectedEmployee}}
        <div class="lm-emp-balance-bar">
            <div class="lm-emp-balance-label">
                <span class="lm-emp-avatar" data-name="{{selectedEmployeeName}}"></span>
                <span>{{selectedEmployeeName}}</span>
            </div>
            <div class="lm-emp-balance-cards">
                <div class="lm-emp-bal-card lm-emp-bal-paid">
                    <div class="lm-emp-bal-top">Paid Balance</div>
                    <div class="lm-emp-bal-value">{{selectedLeaveBalance}}</div>
                    <div class="lm-emp-bal-unit">days available</div>
                </div>
                <div class="lm-emp-bal-card lm-emp-bal-unpaid">
                    <div class="lm-emp-bal-top">Unpaid Taken</div>
                    <div class="lm-emp-bal-value">{{selectedUnpaidLeaves}}</div>
                    <div class="lm-emp-bal-unit">days used</div>
                </div>
            </div>
        </div>
        {{/if}}

        <div class="lm-section-body">

            {{!-- Pending Approvals --}}
            <p class="lm-sub-heading">Pending Approvals</p>
            <div class="lm-table-wrap">
                <table class="lm-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Leave Type</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Days</th>
                            <th>Day Mode</th>
                            <th>Reason</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#each pendingAllLeaveList}}
                        {{#ifNotEqual userId ../loginUserId}}
                        <tr>
                            <td class="lm-td-bold">{{userName}}</td>
                            <td>
                                <span class="lm-badge {{#ifEqual leaveType 'Paid'}}lm-badge-paid{{else}}lm-badge-unpaid{{/ifEqual}}">
                                    {{leaveType}}
                                </span>
                            </td>
                            <td>{{startDate}}</td>
                            <td>{{#if endDate}}{{endDate}}{{else}}{{startDate}}{{/if}}</td>
                            <td>{{days}}</td>
                            <td>{{dayMode}}</td>
                            <td class="lm-td-wrap" title="{{reason}}">{{reason}}</td>
                            <td>
                                <div class="lm-action-cell">
                                    <button class="lm-btn lm-btn-sm lm-btn-success action"
                                        data-action="approveRequest" data-id="{{id}}">
                                        Approve
                                    </button>
                                    <button class="lm-btn lm-btn-sm lm-btn-danger action"
                                        data-action="rejectRequest" data-id="{{id}}">
                                        Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                        {{/ifNotEqual}}
                        {{/each}}
                        {{^pendingAllLeaveList}}
                        <tr class="lm-no-data"><td colspan="9">No pending approvals</td></tr>
                        {{/pendingAllLeaveList}}
                    </tbody>
                </table>
            </div>

            {{!-- All Leave Records --}}
            <p class="lm-sub-heading">All Leave Records</p>
            <div class="lm-table-wrap">
                <table class="lm-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Leave Type</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Days</th>
                            <th>Day Mode</th>
                            <th>Reason</th>
                            <th>Status</th>
                            {{#if isAdmin}}
                            <th>Action</th>
                            {{/if}}
                        </tr>
                    </thead>
                    <tbody>
                        {{#each allLeaveList}}
                        {{#ifNotEqual status 'Pending'}}
                        {{#ifNotEqual userId ../loginUserId}}
                        <tr>
                            <td class="lm-td-bold">{{userName}}</td>
                            <td>
                                <span class="lm-badge {{#ifEqual leaveType 'Paid'}}lm-badge-paid{{else}}lm-badge-unpaid{{/ifEqual}}">
                                    {{leaveType}}
                                </span>
                            </td>
                            <td>{{startDate}}</td>
                            <td>{{#if endDate}}{{endDate}}{{else}}{{startDate}}{{/if}}</td>
                            <td>{{days}}</td>
                            <td>{{dayMode}}</td>
                            <td class="lm-td-wrap" title="{{reason}}">{{reason}}</td>
                            <td>
                                <span class="lm-badge
                                    {{#ifEqual status 'Pending'}}lm-badge-pending{{/ifEqual}}
                                    {{#ifEqual status 'Approved'}}lm-badge-approved{{/ifEqual}}
                                    {{#ifEqual status 'Rejected'}}lm-badge-rejected{{/ifEqual}}
                                    {{#ifEqual status 'Cancelled'}}lm-badge-cancelled{{/ifEqual}}">
                                    {{status}}
                                </span>
                            </td>
                            {{#if ../isAdmin}}
                            <td>
                                <div class="lm-action-cell">
                                    <button class="lm-btn lm-btn-sm lm-btn-warning action"
                                        data-action="revokeRequest" data-id="{{id}}">
                                        Revoke
                                    </button>
                                </div>
                            </td>
                            {{/if}}
                        </tr>
                        {{/ifNotEqual}}
                        {{/ifNotEqual}}
                        {{/each}}
                        {{^allLeaveList}}
                        <tr class="lm-no-data">
                            <td colspan="{{#if isAdmin}}9{{else}}8{{/if}}">No leave records found</td>
                        </tr>
                        {{/allLeaveList}}
                    </tbody>
                </table>
            </div>

        </div>
    </div>

</div>

<script>
    (function () {
        var avatars = document.querySelectorAll('.lm-emp-avatar[data-name]');
        avatars.forEach(function (el) {
            var name = el.getAttribute('data-name') || '';
            var parts = name.trim().split(/\s+/);
            var initials = parts.length >= 2
                ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
                : (parts[0] ? parts[0][0].toUpperCase() : '?');
            el.textContent = initials;
            el.style.textIndent = '0';
        });
    })();
</script>
