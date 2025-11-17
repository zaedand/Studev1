<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Module;
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
        $assignments = Assignment::with(['module', 'submissions.user'])
            ->withCount('submissions')
            ->latest()
            ->get()
            ->map(function ($assignment) {
                $submissions = $assignment->submissions;
                $gradedSubmissions = $submissions->where('score', '!=', null);

                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'moduleId' => $assignment->module_id,
                    'moduleName' => $assignment->module->title ?? 'Unknown Module',
                    'description' => $assignment->description,
                    'deadline' => $assignment->deadline,
                    'maxScore' => 100,
                    'submissions' => $submissions->count(),
                    'totalStudents' => \App\Models\User::where('role', 'student')->count(),
                    'averageScore' => $gradedSubmissions->count() > 0
                        ? round($gradedSubmissions->avg('score'), 1)
                        : 0,
                    'status' => $assignment->is_active ? 'active' : 'draft',
                    'createdAt' => $assignment->created_at->format('Y-m-d'),
                ];
            });

        $modules = Module::select('id', 'title', 'order_number')->orderBy('order_number')->get();

        return Inertia::render('Instructor/praktikum', [
            'assignments' => $assignments,
            'modules' => $modules,
        ]);
    }


    public function previewSubmission($submissionId)
    {
        $submission = AssignmentSubmission::findOrFail($submissionId);

        $filePath = $submission->file_path;

        if (!Storage::disk('public')->exists($filePath)) {
            abort(404, 'File tidak ditemukan');
        }

        return response()->file(
            storage_path('app/public/' . $filePath)
        );
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
            $deadline = $submission->assignment->deadline;
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
     * Store new assignment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'module_id' => 'required|exists:modules,id',
            'description' => 'required|string',
            'instructions' => 'nullable|string',
            'deadline' => 'required|date|after:now',
            'max_score' => 'required|integer|min:1|max:100',
            'is_active' => 'boolean',
        ]);

        $assignment = Assignment::create([
            'module_id' => $validated['module_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'deadline' => $validated['deadline'],
            'point_reward_early' => 10,
            'point_reward_ontime' => 5,
            'point_reward_late' => 2,
            'is_active' => $validated['is_active'] ?? false,
        ]);

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
            'deadline' => 'required|date',
            'max_score' => 'required|integer|min:1|max:100',
            'is_active' => 'boolean',
        ]);

        $assignment->update([
            'module_id' => $validated['module_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'deadline' => $validated['deadline'],
            'is_active' => $validated['is_active'] ?? $assignment->is_active,
        ]);

        return redirect()->back()->with('success', 'Praktikum berhasil diperbarui!');
    }

    /**
     * Delete assignment
     */
    public function destroy($id)
    {
        $assignment = Assignment::findOrFail($id);

        // Delete all submission files
        foreach ($assignment->submissions as $submission) {
            if (Storage::exists($submission->file_path)) {
                Storage::delete($submission->file_path);
            }
        }

        $assignment->delete();

        return redirect()->back()->with('success', 'Praktikum berhasil dihapus!');
    }

    /**
     * Grade submission - Manual grading by instructor
     */
    public function gradeSubmission(Request $request, $submissionId)
    {
        $submission = AssignmentSubmission::findOrFail($submissionId);

        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:100',
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
     * Download submission file
     */
    public function downloadSubmission($submissionId)
    {
        $submission = AssignmentSubmission::findOrFail($submissionId);

        // File path yang disimpan di database
        $filePath = $submission->file_path;

        if (!$filePath) {
            return abort(404, 'Path file tidak ditemukan di database');
        }

        // Pastikan file ada di storage/app/public/...
        if (!Storage::disk('public')->exists($filePath)) {
            return abort(404, 'File tidak ditemukan di storage/public');
        }

        // Download file
        return Storage::disk('public')->download(
            $filePath,
            basename($filePath)
        );
    }


    /**
     * Download all submissions for an assignment
     */
    public function downloadAllSubmissions($assignmentId)
    {
        $assignment = Assignment::with('submissions')->findOrFail($assignmentId);

        if ($assignment->submissions->isEmpty()) {
            return redirect()->back()->with('error', 'Tidak ada pengumpulan yang tersedia');
        }

        $zip = new \ZipArchive();
        $zipFileName = storage_path("app/temp/{$assignment->title}_submissions.zip");

        // Create temp directory if not exists
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        if ($zip->open($zipFileName, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return redirect()->back()->with('error', 'Gagal membuat file ZIP');
        }

        foreach ($assignment->submissions as $submission) {
            if (Storage::exists($submission->file_path)) {
                $zip->addFile(
                    Storage::path($submission->file_path),
                    "{$submission->user->name}_{$submission->user->nim}_" . basename($submission->file_path)
                );
            }
        }

        $zip->close();

        return response()->download($zipFileName)->deleteFileAfterSend(true);
    }

    /**
     * Get analytics data
     */
    public function analytics()
    {
        $totalAssignments = Assignment::count();
        $totalSubmissions = AssignmentSubmission::count();
        $gradedSubmissions = AssignmentSubmission::whereNotNull('score')->get();
        $lateSubmissions = AssignmentSubmission::whereHas('assignment', function($query) {
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
