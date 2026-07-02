<?php
namespace Espo\Custom\FormulaFunctions;

use Espo\Core\Formula\Func;
use Espo\Core\Formula\EvaluatedArgumentList;
use Espo\Core\Formula\Exceptions\TooFewArguments;

class NumberToWords implements Func
{
    private array $ones = [
        0 => '', 1 => 'One', 2 => 'Two', 3 => 'Three', 4 => 'Four',
        5 => 'Five', 6 => 'Six', 7 => 'Seven', 8 => 'Eight', 9 => 'Nine',
        10 => 'Ten', 11 => 'Eleven', 12 => 'Twelve', 13 => 'Thirteen',
        14 => 'Fourteen', 15 => 'Fifteen', 16 => 'Sixteen', 17 => 'Seventeen',
        18 => 'Eighteen', 19 => 'Nineteen',
    ];

    private array $tens = [
        2 => 'Twenty', 3 => 'Thirty', 4 => 'Forty', 5 => 'Fifty',
        6 => 'Sixty', 7 => 'Seventy', 8 => 'Eighty', 9 => 'Ninety',
    ];

    public function process(EvaluatedArgumentList $arguments): mixed
    {
        if (count($arguments) < 1) {
            throw TooFewArguments::create(1);
        }

        $number = $arguments[0];

        if ($number === null) {
            return '';
        }

        $number = (float) $number;
        $isNegative = $number < 0;
        $number = abs($number);

        $intPart = (int) floor($number);

        $words = $this->convertInteger($intPart);

        if ($isNegative) {
            $words = 'Negative ' . $words;
        }

        return $words;
    }

    private function convertInteger(int $number): string
    {
        if ($number === 0) {
            return 'Zero';
        }

        // International grouping: billion, million, thousand
        $groups = [
            1000000000 => 'Billion',
            1000000 => 'Million',
            1000 => 'Thousand',
        ];

        $result = [];

        foreach ($groups as $value => $label) {
            if ($number >= $value) {
                $count = intdiv($number, $value);
                $number %= $value;
                $result[] = $this->convertHundreds($count) . ' ' . $label;
            }
        }

        if ($number > 0) {
            $result[] = $this->convertHundreds($number);
        }

        return trim(implode(' ', $result));
    }

    private function convertHundreds(int $number): string
    {
        $parts = [];

        if ($number >= 100) {
            $parts[] = $this->ones[intdiv($number, 100)] . ' Hundred';
            $number %= 100;
        }

        if ($number >= 20) {
            $tensWord = $this->tens[intdiv($number, 10)];
            $remainder = $number % 10;
            $parts[] = $remainder > 0 ? $tensWord . '-' . $this->ones[$remainder] : $tensWord;
        } elseif ($number > 0) {
            $parts[] = $this->ones[$number];
        }

        return implode(' ', $parts);
    }
}