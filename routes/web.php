<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\NotesController;



Route::get('/starSheet', function () {
    return view('welcome');
});

Route::get('/', function () {
    return view('mainPage');
});
