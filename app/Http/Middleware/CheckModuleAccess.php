<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Module;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleAccess
{
    private const POINTS_PER_MODULE = 250;
    private const FIRST_MODULE_ORDER = 1;

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
{
    $user = auth()->user();

    /** @var \App\Models\Module $module */
    $module = $request->route('module'); // ✅ FIX

    if (!$module) {
        return redirect()->route('dashboard')->with([
            'flash' => [
                'error' => true,
                'message' => 'Modul tidak ditemukan'
            ]
        ]);
    }

    // Module 1 always accessible
    if ($module->order_number === self::FIRST_MODULE_ORDER) {
        return $next($request);
    }

    $requiredPoints = ($module->order_number - 1) * self::POINTS_PER_MODULE;

$canAccess =
    $module->order_number === self::FIRST_MODULE_ORDER
    || $this->getCompletedModulesCount($user->id) >= ($module->order_number - 1)
    || $user->points >= $requiredPoints;

if (!$canAccess) {
    return redirect()->route('dashboard')->with([
        'flash' => [
            'error' => true,
            'message' => 'Modul masih terkunci'
        ]
    ]);
}

    return $next($request);
}

    /**
     * Get completed modules count
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
     * Calculate module progress (simplified version)
     */
    private function calculateModuleProgress(int $userId, int $moduleId): array
    {
        $totalComponents = 0;
        $completedComponents = 0;

        // Count all components
        $cpmkCount = DB::table('module_cpmks')->where('module_id', $moduleId)->count();
        $learningObjCount = DB::table('module_learning_objectives')->where('module_id', $moduleId)->count();
        $materialCount = DB::table('materials')->where('module_id', $moduleId)->count();
        $enrichmentCount = DB::table('enrichments')->where('module_id', $moduleId)->where('is_active', 1)->count();
        $quizCount = DB::table('quizzes')->where('module_id', $moduleId)->count();
        $assignmentCount = DB::table('assignments')->where('module_id', $moduleId)->count();

        $totalComponents = $cpmkCount + $learningObjCount + $materialCount + $enrichmentCount + $quizCount + $assignmentCount;

        // Count completed
        $completedCpmk = DB::table('user_cpmks')->where('user_id', $userId)->where('module_id', $moduleId)->where('is_completed', true)->count();
        $completedLearningObj = DB::table('user_learning_objectives')->where('user_id', $userId)->where('module_id', $moduleId)->where('is_completed', true)->count();

        $materialIds = DB::table('materials')->where('module_id', $moduleId)->pluck('id');
        $completedMaterials = DB::table('user_progress')
            ->where('user_id', $userId)
            ->where('progressable_type', 'App\\Models\\Material')
            ->where('is_completed', true)
            ->whereIn('progressable_id', $materialIds)
            ->count();

        $enrichmentIds = DB::table('enrichments')->where('module_id', $moduleId)->where('is_active', 1)->pluck('id');
        $completedEnrichments = DB::table('user_progress')
            ->where('user_id', $userId)
            ->where('progressable_type', 'App\\Models\\Enrichment')
            ->where('is_completed', true)
            ->whereIn('progressable_id', $enrichmentIds)
            ->count();

        $quizIds = DB::table('quizzes')->where('module_id', $moduleId)->pluck('id');
        $completedQuizzes = DB::table('quiz_attempts')
            ->where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->whereIn('quiz_id', $quizIds)
            ->distinct('quiz_id')
            ->count();

        $assignmentIds = DB::table('assignments')->where('module_id', $moduleId)->pluck('id');
        $completedAssignments = DB::table('assignment_submissions')
            ->where('user_id', $userId)
            ->whereNotNull('submitted_at')
            ->whereIn('assignment_id', $assignmentIds)
            ->count();

        $completedComponents = $completedCpmk + $completedLearningObj + $completedMaterials +
                              $completedEnrichments + $completedQuizzes + $completedAssignments;

        $percentage = $totalComponents > 0
            ? round(($completedComponents / $totalComponents) * 100)
            : 0;

        return [
            'percentage' => $percentage,
            'completed' => $completedComponents,
            'total' => $totalComponents,
        ];
    }
}
