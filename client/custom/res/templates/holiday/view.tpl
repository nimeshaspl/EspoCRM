<style>
    .wrapper {
        width: 100%;
        margin: 12px auto;
        background: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    h1 {
        text-align: center;
        color: #2c3e50;
    }

    .holiday-section {
        max-width: 1000px;
        margin: 30px auto;
    }

    .section-title {
        font-size: 1.5rem;
        color: #34495e;
        margin-bottom: 15px;
        border-left: 5px solid #3498db;
        padding-left: 10px;
    }

    .holiday-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
    }

    .holiday-card {
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: #ffffff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
    }

    .holidayImgContainer img {
        width: 100px;
        height: 100px;
        border-radius: 96px;
        margin-top: 10px;
    }

    .holiday-card:hover {
        transform: translateY(-5px);
        box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.15);
    }

    .holiday-name {
        font-weight: 600;
        font-size: 1.2rem;
        color: #2c3e50;
    }

    .holiday-date {
        color: #7f8c8d;
        margin: 5px 0 10px 0;
    }

    .holiday-status {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .selected {
        background-color: #2ecc71;
        color: white;
    }

    .not-selected {
        background-color: #e74c3c;
        color: white;
    }

    /* Table */
    .table-box {
        border: 1px solid #ddd;
        border-radius: 6px;
        overflow: hidden;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    thead {
        background: #eef1f5;
    }

    th,
    td {
        padding: 12px;
        text-align: center;
        border-bottom: 1px solid #ddd;
    }

    .no-data {
        color: #777;
    }
</style>


<h1>Company Holidays 2026</h1>

{{#if isAdmin}}
<div class="wrapper">
    <div class="panel panel-default" style="padding:10px;margin-bottom:15px;">
        <label><strong>Filter by Employee:</strong></label>
        <select id="employeeFilter" class="form-control">
            <option value="">Your</option>
            {{#each employeeList}}
            <option value="{{id}}" {{#if selected}}selected{{/if}}>
                {{name}}
            </option>
            {{/each}}
        </select>
    </div>
    <div>
        <a role="button" tabindex="0" class="btn btn-danger btn-xs-wide action" data-action="createHoliday">
            <span>Create Holiday</span>
        </a>
    </div>
</div>
{{/if}}

<div class="holiday-section">
    <div class="section-title">Optional Holidays</div>
    <div class="table-box">
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Holiday Selected ?</th>
                    <th colspan="2">Action</th>
                </tr>
            </thead>
            <tbody>
                {{#each holidayList}}
                {{#ifEqual type "Optional"}} <tr>
                    <td>{{name}}</td>
                    <td>{{formattedDate}}</td>
                    <td>{{dayName}}</td>
                    <td>{{statusText}} </td>
                    <th>
                        {{#ifEqual statusText 'Yes'}}
                        <a role="button" tabindex="0" class="btn btn-success btn-xs-wide" style="cursor: not-allowed;"
                            data-id="{{id}}" aria-disabled="true">
                            <span>Selected</span>
                        </a>
                        {{else}}
                        <a role="button" tabindex="0" class="btn btn-danger btn-xs-wide action"
                            data-action="selectOptionalHoliday" data-id="{{id}}">
                            <span>Select</span>
                        </a>
                        {{/ifEqual}}
                    </th>
                    <th>
                        {{#if ../isAdmin}}
                        <a role="button" tabindex="0" class="btn btn-danger btn-xs-wide action"
                            data-action="RedoSelectOptionalHoliday" data-id="{{id}}">
                            <span>Undo</span>
                        </a>
                        {{/if}}
                    </th>
                </tr>
                {{/ifEqual}}
                {{/each}}
                {{^holidayList}}
                <tr>
                    <td colspan="4">No records found</td>
                </tr>
                {{/holidayList}}
            </tbody>
        </table>
    </div>
    <div class="holiday-grid hidden">
        {{#each holidayList}}
        {{#ifEqual type "Optional"}}
        <div class="holiday-card">
            <div>
                <div class="holiday-name">{{name}}</div>
                <div class="holiday-date">{{dayName}}, {{formattedDate}}</div>
                <div class="holiday-status selected">
                    {{#if isSelected}}
                    Selected
                    {{else}}
                    Not Selected
                    {{/if}}
                </div>
            </div>
            <div class="holidayImgContainer">
                {{#if imageUrl}}
                <img src="{{imageUrl}}" alt="{{name}}">
                {{else}}
                <img src="client/img/utterayan.png" alt="Makar Sankranti">
                {{/if}}
            </div>
        </div>
        {{/ifEqual}}
        {{/each}}
    </div>
</div>


<div class="holiday-section">
    <div class="section-title">Mandatory Holidays</div>
    <div class="table-box">
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Day</th>
                </tr>
            </thead>
            <tbody>
                {{#each holidayList}}
                {{#ifEqual type "Mandatory"}}
                <tr>
                    <td>{{name}}</td>
                    <td>{{formattedDate}}</td>
                    <td>{{dayName}}</td>
                </tr>
                {{/ifEqual}}
                {{/each}}
                {{^holidayList}}
                <tr>
                    <td colspan="4">No records found</td>
                </tr>
                {{/holidayList}}
            </tbody>
        </table>
    </div>
    <div class="holiday-grid hidden">
        {{#each holidayList}}
        {{type}}
        {{#ifEqual type "Mandatory"}}
        <div class="holiday-card">
            <div>
                <div class="holiday-name">{{name}}</div>
                <div class="holiday-date">{{dayName}}, {{formattedDate}}</div>
                <div class="holiday-status selected">
                    {{#if isSelected}}
                    Selected
                    {{else}}
                    Not Selected
                    {{/if}}
                </div>
            </div>
            <div class="holidayImgContainer">
                {{#if imageUrl}}
                <img src="{{imageUrl}}" alt="{{name}}">
                {{else}}
                <img src="client/img/utterayan.png" alt="Makar Sankranti">
                {{/if}}
            </div>
        </div>
        {{/ifEqual}}
        {{/each}}
    </div>
</div>