<?php

namespace Aaran\Assets\Enums;

enum Software: int
{
    case DEVELOPER = 1;
    case GARMENTS = 2;
    case OFFSET = 3;
    case UPVC = 4;

    public function getName(): string
    {
        return match ($this) {
            self::DEVELOPER => 'DEVELOPER',
            self::GARMENTS => 'GARMENTS',
            self::OFFSET => 'OFFSET',
            self::UPVC => 'UPVC',
        };
    }

    public function getCode(): string
    {
        return match ($this) {
            self::DEVELOPER => '100',
            self::GARMENTS => '200',
            self::OFFSET => '300',
            self::UPVC => '400',
        };
    }
}

