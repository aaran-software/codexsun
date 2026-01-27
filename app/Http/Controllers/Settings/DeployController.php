<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\Process\Process;

class DeployController extends Controller
{
    public function run(Request $request)
    {
        // Always return JSON (no abort(), no redirects)
        if (! auth()->check() || ! auth()->user()->is_admin) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'action' => 'required|string',
        ]);

        // UI → Python flag mapping
        $map = [
            'full' => ['y', 'y', 'y', 'y'],
            'node' => ['y', 'n', 'n', 'n'],
            'npm' => ['n', 'y', 'n', 'n'],
            'update_build' => ['n', 'n', 'y', 'y'],
            'build' => ['n', 'n', 'n', 'y'],
        ];

        if (! isset($map[$validated['action']])) {
            return response()->json([
                'message' => 'Invalid deploy action',
            ], 400);
        }

        [$installNode, $updateNpm, $npmInstall, $buildNpm] = $map[$validated['action']];

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
            return response()->json([
                'message' => 'Deploy failed',
                'output' => $process->getErrorOutput() ?: $process->getOutput(),
            ], 500);
        }

        return response()->json([
            'success' => true,
            'output' => $process->getOutput(),
        ]);
    }
}
