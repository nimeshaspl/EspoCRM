<?php

namespace Espo\Custom\Services;

use Espo\ORM\EntityManager;
use Espo\Core\Exceptions\Error;

class TruncateTable
{
    private $entityManager;

    public function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function truncate(array $data): array
    {
        $tableName = $data['tableName'] ?? null;

        if (empty($tableName)) {
            throw new Error("Table name is required.");
        }

        // 🔒 Validate input
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $tableName)) {
            throw new Error("Invalid table name.");
        }

        $pdo = $this->entityManager->getPDO();

        // 🔍 Check table exists
        $stmt = $pdo->prepare("SHOW TABLES LIKE :table");
        $stmt->execute(['table' => $tableName]);

        if (!$stmt->fetch()) {
            throw new Error("Invalid table: '{$tableName}' does not exist.");
        }

        // ⚠️ STRONGLY RECOMMENDED whitelist
        $allowedTables = ['c_attendance','c_attendance_request','c_monthly_attendance_summary', 'c_holiday_selection', 'c_holiday', 'c_leave_request', 'c_leave_balance'];

        if (!in_array($tableName, $allowedTables)) {
            throw new Error("Not allowed to truncate '{$tableName}'.");
        }

        // 🚀 Truncate
        $pdo->exec("TRUNCATE TABLE `$tableName`");

        return [
            'status' => 'success',
            'message' => "Table '{$tableName}' truncated successfully."
        ];
    }
}