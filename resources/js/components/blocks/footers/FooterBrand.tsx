'use client';

import AppLogoIcon from '@/components/app-logo-icon';

interface Props {
    companyName: string;
    tagline: string;
}

export default function FooterBrand({ companyName, tagline }: Props) {
    return (
        <div>
            <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-white p-1">
                    <AppLogoIcon className="h-7 w-7 fill-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-white">{companyName}</h3>
            </div>

            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-400">
                {tagline}
            </p>
        </div>
    );
}
