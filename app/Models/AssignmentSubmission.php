<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssignmentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'assignment_id',
        'file_path',
        'notes',
        'status',
        'score',
        'feedback',
        'points_earned',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'score' => 'integer',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    // Scopes
    public function scopeGraded($query)
    {
        return $query->whereNotNull('score');
    }

    public function scopeUngraded($query)
    {
        return $query->whereNull('score');
    }

    public function scopeLate($query)
    {
        return $query->whereHas('assignment', function($q) {
            $q->whereRaw('assignment_submissions.submitted_at > assignments.deadline');
        });
    }

    public function scopeOnTime($query)
    {
        return $query->whereHas('assignment', function($q) {
            $q->whereRaw('assignment_submissions.submitted_at <= assignments.deadline');
        });
    }

    // Accessors
    public function getIsGradedAttribute(): bool
    {
        return !is_null($this->score);
    }

    public function getIsLateAttribute(): bool
    {
        if (!$this->assignment) {
            return false;
        }
        return $this->submitted_at > $this->assignment->deadline;
    }

    public function getSubmissionStatusAttribute(): string
    {
        if ($this->is_graded) {
            return 'graded';
        }

        if ($this->is_late) {
            return 'late';
        }

        return 'submitted';
    }

    // Mutators - Ensure score is within valid range
    public function setScoreAttribute($value)
    {
        $this->attributes['score'] = $value !== null ? max(0, min(100, (int)$value)) : null;
    }

    // Helper methods
    public function getDaysFromDeadline(): int
    {
        if (!$this->assignment) {
            return 0;
        }

        return $this->submitted_at->diffInDays($this->assignment->deadline, false);
    }

    public function getFormattedSubmissionTime(): string
    {
        if (!$this->assignment) {
            return 'N/A';
        }

        $days = abs($this->getDaysFromDeadline());

        if ($this->is_late) {
            return "Terlambat {$days} hari";
        }

        if ($days > 0) {
            return "{$days} hari lebih awal";
        }

        return "Tepat waktu";
    }
}
