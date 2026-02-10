<?php

namespace Aaran\Core\Features;

use Aaran\Core\Industry\Industry;

class Customise
{
    protected static function features(): array
    {
        $industryKey = strtolower(Industry::key() ?? '');

        return config("industries.{$industryKey}.features", []);
    }

    public static function enabled(string $feature): bool
    {
        return in_array($feature, static::features(), true);
    }

    // ---------- Feature Keys ----------
    public static function common(): string
    {
        return 'common';
    }

    public static function master(): string
    {
        return 'company';
    }

    public static function entries(): string
    {
        return 'entries';
    }

    public static function blog(): string
    {
        return 'blog';
    }

    public static function core(): string
    {
        return 'core';
    }

    public static function gstapi(): string
    {
        return 'gstapi';
    }

    public static function transaction(): string
    {
        return 'transaction';
    }

    public static function report(): string
    {
        return 'report';
    }

    public static function logbooks(): string
    {
        return 'logbooks';
    }

    public static function books(): string
    {
        return 'books';
    }

    // ---------- Helpers ----------
    public static function has(string $feature): bool
    {
        return static::enabled($feature);
    }
}
