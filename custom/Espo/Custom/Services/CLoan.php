<?php

namespace Espo\Custom\Services;

use Espo\Core\Templates\Services\Base;

class CLoan extends Base
{
    public function createCreditTimeline(string $loanId)
    {
        $entityManager = $this->getEntityManager();

        $loan = $entityManager->getEntity('CLoan', $loanId);

        if (!$loan) {
            throw new \Exception('Loan not found');
        }

        $timeline = $entityManager->getNewEntity('CTransactionTimeline');

        $timeline->set([
            'month'  => date('Y-m-d'),
            'status' => 'Credited',
            'amount' => $loan->get('loanAmount'), // better to use loanAmount
            'loanId' => $loan->id
        ]);

        $entityManager->saveEntity($timeline);
    }
}