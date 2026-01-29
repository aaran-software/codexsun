<?php

namespace Aaran\Assets\Helper;


use Illuminate\Support\Facades\DB;

class RefactorMigrationTable
{
    public static function clear($table = null): void
    {
        if ($table != null) {

            DB::table('migrations')
                ->where('migration', '=', $table)
                ->delete();
        }
    }
}
