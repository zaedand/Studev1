<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ModuleLearningObjective;
use App\Models\UserLearningObjective;
use App\Models\UserProgress;
use Illuminate\Http\Request;

class LearningObjectiveController extends Controller
{
    public function markCompleted(Request $request, $moduleId)
    {
        $user = auth()->user();

        // Cari Tujuan Pembelajaran untuk modul ini
        $learningObjective = ModuleLearningObjective::where('module_id', $moduleId)->first();

        if (!$learningObjective) {
            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Tujuan Pembelajaran tidak ditemukan.',
                ]
            ]);
        }

        // Cek apakah sudah pernah diselesaikan
        $userLearningObj = UserLearningObjective::where('user_id', $user->id)
            ->where('module_learning_objective_id', $learningObjective->id)
            ->first();

        if ($userLearningObj && $userLearningObj->is_completed) {
            return back()->with([
                'flash' => [
                    'info' => true,
                    'message' => 'Tujuan Pembelajaran sudah diselesaikan sebelumnya.',
                ]
            ]);
        }

        $points = $learningObjective->point_reward;

        // Create atau update user Learning Objective
        UserLearningObjective::updateOrCreate(
            [
                'user_id' => $user->id,
                'module_learning_objective_id' => $learningObjective->id,
            ],
            [
                'module_id' => $moduleId,
                'is_completed' => true,
                'points_earned' => $points,
                'completed_at' => now(),
            ]
        );

        // ✅ Track di user_progress (polymorphic)
        UserProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'progressable_type' => ModuleLearningObjective::class,
                'progressable_id' => $learningObjective->id,
            ],
            [
                'is_completed' => true,
                'points_earned' => $points,
                'completed_at' => now(),
            ]
        );

        // Tambahkan poin ke user
        $user->increment('points', $points);

        return back()->with([
            'flash' => [
                'success' => true,
                'message' => "Tujuan Pembelajaran berhasil diselesaikan! Anda mendapatkan {$points} poin 🔥",
                'total_points' => $user->fresh()->points,
            ]
        ]);
    }
}
