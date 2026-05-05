<?php

namespace Espo\Custom\Services;

use Espo\ORM\EntityManager;
use Espo\Core\Acl;
use Espo\Entities\User;

class UserEmployeeService
{
    public function __construct(
        private EntityManager $entityManager,
        private Acl $acl,
        private User $user
    ) {}

    public function getProfileCompletionStatus(): array
    {
        $user = $this->user;
        $isEmployee = $this->isEmployeeUser($user);

        $status = [
            'userId' => $user->getId(),
            'isEmployee' => $isEmployee,
            'defaultRoute' => '#Profile',
            'isComplete' => true,
            'shouldForceProfile' => false,
            'missingSteps' => [],
            'primaryMissingStep' => null,
        ];

        if (!$isEmployee) {
            return $status;
        }

        $employee = $this->findEmployeeByUserId($user->getId());

        if (!$employee) {
            $status['isComplete'] = false;
            $status['shouldForceProfile'] = true;
            $status['missingSteps'][] = $this->makeStep(
                'employee-record',
                'Employee Record',
                'Your employee profile is not linked yet. Please contact admin before continuing.',
                null
            );
            $status['primaryMissingStep'] = $status['missingSteps'][0];

            return $status;
        }

        $employeeId = $employee->getId();
        $missingSteps = [];

        if (!$this->hasRequiredBioData($user)) {
            $missingSteps[] = $this->makeStep(
                'bio',
                'Bio Data',
                'Please complete your basic profile details first.',
                'editAbout'
            );
        }

        $permanentAddress = $this->findEmployeeAddressByType($employeeId, 'permanent');

        if (!$this->hasCompleteAddress($permanentAddress)) {
            $missingSteps[] = $this->makeStep(
                'address-permanent',
                'Permanent Address',
                'Please fill your permanent address details.',
                'editPermanentAddress'
            );
        }

        $currentAddress = $this->findEmployeeAddressByType($employeeId, 'current');

        if (!$this->hasCompleteAddress($currentAddress)) {
            $missingSteps[] = $this->makeStep(
                'address-current',
                'Current Address',
                'Please fill your current address details.',
                'editCurrentAddress'
            );
        }

        if (!$this->hasRelatedRecord('CEmployeeContact', $employeeId)) {
            $missingSteps[] = $this->makeStep(
                'contact',
                'Contact',
                'Please add at least one contact detail.',
                'addContact'
            );
        }

        if (!$this->hasRelatedRecord('CEmployeeDependent', $employeeId)) {
            $missingSteps[] = $this->makeStep(
                'dependent',
                'Dependent',
                'Please add at least one dependent or emergency dependent record.',
                'addDependent'
            );
        }

        $aadhaar = $this->findLatestEmployeeRecord('CADHAR', $employeeId);

        if (!$this->hasCompleteAadhaar($aadhaar)) {
            $missingSteps[] = $this->makeStep(
                'document-aadhaar',
                'Aadhaar Document',
                'Please fill your Aadhaar details and upload the Aadhaar document image.',
                'editAadhaar'
            );
        }

        $status['missingSteps'] = $missingSteps;
        $status['isComplete'] = count($missingSteps) === 0;
        $status['shouldForceProfile'] = !$status['isComplete'];
        $status['primaryMissingStep'] = $missingSteps[0] ?? null;

        return $status;
    }

    public function createEmployeesForUsers(): int
    {
        $count = 0;

        $users = $this->entityManager->getRepository('User')->find();

        foreach ($users as $user) {

            if (!$user->get('isActive')) {
                continue;
            }

            $roles = $user->getLinkMultipleIdList('roles');

            if (!$roles) {
                continue;
            }

            if (!$this->isEmployeeUser($user)) {
                continue;
            }

            // Prevent duplicate
            $existing = $this->entityManager
                ->getRDBRepository('CEmployee')
                ->where(['userId' => $user->getId()])
                ->findOne();

            if ($existing) {
                continue;
            }

            // Create employee
            $employee = $this->entityManager->getNewEntity('CEmployee');

            $employee->set([
                'name'           => $user->get('name'),
                'userId'         => $user->getId(),
                'isActive'       => $user->get('isActive'),
                'assignedUserId' => $user->getId(),
                'teamsIds'       => $user->get('teamsIds'),
                'description'    => 'Created from button'
            ]);

            $this->entityManager->saveEntity($employee);

            $count++;
        }

        return $count;
    }

    private function isEmployeeUser(User $user): bool
    {
        $roles = $user->getLinkMultipleIdList('roles');

        if (!$roles) {
            return false;
        }

        foreach ($roles as $roleId) {
            $role = $this->entityManager
                ->getRDBRepository('Role')
                ->where(['id' => $roleId])
                ->findOne();

            if ($role && strtolower((string) $role->get('name')) === 'employee') {
                return true;
            }
        }

        return false;
    }

    private function findEmployeeByUserId(string $userId): ?object
    {
        return $this->entityManager
            ->getRDBRepository('CEmployee')
            ->where(['userId' => $userId])
            ->findOne();
    }

    private function findEmployeeAddressByType(string $employeeId, string $addressType): ?object
    {
        $addressList = $this->entityManager
            ->getRDBRepository('CEmployeeAddress')
            ->where(['employeeId' => $employeeId])
            ->find();

        if (!$addressList) {
            return null;
        }

        $target = strtolower(trim($addressType));
        $matched = [];

        foreach ($addressList as $address) {
            $type = strtolower(trim((string) $address->get('addressType')));
            $normalizedType = str_replace([' ', '-', '_'], '', $type);

            if ($type === $target || $normalizedType === $target) {
                $matched[] = $address;
                continue;
            }

            // Accept common enum key variants if metadata keys differ from labels.
            if ($target === 'permanent' && in_array($normalizedType, ['perm', 'permanentaddress'], true)) {
                $matched[] = $address;
                continue;
            }

            if ($target === 'current' && in_array($normalizedType, ['curr', 'present', 'currentaddress'], true)) {
                $matched[] = $address;
            }
        }

        if (!$matched) {
            return null;
        }

        // If duplicates exist, prefer a complete record for profile-completion checks.
        foreach ($matched as $address) {
            if ($this->hasCompleteAddress($address)) {
                return $address;
            }
        }

        return $matched[0];
    }

    private function findLatestEmployeeRecord(string $entityType, string $employeeId): ?object
    {
        return $this->entityManager
            ->getRDBRepository($entityType)
            ->where(['employeeId' => $employeeId])
            ->order('modifiedAt', 'DESC')
            ->findOne();
    }

    private function hasRelatedRecord(string $entityType, string $employeeId): bool
    {
        return $this->entityManager
            ->getRDBRepository($entityType)
            ->where(['employeeId' => $employeeId])
            ->findOne() !== null;
    }

    private function hasRequiredBioData(User $user): bool
    {
        return $this->hasText($user->get('firstName')) &&
            $this->hasText($user->get('lastName')) &&
            $this->hasText($user->get('gender')) &&
            $this->hasText($user->get('cBloodGroup')) &&
            $this->hasText($user->get('cMaritialStatus')) &&
            $this->hasText($user->get('cDob'));
    }

    private function hasCompleteAddress(?object $address): bool
    {
        if (!$address) {
            return false;
        }

        return $this->hasText($address->get('name')) &&
            $this->hasText($address->get('countryId')) &&
            $this->hasText($address->get('stateId')) &&
            $this->hasText($address->get('cityId'));
    }

    private function hasCompleteAadhaar(?object $record): bool
    {
        if (!$record) {
            return false;
        }

        return $this->hasText($record->get('name')) &&
            $this->hasText($record->get('adharNumber')) &&
            (
                $this->hasText($record->get('attachmentsId')) ||
                $this->hasText($record->get('attachmentId'))
            );
    }

    private function hasText(mixed $value): bool
    {
        if (is_array($value)) {
            return count(array_filter($value, fn ($item) => $this->hasText($item))) > 0;
        }

        return trim((string) ($value ?? '')) !== '';
    }

    private function makeStep(string $key, string $title, string $message, ?string $action): array
    {
        return [
            'key' => $key,
            'title' => $title,
            'message' => $message,
            'action' => $action,
        ];
    }
}
