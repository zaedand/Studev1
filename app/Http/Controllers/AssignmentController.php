<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    /**
     * Display the specified assignment
     */
    public function show(Assignment $assignment)
    {
        $user = Auth::user();

        // Get user submission
        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        // Get user progress
        $progress = UserProgress::where('user_id', $user->id)
            ->where('progressable_type', Assignment::class)
            ->where('progressable_id', $assignment->id)
            ->first();

        $assignmentData = [
            'id' => $assignment->id,
            'title' => $assignment->title,
            'description' => $assignment->description,
            'instructions' => $assignment->instructions,
            'deadline' => $assignment->deadline,
            'points' => $assignment->points,
            'max_file_size' => $assignment->max_file_size ?? 10, // MB
            'allowed_file_types' => $assignment->allowed_file_types ?? ['pdf'],
            'module_id' => $assignment->module_id,
            'tasks' => json_decode($assignment->tasks ?? '[]'),
            'submitted' => $submission !== null,
            'submission' => $submission ? [
                'id' => $submission->id,
                'file_name' => $submission->file_name,
                'file_path' => $submission->file_path,
                'notes' => $submission->notes,
                'submitted_at' => $submission->created_at->format('d M Y H:i'),
                'status' => $submission->status,
                'grade' => $submission->grade,
                'feedback' => $submission->feedback,
            ] : null,
            'completed' => $progress ? $progress->is_completed : false,
            'is_late' => now()->isAfter($assignment->deadline),
        ];

        return Inertia::render('Student/Assignments/Show', [
            'assignment' => $assignmentData
        ]);
    }

    /**
     * Submit assignment
     */
    public function submit(Assignment $assignment, Request $request)
    {
        $user = Auth::user();

        // Check if already submitted
        $existingSubmission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingSubmission) {
            return redirect()->back()->with('flash', [
                'success' => false,
                'message' => 'Tugas sudah dikumpulkan sebelumnya'
            ]);
        }

        // Validate request
        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:pdf',
                'max:' . ($assignment->max_file_size ?? 10) * 1024 // Convert MB to KB
            ],
            'notes' => 'nullable|string|max:1000',
        ], [
            'file.required' => 'File wajib diupload',
            'file.mimes' => 'Hanya file PDF yang diperbolehkan',
            'file.max' => 'Ukuran file maksimal ' . ($assignment->max_file_size ?? 10) . 'MB',
        ]);

        // Store file
        $file = $request->file('file');
        $fileName = Str::slug($user->name) . '_' .
                    Str::slug($assignment->title) . '_' .
                    time() . '.' .
                    $file->getClientOriginalExtension();

        $filePath = $file->storeAs(
            'assignments/' . $assignment->id,
            $fileName,
            'public'
        );

        // Create submission
        $submission = AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'user_id' => $user->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'notes' => $request->notes,
            'status' => 'submitted',
            'submitted_at' => now(),
            'is_late' => now()->isAfter($assignment->deadline),
        ]);

        // Create or update progress (not completed until graded)
        UserProgress::updateOrCreate(
            [
                'user_id' => $user->id,
                'progressable_type' => Assignment::class,
                'progressable_id' => $assignment->id,
            ],
            [
                'is_completed' => false,
                'progress_percentage' => 50, // Submitted but not graded yet
            ]
        );

        return redirect()->back()->with('flash', [
            'success' => true,
            'message' => 'Tugas berhasil dikumpulkan! Menunggu penilaian dari instruktur.',
        ]);
    }

    /**
     * Download submission file
     */
    public function download(AssignmentSubmission $submission)
    {
        $user = Auth::user();

        // Check if user owns this submission or is instructor
        if ($submission->user_id !== $user->id && !$user->hasRole('instructor')) {
            abort(403, 'Unauthorized action.');
        }

        // Check if file exists
        if (!Storage::disk('public')->exists($submission->file_path)) {
            return redirect()->back()->with('error', 'File tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $submission->file_path,
            $submission->file_name
        );
    }

    /**
     * Resubmit assignment (if allowed)
     */
    public function resubmit(Assignment $assignment, Request $request)
    {
        $user = Auth::user();

        // Check if resubmission is allowed
        if (!$assignment->allow_resubmission) {
            return redirect()->back()->with('flash', [
                'success' => false,
                'message' => 'Pengumpulan ulang tidak diperbolehkan untuk tugas ini'
            ]);
        }

        // Get existing submission
        $existingSubmission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$existingSubmission) {
            return redirect()->back()->with('flash', [
                'success' => false,
                'message' => 'Tidak ada submission sebelumnya'
            ]);
        }

        // Validate request
        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:pdf',
                'max:' . ($assignment->max_file_size ?? 10) * 1024
            ],
            'notes' => 'nullable|string|max:1000',
        ]);

        // Delete old file
        if (Storage::disk('public')->exists($existingSubmission->file_path)) {
            Storage::disk('public')->delete($existingSubmission->file_path);
        }

        // Store new file
        $file = $request->file('file');
        $fileName = Str::slug($user->name) . '_' .
                    Str::slug($assignment->title) . '_' .
                    time() . '.' .
                    $file->getClientOriginalExtension();

        $filePath = $file->storeAs(
            'assignments/' . $assignment->id,
            $fileName,
            'public'
        );

        // Update submission
        $existingSubmission->update([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'notes' => $request->notes,
            'status' => 'resubmitted',
            'submitted_at' => now(),
            'is_late' => now()->isAfter($assignment->deadline),
            'grade' => null, // Reset grade
            'feedback' => null, // Reset feedback
        ]);

        return redirect()->back()->with('flash', [
            'success' => true,
            'message' => 'Tugas berhasil dikumpulkan ulang!',
        ]);
    }
}
