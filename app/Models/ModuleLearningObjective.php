<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModuleLearningObjective extends Model
{
    protected $fillable = [
        'module_id',
        'content',
        'point_reward',
    ];

    protected $casts = [
        'content' => 'array',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function userProgress()
    {
        return $this->hasMany(UserLearningObjective::class);
    }

    public function isCompletedBy($userId)
    {
        return $this->userProgress()
            ->where('user_id', $userId)
            ->where('is_completed', true)
            ->exists();
    }
}
