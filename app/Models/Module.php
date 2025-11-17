<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'order_number',
        'cp_atp',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order_number' => 'integer',
    ];

    // Relationships
    public function materials()
    {
        return $this->hasMany(Material::class);
    }

    public function enrichments()
    {
        return $this->hasMany(Enrichment::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function cpmks()
    {
        return $this->hasMany(ModuleCpmk::class);
    }

    public function learningObjectives()
    {
        return $this->hasMany(ModuleLearningObjective::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order_number');
    }
}
