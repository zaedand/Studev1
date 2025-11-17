<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ModuleCpmk;
use App\Models\ModuleLearningObjective;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ModuleController extends Controller
{
    /**
     * Display a listing of modules
     */
    public function index()
    {
        $modules = Module::withCount([
            'materials',
            'enrichments',
            'quizzes',
            'assignments',
            'cpmks',
            'learningObjectives'
        ])
        ->ordered()
        ->get()
        ->map(function ($module) {
            $totalStudents = \App\Models\User::where('role', 'student')->count();
            $completedCount = $this->getModuleCompletionCount($module->id);

            return [
                'id' => $module->id,
                'title' => $module->title,
                'description' => $module->description,
                'order_number' => $module->order_number,
                'cp_atp' => $module->cp_atp,
                'is_active' => $module->is_active,
                'cpmks_count' => $module->cpmks_count,
                'learning_objectives_count' => $module->learning_objectives_count,
                'materials_count' => $module->materials_count,
                'enrichments_count' => $module->enrichments_count,
                'quizzes_count' => $module->quizzes_count,
                'assignments_count' => $module->assignments_count,
                'completion_rate' => $totalStudents > 0
                    ? round(($completedCount / $totalStudents) * 100)
                    : 0,
                'total_students' => $totalStudents,
                'completed_students' => $completedCount,
            ];
        });

        return Inertia::render('Instructor/Modules/Index', [
            'modules' => $modules,
        ]);
    }

    /**
     * Show module details with all components
     */
    public function show($id)
    {
        $module = Module::with([
            'materials',
            'enrichments' => function($query) {
                $query->where('is_active', true);
            },
            'quizzes',
            'assignments',
            'cpmks',
            'learningObjectives'
        ])->findOrFail($id);

        // Calculate statistics
        $totalStudents = \App\Models\User::where('role', 'student')->count();
        $completedCount = $this->getModuleCompletionCount($id);

        // Get student progress summary
        $studentProgress = $this->getStudentProgressSummary($id);

        return Inertia::render('Instructor/Modules/Detail', [
            'module' => [
                'id' => $module->id,
                'title' => $module->title,
                'description' => $module->description,
                'order_number' => $module->order_number,
                'cp_atp' => $module->cp_atp,
                'is_active' => $module->is_active,
                'created_at' => $module->created_at->format('d M Y'),
                'updated_at' => $module->updated_at->format('d M Y'),
            ],
            'cpmks' => $module->cpmks->map(function($cpmk) {
                return [
                    'id' => $cpmk->id,
                    'content' => $cpmk->content,
                    'point_reward' => $cpmk->point_reward,
                ];
            }),
            'learningObjectives' => $module->learningObjectives->map(function($obj) {
                return [
                    'id' => $obj->id,
                    'content' => $obj->content,
                    'point_reward' => $obj->point_reward,
                ];
            }),
            'materials' => $module->materials,
            'enrichments' => $module->enrichments,
            'quizzes' => $module->quizzes,
            'assignments' => $module->assignments,
            'statistics' => [
                'total_students' => $totalStudents,
                'completed_students' => $completedCount,
                'completion_rate' => $totalStudents > 0
                    ? round(($completedCount / $totalStudents) * 100)
                    : 0,
                'total_components' => $module->cpmks->count() +
                    $module->learningObjectives->count() +
                    $module->materials->count() +
                    $module->enrichments->count() +
                    $module->quizzes->count() +
                    $module->assignments->count(),
            ],
            'studentProgress' => $studentProgress,
        ]);
    }

    /**
     * Show the form for creating a new module
     */
    public function create()
    {
        // Get next order number
        $nextOrderNumber = Module::max('order_number') + 1;

        return Inertia::render('Instructor/Modules/Form', [
            'nextOrderNumber' => $nextOrderNumber,
        ]);
    }

    /**
     * Store a newly created module
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'order_number' => 'required|integer|min:1|unique:modules,order_number',
            'cp_atp' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $module = Module::create($validated);

        return redirect()
            ->route('instructor.modules.show', $module->id)
            ->with('success', 'Module created successfully!');
    }

    /**
     * Show the form for editing module
     */
    public function edit($id)
    {
        $module = Module::findOrFail($id);

        return Inertia::render('Instructor/Modules/Form', [
            'module' => $module,
        ]);
    }

    /**
     * Update the specified module
     */
    public function update(Request $request, $id)
    {
        $module = Module::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'order_number' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('modules')->ignore($module->id),
            ],
            'cp_atp' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $module->update($validated);

        return redirect()
            ->route('instructor.modules.show', $module->id)
            ->with('success', 'Module updated successfully!');
    }

    /**
     * Remove the specified module
     */
    public function destroy($id)
    {
        $module = Module::findOrFail($id);

        // Check if module has related data
        $hasRelatedData = $module->materials()->exists() ||
                         $module->enrichments()->exists() ||
                         $module->quizzes()->exists() ||
                         $module->assignments()->exists() ||
                         $module->cpmks()->exists() ||
                         $module->learningObjectives()->exists();

        if ($hasRelatedData) {
            return back()->with('error', 'Cannot delete module with existing content. Please delete all related content first.');
        }

        $module->delete();

        return redirect()
            ->route('instructor.modules.index')
            ->with('success', 'Module deleted successfully!');
    }

    /**
     * Toggle module active status
     */
    public function toggleActive($id)
    {
        $module = Module::findOrFail($id);
        $module->update(['is_active' => !$module->is_active]);

        return back()->with('success', 'Module status updated successfully!');
    }

    /**
     * Reorder modules
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'modules' => 'required|array',
            'modules.*.id' => 'required|exists:modules,id',
            'modules.*.order_number' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['modules'] as $moduleData) {
                Module::where('id', $moduleData['id'])
                    ->update(['order_number' => $moduleData['order_number']]);
            }
        });

        return back()->with('success', 'Modules reordered successfully!');
    }

    // Helper methods
    private function getModuleCompletionCount($moduleId)
    {
        $students = \App\Models\User::where('role', 'student')->pluck('id');
        $completedCount = 0;

        $componentCounts = $this->getModuleComponentCounts($moduleId);
        $totalComponents = array_sum($componentCounts);

        if ($totalComponents === 0) {
            return 0;
        }

        foreach ($students as $studentId) {
            $userCompletedComponents = 0;

            // Count completed components for each type
            if ($componentCounts['cpmks'] > 0) {
                $completed = DB::table('user_cpmks')
                    ->where('user_id', $studentId)
                    ->whereIn('module_cpmk_id', function($query) use ($moduleId) {
                        $query->select('id')->from('module_cpmks')->where('module_id', $moduleId);
                    })
                    ->where('is_completed', true)
                    ->count();
                $userCompletedComponents += min($completed, $componentCounts['cpmks']);
            }

            if ($componentCounts['learning_objectives'] > 0) {
                $completed = DB::table('user_learning_objectives')
                    ->where('user_id', $studentId)
                    ->whereIn('module_learning_objective_id', function($query) use ($moduleId) {
                        $query->select('id')->from('module_learning_objectives')->where('module_id', $moduleId);
                    })
                    ->where('is_completed', true)
                    ->count();
                $userCompletedComponents += min($completed, $componentCounts['learning_objectives']);
            }

            if ($componentCounts['materials'] > 0) {
                $completed = DB::table('user_progress')
                    ->where('user_id', $studentId)
                    ->where('progressable_type', 'App\\Models\\Material')
                    ->where('is_completed', true)
                    ->whereIn('progressable_id', function($query) use ($moduleId) {
                        $query->select('id')->from('materials')->where('module_id', $moduleId);
                    })
                    ->count();
                $userCompletedComponents += min($completed, $componentCounts['materials']);
            }

            if ($componentCounts['enrichments'] > 0) {
                $completed = DB::table('user_progress')
                    ->where('user_id', $studentId)
                    ->where('progressable_type', 'App\\Models\\Enrichment')
                    ->where('is_completed', true)
                    ->whereIn('progressable_id', function($query) use ($moduleId) {
                        $query->select('id')->from('enrichments')
                            ->where('module_id', $moduleId)
                            ->where('is_active', 1);
                    })
                    ->count();
                $userCompletedComponents += min($completed, $componentCounts['enrichments']);
            }

            if ($componentCounts['quizzes'] > 0) {
                $completed = DB::table('quiz_attempts')
                    ->where('user_id', $studentId)
                    ->whereNotNull('completed_at')
                    ->whereIn('quiz_id', function($query) use ($moduleId) {
                        $query->select('id')->from('quizzes')->where('module_id', $moduleId);
                    })
                    ->distinct()
                    ->count('quiz_id');
                $userCompletedComponents += min($completed, $componentCounts['quizzes']);
            }

            if ($componentCounts['assignments'] > 0) {
                $completed = DB::table('assignment_submissions')
                    ->where('user_id', $studentId)
                    ->whereNotNull('submitted_at')
                    ->whereIn('assignment_id', function($query) use ($moduleId) {
                        $query->select('id')->from('assignments')->where('module_id', $moduleId);
                    })
                    ->distinct()
                    ->count('assignment_id');
                $userCompletedComponents += min($completed, $componentCounts['assignments']);
            }

            if ($userCompletedComponents >= $totalComponents) {
                $completedCount++;
            }
        }

        return $completedCount;
    }

    private function getModuleComponentCounts($moduleId)
    {
        return [
            'cpmks' => DB::table('module_cpmks')->where('module_id', $moduleId)->count(),
            'learning_objectives' => DB::table('module_learning_objectives')->where('module_id', $moduleId)->count(),
            'materials' => DB::table('materials')->where('module_id', $moduleId)->count(),
            'enrichments' => DB::table('enrichments')->where('module_id', $moduleId)->where('is_active', 1)->count(),
            'quizzes' => DB::table('quizzes')->where('module_id', $moduleId)->count(),
            'assignments' => DB::table('assignments')->where('module_id', $moduleId)->count(),
        ];
    }

    private function getStudentProgressSummary($moduleId)
    {
        $students = \App\Models\User::where('role', 'student')->take(10)->get();
        $componentCounts = $this->getModuleComponentCounts($moduleId);
        $totalComponents = array_sum($componentCounts);

        return $students->map(function ($student) use ($moduleId, $componentCounts, $totalComponents) {
            if ($totalComponents === 0) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'progress_percentage' => 0,
                ];
            }

            $completedComponents = 0;

            // CPMKs
            if ($componentCounts['cpmks'] > 0) {
                $completed = DB::table('user_cpmks')
                    ->where('user_id', $student->id)
                    ->whereIn('module_cpmk_id', function($query) use ($moduleId) {
                        $query->select('id')->from('module_cpmks')->where('module_id', $moduleId);
                    })
                    ->where('is_completed', true)
                    ->count();
                $completedComponents += min($completed, $componentCounts['cpmks']);
            }

            // Learning Objectives
            if ($componentCounts['learning_objectives'] > 0) {
                $completed = DB::table('user_learning_objectives')
                    ->where('user_id', $student->id)
                    ->whereIn('module_learning_objective_id', function($query) use ($moduleId) {
                        $query->select('id')->from('module_learning_objectives')->where('module_id', $moduleId);
                    })
                    ->where('is_completed', true)
                    ->count();
                $completedComponents += min($completed, $componentCounts['learning_objectives']);
            }

            // Materials
            if ($componentCounts['materials'] > 0) {
                $completed = DB::table('user_progress')
                    ->where('user_id', $student->id)
                    ->where('progressable_type', 'App\\Models\\Material')
                    ->where('is_completed', true)
                    ->whereIn('progressable_id', function($query) use ($moduleId) {
                        $query->select('id')->from('materials')->where('module_id', $moduleId);
                    })
                    ->count();
                $completedComponents += min($completed, $componentCounts['materials']);
            }

            // Enrichments
            if ($componentCounts['enrichments'] > 0) {
                $completed = DB::table('user_progress')
                    ->where('user_id', $student->id)
                    ->where('progressable_type', 'App\\Models\\Enrichment')
                    ->where('is_completed', true)
                    ->whereIn('progressable_id', function($query) use ($moduleId) {
                        $query->select('id')->from('enrichments')
                            ->where('module_id', $moduleId)
                            ->where('is_active', 1);
                    })
                    ->count();
                $completedComponents += min($completed, $componentCounts['enrichments']);
            }

            // Quizzes
            if ($componentCounts['quizzes'] > 0) {
                $completed = DB::table('quiz_attempts')
                    ->where('user_id', $student->id)
                    ->whereNotNull('completed_at')
                    ->whereIn('quiz_id', function($query) use ($moduleId) {
                        $query->select('id')->from('quizzes')->where('module_id', $moduleId);
                    })
                    ->distinct()
                    ->count('quiz_id');
                $completedComponents += min($completed, $componentCounts['quizzes']);
            }

            // Assignments
            if ($componentCounts['assignments'] > 0) {
                $completed = DB::table('assignment_submissions')
                    ->where('user_id', $student->id)
                    ->whereNotNull('submitted_at')
                    ->whereIn('assignment_id', function($query) use ($moduleId) {
                        $query->select('id')->from('assignments')->where('module_id', $moduleId);
                    })
                    ->distinct()
                    ->count('assignment_id');
                $completedComponents += min($completed, $componentCounts['assignments']);
            }

            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'progress_percentage' => round(($completedComponents / $totalComponents) * 100),
            ];
        });
    }
}
