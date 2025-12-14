<?php

namespace Aaran\Assets\Helper;

use chillerlan\QRCode\{QRCode, QROptions};
use chillerlan\QRCode\Data\QRMatrix;
use chillerlan\QRCode\Output\QRMarkupHTML;

class qrcoder
{
    public static function generate($qrcode,$version=null)
    {
        $options = new QROptions;
        if ($version !== null) {
        $options->version = $version;
        }else{
        $options->version = 5;

        }
        $options->outputInterface = QRMarkupHTML::class;
        $options->cssClass = 'qrcode';
        $options->moduleValues = [
            // finder
            QRMatrix::M_FINDER_DARK => '', // dark (true)
            QRMatrix::M_FINDER_DOT => '', // finder dot, dark (true)
            QRMatrix::M_FINDER => '', // light (false)
            // alignment
            QRMatrix::M_ALIGNMENT_DARK => '',
            QRMatrix::M_ALIGNMENT => '',
        ];


        return (new QRCode($options))->render($qrcode);
    }

}
