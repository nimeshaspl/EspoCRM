<?php

namespace Espo\Custom\Jobs;

use Espo\Core\Jobs\Base;

class MonthlyAttendanceSummary extends Base
{
    public function run()
    {
        $entityManager = $this->getEntityManager();

        $currentMonth = date('m');
        $currentYear  = date('Y');
        $monthYear    = date('Y-m');

        $startDate = $currentYear . '-' . $currentMonth . '-01';
        $endDate   = date('Y-m-t');

        // ============================
        // 🧮 WORKING DAYS (EXCLUDE SAT/SUN)
        // ============================
        function getWorkingDays($startDate, $endDate)
        {
            $start = strtotime($startDate);
            $end   = strtotime($endDate);

            $workingDays = 0;

            for ($i = $start; $i <= $end; $i += 86400) {
                $day = date('N', $i); // 1 (Mon) → 7 (Sun)

                if ($day < 6) { // Mon–Fri
                    $workingDays++;
                }
            }

            return $workingDays;
        }

        $totalWorkingDays = getWorkingDays($startDate, $endDate);

        // 👨‍💼 GET ACTIVE EMPLOYEES
        $employees = $entityManager->getRepository('CEmployee')
            ->where(['isActive' => true])
            ->find();

        foreach ($employees as $employee) {

            $employeeId = $employee->getId();

            // ============================
            // 🔍 FIND OR CREATE SUMMARY
            // ============================
            $summary = $entityManager->getRepository('CMonthlyAttendanceSummary')
                ->where([
                    'employeeId' => $employeeId,
                    'monthYear'  => $monthYear
                ])
                ->findOne();

            if (!$summary) {
                $summary = $entityManager->createEntity('CMonthlyAttendanceSummary');
                $summary->set('employeeId', $employeeId);
                $summary->set('monthYear', $monthYear);
            }

            // ============================
            // 📊 FETCH ATTENDANCE
            // ============================
            $attendanceList = $entityManager->getRepository('CAttendance')
                ->where([
                    'employeeId' => $employeeId,
                    'date>='     => $startDate,
                    'date<='     => $endDate
                ])
                ->find();

            // ============================
            // 🔢 INITIALIZE
            // ============================
            $presentDays = 0;
            $leaveDays   = 0;
            $absentDays  = 0;

            $totalWorkSeconds     = 0;
            $totalOvertimeSeconds = 0;

            // ============================
            // 📊 PROCESS ATTENDANCE
            // ============================
            foreach ($attendanceList as $attendance) {

                $status  = $attendance->get('status');
                $workSec = (int) $attendance->get('totalWorkSeconds');

                switch ($status) {
                    case 'Present':
                        $presentDays++;
                        break;

                    case 'Leave':
                        $leaveDays++;
                        break;

                    case 'Absent':
                        $absentDays++; // ✅ ONLY FROM DB
                        break;
                }

                $totalWorkSeconds += $workSec;

                // Overtime (> 8 hours = 28800 sec)
                if ($workSec > 28800) {
                    $totalOvertimeSeconds += ($workSec - 28800);
                }
            }

            // ============================
            // ⏱ TIME CALCULATIONS
            // ============================
            $workDuration = gmdate("H:i:s", $totalWorkSeconds);
            $overtime     = gmdate("H:i:s", $totalOvertimeSeconds);

            $avgWorkDuration = ($presentDays > 0)
                ? gmdate("H:i:s", $totalWorkSeconds / $presentDays)
                : "00:00:00";

            $avgOvertime = ($presentDays > 0)
                ? gmdate("H:i:s", $totalOvertimeSeconds / $presentDays)
                : "00:00:00";

            // ============================
            // 💾 SAVE / UPDATE
            // ============================
            $summary->set([
                'name'              => $employee->get('name') . ' (' . $monthYear . ')',
                'presentDays'       => $presentDays,
                'leaveDays'         => $leaveDays,
                'absentDays'        => $absentDays, // ✅ STRICT
                'totalWorkingDays'  => $totalWorkingDays,

                'workDuration'      => $workDuration,
                'overtime'          => $overtime,
                'avgWorkDuration'   => $avgWorkDuration,
                'avgOvertime'       => $avgOvertime
            ]);

            $entityManager->saveEntity($summary);
        }

        return true;
    }
}