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
        'tasks',               // ← kolom JSON daftar tugas praktikum
        'deadline',
        'point_reward_early',
        'point_reward_ontime',
        'point_reward_late',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'tasks'     => 'array',    // ← cast otomatis JSON ↔ PHP array
            'deadline'  => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    // ── Relasi ────────────────────────────────────────────────────────────────

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function submissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    public function classDeadlines()
    {
        return $this->hasMany(AssignmentClassDeadline::class);
    }

    // ── Pembantu Deadline ─────────────────────────────────────────────────────

    /**
     * Ambil deadline untuk kelas tertentu.
     * Jika tidak ada deadline kelas, gunakan deadline default.
     */
    public function getDeadlineForClass($classId)
    {
        $classDeadline = $this->classDeadlines()
            ->where('class_id', $classId)
            ->first();

        return $classDeadline ? $classDeadline->deadline : $this->deadline;
    }

    /**
     * Ambil deadline untuk mahasiswa berdasarkan kelasnya.
     */
    public function getDeadlineForStudent($studentId)
    {
        $student = \App\Models\User::with('classes')->find($studentId);

        if (!$student || $student->classes->isEmpty()) {
            return $this->deadline;
        }

        $classId = $student->classes->first()->id;
        return $this->getDeadlineForClass($classId);
    }

    // ── Scope ─────────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
