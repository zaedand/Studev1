<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserCpmk extends Model
{
    protected $fillable = [
        'user_id',
        'module_id',
        'module_cpmk_id',
        'is_completed',
        'points_earned',
        'completed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function moduleCpmk()
    {
        return $this->belongsTo(ModuleCpmk::class);
    }
}
