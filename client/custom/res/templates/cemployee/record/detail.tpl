<style>
    .profile-header-card {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 25px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    }

    .avatar-img {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        border: 4px solid #eee;
        object-fit: cover;
    }

    .header-meta {
        display: flex;
        gap: 20px;
        margin-top: 15px;
        flex-wrap: wrap;
    }

    .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #555;
        font-size: 13.5px;
    }

    .meta-item i {
        color: #0085ff;
        width: 18px;
        text-align: center;
    }

    /* HORIZONTAL TOP TABS */
    .horiz-tab-container {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px 8px 0 0;
        display: flex;
        border-bottom: none;
    }

    .top-tab {
        padding: 15px 30px;
        font-size: 12px;
        font-weight: bold;
        color: #999;
        text-transform: uppercase;
        cursor: pointer;
        border-bottom: 3px solid transparent;
    }

    .top-tab.active {
        color: #0085ff;
        border-bottom-color: #0084ff;
    }

    /* NESTED LAYOUT */
    .doc-layout {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 0 0 8px 8px;
        display: flex;
        min-height: 450px;
        overflow: hidden;
    }

    .doc-sidebar {
        width: 200px;
        border-right: 1px solid #eee;
        background: #fafafa;
        padding-top: 10px;
    }

    .side-link {
        padding: 12px 25px;
        font-size: 13.5px;
        color: #666;
        cursor: pointer;
        border-left: 4px solid transparent;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .side-link.active {
        color: #0085ff;
        background: #f0f7ff;
        border-left-color: #0085ff;
        font-weight: bold;
    }

    .doc-main {
        flex: 1;
        padding: 30px;
        position: relative;
    }

    /* ACTION BUTTONS + HEADING CONTAINER */
    .tab-action-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        gap: 20px;
    }

    .tab-section-title {
        color: #0085ff;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 14px;
        margin: 0;
        padding: 0;
        flex: 1;
    }

    .tab-action-buttons {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
    }

    .sec-header {
        color: #0085ff;
        font-weight: 700;
        border-bottom: 1px solid #f1f1f1;
        padding-bottom: 10px;
        margin-bottom: 20px;
        text-transform: uppercase;
        display: none;
    }

    .edit-tab-btn {
        background: linear-gradient(135deg, #0085ff 0%, #0070dd 100%);
        color: white;
        border: none;
        padding: 8px 24px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 133, 255, 0.3);
    }

    .edit-tab-btn:hover {
        background: linear-gradient(135deg, #0070dd 0%, #005cc4 100%);
        box-shadow: 0 4px 12px rgba(0, 133, 255, 0.4);
        transform: translateY(-2px);
    }

    .edit-tab-btn:active {
        transform: translateY(0);
        box-shadow: 0 1px 4px rgba(0, 133, 255, 0.3);
    }

    .save-tab-btn {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        border: none;
        padding: 8px 24px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }

    .save-tab-btn:hover {
        background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        transform: translateY(-2px);
    }

    .cancel-tab-btn {
        background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
        color: white;
        border: none;
        padding: 8px 24px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
    }

    .cancel-tab-btn:hover {
        background: linear-gradient(135deg, #da190b 0%, #ba0000 100%);
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
        transform: translateY(-2px);
    }

    .doc-pane.hidden {
        display: none !important;
    }

    .module-pane.hidden {
        display: none !important;
    }

    .sec-header {
        color: #0085ff;
        font-weight: 700;
        border-bottom: 1px solid #f1f1f1;
        padding-bottom: 10px;
        margin-bottom: 20px;
        text-transform: uppercase;
    }

    .label-sm {
        color: #999;
        font-size: 11px;
        margin-top: 12px;
        text-transform: uppercase;
    }

    .val-md {
        color: #333;
        font-size: 14px;
        font-weight: 500;
        min-height: 20px;
        border-bottom: 1px solid transparent;
    }

    .inline-edit-input {
        border: 1px solid #0085ff;
        padding: 4px;
        border-radius: 4px;
    }

    /* FORCE FULL WIDTH DETAIL VIEW */
    .record-grid {
        display: block !important;
        width: 100% !important;
    }

    .record-grid>.left {
        width: 100% !important;
        max-width: 100% !important;
        flex: none !important;
    }

    .record-grid>.side {
        display: none !important;
    }

    .record-grid .middle {
        width: 100% !important;
        max-width: 100% !important;
    }

    /* Active Bank Details */
    .activeBankDetailsContainer {
        margin: 20px 0;
        padding: 20px;
    }

    .bank-card {
        width: 100%;
        background: #fff;
        border-radius: 10px;
        border: 1px solid #e3e6ef;
        padding: 22px;
        position: relative;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #e9f7f6;
        color: #2a8a86;
        font-size: 13px;
        padding: 4px 10px;
        border-radius: 16px;
        margin-bottom: 12px;
    }

    .badge-icon {
        font-size: 12px;
    }

    .edit-btn {
        position: absolute;
        right: 16px;
        top: 16px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid #cfd6e4;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4b6cb7;
        cursor: pointer;
    }

    .edit-btn:hover {
        background: #f2f5ff;
    }

    .bank-details {
        margin-top: 6px;
    }

    .bank-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 6px;
    }

    .account,
    .ifsc {
        font-size: 14px;
        color: #555;
    }
</style>

<div class="detail" id="{{id}}" data-scope="{{scope}}" tabindex="-1">

    {{! --- TOP BUTTON BAR --- }}
    {{#unless buttonsDisabled}}
    <div class="detail-button-container button-container record-buttons">
        <div class="sub-container clearfix">
            <div class="btn-group actions-btn-group" role="group">
                {{#each buttonList}}
                {{button name scope=../entityType label=label labelTranslation=labelTranslation style=style
                hidden=hidden html=html title=title text=text className='btn-xs-wide detail-action-item'
                disabled=disabled}}
                {{/each}}
                {{#if dropdownItemList}}
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span
                        class="fas fa-ellipsis-h"></span></button>
                <ul class="dropdown-menu pull-left">
                    {{#each dropdownItemList}}
                    {{#if this}}{{dropdownItem name scope=../entityType label=label labelTranslation=labelTranslation
                    html=html title=title text=text hidden=hidden disabled=disabled data=data
                    className='detail-action-item'}}{{else}}<li class="divider"></li>{{/if}}
                    {{/each}}
                </ul>
                {{/if}}
            </div>
            {{#if navigateButtonsEnabled}}
            <div class="pull-right">
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-text btn-icon action" data-action="previous"
                        title="{{translate 'Previous'}}" {{#unless previousButtonEnabled}}disabled{{/unless}}><span
                            class="fas fa-chevron-left"></span></button>
                    <button type="button" class="btn btn-text btn-icon action" data-action="next"
                        title="{{translate 'Next'}}" {{#unless nextButtonEnabled}}disabled{{/unless}}><span
                            class="fas fa-chevron-right"></span></button>
                </div>
            </div>
            {{/if}}
        </div>
    </div>

    <div class="detail-button-container button-container edit-buttons hidden">
        <div class="sub-container clearfix">
            <div class="btn-group actions-btn-group" role="group">
                {{#each buttonEditList}}
                {{button name scope=../entityType label=label labelTranslation=labelTranslation style=style
                hidden=hidden html=html title=title text=text className='btn-xs-wide edit-action-item'
                disabled=disabled}}
                {{/each}}
            </div>
        </div>
    </div>
    {{/unless}}
    <div class="record-grid">
        <div class="left">
            <div class="profile-header-card">
                <div class="header-left "
                    style="display: flex;justify-content: center;gap: 50px;align-items: center;width: 100%;">
                    <img class="avatar-img"
                        src="{{#if model.attributes.profileId}}?entryPoint=image&id={{model.attributes.profileId}}{{else}}https://ui-avatars.com/api/?name={{model.attributes.name}}&background=random{{/if}}">
                    <div class="employee-info">
                        <h2>{{model.attributes.name}} <span class="badge-current"
                                style="background: #e0f2f1; color: #00897b; font-size: 11px; padding: 3px 12px; border-radius: 20px;">Current
                                employee</span></h2>
                        <div class="header-meta" style="display: flex; flex-direction: column; flex-wrap:wrap;">
                            <div class="meta-item"><i class="fas fa-laptop-code"></i> <b>Role:</b>
                                {{model.attributes.workRoleName}}</div>
                            <div class="meta-item"><i class="fas fa-sitemap"></i> <b>Dept:</b>
                                {{model.attributes.departmentName}}</div>
                            <div class="meta-item"><i class="fas fa-user-check"></i> <b>Assigned:</b>
                                {{model.attributes.assignedUserName}}</div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Active Bank Details Container -->
            <div class="activeBankDetailsContainer">
                <div class="bank-card">

                    <div class="badge">
                        <span class="badge-icon">💳</span>
                        Salary Deposit Bank A/c
                    </div>

                    <div class="edit-btn changeActiveBank">
                        <i class="fa-solid fa-pen"></i>
                    </div>

                    <div class="bank-details" id="active-bank-details">
                        <div class="bank-name">--</div>
                        <div class="account">--</div>
                        <div class="ifsc">--</div>
                    </div>

                </div>
            </div>
            <!-- HORIZONTAL TOP TABS -->
            <div class="horiz-tab-container doc-tabs-layout">
                <div class="top-tab active" data-target="mod-personal">Personal Data</div>
                <div class="top-tab" data-target="mod-work">Work Profile</div>
                <div class="top-tab" data-target="mod-docs">Documents</div>
            </div>

            <div class="doc-layout doc-tabs-layout">
                <!-- NESTED SIDEBARS (These switch based on Top Tab) -->
                <div class="doc-sidebar">
                    <!-- Sidebar for Personal Data -->
                    <div class="sidebar-group" data-module="mod-personal">
                        <div class="side-link active" data-target="bio-data"><i class="fas fa-user"></i> Bio-data</div>
                        <div class="side-link" data-target="address"><i class="fas fa-map-marker-alt"></i> Address</div>
                        <div class="side-link" data-target="contact"><i class="fas fa-phone"></i> Contact</div>
                        <div class="side-link" data-target="dependents"><i class="fas fa-users"></i> Dependents</div>

                    </div>
                    <!-- Sidebar for Work Profile -->
                    <div class="sidebar-group hidden" data-module="mod-work">
                        <div class="side-link" data-target="past-experience"><i class="fas fa-history"></i> Past
                            Experience</div>
                    </div>
                    <!-- Sidebar for Documents -->
                    <div class="sidebar-group hidden" data-module="mod-docs">
                        <div class="side-link" data-target="aadhaar"><i class="fas fa-address-card"></i> Aadhaar</div>
                        <div class="side-link" data-target="driving"><i class="fas fa-id-card"></i> Driving Licence
                        </div>
                        <div class="side-link" data-target="pan"><i class="fas fa-file-alt"></i> PAN Card</div>
                        <div class="side-link" data-target="passport"><i class="fas fa-passport"></i> Passport</div>
                        <div class="side-link" data-target="voter"><i class="fas fa-vote-yea"></i> Voter ID</div>
                    </div>
                </div>

                <div class="doc-main">
                    <!-- CONTENT PANES -->
                    <!-- PERSONAL DATA SECTIONS -->

                    <div class="doc-pane hidden" id="bio-data">
                        <h4 class="sec-header"
                            style="margin:0; border:none; color:#0085ff; font-weight:700; text-transform:uppercase;">
                            Bio-data</h4>
                        <div style="padding-left: 5px;">
                            <div class="label-sm" style="color:#aaa; font-size:10px; margin-top:15px; text-transform:uppercase;">Date of Birth</div> 
                            <!-- Using data-field allows our JavaScript to update these lines immediately after Save -->
                            <div class="f-val" data-field="dateOfBirth" style="font-weight:600; font-size:14px; color:#333; min-height:20px;">--</div>
                            <div class="label-sm" style="color:#aaa; font-size:10px; margin-top:10px; text-transform:uppercase;">Blood Group</div>
                            <div class="f-val" data-field="bloodGroup" style="font-weight:600; font-size:14px; color:#333; min-height:20px;">--</div>
                            <div class="label-sm" style="color:#aaa; font-size:10px; margin-top:10px; text-transform:uppercase;">Marital Status</div>
                            <div class="f-val" data-field="maritalStatus" style="font-weight:600; font-size:14px; color:#333; min-height:20px;">--</div>
                            <div class="label-sm" style="color:#aaa; font-size:10px; margin-top:10px; text-transform:uppercase;">Gender</div>
                            <div class="f-val" data-field="gender" style="font-weight:600; font-size:14px; color:#333; min-height:20px;">--</div>
                        </div>
                    </div>

                    <div class="doc-pane hidden" id="address">
                        <h4 class="sec-header"
                            style="margin:0; border:none; color:#0085ff; font-weight:700; text-transform:uppercase;">
                            Address Details</h4>

                        <!-- Updated Action to match our logic exactly -->
                        <div class="tab-action-buttons" id="address-action-buttons"
                            style="display: flex; justify-content: flex-end; flex-shrink: 0; margin-left: auto;">
                            <button class="btn btn-success btn-sm hidden" data-action="add-address-action"
                                id="add-address-btn" style="border-radius:4px; padding:6px 8px; min-width:32px;"
                                title="Add Address">
                                <i class="fas fa-plus"></i>
                            </button>

                            <button class="btn btn-primary btn-sm hidden" data-action="edit-address-action"
                                id="edit-address-btn"
                                style="border-radius:4px; padding:6px 8px; min-width:32px; margin-left:6px;"
                                title="Edit Address">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                        </div>

                        <div style="padding-left: 5px;">
                            <div class="label-sm"
                                style="color:#aaa; font-size:10px; margin-top:15px; text-transform:uppercase;">Address
                            </div>
                            <!-- Using data-field allows our JavaScript to update these lines immediately after Save -->
                            <div class="f-val" data-field="address"
                                style="font-weight:600; font-size:14px; color:#333; min-height:20px;">--</div>

                            <div class="label-sm"
                                style="color:#aaa; font-size:10px; margin-top:10px; text-transform:uppercase;">Address
                                Type</div>
                            <div class="f-val" data-field="addressType"
                                style="font-weight:600; font-size:14px; color:#333; min-height:20px;">--</div>

                            <div class="label-sm"
                                style="color:#aaa; font-size:10px; margin-top:10px; text-transform:uppercase;">City
                            </div>
                            <div class="f-val" data-field="city"
                                style="font-weight:600; font-size:14px; color:#333; min-height:20px;">--</div>

                            <div class="label-sm"
                                style="color:#aaa; font-size:10px; margin-top:10px; text-transform:uppercase;">State
                            </div>
                            <div class="f-val" data-field="state"
                                style="font-weight:600; font-size:14px; color:#333; min-height:20px;">--</div>

                            <div class="label-sm"
                                style="color:#aaa; font-size:10px; margin-top:10px; text-transform:uppercase;">Country
                            </div>
                            <div class="f-val" data-field="country"
                                style="font-weight:600; font-size:14px; color:#333; min-height:20px;">--</div>
                        </div>
                    </div>

                    <div class="doc-pane hidden" id="contact">
                        <h4 class="sec-header"
                            style="margin:0; border:none; color:#0085ff; font-weight:700; text-transform:uppercase;">
                            Contact Details</h4>

                        <!-- Updated Action to match our logic exactly -->
                        <div id="contact-edit-buttons"
                            style="display: flex; justify-content: flex-end; flex-shrink: 0; margin-left: auto;">
                            <button class="btn btn-success btn-sm hidden" data-action="add-contact-action"
                                id="add-contact-btn" title="Add Contact">
                                <i class="fas fa-plus"></i>
                            </button>

                            <button class="btn btn-primary btn-sm hidden" data-action="edit-contact-action"
                                id="edit-contact-btn" style="margin-left:6px;" title="Edit Contact">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                        </div>

                        <div class="label-sm">Contact Name</div>
                        <div class="val-md" data-field="contactName">--</div>

                        <div class="label-sm">Description</div> <!-- 'no' field -->
                        <div class="val-md" data-field="contactNumber">--</div>

                        <div class="label-sm">Contact Tag</div>
                        <div class="val-md" data-field="contactTag">--</div>

                        <div class="label-sm">Contact Type</div>
                        <div class="val-md" data-field="contactType">--</div>
                    </div>

                    <!-- DOCUMENTS SECTIONS -->
                    <!-- ✅ AADHAAR (Already Perfect) -->
                    <div class="doc-pane hidden" id="aadhaar">
                        <h4 class="sec-header"
                            style="margin:0; border:none; color:#0085ff; font-weight:700; text-transform:uppercase;">
                            Aadhaar Card Information
                        </h4>
                        <div style="display: flex; justify-content: flex-end; flex-shrink: 0; margin-left: auto;">
                            <button class="btn btn-primary btn-sm" data-action="edit-aadhaar-action"
                                style="border-radius:4px; font-weight:500; padding: 6px 8px; min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"
                                title="Edit">
                                <i class="fas fa-pencil-alt" style="font-size: 14px;"></i>
                            </button>
                        </div>
                        {{!-- <button class="btn btn-primary btn-sm" data-action="edit-aadhaar-action"
                            style="border-radius:4px; font-weight:500; padding:4px 15px;">
                            Edit
                        </button> --}}
                        <div style="display:flex; gap:25px; align-items:flex-start;">
                            <div style="flex:1;">
                                <div class="label-sm">Name as per Aadhaar</div>
                                <div class="val-md" data-field="aadharName">--</div>
                                <div class="label-sm">Aadhaar Enrollment Number</div>
                                <div class="val-md" data-field="adharEnrollementNumber">--</div>
                                <div class="label-sm">Aadhaar Number</div>
                                <div class="val-md" data-field="aadharNumber">--</div>
                                <div class="label-sm">Address as per Aadhaar</div>
                                <div class="val-md" data-field="addressAsPerAadhar">--</div>
                            </div>
                            <div style="width:180px; text-align:center;">
                                <div class="label-sm">Aadhaar Image</div>
                                <div class="doc-attachments live-doc-frame" data-field="aadharAttachments"
                                    style="margin-top:8px; overflow:visible;">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ✅ DRIVING LICENSE (Updated) -->
                    <div class="doc-pane hidden" id="driving">
                        <h4 class="sec-header"
                            style="margin:0; border:none; color:#0085ff; font-weight:700; text-transform:uppercase;">
                            Driving License
                        </h4>
                        <div style="display: flex; justify-content: flex-end; flex-shrink: 0; margin-left: auto;">
                            <button class="btn btn-primary btn-sm" data-action="edit-driving-action"
                                style="border-radius:4px; font-weight:500; padding: 6px 8px; min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"
                                title="Edit">
                                <i class="fas fa-pencil-alt" style="font-size: 14px;"></i>
                            </button>
                        </div>
                        {{!-- <button class="btn btn-primary btn-sm" data-action="edit-driving-action"
                            style="border-radius:4px; font-weight:500; padding:4px 15px;">
                            Edit
                        </button> --}}
                        <div style="display:flex; gap:25px; align-items:flex-start;">
                            <div style="flex:1;">
                                <div class="label-sm">License Number</div>
                                <div class="val-md" data-field="drivingLicenseNumber">--</div>
                                <div class="label-sm">Date Of Issue</div>
                                <div class="val-md" data-field="dateOfIssue">--</div>
                                <div class="label-sm">Expiry Date</div>
                                <div class="val-md" data-field="expiryDate">--</div>
                            </div>
                            <div style="width:180px; text-align:center;">
                                <div class="label-sm">License Image</div>
                                <div class="doc-attachments live-doc-frame" data-field="drivingAttachments"
                                    style="margin-top:8px; overflow:visible;">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ✅ PAN CARD (Updated) -->
                    <div class="doc-pane hidden" id="pan">
                        <h4 class="sec-header"
                            style="margin:0; border:none; color:#0085ff; font-weight:700; text-transform:uppercase;">
                            PAN Card
                        </h4>
                        <div style="display: flex; justify-content: flex-end; flex-shrink: 0; margin-left: auto;">
                            <button class="btn btn-primary btn-sm" data-action="edit-pan-action"
                                style="border-radius:4px; font-weight:500; padding: 6px 8px; min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"
                                title="Edit">
                                <i class="fas fa-pencil-alt" style="font-size: 14px;"></i>
                            </button>
                        </div>
                        {{!-- <button class="btn btn-primary btn-sm" data-action="edit-pan-action"
                            style="border-radius:4px; font-weight:500; padding:4px 15px;">
                            Edit
                        </button> --}}
                        <div style="display:flex; gap:25px; align-items:flex-start;">
                            <div style="flex:1;">
                                <div class="label-sm">PAN Number</div>
                                <div class="val-md" data-field="panCardNumber">--</div>
                                <div class="label-sm">Name as per PAN</div>
                                <div class="val-md" data-field="panName">--</div>
                                <div class="label-sm">Date of Birth</div>
                                <div class="val-md" data-field="panDob">--</div>
                            </div>
                            <div style="width:180px; text-align:center;">
                                <div class="label-sm">PAN Image</div>
                                <div class="doc-attachments live-doc-frame" data-field="panAttachments"
                                    style="margin-top:8px; overflow:visible;">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ✅ PASSPORT (Updated) -->
                    <div class="doc-pane hidden" id="passport">
                        <h4 class="sec-header"
                            style="margin:0; border:none; color:#0085ff; font-weight:700; text-transform:uppercase;">
                            Passport
                        </h4>
                        <div style="display: flex; justify-content: flex-end; flex-shrink: 0; margin-left: auto;">
                            <button class="btn btn-primary btn-sm" data-action="edit-passport-action"
                                style="border-radius:4px; font-weight:500; padding: 6px 8px; min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"
                                title="Edit">
                                <i class="fas fa-pencil-alt" style="font-size: 14px;"></i>
                            </button>
                        </div>
                        {{!-- <button class="btn btn-primary btn-sm" data-action="edit-passport-action"
                            style="border-radius:4px; font-weight:500; padding:4px 15px;">
                            Edit
                        </button> --}}
                        <div style="display:flex; gap:25px; align-items:flex-start;">
                            <div style="flex:1;">
                                <div class="label-sm">Passport Number</div>
                                <div class="val-md" data-field="passportNumber">--</div>
                                <div class="label-sm">Name as per Passport</div>
                                <div class="val-md" data-field="passportName">--</div>
                                <div class="label-sm">Date Of Issue</div>
                                <div class="val-md" data-field="passportDateOfIssue">--</div>
                                <div class="label-sm">Expiry Date</div>
                                <div class="val-md" data-field="passportExpiryDate">--</div>
                                <div class="label-sm">Place Of Birth</div>
                                <div class="val-md" data-field="passportPlaceOfBirth">--</div>
                            </div>
                            <div style="width:180px; text-align:center;">
                                <div class="label-sm">Passport Image</div>
                                <div class="doc-attachments live-doc-frame" data-field="passportAttachments"
                                    style="margin-top:8px; overflow:visible;">
                                </div>
                            </div>
                        </div>
                    </div>


                    <!-- Voter Id -->
                    <div class="doc-pane hidden" id="voter">
                        <h4 class="sec-header"
                            style="margin:0; border:none; color:#0085ff; font-weight:700; text-transform:uppercase;">
                            Election Card
                        </h4>
                        <div style="display: flex; justify-content: flex-end; flex-shrink: 0; margin-left: auto;">
                            <button class="btn btn-primary btn-sm" data-action="edit-voter-action"
                                style="border-radius:4px; font-weight:500; padding: 6px 8px; min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"
                                title="Edit">
                                <i class="fas fa-pencil-alt" style="font-size: 14px;"></i>
                            </button>
                        </div>
                        {{!-- <button class="btn btn-primary btn-sm" data-action="edit-voter-action"
                            style="border-radius:4px; font-weight:500; padding:4px 15px;">
                            Edit
                        </button> --}}
                        <div style="display:flex; gap:25px; align-items:flex-start;">
                            <div style="flex:1;">
                                <div class="label-sm">Voter ID Number</div>
                                <div class="val-md" data-field="voterIDNumber">--</div>
                                <div class="label-sm">Name as per Voter ID</div>
                                <div class="val-md" data-field="voterName">--</div>
                                <div class="label-sm">Date Of Birth</div>
                                <div class="val-md" data-field="voterDob">--</div>
                                <div class="label-sm">Father's Name</div>
                                <div class="val-md" data-field="voterFather">--</div>
                            </div>
                            <!-- RIGHT: IMAGE -->
                            <div style="width:180px; text-align:center;">
                                <div class="label-sm">Voter Image</div>
                                <div class="doc-attachments live-doc-frame" data-field="voterAttachments"
                                    style="margin-top:8px; overflow:visible;">
                                </div>
                            </div>
                        </div>
                    </div>


                    <!-- WORK PROFILE SECTIONS -->
                    <div class="doc-pane hidden" id="past-experience">
                        <h4 class="sec-header">Past Experience</h4>
                        <div class="past-experience-list"></div>
                    </div>

                    <div class="doc-pane hidden" id="dependents">
                        <h4 class="sec-header"
                            style="margin:0; border:none; color:#0085ff; font-weight:700; text-transform:uppercase;">
                            Dependents Information
                        </h4>
                        <div id="dependents-edit-buttons"
                            style="display: flex; justify-content: flex-end; flex-shrink: 0; margin-left: auto;">
                            <button class="btn btn-success btn-sm hidden" id="add-dependent-btn"
                                data-action="add-dependent-action" title="Add">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="btn btn-primary btn-sm hidden" data-action="edit-dependent-action"
                                id="edit-dependent-btn"
                                style="border-radius:4px; font-weight:500; padding: 6px 8px; min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"
                                title="Edit">
                                <i class="fas fa-pencil-alt" style="font-size: 14px;"></i>
                            </button>
                        </div>
                        <div class="dependents-list"></div>

                        <div class="label-sm">Dependent Name</div>
                        <div class="val-md" data-field="dependentName">--</div>

                        <span class="label-sm">Relation Of Employee</span>
                        <div class="val-md" data-field="dependentRelation">--</div>

                        <div class="label-sm">Date of Birth</div>
                        <div class="val-md" data-field="dependentDOB">--</div>

                        <div class="label-sm">Emergency Contact Number</div>
                        <div class="val-md" data-field="emergencyNumber">--</div>
                    </div>

                </div>
            </div>

            <div class="middle" style="margin-top:30px;">{{{middle}}}</div>
        </div>
        <div class="side">{{{side}}}</div>
    </div>
</div>

<script>
    // To handle the Top-Tab Switching to change Sidebars
    $('.top-tab').on('click', function () {
        const targetMod = $(this).data('target');
        $('.top-tab').removeClass('active');
        $(this).addClass('active');

        $('.sidebar-group').addClass('hidden');
        const $newSidebar = $('.sidebar-group[data-module="' + targetMod + '"]');
        $newSidebar.removeClass('hidden');

        // Auto click the first link in the new sidebar
        $newSidebar.find('.side-link').first().click();
    });

    // Handle sidebar link clicks to update title
    $('.side-link').on('click', function () {
        const targetPane = $(this).data('target');

        // Update active state
        $('.side-link').removeClass('active');
        $(this).addClass('active');

        // Hide all panes
        $('.doc-pane').addClass('hidden');

        // Show selected pane
        $('#' + targetPane).removeClass('hidden');

        // Get the heading from the pane and update the top title
        const paneHeading = $('#' + targetPane).find('.sec-header').text();
        if (paneHeading) {
            $('#current-section-title').text(paneHeading);
        }
    });
</script>