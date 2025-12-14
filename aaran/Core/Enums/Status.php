<?php

namespace Aaran\Assets\Enums;

enum Status : int
{
    case NEW = 1;
    case PENDING = 2;
    case ONPROGRESS = 3;
    case NOTSTARTED = 4;
    case ARCHIVED = 5;
    case FINISHED = 6;
    case CLOSED = 7;
    case IMPORTANT = 8;
    case PRIORITY = 9;
    case TOPMOST = 10;
    case NOTACTIVE = 11;
    case RECEIVED = 12;
    case ADMINCLOSED = 100;

    public function getName(): string
    {
        return match ($this) {
            self::NEW => 'New',
            self::PENDING => 'Pending',
            self::ONPROGRESS => 'On Progress',
            self::NOTSTARTED => 'Notstarted',
            self::ARCHIVED => 'Archived',
            self::FINISHED => 'Finished',
            self::CLOSED => 'Closed',
            self::IMPORTANT => 'Important',
            self::PRIORITY => 'Priority',
            self::TOPMOST => 'Topmost',
            self::NOTACTIVE => 'NotActive',
            self::RECEIVED => 'Received',
            self::ADMINCLOSED => 'Sundar Closed',
        };
    }

    public function getStyle(): string
    {
        return match ($this) {
            self::NEW => 'text-white bg-blue-600',
            self::PENDING => 'text-white bg-gray-600',
            self::ONPROGRESS => 'text-black bg-blue-300',
            self::NOTSTARTED => 'text-gray-100 bg-gray-500',
            self::ARCHIVED => 'text-red-200 bg-slate-300',
            self::FINISHED => 'text-white bg-green-500',
            self::CLOSED => 'text-black bg-green-400',
            self::IMPORTANT => 'text-yellow-700 bg-yellow-500',
            self::PRIORITY => 'text-white bg-yellow-600',
            self::TOPMOST => 'text-red-700 bg-red-300',
            self::NOTACTIVE => 'text-zinc-200 bg-red-700',
            self::RECEIVED => 'text-white bg-green-600',
            self::ADMINCLOSED => 'text-black bg-purple-100',
        };
    }

    public function getTextStyle(): string
    {
        return match ($this) {
            self::NEW => 'text-blue-600',
            self::PENDING => 'text-gray-600',
            self::ONPROGRESS => 'text-blue-300',
            self::NOTSTARTED => 'text-gray-500',
            self::ARCHIVED => 'text-slate-300',
            self::FINISHED => 'text-green-500',
            self::CLOSED => 'text-green-400',
            self::IMPORTANT => 'text-yellow-500',
            self::PRIORITY => 'text-yellow-600',
            self::TOPMOST => 'text-red-300',
            self::NOTACTIVE => 'text-red-700',
            self::RECEIVED => 'text-green-600',
            self::ADMINCLOSED => 'text-purple-100',
        };
    }

}
