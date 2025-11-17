<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\ClassRoom;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ClassRoomController extends Controller
{
    public function index()
    {
        $classes = ClassRoom::withCount('students')
            ->orderBy('academic_year', 'desc')
            ->orderBy('name')
            ->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'code' => $class->code,
                    'description' => $class->description,
                    'academic_year' => $class->academic_year,
                    'semester' => $class->semester,
                    'is_active' => $class->is_active,
                    'students_count' => $class->students_count,
                    'created_at' => $class->created_at->format('d M Y'),
                ];
            });

        return Inertia::render('Instructor/Classes/Index', [
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:class_rooms,code',
            'description' => 'nullable|string',
            'academic_year' => 'required|integer|min:2020',
            'semester' => 'required|in:ganjil,genap',
            'is_active' => 'boolean',
        ]);

        ClassRoom::create($validated);

        return back()->with('success', 'Class created successfully!');
    }

    public function update(Request $request, ClassRoom $class)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('class_rooms')->ignore($class->id),
            ],
            'description' => 'nullable|string',
            'academic_year' => 'required|integer|min:2020',
            'semester' => 'required|in:ganjil,genap',
            'is_active' => 'boolean',
        ]);

        $class->update($validated);

        return back()->with('success', 'Class updated successfully!');
    }

    public function destroy(ClassRoom $class)
    {
        // Check if class has students
        if ($class->students()->exists()) {
            return back()->with('error', 'Cannot delete class with students. Please move students first.');
        }

        $class->delete();

        return back()->with('success', 'Class deleted successfully!');
    }
}
