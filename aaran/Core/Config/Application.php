<?php

namespace Aaran\Core\Config;

class Application
{
    public const AppName = 'Codexsun';
    public const AppVersion = '1.0.0';
    public const AppCompanyName = 'Aaran Software';
    public const AppCompanyAddress_1 = 'No.36, M.C.B.Blossom Rich Street';
    public const AppCompanyAddress_2 = 'Mettupalayam';
    public const AppCompanyAddress_3 = 'Avadi';
    public const AppCompanyAddress_4 = 'Chennai - 600077';
    public const AppCompanyAddress_5 = 'Tamilnadu, India';
    public const AppCompanyEmail = 'info@aaransofware.com';
    public const AppCompanyMobile = '+91 9655227767';
    public const AppTrialPeriod = '7- days';

    const VERSION = '1.0.0';

    public static function version(): string
    {
        return self::VERSION;
    }

}
