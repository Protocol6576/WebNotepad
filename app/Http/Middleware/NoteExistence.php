<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NoteExistence
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $noteName = $request->route('noteName');
        $path = ('allNotes/'.$noteName);
        if (Storage::disk('public')->exists($path)) {
            return $next($request);
        }
        

        return false; // ToDo: Неправильно, это крашит все. Исправить
    }

    /**
     * Обработать задачи после отправки ответа в браузер.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Http\Response  $response
     * @return void
     */

    /* Работает плохо. При удалении и редактировании нужен другой путь, а при создании вообде не вызывается посредник. ToDo: Постараться это как-тоисправить или удалить
    public function terminate($request, $response)
    {
        $date_time = date('m/d/Y h:i:s a', time());
        $ip_user = '1.1.1.1:0001';
        $note_name = $request->route('noteName');
        $info = 'Проверка логов';
        $path = ('allNotes/'.$note_name.'/note.log');
        Storage::disk('public')->append($path, '['.$date_time.']'.' '.$ip_user.' '.$note_name.': '.$info);
    }
    */
}
