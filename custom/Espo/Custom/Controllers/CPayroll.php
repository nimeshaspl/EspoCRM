<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Controllers\Record;
use Espo\Core\Api\Request;

class CPayroll extends Record
{
    public function postActionRunPayroll(Request $request): array
    {
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\CPayroll');
        return $service->runPayroll();
    }

    public function postActiongeneratePayrollData(Request $request): array
    {
        $data = (array) $request->getParsedBody(); 

        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\CPayroll');

        return $service->generatePayrollData($data);
    }

    public function postActionClosePayroll(Request $request): array
    {
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\CPayroll');
        return $service->closePayroll();
    }

    public function postActionGeneratePayslip(Request $request): array
    {
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\CPayroll');
        return $service->generatePayslip();
    }

    public function postActionConfirmRunPayroll(Request $request): array
    {
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\CPayroll');
        return $service->confirmRunPayroll();
    }

    public function postActionGenerateTaxSheet(Request $request): array
    {
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\CPayroll');
        return $service->generateTaxSheet();
    }

    public function postActionSyncTaxSheet(Request $request): array
    {
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\CPayroll');
        return $service->syncTaxSheet();
    }

    public function getActionLatestPayroll()
    {
        $entityManager = $this->getEntityManager();

        $records = $entityManager
            ->getRepository('CPayroll')
            ->where([])
            ->order('createdAt', 'DESC')
            ->limit(1)
            ->find();

        if (!$records || !count($records)) {
            return [];
        }

        $record = $records[0];

        return [
            'id' => $record->get('id'),
            'totalEmployees' => $record->get('totalEmployees'),
            'pTGross' => $record->get('pTGross'),
            'salaryPayout' => $record->get('salaryPayout'),
            'wageAmount' => $record->get('wageAmount'),
            'taxPayment' => $record->get('taxPayment'),
            'createdAt' => $record->get('createdAt')
        ];
    }
    
}