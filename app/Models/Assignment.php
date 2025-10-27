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
        'deadline',
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

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
