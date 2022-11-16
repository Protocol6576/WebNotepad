<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Storage;

use Illuminate\Http\Request;

class NotesHistoryController extends Controller
{
    public function getTitles($note_name) {
        $path = ('allNotes/'.$note_name.'/'.'previous');
        $filesInFolder = Storage::disk('public')->files($path);
    
        foreach($filesInFolder as $key => $path){
            $files = pathinfo($path);
            $NotesList[] = array(
                "rank" => "|",
                "title" => $files['filename']
            );
        }
    
        return $NotesList;
    }

    public function showContent($note_name, $history_name) {
        $path = ('allNotes/'.$note_name.'/'.'previous/'.$history_name.'.txt');
        $note_Text = Storage::disk('public')->get($path);

        return $note_Text;
    }

    public function appendLogs($ip_user, $note_name, $info) { //ToDo - разобраться почему не работает
        $date_time = date('m/d/Y h:i:s a', time());
        //$ip_user = '1.1.1.1:0001';
        $path = ('allNotes/'.$note_name.'/note.log');
        Storage::disk('public')->append($path, '['.$date_time.']'.' '.$ip_user.' '.$note_name.': '.$info);

        return true;
    }
}
