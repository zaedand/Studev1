<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Module;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    // Constants for unlock requirements
    private const POINTS_PER_MODULE = 200;
    private const FIRST_MODULE_ORDER = 1;

    public function index()
{
    $user = auth()->user();

    // Redirect role
    if ($user->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }

    if ($user->role === 'instructor') {
        return redirect()->route('instructor.dashboard');
    }

    // =========================
    // STUDENT DASHBOARD
    // =========================

    // Get active class
    $classStudent = $user->classes()
        ->where('is_active', true)
        ->first();

    // Get user stats
    $userStats = $this->getUserStats($user);

    // Get modules
    $modules = Module::orderBy('order_number')
        ->get()
        ->map(function ($module) use ($user, $userStats) {

            $progress = $this->calculateModuleProgress($user->id, $module->id);

            $unlockStatus = $this->checkModuleUnlock(
                $module->order_number,
                $user->id,
                $user->points,
                $userStats['completedModulesCount']
            );

            return [
                'id' => $module->id,
                'title' => $module->title,
                'description' => $module->description,
                'progress' => $progress['percentage'],
                'totalLessons' => $progress['total'],
                'completedLessons' => $progress['completed'],
                'color' => $this->getModuleColor($module->order_number),
                'icon' => 'BookOpen',
                'order_number' => $module->order_number,

                'is_locked' => $unlockStatus['is_locked'],
                'unlock_message' => $unlockStatus['unlock_message'],
                'points_needed' => $unlockStatus['points_needed'],
                'modules_needed' => $unlockStatus['modules_needed'],
            ];
        });

    return Inertia::render('dashboard', [
        'modules' => $modules,
        'userStats' => $userStats,
        'class_student' => $classStudent ? [
            'id' => $classStudent->id,
            'name' => $classStudent->name,
            'description' => $classStudent->description,
            'is_active' => $classStudent->is_active,
        ] : null,
    ]);
}

    /**
     * Check if module is unlocked based on previous modules completion or points
     */
    private function checkModuleUnlock(int $moduleOrder, int $userId, int $userPoints, int $completedModulesCount): array
    {
        // Module 1 is always unlocked
        if ($moduleOrder === self::FIRST_MODULE_ORDER) {
            return [
                'is_locked' => false,
                'unlock_message' => null,
                'points_needed' => 0,
                'modules_needed' => 0,
            ];
        }

        // Calculate requirements
        $requiredPoints = $moduleOrder * self::POINTS_PER_MODULE;
        $requiredCompletedModules = $moduleOrder - 1;

        // Check if unlocked by completed modules OR points
        $unlockedByModules = $completedModulesCount >= $requiredCompletedModules;
        $unlockedByPoints = $userPoints >= $requiredPoints;

        $isLocked = !($unlockedByModules || $unlockedByPoints);

        // Generate unlock message
        $unlockMessage = null;
        $pointsNeeded = 0;
        $modulesNeeded = 0;

        if ($isLocked) {
            $pointsShortage = max(0, $requiredPoints - $userPoints);
            $modulesShortage = max(0, $requiredCompletedModules - $completedModulesCount);

            $pointsNeeded = $pointsShortage;
            $modulesNeeded = $modulesShortage;

            if ($modulesShortage > 0 && $pointsShortage > 0) {
                $unlockMessage = "Selesaikan {$modulesShortage} modul lagi atau kumpulkan {$pointsShortage} poin lagi untuk membuka modul ini";
            } elseif ($modulesShortage > 0) {
                $unlockMessage = "Selesaikan {$modulesShortage} modul lagi untuk membuka modul ini";
            } else {
                $unlockMessage = "Kumpulkan {$pointsShortage} poin lagi untuk membuka modul ini";
            }
        }

        return [
            'is_locked' => $isLocked,
            'unlock_message' => $unlockMessage,
            'points_needed' => $pointsNeeded,
            'modules_needed' => $modulesNeeded,
        ];
    }

    /**
     * Get user statistics
     */
    private function getUserStats($user): array
    {
        $completedModulesCount = $this->getCompletedModulesCount($user->id);
        $userRank = $this->getUserRank($user->id);
        $totalStudents = User::where('role', 'student')->count();
        $totalModules = Module::count();

        return [
            'totalPoints' => $user->points,
            'currentRank' => $userRank,
            'totalStudents' => $totalStudents,
            'completedModules' => $completedModulesCount,
            'totalModules' => $totalModules,
            'completedModulesCount' => $completedModulesCount, // untuk internal checking
        ];
    }

    /**
     * Calculate module progress for a user
     */
    private function calculateModuleProgress(int $userId, int $moduleId): array
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
        $materialIds = DB::table('materials')->where('module_id', $moduleId)->pluck('id');
        if ($materialIds->isNotEmpty()) {
            $totalComponents += $materialIds->count();
            $completedMaterials = DB::table('user_progress')
                ->where('user_id', $userId)
                ->where('progressable_type', 'App\\Models\\Material')
                ->where('is_completed', true)
                ->whereIn('progressable_id', $materialIds)
                ->count();
            $completedComponents += $completedMaterials;
        }

        // 4. Enrichments
        $enrichmentIds = DB::table('enrichments')
            ->where('module_id', $moduleId)
            ->where('is_active', 1)
            ->pluck('id');
        if ($enrichmentIds->isNotEmpty()) {
            $totalComponents += $enrichmentIds->count();
            $completedEnrichments = DB::table('user_progress')
                ->where('user_id', $userId)
                ->where('progressable_type', 'App\\Models\\Enrichment')
                ->where('is_completed', true)
                ->whereIn('progressable_id', $enrichmentIds)
                ->count();
            $completedComponents += $completedEnrichments;
        }

        // 5. Quizzes
        $quizIds = DB::table('quizzes')->where('module_id', $moduleId)->pluck('id');
        if ($quizIds->isNotEmpty()) {
            $totalComponents += $quizIds->count();
            $completedQuizzes = DB::table('quiz_attempts')
                ->where('user_id', $userId)
                ->whereNotNull('completed_at')
                ->whereIn('quiz_id', $quizIds)
                ->distinct('quiz_id')
                ->count();
            $completedComponents += $completedQuizzes;
        }

        // 6. Assignments
        $assignmentIds = DB::table('assignments')->where('module_id', $moduleId)->pluck('id');
        if ($assignmentIds->isNotEmpty()) {
            $totalComponents += $assignmentIds->count();
            $completedAssignments = DB::table('assignment_submissions')
                ->where('user_id', $userId)
                ->whereNotNull('submitted_at')
                ->whereIn('assignment_id', $assignmentIds)
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
    private function getCompletedModulesCount(int $userId): int
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
    private function getUserRank(int $userId): int
    {
        $users = User::where('role', 'student')
            ->orderBy('points', 'desc')
            ->pluck('id')
            ->toArray();

        $rank = array_search($userId, $users);
        return $rank !== false ? $rank + 1 : 1;
    }

    /**
     * Get module color based on order number
     */
    private function getModuleColor(int $orderNumber): string
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
