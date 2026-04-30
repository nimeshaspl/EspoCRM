<?php

namespace Espo\Custom\Jobs;

use Espo\Core\Jobs\Base;
use Espo\ORM\EntityManager;

class MonthlyLeaveCredit extends Base
{
    protected $entityManager;

    public function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function run()
    {
        $userList = $this->entityManager
            ->getRepository('User')
            ->where([
                'isActive' => true
            ])
            ->find();

        $currentMonth = (int) date('n');
        $currentYear  = (int) date('Y');

        foreach ($userList as $user) {

            // Skip interns
            if ($user->get('cIsIntern')) {
                continue;
            }

            // Check Employee role
            $roles = $user->getLinkMultipleIdList('roles');
            $isEmployee = false;

            foreach ($roles as $roleId) {
                $role = $this->entityManager->getEntity('Role', $roleId);
                if ($role && $role->get('name') === 'Employee') {
                    $isEmployee = true;
                    break;
                }
            }

            if (!$isEmployee) {
                continue;
            }

            // 🔍 ALWAYS CHECK EXISTING RECORD (duplicate protection)
            $existingRecord = $this->entityManager->getRepository('CLeaveBalance')
                ->where([
                    'userId' => $user->getId(),
                    'fiscalYear' => $currentYear
                ])
                ->findOne();

            // ✅ JANUARY LOGIC
            if ($currentMonth === 1) {

                // If already exists → skip (prevents duplicates)
                if ($existingRecord) {
                    continue;
                }

                // Create new record
                $leaveBalance = $this->entityManager->getEntity('CLeaveBalance');
                $leaveBalance->set([
                    'name' => $user->get('name') . ' Leave Balance ' . $currentYear,
                    'userId' => $user->getId(),
                    'balance' => 1,
                    'assignedUserId' => $user->getId(),
                    'fiscalYear' => $currentYear,
                ]);

                $this->entityManager->saveEntity($leaveBalance);
                continue;
            }

            // ✅ OTHER MONTHS
            if ($existingRecord) {
                // Increment balance
                $currentBalance = (float) $existingRecord->get('balance');
                $existingRecord->set('balance', $currentBalance + 1);

                $this->entityManager->saveEntity($existingRecord);
            } else {
                // Safety fallback (if January missed)
                $leaveBalance = $this->entityManager->getEntity('CLeaveBalance');
                $leaveBalance->set([
                    'name' => $user->get('name') . ' Leave Balance ' . $currentYear,
                    'userId' => $user->getId(),
                    'balance' => 1,
                    'assignedUserId' => $user->getId(),
                    'fiscalYear' => $currentYear,
                ]);

                $this->entityManager->saveEntity($leaveBalance);
            }
        }

        return true;
    }
}