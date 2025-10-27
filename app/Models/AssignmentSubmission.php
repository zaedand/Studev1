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
        'points_earned',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
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
    public function scopeEarly($query)
    {
        return $query->where('status', 'early');
    }

    public function scopeOnTime($query)
    {
        return $query->where('status', 'ontime');
    }

    public function scopeLate($query)
    {
        return $query->where('status', 'late');
    }
}
