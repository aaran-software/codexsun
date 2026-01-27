<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class DeployController extends Controller
{
    public function run(Request $request)
    {
        $request->validate([
            'action' => 'required|string',
        ]);

        // Only allow authorised users
        abort_unless(auth()->user()?->is_admin, 403);

        $map = [
            'full' => ['y', 'y', 'y', 'y'],
            'node' => ['y', 'n', 'n', 'n'],
            'npm' => ['n', 'y', 'n', 'n'],
            'update_build' => ['n', 'n', 'y', 'y'],
            'build' => ['n', 'n', 'n', 'y'],
        ];

        if (! isset($map[$request->action])) {
            abort(400, 'Invalid deploy action');
        }

        [$installNode, $updateNpm, $npmInstall, $buildNpm] = $map[$request->action];

        $process = new Process([
            'sudo',
            '-u',
            'www-data',
            'python3',
            base_path('ideploy.py'),
            '--install-node', $installNode,
            '--update-npm', $updateNpm,
            '--npm-install', $npmInstall,
            '--build-npm', $buildNpm,
        ]);

        $process->setTimeout(900);

        $process->run();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        return response()->json([
            'success' => true,
            'output' => $process->getOutput(),
        ]);
    }
}
