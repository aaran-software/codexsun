<?php

namespace Aaran\Core\Industry;

class Industry
{
    public static function current(): string
    {
        return config('aaran-app.app_code');
    }

    public static function key(): ?string
    {
        return array_search(
            static::current(),
            config('software'),
            true
        ) ?: null;
    }
}
