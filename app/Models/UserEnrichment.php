<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserEnrichment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'enrichment_id',
        'watched_videos',
        'completed',
        'completed_at',
    ];

    protected $casts = [
        'watched_videos' => 'array', // menyimpan ID video yang sudah ditonton
        'completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    // Relasi ke user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke enrichment
    public function enrichment()
    {
        return $this->belongsTo(Enrichment::class);
    }
}
