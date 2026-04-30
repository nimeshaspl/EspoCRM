<?php

namespace Espo\Custom\Services;

use Espo\ORM\EntityManager;
use Espo\Core\Acl;
use Espo\Entities\User;

class CAttendance
{
    public function __construct(
        private EntityManager $entityManager,
        private Acl $acl,
        private User $user
    ) {}

    /* =====================================================
     * CLOCK IN
     * ===================================================== */

    public function clockIn($data = null): array
    {
        $user  = $this->user;
        $today = date('Y-m-d');
        $now   = date('Y-m-d H:i:s');

        if (!$this->userHasEmployeeRole($user)) {
            return ['status'=>'error','message'=>'Only employees can clock in.'];
        }

        $employee = $this->getEmployeeByUser($user->getId());

        if (!$employee) {
            return ['status'=>'error','message'=>'Employee record not found.'];
        }

        $attendance = $this->entityManager
            ->getRDBRepository('CAttendance')
            ->where([
                'employeeId'=>$employee->getId(),
                'date'=>$today
            ])
            ->findOne();

        /* First Clock In */
        if (!$attendance) {

            $attendance = $this->entityManager->getNewEntity('CAttendance');

            $attendance->set([
                'employeeId'=>$employee->getId(),
                'assignedUserId'=>$user->getId(),
                'date'=>$today,
                'firstClockIn'=>$now,
                'status'=>'Present',
                'totalHours'=>'00:00:00',
                'totalWorkSeconds'=>0,
                'name'=>$employee->get('name').' - '.$today
            ]);

            $this->entityManager->saveEntity($attendance);

        } else {

            $lastHistory = $this->getLastHistory($attendance->getId());

            if ($lastHistory && $lastHistory->get('actionType') === 'Clock In') {
                return [
                    'status'=>'error',
                    'message'=>'You must clock out before clocking in again.'
                ];
            }
        }

        /* History Record */

        $history = $this->entityManager->getNewEntity('CAttendanceHistory');

        $history->set([
            'attendanceId'=>$attendance->getId(),
            'employeeId'=>$employee->getId(),
            'assignedUserId'=>$user->getId(),
            'actionType'=>'Clock In',
            'actionTime'=>$now,
            'totalWorkSeconds'=>$attendance->get('totalWorkSeconds'),
            'totalWorkingHours'=>$attendance->get('totalHours')
        ]);

        $this->entityManager->saveEntity($history);

        return [
            'status'=>'success',
            'message'=>'Clocked In Successfully',
            'time'=>date('h:i:s A')
        ];
    }


    /* =====================================================
     * CLOCK OUT
     * ===================================================== */

    public function clockOut($data = null): array
{
    $user  = $this->user;
    $today = date('Y-m-d');
    $now   = date('Y-m-d H:i:s');

    $employee = $this->getEmployeeByUser($user->getId());

    $attendance = $this->entityManager
        ->getRDBRepository('CAttendance')
        ->where([
            'employeeId'=>$employee->getId(),
            'date'=>$today
        ])
        ->findOne();

    if (!$attendance) {
        return ['status'=>'error','message'=>'You must clock in first.'];
    }

    /* 🔹 Get last Clock In only */
    $lastClockIn = $this->entityManager
        ->getRDBRepository('CAttendanceHistory')
        ->where([
            'attendanceId'=>$attendance->getId(),
            'actionType'=>'Clock In'
        ])
        ->order('actionTime','DESC')
        ->findOne();

    if (!$lastClockIn) {
        return ['status'=>'error','message'=>'No clock-in found.'];
    }

    /* 🔹 Prevent double clock-out */
    $lastHistory = $this->getLastHistory($attendance->getId());

    if ($lastHistory && $lastHistory->get('actionType') === 'Clock Out') {
        return [
            'status'=>'error',
            'message'=>'You must clock in before clocking out again.'
        ];
    }

    /* 🔹 Session Calculation */
    $clockInTime  = strtotime($lastClockIn->get('actionTime'));
    $clockOutTime = strtotime($now);

    $sessionSeconds = $clockOutTime - $clockInTime;

    $previousSeconds = (int)$attendance->get('totalWorkSeconds');

    $totalSeconds = $previousSeconds + $sessionSeconds;

    $hours = gmdate("H:i:s", $totalSeconds);

    /* 🔹 Update Attendance */
    $attendance->set([
        'lastClockOut'=>$now,
        'totalWorkSeconds'=>$totalSeconds,
        'totalHours'=>$hours
    ]);

    $this->entityManager->saveEntity($attendance);

    /* 🔹 Save History */
    $history = $this->entityManager->getNewEntity('CAttendanceHistory');

    $history->set([
        'attendanceId'=>$attendance->getId(),
        'employeeId'=>$employee->getId(),
        'assignedUserId'=>$user->getId(),
        'actionType'=>'Clock Out',
        'actionTime'=>$now,
        'totalWorkSeconds'=>$totalSeconds,
        'totalWorkingHours'=>$hours
    ]);

    $this->entityManager->saveEntity($history);

    return [
        'status'=>'success',
        'message'=>'Clocked Out Successfully',
        'totalHours'=>$hours
    ];
}


    /* =====================================================
     * GET LAST HISTORY
     * ===================================================== */

    protected function getLastHistory($attendanceId)
    {
        return $this->entityManager
            ->getRDBRepository('CAttendanceHistory')
            ->where(['attendanceId'=>$attendanceId])
            ->order('actionTime','DESC')
            ->findOne();
    }


    /* =====================================================
     * TODAY STATUS
     * ===================================================== */
    public function getTodayStatus(): array
{
    $user  = $this->user;
    $today = date('Y-m-d');

    $employee = $this->getEmployeeByUser($user->getId());

    if (!$employee) {
        return ['isEmployee' => false];
    }

    $attendance = $this->entityManager
        ->getRDBRepository('CAttendance')
        ->where([
            'employeeId' => $employee->getId(),
            'date'       => $today,
        ])
        ->findOne();

    if (!$attendance) {
        return [
            'isEmployee'  => true,
            'isClockedIn' => false,
            'isClockedOut'=> false,
            'employeeId'  => $employee->getId()
        ];
    }

    /* ✅ Get LAST ACTION from history */
    $lastHistory = $this->getLastHistory($attendance->getId());

    $isClockedIn  = false;
    $isClockedOut = false;

    if ($lastHistory) {

        if ($lastHistory->get('actionType') === 'Clock In') {
            $isClockedIn  = true;
            // $isClockedOut = false;

        } elseif ($lastHistory->get('actionType') === 'Clock Out') {
            // $isClockedIn  = false;
            $isClockedIn  = true;
            $isClockedOut = true;
        }
    }

    return [
        'isEmployee'  => true,
        'isClockedIn' => $isClockedIn,
        'isClockedOut'=> $isClockedOut,
        'employeeId'  => $employee->getId()
    ];
}
    // public function getTodayStatus(): array
    // {
    //     $user  = $this->user;
    //     $today = date('Y-m-d');

    //     $employee = $this->getEmployeeByUser($user->getId());

    //     if (!$employee) {
    //         return ['isEmployee' => false];
    //     }

    //     $attendance = $this->entityManager
    //         ->getRDBRepository('CAttendance')
    //         ->where([
    //             'employeeId' => $employee->getId(),
    //             'date'       => $today,
    //         ])
    //         ->findOne();

    //     $isClockedIn  = $attendance && $attendance->get('firstClockIn');
    //     $isClockedOut = $attendance && $attendance->get('lastClockOut');

    //     return [
    //         'isEmployee'  => true,
    //         'isClockedIn' => (bool)$isClockedIn,
    //         'isClockedOut'=> (bool)$isClockedOut,
    //     ];
    // }



    /* =====================================================
     * HELPERS
     * ===================================================== */

    protected function getEmployeeByUser($userId)
    {
        return $this->entityManager
            ->getRDBRepository('CEmployee')
            ->join('user')
            ->where(['user.id'=>$userId])
            ->findOne();
    }

    protected function userHasEmployeeRole(User $user): bool
    {
        foreach ($user->getLinkMultipleIdList('roles') as $roleId) {

            $role = $this->entityManager
                ->getRDBRepository('Role')
                ->where(['id'=>$roleId])
                ->findOne();

            if ($role && strtolower($role->get('name')) === 'employee') {
                return true;
            }
        }

        return false;
    }
}