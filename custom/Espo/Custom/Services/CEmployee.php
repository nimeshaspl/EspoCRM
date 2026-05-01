<?php

namespace Espo\Custom\Services;

use Espo\ORM\EntityManager;

class CEmployee
{
    public function __construct(
        private EntityManager $entityManager
    ) {}

    protected function getEmployeeByUser($userId)
    {
        return $this->entityManager
            ->getRDBRepository('CEmployee')
            ->where(['userId' => $userId])
            ->findOne();
    }


}
