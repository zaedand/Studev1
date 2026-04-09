<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Module;
use App\Models\ClassModel;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = auth()->user();

        // Get filter parameters
        $filterType = $request->get('filter_type', 'all'); // 'all', 'class', 'module'
        $classId = $request->get('class_id');
        $moduleId = $request->get('module_id');

        // Get students based on filter
        $studentsQuery = User::where('role', 'student')
            ->select('id', 'name', 'email', 'points', 'created_at');

        // Apply class filter if specified
        if ($filterType === 'class' && $classId) {
            $studentsQuery->whereHas('classes', function($query) use ($classId) {
                $query->where('classes.id', $classId);
            });
        }

        // Get students with their stats
        $students = $studentsQuery
            ->withCount([
                'progress as completed_modules' => function ($query) {
                    $query->where('is_completed', true)
                          ->where('progressable_type', 'App\\Models\\Module');
                }
            ])
            ->get()
            ->map(function ($student) use ($currentUser, $moduleId, $filterType) {
                // Calculate points based on filter
                $points = $this->calculatePoints($student->id, $moduleId, $filterType);

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'avatar' => $this->getInitials($student->name),
                    'points' => $points,
                    'completedModules' => $this->getCompletedModulesCount($student->id, $moduleId),
                    'totalModules' => $moduleId ? 1 : Module::count(),
                    'level' => $this->calculateLevel($points),
                    'isCurrentUser' => $student->id === $currentUser->id,
                    'joinedDate' => $student->created_at->format('M Y'),
                ];
            })
            ->sortByDesc('points')
            ->values()
            ->map(function ($student, $index) {
                $student['rank'] = $index + 1;
                return $student;
            });

        // Get available classes and modules for filters
        $classes = ClassModel::active()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $modules = Module::select('id', 'title')
            ->orderBy('order_number', 'asc')
            ->get();

        // Global stats
        $totalModules = Module::count();
        $totalStudents = $studentsQuery->count();
        $averagePoints = $students->avg('points') ?? 0;

        // Completion rate
        $totalPossibleCompletions = $totalStudents * ($moduleId ? 1 : $totalModules);
        $actualCompletions = $students->sum('completedModules');
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
                'averagePoints' => round($averagePoints),
                'completionRate' => $completionRate,
                'totalModules' => $moduleId ? 1 : $totalModules,
            ],
            'filters' => [
                'classes' => $classes,
                'modules' => $modules,
                'currentFilter' => [
                    'type' => $filterType,
                    'classId' => $classId,
                    'moduleId' => $moduleId,
                ]
            ]
        ]);
    }

    /**
     * Calculate points based on filter
     */
    private function calculatePoints($userId, $moduleId = null, $filterType = 'all')
    {
        if ($filterType === 'module' && $moduleId) {
            // Calculate points only for specific module
            return $this->getModulePoints($userId, $moduleId);
        }

        // Return total points from user table
        return User::find($userId)->points ?? 0;
    }

    /**
     * Get points for a specific module
     */
    private function getModulePoints($userId, $moduleId)
    {
        $points = 0;

        // Points from quiz attempts
        $quizPoints = DB::table('quiz_attempts')
            ->join('quizzes', 'quiz_attempts.quiz_id', '=', 'quizzes.id')
            ->where('quiz_attempts.user_id', $userId)
            ->where('quizzes.module_id', $moduleId)
            ->whereNotNull('quiz_attempts.completed_at')
            ->sum('quiz_attempts.points_earned');

        // Points from assignment submissions
        $assignmentPoints = DB::table('assignment_submissions')
            ->join('assignments', 'assignment_submissions.assignment_id', '=', 'assignments.id')
            ->where('assignment_submissions.user_id', $userId)
            ->where('assignments.module_id', $moduleId)
            ->whereNotNull('assignment_submissions.score')
            ->sum('assignment_submissions.points_earned');

        // Points from completed materials, enrichments, etc.
        $progressPoints = DB::table('user_progress')
            ->where('user_id', $userId)
            ->where(function($query) use ($moduleId) {
                // Materials
                $query->whereIn('progressable_id', function($subQuery) use ($moduleId) {
                    $subQuery->select('id')
                        ->from('materials')
                        ->where('module_id', $moduleId);
                })->where('progressable_type', 'App\\Models\\Material');
            })
            ->orWhere(function($query) use ($moduleId, $userId) {
                // Enrichments
                $query->where('user_id', $userId)
                    ->whereIn('progressable_id', function($subQuery) use ($moduleId) {
                        $subQuery->select('id')
                            ->from('enrichments')
                            ->where('module_id', $moduleId);
                    })->where('progressable_type', 'App\\Models\\Enrichment');
            })
            ->where('is_completed', true)
            ->sum('points_earned');

        return $quizPoints + $assignmentPoints + $progressPoints;
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
    private function getCompletedModulesCount($userId, $moduleId = null)
    {
        $modules = $moduleId ? Module::where('id', $moduleId)->get() : Module::all();
        $completedCount = 0;

        foreach ($modules as $module) {
            if ($this->isModuleCompleted($userId, $module->id)) {
                $completedCount++;
            }
        }

        return $completedCount;
    }

    /**
     * Check if a module is completed by user
     */
    private function isModuleCompleted($userId, $moduleId)
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
                ->whereNotNull('completed_at')
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

        return $totalComponents > 0 && $completedComponents >= $totalComponents;
    }
}
