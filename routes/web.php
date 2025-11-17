<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\Student\MaterialController;
use App\Http\Controllers\Student\EnrichmentController;
use App\Http\Controllers\Student\AssignmentController;
use App\Http\Controllers\Student\CpmkController;
use App\Http\Controllers\Student\LearningObjectiveController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CompilerController;
use App\Http\Controllers\Instructor\InstructorDashboardController;
use App\Http\Controllers\Instructor\ModuleController as InstructorModuleController;
use App\Http\Controllers\Instructor\QuizController as InstructorQuizController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('welcome');

/*
|--------------------------------------------------------------------------
| Authenticated Routes (All Roles)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard - redirect based on role
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');


    // Compiler - accessible to all authenticated users
    Route::get('/compiler', function () {
        return Inertia::render('compiler');
    })->name('compiler');

    // Leaderboard - accessible to all authenticated users
    Route::get('/leaderboard', [LeaderboardController::class, 'index'])
        ->name('leaderboard');
});

/*
|--------------------------------------------------------------------------
| Student Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:student'])->group(function () {

    // Module Detail
    Route::get('/module/{module}', [ModuleController::class, 'show'])
        ->name('module.show');

    // CPMK Routes
    Route::post('/modules/{moduleId}/cpmk/complete', [CpmkController::class, 'markCompleted'])
        ->name('cpmk.complete');

    // Learning Objectives Routes
    Route::post('/modules/{moduleId}/learning-objective/complete', [LearningObjectiveController::class, 'markCompleted'])
        ->name('learning-objective.complete');

    // Material Routes
    Route::prefix('materials')->name('materials.')->group(function () {
        Route::get('/{material}', [MaterialController::class, 'show'])
            ->name('show');
        Route::post('/{material}/complete', [MaterialController::class, 'markCompleted'])
            ->name('complete');
        Route::get('/{material}/download', [MaterialController::class, 'download'])
            ->name('download');
    });

    // Enrichment Routes
    Route::prefix('enrichments')->name('enrichments.')->group(function () {
        Route::get('/{enrichment}', [EnrichmentController::class, 'show'])
            ->name('show');
        Route::post('/{enrichment}/complete', [EnrichmentController::class, 'markCompleted'])
            ->name('complete');
    });

    // Quiz Routes
    Route::prefix('module/{moduleId}/quiz')->name('quiz.')->group(function () {
        Route::get('/', [QuizController::class, 'show'])
            ->name('show');
        Route::post('/start', [QuizController::class, 'start'])
            ->name('start');
        Route::post('/submit', [QuizController::class, 'submit'])
            ->name('submit');
        Route::get('/result', [QuizController::class, 'result'])
            ->name('result');
    });

    // Assignment Routes
    Route::prefix('assignments')->name('assignments.')->group(function () {
        Route::get('/{assignment}', [AssignmentController::class, 'show'])
            ->name('show');
        Route::post('/{assignment}/submit', [AssignmentController::class, 'submit'])
            ->name('submit');
    });

    // Assignment Submission Download
    Route::get('/assignment-submissions/{submission}/download', [AssignmentController::class, 'download'])
        ->name('assignment-submissions.download');
});

/*
|--------------------------------------------------------------------------
| Instructor Routes
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Instructor\ModuleComponentController;
use App\Http\Controllers\Instructor\ClassRoomController;
use App\Http\Controllers\Instructor\PraktikumController;

Route::middleware(['auth', 'role:instructor'])
    ->prefix('instructor')
    ->name('instructor.')
    ->group(function () {

    // Dashboard
    Route::get('/dashboard', [InstructorDashboardController::class, 'index'])
        ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Module Management
    |--------------------------------------------------------------------------
    */
    Route::prefix('modules')->name('modules.')->group(function () {

        Route::get('/', [InstructorModuleController::class, 'index'])->name('index');
        Route::get('/create', [InstructorModuleController::class, 'create'])->name('create');
        Route::get('/{id}/edit', [InstructorModuleController::class, 'edit'])->name('edit');

        Route::post('/', [InstructorModuleController::class, 'store'])->name('store');
        Route::put('/{id}', [InstructorModuleController::class, 'update'])->name('update');
        Route::delete('/{id}', [InstructorModuleController::class, 'destroy'])->name('destroy');

        Route::get('/{id}', [InstructorModuleController::class, 'show'])->name('show');

        // Extra
        Route::post('/{id}/toggle-active', [InstructorModuleController::class, 'toggleActive'])
            ->name('toggle-active');
        Route::post('/reorder', [InstructorModuleController::class, 'reorder'])
            ->name('reorder');
    });

    /*
    |--------------------------------------------------------------------------
    | Module Components (CPMK / Learning Objectives / Material / Enrichment)
    |--------------------------------------------------------------------------
    */
    Route::prefix('modules/{module}')->name('modules.')->group(function () {

        // CPMK
        Route::post('/cpmk', [ModuleComponentController::class, 'storeCpmk'])->name('cpmk.store');
        Route::put('/cpmk/{cpmk}', [ModuleComponentController::class, 'updateCpmk'])->name('cpmk.update');
        Route::delete('/cpmk/{cpmk}', [ModuleComponentController::class, 'destroyCpmk'])->name('cpmk.destroy');

        // Learning Objectives
        Route::post('/learning-objective', [ModuleComponentController::class, 'storeLearningObjective'])->name('learning-objective.store');
        Route::put('/learning-objective/{objective}', [ModuleComponentController::class, 'updateLearningObjective'])->name('learning-objective.update');
        Route::delete('/learning-objective/{objective}', [ModuleComponentController::class, 'destroyLearningObjective'])->name('learning-objective.destroy');

        // Material
        Route::post('/material', [ModuleComponentController::class, 'storeMaterial'])->name('material.store');
        Route::put('/material/{material}', [ModuleComponentController::class, 'updateMaterial'])->name('material.update');
        Route::delete('/material/{material}', [ModuleComponentController::class, 'destroyMaterial'])->name('material.destroy');

        // Enrichment
        Route::post('/enrichment', [ModuleComponentController::class, 'storeEnrichment'])->name('enrichment.store');
        Route::put('/enrichment/{enrichment}', [ModuleComponentController::class, 'updateEnrichment'])->name('enrichment.update');
        Route::delete('/enrichment/{enrichment}', [ModuleComponentController::class, 'destroyEnrichment'])->name('enrichment.destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | Class Management
    |--------------------------------------------------------------------------
    */
    Route::resource('classes', ClassRoomController::class);

    /*
    |--------------------------------------------------------------------------
    | Praktikum
    |--------------------------------------------------------------------------
    */
    Route::prefix('praktikum')->name('praktikum.')->group(function () {
        // Main praktikum management page
        Route::get('/', [PraktikumController::class, 'index'])
            ->name('index');

        // Assignment CRUD
        Route::post('/', [PraktikumController::class, 'store'])
            ->name('store');
        Route::put('/{id}', [PraktikumController::class, 'update'])
            ->name('update');
        Route::delete('/{id}', [PraktikumController::class, 'destroy'])
            ->name('destroy');

        // Submissions
        Route::get('/submissions/{id}/preview', [PraktikumController::class, 'previewSubmission'])
            ->name('submissions.preview');
        Route::get('/submissions', [PraktikumController::class, 'submissions'])
            ->name('submissions');
        Route::post('/submissions/{id}/grade', [PraktikumController::class, 'gradeSubmission'])
            ->name('submissions.grade');
        Route::get('/submissions/{id}/download', [PraktikumController::class, 'downloadSubmission'])
            ->name('submissions.download');
        Route::get('/assignments/{id}/download-all', [PraktikumController::class, 'downloadAllSubmissions'])
            ->name('assignments.download-all');

        // Analytics
        Route::get('/analytics', [PraktikumController::class, 'analytics'])
            ->name('analytics');
    });

    /*
    |--------------------------------------------------------------------------
    | Quiz Management
    |--------------------------------------------------------------------------
    */
    Route::prefix('quiz')->name('quiz.')->group(function () {

        Route::get('/results/data', [InstructorQuizController::class, 'results'])->name('results');
        Route::get('/analytics/data', [InstructorQuizController::class, 'analytics'])->name('analytics');

        Route::get('/', [InstructorQuizController::class, 'index'])->name('index');
        Route::post('/', [InstructorQuizController::class, 'store'])->name('store');
        Route::get('/{quiz}', [InstructorQuizController::class, 'show'])->name('show');
        Route::put('/{quiz}', [InstructorQuizController::class, 'update'])->name('update');
        Route::delete('/{quiz}', [InstructorQuizController::class, 'destroy'])->name('destroy');

        Route::patch('/{quiz}/toggle-status', [InstructorQuizController::class, 'toggleStatus'])->name('toggle-status');
        Route::get('/result/{attempt}', [InstructorQuizController::class, 'resultDetail'])->name('result-detail');
    });
});


/*
|--------------------------------------------------------------------------
| API Routes (No CSRF, accessible to authenticated users)
|--------------------------------------------------------------------------
*/
Route::prefix('api')->middleware('auth')->group(function () {
    // Compiler API
    Route::prefix('compiler')->group(function () {
        Route::post('/execute', [CompilerController::class, 'executeCode']);
        Route::post('/execute-judge0', [CompilerController::class, 'executeCodeJudge0']);
        Route::get('/languages', [CompilerController::class, 'getSupportedLanguages']);
        Route::get('/examples', [CompilerController::class, 'getExamples']);
    });
});

/*
|--------------------------------------------------------------------------
| Additional Route Files
|--------------------------------------------------------------------------
*/
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
