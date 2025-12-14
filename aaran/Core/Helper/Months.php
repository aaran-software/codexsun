<?php

namespace Aaran\Assets\Helper;

class Months
{
    public static function months()
    {

        for ($m=1; $m<=12; $m++) {
            $month[] = date('F', mktime(0,0,0,$m, 1, date('Y')));
        }
        return $month;
    }
}
