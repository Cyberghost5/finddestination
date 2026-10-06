<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('tafiya:status', function () {
    $this->info('Tafiya Northern Nigeria Accommodation Marketplace API initialized successfully.');
})->purpose('Display Tafiya system status');
