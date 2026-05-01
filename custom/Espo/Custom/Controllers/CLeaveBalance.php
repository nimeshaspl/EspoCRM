<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Api\Request;
use Espo\Core\Controllers\Record;

class CLeaveBalance extends Record
{
    public function getActionLeaveBalance(Request $request): array
    {
        /** @var \Espo\Custom\Services\CLeaveBalance $service */
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\CLeaveBalance');

        return $service->getLeaveBalance();
    }
}