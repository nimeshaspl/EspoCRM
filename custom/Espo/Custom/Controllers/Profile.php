<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Api\Request;
use Espo\Core\Controllers\Base;
use Espo\Core\Di;

class Profile extends Base implements Di\InjectableFactoryAware
{
    use Di\InjectableFactorySetter;

    public function getActionData(Request $request): array
    {
        /** @var \Espo\Custom\Services\Profile $service */
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\Profile');

        return $service->getPageData();
    }

    public function postActionUpdate(Request $request): array
    {
        /** @var \Espo\Custom\Services\Profile $service */
        $service = $this->injectableFactory->create('Espo\\Custom\\Services\\Profile');

        $body = $request->getParsedBody();

        return $service->updateField([
            'entityType' => $body->entityType ?? null,
            'recordId' => $body->recordId ?? null,
            'field' => $body->field ?? null,
            'value' => $body->value ?? null
        ]);
    }

    public function postActionUploadAvatar(Request $request): array
    {
        $body = $request->getParsedBody();
        $userId = $body->userId ?? null;

        if (!$userId) {
            throw new \Espo\Core\Exceptions\BadRequest("No user ID.");
        }

        if ($userId !== $this->user->getId() && !$this->user->isAdmin()) {
            throw new \Espo\Core\Exceptions\Forbidden();
        }

        $user = $this->entityManager->getEntity('User', $userId);

        if (!$user) {
            throw new \Espo\Core\Exceptions\NotFound();
        }

        $contents = $request->getBodyContents();

        if (!$contents) {
            throw new \Espo\Core\Exceptions\BadRequest("No file contents.");
        }

        $attachment = $this->entityManager->getNewEntity('Attachment');

        $attachment->set([
            'name' => 'avatar.jpg',
            'type' => 'image/jpeg',
            'size' => strlen($contents),
            'contents' => $contents,
            'role' => 'Attachment',
            'relatedType' => 'User',
            'relatedId' => $userId,
        ]);

        $this->entityManager->saveEntity($attachment);

        // Remove old avatar if exists
        $oldAvatarId = $user->get('avatarId');

        if ($oldAvatarId) {
            $oldAttachment = $this->entityManager->getEntity('Attachment', $oldAvatarId);

            if ($oldAttachment) {
                $this->entityManager->removeEntity($oldAttachment);
            }
        }

        // Update user with new avatar
        $user->set('avatarId', $attachment->getId());
        $this->entityManager->saveEntity($user);

        return [
            'success' => true,
            'id' => $attachment->getId(),
            'url' => '?entryPoint=image&id=' . $attachment->getId(),
        ];
    }

    public function postActionRemoveAvatar(Request $request): array
    {
        $body = $request->getParsedBody();
        $userId = $body->userId ?? null;

        if (!$userId) {
            throw new \Espo\Core\Exceptions\BadRequest("No user ID.");
        }

        if ($userId !== $this->user->getId() && !$this->user->isAdmin()) {
            throw new \Espo\Core\Exceptions\Forbidden();
        }

        $user = $this->entityManager->getEntity('User', $userId);

        if (!$user) {
            throw new \Espo\Core\Exceptions\NotFound();
        }

        $avatarId = $user->get('avatarId');

        if ($avatarId) {
            $attachment = $this->entityManager->getEntity('Attachment', $avatarId);

            if ($attachment) {
                $this->entityManager->removeEntity($attachment);
            }

            // Update user to remove avatar reference
            $user->set('avatarId', null);
            $this->entityManager->saveEntity($user);
        }

        return ['success' => true];
    }
}