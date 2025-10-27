<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserProgress;
use App\Models\Module;

class ProgressService
{
    public function markAsCompleted($user, $progressable, $points = null)
    {
        $points = $points ?? $progressable->point_reward ?? 0;

        $progress = UserProgress::updateOrCreate([
            'user_id' => $user->id,
            'progressable_type' => get_class($progressable),
            'progressable_id' => $progressable->id,
        ], [
            'is_completed' => true,
            'points_earned' => $points,
            'completed_at' => now(),
        ]);

        $user->addPoints($points);

        return $progress;
    }

    public function getModuleProgress($user, $module)
    {
        $totalActivities = $module->materials->count() +
                          $module->enrichments->count() +
                          $module->quizzes->count() +
                          $module->assignments->count();

        if ($totalActivities === 0) {
            return ['percentage' => 100, 'completed' => 0, 'total' => 0];
        }

        $completedMaterials = UserProgress::where('user_id', $user->id)
            ->where('is_completed', true)
            ->where('progressable_type', 'App\\Models\\Material')
            ->whereIn('progressable_id', $module->materials->pluck('id'))
            ->count();

        $completedEnrichments = UserProgress::where('user_id', $user->id)
            ->where('is_completed', true)
            ->where('progressable_type', 'App\\Models\\Enrichment')
            ->whereIn('progressable_id', $module->enrichments->pluck('id'))
            ->count();

        $completedQuizzes = $user->quizAttempts()
            ->whereHas('quiz', fn($q) => $q->where('module_id', $module->id))
            ->count();

        $completedAssignments = $user->assignmentSubmissions()
            ->whereHas('assignment', fn($q) => $q->where('module_id', $module->id))
            ->count();

        $completed = $completedMaterials + $completedEnrichments +
                    $completedQuizzes + $completedAssignments;

        return [
            'percentage' => round(($completed / $totalActivities) * 100),
            'completed' => $completed,
            'total' => $totalActivities
        ];
    }

    public function getUserRank($user, $moduleId = null)
    {
        if ($moduleId) {
            // Get rank for specific module
            $users = User::students()
                ->withSum(['quizAttempts as quiz_points' => function ($query) use ($moduleId) {
                    $query->whereHas('quiz', function ($q) use ($moduleId) {
                        $q->where('module_id', $moduleId);
                    });
                }], 'points_earned')
                ->withSum(['assignmentSubmissions as assignment_points' => function ($query) use ($moduleId) {
                    $query->whereHas('assignment', function ($q) use ($moduleId) {
                        $q->where('module_id', $moduleId);
                    });
                }], 'points_earned')
                ->withSum(['progress as progress_points' => function ($query) use ($moduleId) {
                    $query->where('is_completed', true)
                          ->whereHasMorph('progressable', ['App\\Models\\Material', 'App\\Models\\Enrichment'],
                              function ($q) use ($moduleId) {
                                  $q->where('module_id', $moduleId);
                              });
                }], 'points_earned')
                ->get()
                ->map(function ($u) {
                    $u->total_module_points = ($u->quiz_points ?? 0) +
                                            ($u->assignment_points ?? 0) +
                                            ($u->progress_points ?? 0);
                    return $u;
                })
                ->sortByDesc('total_module_points')
                ->values();

            $rank = $users->search(function ($u) use ($user) {
                return $u->id === $user->id;
            });

            return $rank !== false ? $rank + 1 : null;
        }

        // Get overall rank
        $users = User::students()
            ->orderBy('point_fire', 'desc')
            ->pluck('id')
            ->toArray();

        $rank = array_search($user->id, $users);
        return $rank !== false ? $rank + 1 : null;
    }
}
