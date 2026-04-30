<?php

namespace Espo\Custom\Services;

use Espo\Core\Acl;
use Espo\Entities\User;
use Espo\ORM\EntityManager;

class Profile
{
    public function __construct(
        private EntityManager $entityManager,
        private Acl $acl,
        private User $user
    ) {}

    public function getPageData(): array
    {
        $user = $this->user;
        $roleNames = $this->getRoleNames($user);
        $employeeData = $this->getEmployeeData($user->getId());
        $avatarId = $user->get('avatarId');

        return [
            'success' => true,
            'user' => [
                'id' => $user->getId(),
                'name' => $user->get('name'),
                'userName' => $user->get('userName'),
                'title' => $user->get('title'),
                'emailAddress' => $user->get('emailAddress'),
                'type' => $user->get('type'),
                'avatarId' => $avatarId,
                'avatarUrl' => $avatarId ? '?entryPoint=image&id=' . $avatarId : null,
                'roles' => $roleNames,
                'gender' => $user->get('gender'),
                'bloodGroup' => $user->get('bloodGroup'),
                'maritalStatus' => $user->get('maritalStatus'),
                'createdAt' => $user->get('createdAt')
            ],
            'isEmployeeRole' => in_array('Employee', $roleNames, true),
            'hasEmployeeRecord' => (bool) ($employeeData['success'] ?? false),
            'employee' => $employeeData['employee'] ?? null,
            'manager' => $employeeData['manager'] ?? null,
            'departmentMembers' => $employeeData['departmentMembers'] ?? [],
            'totalDeptMembers' => $employeeData['totalDeptMembers'] ?? 0,
            'bankDetails' => $employeeData['bankDetails'] ?? null,
            'addresses' => $employeeData['addresses'] ?? [],
            'contacts' => $employeeData['contacts'] ?? [],
            'dependents' => $employeeData['dependents'] ?? [],
            'experiences' => $employeeData['experiences'] ?? [],
            'documents' => $employeeData['documents'] ?? (object) [],
            // 'todayAttendance' => $employeeData['todayAttendance'] ?? (object) [],
            // 'monthAttendance' => $employeeData['monthAttendance'] ?? (object) [],
            // // 'leaveBalance' => $employeeData['leaveBalance'] ?? [],
            // 'latestPayslip' => $employeeData['latestPayslip'] ?? null,
            // 'loans' => $employeeData['loans'] ?? [],
            // 'upcomingHolidays' => $employeeData['upcomingHolidays'] ?? [],
            // 'notices' => $employeeData['notices'] ?? []
        ];
    }

    private function getRoleNames(User $user): array
    {
        $roleNames = [];

        foreach ($user->getLinkMultipleIdList('roles') as $roleId) {
            $role = $this->entityManager->getEntityById('Role', $roleId);

            if ($role) {
                $roleNames[] = (string) $role->get('name');
            }
        }

        return $roleNames;
    }

    private function getEmployeeData(string $userId): array
    {
        $employee = $this->getEmployeeByUser($userId);

        if (!$employee) {
            return [
                'success' => false,
                'message' => 'Employee record not found.'
            ];
        }

        $empId = $employee->getId();
        $today = date('Y-m-d');
        $year = (int) date('Y');

        $profileId = $employee->get('profileId');
        $profileUrl = $profileId ? '?entryPoint=image&id=' . $profileId : null;
        $workRoleName = $employee->get('workRoleName') ?? '';
        $departmentName = $employee->get('departmentName') ?? '';

        $contacts = $this->entityManager->getRDBRepository('CEmployeeContact')
            ->where(['employeeId' => $empId])
            ->find();

        $phone = '';
        $email = '';
        $phoneContactId = null;
        $emailContactId = null;

        foreach ($contacts as $contact) {
            $desc = $contact->get('description') ?? '';
            $tag = strtolower($contact->get('contactTag') ?? '');

            if (($phone === '') && (strpos($tag, 'phone') !== false || strpos($tag, 'mobile') !== false)) {
                $phone = $desc;
                $phoneContactId = $contact->getId();
            }

            if (($email === '') && (strpos($tag, 'email') !== false || strpos($tag, 'mail') !== false)) {
                $email = $desc;
                $emailContactId = $contact->getId();
            }
        }

        if (!$email && $this->user->get('emailAddress')) {
            $email = $this->user->get('emailAddress');
        }

        $manager = null;
        $assignedUserId = $employee->get('assignedUserId');

        if ($assignedUserId) {
            $assignedUser = $this->entityManager->getEntityById('User', $assignedUserId);

            if ($assignedUser) {
                $manager = [
                    'id' => $assignedUser->getId(),
                    'name' => $assignedUser->get('name'),
                    'avatarId' => $assignedUser->get('avatarId')
                ];
            }
        }

        $departmentId = $employee->get('departmentId');
        $deptMembers = [];

        if ($departmentId) {
            $members = $this->entityManager->getRDBRepository('CEmployee')
                ->where(['departmentId' => $departmentId, 'isActive' => true])
                ->limit(7)
                ->find();

            foreach ($members as $member) {
                $deptMembers[] = [
                    'id' => $member->getId(),
                    'name' => $member->get('name'),
                    'profileId' => $member->get('profileId')
                ];
            }
        }

        $totalDeptMembers = 0;

        if ($departmentId) {
            $departmentEmployees = $this->entityManager->getRDBRepository('CEmployee')
                ->where(['departmentId' => $departmentId, 'isActive' => true])
                ->find();

            $totalDeptMembers = count($departmentEmployees);
        }

        $bankDetails = $this->getBankDetails($empId);
        $addresses = $this->getAddresses($empId);
        $contactList = $this->getContactList($contacts);
        $dependents = $this->getDependents($empId);
        $experiences = $this->getExperiences($empId);
        $documents = $this->getDocuments($empId);
        // $todayAttendance = $this->getTodayAttendance($empId, $today);
        // $monthAttendance = $this->getMonthAttendance($empId);
        // // $leaveBalance = $this->getLeaveBalance($empId, $year);
        // $latestPayslip = $this->getLatestPayslip($empId);
        // $loans = $this->getLoans($empId);
        // $upcomingHolidays = $this->getUpcomingHolidays($today);
        // $notices = $this->getNotices($today);

        return [
            'success' => true,
            'employee' => [
                'id' => $empId,
                'name' => $employee->get('name'),
                'profileUrl' => $profileUrl,
                'workRole' => $workRoleName,
                'department' => $departmentName,
                'departmentId' => $departmentId,
                'phone' => $phone,
                'phoneContactId' => $phoneContactId,
                'email' => $email,
                'emailContactId' => $emailContactId,
                'isActive' => $employee->get('isActive'),
                'isIntern' => $employee->get('isIntern'),
                'createdAt' => $employee->get('createdAt')
            ],
            'manager' => $manager,
            'departmentMembers' => $deptMembers,
            'totalDeptMembers' => $totalDeptMembers,
            'bankDetails' => $bankDetails,
            'addresses' => $addresses,
            'contacts' => $contactList,
            'dependents' => $dependents,
            'experiences' => $experiences,
            'documents' => $documents,
            // 'todayAttendance' => $todayAttendance,
            // 'monthAttendance' => $monthAttendance,
            // // 'leaveBalance' => $leaveBalance,
            // 'latestPayslip' => $latestPayslip,
            // 'loans' => $loans,
            // 'upcomingHolidays' => $upcomingHolidays,
            // 'notices' => $notices
        ];
    }

    private function getBankDetails(string $employeeId): ?array
    {
        $bankAccounts = $this->entityManager->getRDBRepository('CEmployeeBank')
            ->where(['employeeId' => $employeeId])
            ->find();

        foreach ($bankAccounts as $bankAccount) {
            if ($bankAccount->get('isActive')) {
                return $this->buildBankDetails($bankAccount);
            }
        }

        foreach ($bankAccounts as $bankAccount) {
            return $this->buildBankDetails($bankAccount);
        }

        return null;
    }

    private function buildBankDetails($bankAccount): array
    {
        $bank = $bankAccount->get('banksId')
            ? $this->entityManager->getEntityById('CBanks', $bankAccount->get('banksId'))
            : null;

        return [
            'id' => $bankAccount->getId(),
            'bankName' => $bank ? $bank->get('name') : ($bankAccount->get('banksName') ?? ''),
            'accountNo' => $bankAccount->get('accountNO') ?? '',
            'ifsc' => $bankAccount->get('iFSCCode') ?? ''
        ];
    }

    private function getAddresses(string $employeeId): array
    {
        $list = [];
        $records = $this->entityManager->getRDBRepository('CEmployeeAddress')
            ->where(['employeeId' => $employeeId])
            ->find();

        foreach ($records as $address) {
            $list[] = [
                'id' => $address->getId(),
                'address' => $address->get('address') ?? '',
                'addressType' => $address->get('addressType') ?? '',
                'cityName' => $address->get('cityName') ?? '',
                'stateName' => $address->get('stateName') ?? '',
                'countryName' => $address->get('countryName') ?? '',
                'postalCode' => $address->get('postalCode') ?? ''
            ];
        }

        return $list;
    }

    private function getContactList(iterable $contacts): array
    {
        $list = [];

        foreach ($contacts as $contact) {
            $list[] = [
                'id' => $contact->getId(),
                'name' => $contact->get('name') ?? '',
                'description' => $contact->get('description') ?? '',
                'contactTag' => $contact->get('contactTag') ?? '',
                'contactTypeName' => $contact->get('contactTypeName') ?? ''
            ];
        }

        return $list;
    }

    private function getDependents(string $employeeId): array
    {
        $list = [];
        $records = $this->entityManager->getRDBRepository('CEmployeeDependent')
            ->where(['employeeId' => $employeeId])
            ->find();

        foreach ($records as $dependent) {
            $list[] = [
                'id' => $dependent->getId(),
                'name' => $dependent->get('name') ?? '',
                'relationName' => $dependent->get('dependantRelationName') ?? '',
                'dateOfBirth' => $dependent->get('dateOfBirth') ?? '',
                'emergencyContactNumber' => $dependent->get('emergencyContactNumber') ?? ''
            ];
        }

        return $list;
    }

    private function getExperiences(string $employeeId): array
    {
        $list = [];
        $records = $this->entityManager->getRDBRepository('CEmployeePastExperience')
            ->where(['employeeId' => $employeeId])
            ->find();

        foreach ($records as $experience) {
            $list[] = [
                'id' => $experience->getId(),
                'companyName' => $experience->get('companyName') ?? '',
                'designation' => $experience->get('designation') ?? '',
                'from' => $experience->get('fromDate') ?? '',
                'to' => $experience->get('toDate') ?? '',
                'description' => $experience->get('description') ?? ''
            ];
        }

        return $list;
    }

    private function getDocuments(string $employeeId): array
    {
        return [
            'aadhaar' => $this->getAadhaar($employeeId),
            'panCard' => $this->getPanCard($employeeId),
            'passport' => $this->getPassport($employeeId),
            'drivingLicense' => $this->getDrivingLicense($employeeId),
            'voterIdCard' => $this->getVoterIdCard($employeeId)
        ];
    }

    private function getAadhaar(string $employeeId): ?array
    {
        $entity = $this->entityManager->getRDBRepository('CADHAR')
            ->where(['employeeId' => $employeeId])
            ->findOne();

        if (!$entity) {
            return null;
        }

        return [
            'id' => $entity->getId(),
            'name' => $entity->get('name') ?? '',
            'adharNumber' => $entity->get('adharNumber') ?? '',
            'enrollmentNumber' => $entity->get('adharEnrollementNumber') ?? '',
            'address' => $entity->get('addressAsPerAadhar') ?? ''
        ];
    }

    private function getPanCard(string $employeeId): ?array
    {
        $entity = $this->entityManager->getRDBRepository('CPanCard')
            ->where(['employeeId' => $employeeId])
            ->findOne();

        if (!$entity) {
            return null;
        }

        return [
            'id' => $entity->getId(),
            'number' => $entity->get('panCardNumber') ?? '',
            'name' => $entity->get('nameAsPerPanCard') ?? '',
            'dob' => $entity->get('dateOfBirthAsPerPanCard') ?? ''
        ];
    }

    private function getPassport(string $employeeId): ?array
    {
        $entity = $this->entityManager->getRDBRepository('CPassport')
            ->where(['employeeId' => $employeeId])
            ->findOne();

        if (!$entity) {
            return null;
        }

        return [
            'id' => $entity->getId(),
            'number' => $entity->get('passportNumber') ?? '',
            'name' => $entity->get('nameAsPerPassport') ?? '',
            'issueDate' => $entity->get('dateOfIssue') ?? '',
            'expiryDate' => $entity->get('expiryDate') ?? '',
            'placeOfBirth' => $entity->get('placeOfBirth') ?? ''
        ];
    }

    private function getDrivingLicense(string $employeeId): ?array
    {
        $entity = $this->entityManager->getRDBRepository('CDrivingLicense')
            ->where(['employeeId' => $employeeId])
            ->findOne();

        if (!$entity) {
            return null;
        }

        return [
            'id' => $entity->getId(),
            'number' => $entity->get('drivingLicenseNumber') ?? '',
            'issueDate' => $entity->get('dateOfIssue') ?? '',
            'expiryDate' => $entity->get('expiryDate') ?? ''
        ];
    }

    private function getVoterIdCard(string $employeeId): ?array
    {
        $entity = $this->entityManager->getRDBRepository('CVoterIdCard')
            ->where(['employeeId' => $employeeId])
            ->findOne();

        if (!$entity) {
            return null;
        }

        return [
            'id' => $entity->getId(),
            'number' => $entity->get('voterIDNumber') ?? '',
            'name' => $entity->get('nameAsPerVoterIDCard') ?? '',
            'dob' => $entity->get('dateOfBirth') ?? '',
            'fatherName' => $entity->get('fathersNameAsPerVoterIDCard') ?? ''
        ];
    }

    public function updateField(array $data): array
    {
        $entityType = $data['entityType'] ?? '';
        $recordId = $data['recordId'] ?? '';
        $field = $data['field'] ?? '';
        $value = $data['value'] ?? null;

        if (!$entityType || !$recordId || !$field) {
            return [
                'success' => false,
                'message' => 'Invalid request.'
            ];
        }

        $allowed = [
            'User',
            'CEmployee',
            'CEmployeeContact',
            'CEmployeeBank',
            'CEmployeeAddress',
            'CEmployeeDependent',
            'CEmployeePastExperience',
            'CADHAR',
            'CPanCard',
            'CPassport',
            'CDrivingLicense',
            'CVoterIdCard'
        ];

        if (!in_array($entityType, $allowed, true)) {
            return [
                'success' => false,
                'message' => 'Unsupported entity type.'
            ];
        }

        $entity = $this->entityManager->getEntityById($entityType, $recordId);

        if (!$entity) {
            return [
                'success' => false,
                'message' => 'Record not found.'
            ];
        }

        $entity->set($field, $value);
        $this->entityManager->saveEntity($entity);

        if ($entityType === 'User' && $field === 'name') {
            $employee = $this->getEmployeeByUser($recordId);

            if ($employee) {
                $employee->set('name', $value);
                $this->entityManager->saveEntity($employee);
            }
        }

        if ($entityType === 'CEmployee' && $field === 'name') {
            $userId = $entity->get('userId');

            if ($userId) {
                $user = $this->entityManager->getEntityById('User', $userId);

                if ($user) {
                    $user->set('name', $value);
                    $this->entityManager->saveEntity($user);
                }
            }
        }

        return [
            'success' => true,
            'value' => $value
        ];
    }

    private function getEmployeeByUser(string $userId)
    {
        return $this->entityManager->getRDBRepository('CEmployee')
            ->join('user')
            ->where(['user.id' => $userId])
            ->findOne();
    }
}