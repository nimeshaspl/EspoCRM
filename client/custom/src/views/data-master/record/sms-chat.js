define('custom:views/data-master/record/sms-chat', ['views/record/panels/bottom'], function (Dep) {

    return Dep.extend({

        template: 'custom:data-master/record/sms-chat',

        data: function () {
            return {
                smsList: this.smsList || []
            };
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.smsList = [];
            this.loadSms();
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            this.scrollToBottom();
        },

        events: {
            'click [data-action="sendSms"]': function () {
                this.sendSms();
            }
        },

        loadSms: function () {
            Espo.Ajax.getRequest('CSMS', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'dataMasterId',
                        value: this.model.id
                    }
                ],
                orderBy: 'createdAt',
                order: 'asc',
                maxSize: 100
            }).then(function (response) {
                this.smsList = response.list || [];
                this.reRender();
            }.bind(this));
        },

        sendSms: function () {
	    alert('NEW SMS CHAT JS LOADED');
            var message = this.$el.find('[data-name="message"]').val();

            if (!message || message.trim() === '') {
                return;
            }

            this.$el.find('[data-action="sendSms"]').prop('disabled', true);

            Espo.Ajax.postRequest('CSMS', {
 		name: 'SMS - ' + this.model.get('name') + ' - ' + new Date().toLocaleString(),
 		fromNumber: '+1992344822',
		toNumber: this.model.get('contactNo'),
                dataMasterId: this.model.id,
                dataMasterName: this.model.get('name'),
                direction: 'Outgoing',
                message: message.trim(),
                status: 'Draft'
            }).then(function () {
                this.$el.find('[data-name="message"]').val('');
                this.loadSms();
            }.bind(this)).always(function () {
                this.$el.find('[data-action="sendSms"]').prop('disabled', false);
            }.bind(this));
        },

        scrollToBottom: function () {
            setTimeout(function () {
                var container = this.$el.find('.sms-chat-body');

                if (container.length) {
                    container.scrollTop(container[0].scrollHeight);
                }
            }.bind(this), 100);
        }

    });

});