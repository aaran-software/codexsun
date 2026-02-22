import React from 'react';

type LogoProps = React.SVGProps<SVGSVGElement>;

export default function CodexsunLogo({ ...props }: LogoProps) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1660.07 1579.62"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            imageRendering="optimizeQuality"
            fillRule="evenodd"
            clipRule="evenodd"
            aria-label="TechMedia Logo"
        >
            <g id="Layer_1">
                {/* You can keep metadata if you want */}
                <metadata id="techmedia" />
                <path
                    fill="currentColor" // ← best practice: use currentColor
                    // fill="#8F1F8D"          // ← uncomment if you want fixed color
                    d="M447.41 266.65l483.58 0 -149 443.46 -484 0 149.42 -443.46zm632.4 0l485.39 0 -149.42 443.46 -484.97 0 149 -443.46zm287.25 588.05l-154.41 458.27 -484.4 0 153.97 -458.27 484.84 0zm-787.63 458.27l-484.57 0 154.41 -458.27 484.13 0 -153.97 458.27z"
                />
            </g>
        </svg>
    );
}

