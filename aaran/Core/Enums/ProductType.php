<?php

namespace Aaran\Assets\Enums;

enum ProductType : int
{
    case GOODS = 1;
    case SERVICE = 2;

    public function getName(): string
    {
        return match ($this) {
            self::GOODS => 'Goods',
            self::SERVICE => 'Service',
        };
    }

    public function getStyle(): string
    {
        return match ($this) {
            self::GOODS => 'text-gray-500 bg-gray-300',
            self::SERVICE => 'text-white bg-gray-600',
        };
    }
    public static function getList(): array
    {
        return array_map(fn($type) => [
            'id' => $type->value,
            'name' => $type->getName()
        ], self::cases());
    }

}
