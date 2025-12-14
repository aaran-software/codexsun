<?php

namespace Aaran\Assets\Enums;

enum Priority: int
{
    case IMPORTANT = 1;
    case PRIORITY = 2;
    case TOPMOST = 3;
    case LOW = 4;
    case MEDIUM = 5;
    case HIGH = 6;

    case MODERATE = 7;

    public function getName(): string
    {
        return match ($this) {
            self::IMPORTANT => 'Important',
            self::PRIORITY => 'Priority',
            self::TOPMOST => 'Topmost',
            self::LOW => 'Low',
            self::MEDIUM => 'Medium',
            self::HIGH => 'High',
            self::MODERATE => 'Moderate',
        };
    }

    public function getStyle(): string
    {
        return match ($this) {
            self::IMPORTANT => 'bg-orange-500 text-white',
            self::PRIORITY => 'bg-red-600 text-white',
            self::TOPMOST => 'bg-purple-600 text-white',
            self::LOW => 'bg-gray-300 text-gray-800',
            self::MEDIUM => 'bg-yellow-300 text-yellow-900',
            self::HIGH => 'bg-red-400 text-white',
            self::MODERATE => 'bg-blue-300 text-blue-900',
        };
    }

    public function getTextStyle(): string
    {
        return match ($this) {
            self::IMPORTANT => 'text-orange-500',
            self::PRIORITY => 'text-red-600',
            self::TOPMOST => 'text-purple-600',
            self::LOW => 'text-gray-300',
            self::MEDIUM => 'text-yellow-300',
            self::HIGH => 'text-red-400',
            self::MODERATE => 'text-blue-300',
        };
    }

}
