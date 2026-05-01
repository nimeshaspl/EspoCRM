<?php

namespace Espo\Custom\Jobs;

use Espo\Core\Jobs\Base;

class MarkAbsentIfNoClockOut extends Base
{
    public function run()
    {
        $entityManager = $this->getEntityManager();

        $today = (new \DateTime())->format('Y-m-d');

        // 1️⃣ Get all employees
        $employees = $entityManager
            ->getRepository('CEmployee')
            ->where(['deleted' => false])
            ->find();

        foreach ($employees as $employee) {

            $employeeId   = $employee->getId();
            $assignedUser = $employee->get('assignedUserId'); // 👈 important

            // 2️⃣ Check today's attendance
            $attendance = $entityManager
                ->getRepository('CAttendance')
                ->where([
                    'employeeId' => $employeeId,
                    'date'       => $today,
                    'deleted'    => false
                ])
                ->findOne();

            // =====================================================
            // CASE 1: Record exists
            // =====================================================
            if ($attendance) {

                $clockIn  = $attendance->get('firstClockIn');
                $clockOut = $attendance->get('lastClockOut');

                // ❌ Clock-in exists but no clock-out → Absent
                if ($clockIn && !$clockOut) {

                    $attendance->set([
                        'status'          => 'Absent',
                        'totalHours'      => 0,
                        'assignedUserId'  => $assignedUser
                    ]);

                    $entityManager->saveEntity($attendance);

                    // History
                    $history = $entityManager->getEntity('CAttendanceHistory');
                    $history->set([
                        'employeeId'      => $employeeId,
                        'date'            => $today,
                        'status'          => 'Absent',
                        'assignedUserId'  => $assignedUser
                    ]);
                    $entityManager->saveEntity($history);
                }

            }
        }

        return true;
    }
}