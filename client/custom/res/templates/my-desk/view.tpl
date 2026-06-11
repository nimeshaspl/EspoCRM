<style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&display=swap');

    :root {
        --navy: #1a3550;
        --navy-light: #244466;
        --navy-deep: #0f2237;
        --cyan: #00b4d8;
        --cyan-light: #48cae4;
        --cyan-pale: #caf0f8;
        --cyan-faint: #e8f8fd;
        --white: #ffffff;
        --off: #f4f8fb;
        --muted: #6b8ba4;
        --border: rgba(0, 180, 216, 0.15);
        --text: #1a3550;
        --sub: #4a6d87;
    }

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    .desk-root {
        font-family: 'DM Sans', sans-serif;
        background: var(--off);
        min-height: 600px;
        padding: 0;
        color: var(--text);
    }

    .desk-header {
        background: var(--navy);
        padding: 18px 28px;
        display: flex;
        align-items: center;
        gap: 14px;
        border-bottom: 3px solid var(--cyan);
    }

    .desk-header-icon {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, var(--cyan), var(--cyan-light));
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .desk-header-icon i {
        font-size: 18px;
        color: var(--navy);
    }

    .desk-header-title {
        font-family: 'Syne', sans-serif;
        font-size: 22px;
        font-weight: 700;
        color: var(--white);
        letter-spacing: 0.3px;
    }

    .desk-header-sub {
        font-size: 12px;
        color: var(--cyan-light);
        margin-left: auto;
        opacity: 0.85;
    }

    .desk-body {
        display: flex;
        gap: 16px;
        padding: 20px;
        align-items: start;
    }

    .card {
        background: var(--white);
        border-radius: 14px;
        border: 1px solid var(--border);
    }

    .card-head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 18px 12px;
        border-bottom: 1px solid var(--border);
    }

    .card-head-icon {
        width: 30px;
        height: 30px;
        background: var(--cyan-faint);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .card-head-icon i {
        font-size: 15px;
        color: var(--cyan);
    }

    .card-head-title {
        font-family: 'Syne', sans-serif;
        font-size: 14px;
        font-weight: 600;
        color: var(--navy);
        letter-spacing: 0.2px;
    }

    .card-head-action {
        margin-left: auto;
        background: var(--cyan);
        color: var(--navy-deep);
        border: none;
        border-radius: 7px;
        padding: 5px 12px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .notice-body {
        padding: 14px 18px;
    }

    .notice-label {
        display: inline-block;
        background: var(--cyan-faint);
        color: var(--cyan);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 5px;
        margin-bottom: 8px;
        border: 1px solid rgba(0, 180, 216, 0.25);
    }

    .notice-text {
        font-size: 13px;
        color: var(--sub);
        line-height: 1.6;
    }

    .notice-text strong {
        color: var(--navy);
        font-weight: 600;
    }

    .whos-in {
        padding: 14px 18px 18px;
    }

    .whos-in-title {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.9px;
        text-transform: uppercase;
        color: var(--muted);
        margin-bottom: 12px;
    }

    .attendance-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .att-block {
        background: var(--off);
        border-radius: 10px;
        padding: 12px 14px;
        min-height: 100px;
        border: 1px solid rgba(0, 180, 216, 0.1);
        overflow: hidden;
        /* ← ADD: scroll containment lives HERE now */
        min-width: 0;
    }

    .att-block-head {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 10px;
    }

    .att-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .att-dot.pending {
        background: #f59e0b;
    }

    .att-dot.in {
        background: #10b981;
    }

    .att-dot.out {
        background: #6b8ba4;
    }

    .att-dot.leave {
        background: var(--cyan);
    }

    .desk-avatar-row {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        scrollbar-width: none;
        flex-wrap: nowrap;
        width: 100%;
        max-width: 100%;
        /* ← ADD */
        min-width: 0;
    }

    .desk-avatar-row::-webkit-scrollbar {
        display: none;
    }

    .att-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--sub);
        text-transform: uppercase;
        letter-spacing: 0.6px;
    }

    .avatar-row {
        display: flex;
        gap: 6px;
        height: 90px;
        flex-wrap: wrap;
    }

    .desk-avatar {
        flex-shrink: 0;
        /* ← ADD: prevents avatars compressing instead of scrolling */
        width: 95px;
        height: 95px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid var(--white);
        box-shadow: 0 0 0 1.5px rgba(0, 180, 216, 0.2);
    }

    .desk-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .desk-avatar-empty {
        font-size: 11px;
        color: var(--muted);
        padding: 4px 0;
    }

    .sidebar {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 30%;
    }

    .info-row {
        padding: 14px 18px;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 7px 0;
        border-bottom: 1px solid var(--border);
    }

    .info-item .info-item-head {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .birthday-list {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        overflow-x: scroll;
        scrollbar-width: none;
        width: 100%;
        gap: 10px;
    }

    .birthday-list-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
    }

    .birthday-list-item img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        vertical-align: middle;
        margin-right: 6px;
    }

    .info-item:last-child {
        border-bottom: none;
    }

    .info-icon {
        font-size: 14px;
        color: var(--cyan);
        margin-top: 1px;
    }

    .info-key {
        font-size: 12px;
        font-weight: 600;
        color: var(--sub);
        min-width: 60px;
    }

    .info-val {
        font-size: 12px;
        color: var(--text);
        line-height: 1.5;
    }

    .info-val a {
        color: var(--cyan);
        text-decoration: none;
    }

    .info-val a:hover {
        text-decoration: underline;
    }

    .hol-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: var(--cyan-faint);
        border: 1px solid rgba(0, 180, 216, 0.3);
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 12px;
        color: var(--navy);
        font-weight: 500;
        margin-top: 6px;
    }

    .hol-badge i {
        color: var(--cyan);
        font-size: 13px;
    }

    .links-grid {
        padding: 12px 18px 16px;
        display: flex;
        flex-direction: column;
        gap: 7px;
    }

    .link-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        background: var(--off);
        border-radius: 9px;
        border: 1px solid rgba(0, 180, 216, 0.1);
        text-decoration: none;
        transition: background 0.15s;
        cursor: pointer;
    }

    .link-pill:hover {
        background: var(--cyan-faint);
        border-color: rgba(0, 180, 216, 0.3);
    }

    .link-pill i {
        font-size: 15px;
        color: var(--cyan);
    }

    .link-pill span {
        font-size: 13px;
        color: var(--navy);
        font-weight: 500;
    }

    .link-pill .arr {
        margin-left: auto;
        font-size: 13px;
        color: var(--muted);
    }

    .section-divider {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.9px;
        text-transform: uppercase;
        color: var(--muted);
        padding: 10px 18px 6px;
        border-top: 1px solid var(--border);
    }
</style>

<div class="desk-root">
    <div class="desk-header">
        <span class="desk-header-title">My Desk</span>
        <span class="desk-header-sub">Thursday, 14 May 2026</span>
    </div>

    <div class="desk-body">
        <div style="display:flex;flex-direction:column;gap:14px;width: 70%;">

            <div class="card">
                <div class="card-head">
                    <div class="card-head-icon"><i class="fa fa-bullhorn" aria-hidden="true"></i></div>
                    <span class="card-head-title">Noticeboard</span>
                    {{#if isAdmin}}
                    <button class="card-head-action" data-action="addNotice">
                        <i class="fa fa-plus" style="font-size:11px;"></i> New Notice
                    </button>
                    {{/if}}
                </div>
                <div class="notice-body">
                    <div class="notice-label">Latest Announcement</div>
                    <p class="notice-text"><strong>{{latestNotice.name}}</strong> {{latestNotice.description}}</p>
                </div>
            </div>

            <div class="card">
                <div class="card-head">
                    <div class="card-head-icon"><i class="fa fa-users" aria-hidden="true"></i></div>
                    <span class="card-head-title">Who's in today</span>
                    <span
                        style="margin-left:auto;font-size:11px;color:var(--muted);font-weight:500;">Company-wide</span>
                </div>
                <div class="whos-in">
                    <div class="attendance-grid">
                        <div class="att-block" style="border-left: 4px solid #f59e0b;">
                            <div class="att-block-head">
                                <div class="att-dot pending"></div>
                                <span class="att-label">Not clocked-in</span>
                            </div>
                            <div class="desk-avatar-row">
                                {{#each notClockInUsers}}
                                <div class="desk-avatar" title="{{name}}"><img src="{{avatar}}" alt="{{name}}"></div>
                                {{/each}}
                                {{^each notClockInUsers}}<span class="desk-avatar-empty">None</span>{{/each}}
                            </div>
                        </div>

                        <div class="att-block" style="border-left: 4px solid #10b981;">
                            <div class="att-block-head">
                                <div class="att-dot in"></div>
                                <span class="att-label">Clocked-in</span>
                            </div>
                            <div class="desk-avatar-row">
                                {{#each clockedInUsers}}
                                <div class="desk-avatar" title="{{name}}"><img src="{{avatar}}" alt="{{name}}"></div>
                                {{/each}}
                                {{^each clockedInUsers}}<span class="desk-avatar-empty">None</span>{{/each}}
                            </div>
                        </div>

                        <div class="att-block" style="border-left: 4px solid #6b8ba4;">
                            <div class="att-block-head">
                                <div class="att-dot out"></div>
                                <span class="att-label">Clocked-out</span>
                            </div>
                            <div class="desk-avatar-row">
                                {{#each clockedOutUsers}}
                                <div class="desk-avatar" title="{{name}}"><img src="{{avatar}}" alt="{{name}}"></div>
                                {{/each}}
                                {{^each clockedOutUsers}}<span class="desk-avatar-empty">None</span>{{/each}}
                            </div>
                        </div>

                        <div class="att-block" style="border-left: 4px solid #ff0000;">
                            <div class="att-block-head">
                                <div class="att-dot leave"></div>
                                <span class="att-label">On leave</span>
                            </div>
                            <div class="desk-avatar-row">
                                {{#each onLeaveUsers}}
                                <div>
                                    <div class="desk-avatar" title="{{name}}"><img src="{{avatar}}" alt="{{name}}">
                                    </div>
                                    <div style="font-size:10px;color:var(--muted);text-align:center;margin-top:4px;">
                                        {{dayMode}}</div>

                                </div>

                                {{/each}}
                                {{^each onLeaveUsers}}<span class="desk-avatar-empty">None</span>{{/each}}
                            </div>
                        </div>

                        <div class="att-block" style="border-left: 4px solid var(--cyan);">
                            <div class="att-block-head">
                                <div class="att-dot leave"></div>
                                <span class="att-label">On Optional Holiday</span>
                            </div>
                            <div class="desk-avatar-row">
                                {{#each onOptionalHolidayUsers}}
                                <div class="desk-avatar" title="{{name}}"><img src="{{avatar}}" alt="{{name}}"></div>
                                {{/each}}
                                {{^each onOptionalHolidayUsers}}<span class="desk-avatar-empty">None</span>{{/each}}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div class="sidebar">
            <div class="card">
                <div class="card-head">
                    <div class="card-head-icon"><i class="fa fa-birthday-cake" aria-hidden="true"></i></div>
                    <span class="card-head-title">Birthdays</span>
                </div>
                <div class="info-row">
                    <div class="info-item">
                        <div class="info-item-head">
                            <i class="fa fa-sun info-icon" aria-hidden="true"></i>
                            <div class="info-key">Today</div>
                        </div>
                        <div class="birthday-list">
                            {{#if todayBirthdayUsers.length}}
                            {{#each todayBirthdayUsers}}
                            <div class="birthday-list-item">
                                <img src="{{this.avatar}}" alt="{{this.name}}" title="{{this.name}}">
                                <p>{{this.name}}</p>
                                <p>{{this.date}}</p>
                            </div>
                            {{/each}}

                            {{else}}
                            <div class="birthday-list-item">No birthdays today</div>
                            {{/if}}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-head">
                            <i class="fa fa-calendar-check info-icon" aria-hidden="true"></i>
                            <div class="info-key">Upcoming</div>
                        </div>
                        <div class="birthday-list">
                            {{#if upcomingBirthdayUsers.length}}
                            {{#each upcomingBirthdayUsers}}
                            <div class="birthday-list-item">
                                <img src="{{this.avatar}}" alt="{{this.name}}" title="{{this.name}}">
                                <p>{{this.name}}</p>
                                <p>{{this.date}}</p>
                            </div>
                            {{/each}}
                            {{else}}
                            <div class="birthday-list-item">No upcoming birthdays</div>
                            {{/if}}
                        </div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-head">
                    <div class="card-head-icon"><i class="fa fa-gift" aria-hidden="true"></i></div>
                    <span class="card-head-title">Anniversaries</span>
                </div>
                <div class="info-row">
                    <div class="info-item">
                        <div class="info-item-head">
                            <i class="fa fa-sun info-icon" aria-hidden="true"></i>
                            <div class="info-key">Today</div>
                        </div>
                        <div class="birthday-list">
                            {{#if todayAnniversaryUsers.length}}
                            {{#each todayAnniversaryUsers}}
                            <div class="birthday-list-item">
                                <img src="{{this.avatar}}" alt="{{this.name}}" title="{{this.name}}"
                                    style="width:80px;height:80px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:6px;">
                                <p>{{this.name}}</p>
                                <p>{{this.date}}</p>
                            </div>
                            {{/each}}

                            {{else}}
                            <div class="birthday-list-item">No anniversaries today</div>
                            {{/if}}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-head">
                            <i class="fa fa-calendar-check info-icon" aria-hidden="true"></i>
                            <div class="info-key">Upcoming</div>
                        </div>
                        <div class="birthday-list">
                            {{#if upcomingAnniversaryUsers.length}}
                            {{#each upcomingAnniversaryUsers}}
                            <div class="birthday-list-item">
                                <img src="{{this.avatar}}" alt="{{this.name}}" title="{{this.name}}"
                                    style="width:80px;height:80px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:6px;">
                                <p>{{this.name}}</p>
                                <p>{{this.date}}</p>
                            </div>
                            {{/each}}
                            {{else}}
                            <div class="birthday-list-item">No upcoming anniversaries</div>
                            {{/if}}
                        </div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-head">
                    <div class="card-head-icon"><i class="fa fa-calendar" aria-hidden="true"></i></div>
                    <span class="card-head-title">Holidays</span>
                </div>
                <div style="padding:12px 18px 16px;">
                    <div
                        style="font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:8px;">
                        Next holiday</div>
                    <div class="hol-badge">
                        <i class="fa fa-flag" aria-hidden="true"></i>
                        {{nextHoliday.name}} — {{nextHoliday.formattedDate}}
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-head">
                    <div class="card-head-icon"><i class="fa fa-link" aria-hidden="true"></i></div>
                    <span class="card-head-title">Important Links</span>
                </div>
                <div class="links-grid">
                    <a class="link-pill" href="#Profile">
                        <i class="fa fa-user" aria-hidden="true"></i>
                        <span>Profile</span>
                        <i class="fa fa-arrow-right arr" aria-hidden="true"></i>
                    </a>
                    <a class="link-pill" href="#AttendancePage">
                        <i class="fa fa-clock" aria-hidden="true"></i>
                        <span>Attendance</span>
                        <i class="fa fa-arrow-right arr" aria-hidden="true"></i>
                    </a>
                    <a class="link-pill" href="#Leave">
                        <i class="fa fa-beach" aria-hidden="true"></i>
                        <span>Leave Balances</span>
                        <i class="fa fa-arrow-right arr" aria-hidden="true"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>