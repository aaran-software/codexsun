<?php

namespace Aaran\Core\Features;

class Customise
{
    public static function enabled(string $feature): bool
    {
        return match (config('aaran-app.app_code')) {

            config('software.DEVELOPER') => in_array($feature, config('developer.customise', [])),
            config('software.OFFSET') => in_array($feature, config('offset.customise', [])),
            default => false, // Handle NULL and unexpected cases
        };
    }

    public static function hasCommon(): bool
    {
        return static::enabled(static::common());
    }

    public static function common(): string
    {
        return 'common';
    }

    public static function hasTemp(): bool
    {
        return static::enabled(static::temp());
    }

    public static function temp(): string
    {
        return 'temp';
    }

    public static function hasMAster(): bool
    {
        return static::enabled(static::master());
    }

    public static function master(): string
    {
        return 'company';
    }

    public static function hasEntries(): bool
    {
        return static::enabled(static::entries());
    }

    public static function entries(): string
    {
        return 'entries';
    }

    public static function hasBlog(): bool
    {
        return static::enabled(static::blog());
    }

    public static function blog(): string
    {
        return 'blog';
    }

    public static function hasTaskManager(): bool
    {
        return static::enabled(static::taskManager());
    }

    public static function taskManager(): string
    {
        return 'taskManager';
    }

    public static function hasCore(): bool
    {
        return static::enabled(static::core());
    }

    public static function core(): string
    {
        return 'core';
    }

    public static function hasGstApi(): bool
    {
        return static::enabled(static::gstapi());
    }

    public static function gstapi(): string
    {
        return 'gstapi';
    }

    public static function hasTransaction(): bool
    {
        return static::enabled(static::transaction());
    }

    public static function transaction(): string
    {
        return 'transaction';
    }

    public static function hasDemoData(): bool
    {
        return static::enabled(static::demoData());
    }

    public static function demoData(): string
    {
        return 'demoData';
    }

    public static function hasExportSales(): bool
    {
        return static::enabled(static::exportSales());
    }

    public static function exportSales(): string
    {
        return 'exportSales';
    }

    public static function hasReport(): bool
    {
        return static::enabled(static::report());
    }

    public static function report(): string
    {
        return 'report';
    }

    public static function hasLogbook(): bool
    {
        return static::enabled(static::logbooks());
    }

    public static function logbooks(): string
    {
        return 'logbooks';
    }

    public static function hasBooks(): bool
    {
        return static::enabled(static::books());
    }

    public static function books(): string
    {
        return 'books';
    }

    public static function hasSales(): bool
    {
        return static::enabled(static::sales());
    }

    public static function sales(): string
    {
        return 'sales';
    }
}
