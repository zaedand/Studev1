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
use App\Http\Controllers\ManualBookController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Rute Publik
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('welcome');

/*
|--------------------------------------------------------------------------
| Rute Terautentikasi (Semua Peran)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/compiler', function () {
        return Inertia::render('compiler');
    })->name('compiler');

    Route::get('/leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard');
});

/*
|--------------------------------------------------------------------------
| Rute Mahasiswa
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:student'])->group(function () {

    // Detail Modul
    Route::get('/module/{module}', [ModuleController::class, 'show'])
        ->name('module.show')
        ->middleware('check.module.access');

    // CPMK
    Route::post('/modules/{moduleId}/cpmk/complete', [CpmkController::class, 'markCompleted'])
        ->name('cpmk.complete');

    // Tujuan Pembelajaran
    Route::post('/modules/{moduleId}/learning-objective/complete', [LearningObjectiveController::class, 'markCompleted'])
        ->name('learning-objective.complete');

    // Materi
    Route::prefix('materials')->name('materials.')->group(function () {
        Route::get('/{material}', [MaterialController::class, 'show'])->name('show');
        Route::get('/modules/material/{id}/preview', [ModuleController::class, 'preview'])->name('material.preview');
        Route::post('/materials/{material}/complete', [MaterialController::class, 'complete'])->name('materials.complete');
        Route::post('/{material}/complete', [MaterialController::class, 'markCompleted'])->name('complete');
        Route::get('/{material}/download', [MaterialController::class, 'download'])->name('download');
    });

    // Pengayaan
    Route::prefix('enrichments')->name('enrichments.')->group(function () {
        Route::get('/{enrichment}', [EnrichmentController::class, 'show'])->name('show');
        Route::post('/{enrichment}/complete', [EnrichmentController::class, 'markCompleted'])->name('complete');
    });

    // Kuis
    Route::prefix('module/{moduleId}/quiz')->name('quiz.')->group(function () {
        Route::get('/', [QuizController::class, 'show'])->name('show');
        Route::post('/start', [QuizController::class, 'start'])->name('start');
        Route::post('/submit', [QuizController::class, 'submit'])->name('submit');
        Route::get('/result', [QuizController::class, 'result'])->name('result');
    });

    // Tugas / Praktikum (Mahasiswa)
    Route::prefix('assignments')->name('assignments.')->group(function () {
        Route::get('/{assignment}', [AssignmentController::class, 'show'])->name('show');
        Route::post('/{assignment}/submit', [AssignmentController::class, 'submit'])->name('submit');

        // ★ Unduh template laporan praktikum untuk mahasiswa
        Route::get('/template/download', [AssignmentController::class, 'downloadTemplate'])
            ->name('template.download');
    });

    Route::post('/assignments/{assignment}/resubmit', [AssignmentController::class, 'resubmit'])
        ->name('assignments.resubmit');
    Route::delete('/assignments/{assignment}/submission', [AssignmentController::class, 'deleteSubmission'])
        ->name('assignments.delete');

    // Unduh Pengumpulan
    Route::get('/assignment-submissions/{submission}/download', [AssignmentController::class, 'download'])
        ->name('assignment-submissions.download');

    // Buku Panduan
    Route::prefix('manual-book')->name('manualbook.')->group(function () {
        Route::get('/', [ManualBookController::class, 'index'])->name('index');
        Route::get('/download', [ManualBookController::class, 'download'])->name('download');
        Route::get('/view', [ManualBookController::class, 'view'])->name('view');
    });
});

/*
|--------------------------------------------------------------------------
| Rute Instruktur / Dosen
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Instructor\ModuleComponentController;
use App\Http\Controllers\Instructor\ClassRoomController;
use App\Http\Controllers\Instructor\PraktikumController;

Route::middleware(['auth', 'role:instructor'])
    ->prefix('instructor')
    ->name('instructor.')
    ->group(function () {

    Route::get('/dashboard', [InstructorDashboardController::class, 'index'])->name('dashboard');

    // ── Manajemen Modul ──────────────────────────────────────────────────────
    Route::prefix('modules')->name('modules.')->group(function () {
        Route::get('/', [InstructorModuleController::class, 'index'])->name('index');
        Route::get('/create', [InstructorModuleController::class, 'create'])->name('create');
        Route::get('/{id}/edit', [InstructorModuleController::class, 'edit'])->name('edit');
        Route::post('/', [InstructorModuleController::class, 'store'])->name('store');
        Route::put('/{id}', [InstructorModuleController::class, 'update'])->name('update');
        Route::delete('/{id}', [InstructorModuleController::class, 'destroy'])->name('destroy');
        Route::get('/{id}', [InstructorModuleController::class, 'show'])->name('show');
        Route::post('/{id}/toggle-active', [InstructorModuleController::class, 'toggleActive'])->name('toggle-active');
        Route::post('/reorder', [InstructorModuleController::class, 'reorder'])->name('reorder');
    });

    // ── Komponen Modul ───────────────────────────────────────────────────────
    Route::prefix('modules/{module}')->name('modules.')->group(function () {
        Route::post('/cpmk', [ModuleComponentController::class, 'storeCpmk'])->name('cpmk.store');
        Route::put('/cpmk/{cpmk}', [ModuleComponentController::class, 'updateCpmk'])->name('cpmk.update');
        Route::delete('/cpmk/{cpmk}', [ModuleComponentController::class, 'destroyCpmk'])->name('cpmk.destroy');

        Route::post('/learning-objective', [ModuleComponentController::class, 'storeLearningObjective'])->name('learning-objective.store');
        Route::put('/learning-objective/{objective}', [ModuleComponentController::class, 'updateLearningObjective'])->name('learning-objective.update');
        Route::delete('/learning-objective/{objective}', [ModuleComponentController::class, 'destroyLearningObjective'])->name('learning-objective.destroy');

        Route::post('/material', [ModuleComponentController::class, 'storeMaterial'])->name('material.store');
        Route::put('/material/{material}', [ModuleComponentController::class, 'updateMaterial'])->name('material.update');
        Route::delete('/material/{material}', [ModuleComponentController::class, 'destroyMaterial'])->name('material.destroy');

        Route::post('/enrichment', [ModuleComponentController::class, 'storeEnrichment'])->name('enrichment.store');
        Route::put('/enrichment/{enrichment}', [ModuleComponentController::class, 'updateEnrichment'])->name('enrichment.update');
        Route::delete('/enrichment/{enrichment}', [ModuleComponentController::class, 'destroyEnrichment'])->name('enrichment.destroy');
    });

    // ── Manajemen Kelas ──────────────────────────────────────────────────────
    Route::prefix('classes')->name('classes.')->group(function () {
        Route::get('/', [ClassRoomController::class, 'index'])->name('index');
        Route::get('/create', [ClassRoomController::class, 'create'])->name('create');
        Route::post('/', [ClassRoomController::class, 'store'])->name('store');
        Route::get('/{id}', [ClassRoomController::class, 'show'])->name('show');
        Route::get('/{id}/edit', [ClassRoomController::class, 'edit'])->name('edit');
        Route::put('/{id}', [ClassRoomController::class, 'update'])->name('update');
        Route::delete('/{id}', [ClassRoomController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/toggle-active', [ClassRoomController::class, 'toggleActive'])->name('toggle-active');
        Route::post('/{id}/students', [ClassRoomController::class, 'addStudent'])->name('add-student');
        Route::delete('/{classId}/students/{studentId}', [ClassRoomController::class, 'removeStudent'])->name('remove-student');
        Route::get('/{id}/available-students', [ClassRoomController::class, 'availableStudents'])->name('available-students');
    });

    // ── Praktikum ────────────────────────────────────────────────────────────
    Route::prefix('praktikum')->name('praktikum.')->group(function () {
        Route::get('/', [PraktikumController::class, 'index'])->name('index');
        Route::post('/', [PraktikumController::class, 'store'])->name('store');
        Route::put('/{id}', [PraktikumController::class, 'update'])->name('update');
        Route::delete('/{id}', [PraktikumController::class, 'destroy'])->name('destroy');

        // Pengumpulan
        Route::get('/submissions/{id}/preview', [PraktikumController::class, 'previewSubmission'])->name('submissions.preview');
        Route::get('/submissions', [PraktikumController::class, 'submissions'])->name('submissions');
        Route::post('/submissions/{id}/grade', [PraktikumController::class, 'gradeSubmission'])->name('submissions.grade');
        Route::get('/submissions/{id}/download', [PraktikumController::class, 'downloadSubmission'])->name('submissions.download');

        // ★ Unduh template laporan (untuk dosen — agar bisa dibagikan ke mahasiswa)
        Route::get('/template/download', [PraktikumController::class, 'downloadTemplate'])->name('template.download');

        // Analitik
        Route::get('/analytics', [PraktikumController::class, 'analytics'])->name('analytics');
    });

    // ── Manajemen Kuis ───────────────────────────────────────────────────────
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

    // Buku Panduan
    Route::get('/manual-book', [ManualBookController::class, 'instructor'])->name('manualbook.index');
    Route::get('/manual-book/download', [ManualBookController::class, 'downloadInstructor'])->name('manualbook.download');
    Route::get('/manual-book/view', [ManualBookController::class, 'viewInstructor'])->name('manualbook.view');
});


use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\UserManagementController;

/*
|--------------------------------------------------------------------------
| Rute Admin
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

    // Dasbor
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Manajemen Pengguna
    Route::prefix('pengguna')->name('user')->group(function () {
        Route::get('/', [UserManagementController::class, 'index'])->name('index');
        Route::get('/{user}', [UserManagementController::class, 'tampil'])->name('tampil');
        Route::patch('/{user}/ubah-peran', [UserManagementController::class, 'ubahPeran'])->name('ubah-peran');
        Route::delete('/{user}', [UserManagementController::class, 'hapus'])->name('hapus');
    });
});

/*
|--------------------------------------------------------------------------
| Rute API (Tanpa CSRF, Terautentikasi)
|--------------------------------------------------------------------------
*/
Route::prefix('api')->middleware('auth')->group(function () {
    Route::prefix('compiler')->group(function () {
        Route::post('/execute', [CompilerController::class, 'executeCode']);
        Route::post('/execute-judge0', [CompilerController::class, 'executeCodeJudge0']);
        Route::get('/languages', [CompilerController::class, 'getSupportedLanguages']);
        Route::get('/examples', [CompilerController::class, 'getExamples']);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
