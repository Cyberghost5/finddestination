<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('finddestination:status', function () {
    $this->info('FindDestination Nigeria Accommodation Marketplace API initialized successfully.');
})->purpose('Display FindDestination system status');
