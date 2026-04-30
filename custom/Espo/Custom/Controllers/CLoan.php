<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Api\Request;
use Espo\Core\Api\Response;


class CLoan extends \Espo\Core\Templates\Controllers\Base
{
    // public function postActionCreateCreditTimeline(Request $request, Response $response)
    // {
    //     $data = $request->getParsedBody();
    //     $loanId = $data['loanId'] ?? null;

    //     if (!$loanId) {
    //         return ['status' => 'error', 'message' => 'Loan ID missing'];
    //     }

    //     try {
    //         $service = $this->getContainer()
    //             ->get('serviceFactory')
    //             ->create('CLoan');

    //         $service->createCreditTimeline($loanId);

    //         return ['status' => 'success', 'message' => 'Timeline created'];

    //     } catch (\Throwable $e) {

    //         return [
    //             'status' => 'error',
    //             'message' => $e->getMessage()
    //         ];
    //     }
    // }
    public function actionAddExtraInstallment($params, $data)
    {
        $loanId = $data->loanId;

        $repository = $this->entityManager->getRepository('CTransactionTimeline');

        $last = $repository
            ->where(['loanId' => $loanId])
            ->order('month', 'DESC')
            ->findOne();

        if (!$last) return;

        $date = new \DateTime($last->get('month'));
        $date->modify('+1 month');

        $timeline = $this->entityManager->getNewEntity('CTransactionTimeline');

        $timeline->set([
            'loanId' => $loanId,
            'installmentNo' => $last->get('installmentNo') + 1,
            'month' => $date->format('Y-m-01'),
            'amount' => $last->get('amount'),
            'principalPaid' => $last->get('principalPaid'),
            'interestCharged' => $last->get('interestCharged'),
            'balance' => $last->get('balance'),
            'status' => 'Pending'
        ]);

        $this->entityManager->saveEntity($timeline);

        return true;
    }
    // public function actionSkipEmi($params, $data)
    // {
    //     $timeline = $this->getEntityManager()
    //         ->getEntity('CTransactionTimeline', $data->id);

    //     $timeline->set('status', 'Skipped');

    //     $this->getEntityManager()->saveEntity($timeline);

    //     return true;
    // }
}