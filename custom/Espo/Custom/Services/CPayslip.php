<?php

namespace Espo\Custom\Services;

use Espo\ORM\Entity;
use Espo\Core\Exceptions\Error;

class CPayslip extends \Espo\Core\Templates\Services\Base
{
    public function beforeCreateEntity($entity, $data)
    {
        $existing = $this->getEntityManager()
            ->getRepository('CPayslip')
            ->where([
                'employeeId' => $data->employeeId ?? null,
                'month' => $data->month ?? null
            ])
            ->findOne();

        if ($existing) {
            throw new \Espo\Core\Exceptions\Error("Payslip already exists for this employee for selected month.");
        }
    }
    
}