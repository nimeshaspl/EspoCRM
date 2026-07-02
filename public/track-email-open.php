<?php

use Espo\Core\Application;

require_once __DIR__ . '/../bootstrap.php';

$logFile = __DIR__ . '/email_tracking.log';


// Function that add a logs in log file
function writeLog($message)
{
    global $logFile;
    file_put_contents($logFile, '[' . date('Y-m-d H:i:s') . '] ' . $message . PHP_EOL, FILE_APPEND);
}

// Start that Request Received
writeLog('Request received');

// Try to get the ID 
$trackingId = $_GET['id'] ?? null;

// Log to get the ID 
writeLog('Encoded Tracking ID: ' . ($trackingId ?? 'NULL'));

// Check if tracking id is not getting
if (!$trackingId) {
    writeLog('Tracking ID not found');
    http_response_code(400);
    exit;
}

// Call of Application
$app = new Application();
// Get Container
$container = $app->getContainer();


// Get Entity Manager 
$entityManager = $container->get('entityManager');

// Assign user as a System User
$systemUser = $entityManager->getEntityById('User', 'system');
$container->set('user', $systemUser);



try {
    // Get Email record using Email ID
    $email = $entityManager->getRepository('Email')->where([
        'cEmailUniqueCode' => $trackingId
    ])->findOne();
    // print_r($email);
    // IF record not getting then add a log
    if (!$email) {

        writeLog('Email record not found: ' . $emailId);
    } else {

        // log that record found
        writeLog('Email record found');

        // Already opened?
        if ($email->get('cIsEmailOpened')) {
            writeLog('Email already marked as opened. Skipping update.');
        } else {

            writeLog('First email open detected.');

            $email->set('cIsEmailOpened', true);
            $email->set('cEmailOpenedAt', date('Y-m-d H:i:s'));


            $entityManager->saveEntity($email);

            writeLog('Email record updated successfully.');
        }
    }
} catch (\Throwable $e) {
// echo "error";
    writeLog('ERROR: ' . $e->getMessage());
}
// echo "end";die;
/**

 * Return tracking pixel

 */

header('Content-Type: image/gif');

echo base64_decode('R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=');

exit;
 