<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\ClassModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ClassRoomController extends Controller
{
    /**
     * Display a listing of classes
     */
    public function index()
    {
        $classes = ClassModel::withCount('students')
            ->latest()
            ->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'description' => $class->description,
                    'is_active' => $class->is_active,
                    'students_count' => $class->students_count,
                    'instructor_id' => $class->instructor_id,
                    'instructor_name' => $class->instructor ? $class->instructor->name : 'N/A',
                    'created_at' => $class->created_at->format('d M Y'),
                ];
            });

        return Inertia::render('Instructor/Classes/Index', [
            'classes' => $classes,
        ]);
    }

    /**
     * Show class details with students
     */
    public function show($id)
    {
        $class = ClassModel::with(['students', 'instructor'])->findOrFail($id);

        return Inertia::render('Instructor/Classes/Detail', [
            'class' => [
                'id' => $class->id,
                'name' => $class->name,
                'description' => $class->description,
                'is_active' => $class->is_active,
                'instructor_id' => $class->instructor_id,
                'instructor_name' => $class->instructor ? $class->instructor->name : 'N/A',
                'created_at' => $class->created_at->format('d M Y'),
                'updated_at' => $class->updated_at->format('d M Y'),
            ],
            'students' => $class->students->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'points' => $student->points ?? 0,
                ];
            }),
        ]);
    }

    /**
     * Show the form for creating a new class
     */
    public function create()
    {
        // Get all instructors for dropdown (optional)
        $instructors = User::where('role', 'instructor')->get(['id', 'name']);

        return Inertia::render('Instructor/Classes/Create', [
            'instructors' => $instructors,
        ]);
    }

    /**
     * Store a newly created class
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructor_id' => 'required|exists:users,id',
            'is_active' => 'boolean',
        ]);

        // Default to current instructor if not provided
        if (!isset($validated['instructor_id'])) {
            $validated['instructor_id'] = auth()->id();
        }

        ClassModel::create($validated);

        return redirect()
            ->route('instructor.classes.index')
            ->with('success', 'Class created successfully!');
    }

    /**
     * Show the form for editing class
     */
    public function edit($id)
    {
        $class = ClassModel::findOrFail($id);
        $instructors = User::where('role', 'instructor')->get(['id', 'name']);

        return Inertia::render('Instructor/Classes/Edit', [
            'class' => $class,
            'instructors' => $instructors,
        ]);
    }

    /**
     * Update the specified class
     */
    public function update(Request $request, $id)
    {
        $class = ClassModel::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructor_id' => 'required|exists:users,id',
            'is_active' => 'boolean',
        ]);

        $class->update($validated);

        return redirect()
            ->route('instructor.classes.show', $class->id)
            ->with('success', 'Class updated successfully!');
    }

    /**
     * Remove the specified class
     */
    public function destroy($id)
    {
        $class = ClassModel::findOrFail($id);

        // Check if class has students
        if ($class->students()->exists()) {
            return back()->with('error', 'Cannot delete class with students. Please remove all students first.');
        }

        $class->delete();

        return redirect()
            ->route('instructor.classes.index')
            ->with('success', 'Class deleted successfully!');
    }

    /**
     * Toggle class active status
     */
    public function toggleActive($id)
    {
        $class = ClassModel::findOrFail($id);
        $class->update(['is_active' => !$class->is_active]);

        return back()->with('success', 'Class status updated successfully!');
    }

    /**
     * Add student to class
     */
    public function addStudent(Request $request, $id)
    {
        $class = ClassModel::findOrFail($id);

        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);

        // Check if student is already in class
        if ($class->students()->where('student_id', $validated['student_id'])->exists()) {
            return back()->with('error', 'Student is already in this class.');
        }

        // Check if user is actually a student
        $student = User::where('id', $validated['student_id'])
            ->where('role', 'student')
            ->first();

        if (!$student) {
            return back()->with('error', 'User is not a student.');
        }

        $class->students()->attach($validated['student_id']);

        return back()->with('success', 'Student added successfully!');
    }

    /**
     * Remove student from class
     */
    public function removeStudent($classId, $studentId)
    {
        $class = ClassModel::findOrFail($classId);

        $class->students()->detach($studentId);

        return back()->with('success', 'Student removed successfully!');
    }

    /**
     * Get available students for class (not in this class yet)
     */
    public function availableStudents($id)
    {
        $class = ClassModel::findOrFail($id);

        // Get students not in this class
        $availableStudents = User::where('role', 'student')
            ->whereNotIn('id', $class->students()->pluck('users.id'))
            ->get(['id', 'name', 'email']);

        return response()->json([
            'students' => $availableStudents,
        ]);
    }
}
