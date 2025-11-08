<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserEnrichment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'module_id',
        'enrichment_id',
        'watched_videos',
        'completed_links',
        'completed',
        'completed_at',
    ];

    protected $casts = [
        'watched_videos' => 'array',
        'completed_links' => 'array',
        'completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function enrichment()
    {
        return $this->belongsTo(Enrichment::class);
    }
}
