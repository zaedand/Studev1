<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MaterialController extends Controller
{
    /**
     * Display the specified material
     */
    public function show(Material $material)
    {
        $user = Auth::user();

        // Get user progress for this material
        $progress = UserProgress::where('user_id', $user->id)
            ->where('progressable_type', Material::class)
            ->where('progressable_id', $material->id)
            ->first();

        $materialData = [
            'id' => $material->id,
            'title' => $material->title,
            'description' => $material->description,
            'file_name' => $material->file_name,
            'file_path' => $material->file_path,
            'file_size' => $this->formatFileSize($material->file_size),
            'points' => $material->point_reward,
            'module_id' => $material->module_id,
            'read_progress' => $progress ? $progress->progress_percentage : 0,
            'completed' => $progress ? $progress->is_completed : false,
            'can_download' => $progress && $progress->progress_percentage >= 80,
        ];

        return Inertia::render('Student/Materials/Show', [
            'material' => $materialData
        ]);
    }

    /**
     * Mark material as completed and award points
     */
    public function markCompleted(Material $material)
    {
        $user = Auth::user();

        // Check if already completed
        $progress = UserProgress::where('user_id', $user->id)
            ->where('progressable_type', Material::class)
            ->where('progressable_id', $material->id)
            ->first();

        if ($progress && $progress->is_completed) {
            return redirect()->back()->with('flash', [
                'success' => false,
                'message' => 'Materi sudah diselesaikan sebelumnya'
            ]);
        }

        // Create or update progress
        $progress = UserProgress::updateOrCreate(
            [
                'user_id' => $user->id,
                'progressable_type' => Material::class,
                'progressable_id' => $material->id,
            ],
            [
                'is_completed' => true,
                'progress_percentage' => 100,
                'completed_at' => now(),
            ]
        );

        // Award points to user
        $user->addPoints($material->point_reward);

        return redirect()->back()->with('flash', [
            'success' => true,
            'message' => "Selamat! Anda mendapat {$material->points} poin fire!",
            'total_points' => $user->points
        ]);
    }

    /**
     * Download material file
     */
    public function download(Material $material)
    {
        $user = Auth::user();

        // Check if user has permission to download (80% read progress)
        $progress = UserProgress::where('user_id', $user->id)
            ->where('progressable_type', Material::class)
            ->where('progressable_id', $material->id)
            ->first();

        if (!$progress || $progress->progress_percentage < 80) {
            return redirect()->back()->with('error',
                'Selesaikan membaca materi terlebih dahulu untuk dapat mengunduh');
        }

        // Check if file exists
        if (!Storage::disk('public')->exists($material->file_path)) {
            return redirect()->back()->with('error', 'File tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $material->file_path,
            $material->file_name
        );
    }

    /**
     * Format file size to human readable
     */
    private function formatFileSize($bytes)
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
}
