<?php

namespace Aaran\Assets\Enums;

enum TransportMode: int
{
    case Road = 1;
    case Rail = 2;
    case Air = 3;
    case Ship = 4;

    public function getName(): string
    {
        return match ($this) {
            self::Road => 'Road',
            self::Rail => 'Rail',
            self::Air => 'Air',
            self::Ship => 'Ship',
        };
    }
}

