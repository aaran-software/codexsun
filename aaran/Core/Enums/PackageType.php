<?php

namespace Aaran\Assets\Enums;

enum PackageType: int
{
    case BoxesandCrates = 1;
    case Pallets = 2;
    case Drums = 3;
    case Containers = 4;
    case Looseorunpackedpackaging = 5;
    case CardboardFiberboard = 6;
    case BaggedCargo = 7;
    case WoodenCases =8;
    case WoodenCrates =9;
    case SteelDrums =10;
    case Bales =11;
    case PalletizingCargo =12;

    public function getName(): string
    {
        return match ($this) {
            self::BoxesandCrates => 'Boxes and Crates',
            self::Pallets => 'Pallets',
            self::Drums => 'Drums',
            self::Containers => 'Containers',
            self::Looseorunpackedpackaging => 'Loose or unpacked packaging',
            self::CardboardFiberboard => 'Cardboard/Fiberboard',
            self::BaggedCargo => 'Bagged Cargo',
            self::WoodenCases => 'Wooden Cases',
            self::WoodenCrates => 'Wooden Crates',
            self::SteelDrums => 'Steel Drums',
            self::Bales => 'Bales',
            self::PalletizingCargo => 'Palletizing Cargo',
        };
    }
}

