<?php

namespace Aaran\Assets\Enums;

enum Active: int
{
    case ACTIVE = 1;
    case NOT_ACTIVE = 2;
    case UNKNOW = 3;

    public function getName(): string
    {
        return match ($this) {
            self::ACTIVE => 'Active',
            self::NOT_ACTIVE => 'Not_active',
            self::UNKNOW => 'Unknow',
        };
    }

    public function getStyle(): string
    {
        return match ($this) {
            self::ACTIVE => 'bg-green-500 text-green-700',
            self::NOT_ACTIVE => 'bg-red-500 text-red-700',
            self::UNKNOW => 'bg-gray-500 text-gray-700',
        };
    }
}
