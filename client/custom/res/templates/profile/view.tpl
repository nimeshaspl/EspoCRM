<style>
    /* ─── Ashapura Softech Brand Colors ─── */
    :root {
        --as-navy:   #0d2b4e;
        --as-blue:   #1a4f80;
        --as-cyan:   #00b4d8;
        --as-cyan-light: #e0f7fd;
        --as-white:  #ffffff;
        --as-bg:     #f0f4f8;
        --as-card:   #ffffff;
        --as-border: #dde3ea;
        --as-text:   #1e293b;
        --as-muted:  #64748b;
        --as-active-tab: #0d2b4e;
    }
    .profile-page-wrap { background: var(--as-bg); min-height: 100vh; padding: 0 0 32px; }
    .profile-cover { background: linear-gradient(135deg, var(--as-navy) 0%, var(--as-blue) 60%, var(--as-cyan) 100%); height: 140px; border-radius: 0 0 24px 24px; position: relative; }
    .profile-card { background: var(--as-card); border-radius: 16px; box-shadow: 0 4px 24px rgba(13,43,78,.10); margin: -64px 24px 0; padding: 0 28px 20px; position: relative; }
    .profile-card-top { display: flex; align-items: flex-end; gap: 20px; padding-top: 0; }
    .profile-avatar-wrap { margin-top: -44px; flex-shrink: 0; }
    .profile-avatar { width: 150px; height: 150px; border-radius: 50%; border: 4px solid var(--as-white); box-shadow: 0 2px 12px rgba(0,180,216,.25); background: linear-gradient(135deg, var(--as-navy), var(--as-cyan)); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; color: var(--as-white); letter-spacing: 1px; text-transform: uppercase; overflow: hidden; }
    .profile-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .profile-header-info { flex: 1; padding-bottom: 12px; }
    .profile-header-info h3 { margin: 0 0 2px; font-size: 1.35rem; font-weight: 700; color: var(--as-navy); }
    .profile-header-info .profile-role { font-size: .85rem; color: var(--as-muted); margin: 0 0 6px; }
    .profile-main-tabs { border-top: 1px solid var(--as-border); margin-top: 8px; display: flex; gap: 4px; }
    .profile-main-tab { padding: 10px 20px; border: none; background: transparent; color: var(--as-muted); font-size: .88rem; font-weight: 600; cursor: pointer; border-bottom: 3px solid transparent; transition: color .2s, border-color .2s; }
    .profile-main-tab.active { color: var(--as-navy); border-bottom-color: var(--as-cyan); }
    .profile-main-tab:hover:not(.active) { color: var(--as-blue); }
    .profile-content-row { display: flex; gap: 20px; margin: 20px 24px 0; align-items: flex-start; }
    .profile-subnav { width: 200px; flex-shrink: 0; background: var(--as-card); border-radius: 12px; box-shadow: 0 2px 12px rgba(13,43,78,.07); overflow: hidden; }
    .profile-subnav-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; font-size: .88rem; font-weight: 500; color: var(--as-muted); cursor: pointer; border-left: 3px solid transparent; transition: background .15s, color .15s, border-color .15s; border-bottom: 1px solid var(--as-border); }
    .profile-subnav-item:last-child { border-bottom: none; }
    .profile-subnav-item i { font-size: .95rem; width: 18px; text-align: center; color: var(--as-cyan); }
    .profile-subnav-item.active { background: var(--as-cyan-light); color: var(--as-navy); border-left-color: var(--as-cyan); font-weight: 600; }
    .profile-subnav-item:hover:not(.active) { background: #f8fafc; color: var(--as-navy); }
    .profile-section-content { flex: 1; }
    .pf-card { background: var(--as-card); border-radius: 12px; box-shadow: 0 2px 12px rgba(13,43,78,.07); margin-bottom: 20px; overflow: hidden; }
    .pf-card-header { background: linear-gradient(90deg, var(--as-navy) 0%, var(--as-blue) 100%); padding: 12px 20px; display: flex; align-items: center; gap: 10px; }
    .pf-card-header i { color: var(--as-cyan); font-size: 1rem; }
    .pf-card-header h5 { margin: 0; color: var(--as-white); font-size: .95rem; font-weight: 600; letter-spacing: .3px; flex: 1; }
    .pf-edit-btn { background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.35); color: var(--as-white); font-size: .75rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; cursor: pointer; transition: background .2s, border-color .2s; display: flex; align-items: center; gap: 5px; white-space: nowrap; }
    .pf-edit-btn:hover { background: rgba(0,180,216,.35); border-color: var(--as-cyan); }
    .pf-edit-btn i { font-size: .75rem; color: var(--as-white); }
    .pf-card-body { padding: 20px; }
    .pf-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px 24px; }
    .pf-info-item { display: flex; flex-direction: column; gap: 3px; }
    .pf-info-item .pf-label { font-size: .72rem; text-transform: uppercase; letter-spacing: .6px; color: var(--as-muted); font-weight: 600; }
    .pf-info-item .pf-value { font-size: .9rem; font-weight: 500; color: var(--as-text); }
    .pf-value a { color: var(--as-blue); text-decoration: none; }
    .pf-value a:hover { color: var(--as-cyan); text-decoration: underline; }
    .pf-divider { border: none; border-top: 1px solid var(--as-border); margin: 16px 0; }
    .profile-main-panel { display: none; }
    .profile-main-panel.active { display: block; }
    .profile-sub-panel { display: none; }
    .profile-sub-panel.active { display: block; }
    .profile-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 2px; }
    .profile-name-row h3 { margin: 0; }
    .profile-contact-pills { display: flex; flex-direction: column; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
    .profile-contact-pill { display: inline-flex; align-items: center; gap: 5px; font-size: .8rem; color: var(--as-muted); }
    .profile-contact-pill i { color: var(--as-cyan); font-size: .8rem; }
    .profile-mgr-dept { display: flex; flex-direction: column; gap: 14px; padding-bottom: 12px; min-width: 140px; flex-shrink: 0; }
    .pmd-block { display: flex; flex-direction: column; gap: 6px; }
    .pmd-label { font-size: .7rem; text-transform: uppercase; letter-spacing: .5px; color: var(--as-muted); font-weight: 600; }
    .pmd-avatars { display: flex; align-items: center; gap: 4px; }
    .pmd-scrollable { max-width: 160px; overflow-x: auto; flex-wrap: nowrap; scrollbar-width: thin; scrollbar-color: var(--as-border) transparent; padding-bottom: 4px; }
    .pmd-avatar-item { width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--as-white); box-shadow: 0 1px 4px rgba(0,0,0,.15); overflow: hidden; flex-shrink: 0; cursor: default; background: linear-gradient(135deg, var(--as-navy), var(--as-cyan)); }
    .pmd-avatar-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }
    .pmd-initials { width: 100%; height: 100%; background: linear-gradient(135deg, var(--as-navy), var(--as-cyan)); color: var(--as-white); font-size: .6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .pmd-none { font-size: .82rem; color: var(--as-muted); }
    /* Modal */
    .pf-modal-overlay { display: none; position: fixed; inset: 0; background: rgba(13,43,78,.45); z-index: 9999; align-items: center; justify-content: center; }
    .pf-modal-overlay.open { display: flex; }
    .pf-modal { background: var(--as-white); border-radius: 16px; box-shadow: 0 8px 40px rgba(13,43,78,.22); width: 100%; max-width: 580px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; margin: 16px; }
    .pf-modal-header { background: linear-gradient(90deg, var(--as-navy) 0%, var(--as-blue) 100%); padding: 16px 22px; display: flex; align-items: center; gap: 10px; }
    .pf-modal-header i { color: var(--as-cyan); font-size: 1.1rem; }
    .pf-modal-header h5 { margin: 0; color: var(--as-white); font-size: 1rem; font-weight: 700; flex: 1; }
    .pf-modal-close { background: none; border: none; color: rgba(255,255,255,.7); font-size: 1.3rem; cursor: pointer; line-height: 1; padding: 0; transition: color .2s; }
    .pf-modal-close:hover { color: var(--as-white); }
    .pf-modal-body { padding: 24px 22px; overflow-y: auto; flex: 1; }
    .pf-modal-footer { padding: 14px 22px; border-top: 1px solid var(--as-border); display: flex; justify-content: flex-end; gap: 10px; background: #f8fafc; }
    .pf-form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .pf-form-group { display: flex; flex-direction: column; gap: 5px; }
    .pf-form-group.full-width { grid-column: 1 / -1; }
    .pf-form-label { font-size: .75rem; text-transform: uppercase; letter-spacing: .5px; color: var(--as-muted); font-weight: 600; }
    .pf-form-control { border: 1.5px solid var(--as-border); border-radius: 8px; padding: 8px 12px; font-size: .88rem; color: var(--as-text); outline: none; transition: border-color .2s, box-shadow .2s; background: var(--as-white); width: 100%; box-sizing: border-box; }
    .pf-form-control:focus { border-color: var(--as-cyan); box-shadow: 0 0 0 3px rgba(0,180,216,.12); }
    select.pf-form-control { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px; }
    .pf-btn-save { background: linear-gradient(90deg, var(--as-navy) 0%, var(--as-blue) 100%); color: var(--as-white); border: none; border-radius: 8px; padding: 9px 24px; font-size: .88rem; font-weight: 600; cursor: pointer; transition: opacity .2s; }
    .pf-btn-save:hover { opacity: .88; }
    .pf-btn-save:disabled { opacity: .6; cursor: not-allowed; }
    .pf-btn-cancel { background: transparent; color: var(--as-muted); border: 1.5px solid var(--as-border); border-radius: 8px; padding: 9px 20px; font-size: .88rem; font-weight: 600; cursor: pointer; transition: border-color .2s, color .2s; }
    .pf-btn-cancel:hover { border-color: var(--as-muted); color: var(--as-text); }
    .pf-toast { position: fixed; bottom: 28px; right: 28px; z-index: 99999; background: var(--as-navy); color: var(--as-white); padding: 12px 22px; border-radius: 10px; font-size: .88rem; font-weight: 600; box-shadow: 0 4px 20px rgba(13,43,78,.25); opacity: 0; transform: translateY(16px); transition: opacity .3s, transform .3s; pointer-events: none; }
    .pf-toast.show { opacity: 1; transform: translateY(0); }
    .pf-toast.success { background: #1a7f4b; }
    .pf-toast.error { background: #c0392b; }
</style>

<div class="profile-page-wrap">
    <div class="profile-cover"></div>
    <div class="profile-card">
        <div class="profile-card-top">
            <div class="profile-avatar-wrap">
                <div class="profile-avatar">
                    {{#if avatarUrl}}
                        <img src="{{avatarUrl}}" alt="{{userName}}">
                    {{else}}
                        {{userInitials}}
                    {{/if}}
                </div>
            </div>
            <div class="profile-header-info">
                <div class="profile-name-row"><h3>{{userName}}</h3></div>
                <p class="profile-role">{{designation}}</p>
                <div class="profile-contact-pills">
                    <div class="profile-contact-pill"><i class="fa fa-envelope"></i> {{userEmail}}</div>
                    <div class="profile-contact-pill"><i class="fa fa-sitemap"></i> {{department}}</div>
                </div>
            </div>
            <div class="profile-mgr-dept">
                <div class="pmd-block">
                    <div class="pmd-label">Reporting Manager</div>
                    <div class="pmd-avatars">
                        {{#with managerData}}
                        <div class="pmd-avatar-item" title="{{name}}">
                            <img src="?entryPoint=avatar&size=small&id={{id}}" alt="{{name}}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                            <span class="pmd-initials" style="display:none;">{{initials}}</span>
                        </div>
                        {{else}}<span class="pmd-none">--</span>{{/with}}
                    </div>
                </div>
                <div class="pmd-block">
                    <div class="pmd-label">Department</div>
                    <div class="pmd-avatars pmd-scrollable">
                        {{#if hasTeamMembers}}
                            {{#each teamMembers}}
                            <div class="pmd-avatar-item" title="{{name}}">
                                <img src="?entryPoint=avatar&size=small&id={{id}}" alt="{{name}}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                                <span class="pmd-initials" style="display:none;">{{initials}}</span>
                            </div>
                            {{/each}}
                        {{else}}<span class="pmd-none">--</span>{{/if}}
                    </div>
                </div>
            </div>
        </div>
        <div class="profile-main-tabs">
            <button class="profile-main-tab active" data-main-tab="personal-data">Personal Data</button>
            <button class="profile-main-tab" data-main-tab="work-profile">Work Profile</button>
            <button class="profile-main-tab" data-main-tab="documents">Documents</button>
        </div>
    </div>

    <!-- PERSONAL DATA PANEL -->
    <div class="profile-main-panel active" id="panel-personal-data">
        <div class="profile-content-row">
            <div class="profile-subnav">
                <div class="profile-subnav-item active" data-sub-tab="bio-data"><i class="fa fa-user"></i> Bio-Data</div>
                <div class="profile-subnav-item" data-sub-tab="address"><i class="fa fa-map-marker"></i> Address</div>
                <div class="profile-subnav-item" data-sub-tab="contact"><i class="fa fa-phone"></i> Contact</div>
                <div class="profile-subnav-item" data-sub-tab="dependents"><i class="fa fa-users"></i> Dependents</div>
            </div>
            <div class="profile-section-content">

                <!-- BIO-DATA -->
                <div class="profile-sub-panel active" id="sub-bio-data">
                    <div class="pf-card">
                        <div class="pf-card-header">
                            <i class="fa fa-id-card"></i><h5>About</h5>
                            <button class="pf-edit-btn" data-edit-section="about" data-action="editAbout" ><i class="fa fa-pencil"></i> </button>
                        </div>
                        <div class="pf-card-body">
                            <div class="pf-info-grid">
                                <div class="pf-info-item"><span class="pf-label">Full Name</span><span class="pf-value" id="pf-val-userName">{{userName}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Gender</span><span class="pf-value" id="pf-val-gender">{{userGender}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Blood Group</span><span class="pf-value" id="pf-val-bloodGroup">{{userBloodGroup}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Marital Status</span><span class="pf-value" id="pf-val-maritalStatus">{{userMaritalStatus}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Date of Birth</span><span class="pf-value" id="pf-val-dob">{{userDob}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Date of Joining</span><span class="pf-value" id="pf-val-doj">{{userDoj}}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ADDRESS -->
                <div class="profile-sub-panel" id="sub-address">
                    <div class="pf-card">
                        <div class="pf-card-header">
                            <i class="fa fa-map-marker"></i><h5>Address Information</h5>
                        </div>
                        <div class="pf-card-body">
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                                <p class="pf-label" style="margin:0;letter-spacing:.7px;">PERMANENT ADDRESS</p>
                                <button class="pf-edit-btn" data-edit-section="permanent-address" data-action="editPermanentAddress" style="background:rgba(13,43,78,.08);border-color:var(--as-border);color:var(--as-navy);"><i class="fa fa-pencil" style="color:var(--as-navy);"></i> </button>
                            </div>
                            <div class="pf-info-grid">
                                <div class="pf-info-item" style="grid-column:1/-1;"><span class="pf-label">Street</span><span class="pf-value" id="pf-val-permStreet">{{userPermStreet}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">City</span><span class="pf-value" id="pf-val-permCity">{{userPermCity}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">State</span><span class="pf-value" id="pf-val-permState">{{userPermState}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Postal Code</span><span class="pf-value" id="pf-val-permPostal">{{userPermPostal}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Country</span><span class="pf-value" id="pf-val-permCountry">{{userPermCountry}}</span></div>
                            </div>
                            <hr class="pf-divider">
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                                <p class="pf-label" style="margin:0;letter-spacing:.7px;">CURRENT ADDRESS</p>
                                <button class="pf-edit-btn" data-edit-section="current-address" data-action="editCurrentAddress" style="background:rgba(13,43,78,.08);border-color:var(--as-border);color:var(--as-navy);"><i class="fa fa-pencil" style="color:var(--as-navy);"></i> </button>
                            </div>
                            <div class="pf-info-grid">
                                <div class="pf-info-item" style="grid-column:1/-1;"><span class="pf-label">Street</span><span class="pf-value" id="pf-val-currStreet">{{userCurrStreet}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">City</span><span class="pf-value" id="pf-val-currCity">{{userCurrCity}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">State</span><span class="pf-value" id="pf-val-currState">{{userCurrState}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Postal Code</span><span class="pf-value" id="pf-val-currPostal">{{userCurrPostal}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Country</span><span class="pf-value" id="pf-val-currCountry">{{userCurrCountry}}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CONTACT -->
                <div class="profile-sub-panel" id="sub-contact">
                    <div class="pf-card">
                        <div class="pf-card-header">
                            <i class="fa fa-phone"></i><h5>Contact Details</h5>
                            <button class="pf-edit-btn" data-edit-section="contact"><i class="fa fa-pencil"></i> </button>
                            <button class="pf-edit-btn" data-edit-section="contact"><i class="fa fa-plus"></i> </button>
                        </div>
                        <div class="pf-card-body">
                            <div class="pf-info-grid">
                                <div class="pf-info-item"><span class="pf-label">Phone</span><span class="pf-value" id="pf-val-phone">{{#if userPhone}}<a href="tel:{{userPhone}}">{{userPhone}}</a>{{else}}--{{/if}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Email</span><span class="pf-value" id="pf-val-email">{{#if userEmail}}<a href="mailto:{{userEmail}}">{{userEmail}}</a>{{else}}--{{/if}}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DEPENDENTS -->
                <div class="profile-sub-panel" id="sub-dependents">
                    <div class="pf-card">
                        <div class="pf-card-header">
                            <i class="fa fa-users"></i><h5>Dependents</h5>
                            <button class="pf-edit-btn" data-edit-section="contact"><i class="fa fa-pencil"></i> </button>
                            <button class="pf-edit-btn" data-edit-section="contact"><i class="fa fa-plus"></i> </button>
                        </div>
                        <div class="pf-card-body">
                            <p style="color:var(--as-muted);text-align:center;padding:20px 0;">
                                <i class="fa fa-users" style="font-size:2rem;color:var(--as-border);display:block;margin-bottom:8px;"></i>
                                No dependents added yet.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- WORK PROFILE PANEL -->
    <div class="profile-main-panel" id="panel-work-profile">
        <div class="profile-content-row">
            <div class="profile-subnav">
                <div class="profile-subnav-item active" data-sub-tab="wp-employment-details"><i class="fa fa-briefcase"></i> Employment Details</div>
                <div class="profile-subnav-item" data-sub-tab="wp-past-experience"><i class="fa fa-history"></i> Past Experience</div>
                <div class="profile-subnav-item" data-sub-tab="wp-salary-bank"><i class="fa fa-university"></i> Salary / Bank A/c</div>
            </div>
            <div class="profile-section-content">

                <!-- EMPLOYMENT DETAILS -->
                <div class="profile-sub-panel active" id="sub-wp-employment-details">
                    <div class="pf-card">
                        <div class="pf-card-header">
                            <i class="fa fa-briefcase"></i><h5>Employment Details</h5>
                            <button class="pf-edit-btn" data-edit-section="employment"><i class="fa fa-pencil"></i> </button>
                        </div>
                        <div class="pf-card-body">
                            <div class="pf-info-grid">
                                <div class="pf-info-item"><span class="pf-label">Department</span><span class="pf-value">{{department}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Designation</span><span class="pf-value">{{designation}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Date of Joining</span><span class="pf-value">{{userDoj}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Calender Type</span><span class="pf-value" id="pf-val-workLocation">{{userWorkLocation}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Work From Home</span><span class="pf-value" id="pf-val-wfh">{{userIsWFH}}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PAST EXPERIENCE -->
                <div class="profile-sub-panel" id="sub-wp-past-experience">
                    <div class="pf-card">
                        <div class="pf-card-header"><i class="fa fa-history"></i><h5>Past Experience</h5></div>
                        <div class="pf-card-body">
                            <p style="color:var(--as-muted);font-style:italic;text-align:center;padding:20px 0;">
                                <i class="fa fa-history" style="font-size:2rem;color:var(--as-border);display:block;margin-bottom:8px;"></i>
                                No past experience records found.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- SALARY / BANK -->
                <div class="profile-sub-panel" id="sub-wp-salary-bank">
                    <div class="pf-card">
                        <div class="pf-card-header">
                            <i class="fa fa-university"></i><h5>Salary Deposit Bank A/c</h5>
                            <button class="pf-edit-btn" data-edit-section="bank"><i class="fa fa-pencil"></i> </button>
                        </div>
                        <div class="pf-card-body">
                            <div class="pf-info-grid">
                                <div class="pf-info-item"><span class="pf-label">Bank Name</span><span class="pf-value" id="pf-val-bankName">{{userBankName}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Account Number</span><span class="pf-value" id="pf-val-accountNumber">{{userAccountNumber}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">IFSC Code</span><span class="pf-value" id="pf-val-ifscCode">{{userIfscCode}}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- DOCUMENTS PANEL -->
    <div class="profile-main-panel" id="panel-documents">
        <div class="profile-content-row">
            <div class="profile-subnav">
                <div class="profile-subnav-item active" data-sub-tab="doc-aadhaar"><i class="fa fa-address-card"></i> Aadhaar</div>
                <div class="profile-subnav-item" data-sub-tab="doc-driving-licence"><i class="fa fa-id-card"></i> Driving Licence</div>
                <div class="profile-subnav-item" data-sub-tab="doc-pan-card"><i class="fa fa-credit-card"></i> PAN Card</div>
                <div class="profile-subnav-item" data-sub-tab="doc-passport"><i class="fa fa-globe"></i> Passport</div>
                <div class="profile-subnav-item" data-sub-tab="doc-voter-id"><i class="fa fa-check-square"></i> Voter ID</div>
            </div>
            <div class="profile-section-content">

                <!-- AADHAAR -->
                <div class="profile-sub-panel active" id="sub-doc-aadhaar">
                    <div class="pf-card">
                        <div class="pf-card-header">
                            <i class="fa fa-address-card"></i><h5>Aadhaar</h5>
                            <button class="pf-edit-btn" data-edit-section="aadhaar"><i class="fa fa-pencil"></i> </button>
                        </div>
                        <div class="pf-card-body">
                            <div class="pf-info-grid">
                                <div class="pf-info-item"><span class="pf-label">Name as per Aadhaar</span><span class="pf-value" id="pf-val-aadhaarName">{{userAadhaarName}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Aadhaar Number</span><span class="pf-value" id="pf-val-aadhaarNumber">{{userAadhaarNumber}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Aadhaar Enrollment Number</span><span class="pf-value" id="pf-val-aadhaarEnrollment">{{userAadhaarEnrollment}}</span></div>
                                <div class="pf-info-item" style="grid-column:1/-1;"><span class="pf-label">Address as per Aadhaar</span><span class="pf-value" id="pf-val-aadhaarAddress">{{userAadhaarAddress}}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DRIVING LICENCE -->
                <div class="profile-sub-panel" id="sub-doc-driving-licence">
                    <div class="pf-card">
                        <div class="pf-card-header">
                            <i class="fa fa-id-card"></i><h5>Driving Licence</h5>
                            <button class="pf-edit-btn" data-edit-section="dl"><i class="fa fa-pencil"></i> </button>
                        </div>
                        <div class="pf-card-body">
                            <div class="pf-info-grid">
                                <div class="pf-info-item"><span class="pf-label">Licence Number</span><span class="pf-value" id="pf-val-dlNumber">{{userDlNumber}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Expiry Date</span><span class="pf-value" id="pf-val-dlExpiry">{{userDlExpiry}}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PAN CARD -->
                <div class="profile-sub-panel" id="sub-doc-pan-card">
                    <div class="pf-card">
                        <div class="pf-card-header">
                            <i class="fa fa-credit-card"></i><h5>PAN Card</h5>
                            <button class="pf-edit-btn" data-edit-section="pan"><i class="fa fa-pencil"></i> </button>
                        </div>
                        <div class="pf-card-body">
                            <div class="pf-info-grid">
                                <div class="pf-info-item"><span class="pf-label">Name as per PAN</span><span class="pf-value" id="pf-val-panName">{{userPanName}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">PAN Number</span><span class="pf-value" id="pf-val-panNumber">{{userPanNumber}}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PASSPORT -->
                <div class="profile-sub-panel" id="sub-doc-passport">
                    <div class="pf-card">
                        <div class="pf-card-header">
                            <i class="fa fa-globe"></i><h5>Passport</h5>
                            <button class="pf-edit-btn" data-edit-section="passport"><i class="fa fa-pencil"></i> Edit</button>
                        </div>
                        <div class="pf-card-body">
                            <div class="pf-info-grid">
                                <div class="pf-info-item"><span class="pf-label">Passport Number</span><span class="pf-value" id="pf-val-passportNumber">{{userPassportNumber}}</span></div>
                                <div class="pf-info-item"><span class="pf-label">Expiry Date</span><span class="pf-value" id="pf-val-passportExpiry">{{userPassportExpiry}}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- VOTER ID -->
                <div class="profile-sub-panel" id="sub-doc-voter-id">
                    <div class="pf-card">
                        <div class="pf-card-header">
                            <i class="fa fa-check-square"></i><h5>Voter ID</h5>
                            <button class="pf-edit-btn" data-edit-section="voterid"><i class="fa fa-pencil"></i> </button>
                        </div>
                        <div class="pf-card-body">
                            <div class="pf-info-grid">
                                <div class="pf-info-item"><span class="pf-label">Voter ID Number</span><span class="pf-value" id="pf-val-voterIdNumber">{{userVoterIdNumber}}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>

<!-- EDIT MODAL -->
<div class="pf-modal-overlay" id="pf-edit-modal">
    <div class="pf-modal">
        <div class="pf-modal-header">
            <i class="fa fa-pencil" id="pf-modal-icon"></i>
            <h5 id="pf-modal-title">Edit</h5>
            <button class="pf-modal-close" id="pf-modal-close-btn">&times;</button>
        </div>
        <div class="pf-modal-body">
            <div class="pf-form-grid" id="pf-modal-form-grid"></div>
        </div>
        <div class="pf-modal-footer">
            <button class="pf-btn-cancel" id="pf-modal-cancel-btn">Cancel</button>
            <button class="pf-btn-save" id="pf-modal-save-btn"><i class="fa fa-save"></i> Save Changes</button>
        </div>
    </div>
</div>

<div class="pf-toast" id="pf-toast"></div>
