<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Api\Request;
use Espo\Core\Controllers\Record;

class TruncateTable extends Record
{
    public function postActionTruncate(Request $request): array
    {
        /** @var \Espo\Custom\Services\TruncateTable $service */
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\TruncateTable');

        $data = (array) $request->getParsedBody(); // ✅ FIX

        return $service->truncate($data);
    }
}