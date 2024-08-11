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

    if (!isset($data['email']) || !isset($data['texto']) || !isset($data['iv']) || !isset($data['encryptedAESKey']) || !isset($data['description'])) {
        echo json_encode(['status' => 'error', 'message' => 'Datos incompletos.']);
        return;
    }

    $email = $data['email'];
    $texto = $data['texto'];
    $iv = $data['iv'];
    $encryptedAESKey = $data['encryptedAESKey'];
    $description = $data['description'];
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
        'email' => $email,
        'description' => $description  // Guardar la descripción
    ]);

    $file_path = $directory . $filename;

    if (file_put_contents($file_path, $file_content) !== false) {
        echo json_encode(['status' => 'success', 'message' => 'Archivo guardado exitosamente.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar el archivo.']);
    }
}

// Función para listar mensajes del usuario
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

        if (isset($data['email']) && isset($data['texto']) && isset($data['iv']) && isset($data['encryptedAESKey']) && isset($data['description'])) {
            $result[] = [
                'email' => $data['email'],
                'texto' => $data['texto'],
                'iv' => $data['iv'],
                'encryptedAESKey' => $data['encryptedAESKey'],
                'description' => $data['description']  // Incluir la descripción en la respuesta
            ];
        }
    }

    echo json_encode($result);
}

// Función para registrar usuarios
function registerUser() {
    $input = @file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['email']) || !isset($data['publicKey'])) {
        echo json_encode(['status' => 'error', 'message' => 'Datos incompletos.']);
        return;
    }

    $email = $data['email'];
    $publicKey = $data['publicKey'];
    $directory = 'users/';

    if (!is_dir($directory)) {
        mkdir($directory, 0777, true);
    }

    $filename = $directory . sha1($email) . '.json';

    if (file_exists($filename)) {
        echo json_encode(['status' => 'error', 'message' => 'El usuario ya está registrado.']);
        return;
    }

    $file_content = json_encode([
        'email' => $email,
        'publicKey' => $publicKey
    ]);

    if (file_put_contents($filename, $file_content) !== false) {
        echo json_encode(['status' => 'success', 'message' => 'Usuario registrado exitosamente.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al registrar el usuario.']);
    }
}

// Función para validar el inicio de sesión del usuario
function loginUser() {
    $input = @file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['email'])) {
        echo json_encode(['status' => 'error', 'message' => 'Email no proporcionado.']);
        return;
    }

    $email = $data['email'];
    $directory = 'users/';
    $filename = $directory . sha1($email) . '.json';

    if (file_exists($filename)) {
        $file_content = @file_get_contents($filename);
        $user_data = json_decode($file_content, true);

        echo json_encode(['status' => 'success', 'message' => 'Usuario encontrado.', 'publicKey' => $user_data['publicKey']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.']);
    }
}

// Función para obtener la clave pública de un usuario
function getPublicKey() {
    if (!isset($_GET['email'])) {
        echo json_encode(['status' => 'error', 'message' => 'Email no proporcionado.']);
        return;
    }

    $email = $_GET['email'];
    $directory = 'users/';
    $filename = $directory . sha1($email) . '.json';

    if (file_exists($filename)) {
        $file_content = @file_get_contents($filename);
        $user_data = json_decode($file_content, true);

        echo json_encode(['status' => 'success', 'publicKey' => $user_data['publicKey']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.']);
    }
}

// Detectar la ruta solicitada
$request_uri = $_SERVER['REQUEST_URI'];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && strpos($request_uri, '/api/store') !== false) {
    storeMessage();
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && strpos($request_uri, '/api/register') !== false) {
    registerUser();
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && strpos($request_uri, '/api/login') !== false) {
    loginUser();
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && strpos($request_uri, '/api/list') !== false) {
    listMessages();
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && strpos($request_uri, '/api/getPublicKey') !== false) {
    getPublicKey();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Ruta o método no permitidos.']);
}
?>