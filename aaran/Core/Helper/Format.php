<?php

namespace Aaran\Assets\Helper;

class Format
{
    public static function Decimal(?float $value): string
    {
        return ($value == 0 || is_null($value)) ? '' : number_format($value, 2, '.', ',');
    }

    public static function Decimal_3Digit(?float $value): string
    {
        return ($value == 0 || is_null($value)) ? '' : number_format($value, 3, '.', '');
    }
}
