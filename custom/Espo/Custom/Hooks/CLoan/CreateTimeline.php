<?php

namespace Espo\Custom\Hooks\CLoan;

use Espo\ORM\Entity;
use Espo\ORM\EntityManager;
use DateTime;

class CreateTimeline
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

        $loanAmount = (float) $entity->get('loanAmount');
        $rate       = (float) $entity->get('interestRate'); // annual %
        $months     = (int) $entity->get('numberOfInstallments');

        $startMonth = $entity->get('recoveryStartMonth');

        if (!$startMonth || $months <= 0) {
            return;
        }

        $monthlyRate = $rate / 12 / 100;

        // EMI calculation
        $emi = ($loanAmount * $monthlyRate * pow(1 + $monthlyRate, $months))/ (pow(1 + $monthlyRate, $months) - 1);

        $balance = $loanAmount;

        $date = new DateTime($startMonth);

        for ($i = 1; $i <= $months; $i++) {

            $interest = $balance * $monthlyRate;

            $principal = $emi - $interest;

            $balance = $balance - $principal;

            $timeline = $this->entityManager->getNewEntity('CTransactionTimeline');

            $timeline->set([
                'loanId' => $entity->getId(),
                'installmentNo' => $i,
                'month' => $date->format('Y-m-01'),
                'amount' => round($emi,2),
                'principalPaid' => round($principal,2),
                'interestCharged' => round($interest,2),
                'balance' => round(max($balance,0),2),
                'status' => 'Pending'
            ]);

            $this->entityManager->saveEntity($timeline);

            $date->modify('+1 month');
        }

        // credit entry
        $credit = $this->entityManager->getNewEntity('CTransactionTimeline');

        $credit->set([
            'loanId' => $entity->getId(),
            'month' => $entity->get('loanCreditedOn'),
            'status' => 'Credited',
            'amount' => $loanAmount
        ]);

        $this->entityManager->saveEntity($credit);
    }
}