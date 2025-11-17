<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Module;
use App\Models\UserProgress;
use App\Models\UserCpmk;
use App\Models\UserLearningObjective;
use App\Models\QuizAttempt;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get all modules with progress
        $modules = Module::orderBy('order_number')
            ->get()
            ->map(function ($module) use ($user) {
                $progress = $this->calculateModuleProgress($user->id, $module->id);

                return [
                    'id' => $module->id,
                    'title' => $module->title,
                    'description' => $module->description,
                    'progress' => $progress['percentage'],
                    'totalLessons' => $progress['total'],
                    'completedLessons' => $progress['completed'],
                    'color' => $this->getModuleColor($module->order_number),
                    'icon' => 'BookOpen',
                ];
            });

        // Get user rank
        $userRank = $this->getUserRank($user->id);

        // Get total students
        $totalStudents = User::where('role', 'student')->count();

        // Get completed modules count
        $completedModules = $this->getCompletedModulesCount($user->id);

        // User stats
        $userStats = [
            'totalPoints' => $user->points,
            'currentRank' => $userRank,
            'totalStudents' => $totalStudents,
            'completedModules' => $completedModules,
            'totalModules' => Module::count(),
        ];

        return Inertia::render('dashboard', [
            'modules' => $modules,
            'userStats' => $userStats,
        ]);
    }

    /**
     * Calculate module progress for a user
     */
    private function calculateModuleProgress($userId, $moduleId)
    {
        $totalComponents = 0;
        $completedComponents = 0;

        // 1. CPMK
        $cpmkCount = DB::table('module_cpmks')->where('module_id', $moduleId)->count();
        if ($cpmkCount > 0) {
            $totalComponents += $cpmkCount;
            $completedCpmk = DB::table('user_cpmks')
                ->where('user_id', $userId)
                ->where('module_id', $moduleId)
                ->where('is_completed', true)
                ->count();
            $completedComponents += $completedCpmk;
        }

        // 2. Learning Objectives
        $learningObjCount = DB::table('module_learning_objectives')->where('module_id', $moduleId)->count();
        if ($learningObjCount > 0) {
            $totalComponents += $learningObjCount;
            $completedLearningObj = DB::table('user_learning_objectives')
                ->where('user_id', $userId)
                ->where('module_id', $moduleId)
                ->where('is_completed', true)
                ->count();
            $completedComponents += $completedLearningObj;
        }

        // 3. Materials
        $materialCount = DB::table('materials')->where('module_id', $moduleId)->count();
        if ($materialCount > 0) {
            $totalComponents += $materialCount;
            $completedMaterials = DB::table('user_progress')
                ->where('user_id', $userId)
                ->where('progressable_type', 'App\\Models\\Material')
                ->where('is_completed', true)
                ->whereIn('progressable_id', function($query) use ($moduleId) {
                    $query->select('id')
                          ->from('materials')
                          ->where('module_id', $moduleId);
                })
                ->count();
            $completedComponents += $completedMaterials;
        }

        // 4. Enrichments
        $enrichmentCount = DB::table('enrichments')
            ->where('module_id', $moduleId)
            ->where('is_active', 1)
            ->count();
        if ($enrichmentCount > 0) {
            $totalComponents += $enrichmentCount;
            $completedEnrichments = DB::table('user_progress')
                ->where('user_id', $userId)
                ->where('progressable_type', 'App\\Models\\Enrichment')
                ->where('is_completed', true)
                ->whereIn('progressable_id', function($query) use ($moduleId) {
                    $query->select('id')
                          ->from('enrichments')
                          ->where('module_id', $moduleId);
                })
                ->count();
            $completedComponents += $completedEnrichments;
        }

        // 5. Quizzes
        $quizCount = DB::table('quizzes')->where('module_id', $moduleId)->count();
        if ($quizCount > 0) {
            $totalComponents += $quizCount;
            $completedQuizzes = DB::table('quiz_attempts')
            ->where('user_id', $userId)
            ->whereNotNull('completed_at') // ✅ ganti dari 'completed' ke 'completed_at'
            ->whereIn('quiz_id', function($query) use ($moduleId) {
                $query->select('id')
                    ->from('quizzes')
                    ->where('module_id', $moduleId);
            })
            ->distinct('quiz_id')
            ->count();
            $completedComponents += $completedQuizzes;
        }

        // 6. Assignments
        $assignmentCount = DB::table('assignments')->where('module_id', $moduleId)->count();
        if ($assignmentCount > 0) {
            $totalComponents += $assignmentCount;
            $completedAssignments = DB::table('assignment_submissions')
                ->where('user_id', $userId)
                ->whereNotNull('submitted_at')
                ->whereIn('assignment_id', function($query) use ($moduleId) {
                    $query->select('id')
                          ->from('assignments')
                          ->where('module_id', $moduleId);
                })
                ->count();
            $completedComponents += $completedAssignments;
        }

        $percentage = $totalComponents > 0
            ? round(($completedComponents / $totalComponents) * 100)
            : 0;

        return [
            'percentage' => $percentage,
            'completed' => $completedComponents,
            'total' => $totalComponents,
        ];
    }

    /**
     * Get count of fully completed modules
     */
    private function getCompletedModulesCount($userId)
    {
        $modules = Module::all();
        $completedCount = 0;

        foreach ($modules as $module) {
            $progress = $this->calculateModuleProgress($userId, $module->id);
            if ($progress['percentage'] >= 100) {
                $completedCount++;
            }
        }

        return $completedCount;
    }

    /**
     * Get user rank based on points
     */
    private function getUserRank($userId)
    {
        $users = User::where('role', 'student')
            ->orderBy('points', 'desc')
            ->pluck('id')
            ->toArray();

        $rank = array_search($userId, $users);
        return $rank !== false ? $rank + 1 : null;
    }

    /**
     * Get module color based on order number
     */
    private function getModuleColor($orderNumber)
    {
        $colors = [
            1 => 'bg-blue-500',
            2 => 'bg-green-500',
            3 => 'bg-purple-500',
            4 => 'bg-orange-500',
            5 => 'bg-red-500',
            6 => 'bg-indigo-500',
            7 => 'bg-teal-500',
            8 => 'bg-yellow-500',
        ];

        return $colors[$orderNumber] ?? 'bg-gray-500';
    }
}
