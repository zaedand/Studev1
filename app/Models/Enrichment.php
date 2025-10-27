<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrichment extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'title',
        'description',
        'type',
        'url',
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

    // Scopes
    public function scopeVideos($query)
    {
        return $query->where('type', 'video');
    }

    public function scopeLinks($query)
    {
        return $query->where('type', 'link');
    }
}
