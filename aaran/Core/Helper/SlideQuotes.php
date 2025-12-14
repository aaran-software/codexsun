<?php

namespace Aaran\Assets\Helper;

class SlideQuotes
{
    public static function all()
    {
        return [
            [
                'h1' => 'Accounting for <keyword>Growing Businesses</keyword> ',
                'p' => [
                    'Most software gets bookkeeping right,',
                    ' But feels like a maze. We’ve flipped the script: effortless to use, powerful under the hood.',
                ],
                'color' => ['bg' => 'bg-blue-50', 'text' => 'text-blue-500', 'fill' => 'fill-blue-400/70'],
            ],
            [
                'h1' => '<keyword>India’s #1 </keyword>Online GST Billing Software',
                'p' => [
                    'Create, manage and track invoices,',
                    'E-invoices and E-Way bills — all in one secure reliable platform.',
                ],
                'color' => ['bg' => 'bg-red-50','text' => 'text-red-500', 'fill' => 'fill-red-400/70'],
            ],
            [
                'h1' => 'One-stop Solution Workflow <keyword>Management</keyword>',
                'p' => [
                    'Streamline operations, enhance customer experience,',
                    'and share information securely in seconds.',
                ],
                'color' => ['bg' => 'bg-green-50','text' => 'text-green-500', 'fill' => 'fill-green-400/70'],
            ],
            [
                'h1' => 'Real-Time Financial <keyword>Monitoring and Insights</keyword>',
                'p' => [
                    'Track key metrics like revenue, cash flow, and profit ',
                    'All with crystal-clear dashboards updated in real time.',
                ],
                'color' => ['bg' => 'bg-purple-50','text' => 'text-purple-500', 'fill' => 'fill-purple-400/70'],
            ],
            [
                'h1' => 'Smart Inventory and Stock <keyword>Management</keyword>',
                'p' => [
                    'Avoid stockouts and overstocking.',
                    'Get automatic alerts, real-time tracking, and complete inventory visibility.',
                ],
                'color' => ['bg' => 'bg-pink-50','text' => 'text-pink-500', 'fill' => 'fill-pink-400/70'],
            ],
            [
                'h1' => 'Payroll & Compliance, <keyword>simplified</keyword>',
                'p' => [
                    'Generate payslips, manage PF, ESI, and stay compliant',
                    'All automatically, without the headache.
',
                ],
                'color' => ['bg' => 'bg-yellow-50','text' => 'text-yellow-500', 'fill' => 'fill-yellow-400/70'],
            ],
            [
                'h1' => 'Secure Cloud Backup and Data <keyword>Protection</keyword>',
                'p' => [
                    'Your business data is encrypted, backed up, and always accessible.',
                    'We keep it safe — so you can focus on growth.',
                ],
                'color' => ['bg' => 'bg-indigo-50','text' => 'text-indigo-500', 'fill' => 'fill-indigo-400/70'],
            ],
            [
                'h1' => '<keyword>Instant</keyword>Customizable Financial Reports
',
                'p' => [
                    'From tax summaries to balance sheets, generate tailored reports in a single click,',
                    'Anytime you need them.',
                ],
                'color' => ['bg' => 'bg-teal-50','text' => 'text-teal-500', 'fill' => 'fill-teal-400/70'],
            ],
            [
                'h1' => 'Collaborate with Ease <keyword>Multi-User</keyword> Access',
                'p' => [
                    'Add your accountant, partner, or team.',
                    'Work together in real time, securely and efficiently from anywhere.',
                ],
                'color' => ['bg' => 'bg-orange-50','text' => 'text-orange-500', 'fill' => 'fill-orange-400/70'],
            ],
            [
                'h1' => 'Mobile App for Business <keyword>On-the-Go</keyword>',
                'p' => [
                    'Create invoices, check reports, or track payments',
                    'anytime, anywhere — right from your phone.',
                ],
                'color' => ['bg' => 'bg-rose-50','text' => 'text-rose-500', 'fill' => 'fill-rose-400/70'],
            ],
        ];
    }

    public static function highlightKeyword($text, $color)
    {
        return preg_replace_callback('/<keyword>(.*?)<\/keyword>/i', function ($matches) use ($color) {
            $keyword = $matches[1];
            return <<<HTML
                <span class="relative whitespace-nowrap {$color['text']}">

                  <svg aria-hidden="true"
                                     viewBox="0 0 418 42"
                                     class="absolute top-2/3 left-0 h-[0.58em] w-full {$color['fill']}"
                                     preserveAspectRatio="none"><path
                                        d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"></path>
                  </svg>

                    <span class="relative">{$keyword}</span>
                </span>
            HTML;
        }, $text);
    }
}
