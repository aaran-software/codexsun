<?php

use Aaran\Core\Features\Customise;

return [

    'settings' => [
        Customise::common(),
        Customise::master(),
        Customise::entries(),
        Customise::core(),
        Customise::blog(),
        Customise::gstapi(),
        Customise::transaction(),
        Customise::exportSales(),
        Customise::report(),
        Customise::logbooks(),
        Customise::books(),
    ],

    'SalesEntry' => [
//        SaleEntry::despatch(),
//        SaleEntry::eway(),
    ],
];
