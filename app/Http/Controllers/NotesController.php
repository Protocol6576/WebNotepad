<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NotesController extends Controller
{
    // Storage::disk('public')->

    public function getTitles() {
        $path = ('allNotes');
        $filesInFolder = Storage::disk('public')->directories($path);
    
        foreach($filesInFolder as $key => $path){
            $files = pathinfo($path);
            $NotesList[] = array(
                "rank" => "|",
                "title" => $files['filename']
            );
        }
    
        return $NotesList;
    }
    
    public function redactContent($note_name, $note_Text) {
        $path = ('allNotes/'.$note_name.'/note.txt');
        $date_time = date('m.d.Y h-i-s a', time());
        $new_path = ('allNotes/'.$note_name.'/previous'.'/'.$date_time.'.txt');

        Storage::disk('public')->copy($path, $new_path);
        Storage::disk('public')->put($path, $note_Text);

        $this->appendLogs($note_name, 'Редактирование файла');
        return true; //Файл изменен
    }
    
    public function showContent($note_name) {
        $path = ('allNotes/'.$note_name.'/note.txt');
        $note_Text = Storage::disk('public')->get($path);

        //$this->appendLogs($note_name, 'Просмотр файла');
        return $note_Text;
    }
    
    public function rename($note_name, $new_note_name) {
        $path = ('allNotes/'.$note_name);
        $new_path = ('allNotes/'.$new_note_name);
        Storage::disk('public')->move($path, $new_path);

        $this->appendLogs($new_note_name, 'Переименовывание файла в '.$new_note_name);
        return true; //Файл переименован
    }
    
    public function create($note_name) { // ToDo: Постараться приделать к этому контроллер
        $path = ('allNotes/'.$note_name);
        if (Storage::disk('public')->exists($path)) {
            return false; //Файл уже существует
        } else {
            Storage::disk('public')->makeDirectory($path);
            Storage::disk('public')->makeDirectory($path.'/previous');
            
            $path = ('allNotes/'.$note_name.'/note.txt');
            Storage::disk('public')->put($path, "Я родился!");

            $path = ('allNotes/'.$note_name.'/note.log');
            Storage::disk('public')->put($path, "");

            $this->appendLogs($note_name, 'Создание файла'); // ToDo: сделать получение IP
            return true; //Файл создан
        }
    }
    
    public function delete($note_name) {
        $path = ('allNotes/'.$note_name);
        //$this->appendLogs($note_name, 'Удаление файла');
        Storage::disk('public')->deleteDirectory($path);

        return true; //Файл удален
    }

    public function appendLogs($note_name, $info) {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip_user = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip_user = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip_user = $_SERVER['REMOTE_ADDR'];
        }

        $date_time = date('m/d/Y h:i:s a', time());
        $path = ('allNotes/'.$note_name.'/note.log');
        Storage::disk('public')->prepend($path, '['.$date_time.']'.' '.$ip_user.' '.$note_name.': '.$info);

        $log_size = Storage::disk('public')->size($path);
        $log_max_size = env('LOG_MAX_SIZE', 0);
        if($log_max_size > 0) {
            while($log_size > $log_max_size) {
                $log_Text = Storage::disk('public')->get($path);
                $log_Text = substr($log_Text, 0, strrpos($log_Text, "["));
                Storage::disk('public')->put($path, $log_Text); // ToDo: Постараться найти метод, удаляющий часть контента из файла. При таком удалении как сейчас могут возникнуть ошибки

                $log_size = Storage::disk('public')->size($path);
            };
        };

        return true;
    }

    public function just() { // ToDo: Удалить в итоговом варианте
        $path = ('allNotes/note.log');
        $log_Text = Storage::disk('public')->get($path);

        return strrpos($log_Text, "[");
    }

    public function seeMe() {

    }
}
