Espo.define('custom:views/employee-address/fields/city', 'views/fields/link', function (Dep) {
    return Dep.extend({
        getSelectFilters: function () {
            if (this.model.get('stateId')) {
                return {
                    'state': {
                        type: 'equals',
                        attribute: 'stateId',
                        value: this.model.get('stateId'),
                        valueName: this.model.get('stateName')
                    }
                };
            }
        },
        getCreateAttributes: function () {
            if (this.model.get('stateId')) {
                return {
                    stateId: this.model.get('stateId'),
                    stateName: this.model.get('stateName')
                };
            }
        }
    });
});
