<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Controllers\Record;

class CEmployeeBank extends Record
{
    public function actionSetActiveBank($params, $data)
    {
        $employeeId = $data->employeeId;
        $bankId = $data->bankId;

        $banks = $this->entityManager
            ->getRepository('CEmployeeBank')
            ->where(['employeeId' => $employeeId])
            ->find();

        foreach ($banks as $bank) {

            if ($bank->getId() === $bankId) {
                $bank->set('isActive', true);
            } else {
                $bank->set('isActive', false);
            }

            $this->entityManager->saveEntity($bank);
        }

        return [
            'status' => 'ok'
        ];
    }
}