<?php

namespace Espo\Custom\Services;

use Espo\ORM\EntityManager;
use Espo\Entities\User;

class UserRoleService
{
    public function __construct(
        private EntityManager $entityManager,
        private User $user
    ) {}

    public function getUserRoles(): array
    {
        $user = $this->user;

        $roles = [];

        foreach ($user->getLinkMultipleIdList('roles') as $roleId) {

            $role = $this->entityManager
                ->getRDBRepository('Role')
                ->where(['id' => $roleId])
                ->findOne();

            if ($role) {
                $roles[] = [
                    'id'   => $role->getId(),
                    'name' => $role->get('name'),
                    'cIsIntern' => $role->get('cIsIntern') ?? false,
                ];
            }
        }

        return [
            'status' => 'success',
            'userId' => $user->getId(),
            'roles'  => $roles
        ];
    }

    public function getEmployeeList(): array
    {
        // Find the "Employee" role
        $employeeRole = $this->entityManager
            ->getRDBRepository('Role')
            ->where(['name' => 'Employee'])
            ->findOne();

        if (!$employeeRole) {
            return ['list' => []];
        }

        $roleId = $employeeRole->getId();

        // Fetch all users who have this role via the entity manager's relationship query
        $users = $this->entityManager
            ->getRDBRepository('User')
            ->join('roles')
            ->where(['rolesMiddle.roleId' => $roleId, 'isActive' => true])
            ->select(['id', 'name', 'cIsIntern','isActive','avatarId','cIsWorkFromHome'])
            ->find();

        $list = [];
        foreach ($users as $u) {
            $list[] = [
                'id'   => $u->getId(),
                'name' => $u->get('name'),
                'cIsIntern' => $u->get('cIsIntern'),
                'isActive' => $u->get('isActive'),
                'avatarId' => $u->get('avatarId'),
                'cIsWorkFromHome' => $u->get('cIsWorkFromHome')
            ];
        }

        return ['list' => $list];
    }
}