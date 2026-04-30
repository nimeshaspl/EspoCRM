<?php

/*
 * This file is part of the Dubas Google Fonts - EspoCRM extension.
 *
 * DUBAS S.C. - contact@dubas.pro
 * Copyright (C) 2022 Arkadiy Asuratov, Emil Dubielecki
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

namespace Espo\Modules\DubasGoogleFonts\Tools\Pdf\Tcpdf;

use Espo\Core\Container;
use Espo\Core\InjectableFactory;
use Espo\Core\Utils\Metadata;
use Espo\Core\Utils\Resource\PathProvider;
use TCPDF_FONTS;

class ApplyFonts
{
    private $container;

    private $dirPath = 'fonts';

    private $tcpdfFontsDir = 'vendor/tecnickcom/tcpdf/fonts';

    private $fontStyleList = [
        'regular', 'bold', 'italic', 'bolditalic',
    ];

    private $fontStylesMap = [
        'regular' => '',
        'bold' => 'b',
        'italic' => 'i',
        'bolditalic' => 'bi',
    ];

    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    public function rebuild(): void
    {
        $fontList = $this->getFileList();

        $fontFaceList = $this->getMetadata()
            ->get(['app', 'pdfEngines', 'Tcpdf', 'fontFaceList']);

        foreach ($fontFaceList as $fontFace) {
            foreach ($this->fontStyleList as $fontStyle) {
                $fontName = $fontFace . '-' . $fontStyle;

                if (empty($fontList[$fontName])) {
                    continue;
                }

                $targetFontPath = $this->tcpdfFontsDir . '/' . $fontFace . $this->fontStylesMap[$fontStyle] . '.php';
                if (file_exists($targetFontPath)) {
                    continue;
                }

                TCPDF_FONTS::addTTFfont(
                    realpath($fontList[$fontName]),
                    'TrueType',
                    '',
                    32,
                    realpath($this->tcpdfFontsDir) . '/',
                    3,
                    1,
                    false,
                    false
                );
            }
        }
    }

    protected function getDirList(): array
    {
        $dirList = [];
        foreach ($this->getMetadata()->getModuleList() as $moduleName) {
            $dirList[] = $this->createPathProvider()->getModule($moduleName) . $this->dirPath;
        }
        $dirList[] = $this->createPathProvider()->getCustom() . $this->dirPath;

        return $dirList;
    }

    protected function getFileList(): array
    {
        $dirList = $this->getDirList();

        $fileList = [];
        foreach ($dirList as $dir) {
            $fontList = scandir($dir);
            foreach ($fontList as $file) {
                if (substr($file, -4) === '.ttf') {
                    $name = mb_strtolower(substr($file, 0, -4));

                    $fileList[$name] = $dir . '/' . $file;
                }
            }
        }

        return $fileList;
    }

    private function getInjectableFactory(): InjectableFactory
    {
        return $this->container->get('injectableFactory');
    }

    private function getMetadata(): Metadata
    {
        return $this->container->get('metadata');
    }

    private function createPathProvider(): PathProvider
    {
        return $this->getInjectableFactory()->create(PathProvider::class);
    }
}
