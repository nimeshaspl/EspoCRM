<div style="background:#efeae2; border-radius:10px; overflow:hidden; border:1px solid #ddd;">

    <div style="background:#075e54; color:#fff; padding:10px 14px; font-weight:bold;">
        SMS Chat
    </div>

    <div style="height:350px; overflow-y:auto; padding:15px; background:#efeae2;">

        {{#each smsList}}
            <div style="display:flex; margin-bottom:10px; {{#ifEqual direction 'Outgoing'}}justify-content:flex-end;{{else}}justify-content:flex-start;{{/ifEqual}}">
                <div style="max-width:75%; padding:8px 10px; border-radius:10px; background:{{#ifEqual direction 'Outgoing'}}#dcf8c6{{else}}#ffffff{{/ifEqual}}; box-shadow:0 1px 1px rgba(0,0,0,0.15);">
                    <div style="font-size:14px; white-space:pre-wrap;">{{message}}</div>
                    <div style="font-size:10px; color:#777; text-align:right; margin-top:4px;">
                        {{createdAt}} {{#if status}} · {{status}}{{/if}}
                    </div>
                </div>
            </div>
        {{/each}}

        {{#unless smsList}}
            <div style="text-align:center; color:#777; margin-top:130px;">
                No SMS conversation yet.
            </div>
        {{/unless}}

    </div>

    <div style="display:flex; gap:8px; padding:10px; background:#f0f0f0;">
        <textarea data-name="message" class="form-control" style="height:42px; resize:none;" placeholder="Type SMS message..."></textarea>

        <button class="btn btn-primary" style="height:42px;" data-action="sendSms">
            Send
        </button>
    </div>

</div>