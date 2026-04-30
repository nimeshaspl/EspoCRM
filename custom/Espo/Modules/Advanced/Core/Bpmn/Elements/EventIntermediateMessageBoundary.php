<?php
/***********************************************************************************
 * The contents of this file are subject to the Extension License Agreement
 * ("Agreement") which can be viewed at
 * https://www.espocrm.com/extension-license-agreement/.
 * By copying, installing downloading, or using this file, You have unconditionally
 * agreed to the terms and conditions of the Agreement, and You may not use this
 * file except in compliance with the Agreement. Under the terms of the Agreement,
 * You shall not license, sublicense, sell, resell, rent, lease, lend, distribute,
 * redistribute, market, publish, commercialize, or otherwise transfer rights or
 * usage to the software or any modified version or derivative work of the software
 * created by or for you.
 *
 * Copyright (C) 2015-2024 Letrium Ltd.
 *
 * License ID: ad613d6f17d95068d74b41de4412a563
 ************************************************************************************/

namespace Espo\Modules\Advanced\Core\Bpmn\Elements;

use Espo\Modules\Advanced\Entities\BpmnFlowNode;

class EventIntermediateMessageBoundary extends EventIntermediateMessageCatch
{
    protected function proceedPendingFinal(): void
    {
        if ($this->getAttributeValue('cancelActivity')) {
            $this->getManager()->cancelActivityByBoundaryEvent($this->getFlowNode());
        } else {
            $this->createCopy();
        }

        $this->processNextElement();
    }

    protected function createCopy(): void
    {
        $flowNode = $this->getEntityManager()->getEntity(BpmnFlowNode::ENTITY_TYPE);

        $flowNode->set([
            'status' => BpmnFlowNode::STATUS_PENDING,
            'elementId' => $this->getFlowNode()->getElementId(),
            'elementType' => $this->getFlowNode()->getElementType(),
            'elementData' => $this->getFlowNode()->get('elementData'),
            'data' => (object) [],
            'flowchartId' => $this->getProcess()->getFlowchartId(),
            'processId' => $this->getProcess()->get('id'),
            'previousFlowNodeElementType' => $this->getFlowNode()->get('previousFlowNodeElementType'),
            'previousFlowNodeId' => $this->getFlowNode()->get('previousFlowNodeId'),
            'divergentFlowNodeId' => $this->getFlowNode()->get('divergentFlowNodeId'),
            'targetType' => $this->getFlowNode()->getTargetType(),
            'targetId' => $this->getFlowNode()->getTargetId(),
        ]);

        $this->getEntityManager()->saveEntity($flowNode);
    }
}
