<?php

namespace Aaran\Assets\Enums;

enum PaymentMethod: int
{
    case CASH = 1;
    case CHEQUE = 2;
    case DEMAND_DRAFT = 3;
    case UPI = 4;
    case PhonePe = 5;
    case GPay = 6;
    case Paytm = 7;
    case RTGS = 8;
    case NEFT = 9;
    case IMPS = 10;
    case BANK_TRANSFER = 11;
    case CREDIT_CARD = 12;
    case DEBIT_CARD = 13;
    case UNKNOWN = 14;

    public function getName(): string
    {
        return match ($this) {
            self::CASH => 'Cash',
            self::CHEQUE => 'Cheque',
            self::DEMAND_DRAFT => 'Demand draft -(DD)',
            self::UPI => 'Upi',
            self::PhonePe => 'PhonePe',
            self::GPay => 'GPay',
            self::Paytm => 'Paytm',
            self::RTGS => 'RTGS',
            self::NEFT => 'NEFT',
            self::IMPS => 'IMPS',
            self::BANK_TRANSFER => 'Bank transfer',
            self::CREDIT_CARD => 'Credit card',
            self::DEBIT_CARD => 'Debit card',
            self::UNKNOWN => 'Unknown',
        };
    }
}
