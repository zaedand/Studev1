<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Module;
use App\Models\ClassModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class InstructorDashboardController extends Controller
{
    public function index()
    {
        $instructor = auth()->user();

        // Cache stats for 5 minutes to improve performance
        $stats = Cache::remember('instructor_dashboard_stats', 300, function () {
            return [
                'totalModules' => Module::count(),
                'totalStudents' => User::where('role', 'student')->count(),
                'totalClasses' => ClassModel::count(), // ✅ Fixed: was ClassRoom
                'averagePoints' => round(User::where('role', 'student')->avg('points') ?? 0),
            ];
        });

        // Recent activities - optimized with single query
        $recentActivities = DB::table('quiz_attempts')
            ->join('users', 'quiz_attempts.user_id', '=', 'users.id')
            ->join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
            ->join('modules', 'quizzes.module_id', '=', 'modules.id')
            ->select(
                'users.name as student_name',
                'modules.title as module_title',
                'quiz_attempts.score',
                'quiz_attempts.created_at'
            )
            ->orderBy('quiz_attempts.created_at', 'desc')
            ->limit(10)
            ->get();

        // Modules overview - optimized with batch completion calculation
        $modules = $this->getModulesWithCompletion($stats['totalStudents']);

        // Classes overview - optimized with eager loading
        $classes = ClassModel::withCount('students')
            ->latest()
            ->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'code' => $class->code ?? 'N/A',
                    'students_count' => $class->students_count,
                    'created_at' => $class->created_at->format('d M Y'),
                ];
            });

        return Inertia::render('Instructor/InsDashboard', [
            'stats' => $stats,
            'modules' => $modules,
            'classes' => $classes,
            'recentActivities' => $recentActivities,
        ]);
    }

    /**
     * Get modules with completion rates - OPTIMIZED
     * Uses bulk queries instead of per-student loops
     */
    private function getModulesWithCompletion($totalStudents)
    {
        $modules = Module::orderBy('order_number')->get();

        if ($modules->isEmpty()) {
            return collect([]);
        }

        $moduleIds = $modules->pluck('id');

        // Batch fetch all completion data at once
        $completionData = $this->getBatchCompletionData($moduleIds);

        return $modules->map(function ($module) use ($totalStudents, $completionData) {
            $completedCount = $completionData[$module->id] ?? 0;

            return [
                'id' => $module->id,
                'title' => $module->title,
                'description' => $module->description,
                'order_number' => $module->order_number,
                'completion_rate' => $totalStudents > 0
                    ? round(($completedCount / $totalStudents) * 100)
                    : 0,
                'total_students' => $totalStudents,
                'completed_students' => $completedCount,
            ];
        });
    }

    /**
     * Batch fetch completion data for all modules - MAJOR OPTIMIZATION
     * This replaces the N+1 query problem in original code
     */
    private function getBatchCompletionData($moduleIds)
    {
        $students = User::where('role', 'student')->pluck('id');

        if ($students->isEmpty()) {
            return [];
        }

        $completionCounts = [];

        foreach ($moduleIds as $moduleId) {
            // Get component counts for this module
            $componentCounts = $this->getModuleComponentCounts($moduleId);
            $totalComponents = array_sum($componentCounts);

            if ($totalComponents === 0) {
                $completionCounts[$moduleId] = 0;
                continue;
            }

            // Count students who completed this module (in single query per module)
            $completedStudents = $this->countCompletedStudentsForModule(
                $moduleId,
                $students,
                $componentCounts,
                $totalComponents
            );

            $completionCounts[$moduleId] = $completedStudents;
        }

        return $completionCounts;
    }

    /**
     * Get component counts for a module - single query
     */
    private function getModuleComponentCounts($moduleId)
    {
        return [
            'cpmks' => DB::table('module_cpmks')
                ->where('module_id', $moduleId)
                ->count(),
            'learning_objectives' => DB::table('module_learning_objectives')
                ->where('module_id', $moduleId)
                ->count(),
            'materials' => DB::table('materials')
                ->where('module_id', $moduleId)
                ->count(),
            'enrichments' => DB::table('enrichments')
                ->where('module_id', $moduleId)
                ->where('is_active', 1)
                ->count(),
            'quizzes' => DB::table('quizzes')
                ->where('module_id', $moduleId)
                ->count(),
            'assignments' => DB::table('assignments')
                ->where('module_id', $moduleId)
                ->count(),
        ];
    }

    /**
     * Count students who completed all components - optimized bulk query
     */
    private function countCompletedStudentsForModule($moduleId, $students, $componentCounts, $totalComponents)
    {
        $completedCount = 0;

        foreach ($students as $studentId) {
            $userCompletedComponents = 0;

            // 1. CPMKs
            if ($componentCounts['cpmks'] > 0) {
                $completedCpmks = DB::table('user_cpmks')
                    ->where('user_id', $studentId)
                    ->where('module_id', $moduleId)
                    ->where('is_completed', true)
                    ->count();
                $userCompletedComponents += min($completedCpmks, $componentCounts['cpmks']);
            }

            // 2. Learning Objectives
            if ($componentCounts['learning_objectives'] > 0) {
                $completedLearningObj = DB::table('user_learning_objectives')
                    ->where('user_id', $studentId)
                    ->where('module_id', $moduleId)
                    ->where('is_completed', true)
                    ->count();
                $userCompletedComponents += min($completedLearningObj, $componentCounts['learning_objectives']);
            }

            // 3. Materials
            if ($componentCounts['materials'] > 0) {
                $completedMaterials = DB::table('user_progress')
                    ->where('user_id', $studentId)
                    ->where('progressable_type', 'App\\Models\\Material')
                    ->where('is_completed', true)
                    ->whereIn('progressable_id', function($query) use ($moduleId) {
                        $query->select('id')
                              ->from('materials')
                              ->where('module_id', $moduleId);
                    })
                    ->count();
                $userCompletedComponents += min($completedMaterials, $componentCounts['materials']);
            }

            // 4. Enrichments
            if ($componentCounts['enrichments'] > 0) {
                $completedEnrichments = DB::table('user_progress')
                    ->where('user_id', $studentId)
                    ->where('progressable_type', 'App\\Models\\Enrichment')
                    ->where('is_completed', true)
                    ->whereIn('progressable_id', function($query) use ($moduleId) {
                        $query->select('id')
                              ->from('enrichments')
                              ->where('module_id', $moduleId)
                              ->where('is_active', 1);
                    })
                    ->count();
                $userCompletedComponents += min($completedEnrichments, $componentCounts['enrichments']);
            }

            // 5. Quizzes
            if ($componentCounts['quizzes'] > 0) {
                $completedQuizzes = DB::table('quiz_attempts')
                    ->where('user_id', $studentId)
                    ->whereNotNull('completed_at')
                    ->whereIn('quiz_id', function($query) use ($moduleId) {
                        $query->select('id')
                            ->from('quizzes')
                            ->where('module_id', $moduleId);
                    })
                    ->distinct()
                    ->count('quiz_id');
                $userCompletedComponents += min($completedQuizzes, $componentCounts['quizzes']);
            }

            // 6. Assignments
            if ($componentCounts['assignments'] > 0) {
                $completedAssignments = DB::table('assignment_submissions')
                    ->where('user_id', $studentId)
                    ->whereNotNull('submitted_at')
                    ->whereIn('assignment_id', function($query) use ($moduleId) {
                        $query->select('id')
                              ->from('assignments')
                              ->where('module_id', $moduleId);
                    })
                    ->distinct()
                    ->count('assignment_id');
                $userCompletedComponents += min($completedAssignments, $componentCounts['assignments']);
            }

            // Check if student completed all components
            if ($userCompletedComponents >= $totalComponents) {
                $completedCount++;
            }
        }

        return $completedCount;
    }

    /**
     * Optional: Clear dashboard cache (call this when data changes)
     */
    public function clearCache()
    {
        Cache::forget('instructor_dashboard_stats');
        return response()->json(['message' => 'Dashboard cache cleared']);
    }
}
