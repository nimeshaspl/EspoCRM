<?php
namespace Espo\Custom\Controllers;

use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\Exceptions\Forbidden;
use GuzzleHttp\Psr7\Utils;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ExportDataMaster
{
    public function __construct(
        private \Espo\ORM\EntityManager $entityManager,
        private \Espo\Core\Acl $acl
    ) {}

    public function getActionExport(Request $request, Response $response): void
    {
        // ACL check — only allow logged-in users
        if (!$this->acl->check('User', 'read')) {
            throw new Forbidden();
        }

        $rows = [];

        // 1. Fetch all Users
        $userCollection = $this->entityManager
            ->getRDBRepository('User')
            ->where(['isActive' => true])
            ->find();

        foreach ($userCollection as $user) {
            // 2. Fetch related CEmployee (one-to-one)
            $employee = $this->entityManager
                ->getRDBRepository('CEmployee')
                ->where(['userId' => $user->getId()])
                ->findOne();

            if (!$employee) {
                $rows[] = $this->buildRow($user, null, null, null);
                continue;
            }

            // 3. Fetch all CEmployeeAddresses (one-to-many)
            $addressCollection = $this->entityManager
                ->getRDBRepository('CEmployeeAddress')
                ->where(['employeeId' => $employee->getId()])
                ->find();

            $addresses = iterator_to_array($addressCollection);

            $current = null;
            $permanent = null;
            foreach ($addresses as $addr) {
                if ($addr->get('addressType') === 'Current') $current = $addr;
                if ($addr->get('addressType') === 'Permanent') $permanent = $addr;
            }

            $rows[] = $this->buildRow($user, $employee, $current, $permanent);
        }

        // 4. Build Excel
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Employee Data');

        // Headers
        $headers = [
            'Username', 'Email', 'Full Name', 'Gender', 'Marital Status', 'Date of Joining', 'Date of Birth',
            'Current Address', 'Permanent Address'
        ];

        $sheet->fromArray([$headers], null, 'A1');
        // Header style
        $lastCol = 'I'; // Column I for 9 headers
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
                'name' => 'Arial',
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2E4057'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->freezePane('A2');
        $sheet->getRowDimension(1)->setRowHeight(20);

        // Data rows
        $rowIndex = 2;
        foreach ($rows as $row) {
            $sheet->fromArray([$row], null, 'A' . $rowIndex);

            // Alternating row colors
            $color = ($rowIndex % 2 === 0) ? 'F2F4F7' : 'FFFFFF';
            $sheet->getStyle("A{$rowIndex}:{$lastCol}{$rowIndex}")
                ->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setRGB($color);

            $rowIndex++;
        }

        // Auto-size columns A through I
        foreach (range('A', 'I') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // 5. Output as xlsx
        $writer = new Xlsx($spreadsheet);
        $filename = 'EmployeeDataExport_' . date('Ymd_His') . '.xlsx';

        ob_start();
        $writer->save('php://output');
        $xlsxContent = ob_get_clean();

        $stream = Utils::streamFor($xlsxContent);

        $response
            ->setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            ->setHeader('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->setHeader('Cache-Control', 'max-age=0')
            ->setHeader('Pragma', 'public')
            ->setBody($stream);
    }

    private function buildRow($user, $employee, $current, $permanent): array
    {
        $currentAddress = '';
        $permanentAddress = '';

        if ($current) {
            $currentAddress = trim(
                ($current->get('name') ?? '') . ', ' .
                ($current->get('cityName') ?? '') . ', ' .
                ($current->get('stateName') ?? '') . ' - ' .
                ($current->get('pincode') ?? '')
            );
        }

        if ($permanent) {
            $permanentAddress = trim(
                ($permanent->get('name') ?? '') . ', ' .
                ($permanent->get('cityName') ?? '') . ', ' .
                ($permanent->get('stateName') ?? '') . ' - ' .
                ($permanent->get('pincode') ?? '')
            );
        }

        return [
            $user->get('userName') ?? '',
            $user->get('emailAddress') ?? '',
            trim(
                ($user->get('firstName') ?? '') . ' ' .
                ($user->get('middleName') ?? '') . ' ' .
                ($user->get('lastName') ?? '')
            ),
            $user->get('gender') ?? '',
            $user->get('cMaritialStatus') ?? '',
            $user->get('cDoj') ?? '',
            $user->get('cDob') ?? '',
            $currentAddress,
            $permanentAddress,
        ];
    }
}
