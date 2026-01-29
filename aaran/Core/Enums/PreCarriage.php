<?php

namespace Aaran\Assets\Enums;

enum PreCarriage: int
{
    case Car = 1;
    case Truck = 2;
    case Train = 3;
    case Ship = 4;

    public function getName(): string
    {
        return match ($this) {
            self::Car => 'Car',
            self::Truck => 'Truck',
            self::Train => 'Train',
            self::Ship => 'Ship',
        };
    }
}

