<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Controllers\Record;

class CPayslip extends Record
{
    public function actionGetPreviousMonthPayslips($params, $data)
    {
        $month = (int) $data->month;
        $year = (int) $data->year;

        $startDate = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '-01';
        $endDate = date("Y-m-t", strtotime($startDate)); // last day of month

        $repository = $this->entityManager->getRepository('CPayslip');

        $payslips = $repository
            ->where([
                'month>=' => $startDate,
                'month<=' => $endDate
            ])
            ->find();

        $result = [];

        foreach ($payslips as $payslip) {
            $employee = $payslip->get('employee');

            $cityName = '';

            if ($employee) {

                $addressList = $this->getEntityManager()
                    ->getRepository('CEmployeeAddress')
                    ->where(['employeeId' => $employee->get('id')])
                    ->limit(1)
                    ->find();

                if ($addressList && count($addressList)) {

                    $address = $addressList[0];

                    $city = $address->get('city');

                    if ($city) {
                        $cityName = $city->get('name');
                    }
                }
            }

            $employee = $this->entityManager->getEntity(
                'CEmployee',
                $payslip->get('employeeId')
            );

            $result[] = [
                'employeeName' => $employee ? $employee->get('name') : '',
                'departmentName' => $employee ? $employee->get('departmentName') : '',
                'workRoleName' => $employee ? $employee->get('workRoleName') : '',
                'location' =>  $cityName,
                'salary' => $payslip->get('amountCredited')
            ];
        }

        return $result;
    }
}