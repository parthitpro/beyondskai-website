<?php
// package-details.php - Dynamic package loader
$id = isset($_GET['id']) ? intval($_GET['id']) : 10;
if ($id < 1 || $id > 25) {
    $id = 10;
}

$file = __DIR__ . "/package-details_id_{$id}.html";
if (file_exists($file)) {
    include($file);
} else {
    include(__DIR__ . "/package-details_id_10.html");
}
