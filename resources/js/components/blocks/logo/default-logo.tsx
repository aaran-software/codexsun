
import * as React from 'react';

export function DefaultLogo(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 120 40"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Default Logo"
        >
            <text x="0" y="28" fontSize="24" fontWeight="600">
                APP
            </text>
        </svg>
    );
}
