export default function TeamaLogo({
    className = 'w-48 h-auto text-orange-500',
}: {
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Abstract star / arrow mark */}
            <path d="M100 20 L130 70 L180 80 L140 110 L150 160 L100 135 L50 160 L60 110 L20 80 L70 70 Z" />
            <path d="M100 45 L100 155" />
            <path d="M45 100 L155 100" />
        </svg>
    );
}
