<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('tafiya:status', function () {
    $this->info('FindDestination Northern Nigeria Accommodation Marketplace API initialized successfully.');
})->purpose('Display FindDestination system status');
