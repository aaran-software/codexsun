'use client';

interface SocialItem {
    label: string;
    href: string;
    Icon: any;
}

interface Props {
    items: SocialItem[];
}

export default function FooterSocial({ items }: Props) {
    return (
        <div className="hidden lg:flex lg:flex-col lg:items-end lg:justify-center">
            <p className="mb-3 text-sm font-semibold tracking-wider text-white uppercase">
                Follow Us
            </p>

            <div className="flex gap-2">
                {items.map(({ label, href, Icon }) => (
                    <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="rounded-full bg-gray-800 p-2 text-gray-400 transition-all duration-200 hover:scale-110 hover:bg-primary hover:text-white"
                    >
                        <Icon className="h-5 w-5" />
                    </a>
                ))}
            </div>
        </div>
    );
}
