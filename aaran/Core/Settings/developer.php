<?php

use Aaran\Core\Features\Customise;

return [

    'customise' => [
        Customise::common(),
        Customise::master(),
        Customise::entries(),
        Customise::core(),
        Customise::blog(),
        Customise::gstapi(),
        Customise::transaction(),
        Customise::report(),
        Customise::logbooks(),
        Customise::books(),
    ],
];
