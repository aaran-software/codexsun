<?php

namespace Aaran\Assets\Enums;

enum Acyear: int
{
    case AY_2020_21 = 1;
    case AY_2021_22 = 2;
    case AY_2022_23 = 3;
    case AY_2023_24 = 4;
    case AY_2024_25 = 5;
    case AY_2025_26 = 6;
    case AY_2026_27 = 7;
    case AY_2027_28 = 8;
    case AY_2028_29 = 9;
    case AY_2029_30 = 10;
    case AY_2030_31 = 11;
    case AY_2031_32 = 12;
    case AY_2032_33 = 13;
    case AY_2033_34 = 14;
    case AY_2034_35 = 15;


    public function getName(): string
    {
        return match ($this) {
            self::AY_2020_21 => '2020-2021',
            self::AY_2021_22 => '2021-2022',
            self::AY_2022_23 => '2022-2023',
            self::AY_2023_24 => '2023-2024',
            self::AY_2024_25 => '2024-2025',
            self::AY_2025_26 => '2025-2026',
            self::AY_2026_27 => '2026-2027',
            self::AY_2027_28 => '2027-2028',
            self::AY_2028_29 => '2028-2029',
            self::AY_2029_30 => '2029-2030',
            self::AY_2030_31 => '2030-2031',
            self::AY_2031_32 => '2031-2032',
            self::AY_2032_33 => '2032-2033',
            self::AY_2033_34 => '2033-2034',
            self::AY_2034_35 => '2034-2035',
        };
    }
}
