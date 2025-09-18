<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CompilerController extends Controller
{
    // JDoodle API credentials - dapatkan dari https://www.jdoodle.com/
    private const JDOODLE_CLIENT_ID = '3980cc5ec67a95c2cb84e7c4a2f15549';
    private const JDOODLE_CLIENT_SECRET = '5db99f64e395d34fb5948ecb1eb98ff2ae7a32b72815f74ae793d3398b8fc537';
    private const JDOODLE_URL = 'https://api.jdoodle.com/v1/execute';

    // Judge0 API - alternatif gratis
    private const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com';
    private const JUDGE0_API_KEY = 'f9a167b2eemshee458e459f72fa7p1a1dcejsn6b2f942e7caa';

    /**
     * Display compiler page
     */
    public function index()
    {
        $breadcrumbs = [
            ['title' => 'Dashboard', 'href' => route('dashboard')],
            ['title' => 'Compiler', 'href' => route('compiler')],
        ];

        return inertia('Compiler', [
            'breadcrumbs' => $breadcrumbs
        ]);
    }

    /**
     * Execute code using JDoodle API
     */
    public function executeCode(Request $request): JsonResponse
    {
        $request->validate([
            'language' => 'required|string',
            'code' => 'required|string',
            'input' => 'nullable|string'
        ]);

        try {
            // Menggunakan JDoodle API
            $response = $this->executeWithJDoodle(
                $request->language,
                $request->code,
                $request->input ?? ''
            );

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Code execution failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'output' => 'Error: ' . $e->getMessage(),
                'error' => true
            ], 500);
        }
    }

    /**
     * Execute code using Judge0 API (alternative)
     */
    public function executeCodeJudge0(Request $request): JsonResponse
    {
        $request->validate([
            'language' => 'required|string',
            'code' => 'required|string',
            'input' => 'nullable|string'
        ]);

        try {
            $response = $this->executeWithJudge0(
                $request->language,
                $request->code,
                $request->input ?? ''
            );

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Code execution failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'output' => 'Error: ' . $e->getMessage(),
                'error' => true
            ], 500);
        }
    }

    /**
     * Execute code with JDoodle API
     */
    private function executeWithJDoodle(string $language, string $code, string $input): array
{
    $payload = [
        'clientId'     => env('JDOODLE_CLIENT_ID'),
        'clientSecret' => env('JDOODLE_CLIENT_SECRET'),
        'script'       => $code,
        'stdin'        => $input,
        'language'     => $language,
        'versionIndex' => "0"
    ];

    $response = Http::timeout(30)->post(env('JDOODLE_URL'), $payload);

    if ($response->failed()) {
        throw new \Exception('Failed: ' . $response->body());
    }

    return $response->json();
}


    /**
     * Execute code with Judge0 API
     */
    private function executeWithJudge0(string $language, string $code, string $input): array
    {
        $languageIds = [
            'c' => 50,           // C (GCC 9.2.0)
            'cpp' => 54,         // C++ (GCC 9.2.0)
            'java' => 62,        // Java (OpenJDK 13.0.1)
            'python' => 71,      // Python (3.8.1)
            'javascript' => 63   // JavaScript (Node.js 12.14.0)
        ];

        $languageId = $languageIds[$language] ?? 50;

        // Step 1: Submit code for execution
        $submissionPayload = [
            'source_code' => base64_encode($code),
            'language_id' => $languageId,
            'stdin' => base64_encode($input)
        ];

        $submissionResponse = Http::withHeaders([
            'X-RapidAPI-Key' => self::JUDGE0_API_KEY,
            'X-RapidAPI-Host' => 'judge0-ce.p.rapidapi.com',
            'Content-Type' => 'application/json'
        ])->post(self::JUDGE0_URL . '/submissions?base64_encoded=true&wait=true', $submissionPayload);

        if ($submissionResponse->failed()) {
            throw new \Exception('Failed to submit code: ' . $submissionResponse->body());
        }

        $submission = $submissionResponse->json();

        return [
            'success' => true,
            'output' => base64_decode($submission['stdout'] ?? ''),
            'error' => !empty($submission['stderr']),
            'stderr' => base64_decode($submission['stderr'] ?? ''),
            'compile_output' => base64_decode($submission['compile_output'] ?? ''),
            'time' => $submission['time'] ?? 0,
            'memory' => $submission['memory'] ?? 0,
            'status' => $submission['status']['description'] ?? 'Unknown'
        ];
    }

    /**
     * Get supported languages
     */
    public function getSupportedLanguages(): JsonResponse
    {
        $languages = [
            [
                'value' => 'c',
                'label' => 'C',
                'icon' => '🔧',
                'template' => '#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}'
            ],
            [
                'value' => 'cpp',
                'label' => 'C++',
                'icon' => '⚡',
                'template' => '#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}'
            ],
            [
                'value' => 'java',
                'label' => 'Java',
                'icon' => '☕',
                'template' => 'public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}'
            ],
            [
                'value' => 'python',
                'label' => 'Python',
                'icon' => '🐍',
                'template' => 'print("Hello, World!")'
            ],
            [
                'value' => 'javascript',
                'label' => 'JavaScript',
                'icon' => '🟨',
                'template' => 'console.log("Hello, World!");'
            ]
        ];

        return response()->json($languages);
    }

    /**
     * Get programming examples
     */
    public function getExamples(): JsonResponse
    {
        $examples = [
            [
                'id' => 1,
                'title' => 'Hello World',
                'difficulty' => 'Beginner',
                'description' => 'Print "Hello, World!" to the screen',
                'language' => 'c',
                'code' => '#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}'
            ],
            [
                'id' => 2,
                'title' => 'Sum of Two Numbers',
                'difficulty' => 'Beginner',
                'description' => 'Create a program to add two numbers',
                'language' => 'c',
                'code' => '#include <stdio.h>

int main() {
    int a, b, sum;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    sum = a + b;
    printf("Sum = %d\\n", sum);
    return 0;
}'
            ],
            [
                'id' => 3,
                'title' => 'Factorial Calculator',
                'difficulty' => 'Intermediate',
                'description' => 'Calculate factorial of a number',
                'language' => 'c',
                'code' => '#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    int num;
    printf("Enter a number: ");
    scanf("%d", &num);
    printf("Factorial of %d is %d\\n", num, factorial(num));
    return 0;
}'
            ],
            [
                'id' => 4,
                'title' => 'Fibonacci Series',
                'difficulty' => 'Intermediate',
                'description' => 'Generate Fibonacci series',
                'language' => 'python',
                'code' => 'def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

n = int(input("Enter number of terms: "))
for i in range(n):
    print(fibonacci(i), end=" ")
print()'
            ]
        ];

        return response()->json($examples);
    }
}
