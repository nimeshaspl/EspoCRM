Espo.define('custom:views/employee-address/fields/state', 'views/fields/link', function (Dep) {
    return Dep.extend({
        getSelectFilters: function () {
            if (this.model.get('countryId')) {
                return {
                    'country': {
                        type: 'equals',
                        attribute: 'countryId',
                        value: this.model.get('countryId'),
                        valueName: this.model.get('countryName')
                    }
                };
            }
        },
        getCreateAttributes: function () {
            if (this.model.get('countryId')) {
                return {
                    countryId: this.model.get('countryId'),
                    countryName: this.model.get('countryName')
                };
            }
        }
    });
});
