import { usePage } from "@inertiajs/react"
import React from 'react';
import { DefaultLogo } from "./default-logo"
import { TechMediaLogo } from "./techmedia-logo"
import { TTTLogo } from "./ttt-logo"

type LogoProps = React.SVGProps<SVGSVGElement>

export function TenantLogo(props: LogoProps) {
    const { tenant } = usePage().props as any
    const key = tenant?.key ?? "default"

    switch (key) {
        case "techmedia":
            return <TechMediaLogo {...props} />

        case "ttt":
            return <TTTLogo {...props} />

        default:
            return <DefaultLogo {...props} />
    }
}
