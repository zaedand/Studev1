<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add missing columns to materials table
        if (Schema::hasTable('materials') && !Schema::hasColumn('materials', 'point_reward')) {
            Schema::table('materials', function (Blueprint $table) {
                $table->integer('point_reward')->default(10)->after('file_path');
            });
        }

        // Add missing columns to enrichments table
        if (Schema::hasTable('enrichments') && !Schema::hasColumn('enrichments', 'point_reward')) {
            Schema::table('enrichments', function (Blueprint $table) {
                $table->integer('point_reward')->default(5)->after('url');
            });
        }

        // Add missing columns to assignments table
        if (Schema::hasTable('assignments')) {
            if (!Schema::hasColumn('assignments', 'point_reward_early')) {
                Schema::table('assignments', function (Blueprint $table) {
                    $table->integer('point_reward_early')->default(20)->after('deadline');
                });
            }

            if (!Schema::hasColumn('assignments', 'point_reward_ontime')) {
                Schema::table('assignments', function (Blueprint $table) {
                    $table->integer('point_reward_ontime')->default(15)->after('point_reward_early');
                });
            }

            if (!Schema::hasColumn('assignments', 'point_reward_late')) {
                Schema::table('assignments', function (Blueprint $table) {
                    $table->integer('point_reward_late')->default(5)->after('point_reward_ontime');
                });
            }
        }

        // Add time_limit to quizzes table if missing
        if (Schema::hasTable('quizzes') && !Schema::hasColumn('quizzes', 'time_limit')) {
            Schema::table('quizzes', function (Blueprint $table) {
                $table->integer('time_limit')->default(30)->after('point_per_question');
            });
        }

        // Add max_attempts to quizzes table if missing
        if (Schema::hasTable('quizzes') && !Schema::hasColumn('quizzes', 'max_attempts')) {
            Schema::table('quizzes', function (Blueprint $table) {
                $table->integer('max_attempts')->default(3)->after('time_limit');
            });
        }

        // Update modules table to add cp_atp field if missing
        if (Schema::hasTable('modules') && !Schema::hasColumn('modules', 'cp_atp')) {
            Schema::table('modules', function (Blueprint $table) {
                $table->text('cp_atp')->nullable()->after('description');
            });
        }
    }

    public function down()
    {
        // Remove added columns
        if (Schema::hasTable('materials') && Schema::hasColumn('materials', 'point_reward')) {
            Schema::table('materials', function (Blueprint $table) {
                $table->dropColumn('point_reward');
            });
        }

        if (Schema::hasTable('enrichments') && Schema::hasColumn('enrichments', 'point_reward')) {
            Schema::table('enrichments', function (Blueprint $table) {
                $table->dropColumn('point_reward');
            });
        }

        if (Schema::hasTable('assignments')) {
            $columnsToRemove = ['point_reward_early', 'point_reward_ontime', 'point_reward_late'];
            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('assignments', $column)) {
                    Schema::table('assignments', function (Blueprint $table) use ($column) {
                        $table->dropColumn($column);
                    });
                }
            }
        }

        if (Schema::hasTable('quizzes')) {
            $columnsToRemove = ['time_limit', 'max_attempts'];
            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('quizzes', $column)) {
                    Schema::table('quizzes', function (Blueprint $table) use ($column) {
                        $table->dropColumn($column);
                    });
                }
            }
        }

        if (Schema::hasTable('modules') && Schema::hasColumn('modules', 'cp_atp')) {
            Schema::table('modules', function (Blueprint $table) {
                $table->dropColumn('cp_atp');
            });
        }
    }
};
