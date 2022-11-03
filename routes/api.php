<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotesController;

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

Route::get('/getNoteTitles', [NotesController::class, 'getTitles']);

Route::get('/redactNoteContent/{noteName}/{noteText}', [NotesController::class, 'redactContent']);

Route::get('/showNoteContent/{noteName}', [NotesController::class, 'showContent']);

Route::get('/renameNote/{noteName}/{newNoteName}', [NotesController::class, 'rename']);

Route::get('/createNote/{noteName}', [NotesController::class, 'create']);

Route::get('/deleteNote/{noteName}', [NotesController::class, 'delete']);

Route::get('/getText/{text}'); // У него есть дети? Приемники? На него кто-то ссылается? ((УБИТЬ ВСЕХ!!))

// Перенести роуты сюда (запросы)
// + /api по умпочанию

// А еще контроллеры!