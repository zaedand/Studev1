<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\ClassModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClassRoomController extends Controller
{
    // =========================================================
    // INDEX
    // =========================================================
    public function index()
    {
        $classes = ClassModel::withCount('students')
            ->with('instructor')
            ->latest()
            ->get()
            ->map(fn($class) => [
                'id'             => $class->id,
                'name'           => $class->name,
                'description'    => $class->description,
                'is_active'      => $class->is_active,
                'students_count' => $class->students_count,
                'instructor_id'  => $class->instructor_id,
                'instructor_name'=> $class->instructor->name ?? '—',
                'created_at'     => $class->created_at->format('d M Y'),
            ]);

        return Inertia::render('Instructor/Classes/Index', [
            'classes' => $classes,
        ]);
    }

    // =========================================================
    // SHOW
    // =========================================================
    public function show($id)
    {
        $class = ClassModel::with(['students', 'instructor'])->findOrFail($id);

        return Inertia::render('Instructor/Classes/Detail', [
            'class' => [
                'id'              => $class->id,
                'name'            => $class->name,
                'description'     => $class->description,
                'is_active'       => $class->is_active,
                'instructor_id'   => $class->instructor_id,
                'instructor_name' => $class->instructor->name ?? '—',
                'created_at'      => $class->created_at->format('d M Y'),
                'updated_at'      => $class->updated_at->format('d M Y'),
            ],
            'students' => $class->students->map(fn($s) => [
                'id'     => $s->id,
                'name'   => $s->name,
                'email'  => $s->email,
                'points' => $s->points ?? 0,
            ]),
        ]);
    }

    // =========================================================
    // CREATE
    // =========================================================
    public function create()
    {
        return Inertia::render('Instructor/Classes/Create');
    }

    // =========================================================
    // STORE
    // FIX: instructor_id tidak lagi divalidasi dari request —
    // langsung di-set ke Auth::id() agar create tidak error.
    // =========================================================
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ], [
            'name.required' => 'Nama kelas tidak boleh kosong.',
            'name.max'      => 'Nama kelas maksimal 255 karakter.',
        ]);

        $validated['instructor_id'] = Auth::id();

        ClassModel::create($validated);

        return redirect()
            ->route('instructor.classes.index')
            ->with('success', "Kelas \"{$validated['name']}\" berhasil dibuat.");
    }

    // =========================================================
    // EDIT
    // =========================================================
    public function edit($id)
    {
        $class = ClassModel::findOrFail($id);

        return Inertia::render('Instructor/Classes/Edit', [
            'class' => $class,
        ]);
    }

    // =========================================================
    // UPDATE
    // =========================================================
    public function update(Request $request, $id)
    {
        $class = ClassModel::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ], [
            'name.required' => 'Nama kelas tidak boleh kosong.',
        ]);

        // Pertahankan instructor_id yang sudah ada
        $class->update($validated);

        return redirect()
            ->route('instructor.classes.show', $class->id)
            ->with('success', "Kelas \"{$class->name}\" berhasil diperbarui.");
    }

    // =========================================================
    // DESTROY
    // =========================================================
    public function destroy($id)
    {
        $class = ClassModel::withCount('students')->findOrFail($id);

        if ($class->students_count > 0) {
            return back()->with('error', "Kelas \"{$class->name}\" tidak dapat dihapus karena masih memiliki {$class->students_count} mahasiswa. Keluarkan semua mahasiswa terlebih dahulu.");
        }

        $name = $class->name;
        $class->delete();

        return redirect()
            ->route('instructor.classes.index')
            ->with('success', "Kelas \"{$name}\" berhasil dihapus.");
    }

    // =========================================================
    // TOGGLE ACTIVE
    // Kelas tidak memiliki aturan "tepat 1 aktif" seperti quiz,
    // sehingga toggle bebas. Namun tetap kembalikan redirect Inertia.
    // =========================================================
    public function toggleActive($id)
    {
        $class = ClassModel::findOrFail($id);
        $class->update(['is_active' => !$class->is_active]);

        $status = $class->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Kelas \"{$class->name}\" berhasil {$status}.");
    }

    // =========================================================
    // ADD STUDENT
    // Mendukung dua skenario:
    //   1. Mahasiswa belum punya kelas  → langsung tambah.
    //   2. Mahasiswa sudah di kelas lain → pindahkan (transfer).
    // Parameter `transfer` dari request menentukan skenario 2.
    // =========================================================
    public function addStudent(Request $request, $id)
    {
        $class = ClassModel::findOrFail($id);

        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'transfer'   => 'boolean', // true = pindah dari kelas lain
        ]);

        $student = User::where('id', $validated['student_id'])
            ->where('role', 'student')
            ->first();

        if (!$student) {
            return back()->with('error', 'Pengguna ini bukan mahasiswa.');
        }

        // Cek apakah sudah ada di kelas ini
        if ($class->students()->where('student_id', $validated['student_id'])->exists()) {
            return back()->with('error', "{$student->name} sudah terdaftar di kelas ini.");
        }

        // Cek apakah sudah ada di kelas lain
        $currentClass = ClassModel::whereHas('students', fn($q) => $q->where('users.id', $student->id))
            ->where('id', '!=', $id)
            ->first();

        if ($currentClass) {
            if (empty($validated['transfer'])) {
                // Belum dikonfirmasi transfer — kembalikan info untuk konfirmasi di frontend
                return back()->with('error', "NEEDS_TRANSFER:{$currentClass->id}:{$currentClass->name}:{$student->name}");
            }

            // Transfer: keluarkan dari kelas lama, masukkan ke kelas baru
            DB::transaction(function () use ($class, $currentClass, $student) {
                $currentClass->students()->detach($student->id);
                $class->students()->attach($student->id);
            });

            return back()->with('success', "{$student->name} berhasil dipindahkan dari kelas \"{$currentClass->name}\" ke kelas \"{$class->name}\".");
        }

        // Tidak ada di kelas lain — tambah langsung
        $class->students()->attach($validated['student_id']);

        return back()->with('success', "{$student->name} berhasil ditambahkan ke kelas.");
    }

    // =========================================================
    // REMOVE STUDENT
    // =========================================================
    public function removeStudent($classId, $studentId)
    {
        $class   = ClassModel::findOrFail($classId);
        $student = User::findOrFail($studentId);

        $class->students()->detach($studentId);

        return back()->with('success', "{$student->name} berhasil dikeluarkan dari kelas.");
    }

    // =========================================================
    // AVAILABLE STUDENTS
    // Mengembalikan SEMUA mahasiswa + info kelas mereka saat ini.
    // =========================================================
    public function availableStudents($id)
    {
        $class = ClassModel::findOrFail($id);

        // Semua mahasiswa
        $all = User::where('role', 'student')
            ->get(['id', 'name', 'email', 'points']);

        // ID mahasiswa yang sudah ada di kelas ini
        $inThisClass = $class->students()->pluck('users.id')->toArray();

        // Kelas tiap mahasiswa (dari kelas lain)
        $studentClasses = DB::table('class_students')
            ->join('classes', 'class_students.class_id', '=', 'classes.id')
            ->whereIn('class_students.student_id', $all->pluck('id'))
            ->where('classes.id', '!=', $id)
            ->select('class_students.student_id', 'classes.id as class_id', 'classes.name as class_name')
            ->get()
            ->keyBy('student_id');

        $students = $all->map(function ($s) use ($inThisClass, $studentClasses) {
            $inThis  = in_array($s->id, $inThisClass);
            $classInfo = $studentClasses->get($s->id);

            return [
                'id'              => $s->id,
                'name'            => $s->name,
                'email'           => $s->email,
                'points'          => $s->points ?? 0,
                'in_this_class'   => $inThis,
                'current_class_id'  => $classInfo?->class_id,
                'current_class_name'=> $classInfo?->class_name,
                // no_class: tidak di kelas mana pun (termasuk kelas ini tidak dihitung)
                'no_class'        => !$inThis && $classInfo === null,
            ];
        });

        return response()->json(['students' => $students]);
    }
}
