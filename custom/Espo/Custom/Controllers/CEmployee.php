<?php

namespace Espo\Custom\Controllers;

class CEmployee extends \Espo\Core\Templates\Controllers\Base
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

            $bank->set('isActive', $bank->getId() === $bankId);

            $this->entityManager->saveEntity($bank);
        }

        return ['status' => 'ok'];
    }
    
}
