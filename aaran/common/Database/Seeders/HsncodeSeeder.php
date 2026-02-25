<?php

namespace Aaran\Common\Database\Seeders;

use Aaran\Common\Models\Hsncode;
use Illuminate\Database\Seeder;

class HsncodeSeeder extends Seeder
{
    public static function run(): void
    {
        $hsnCodes = [
            ['-', '-'],
            ['610910', 'T-shirts, singlets, and vests (cotton)'],
            ['610990', 'T-shirts, singlets, and vests (other textiles)'],
            ['610821', 'Women’s briefs and panties (cotton)'],
            ['610831', 'Men’s briefs and boxers (cotton)'],
            ['611011', 'Sweaters, pullovers, cardigans (wool)'],
            ['611020', 'Sweaters, pullovers, cardigans (cotton)'],
            ['611030', 'Sweaters, pullovers, cardigans (synthetic fibers)'],
            ['611120', 'Babies’ garments and clothing accessories (cotton)'],
            ['611130', 'Babies’ garments and clothing accessories (synthetic)'],
            ['620111', 'Men’s overcoats, raincoats (wool)'],
            ['620112', 'Men’s overcoats, raincoats (cotton)'],
            ['620211', 'Women’s overcoats, raincoats (wool)'],
            ['620212', 'Women’s overcoats, raincoats (cotton)'],
            ['621111', 'Track suits (cotton)'],
            ['621112', 'Track suits (synthetic fibers)'],
            ['630900', 'Worn clothing and other worn textile articles'],

            // Yarn & Threads
            ['520511', '30s combed cotton yarn (single)'],
            ['520512', '30s semi-combed cotton yarn (multiple)'],
            ['520513', 'Cotton sewing thread (stitching thread)'],
            ['540110', 'Sewing thread of synthetic filaments'],
            ['520611', 'Cotton yarn (uncombed, less than 85% cotton)'],
            ['520612', 'Cotton yarn (combed, less than 85% cotton)'],
            ['550810', 'Sewing thread of synthetic staple fibers'],
            ['550820', 'Sewing thread of artificial staple fibers'],
        ];

        foreach ($hsnCodes as [$code, $description]) {
            Hsncode::create([
                'name' => $code,
                'description' => $description,
                'active_id' => '1',
            ]);
        }
    }
}
