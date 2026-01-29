<?php


namespace Aaran\Assets\Helper;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class Slogan
{
    public static function quotes()
    {
        return [
            [
                'quote' => 'When there is no desire, all things are at peace.'
            ],
            [
                'quote' => 'Simplicity is the ultimate sophistication.'
            ],
            [
                'quote' => 'Simplicity is the essence of happiness.'
            ], [
                'quote' => 'Smile, breathe, and go slowly.'
            ], [
                'quote' => 'Simplicity is an acquired taste.'
            ], [
                'quote' => 'Well begun is half done.'
            ], [
                'quote' => 'He who is contented is rich.'
            ], [
                'quote' => 'Very little is needed to make a happy life.'
            ], [
                'quote' => 'It is quality rather than quantity that matters.'
            ], [
                'quote' => 'Genius is one percent inspiration and ninety-nine percent perspiration.'
            ], [
                'quote' => 'Computer science is no more about computers than astronomy is about telescopes.'
            ], [
                'quote' => 'It always seems impossible until it is done.'
            ], [
                'quote' => 'Act only according to that maxim whereby you can, at the same time, will that it should become a universal law.'
            ], [
                'quote' => 'Don’t judge each day by the harvest you reap but by the seeds that you plant.'
            ], [
                'quote' => 'Write it on your heart that every day is the best day in the year.'
            ], [
                'quote' => 'Every moment is a fresh beginning.'
            ], [
                'quote' => 'Without His love I can do nothing, with His love there is nothing I cannot do.'
            ], [
                'quote' => 'Everything you’ve ever wanted is on the other side of fear.'
            ], [
                'quote' => 'Begin at the beginning... and go on till you come to the end: then stop.'
            ], [
                'quote' => 'Knowing others is intelligence; knowing yourself is true wisdom.'
            ],
        ];
    }

    public static function getRandomQuote()
    {
        $quote = Collection::make(self::quotes())->random();
        return $quote['quote'];
    }
}
