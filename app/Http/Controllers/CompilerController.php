<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;

class CompilerController extends Controller
{
    private $tempDir;

    public function __construct()
    {
        $this->tempDir = storage_path('app/compiler/temp');

        // Create temp directory if it doesn't exist
        if (!File::exists($this->tempDir)) {
            File::makeDirectory($this->tempDir, 0755, true);
        }
    }

    public function compile(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'input' => 'nullable|string',
            'language' => 'required|string|in:cpp'
        ]);

        $code = $request->input('code');
        $input = $request->input('input', '');
        $language = $request->input('language');

        try {
            // Generate unique filename
            $uniqueId = Str::uuid();
            $filename = $uniqueId . '.cpp';
            $executableName = $uniqueId;
            $inputFile = $uniqueId . '_input.txt';

            $sourceFile = $this->tempDir . '/' . $filename;
            $executable = $this->tempDir . '/' . $executableName;
            $inputFilePath = $this->tempDir . '/' . $inputFile;

            // Write source code to file
            File::put($sourceFile, $code);

            // Write input to file if provided
            if (!empty($input)) {
                File::put($inputFilePath, $input);
            }

            // Start timing
            $startTime = microtime(true);

            // Compile the code
            $compileCommand = "g++ -o {$executable} {$sourceFile} 2>&1";
            $compileResult = Process::run($compileCommand);

            if (!$compileResult->successful()) {
                // Clean up files
                $this->cleanupFiles([$sourceFile, $inputFilePath]);

                return response()->json([
                    'success' => false,
                    'message' => 'Compilation failed',
                    'error' => $compileResult->output()
                ], 400);
            }

            // Execute the compiled program
            $executeCommand = $executable;
            if (!empty($input)) {
                $executeCommand .= " < {$inputFilePath}";
            }

            // Add timeout to prevent infinite loops (5 seconds)
            $executeCommand = "timeout 5s {$executeCommand} 2>&1";
            $executeResult = Process::run($executeCommand);

            $endTime = microtime(true);
            $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds

            // Get memory usage (approximate)
            $memoryUsage = memory_get_peak_usage(true) / 1024 / 1024; // Convert to MB

            $output = $executeResult->output();
            $success = $executeResult->successful();

            // Handle timeout
            if ($executeResult->exitCode() === 124) {
                $output = "Error: Program execution timed out (5 seconds limit)";
                $success = false;
            }

            // Clean up files
            $this->cleanupFiles([$sourceFile, $executable, $inputFilePath]);

            return response()->json([
                'success' => $success,
                'output' => $output ?: 'Program executed successfully with no output.',
                'execution_time' => round($executionTime, 2),
                'memory_usage' => round($memoryUsage, 2),
                'error' => $success ? null : $output
            ]);

        } catch (\Exception $e) {
            // Clean up files in case of exception
            if (isset($sourceFile)) $this->cleanupFiles([$sourceFile, $executable ?? null, $inputFilePath ?? null]);

            return response()->json([
                'success' => false,
                'message' => 'Server error occurred',
                'error' => 'Internal server error: ' . $e->getMessage()
            ], 500);
        }
    }

    private function cleanupFiles(array $files): void
    {
        foreach ($files as $file) {
            if ($file && File::exists($file)) {
                File::delete($file);
            }
        }
    }

    /**
     * Clean up old temporary files (can be called via scheduled task)
     */
    public function cleanupOldFiles(): void
    {
        $files = File::glob($this->tempDir . '/*');
        $now = time();

        foreach ($files as $file) {
            // Delete files older than 1 hour
            if (File::lastModified($file) < $now - 3600) {
                File::delete($file);
            }
        }
    }

    /**
     * Get compiler information
     */
    public function getCompilerInfo(): JsonResponse
    {
        try {
            $gccVersion = Process::run('g++ --version 2>&1');

            return response()->json([
                'compiler' => 'GNU G++',
                'version' => $gccVersion->successful() ? $gccVersion->output() : 'Version information not available',
                'supported_standards' => ['C++11', 'C++14', 'C++17', 'C++20'],
                'max_execution_time' => '5 seconds',
                'available' => $gccVersion->successful()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'compiler' => 'GNU G++',
                'available' => false,
                'error' => 'Compiler not available'
            ], 500);
        }
    }
}
