define('custom:hello-handler', ['views/list'], function (Dep) {
    return Dep.extend({
        // ===== INITIALIZATION METHODS =====
        initShowHello: function () {
            // Button will call clockInList directly, no special init needed
        },

        // ===== CLOCK IN ACTION =====
        hello: function () {
            console.log('*** HELLO BUTTON CLICKED **');
 
            // Create backdrop
            var backdropId = 'helloBackdrop-' + Date.now();
            var modalId = 'helloModal-' + Date.now();
           
            var backdropHtml = `<div id="${backdropId}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 9998;"></div>`;
           
            var modalHtml = `
                <div id="${modalId}" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; width: 90%; max-width: 500px;">
                    <div style="background: white; border-radius: 4px; box-shadow: 0 3px 12px rgba(0, 0, 0, 0.5); overflow: hidden;">
                        <div style="padding: 20px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                            <h5 style="margin: 0; color: #333; font-weight: 500;">Hello Message</h5>
                            <button class="modalCloseBtn" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0; color: #333;">×</button>
                        </div>
                        <div style="padding: 20px; color: #333; line-height: 1.6;">
                            <p>This is a simple modal opened from the Hello button.</p>
                        </div>
                        <div style="padding: 15px 20px; border-top: 1px solid #e9ecef; text-align: right;">
                            <button class="modalCloseBtn" style="background-color: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 3px; cursor: pointer; font-size: 14px;">Close</button>
                        </div>
                    </div>
                </div>
            `;
 
            // Remove any existing hello modals
            $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').remove();
 
            // Add backdrop and modal to body
            $(backdropHtml).appendTo('body');
            var $modal = $(modalHtml).appendTo('body');
 
            // Close button functionality
            $(document).on('click', '.modalCloseBtn', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').fadeOut(300, function() {
                    $(this).remove();
                });
                $(document).off('click', '.modalCloseBtn');
                $(document).off('click', '#' + backdropId);
            });
 
            // Close on backdrop click
            $(document).on('click', '#' + backdropId, function(e) {
                if (e.target.id === backdropId) {
                    $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').fadeOut(300, function() {
                        $(this).remove();
                    });
                    $(document).off('click', '.modalCloseBtn');
                    $(document).off('click', '#' + backdropId);
                }
            });
 
            console.log('Modal overlay displayed:', modalId);
        },
        initShowRole: function () {
            // No init needed
        },

        showRole: function () {
    console.log('*** SHOW ROLE BUTTON CLICKED ***');
    
    // ✅ DIRECT API CALL - Bypasses ALL context issues
    Espo.Ajax.getRequest('App/user').then(function(response) {
        console.log('API Response:', response);
        
        var userName = response.user.name || 'Unknown';
        var rolesObj = response.rolesNames || {};
        var roleList = Object.keys(rolesObj).map(function(id) {
            return rolesObj[id];
        });
        
        alert('User: ' + userName + '\nRoles: ' + (roleList.join(', ') || 'None'));
    }).catch(function(xhr) {
        console.log('API Error:', xhr);
        alert('API Error - Check Console (F12)');
    });
}








    });
});
