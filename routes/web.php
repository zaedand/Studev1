<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\CompilerController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('welcome');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Route untuk modules dan quiz
Route::middleware('auth')->group(function () {
    // Module routes
    Route::get('/module/{id}', [ModuleController::class, 'show'])->name('module.show');

    // Quiz routes - Fixed naming and structure
    Route::get('/module/{moduleId}/quiz', [QuizController::class, 'show'])->name('quiz.show');
    Route::post('/module/{moduleId}/quiz/start', [QuizController::class, 'start'])->name('quiz.start');
    Route::post('/module/{moduleId}/quiz/submit', [QuizController::class, 'submit'])->name('quiz.submit');
    Route::get('/module/{moduleId}/quiz/result', [QuizController::class, 'result'])
    ->name('quiz.result');

    // Other routes
    Route::get('/leaderboard', function () {
        return Inertia::render('leaderboard');
    })->name('leaderboard');

    Route::get('/compiler', function () {
        return Inertia::render('compiler');
    })->name('compiler');
});
// Tambahkan di web.php untuk testing
Route::get('/test-result', function () {
    return Inertia::render('Quiz/Result', [
        'module' => ['id' => 1, 'title' => 'Test', 'color' => 'bg-blue-500'],
        'result' => [
            'score' => 85,
            'correct_count' => 8,
            'total_questions' => 10,
            'percentage' => 85,
            'grade' => 'B'
        ],
        'submission' => [
            'module_id' => 1,
            'user_id' => 1,
            'answers' => ['1' => 'A', '2' => 'B'],
            'score' => 85,
            'correct_count' => 8,
            'total_questions' => 10,
            'time_taken' => 300,
            'submitted_at' => now()->toDateTimeString()
        ],
        'questions_review' => []
    ]);
});
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
