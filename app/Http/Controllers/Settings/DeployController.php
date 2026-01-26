<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Process\Process;

class DeployController extends Controller
{
    public function update()
    {
        $output = [];

        /**
         * @throws Exception
         */
        $run = function ($cmd) use (&$output) {
            $process = Process::fromShellCommandline($cmd, base_path());
            $process->setTimeout(600);
            $process->run();

            if (! $process->isSuccessful()) {
                throw new Exception($process->getErrorOutput());
            }

            $output[] = "▶ $cmd";
            $output[] = $process->getOutput();
        };

        // ✅ UPDATE ONLY
        $run('git pull --ff-only');
        $run('npm install --production');
        $run('npm run build');

        Artisan::call('optimize:clear');
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');

        return response()->json([
            'status' => 'updated',
            'output' => $output,
        ]);
    }
}
