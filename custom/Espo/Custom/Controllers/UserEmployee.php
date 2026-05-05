<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Api\Request;
use Espo\Core\Controllers\Base;
use Espo\Core\Di;

class UserEmployee extends Base implements Di\InjectableFactoryAware
{
    use Di\InjectableFactorySetter;

    public function getActionProfileCompletionStatus(): array
    {
        /** @var \Espo\Custom\Services\UserEmployeeService $service */
        $service = $this->injectableFactory
            ->create('Espo\\Custom\\Services\\UserEmployeeService');

        return $service->getProfileCompletionStatus();
    }

    public function postActionCreateEmployees(Request $request): array
    {
        /** @var \Espo\Custom\Services\UserEmployeeService $service */
        $service = $this->injectableFactory
            ->create('Espo\\Custom\\Services\\UserEmployeeService');

        $count = $service->createEmployeesForUsers();

        return [
            'status' => 'success',
            'count'  => $count
        ];
    }
}
