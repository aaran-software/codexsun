<?php

if (!function_exists('tenant')) {
    function tenant()
    {
        return app()->bound('currentTenant')
            ? app('currentTenant')
            : null;
    }
}
