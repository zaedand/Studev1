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


    //instructor (sementara)
    Route::get('/insdashboard', function () {
    return Inertia::render('Instructor/InsDashboard');
    })->name('insdashboard');
    Route::get('/quiz-manage', function () {
    return Inertia::render('Instructor/Quiz');
    })->name('quiz-manage');
    Route::get('/praktikum-manage', function () {
    return Inertia::render('Instructor/praktikum');
    })->name('praktikum-manage');



    // Other routes
    Route::get('/leaderboard', function () {
        return Inertia::render('leaderboard');
    })->name('leaderboard');

    Route::get('/compiler', function () {
        return Inertia::render('compiler');
    })->name('compiler');
});

Route::prefix('api/compiler')->group(function () {
    Route::post('/execute', [CompilerController::class, 'executeCode']);
    Route::post('/execute-judge0', [CompilerController::class, 'executeCodeJudge0']);
    Route::get('/languages', [CompilerController::class, 'getSupportedLanguages']);
    Route::get('/examples', [CompilerController::class, 'getExamples']);
});

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/module/{moduleId}/quiz', [QuizController::class, 'show'])->name('quiz.show');
    Route::get('/module/{moduleId}/quiz/result', [QuizController::class, 'result'])->name('quiz.result');
    Route::post('/module/{moduleId}/quiz/start', [QuizController::class, 'start'])->name('quiz.start');
    Route::post('/module/{moduleId}/quiz/submit', [QuizController::class, 'submit'])->name('quiz.submit');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
