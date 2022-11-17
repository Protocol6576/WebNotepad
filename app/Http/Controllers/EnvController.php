<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class EnvController extends Controller
{

    public function getData($jsonRequiresSettings) {
        $settings = json_decode($jsonRequiresSettings, true);

        foreach ($settings as $key => $value) {
            $settings[$key] = env($key, -1);
        };

        $jsonRequiresSettings = json_encode($settings);

        return $jsonRequiresSettings;
    }

    public function editData($jsonSettings) {
        $path = base_path('.env');

        if (!File::exists($path)) {
            return false;
        }

        $env_data = File::get($path);
        $settings = json_decode($jsonSettings, true);

        foreach ($settings as $key => $new_value) {
            $pr_value = env($key, -1);
            $env_data = str_replace($key.' = '.$pr_value, $key.' = '.$new_value, $env_data);
        }

        File::put($path, $env_data);

        return true;

    }
}
