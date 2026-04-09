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
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PraktikumController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // Aturan is_active (per modul):
    //   • Tepat 1 praktikum aktif per modul.
    //   • Mengaktifkan draf → aktif sebelumnya otomatis nonaktif.
    //   • Menonaktifkan satu-satunya aktif (tanpa draf lain) → ditolak.
    //   • Menghapus satu-satunya (tanpa cadangan) → ditolak.
    //   • Menghapus aktif yang ada cadangan draf → draf terbaru dipromosikan.
    // ─────────────────────────────────────────────────────────────────────────

    public function index()
    {
        try {
            $assignments = Assignment::with([
                'module:id,title,order_number',
                'submissions:id,assignment_id,user_id,score',
                'classDeadlines.classModel:id,name',
            ])->withCount('submissions')->latest()->get();

            $assignmentsData = $assignments->map(function ($a) {
                try {
                    $subs   = $a->submissions;
                    $graded = $subs->whereNotNull('score');

                    $classDeadlines = $a->classDeadlines
                        ? $a->classDeadlines->map(fn ($cd) => [
                            'classId'   => $cd->class_id,
                            'className' => optional($cd->classModel)->name ?? 'Tidak Diketahui',
                            'deadline'  => $cd->deadline?->format('Y-m-d\TH:i'),
                        ])->filter()->values()->all()
                        : [];

                    return [
                        'id'                => $a->id,
                        'title'             => $a->title ?? 'Tanpa Judul',
                        'moduleId'          => (int) $a->module_id,
                        'moduleName'        => optional($a->module)->title ?? 'Modul Tidak Diketahui',
                        'description'       => $a->description ?? '',
                        // tasks sudah di-cast ke array oleh model; kirim langsung
                        'tasks'             => $a->tasks ?? [],
                        'deadline'          => $a->deadline?->format('Y-m-d\TH:i'),
                        'classDeadlines'    => $classDeadlines,
                        'maxScore'          => 100,
                        'submissions'       => $subs->count(),
                        'totalStudents'     => \App\Models\User::where('role', 'student')->count(),
                        'averageScore'      => $graded->count() > 0 ? round($graded->avg('score'), 1) : 0,
                        'status'            => $a->is_active ? 'active' : 'draft',
                        'createdAt'         => $a->created_at?->format('Y-m-d'),
                        'pointRewardEarly'  => $a->point_reward_early  ?? 10,
                        'pointRewardOntime' => $a->point_reward_ontime ?? 5,
                        'pointRewardLate'   => $a->point_reward_late   ?? 2,
                    ];
                } catch (\Exception $e) {
                    Log::error('Gagal memetakan praktikum id=' . $a->id . ': ' . $e->getMessage());
                    return null;
                }
            })->filter()->values()->all();

            $modules = Module::select('id', 'title', 'order_number as order')
                ->orderBy('order_number')->get()
                ->map(fn ($m) => ['id' => $m->id, 'title' => $m->title, 'order' => $m->order ?? 0])
                ->all();

            $classes = ClassModel::select('id', 'name')->orderBy('name')->get()
                ->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->all();

            $templateExists = Storage::disk('public')->exists('templates/template_laporan_praktikum.docx');

            return Inertia::render('Instructor/praktikum', [
                'assignments'    => $assignmentsData,
                'modules'        => $modules,
                'classes'        => $classes,
                'templateExists' => $templateExists,
            ]);
        } catch (\Exception $e) {
            Log::error('PraktikumController@index: ' . $e->getMessage());
            return Inertia::render('Instructor/praktikum', [
                'assignments' => [], 'modules' => [], 'classes' => [],
                'templateExists' => false,
                'error' => 'Gagal memuat data: ' . $e->getMessage(),
            ]);
        }
    }

    public function store(Request $request)
    {
        try {
            $v = $request->validate([
                'title'                      => 'required|string|max:255',
                'module_id'                  => 'required|exists:modules,id',
                'description'                => 'required|string',
                'instructions'               => 'nullable|string',
                // tasks: array string; setiap item maks. 500 karakter
                'tasks'                      => 'nullable|array',
                'tasks.*'                    => 'required|string|max:500',
                'deadline'                   => 'nullable|date|after:now',
                'class_deadlines'            => 'required|array|min:1',
                'class_deadlines.*.class_id' => 'required|exists:classes,id',
                'class_deadlines.*.deadline' => 'required|date|after:now',
                'max_score'                  => 'required|integer|min:1|max:200',
                'point_reward_early'         => 'required|integer|min:0|max:200',
                'point_reward_ontime'        => 'required|integer|min:0|max:200',
                'point_reward_late'          => 'required|integer|min:0|max:200',
                'is_active'                  => 'boolean',
            ]);

            $isActive = $v['is_active'] ?? false;
            if ($isActive) {
                Assignment::where('module_id', $v['module_id'])->where('is_active', true)
                    ->update(['is_active' => false]);
            }

            // Bersihkan tasks: buang string kosong dan re-index
            $tasks = collect($v['tasks'] ?? [])
                ->map(fn ($t) => trim($t))
                ->filter()
                ->values()
                ->all();

            $assignment = Assignment::create([
                'module_id'           => $v['module_id'],
                'title'               => $v['title'],
                'description'         => $v['description'],
                'tasks'               => $tasks,
                'deadline'            => $v['deadline'] ?? null,
                'point_reward_early'  => $v['point_reward_early'],
                'point_reward_ontime' => $v['point_reward_ontime'],
                'point_reward_late'   => $v['point_reward_late'],
                'is_active'           => $isActive,
            ]);

            foreach ($v['class_deadlines'] as $cd) {
                if (!empty($cd['deadline'])) {
                    AssignmentClassDeadline::create([
                        'assignment_id' => $assignment->id,
                        'class_id'      => $cd['class_id'],
                        'deadline'      => $cd['deadline'],
                    ]);
                }
            }

            return redirect()->back()->with('success', 'Praktikum berhasil dibuat!');
        } catch (\Exception $e) {
            Log::error('Gagal membuat praktikum: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Gagal membuat praktikum: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $assignment = Assignment::findOrFail($id);

            $v = $request->validate([
                'title'                      => 'required|string|max:255',
                'module_id'                  => 'required|exists:modules,id',
                'description'                => 'required|string',
                'instructions'               => 'nullable|string',
                'tasks'                      => 'nullable|array',
                'tasks.*'                    => 'required|string|max:500',
                'deadline'                   => 'nullable|date',
                'class_deadlines'            => 'required|array|min:1',
                'class_deadlines.*.class_id' => 'required|exists:classes,id',
                'class_deadlines.*.deadline' => 'required|date',
                'max_score'                  => 'required|integer|min:1|max:200',
                'point_reward_early'         => 'required|integer|min:0|max:200',
                'point_reward_ontime'        => 'required|integer|min:0|max:200',
                'point_reward_late'          => 'required|integer|min:0|max:200',
                'is_active'                  => 'boolean',
            ]);

            $newActive = $v['is_active'] ?? $assignment->is_active;

            // Tolak jika mencoba menonaktifkan satu-satunya aktif tanpa draf pengganti
            if ($assignment->is_active && !$newActive) {
                $draftCount = Assignment::where('module_id', $assignment->module_id)
                    ->where('id', '!=', $id)->where('is_active', false)->count();
                if ($draftCount === 0) {
                    return redirect()->back()->withErrors([
                        'error' => 'Tidak dapat menonaktifkan praktikum ini karena tidak ada draf pengganti. '
                            . 'Aktifkan draf lain terlebih dahulu.',
                    ]);
                }
            }

            // Nonaktifkan aktif lain jika mengaktifkan draf ini
            if ($newActive && !$assignment->is_active) {
                Assignment::where('module_id', $assignment->module_id)
                    ->where('id', '!=', $id)->where('is_active', true)
                    ->update(['is_active' => false]);
            }

            $tasks = collect($v['tasks'] ?? [])
                ->map(fn ($t) => trim($t))
                ->filter()
                ->values()
                ->all();

            $assignment->update([
                'module_id'           => $v['module_id'],
                'title'               => $v['title'],
                'description'         => $v['description'],
                'tasks'               => $tasks,
                'deadline'            => $v['deadline'] ?? null,
                'point_reward_early'  => $v['point_reward_early'],
                'point_reward_ontime' => $v['point_reward_ontime'],
                'point_reward_late'   => $v['point_reward_late'],
                'is_active'           => $newActive,
            ]);

            $assignment->classDeadlines()->delete();
            foreach ($v['class_deadlines'] as $cd) {
                if (!empty($cd['deadline'])) {
                    AssignmentClassDeadline::create([
                        'assignment_id' => $assignment->id,
                        'class_id'      => $cd['class_id'],
                        'deadline'      => $cd['deadline'],
                    ]);
                }
            }

            return redirect()->back()->with('success', 'Praktikum berhasil diperbarui!');
        } catch (\Exception $e) {
            Log::error('Gagal memperbarui praktikum: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Gagal memperbarui praktikum: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        try {
            $assignment = Assignment::findOrFail($id);

            if ($assignment->is_active) {
                $otherCount = Assignment::where('module_id', $assignment->module_id)
                    ->where('id', '!=', $id)->count();
                if ($otherCount === 0) {
                    return redirect()->back()->withErrors([
                        'error' => 'Tidak dapat menghapus satu-satunya praktikum di modul ini. '
                            . 'Tambahkan praktikum baru terlebih dahulu.',
                    ]);
                }
                // Promosikan draf terbaru menjadi aktif
                $nextDraft = Assignment::where('module_id', $assignment->module_id)
                    ->where('id', '!=', $id)->where('is_active', false)->latest()->first();
                if ($nextDraft) {
                    $nextDraft->update(['is_active' => true]);
                }
            }

            $disk = Storage::disk('public');
            foreach ($assignment->submissions as $sub) {
                if ($sub->file_path && $disk->exists($sub->file_path)) {
                    $disk->delete($sub->file_path);
                }
            }
            $assignment->classDeadlines()->delete();
            $assignment->delete();

            return redirect()->back()->with('success', 'Praktikum berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('Gagal menghapus praktikum: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Gagal menghapus praktikum: ' . $e->getMessage()]);
        }
    }

    public function submissions(Request $request)
    {
        try {
            $query = AssignmentSubmission::with(['user', 'assignment.module', 'assignment.classDeadlines'])
                ->latest('submitted_at');

            if ($request->filled('assignment_id')) {
                $query->where('assignment_id', $request->assignment_id);
            }
            if ($request->filled('status') && $request->status !== 'all') {
                $request->status === 'graded' ? $query->whereNotNull('score') : $query->whereNull('score');
            }

            $submissions = $query->get()->map(function ($sub) {
                try {
                    $deadline    = $sub->assignment->getDeadlineForStudent($sub->user_id);
                    $submittedAt = $sub->submitted_at;
                    $isLate      = $submittedAt > $deadline;
                    $daysDiff    = $deadline->diffInDays($submittedAt);
                    $disk        = Storage::disk('public');
                    $fileExists  = $sub->file_path && $disk->exists($sub->file_path);
                    return [
                        'id'              => $sub->id,
                        'assignmentId'    => $sub->assignment_id,
                        'assignmentTitle' => $sub->assignment->title ?? 'Tidak Diketahui',
                        'studentId'       => $sub->user_id,
                        'studentName'     => $sub->user->name ?? 'Tidak Diketahui',
                        'nim'             => $sub->user->nim ?? 'N/A',
                        'fileName'        => $sub->file_name ?? basename($sub->file_path ?? 'unknown'),
                        'fileSize'        => $fileExists ? $this->formatFileSize($disk->size($sub->file_path)) : 'File tidak ditemukan',
                        'submittedAt'     => $submittedAt,
                        'status'          => $sub->score !== null ? 'graded' : 'submitted',
                        'score'           => $sub->score,
                        'feedback'        => $sub->feedback ?? '',
                        'isLate'          => $isLate,
                        'daysLate'        => $isLate ? $daysDiff : 0,
                        'daysEarly'       => !$isLate ? $daysDiff : 0,
                    ];
                } catch (\Exception $e) {
                    Log::error('Gagal memetakan pengumpulan: ' . $e->getMessage());
                    return null;
                }
            })->filter()->values();

            return response()->json($submissions);
        } catch (\Exception $e) {
            Log::error('Gagal mengambil pengumpulan: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal memuat data pengumpulan'], 500);
        }
    }

    public function gradeSubmission(Request $request, $submissionId)
    {
        try {
            $submission = AssignmentSubmission::findOrFail($submissionId);
            $v = $request->validate([
                'score'    => 'required|integer|min:0|max:100',
                'feedback' => 'nullable|string',
            ]);
            $submission->update(['score' => $v['score'], 'feedback' => $v['feedback'] ?? null]);
            return redirect()->back()->with('success', 'Nilai berhasil disimpan!');
        } catch (\Exception $e) {
            Log::error('Gagal menyimpan nilai: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Gagal menyimpan nilai: ' . $e->getMessage()]);
        }
    }

    public function previewSubmission($submissionId)
    {
        try {
            $submission = AssignmentSubmission::findOrFail($submissionId);
            $disk       = Storage::disk('public');
            if (!$submission->file_path || !$disk->exists($submission->file_path)) {
                abort(404, 'File tidak ditemukan');
            }
            return response()->file($disk->path($submission->file_path));
        } catch (\Exception $e) {
            abort(404, 'File tidak ditemukan');
        }
    }

    public function downloadSubmission($submissionId)
    {
        try {
            $submission = AssignmentSubmission::findOrFail($submissionId);
            $disk       = Storage::disk('public');
            if (!$submission->file_path || !$disk->exists($submission->file_path)) {
                abort(404, 'File tidak ditemukan di penyimpanan');
            }
            return $disk->download($submission->file_path, $submission->file_name ?? basename($submission->file_path));
        } catch (\Exception $e) {
            abort(404, 'File tidak dapat diunduh');
        }
    }

    /**
     * Unduh template laporan praktikum.
     * Letakkan file di: storage/app/public/templates/template_laporan_praktikum.docx
     */
    public function downloadTemplate()
    {
        try {
            $disk = Storage::disk('public');
            $path = 'templates/template_laporan_praktikum.docx';
            if (!$disk->exists($path)) {
                return redirect()->back()->withErrors([
                    'error' => 'Template laporan belum tersedia. Hubungi administrator sistem.',
                ]);
            }
            return $disk->download($path, 'Template_Laporan_Praktikum.docx');
        } catch (\Exception $e) {
            Log::error('Gagal mengunduh template: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Gagal mengunduh template: ' . $e->getMessage()]);
        }
    }

    public function analytics()
    {
        try {
            $graded = AssignmentSubmission::whereNotNull('score')->get();
            return response()->json([
                'totalAssignments'  => Assignment::count(),
                'totalSubmissions'  => AssignmentSubmission::count(),
                'averageScore'      => $graded->count() > 0 ? round($graded->avg('score'), 1) : 0,
                'lateSubmissions'   => AssignmentSubmission::whereHas('assignment', fn ($q) =>
                    $q->whereRaw('assignment_submissions.submitted_at > assignments.deadline')
                )->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal mengambil analitik: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal memuat data analitik'], 500);
        }
    }

    private function formatFileSize(int $bytes): string
    {
        if ($bytes >= 1_073_741_824) return number_format($bytes / 1_073_741_824, 2) . ' GB';
        if ($bytes >= 1_048_576)     return number_format($bytes / 1_048_576, 2) . ' MB';
        if ($bytes >= 1_024)         return number_format($bytes / 1_024, 2) . ' KB';
        return $bytes . ' byte';
    }
}
