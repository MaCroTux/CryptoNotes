<?php
// Habilitar CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Manejar las solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Enviar respuesta con el status 200 y terminar el script
    http_response_code(200);
    exit();
}

// Función para almacenar mensajes
function storeMessage() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['email']) || !isset($data['texto']) || !isset($data['iv']) || !isset($data['encryptedAESKey'])) {
        echo json_encode(['status' => 'error', 'message' => 'Datos incompletos.']);
        return;
    }

    $email = $data['email'];
    $texto = $data['texto'];
    $iv = $data['iv'];
    $encryptedAESKey = $data['encryptedAESKey'];
    $hash_texto = sha1($texto);
    $filename = $email . $hash_texto . '.txt';
    $directory = 'data/';

    if (!is_dir($directory)) {
        mkdir($directory, 0777, true);
    }

    $file_content = json_encode([
        'iv' => $iv,
        'encryptedAESKey' => $encryptedAESKey,
        'texto' => $texto,
        'email' => $email
    ]);

    $file_path = $directory . $filename;

    if (file_put_contents($file_path, $file_content) !== false) {
        echo json_encode(['status' => 'success', 'message' => 'Archivo guardado exitosamente.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar el archivo.']);
    }
}

// Función para listar mensajes
function listMessages() {
    $directory = 'data/';

    if (!is_dir($directory)) {
        echo json_encode(['status' => 'error', 'message' => 'Directorio de datos no encontrado.']);
        return;
    }

    $files = scandir($directory);
    $files = array_filter($files, function($file) use ($directory) {
        return !is_dir($directory . $file);
    });

    $result = [];

    foreach ($files as $file) {
        $file_content = file_get_contents($directory . $file);
        $data = json_decode($file_content, true);

        if (isset($data['email']) && isset($data['texto']) && isset($data['iv']) && isset($data['encryptedAESKey'])) {
            $result[] = [
                'email' => $data['email'],
                'texto' => $data['texto'],
                'iv' => $data['iv'],
                'encryptedAESKey' => $data['encryptedAESKey']
            ];
        }
    }

    echo json_encode($result);
}

// Detectar la ruta solicitada
$request_uri = $_SERVER['REQUEST_URI'];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && strpos($request_uri, '/api/store') !== false) {
    storeMessage();
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && strpos($request_uri, '/api/list') !== false) {
    listMessages();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Ruta o método no permitidos.']);
}
?>