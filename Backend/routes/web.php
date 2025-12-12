<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UploadController;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['auth:sanctum'])->group(function () {
    // ... tes routes existantes (properties, etc.)

    Route::post('/upload', [UploadController::class, 'store'])
        ->name('upload.files');
});

require __DIR__.'/api.php';