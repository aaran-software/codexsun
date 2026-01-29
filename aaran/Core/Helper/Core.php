<?php


namespace Aaran\Assets\Helper;

use NumberFormatter;

class Core
{
    public static function greetings(): string
    {
        date_default_timezone_set("Asia/Kolkata");

        $time = date("H");

        if ($time < "12") {
            return "Good morning";
        } else

            /* If the time is grater than or equal to 1200 hours, but less than 1700 hours, so good afternoon */
            if ($time >= "12" && $time < "17") {
                return "Good afternoon";
            } else

                /* Should the time be between or equal to 1700 and 1900 hours, show good evening */
                if ($time >= "17" && $time < "19") {
                    return "Good evening";
                } else

                    /* Finally, show good night if the time is greater than or equal to 1900 hours */
                    if ($time >= "19") {
                        return "Good night";
                    }
        return "Good day";
    }
}
