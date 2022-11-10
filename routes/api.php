<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotesController;
use App\Http\Controllers\EnvController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
}); // зОчем он нужон? Разобраться! ._.



Route::prefix('note')->group(function () {

    Route::get('/getTitles', [NotesController::class, 'getTitles']);

    Route::get('/redactContent/{noteName}/{noteText}', [NotesController::class, 'redactContent']);

    Route::get('/showContent/{noteName}', [NotesController::class, 'showContent']); // note/show

    Route::get('/rename/{noteName}/{newNoteName}', [NotesController::class, 'rename']);

    Route::get('/create/{noteName}', [NotesController::class, 'create']);

    Route::get('/delete/{noteName}', [NotesController::class, 'delete']);
});

Route::prefix('env')->group(function () {

    Route::get('/getData', [EnvController::class, 'getData']); // Изменить название

    Route::get('/setData/{noteMaxLength}', [EnvController::class, 'setData']); // Изменить название
});



Route::get('/getText/{text}'); // У него есть дети? Приемники? На него кто-то ссылается? ((УБИТЬ ВСЕХ!!))

// Перенести роуты сюда (запросы)
// + /api по умпочанию

// А еще контроллеры!