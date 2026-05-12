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
            return window.localStorage.getItem(DONE_ACK_STORAGE_PREFIX + userId) === '1';
        } catch (e) {
            return false;
        }
    }

    function markCompletionDoneAcknowledged(userId) {
        if (!userId) {
            return;
        }

        try {
            window.localStorage.setItem(DONE_ACK_STORAGE_PREFIX + userId, '1');
        } catch (e) {}
    }

    function clearCompletionDoneAcknowledged(userId) {
        if (!userId) {
            return;
        }

        try {
            window.localStorage.removeItem(DONE_ACK_STORAGE_PREFIX + userId);
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

            // Profile is complete — never force redirect, let user navigate freely.
            if (status.isComplete) {
                return;
            }

            // No hash at all — send to profile so they fill it in.
            if (!hash || hash === '#') {
                redirectToProfile();
                return;
            }

            // Profile incomplete — keep user on the profile page.
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
