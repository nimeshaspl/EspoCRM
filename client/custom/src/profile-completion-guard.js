(function () {
    var PROFILE_HASH = '#Profile';
    var STATUS_ENDPOINT = 'api/v1/UserEmployee/action/profileCompletionStatus';
    var DEFAULT_ROUTE_STORAGE_PREFIX = 'employee-profile-default-route:';
    var DONE_ACK_STORAGE_PREFIX = 'employee-profile-completion-done:';
    var booted = false;

    function isReady() {
        return window.Espo && Espo.Ajax && typeof Espo.Ajax.getRequest === 'function';
    }

    function waitForEspo(callback) {
        if (isReady()) {
            callback();

            return;
        }

        window.setTimeout(function () {
            waitForEspo(callback);
        }, 200);
    }

    function isProfileHash(hash) {
        return /^#Profile(?:$|[/?])/i.test(hash || '');
    }

    function redirectToProfile() {
        if (isProfileHash(window.location.hash)) {
            return;
        }

        window.location.hash = PROFILE_HASH;
    }

    function isDefaultRouteHandled(userId) {
        if (!userId) {
            return false;
        }

        try {
            return window.sessionStorage.getItem(DEFAULT_ROUTE_STORAGE_PREFIX + userId) === '1';
        } catch (e) {
            return false;
        }
    }

    function markDefaultRouteHandled(userId) {
        if (!userId) {
            return;
        }

        try {
            window.sessionStorage.setItem(DEFAULT_ROUTE_STORAGE_PREFIX + userId, '1');
        } catch (e) {}
    }

    function isCompletionDoneAcknowledged(userId) {
        if (!userId) {
            return false;
        }

        try {
            return window.sessionStorage.getItem(DONE_ACK_STORAGE_PREFIX + userId) === '1';
        } catch (e) {
            return false;
        }
    }

    function clearCompletionDoneAcknowledged(userId) {
        if (!userId) {
            return;
        }

        try {
            window.sessionStorage.removeItem(DONE_ACK_STORAGE_PREFIX + userId);
        } catch (e) {}
    }

    function checkCurrentRoute() {
        window.fetch(STATUS_ENDPOINT, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        }).then(function (response) {
            if (!response.ok) {
                throw new Error('Profile status request failed with code ' + response.status);
            }

            return response.json();
        }).then(function (status) {
            if (!status || !status.isEmployee) {
                return;
            }

            var hash = window.location.hash || '';

            if (!isDefaultRouteHandled(status.userId) && !isProfileHash(hash)) {
                markDefaultRouteHandled(status.userId);
                redirectToProfile();

                return;
            }

            if (!hash || hash === '#') {
                redirectToProfile();

                return;
            }

            if (status.shouldForceProfile) {
                clearCompletionDoneAcknowledged(status.userId);
            }

            if (status.isComplete && !isCompletionDoneAcknowledged(status.userId) && !isProfileHash(hash)) {
                redirectToProfile();

                return;
            }

            if (status.shouldForceProfile && !isProfileHash(hash)) {
                redirectToProfile();
            }
        }).catch(function () {});
    }

    function boot() {
        if (booted) {
            return;
        }

        booted = true;

        checkCurrentRoute();

        window.addEventListener('hashchange', function () {
            window.setTimeout(checkCurrentRoute, 0);
        });

        window.addEventListener('focus', function () {
            checkCurrentRoute();
        });

        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) {
                checkCurrentRoute();
            }
        });
    }

    waitForEspo(boot);
})();
