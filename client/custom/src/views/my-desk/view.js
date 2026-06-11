define('custom:views/my-desk/view', ['view'], function (Dep) {

    return Dep.extend({

        template: 'custom:my-desk/view',

        events: {

            'click [data-action="addNotice"]': 'actionAddNotice',
            'click [data-action="exportDataMaster"]': 'actionExportDataMaster'
        },

        setup: function () {

            const today = new Date().toISOString().split('T')[0];
            this.fetchLatestNotice();
            console.log('Today\'s date:', today);

            this.notClockInUsers = [];
            this.clockedInUsers = [];
            this.clockedOutUsers = [];
            this.onLeaveUsers = [];
            this.onOptionalHolidayUsers = [];
            this.latestNotice = {};
            this.todayBirthdayUsers = [];
            this.upcomingBirthdayUsers = [];
            this.todayAnniversaryUsers = [];
            this.upcomingAnniversaryUsers = [];

            this.fetchAttendanceData(today);
            this.fetchOnLeaveUsers(today);
            this.fetchOptionalHolidayUsers(today);
            this.fetchBirthdayUsers(today);
            this.fetchAnniversaryUsers(today);
            this.fetchNextHoliday(today);
        },

        data: function () {
            return {
                title: 'My Desk',
                userName: this.getUser().get('name') || '',
                isAdmin: this.getUser().isAdmin(),
                latestNotice: this.latestNotice || {},
                todayBirthdayUsers: this.todayBirthdayUsers,
                upcomingBirthdayUsers: this.upcomingBirthdayUsers,
                todayAnniversaryUsers: this.todayAnniversaryUsers,
                upcomingAnniversaryUsers: this.upcomingAnniversaryUsers,
                nextHoliday: this.nextHoliday || {},
                notClockInUsers: this.notClockInUsers,
                clockedInUsers: this.clockedInUsers,
                clockedOutUsers: this.clockedOutUsers,
                onLeaveUsers: this.onLeaveUsers,
                onOptionalHolidayUsers: this.onOptionalHolidayUsers
            };
        },
        actionExportDataMaster: function () {
            Espo.Ui.notify('Preparing export, please wait...', 'warning');

            const siteUrl = (this.getConfig().get('siteUrl') || '').replace(/\/$/, '');
            const exportUrl = siteUrl + '/api/v1/ExportDataMaster/export';

            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';

            iframe.onload = () => {
                Espo.Ui.notify(false);
                Espo.Ui.success('Export started. Check your downloads.');
                setTimeout(() => iframe.remove(), 1000);
            };

            iframe.onerror = () => {
                Espo.Ui.notify(false);
                Espo.Ui.error('Export failed. Please try again.');
                iframe.remove();
            };

            document.body.appendChild(iframe);
            iframe.src = exportUrl;
        },
        // =====================================================
        // NOTICEBOARD
        // =====================================================
        actionAddNotice: function () {

            Espo.Ui.notify('Add Notice action triggered', 'info', 3000);

            const htmlContent = `
                <div style="padding: 20px;">
                    <form id="noticeForm">
                        <input type="text"
                            class="form-control"
                            placeholder="Notice Title"
                            style="margin-bottom: 15px;"
                            required>

                        <textarea class="form-control"
                                placeholder="Notice Content"
                                rows="4"
                                required></textarea>

                        <div class="text-right" style="margin: 12px 0px;">
                            <button type="submit"
                                    class="btn btn-primary px-5">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            `;

            // Store modal instance
            const modal = this.simpleModal('Add Notice', htmlContent);

            setTimeout(function () {

                $('#noticeForm').off('submit').on('submit', function (e) {

                    e.preventDefault();
                    const title = $(this).find('input').val().trim();
                    const content = $(this).find('textarea').val().trim();
                    if (!title || !content) {
                        Espo.Ui.notify('Please fill in all fields', 'warning', 3000);
                        return;
                    }
                    // Here you would typically send the data to the server
                    Espo.Ajax.postRequest('CNotice', {
                        name: title,
                        description: content
                    });
                    Espo.Ui.notify('Notice saved successfully', 'success', 3000);
                    // Close modal here
                    modal.closeModal();

                });

            }, 300);
        },
        fetchLatestNotice: function () {

            Espo.Ajax.getRequest('CNotice', {
                orderBy: 'createdAt',
                order: 'desc',
                maxSize: 1
            })
                .then(function (response) {

                    const notice = response.list && response.list[0];
                    // console.log('Fetched latest notice:', notice);

                    if (notice) {
                        this.latestNotice = notice;
                        this.render();
                    }

                }.bind(this))

                .catch(function (error) {
                    console.error('Error fetching latest notice:', error);
                });
        },
        fetchBirthdayUsers: function () {

            const today = new Date();

            const currentMonth = today.getMonth() + 1; // 1-12
            const currentDay = today.getDate(); // 1-31

            Espo.Ajax.getRequest('User', {
                where: [
                    {
                        type: 'isNotNull',
                        attribute: 'cDob'
                    }
                ],
                maxSize: 200
            })

                .then(function (response) {

                    const users = response.list || [];

                    // console.log('Fetched users:', users);

                    // Today's birthdays
                    this.todayBirthdayUsers = users.filter(function (user) {

                        if (!user.cDob) return false;

                        const dob = new Date(user.cDob);

                        return (
                            dob.getMonth() + 1 === currentMonth &&
                            dob.getDate() === currentDay
                        );

                    }).map(function (user) {

                        return {
                            name: user.name,
                            avatar: user.avatarId
                                ? '?entryPoint=image&id=' + user.avatarId
                                : 'client/img/avatar.png',
                            date: (new Date(user.cDob)).getDate() + ' ' + ((new Date(user.cDob)).toLocaleString('default', { month: 'long' })) // For display date like 1 May
                        };

                    });

                    // Upcoming birthdays in current month
                    this.upcomingBirthdayUsers = users.filter(function (user) {

                        if (!user.cDob) return false;

                        const dob = new Date(user.cDob);

                        return (
                            dob.getMonth() + 1 === currentMonth &&
                            dob.getDate() > currentDay
                        );

                    }).sort(function (a, b) {

                        return new Date(a.cDob).getDate() - new Date(b.cDob).getDate();

                    }).map(function (user) {

                        return {
                            name: user.name,
                            avatar: user.avatarId
                                ? '?entryPoint=image&id=' + user.avatarId
                                : 'client/img/avatar.png',
                            date: (new Date(user.cDob)).getDate() + ' ' + ((new Date(user.cDob)).toLocaleString('default', { month: 'long' })) // For display date like 1 May
                        };

                    });

                    // console.log('Today birthdays:', this.todayBirthdayUsers);
                    // console.log('Upcoming birthdays:', this.upcomingBirthdayUsers);

                    this.render();

                }.bind(this))

                .catch(function (error) {

                    console.error('Error fetching birthday users:', error);

                });
        },
        fetchAnniversaryUsers: function () {

            const today = new Date();

            const currentMonth = today.getMonth() + 1; // 1-12
            const currentDay = today.getDate(); // 1-31

            Espo.Ajax.getRequest('User', {
                where: [
                    {
                        type: 'isNotNull',
                        attribute: 'cDoj'
                    }
                ],
                maxSize: 200
            })

                .then(function (response) {

                    const users = response.list || [];

                    // console.log('Fetched users:', users);

                    // Today's anniversaries
                    this.todayAnniversaryUsers = users.filter(function (user) {

                        if (!user.cDoj) return false;

                        const doj = new Date(user.cDoj);

                        return (
                            doj.getMonth() + 1 === currentMonth &&
                            doj.getDate() === currentDay
                        );

                    }).map(function (user) {

                        return {
                            name: user.name,
                            avatar: user.avatarId
                                ? '?entryPoint=image&id=' + user.avatarId
                                : 'client/img/avatar.png',
                            date: (new Date(user.cDoj)).getDate() + ' ' + ((new Date(user.cDoj)).toLocaleString('default', { month: 'long' })) // For display date like 1 May
                        };

                    });

                    // Upcoming anniversaries in current month
                    this.upcomingAnniversaryUsers = users.filter(function (user) {

                        if (!user.cDoj) return false;

                        const doj = new Date(user.cDoj);

                        return (
                            doj.getMonth() + 1 === currentMonth &&
                            doj.getDate() > currentDay
                        );

                    }).sort(function (a, b) {

                        return new Date(a.cDoj).getDate() - new Date(b.cDoj).getDate();

                    }).map(function (user) {

                        return {
                            name: user.name,
                            avatar: user.avatarId
                                ? '?entryPoint=image&id=' + user.avatarId
                                : 'client/img/avatar.png',
                            date: (new Date(user.cDoj)).getDate() + ' ' + ((new Date(user.cDoj)).toLocaleString('default', { month: 'long' })) // For display date like 1 May
                        };

                    });

                    // console.log('Today anniversaries:', this.todayAnniversaryUsers);
                    // console.log('Upcoming anniversaries:', this.upcomingAnniversaryUsers);

                    this.render();

                }.bind(this))

                .catch(function (error) {

                    console.error('Error fetching anniversary users:', error);

                });
        },
        fetchNextHoliday: function (date) {

            Espo.Ajax.getRequest('CHoliday', {

                where: [
                    {
                        type: 'greaterThanOrEquals',
                        attribute: 'date',
                        value: date
                    },
                    {
                        type: 'equals',
                        attribute: 'type',
                        value: 'Mandatory'
                    },
                    {
                        type: 'equals',
                        attribute: 'location',
                        value: this.getUser().get('cLocation') || ''
                    }
                ],

                orderBy: 'date',
                order: 'asc',

                maxSize: 1
            })

                .then(function (response) {

                    const holidays = response.list || [];

                    // console.log('Fetched next holiday:', holidays);

                    if (holidays.length > 0) {
                        const holiday = holidays[0];
                        holiday.formattedDate = new Date(holiday.date)
                            .toLocaleDateString('en-GB', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            });

                        this.nextHoliday = holiday;
                    } else {
                        this.nextHoliday = {};
                    }

                    this.render();

                }.bind(this))

                .catch(function (error) {

                    console.error('Error fetching next holiday:', error);

                });
        },

        // =====================================================
        // FETCH ATTENDANCE DATA
        // =====================================================

        fetchAttendanceData: function (date) {
            var self = this;

            // ✅ Step 1: Fetch today's attendance records
            Espo.Ajax.getRequest('CAttendance', {
                where: [
                    { type: 'equals', attribute: 'date', value: date }
                ],
                maxSize: 200
            }).then(function (attResponse) {
                var records = attResponse.list || [];
                console.log('Fetched attendance records:', records);

                // ✅ Step 2: Collect all assignedUserIds from attendance records
                var attendedUserIds = records
                    .map(function (rec) { return rec.assignedUserId; })
                    .filter(Boolean);

                if (!attendedUserIds.length) {
                    self.clockedInUsers = [];
                    self.clockedOutUsers = [];

                    // Still fetch notClockInUsers
                    Espo.Ajax.getRequest('CAttendance/action/employeeList')
                        .then(function (response) {
                            var allEmployees = response.list || [];
                            console.log('Fetched all employees for notClockInUsers:', allEmployees);
                            self.notClockInUsers = allEmployees.map(function (user) {
                                return {
                                    id: user.id,
                                    name: user.name,
                                    avatar: user.avatarId
                                        ? '?entryPoint=image&id=' + user.avatarId
                                        : 'client/img/avatar.png',
                                    isWorkFromHome: user.cIsWorkFromHome || false
                                };
                            });
                            self.render();
                        });
                    return;
                }

                // ✅ Step 3: Fetch User records for attended users to get avatarId
                Espo.Ajax.getRequest('User', {
                    where: [
                        { type: 'in', attribute: 'id', value: attendedUserIds }
                    ],
                    maxSize: 200
                }).then(function (userResponse) {
                    var users = userResponse.list || [];

                    // ✅ Step 4: Build userId → avatar map from User table
                    var userAvatarMap = {};
                    users.forEach(function (user) {
                        userAvatarMap[user.id] = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatarId
                                ? '?entryPoint=image&id=' + user.avatarId
                                : 'client/img/avatar.png'
                        };
                    });

                    console.log('User avatar map:', userAvatarMap);

                    self.clockedInUsers = [];
                    self.clockedOutUsers = [];

                    // ✅ Step 5: Categorize attendance records using userAvatarMap
                    records.forEach(function (rec) {
                        var userId = rec.assignedUserId;
                        if (!userId) return;

                        // ✅ Get avatar from User table map, not from attendance record
                        var userData = userAvatarMap[userId] || {
                            id: userId,
                            name: rec.assignedUserName || '',
                            avatar: 'client/img/avatar.png'
                        };

                        if (rec.firstClockIn && rec.lastClockOut) {
                            self.clockedOutUsers.push(userData);
                        } else if (rec.firstClockIn && !rec.lastClockOut) {
                            self.clockedInUsers.push(userData);
                        }
                    });

                    var clockedUserIds = self.clockedInUsers.map(function (u) { return u.id; })
                        .concat(self.clockedOutUsers.map(function (u) { return u.id; }))
                        .filter(Boolean);

                    console.log('Clocked in:', self.clockedInUsers);
                    console.log('Clocked out:', self.clockedOutUsers);

                    // ✅ Step 6: Fetch all employees and subtract clocked users
                    Espo.Ajax.getRequest('CAttendance/action/employeeList')
                        .then(function (response) {
                            var allEmployees = response.list || [];

                            self.notClockInUsers = allEmployees
                                .filter(function (user) {
                                    return clockedUserIds.indexOf(user.id) === -1;
                                })
                                .map(function (user) {
                                    return {
                                        id: user.id,
                                        name: user.name,
                                        avatar: user.avatarId
                                            ? '?entryPoint=image&id=' + user.avatarId
                                            : 'client/img/avatar.png',
                                        isWorkFromHome: user.cIsWorkFromHome || false
                                    };
                                });

                            console.log('Not clocked in:', self.notClockInUsers);
                            self.render();
                        })
                        .catch(function (error) {
                            console.error('Error fetching employee list:', error);
                        });

                }).catch(function (error) {
                    console.error('Error fetching user avatars:', error);
                });

            }).catch(function (error) {
                console.error('Error fetching attendance data:', error);
            });
        },

        // =====================================================
        // FETCH LEAVE USERS
        // =====================================================

        fetchOnLeaveUsers: function (date) {

            Espo.Ajax.getRequest('CLeaveRequest', {

                where: [
                    {
                        type: 'lessThanOrEquals',
                        attribute: 'startDate',
                        value: date
                    },
                    {
                        type: 'greaterThanOrEquals',
                        attribute: 'endDate',
                        value: date
                    },
                    {
                        type: 'equals',
                        attribute: 'status',
                        value: 'Approved'
                    }
                ],

                select: 'id,userId,startDate,endDate,status,dayMode', // 👈 explicitly fetch dayMode

                maxSize: 200

            })

                .then(function (response) {

                    const leaveRequests = response.list || [];

                    // 👇 Build a map of userId -> dayMode for later use
                    const userDayModeMap = {};

                    const userIds = leaveRequests
                        .map(function (leaveRequest) {
                            if (leaveRequest.userId) {
                                userDayModeMap[leaveRequest.userId] = leaveRequest.dayMode;
                            }
                            return leaveRequest.userId;
                        })
                        .filter(Boolean);

                    if (!userIds.length) {
                        this.onLeaveUsers = [];
                        this.render();
                        return;
                    }

                    return Espo.Ajax.getRequest('User', {

                        where: [
                            {
                                type: 'in',
                                attribute: 'id',
                                value: userIds
                            }
                        ],

                        maxSize: 200

                    }).then(function (userResponse) {
                        // 👇 Pass userDayModeMap along to the next step
                        return { userResponse: userResponse, userDayModeMap: userDayModeMap };
                    });

                }.bind(this))

                .then(function (result) {

                    if (!result) return;

                    const users = result.userResponse.list || [];
                    const userDayModeMap = result.userDayModeMap;

                    this.onLeaveUsers = users.map(function (user) {
                        return {
                            name: user.name,
                            avatar: user.avatarId
                                ? '?entryPoint=image&id=' + user.avatarId
                                : 'client/img/avatar.png',
                            dayMode: userDayModeMap[user.id] || null,  // 👈 now available per user
                        };
                    });

                    this.render();

                }.bind(this))

                .catch(function (error) {
                    console.error('Error fetching leave request data:', error);
                });
        },
        fetchOptionalHolidayUsers: function (date) {
            var self = this;

            // Step 1: Fetch today's Optional holiday
            Espo.Ajax.getRequest('CHoliday', {
                where: [
                    {
                        type: 'equals',
                        attribute: 'date',
                        value: date
                    },
                    {
                        type: 'equals',
                        attribute: 'type',
                        value: 'Optional'
                    }
                ],
                maxSize: 1
            })
                .then(function (holidayResponse) {

                    var holidays = holidayResponse.list || [];
                    console.log('Fetched optional holidays:', holidays);
                    if (!holidays.length) {
                        self.onOptionalHolidayUsers = [];
                        self.render();
                        return null;
                    }

                    var holidayId = holidays[0].id;
                    console.log('Fetched optional holiday ID:', holidayId);

                    // Step 2: Fetch CHolidaySelection records linked to that holiday
                    return Espo.Ajax.getRequest('CHolidaySelection', {
                        where: [
                            {
                                type: 'equals',
                                attribute: 'holidayId',
                                value: holidayId
                            }
                        ],
                        maxSize: 200
                    });

                })
                .then(function (selectionResponse) {

                    if (!selectionResponse) return null;

                    var selections = selectionResponse.list || [];
                    console.log('Fetched holiday selections:', selections);

                    if (!selections.length) {
                        self.onOptionalHolidayUsers = [];
                        self.render();
                        return null;
                    }

                    // Step 3: Collect userIds from CHolidaySelection
                    var userIds = selections
                        .map(function (sel) { return sel.userId; })
                        .filter(Boolean);

                    if (!userIds.length) {
                        self.onOptionalHolidayUsers = [];
                        self.render();
                        return null;
                    }

                    // Step 4: Fetch User records for those userIds
                    return Espo.Ajax.getRequest('User', {
                        where: [
                            {
                                type: 'in',
                                attribute: 'id',
                                value: userIds
                            }
                        ],
                        maxSize: 200
                    });

                })
                .then(function (userResponse) {

                    if (!userResponse) return;

                    var users = userResponse.list || [];
                    console.log('Fetched optional holiday users:', users);

                    self.onOptionalHolidayUsers = users.map(function (user) {
                        return {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatarId
                                ? '?entryPoint=image&id=' + user.avatarId
                                : 'client/img/avatar.png'
                        };
                    });

                    self.render();

                })
                .catch(function (error) {
                    console.error('Error fetching optional holiday users:', error);
                });
        },
        simpleModal: function (title, htmlContent) {
            var backdropId = 'helloBackdrop-' + Date.now();
            var modalId = 'helloModal-' + Date.now();

            var backdropHtml = `<div id="${backdropId}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 9998;"></div>`;

            var modalHtml = `
        <div id="${modalId}" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; width: 100%; max-width: 650px;">
            <div style="background: white; border-radius: 4px; box-shadow: 0 3px 12px rgba(0, 0, 0, 0.5); overflow: hidden; width: 100%;">
                <div style="padding: 20px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                    <h5 style="margin: 0; color: #333; font-weight: 500;">${title}</h5>
                    <button class="modalCloseBtn" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 0; color: #333;">×</button>
                </div>
                ${htmlContent}
            </div>
        </div>
    `;

            // Remove any existing hello modals
            $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').remove();

            // Add backdrop and modal to body
            $(backdropHtml).appendTo('body');
            var $modal = $(modalHtml).appendTo('body');

            // Disable page scroll
            var scrollY = window.scrollY;
            $('body').css({
                position: 'fixed',
                top: `-${scrollY}px`,
                width: '100%'
            });

            // Close modal function
            function closeModal() {
                $('div[id^="helloModal-"], div[id^="helloBackdrop-"]').fadeOut(200, function () {
                    $(this).remove();
                });
                var scrollTop = parseInt($('body').css('top')) * -1;
                $('body').css({ position: '', top: '', width: '' });
                window.scrollTo(0, scrollTop);
            }

            $modal.find('.modalCloseBtn').one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });

            $('#' + backdropId).one('click', function (e) {
                if (e.target.id === backdropId) {
                    closeModal();
                }
            });

            $modal.on('click', function (e) {
                e.stopPropagation();
            });

            console.log('Modal overlay displayed:', modalId);

            // ✅ Return both modalId and closeModal function
            return {
                modalId: modalId,
                closeModal: closeModal
            };
        },
    });
});
