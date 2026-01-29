<?php

namespace Aaran\Assets\Enums;

enum MsmeType: int
{
    case MICRO = 1;
    case SMALL = 2;
    case MEDIUM = 3;

    public function getName(): string
    {
        return match ($this) {
            self::MICRO => 'Micro',
            self::SMALL => 'Small',
            self::MEDIUM => 'Medium',
        };
    }
}
