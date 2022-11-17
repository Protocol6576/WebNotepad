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
}
