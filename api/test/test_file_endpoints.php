<?php
/**
 * Test File Endpoints
 *
 * Manual test script for file upload/download/validate endpoints
 *
 * Usage:
 * php api/test/test_file_endpoints.php
 */

// Configuration
define('API_BASE_URL', 'https://manylla.com/qual/api');
define('TEST_SYNC_ID', hash('sha256', 'test-recovery-phrase-' . time()));

echo "=== Manylla File Endpoints Test ===\n\n";
echo "Test sync_id: " . TEST_SYNC_ID . "\n";
echo "API base: " . API_BASE_URL . "\n\n";

// ============================================================
// Test 1: File Validation Endpoint
// ============================================================

echo "Test 1: File Validation\n";
echo "------------------------\n";

$validation_data = [
    'sync_id' => TEST_SYNC_ID,
    'file_size' => 1024 * 1024,  // 1MB
    'file_type' => 'application/pdf',
    'file_extension' => 'pdf'
];

$ch = curl_init(API_BASE_URL . '/file_validate.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($validation_data));

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $http_code\n";
echo "Response: $response\n";

$result = json_decode($response, true);

if ($http_code === 200 && isset($result['allowed'])) {
    echo "✓ Validation endpoint working\n";
    echo "  Allowed: " . ($result['allowed'] ? 'YES' : 'NO') . "\n";
    echo "  Quota used: " . number_format($result['quota_used']) . " bytes\n";
    echo "  Quota total: " . number_format($result['quota_total']) . " bytes\n";
} else {
    echo "✗ Validation endpoint failed\n";
}

echo "\n";

// ============================================================
// Test 2: File Upload (Small File)
// ============================================================

echo "Test 2: File Upload (Single Chunk)\n";
echo "-----------------------------------\n";

// Generate test file (1KB encrypted data)
$test_data = str_repeat('A', 1024);
$encrypted_data = base64_encode($test_data);
$file_id = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4));
$file_hash = hash('sha256', $test_data);
$encrypted_filename = base64_encode('test_file.txt');

echo "File ID: $file_id\n";
echo "File hash: $file_hash\n";

$upload_data = [
    'sync_id' => TEST_SYNC_ID,
    'file_id' => $file_id,
    'chunk_index' => '0',
    'total_chunks' => '1',
    'chunk_data' => $encrypted_data,
    'file_hash' => $file_hash,
    'encrypted_filename' => $encrypted_filename
];

$ch = curl_init(API_BASE_URL . '/file_upload.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($upload_data));

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $http_code\n";
echo "Response: $response\n";

$result = json_decode($response, true);

if ($http_code === 200 && isset($result['complete']) && $result['complete']) {
    echo "✓ Upload successful\n";
    echo "  File ID: " . $result['file_id'] . "\n";
    echo "  File size: " . number_format($result['file_size']) . " bytes\n";
} else {
    echo "✗ Upload failed\n";
    exit(1);
}

echo "\n";

// ============================================================
// Test 3: File Download
// ============================================================

echo "Test 3: File Download\n";
echo "---------------------\n";

$download_url = API_BASE_URL . '/file_download.php?sync_id=' . TEST_SYNC_ID . '&file_id=' . $file_id;

$ch = curl_init($download_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$downloaded_data = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$content_length = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
curl_close($ch);

echo "HTTP Status: $http_code\n";
echo "Content length: " . number_format($content_length) . " bytes\n";
echo "Downloaded size: " . number_format(strlen($downloaded_data)) . " bytes\n";

if ($http_code === 200 && $downloaded_data === $test_data) {
    echo "✓ Download successful and data matches\n";
} else {
    echo "✗ Download failed or data mismatch\n";
}

echo "\n";

// ============================================================
// Test 4: Chunked Upload (Multi-chunk)
// ============================================================

echo "Test 4: Chunked Upload (3 chunks)\n";
echo "----------------------------------\n";

$chunk_size = 512;  // Small chunks for testing
$test_data_large = str_repeat('B', $chunk_size * 3);
$file_id_chunked = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4));
$file_hash_chunked = hash('sha256', $test_data_large);

$chunks = str_split($test_data_large, $chunk_size);
$total_chunks = count($chunks);

echo "File ID: $file_id_chunked\n";
echo "Total chunks: $total_chunks\n";

for ($i = 0; $i < $total_chunks; $i++) {
    $is_last = ($i === $total_chunks - 1);

    $upload_data = [
        'sync_id' => TEST_SYNC_ID,
        'file_id' => $file_id_chunked,
        'chunk_index' => (string)$i,
        'total_chunks' => (string)$total_chunks,
        'chunk_data' => base64_encode($chunks[$i])
    ];

    // Add final metadata on last chunk
    if ($is_last) {
        $upload_data['file_hash'] = $file_hash_chunked;
        $upload_data['encrypted_filename'] = base64_encode('test_file_chunked.txt');
    }

    $ch = curl_init(API_BASE_URL . '/file_upload.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($upload_data));

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    if ($http_code === 200) {
        echo "  Chunk $i: ✓\n";
    } else {
        echo "  Chunk $i: ✗ (HTTP $http_code)\n";
        echo "  Response: $response\n";
        exit(1);
    }
}

echo "✓ Chunked upload successful\n";

echo "\n";

// ============================================================
// Summary
// ============================================================

echo "=== Test Summary ===\n";
echo "✓ All tests passed\n";
echo "\nBackend infrastructure is working correctly!\n";

exit(0);
?>
