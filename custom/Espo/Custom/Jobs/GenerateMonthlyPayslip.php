<?php

namespace Espo\Custom\Jobs;

use Espo\Core\Jobs\Base;
use DateTime;

class GenerateMonthlyPayslip extends Base
{
    public function run()
    {
        
        $entityManager = $this->getEntityManager();

        // Generate for previous month
        $monthDate = new DateTime('first day of last month');
        $startDate = $monthDate->format('Y-m-01');
        $endDate   = $monthDate->format('Y-m-t');
        $daysInMonth = (int) $monthDate->format('t');

        $employees = $entityManager->getRepository('CEmployee')->find();

        foreach ($employees as $employee) {

            // ===============================
            // 1️⃣ Prevent Duplicate Payslip
            // ===============================
            $existingPayslip = $entityManager->getRepository('CPayslip')
                ->where([
                    'employeeId' => $employee->getId(),
                    'month' => $startDate
                ])
                ->findOne();

            if ($existingPayslip) {
                continue;
            }

            // ===============================
            // 2️⃣ Get Latest Package
            // ===============================
            $package = $entityManager->getRepository('CPackage')
                ->where([
                    'employeeId' => $employee->getId()
                ])
                ->order('updatedOn', 'DESC')
                ->findOne();

            if (!$package) {
                continue;
            }

            $payPackage = $package->get('payPackage');
            if (!$payPackage) {
                continue;
            }

            // ===============================
            // 3️⃣ Salary Calculation
            // ===============================
            $annual =
                (float)$payPackage->get('basicPay') +
                (float)$payPackage->get('conveyanceAllowance') +
                (float)$payPackage->get('hRAGross') +
                (float)$payPackage->get('medical') +
                (float)$payPackage->get('specialAllowance') +
                (float)$payPackage->get('balancingFigure') -
                (float)$payPackage->get('pTGross');

            $totalMonthSalary = $annual / 12;
            $salaryPerDay = $totalMonthSalary / $daysInMonth;

            // ===============================
            // 4️⃣ Attendance Calculation
            // ===============================
            $attendances = $entityManager->getRepository('CAttendance')
                ->where([
                    'employeeId' => $employee->getId(),
                    'date>=' => $startDate,
                    'date<=' => $endDate
                ])
                ->find();

            $leaveDays = 0;

            foreach ($attendances as $attendance) {
                if ($attendance->get('status') === 'Leave') {
                    $leaveDays++;
                }
                if ($attendance->get('status') === 'Half Day') {
                    $leaveDays += 0.5;
                }
            }

            $totalWorkDays = $daysInMonth - $leaveDays;

            // ===============================
            // 5️⃣ Base Payslip Calculation
            // ===============================
            $TDS = 0;

            $amountCredited = ($totalWorkDays * $salaryPerDay) - $TDS;
            $totalDeductions = $totalMonthSalary - $amountCredited;

            $user = $employee->get('user');
            $assignedUserId = $user ? $user->getId() : null;

            // ===============================
            // 6️⃣ Create Payslip
            // ===============================
            $payslip = $entityManager->createEntity('CPayslip', [
                'name' => $employee->get('name') . ' - ' . $monthDate->format('F Y'),
                'employeeId' => $employee->getId(),
                'payPackageId' => $payPackage->getId(),
                'assignedUserId' => $assignedUserId,
                'month' => $startDate,
                'grossPay' => $totalMonthSalary,
                'totalWorkDays' => $totalWorkDays,
                'tDS' => $TDS,
                'amountCredited' => $amountCredited,
                'totalDeductions' => $totalDeductions
            ]);

            foreach ($attendances as $attendance) {
                $attendance->set('payslipId', $payslip->getId());
                $entityManager->saveEntity($attendance);
            }

            // ===============================
            // 7️⃣ Loan EMI Deduction Logic
            // ===============================

            $loan = $entityManager->getRepository('CLoan')
                ->where([
                    'employeeId' => $employee->getId()
                ])
                ->order('createdAt', 'DESC')
                ->findOne();

            if ($loan) {

                $pending = (float) $loan->get('amountPending');
                $repaid  = (float) $loan->get('amountRepaid');

                if ($pending <= 0) {
                    continue;
                }

                $recoveryStart = $loan->get('recoveryStartMonth');
                $recoveryEnd   = $loan->get('recoveryEndMonth');

                if ($recoveryStart && $recoveryEnd &&
                    $startDate >= $recoveryStart &&
                    $startDate <= $recoveryEnd
                ) {

                    $timeline = $entityManager->getRepository('CTransactionTimeline')
                        ->where([
                            'loanId' => $loan->getId(),
                            'month'  => $startDate
                        ])
                        ->findOne();

                    if (!$timeline) {
                        continue;
                    }

                    $status = $timeline->get('status');

                    if ($status === 'Skipped' || $status === 'Deducted') {
                        continue;
                    }

                    if ($status === 'Pending') {

                        $emi = (float) $timeline->get('amount');

                        if ($emi > $pending) {
                            $emi = $pending;
                        }

                        // mark EMI deducted
                        $timeline->set('status', 'Deducted');
                        $entityManager->saveEntity($timeline);

                        // update loan
                        $loan->set([
                            'amountPending' => $pending - $emi,
                            'amountRepaid'  => $repaid + $emi
                        ]);

                        $entityManager->saveEntity($loan);

                        // update payslip
                        $newDeduction = $payslip->get('totalDeductions') + $emi;
                        $newCredited  = $payslip->get('amountCredited') - $emi;

                        $payslip->set([
                            'loanId' => $loan->getId(),
                            'totalDeductions' => $newDeduction,
                            'amountCredited'  => $newCredited
                        ]);

                        $entityManager->saveEntity($payslip);
                    }
                }
            }
        }
    }
}