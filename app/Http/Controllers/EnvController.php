<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class EnvController extends Controller
{

    public function getData() {
        return env('NOTE_MAX_LENGTH', -1);
    }

    public function setData($noteMaxLength) {
        $path = base_path('.env');
        $pr_value = env('NOTE_MAX_LENGTH', -1);

        if (File::exists($path)) {
            File::put($path, str_replace(
                'NOTE_MAX_LENGTH = '.$pr_value, 'NOTE_MAX_LENGTH = '.$noteMaxLength, File::get($path)
            ));
        }

        return false;
    }
}
