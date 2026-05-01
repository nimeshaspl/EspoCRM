<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Api\Request;
use Espo\Core\Controllers\Record;

class CAttendance extends Record
{
    public function postActionClockIn(Request $request): array
    {
        /** @var \Espo\Custom\Services\CAttendance $service */
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\CAttendance');

        return $service->clockIn($request->getParsedBody());
    }

    public function postActionClockOut(Request $request): array
    {
        /** @var \Espo\Custom\Services\CAttendance $service */
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\CAttendance');

        return $service->clockOut($request->getParsedBody());
    }

    public function getActionTodayStatus(): array
    {
        /** @var \Espo\Custom\Services\CAttendance $service */
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\CAttendance');

        return $service->getTodayStatus();
    }

    public function getActionUserRoles(): array
    {
        /** @var \Espo\Custom\Services\UserRoleService $service */
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\UserRoleService');

        return $service->getUserRoles();
    }

    public function getActionEmployeeList(): array
    {
        /** @var \Espo\Custom\Services\UserRoleService $service */
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\UserRoleService');

        return $service->getEmployeeList();
    }
}
