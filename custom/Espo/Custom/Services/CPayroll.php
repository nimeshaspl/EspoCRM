<?php

namespace Espo\Custom\Services;

use Espo\ORM\EntityManager;
use Espo\Core\Job\JobManager;

class CPayroll
{
    private EntityManager $entityManager;
    private JobManager $jobManager;

    public function __construct(
        EntityManager $entityManager,
        JobManager $jobManager
    ) {
        $this->entityManager = $entityManager;
        $this->jobManager = $jobManager;
    }

    /* =====================================
     * RUN PAYROLL
     * ===================================== */
    public function runPayroll(): array
    {
        $entityManager = $this->entityManager;

        // Get previous month
        $monthDate = new \DateTime('first day of last month');
        $payrollDate = $monthDate->format('Y-m-01');

        // Check last payroll
        $payroll = $entityManager
            ->getRDBRepository('CPayroll')
            ->order('date', 'DESC')
            ->findOne();

        if ($payroll && !$payroll->get('isPayrollClose')) {
            return [
                'success' => false,
                'message' => 'You must close the previous payroll'
            ];
        }

        // Create new payroll
        $newPayroll = $entityManager->getNewEntity('CPayroll');

        $newPayroll->set([
            'name'           => 'Payroll ' . $monthDate->format('F Y'),
            'date'           => $payrollDate,
            'isPayrollClose' => false
        ]);

        $entityManager->saveEntity($newPayroll);

        return [
            'success' => true,
            'message' => 'Payroll started successfully for ' . $monthDate->format('F Y')
        ];
    }

    /* =====================================
     * GENERATE PAYROLL DATA
     * ===================================== */
    public function generatePayrollData($data): array
    {
        // 🔹 Step 1: Truncate Payroll Issue table
        $pdo = $this->entityManager->getPDO();
        $pdo->exec("TRUNCATE TABLE c_payroll_issue");

        $type = $data['payrollType'] ?? 'all';
        $employeeName = trim($data['employeeName'] ?? '');

        $employeeRepo = $this->entityManager->getRDBRepository('CEmployee');

        $employees = [];

        // Select employees based on payroll type
        if ($type === 'all') {

            $employees = $employeeRepo->find();

        } elseif ($type === 'specific' && $employeeName !== '') {

            $employees = $employeeRepo
                ->where([
                    'name*' => $employeeName
                ])
                ->find();

        } elseif ($type === 'fnf') {

            $employees = $employeeRepo
                ->where([
                    'isActive' => 0
                ])
                ->find();
        }

        $issues = [];

        $monthDate = new \DateTime('first day of last month');

        $startDate = $monthDate->format('Y-m-01');
        $endDate   = $monthDate->format('Y-m-t');
        $month     = $startDate;

        foreach ($employees as $employee) {

            $attendanceRecords = $this->entityManager
                ->getRDBRepository('CAttendance')
                ->where([
                    'employeeId' => $employee->getId(),
                    'date>=' => $startDate,
                    'date<=' => $endDate
                ])
                ->find();

            $absentCount = 0;
            $leaveCount  = 0;
            $halfDayCount = 0;

            foreach ($attendanceRecords as $record) {

                $status = strtolower(trim($record->get('status')));

                if ($status === 'absent') {
                    $absentCount++;
                }

                if ($status === 'leave') {
                    $leaveCount++;
                }

                if ($status === 'half-day') {
                    $halfDayCount++;
                }
            }

            if ($absentCount === 0 && $leaveCount === 0 && $halfDayCount === 0) {
                continue;
            }

            $reasonParts = [];

            if ($absentCount > 0) {
                $reasonParts[] = $absentCount . ' day(s) Absent';
            }

            if ($leaveCount > 0) {
                $reasonParts[] = $leaveCount . ' day(s) Leave';
            }

            if ($halfDayCount > 0) {
                $reasonParts[] = $halfDayCount . ' day(s) Half Day';
            }

            $reasonText = implode(' and ', $reasonParts);

            $issue = $this->entityManager->getNewEntity('CPayrollIssue');

            $issue->set([
                'name'        => 'Attendance Issue - ' . $employee->get('name'),
                'employeeId'  => $employee->getId(),
                'month'       => $month,
                'leaveDays'   => $leaveCount,
                'absentDays'  => $absentCount,
                'halfDayDays' => $halfDayCount,
                'reason'      => $reasonText
            ]);

            $this->entityManager->saveEntity($issue);

            $issues[] = [
                'employee' => $employee->get('name'),
                'reason'   => $reasonText
            ];
        }

        return [
            'success' => true,
            'issues'  => $issues
        ];
    }


    /* =====================================
     * Confirm PAYROLL 
     * ===================================== */
    public function confirmRunPayroll(): array
    {
        $entityManager = $this->entityManager;

        // Create Job entity
        $job = $entityManager->getNewEntity('Job');

        $job->set([
            'name' => 'Generate Monthly Payslip',
            'job'  => 'GenerateMonthlyPayslip'
        ]);

        $entityManager->saveEntity($job);

        // Run job immediately
        $this->jobManager->runJob($job);

        // Get latest payroll
        $payroll = $entityManager
            ->getRDBRepository('CPayroll')
            ->order('createdAt', 'DESC')
            ->findOne();

        if (!$payroll) {
            return [
                'success' => false,
                'message' => 'No payroll record found'
            ];
        }

        // Previous month
        $monthDate = new \DateTime('first day of last month');
        $startDate = $monthDate->format('Y-m-01');

        // Get generated payslips
        $payslips = $entityManager
            ->getRDBRepository('CPayslip')
            ->where([
                'month' => $startDate
            ])
            ->find();

        $totalEmployees = 0;
        $totalSalary = 0;
        $totalPTGross = 0;

        foreach ($payslips as $payslip) {

            $totalEmployees++;

            $totalSalary += (float) $payslip->get('amountCredited');

            $package = $payslip->get('payPackage');

            if ($package) {
                $totalPTGross += (float) $package->get('pTGross');
            }
        }

        // Update payroll totals
        $payroll->set([
            'totalEmployees' => $totalEmployees,
            'wageAmount'     => $totalSalary,
            'pTGross'        => $totalPTGross,
            'taxPayment'     => 0,
            'salaryPayout'   => $totalSalary
        ]);

        $entityManager->saveEntity($payroll);

        return [
            'success' => true,
            'message' => 'Payroll confirmed and payslip generation started.'
        ];
    }

    /* =====================================
     * CLOSE PAYROLL
     * ===================================== */
    public function closePayroll(): array
    {
        $entityManager = $this->entityManager;

        $payroll = $entityManager
            ->getRDBRepository('CPayroll')
            ->order('date', 'DESC')
            ->findOne();

        if (!$payroll) {
            return [
                'success' => false,
                'message' => 'No payroll found'
            ];
        }

        $payroll->set('isPayrollClose', true);

        $entityManager->saveEntity($payroll);

        return [
            'success' => true,
            'message' => 'Payroll closed successfully'
        ];
    }

    /* =====================================
     * GENERATE PAYSLIP
     * ===================================== */
    public function generatePayslip(): array
    {
        $this->jobManager->enqueue('GenerateMonthlyPayslip');

        return [
            'success' => true,
            'message' => 'Payslip generation job started'
        ];
    }
}