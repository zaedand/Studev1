<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ModuleCpmk;
use App\Models\UserCpmk;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CpmkController extends Controller
{
    public function markCompleted(Request $request, $moduleId)
    {
        // Log untuk debug
        Log::info('CPMK markCompleted called', [
            'module_id' => $moduleId,
            'user_id' => auth()->id(),
        ]);

        $user = auth()->user();

        try {
            // Cari CPMK untuk modul ini
            $moduleCpmk = ModuleCpmk::where('module_id', $moduleId)->first();

            if (!$moduleCpmk) {
                Log::warning('ModuleCpmk not found', ['module_id' => $moduleId]);

                return back()->with([
                    'flash' => [
                        'error' => true,
                        'message' => 'CPMK tidak ditemukan untuk modul ini.',
                    ]
                ]);
            }

            Log::info('ModuleCpmk found', [
                'module_cpmk_id' => $moduleCpmk->id,
                'points' => $moduleCpmk->point_reward,
            ]);

            // Cek apakah sudah pernah diselesaikan
            $userCpmk = UserCpmk::where('user_id', $user->id)
                ->where('module_cpmk_id', $moduleCpmk->id)
                ->first();

            if ($userCpmk && $userCpmk->is_completed) {
                Log::info('CPMK already completed', ['user_cpmk_id' => $userCpmk->id]);

                return back()->with([
                    'flash' => [
                        'info' => true,
                        'message' => 'CPMK sudah diselesaikan sebelumnya.',
                    ]
                ]);
            }

            $points = $moduleCpmk->point_reward;

            // Gunakan transaction untuk memastikan semua tersimpan
            DB::beginTransaction();

            try {
                // Create atau update user CPMK
                $userCpmk = UserCpmk::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'module_cpmk_id' => $moduleCpmk->id,
                    ],
                    [
                        'module_id' => $moduleId,
                        'is_completed' => true,
                        'points_earned' => $points,
                        'completed_at' => now(),
                    ]
                );

                Log::info('UserCpmk created/updated', [
                    'user_cpmk_id' => $userCpmk->id,
                    'is_completed' => $userCpmk->is_completed,
                ]);

                // Track di user_progress (polymorphic)
                $userProgress = UserProgress::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'progressable_type' => ModuleCpmk::class,
                        'progressable_id' => $moduleCpmk->id,
                    ],
                    [
                        'is_completed' => true,
                        'points_earned' => $points,
                        'completed_at' => now(),
                    ]
                );

                Log::info('UserProgress created/updated', [
                    'user_progress_id' => $userProgress->id,
                    'progressable_type' => $userProgress->progressable_type,
                ]);

                // Tambahkan poin ke user
                $user->increment('points', $points);

                DB::commit();

                Log::info('CPMK completion success', [
                    'user_id' => $user->id,
                    'points_earned' => $points,
                    'total_points' => $user->fresh()->points,
                ]);

                return back()->with([
                    'flash' => [
                        'success' => true,
                        'message' => "CPMK berhasil diselesaikan! Anda mendapatkan {$points} poin 🔥",
                        'total_points' => $user->fresh()->points,
                    ]
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error saving CPMK completion', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('CPMK markCompleted exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                ]
            ]);
        }
    }
}
