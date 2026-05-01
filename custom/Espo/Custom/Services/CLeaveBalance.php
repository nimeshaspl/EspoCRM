<?php

namespace Espo\Custom\Services;

use Espo\ORM\EntityManager;
use Espo\Core\Acl;
use Espo\Entities\User;

class CLeaveBalance
{
    public function __construct(
        private EntityManager $entityManager,
        private Acl $acl,
        private User $user
    ) {}

    /* =====================================================
     * GET LEAVE BALANCE
     * ===================================================== */

    public function getLeaveBalance(): array
    {
        $user = $this->user;

        $record = $this->entityManager
            ->getRDBRepository('CLeaveBalance')
            ->where([
                'userId' => $user->getId()
            ])
            ->findOne();

        return [
            'totalLeave' => $record ? (float) $record->get('balance') : 0
        ];
    }
}