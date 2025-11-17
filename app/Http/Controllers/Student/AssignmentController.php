<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
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
            'instructions' => $assignment->instructions ?? '',
            'deadline' => $assignment->deadline->format('Y-m-d H:i:s'),
            'point_reward_early' => $assignment->point_reward_early,
            'point_reward_ontime' => $assignment->point_reward_ontime,
            'point_reward_late' => $assignment->point_reward_late,
            'max_file_size' => 10, // MB
            'allowed_file_types' => ['pdf'],
            'module_id' => $assignment->module_id,
            'submitted' => $submission !== null,
            'submission' => $submission ? [
                'id' => $submission->id,
                'file_name' => $submission->file_name,
                'file_path' => $submission->file_path,
                'notes' => $submission->notes,
                'submitted_at' => $submission->submitted_at->format('d M Y H:i'),
                'status' => $submission->status,
                'points_earned' => $submission->points_earned,
                'feedback' => $submission->feedback,
            ] : null,
            'completed' => $progress ? $progress->is_completed : false,
            'is_late' => now()->isAfter($assignment->deadline),
            'days_until_deadline' => now()->diffInDays($assignment->deadline, false),
        ];

        return Inertia::render('Student/Assignments/Show', [
            'assignment' => $assignmentData
        ]);
    }

    /**
     * Submit assignment dengan poin otomatis
     */
    public function submit(Request $request, $assignmentId)
    {
        $user = Auth::user();
        $assignment = Assignment::findOrFail($assignmentId);

        // Check if already submitted
        $existingSubmission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingSubmission) {
            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Tugas sudah dikumpulkan sebelumnya'
                ]
            ]);
        }

        // Validate request
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:pdf',
                'max:10240' // 10MB
            ],
            'notes' => 'nullable|string|max:1000',
        ], [
            'file.required' => 'File wajib diupload',
            'file.mimes' => 'Hanya file PDF yang diperbolehkan',
            'file.max' => 'Ukuran file maksimal 10MB',
        ]);

        DB::beginTransaction();

        try {
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

            // ✅ Hitung poin berdasarkan waktu pengumpulan
            $submittedAt = now();
            $deadline = $assignment->deadline;
            $earlyDeadline = $deadline->copy()->subDays(2); // 2 hari sebelum deadline = early

            $pointsEarned = 0;
            $status = 'submitted';

            if ($submittedAt->lte($earlyDeadline)) {
                // Submit lebih awal (>2 hari sebelum deadline)
                $pointsEarned = $assignment->point_reward_early;
                $status = 'early';
            } elseif ($submittedAt->lte($deadline)) {
                // Submit tepat waktu (antara 2 hari sebelum deadline sampai deadline)
                $pointsEarned = $assignment->point_reward_ontime;
                $status = 'ontime';
            } else {
                // Submit terlambat (setelah deadline)
                $pointsEarned = $assignment->point_reward_late;
                $status = 'late';
            }

            // Create submission
            $submission = AssignmentSubmission::create([
                'assignment_id' => $assignment->id,
                'user_id' => $user->id,
                'file_name' => $fileName, // FIX: sesuai nama file tersimpan
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'notes' => $request->notes,
                'status' => $status,
                'submitted_at' => $submittedAt,
                'points_earned' => $pointsEarned,
            ]);


            // ✅ Create progress record
            UserProgress::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'progressable_type' => Assignment::class,
                    'progressable_id' => $assignment->id,
                ],
                [
                    'is_completed' => true,
                    'points_earned' => $pointsEarned,
                    'completed_at' => $submittedAt,
                ]
            );

            // ✅ Tambahkan poin ke user
            $user->increment('points', $pointsEarned);

            DB::commit();

            $statusMessage = match($status) {
                'early' => "Tepat waktu! Anda mendapatkan poin maksimal 🎉",
                'ontime' => "Tepat waktu! Anda mendapatkan poin penuh ✅",
                'late' => "Terlambat. Poin dikurangi ⚠️",
                default => "Berhasil dikumpulkan"
            };

            return back()->with([
                'flash' => [
                    'success' => true,
                    'message' => "Tugas berhasil dikumpulkan! {$statusMessage} (+{$pointsEarned} poin 🔥)",
                    'total_points' => $user->fresh()->points,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            // Delete uploaded file if exists
            if (isset($filePath) && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            \Log::error('Assignment submission error', [
                'user_id' => $user->id,
                'assignment_id' => $assignment->id,
                'error' => $e->getMessage()
            ]);

            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Terjadi kesalahan saat mengupload tugas: ' . $e->getMessage()
                ]
            ]);
        }
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
            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'File tidak ditemukan'
                ]
            ]);
        }

        return Storage::disk('public')->download(
            $submission->file_path,
            $submission->file_name
        );
    }
}
