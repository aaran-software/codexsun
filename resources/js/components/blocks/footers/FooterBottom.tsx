'use client';

interface Props {
    companyName: string;
}

export default function FooterBottom({ companyName }: Props) {
    const currentYear = new Date().getFullYear();

    return (
        <div className="text-center">
            <p className="text-xs text-gray-300">
                © {currentYear} {companyName}. All rights reserved.
            </p>
        </div>
    );
}
