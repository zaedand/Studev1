<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\AssignmentClassDeadline;
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

        // Get user's class
        $userClass = $user->classes()->first();

        // Get deadline untuk kelas user (prioritas), fallback ke deadline default
        $classDeadline = null;

        if ($userClass) {
            $classDeadline = AssignmentClassDeadline::where('assignment_id', $assignment->id)
                ->where('class_id', $userClass->id)
                ->first();
        }

        $deadline = $classDeadline
            ? $classDeadline->deadline
            : $assignment->deadline;


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
            'deadline' => $deadline->format('Y-m-d H:i:s'),
            'deadline_formatted' => $deadline->format('d M Y H:i'),
            'has_custom_deadline' => $classDeadline !== null,
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
                'score' => $submission->score,
                'feedback' => $submission->feedback,
                'is_graded' => $submission->is_graded,
                'submission_time_info' => $this->getSubmissionTimeInfo($submission, $deadline),
            ] : null,
            'completed' => $progress ? $progress->is_completed : false,
            'is_late' => now()->isAfter($deadline),
            'days_until_deadline' => now()->diffInDays($deadline, false),
        ];

        return Inertia::render('Student/Assignments/Show', [
            'assignment' => $assignmentData
        ]);
    }

    /**
     * Helper untuk mendapatkan info waktu pengumpulan
     */
    private function getSubmissionTimeInfo($submission, $deadline)
    {
        $submittedAt = $submission->submitted_at;
        $days = abs($submittedAt->diffInDays($deadline, false));

        if ($submittedAt->isAfter($deadline)) {
            return [
                'status' => 'late',
                'message' => "Terlambat {$days} hari",
                'color' => 'red'
            ];
        }

        $earlyDeadline = $deadline->copy()->subDays(2);
        if ($submittedAt->lte($earlyDeadline)) {
            return [
                'status' => 'early',
                'message' => "{$days} hari lebih awal",
                'color' => 'green'
            ];
        }

        if ($days > 0) {
            return [
                'status' => 'ontime',
                'message' => "{$days} hari sebelum deadline",
                'color' => 'blue'
            ];
        }

        return [
            'status' => 'ontime',
            'message' => "Tepat waktu",
            'color' => 'blue'
        ];
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
                    'message' => 'Tugas sudah dikumpulkan sebelumnya. Gunakan tombol "Ganti File" untuk mengupdate submission.'
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
            // Get deadline untuk kelas user
            $userClass = $user->classes()->first();

            $classDeadline = null;

            if ($userClass) {
                $classDeadline = AssignmentClassDeadline::where('assignment_id', $assignment->id)
                    ->where('class_id', $userClass->id)
                    ->first();
            }

            $deadline = $classDeadline
                ? $classDeadline->deadline
                : $assignment->deadline;


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

            // Hitung poin berdasarkan waktu pengumpulan
            $submittedAt = now();
            $earlyDeadline = $deadline->copy()->subDays(2);

            $pointsEarned = 0;
            $status = 'submitted';

            if ($submittedAt->lte($earlyDeadline)) {
                $pointsEarned = $assignment->point_reward_early;
                $status = 'early';
            } elseif ($submittedAt->lte($deadline)) {
                $pointsEarned = $assignment->point_reward_ontime;
                $status = 'ontime';
            } else {
                $pointsEarned = $assignment->point_reward_late;
                $status = 'late';
            }

            // Create submission
            $submission = AssignmentSubmission::create([
                'assignment_id' => $assignment->id,
                'user_id' => $user->id,
                'file_name' => $fileName,
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'notes' => $request->notes,
                'status' => $status,
                'submitted_at' => $submittedAt,
                'points_earned' => $pointsEarned,
            ]);

            // Create progress record
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

            // Tambahkan poin ke user
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
     * Delete submission (menghapus file yang sudah diupload)
     */
    public function deleteSubmission($assignmentId)
    {
        $user = Auth::user();
        $assignment = Assignment::findOrFail($assignmentId);

        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$submission) {
            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Submission tidak ditemukan'
                ]
            ]);
        }

        // Cek apakah sudah dinilai
        if ($submission->is_graded) {
            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Tidak dapat menghapus submission yang sudah dinilai oleh dosen'
                ]
            ]);
        }

        DB::beginTransaction();

        try {
            // Hapus file dari storage
            if (Storage::disk('public')->exists($submission->file_path)) {
                Storage::disk('public')->delete($submission->file_path);
            }

            // Kurangi poin user
            $pointsToDeduct = $submission->points_earned;
            $user->decrement('points', $pointsToDeduct);

            // Hapus progress record
            UserProgress::where('user_id', $user->id)
                ->where('progressable_type', Assignment::class)
                ->where('progressable_id', $assignment->id)
                ->delete();

            // Hapus submission record
            $submission->delete();

            DB::commit();

            return back()->with([
                'flash' => [
                    'success' => true,
                    'message' => "File berhasil dihapus. Poin dikurangi -{$pointsToDeduct} 🔥",
                    'total_points' => $user->fresh()->points,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Assignment deletion error', [
                'user_id' => $user->id,
                'assignment_id' => $assignment->id,
                'error' => $e->getMessage()
            ]);

            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Terjadi kesalahan saat menghapus file: ' . $e->getMessage()
                ]
            ]);
        }
    }

    /**
     * Resubmit assignment (ganti file)
     */
    public function resubmit(Request $request, $assignmentId)
    {
        $user = Auth::user();
        $assignment = Assignment::findOrFail($assignmentId);

        $existingSubmission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$existingSubmission) {
            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Tidak ada submission sebelumnya'
                ]
            ]);
        }

        // Cek apakah sudah dinilai
        if ($existingSubmission->is_graded) {
            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Tidak dapat mengganti file yang sudah dinilai oleh dosen'
                ]
            ]);
        }

        // Validate request
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:pdf',
                'max:10240'
            ],
            'notes' => 'nullable|string|max:1000',
        ], [
            'file.required' => 'File wajib diupload',
            'file.mimes' => 'Hanya file PDF yang diperbolehkan',
            'file.max' => 'Ukuran file maksimal 10MB',
        ]);

        DB::beginTransaction();

        try {
            // Get deadline untuk kelas user
            $userClass = $user->classes()->first();

            $classDeadline = AssignmentClassDeadline::where('assignment_id', $assignment->id)
                ->where('class_id', $userClass)
                ->first();

            $deadline = $classDeadline ? $classDeadline->deadline : $assignment->deadline;

            // Hapus file lama
            if (Storage::disk('public')->exists($existingSubmission->file_path)) {
                Storage::disk('public')->delete($existingSubmission->file_path);
            }

            // Simpan poin lama untuk dikurangi
            $oldPoints = $existingSubmission->points_earned;

            // Upload file baru
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

            // Hitung poin berdasarkan waktu pengumpulan BARU
            $submittedAt = now();
            $earlyDeadline = $deadline->copy()->subDays(2);

            $pointsEarned = 0;
            $status = 'submitted';

            if ($submittedAt->lte($earlyDeadline)) {
                $pointsEarned = $assignment->point_reward_early;
                $status = 'early';
            } elseif ($submittedAt->lte($deadline)) {
                $pointsEarned = $assignment->point_reward_ontime;
                $status = 'ontime';
            } else {
                $pointsEarned = $assignment->point_reward_late;
                $status = 'late';
            }

            // Update submission
            $existingSubmission->update([
                'file_name' => $fileName,
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'notes' => $request->notes,
                'status' => $status,
                'submitted_at' => $submittedAt,
                'points_earned' => $pointsEarned,
            ]);

            // Update progress
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

            // Update poin user (kurangi poin lama, tambah poin baru)
            $pointsDifference = $pointsEarned - $oldPoints;
            if ($pointsDifference > 0) {
                $user->increment('points', $pointsDifference);
            } else if ($pointsDifference < 0) {
                $user->decrement('points', abs($pointsDifference));
            }

            DB::commit();

            $statusMessage = match($status) {
                'early' => "Tepat waktu! Anda mendapatkan poin maksimal 🎉",
                'ontime' => "Tepat waktu! Anda mendapatkan poin penuh ✅",
                'late' => "Terlambat. Poin dikurangi ⚠️",
                default => "Berhasil dikumpulkan"
            };

            $pointsMessage = $pointsDifference >= 0
                ? "+{$pointsDifference} poin"
                : "{$pointsDifference} poin";

            return back()->with([
                'flash' => [
                    'success' => true,
                    'message' => "File berhasil diganti! {$statusMessage} ({$pointsMessage} 🔥)",
                    'total_points' => $user->fresh()->points,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            if (isset($filePath) && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            \Log::error('Assignment resubmission error', [
                'user_id' => $user->id,
                'assignment_id' => $assignment->id,
                'error' => $e->getMessage()
            ]);

            return back()->with([
                'flash' => [
                    'error' => true,
                    'message' => 'Terjadi kesalahan saat mengganti file: ' . $e->getMessage()
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

        if ($submission->user_id !== $user->id && !$user->hasRole('instructor')) {
            abort(403, 'Unauthorized action.');
        }

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
    public function downloadTemplate()
{
    $filePath = 'templates/ContohFormatLaporanDPK.docx';

    if (!Storage::disk('public')->exists($filePath)) {
        return back()->with([
            'flash' => [
                'error' => true,
                'message' => 'Template tidak ditemukan'
            ]
        ]);
    }

    return Storage::disk('public')->download(
        $filePath,
        'ContohFormatLaporanDPK.docx'
    );
}
}
