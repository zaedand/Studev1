<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Module;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index()
    {
        $currentUser = auth()->user();

        // Get all students with their stats
        $students = User::where('role', 'student')
            ->select('id', 'name', 'email', 'points', 'created_at')
            ->withCount([
                'progress as completed_modules' => function ($query) {
                    $query->where('is_completed', true)
                          ->where('progressable_type', 'App\\Models\\Module');
                }
            ])
            ->orderBy('points', 'desc')
            ->get()
            ->map(function ($student, $index) use ($currentUser) {
                return [
                    'id' => $student->id,
                    'rank' => $index + 1,
                    'name' => $student->name,
                    'avatar' => $this->getInitials($student->name),
                    'points' => $student->points,
                    'completedModules' => $this->getCompletedModulesCount($student->id),
                    'totalModules' => Module::count(),
                    'level' => $this->calculateLevel($student->points),
                    'isCurrentUser' => $student->id === $currentUser->id,
                    'joinedDate' => $student->created_at->format('M Y'),
                ];
            });

        // Global stats
        $totalModules = Module::count();
        $totalStudents = User::where('role', 'student')->count();
        $averagePoints = round(User::where('role', 'student')->avg('points') ?? 0);

        // Completion rate
        $totalPossibleCompletions = $totalStudents * $totalModules;
        $actualCompletions = $this->getTotalCompletedModules();
        $completionRate = $totalPossibleCompletions > 0
            ? round(($actualCompletions / $totalPossibleCompletions) * 100)
            : 0;

        // Current user rank
        $currentUserRank = $students->where('id', $currentUser->id)->first();

        return Inertia::render('leaderboard', [
            'leaderboard' => $students,
            'currentUser' => $currentUserRank,
            'globalStats' => [
                'totalStudents' => $totalStudents,
                'averagePoints' => $averagePoints,
                'completionRate' => $completionRate,
                'totalModules' => $totalModules,
            ]
        ]);
    }

    /**
     * Get initials from name
     */
    private function getInitials($name)
    {
        $words = explode(' ', $name);
        if (count($words) >= 2) {
            return strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1));
        }
        return strtoupper(substr($name, 0, 2));
    }

    /**
     * Calculate level based on points
     */
    private function calculateLevel($points)
    {
        if ($points >= 4000) return 'Master';
        if ($points >= 3000) return 'Expert';
        if ($points >= 2000) return 'Advanced';
        if ($points >= 1000) return 'Intermediate';
        return 'Beginner';
    }

    /**
     * Get count of completed modules for a user
     */
    private function getCompletedModulesCount($userId)
    {
        // Count modules where all components are completed
        $modules = Module::all();
        $completedCount = 0;

        foreach ($modules as $module) {
            $totalComponents = 0;
            $completedComponents = 0;

            // 1. CPMK
            $cpmkCount = DB::table('module_cpmks')->where('module_id', $module->id)->count();
            if ($cpmkCount > 0) {
                $totalComponents += $cpmkCount;
                $completedCpmk = DB::table('user_cpmks')
                    ->where('user_id', $userId)
                    ->where('module_id', $module->id)
                    ->where('is_completed', true)
                    ->count();
                $completedComponents += $completedCpmk;
            }

            // 2. Learning Objectives
            $learningObjCount = DB::table('module_learning_objectives')->where('module_id', $module->id)->count();
            if ($learningObjCount > 0) {
                $totalComponents += $learningObjCount;
                $completedLearningObj = DB::table('user_learning_objectives')
                    ->where('user_id', $userId)
                    ->where('module_id', $module->id)
                    ->where('is_completed', true)
                    ->count();
                $completedComponents += $completedLearningObj;
            }

            // 3. Materials
            $materialCount = DB::table('materials')->where('module_id', $module->id)->count();
            if ($materialCount > 0) {
                $totalComponents += $materialCount;
                $completedMaterials = DB::table('user_progress')
                    ->where('user_id', $userId)
                    ->where('progressable_type', 'App\\Models\\Material')
                    ->where('is_completed', true)
                    ->whereIn('progressable_id', function($query) use ($module) {
                        $query->select('id')
                              ->from('materials')
                              ->where('module_id', $module->id);
                    })
                    ->count();
                $completedComponents += $completedMaterials;
            }

            // 4. Enrichments
            $enrichmentCount = DB::table('enrichments')
                ->where('module_id', $module->id)
                ->where('is_active', 1)
                ->count();
            if ($enrichmentCount > 0) {
                $totalComponents += $enrichmentCount;
                $completedEnrichments = DB::table('user_progress')
                    ->where('user_id', $userId)
                    ->where('progressable_type', 'App\\Models\\Enrichment')
                    ->where('is_completed', true)
                    ->whereIn('progressable_id', function($query) use ($module) {
                        $query->select('id')
                              ->from('enrichments')
                              ->where('module_id', $module->id);
                    })
                    ->count();
                $completedComponents += $completedEnrichments;
            }

            // 5. Quizzes
            $quizCount = DB::table('quizzes')->where('module_id', $module->id)->count();
            if ($quizCount > 0) {
                $totalComponents += $quizCount;
                $completedQuizzes = DB::table('quiz_attempts')
                    ->where('user_id', $userId)
                    ->whereNotNull('completed_at')
                    ->whereIn('quiz_id', function($query) use ($module) {
                        $query->select('id')
                            ->from('quizzes')
                            ->where('module_id', $module->id);
                    })
                    ->distinct('quiz_id')
                    ->count();

                $completedComponents += $completedQuizzes;
            }

            // 6. Assignments
            $assignmentCount = DB::table('assignments')->where('module_id', $module->id)->count();
            if ($assignmentCount > 0) {
                $totalComponents += $assignmentCount;
                $completedAssignments = DB::table('assignment_submissions')
                    ->where('user_id', $userId)
                    ->whereNotNull('submitted_at')
                    ->whereIn('assignment_id', function($query) use ($module) {
                        $query->select('id')
                              ->from('assignments')
                              ->where('module_id', $module->id);
                    })
                    ->count();
                $completedComponents += $completedAssignments;
            }

            // If all components completed, count this module as completed
            if ($totalComponents > 0 && $completedComponents >= $totalComponents) {
                $completedCount++;
            }
        }

        return $completedCount;
    }

    /**
     * Get total completed modules across all students
     */
    private function getTotalCompletedModules()
    {
        $students = User::where('role', 'student')->pluck('id');
        $total = 0;

        foreach ($students as $studentId) {
            $total += $this->getCompletedModulesCount($studentId);
        }

        return $total;
    }
}
