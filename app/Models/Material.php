<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'title',
        'file_path',
        'point_reward',
    ];

    // Relationships
    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function userProgress()
    {
        return $this->morphMany(UserProgress::class, 'progressable');
    }
}
