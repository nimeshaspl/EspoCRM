define('custom:views/cemployee/modals/create', ['views/modal'], function (Dep) {
    return Dep.extend({
        cssName: 'create-employee-modal',
        templateContent: `
            <div class="record">
                <div class="record-content">
                    <div style="background: white;">
                        <h2 style="text-align: center; margin-bottom: 30px;">Create Employee</h2>
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; font-weight: bold; margin-bottom: 10px;">Employee Name:</label>
                            <input class="form-control" name="name" placeholder="Enter name" style="font-size: 18px; padding: 15px; border-radius: 10px; border: none; width: 100%;">
                        </div>
                        <div style="text-align: center;">
                            <button class="btn btn-success btn-lg" data-action="save" style="font-size: 18px; padding: 15px 40px; margin-right: 10px;">💾 Save Employee</button>
                            <button class="btn btn-secondary btn-lg" data-action="cancel" style="font-size: 18px; padding: 15px 40px;">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `,

        events: {
            'click [data-action="save"]': function () { this.save(); },
            'click [data-action="cancel"]': function () { this.close(); }
        },

        setup: function () {
            Dep.prototype.setup.call(this);
            console.log('🔥 CUSTOM CREATE MODAL LOADED!');
            this.buttonList = [
                {
                    name: 'save',
                    text: 'Save Employee',
                    style: 'success'
                },
                {
                    name: 'cancel',
                    text: 'Cancel'
                }
            ];
            this.headerHtml = 'Create New Employee';
        },

        save: function () {
            var name = this.$('input[name="name"]').val().trim();
            if (!name) {
                Espo.Ui.notify('Name is required!', 'error');
                return;
            }

            $.ajax({
                url: 'api/v1/CEmployee',
                type: 'POST',
                data: JSON.stringify({ name: name }),
                contentType: 'application/json',
                success: () => {
                    Espo.Ui.success('Employee created successfully!');
                    this.trigger('close');
                    if (this.getParentView() && this.getParentView().collection) {
                        this.getParentView().collection.fetch();
                    }
                    this.close();
                },
                error: () => Espo.Ui.error('Save failed')
            });
        }
    });
});
