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

    public function handle(Request $request, Closure $next) {
        $noteName = $request->route('noteName');
        $path = ('allNotes/'.$noteName);

        if (Storage::disk('public')->exists($path)) {
            return $next($request);
        } elseif ($request->is('*/create/*')) {
            return $next($request);
        }
        

        return false;
    }

    /**
     * Обработать задачи после отправки ответа в браузер.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Http\Response  $response
     * @return void
     */

    public function terminate($request, $response) {
        if ($request->is('*/showContent/*')) {
            return false;
        }

        $info_offset_text = 'note/';
        $info = $request->path();
        $info_offset = strpos($info, $info_offset_text) + strlen($info_offset_text);
        $info_length = strpos($info, '/', $info_offset) - $info_offset;
        $info = substr($info, $info_offset, $info_length);

        if ($request->is('*/rename/*')) {
            $info .= ' to '.$request->route('newNoteName');
        }
        

        $date_time = date('m/d/Y h:i:s a', time());
        $ip_user = $request->ip();
        $note_name = $request->route('noteName');
        $path = ('allNotes/note.log');
        Storage::disk('public')->prepend($path, '['.$date_time.']'.' '.$ip_user.' '.$note_name.': '.$info);

        // Это можно сделать более адекватно, с меньшим потреблением ресурсов, за счет того что новые заметки будут появлятся внизу списка, а не вверху. ToDo: Задать вопрос: стоит ли так делать?
        $log_size = Storage::disk('public')->size($path);
        $log_max_size = env('LOG_MAX_SIZE', 0) * 1024;
        if($log_max_size > 0) {
            while($log_size > $log_max_size) {
                $log_Text = Storage::disk('public')->get($path);
                $log_Text = substr($log_Text, 0, strrpos($log_Text, "["));
                Storage::disk('public')->put($path, $log_Text); // ToDo: Постараться найти метод, удаляющий часть контента из файла. При таком удалении как сейчас могут возникнуть ошибки

                $log_size = Storage::disk('public')->size($path);
            };
        };
        
    }
}
