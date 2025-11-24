<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'title',
        'description',
        'deadline', // Default deadline (optional, for backward compatibility)
        'point_reward_early',
        'point_reward_ontime',
        'point_reward_late',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'deadline' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function submissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    /**
     * Classes with their specific deadlines
     */
    public function classDeadlines()
    {
        return $this->hasMany(AssignmentClassDeadline::class);
    }

    /**
     * Get deadline for specific class
     */
    public function getDeadlineForClass($classId)
    {
        $classDeadline = $this->classDeadlines()
            ->where('class_id', $classId)
            ->first();

        return $classDeadline ? $classDeadline->deadline : $this->deadline;
    }

    /**
     * Get deadline for student (based on their class)
     */
    public function getDeadlineForStudent($studentId)
    {
        $student = \App\Models\User::with('classes')->find($studentId);

        if (!$student || $student->classes->isEmpty()) {
            return $this->deadline; // Default deadline
        }

        // Get first class deadline (assuming student is in one class per course)
        $classId = $student->classes->first()->id;
        return $this->getDeadlineForClass($classId);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
