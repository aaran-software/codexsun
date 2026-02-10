
import * as React from 'react';

export function TTTLogo(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 100 40"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="The Tirupur Textiles"
        >
            <text x="0" y="30" fontSize="28" fontWeight="700">
                TTT
            </text>
        </svg>
    );
}
