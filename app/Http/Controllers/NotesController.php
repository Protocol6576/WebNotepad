<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class NotesController extends Controller
{
    
    public function getTitles() {
        $path = public_path('allNotes');
        $filesInFolder = File::files($path);
    
        foreach($filesInFolder as $key => $path){
            $files = pathinfo($path);
            $NotesList[] = array(
                "rank" => "|",
                "title" => $files['filename']
            );
        }
    
        return $NotesList;
    }
    
    public function redactContent($noteName, $noteText) {
        $path = public_path('allNotes/'.$noteName.'.txt');
        if (File::exists($path)) {
            File::put($path, $noteText);
            return true; //Файл изменен
        } else {
            return false; //Файл не существует
        }
    }
    
    public function showContent($noteName) { // ShowContent
        $path = public_path('allNotes/'.$noteName.'.txt');
    
        if (File::exists($path)) {
            $noteText = File::get($path);
            return $noteText;
        }
    }
    
    public function rename($noteName, $newNoteName) {
        $path = public_path('allNotes/'.$noteName.'.txt');
        $newPath = public_path('allNotes/'.$newNoteName.'.txt');
        if (File::exists($path)) {
            File::move($path, $newPath);
            return true; //Файл переименован
        } else {
            return false; //Файл не существует
        }
    }
    
    public function create($noteName) { // тод самое что и при удалении
        $path = public_path('allNotes/'.$noteName.'.txt');
        if (File::exists($path)) {
            return false; //Файл уже существует
        } else {
            File::put($path, "Я родился!");
            return true; //Файл создан
        }
    }
    
    public function delete($noteName) { // Не обновлять весь список, а лишь редачить нынешний в зависимсти от того что выдал сервер
        $path = public_path('allNotes/'.$noteName.'.txt');
        if (File::exists($path)) {
            File::delete($path);
            return true; //Файл удален
        } else {
            return false; //Файл не существует
        }
    }

    public function getEnv() {
        return env('NOTE_MAX_LENGTH', -1);
    }
}
