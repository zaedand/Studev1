<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\Student\MaterialController;
use App\Http\Controllers\Student\EnrichmentController;
use App\Http\Controllers\Student\AssignmentController;
use App\Http\Controllers\Student\ProgressController;
use App\Http\Controllers\Student\CpmkController;
use App\Http\Controllers\Student\LearningObjectiveController;

use App\Http\Controllers\QuizController;
use App\Http\Controllers\CompilerController;
use App\Http\Controllers\Instructor\QuizController as InstructorQuizController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('welcome');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});


// Public module routes (accessible to all authenticated users)
Route::middleware('auth')->group(function () {
    Route::get('/module/{module}', [ModuleController::class, 'show'])->name('module.show');
});

// Student specific routes
Route::middleware(['auth', 'role:student'])->prefix('student')->name('student.')->group(function () {
    // Existing routes...

    Route::get('/modules/{module}', [ModuleController::class, 'show'])->name('modules.show');
    
    // Quiz routes (existing)
    Route::get('/module/{moduleId}/quiz', [QuizController::class, 'show'])->name('quiz.show');
    Route::post('/module/{moduleId}/quiz/start', [QuizController::class, 'start'])->name('quiz.start');
    Route::post('/module/{moduleId}/quiz/submit', [QuizController::class, 'submit'])->name('quiz.submit');
    Route::get('/module/{moduleId}/quiz/result', [QuizController::class, 'result'])->name('quiz.result');


    Route::get('/compiler', function () {
        return Inertia::render('Student/Compiler');
    })->name('compiler');
});
// Student routes
Route::middleware(['auth'])->group(function () {
    // Module routes
    Route::get('/module/{id}', [ModuleController::class, 'show'])->name('module.show');

    // CPMK Routes
    Route::post('/modules/{moduleId}/cpmk/complete', [CpmkController::class, 'markCompleted'])
        ->name('cpmk.complete');

    // Learning Objectives Routes
    Route::post('/modules/{moduleId}/learning-objective/complete', [LearningObjectiveController::class, 'markCompleted'])
        ->name('learning-objective.complete');

    // Student Quiz routes
    Route::prefix('module/{moduleId}/quiz')->name('quiz.')->group(function () {
        Route::get('/', [QuizController::class, 'show'])->name('show');
        Route::get('/result', [QuizController::class, 'result'])->name('result');
        Route::post('/start', [QuizController::class, 'start'])->name('start');
        Route::post('/submit', [QuizController::class, 'submit'])->name('submit');
    });

     // Material routes
    Route::get('/materials/{material}', [MaterialController::class, 'show'])->name('materials.show');
    Route::post('/materials/{material}/complete', [MaterialController::class, 'markCompleted'])->name('materials.complete');
    Route::get('/materials/{material}/download', [MaterialController::class, 'download'])->name('materials.download');

    // Enrichment routes
    Route::get('/enrichments/{enrichment}', [EnrichmentController::class, 'show'])->name('enrichments.show');
    Route::post('/enrichments/{enrichment}/complete', [EnrichmentController::class, 'markCompleted'])
    ->name('enrichments.complete');

    // Assignment routes
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');
    Route::post('/assignments/{assignment}/submit', [AssignmentController::class, 'submit'])->name('assignments.submit');
    Route::get('/assignment-submissions/{submission}/download', [AssignmentController::class, 'download'])->name('assignment-submissions.download');


    Route::get('/leaderboard', function () {
        return Inertia::render('leaderboard');
    })->name('leaderboard');

    Route::get('/compiler', function () {
        return Inertia::render('compiler');
    })->name('compiler');
});

// Instructor routes
Route::middleware(['auth'])->prefix('instructor')->name('instructor.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Instructor/InsDashboard');
    })->name('dashboard');

    Route::get('/praktikum-manage', function () {
        return Inertia::render('Instructor/praktikum');
    })->name('praktikum-manage');

    // Quiz Management Routes
    Route::get('/quiz-manage', [InstructorQuizController::class, 'index'])->name('quiz-manage');

    // Quiz CRUD routes
    Route::post('/quiz', [InstructorQuizController::class, 'store'])->name('quiz.store');
    Route::get('/quiz/{quiz}', [InstructorQuizController::class, 'show'])->name('quiz.show');
    Route::put('/quiz/{quiz}', [InstructorQuizController::class, 'update'])->name('quiz.update');
    Route::delete('/quiz/{quiz}', [InstructorQuizController::class, 'destroy'])->name('quiz.destroy');

    // Additional quiz routes - IMPORTANT: Put specific routes BEFORE parameterized routes
    Route::get('/quiz/results/data', [InstructorQuizController::class, 'results'])->name('quiz.results');
    Route::get('/quiz/analytics/data', [InstructorQuizController::class, 'analytics'])->name('quiz.analytics');
    Route::patch('/quiz/{quiz}/toggle-status', [InstructorQuizController::class, 'toggleStatus'])->name('quiz.toggle-status');
    Route::get('/quiz/result/{attempt}', [InstructorQuizController::class, 'resultDetail'])->name('quiz.result-detail');
});

// API routes for compiler
Route::prefix('api/compiler')->group(function () {
    Route::post('/execute', [CompilerController::class, 'executeCode']);
    Route::post('/execute-judge0', [CompilerController::class, 'executeCodeJudge0']);
    Route::get('/languages', [CompilerController::class, 'getSupportedLanguages']);
    Route::get('/examples', [CompilerController::class, 'getExamples']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
