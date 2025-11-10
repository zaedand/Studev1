<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
            'file_name' => $material->file_name ?? basename($material->file_path),
            'file_path' => $material->file_path,
            'file_size' => $this->formatFileSize($material->file_size ?? 0),
            'points' => $material->point_reward,
            'module_id' => $material->module_id,
            'read_progress' => $progress ? ($progress->progress_percentage ?? 0) : 0,
            'completed' => $progress ? $progress->is_completed : false,
            'can_download' => $progress && $progress->is_completed, // ✅ Bisa download jika sudah selesai
        ];

        return Inertia::render('Student/Materials/Show', [
            'material' => $materialData
        ]);
    }

    /**
     * Mark material as completed and award points
     */
    public function markCompleted($materialId)
    {
        $user = Auth::user();
        $material = Material::findOrFail($materialId);

        // Check if already completed
        $progress = UserProgress::where('user_id', $user->id)
            ->where('progressable_type', Material::class)
            ->where('progressable_id', $material->id)
            ->first();

        if ($progress && $progress->is_completed) {
            return back()->with([
                'flash' => [
                    'info' => true,
                    'message' => 'Materi sudah diselesaikan sebelumnya'
                ]
            ]);
        }

        DB::beginTransaction();

        try {
            $points = $material->point_reward;

            // Create or update progress
            $progress = UserProgress::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'progressable_type' => Material::class,
                    'progressable_id' => $material->id,
                ],
                [
                    'is_completed' => true,
                    'points_earned' => $points,
                    'completed_at' => now(),
                ]
            );

            // ✅ Award points to user
            $user->increment('points', $points);

            DB::commit();

            Log::info('Material completed', [
                'user_id' => $user->id,
                'material_id' => $material->id,
                'points_earned' => $points
            ]);

            return back()->with([
                'flash' => [
                    'success' => true,
                    'message' => "Selamat! Materi selesai. Anda mendapat {$points} poin 🔥",
                    'total_points' => $user->fresh()->points
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Material completion error', [
                'user_id' => $user->id,
                'material_id' => $material->id,
                'error' => $e->getMessage()
            ]);

            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Terjadi kesalahan: ' . $e->getMessage()
                ]
            ]);
        }
    }

    /**
     * Download material file
     */
    public function download($materialId)
    {
        $user = Auth::user();
        $material = Material::findOrFail($materialId);

        Log::info('Download attempt', [
            'user_id' => $user->id,
            'material_id' => $material->id,
            'file_path' => $material->file_path
        ]);

        // ✅ Check if user has completed the material
        $progress = UserProgress::where('user_id', $user->id)
            ->where('progressable_type', Material::class)
            ->where('progressable_id', $material->id)
            ->first();

        if (!$progress || !$progress->is_completed) {
            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Selesaikan membaca materi terlebih dahulu untuk dapat mengunduh'
                ]
            ]);
        }

        // ✅ Check if file exists
        $filePath = $material->file_path;

        // Handle both formats: with/without 'public/' prefix
        if (!Storage::disk('public')->exists($filePath)) {
            // Try without 'public/' prefix if it's included
            $filePath = str_replace('public/', '', $filePath);

            if (!Storage::disk('public')->exists($filePath)) {
                Log::error('File not found', [
                    'material_id' => $material->id,
                    'file_path' => $material->file_path,
                    'tried_path' => $filePath
                ]);

                return back()->with([
                    'flash' => [
                        'error' => true,
                        'message' => 'File tidak ditemukan di server'
                    ]
                ]);
            }
        }

        $fileName = $material->file_name ?? basename($material->file_path);

        Log::info('Download successful', [
            'user_id' => $user->id,
            'material_id' => $material->id,
            'file_name' => $fileName
        ]);

        return Storage::disk('public')->download($filePath, $fileName);
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
        } elseif ($bytes > 0) {
            return $bytes . ' bytes';
        }
        return '0 bytes';
    }
}
