<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\NotesController;



Route::get('/', function () {
    return view('welcome');
});

Route::get('/main', function () {
    return view('mainPage');
});
