<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserProgress;
use App\Models\Module;
use App\Models\ModuleCpmk;
use App\Models\UserCpmk;
use App\Models\ModuleLearningObjective;
use App\Models\UserLearningObjective;
use App\Models\QuizAttempt;

class ProgressService
{
    public function markAsCompleted($user, $progressable, $points = null)
    {
        $points = $points ?? $progressable->point_reward ?? 0;

        $progress = UserProgress::updateOrCreate([
            'user_id'           => $user->id,
            'progressable_type' => get_class($progressable),
            'progressable_id'   => $progressable->id,
        ], [
            'is_completed'  => true,
            'points_earned' => $points,
            'completed_at'  => now(),
        ]);

        $user->addPoints($points);
        return $progress;
    }

    public function getModuleProgress($user, $module)
    {
        // ── Hitung total aktivitas (masing-masing dihitung 1x) ──────────────
        $totalActivities = $module->materials->count()
            + $module->enrichments->count()
            + $module->quizzes->count()       // ← quiz = 1 aktivitas, bukan 1 per attempt
            + $module->assignments->count();

        $cpmkCount        = ModuleCpmk::where('module_id', $module->id)->count();
        $learningObjCount = ModuleLearningObjective::where('module_id', $module->id)->count();
        $totalActivities += $cpmkCount + $learningObjCount;

        if ($totalActivities === 0) {
            return ['percentage' => 100, 'completed' => 0, 'total' => 0];
        }

        // ── Materials ───────────────────────────────────────────────────────
        $completedMaterials = UserProgress::where('user_id', $user->id)
            ->where('is_completed', true)
            ->where('progressable_type', 'App\\Models\\Material')
            ->whereIn('progressable_id', $module->materials->pluck('id'))
            ->count();

        // ── Enrichments ─────────────────────────────────────────────────────
        $completedEnrichments = UserProgress::where('user_id', $user->id)
            ->where('is_completed', true)
            ->where('progressable_type', 'App\\Models\\Enrichment')
            ->whereIn('progressable_id', $module->enrichments->pluck('id'))
            ->count();

        // ── FIX: Quiz — pakai EXISTS per quiz_id, bukan COUNT attempts ──────
        // Dengan begitu 3x percobaan tetap dihitung sebagai 1 aktivitas selesai
        $completedQuizzes = 0;
        foreach ($module->quizzes->pluck('id') as $quizId) {
            if (QuizAttempt::where('user_id', $user->id)->where('quiz_id', $quizId)->exists()) {
                $completedQuizzes++;
            }
        }

        // ── FIX: Assignments — pakai EXISTS per assignment_id ───────────────
        $completedAssignments = 0;
        foreach ($module->assignments->pluck('id') as $assignId) {
            if ($user->assignmentSubmissions()->where('assignment_id', $assignId)->exists()) {
                $completedAssignments++;
            }
        }

        // ── CPMK ────────────────────────────────────────────────────────────
        $completedCpmk = UserCpmk::where('user_id', $user->id)
            ->where('module_id', $module->id)
            ->where('is_completed', true)
            ->count();

        // ── Learning Objectives ─────────────────────────────────────────────
        $completedLearningObj = UserLearningObjective::where('user_id', $user->id)
            ->where('module_id', $module->id)
            ->where('is_completed', true)
            ->count();

        $completed = $completedMaterials
            + $completedEnrichments
            + $completedQuizzes
            + $completedAssignments
            + $completedCpmk
            + $completedLearningObj;

        // ── FIX: Clamp — tidak boleh melebihi totalActivities ───────────────
        $completed = min($completed, $totalActivities);

        return [
            'percentage' => round(($completed / $totalActivities) * 100),
            'completed'  => $completed,
            'total'      => $totalActivities,
        ];
    }

    public function getUserRank($user, $moduleId = null)
    {
        if ($moduleId) {
            $users = User::students()
                ->withSum(['quizAttempts as quiz_points' => fn($q) =>
                    $q->whereHas('quiz', fn($q2) => $q2->where('module_id', $moduleId))
                ], 'points_earned')
                ->withSum(['assignmentSubmissions as assignment_points' => fn($q) =>
                    $q->whereHas('assignment', fn($q2) => $q2->where('module_id', $moduleId))
                ], 'points_earned')
                ->withSum(['progress as progress_points' => fn($q) =>
                    $q->where('is_completed', true)
                      ->whereHasMorph('progressable', ['App\\Models\\Material', 'App\\Models\\Enrichment'],
                          fn($q2) => $q2->where('module_id', $moduleId))
                ], 'points_earned')
                ->get()
                ->map(function ($u) {
                    $u->total_module_points = ($u->quiz_points ?? 0)
                        + ($u->assignment_points ?? 0)
                        + ($u->progress_points ?? 0);
                    return $u;
                })
                ->sortByDesc('total_module_points')
                ->values();

            $rank = $users->search(fn($u) => $u->id === $user->id);
            return $rank !== false ? $rank + 1 : null;
        }

        $users = User::students()->orderBy('point_fire', 'desc')->pluck('id')->toArray();
        $rank  = array_search($user->id, $users);
        return $rank !== false ? $rank + 1 : null;
    }
}
