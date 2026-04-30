<?php

namespace Espo\Custom\Hooks\User;

use Espo\ORM\Entity;
use Espo\ORM\EntityManager;

class CreateEmployee
{
    private EntityManager $entityManager;

    public function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function afterSave(Entity $entity, array $options)
    {
        if (!$entity->isNew()) {
            return;
        }

        $roles = $entity->get('rolesIds');

        if (!$roles) {
            return;
        }

        foreach ($roles as $roleId) {

            $role = $this->entityManager->getEntity('Role', $roleId);

            if ($role && $role->get('name') === 'Employee') {

                // Prevent duplicate employee
                $existing = $this->entityManager
                    ->getRepository('CEmployee')
                    ->where(['userId' => $entity->getId()])
                    ->findOne();

                if ($existing) {
                    return;
                }

                $employee = $this->entityManager->getNewEntity('CEmployee');

                $employee->set([

                    // Basic Info
                    'name' => $entity->get('name'),

                    // Link User
                    'userId' => $entity->getId(),

                    // Status
                    'isActive' => $entity->get('isActive'),

                    // Team & Assignment
                    'assignedUserId' => $entity->getId(),
                    'teamsIds' => $entity->get('teamsIds'),

                    // Work Role / Position
                    'workRole' => $entity->get('title'),

                    // Optional description
                    'description' => 'Auto created from User'
                ]);

                $this->entityManager->saveEntity($employee);
            }
        }
    }
}