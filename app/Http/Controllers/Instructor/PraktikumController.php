<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\AssignmentClassDeadline;
use App\Models\Module;
use App\Models\ClassModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PraktikumController extends Controller
{
    /**
     * Display praktikum management page
     */
    public function index()
    {
        $assignments = Assignment::with(['module', 'submissions.user', 'classDeadlines.classModel'])
            ->withCount('submissions')
            ->latest()
            ->get()
            ->map(function ($assignment) {
                $submissions = $assignment->submissions;
                $gradedSubmissions = $submissions->where('score', '!=', null);

                // Map class deadlines
                $classDeadlines = $assignment->classDeadlines->map(function ($cd) {
                    return [
                        'classId' => $cd->class_id,
                        'className' => $cd->classModel->name ?? 'Unknown',
                        'deadline' => $cd->deadline->format('Y-m-d\TH:i'),
                    ];
                });

                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'moduleId' => $assignment->module_id,
                    'moduleName' => $assignment->module->title ?? 'Unknown Module',
                    'description' => $assignment->description,
                    'deadline' => $assignment->deadline ? $assignment->deadline->format('Y-m-d\TH:i') : null,
                    'classDeadlines' => $classDeadlines,
                    'maxScore' => 100,
                    'submissions' => $submissions->count(),
                    'totalStudents' => \App\Models\User::where('role', 'student')->count(),
                    'averageScore' => $gradedSubmissions->count() > 0
                        ? round($gradedSubmissions->avg('score'), 1)
                        : 0,
                    'status' => $assignment->is_active ? 'active' : 'draft',
                    'createdAt' => $assignment->created_at->format('Y-m-d'),
                    'pointRewardEarly' => $assignment->point_reward_early ?? 10,
                    'pointRewardOntime' => $assignment->point_reward_ontime ?? 5,
                    'pointRewardLate' => $assignment->point_reward_late ?? 2,
                ];
            });

        $modules = Module::select('id', 'title', 'order_number as order')->orderBy('order_number')->get();

        // Get all active classes for the instructor
        $classes = ClassModel::select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Instructor/praktikum', [
            'assignments' => $assignments,
            'modules' => $modules,
            'classes' => $classes,
        ]);
    }

    /**
     * Store new assignment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'module_id' => 'required|exists:modules,id',
            'description' => 'required|string',
            'instructions' => 'nullable|string',
            'deadline' => 'nullable|date|after:now', // Made optional since we use class deadlines
            'class_deadlines' => 'required|array|min:1',
            'class_deadlines.*.class_id' => 'required|exists:classes,id',
            'class_deadlines.*.deadline' => 'required|date|after:now',
            'max_score' => 'required|integer|min:1|max:200',
            'point_reward_early' => 'required|integer|min:0|max:200',
            'point_reward_ontime' => 'required|integer|min:0|max:200',
            'point_reward_late' => 'required|integer|min:0|max:200',
            'is_active' => 'boolean',
        ]);

        $assignment = Assignment::create([
            'module_id' => $validated['module_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'deadline' => $validated['deadline'] ?? null,
            'point_reward_early' => $validated['point_reward_early'],
            'point_reward_ontime' => $validated['point_reward_ontime'],
            'point_reward_late' => $validated['point_reward_late'],
            'is_active' => $validated['is_active'] ?? false,
        ]);

        // Create class-specific deadlines
        foreach ($validated['class_deadlines'] as $classDeadline) {
            if (!empty($classDeadline['deadline'])) {
                AssignmentClassDeadline::create([
                    'assignment_id' => $assignment->id,
                    'class_id' => $classDeadline['class_id'],
                    'deadline' => $classDeadline['deadline'],
                ]);
            }
        }

        return redirect()->back()->with('success', 'Praktikum berhasil dibuat!');
    }

    /**
     * Update assignment
     */
    public function update(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'module_id' => 'required|exists:modules,id',
            'description' => 'required|string',
            'instructions' => 'nullable|string',
            'deadline' => 'nullable|date',
            'class_deadlines' => 'required|array|min:1',
            'class_deadlines.*.class_id' => 'required|exists:classes,id',
            'class_deadlines.*.deadline' => 'required|date',
            'max_score' => 'required|integer|min:1|max:200',
            'point_reward_early' => 'required|integer|min:0|max:200',
            'point_reward_ontime' => 'required|integer|min:0|max:200',
            'point_reward_late' => 'required|integer|min:0|max:200',
            'is_active' => 'boolean',
        ]);

        $assignment->update([
            'module_id' => $validated['module_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'deadline' => $validated['deadline'] ?? null,
            'point_reward_early' => $validated['point_reward_early'],
            'point_reward_ontime' => $validated['point_reward_ontime'],
            'point_reward_late' => $validated['point_reward_late'],
            'is_active' => $validated['is_active'] ?? $assignment->is_active,
        ]);

        // Update class deadlines
        // Delete existing deadlines
        $assignment->classDeadlines()->delete();

        // Create new deadlines
        foreach ($validated['class_deadlines'] as $classDeadline) {
            if (!empty($classDeadline['deadline'])) {
                AssignmentClassDeadline::create([
                    'assignment_id' => $assignment->id,
                    'class_id' => $classDeadline['class_id'],
                    'deadline' => $classDeadline['deadline'],
                ]);
            }
        }

        return redirect()->back()->with('success', 'Praktikum berhasil diperbarui!');
    }

    /**
     * Delete assignment
     */
    public function destroy($id)
    {
        $assignment = Assignment::findOrFail($id);
        $disk = Storage::disk('public');

        // Delete all submission files
        foreach ($assignment->submissions as $submission) {
            if ($disk->exists($submission->file_path)) {
                $disk->delete($submission->file_path);
            }
        }

        // Delete class deadlines (cascade if not set in migration)
        $assignment->classDeadlines()->delete();

        $assignment->delete();

        return redirect()->back()->with('success', 'Praktikum berhasil dihapus!');
    }

    /**
     * Get submissions data
     */
    public function submissions(Request $request)
    {
        $query = AssignmentSubmission::with(['user', 'assignment.module'])
            ->latest('submitted_at');

        // Filter by assignment if specified
        if ($request->has('assignment_id')) {
            $query->where('assignment_id', $request->assignment_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'graded') {
                $query->whereNotNull('score');
            } elseif ($request->status === 'ungraded') {
                $query->whereNull('score');
            }
        }

        $submissions = $query->get()->map(function ($submission) {
            // Get deadline for the student's class
            $deadline = $submission->assignment->getDeadlineForStudent($submission->user_id);
            $submittedAt = $submission->submitted_at;
            $isLate = $submittedAt > $deadline;
            $daysDiff = $deadline->diffInDays($submittedAt);

            // Use public disk for file operations
            $disk = Storage::disk('public');
            $fileExists = $disk->exists($submission->file_path);

            return [
                'id' => $submission->id,
                'assignmentId' => $submission->assignment_id,
                'assignmentTitle' => $submission->assignment->title,
                'studentId' => $submission->user_id,
                'studentName' => $submission->user->name,
                'nim' => $submission->user->nim ?? 'N/A',
                'fileName' => $submission->file_name ?? basename($submission->file_path),
                'fileSize' => $fileExists ? $this->formatFileSize($disk->size($submission->file_path)) : 'File tidak ditemukan',
                'submittedAt' => $submittedAt,
                'status' => $submission->score !== null ? 'graded' : 'submitted',
                'score' => $submission->score,
                'feedback' => $submission->feedback ?? '',
                'isLate' => $isLate,
                'daysLate' => $isLate ? $daysDiff : 0,
                'daysEarly' => !$isLate ? $daysDiff : 0,
            ];
        });

        return response()->json($submissions);
    }

    /**
     * Grade submission - Manual grading by instructor
     */
    public function gradeSubmission(Request $request, $submissionId)
    {
        $submission = AssignmentSubmission::findOrFail($submissionId);

        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:200',
            'feedback' => 'nullable|string',
        ]);

        // Simply update score and feedback
        // No auto-calculation, instructor decides everything
        $submission->update([
            'score' => $validated['score'],
            'feedback' => $validated['feedback'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Nilai berhasil disimpan!');
    }

    /**
     * Preview submission file
     */
    public function previewSubmission($submissionId)
    {
        $submission = AssignmentSubmission::findOrFail($submissionId);
        $disk = Storage::disk('public');
        $filePath = $submission->file_path;

        if (!$disk->exists($filePath)) {
            abort(404, 'File tidak ditemukan');
        }

        return response()->file($disk->path($filePath));
    }

    /**
     * Download submission file
     */
    public function downloadSubmission($submissionId)
    {
        $submission = AssignmentSubmission::findOrFail($submissionId);
        $disk = Storage::disk('public');
        $filePath = $submission->file_path;

        if (!$filePath) {
            abort(404, 'Path file tidak ditemukan di database');
        }

        if (!$disk->exists($filePath)) {
            abort(404, 'File tidak ditemukan di storage');
        }

        $fileName = $submission->file_name ?? basename($filePath);

        return $disk->download($filePath, $fileName);
    }

    /**
     * Get analytics data
     */
    public function analytics()
    {
        $totalAssignments = Assignment::count();
        $totalSubmissions = AssignmentSubmission::count();
        $gradedSubmissions = AssignmentSubmission::whereNotNull('score')->get();

        // Count late submissions using class-specific deadlines
        $lateSubmissions = AssignmentSubmission::whereHas('assignment', function($query) {
            // This is simplified - you may need to adjust based on actual class logic
            $query->whereRaw('assignment_submissions.submitted_at > assignments.deadline');
        })->count();

        $averageScore = $gradedSubmissions->count() > 0
            ? round($gradedSubmissions->avg('score'), 1)
            : 0;

        return response()->json([
            'totalAssignments' => $totalAssignments,
            'totalSubmissions' => $totalSubmissions,
            'averageScore' => $averageScore,
            'lateSubmissions' => $lateSubmissions,
        ]);
    }

    /**
     * Helper: Format file size
     */
    private function formatFileSize($bytes)
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
}
