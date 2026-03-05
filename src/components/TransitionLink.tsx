"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import React from "react";

interface TransitionLinkProps extends React.ComponentProps<typeof Link> {
    href: string;
    children: React.ReactNode;
    className?: string;
}

export default function TransitionLink({ href, children, className, onClick, ...props }: TransitionLinkProps) {
    const router = useRouter();
    const pathname = usePathname();
    const setIsTransitioning = useStore((state) => state.setIsTransitioning);

    const handleTransitionClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        // determine if it's pointing to the exact same pathname (e.g. anchors)
        const targetPath = href.split('#')[0] || '/';
        const isSamePage = targetPath === pathname || targetPath === '';

        if (isSamePage) {
            // It's an anchor link on the same page. Do not intercept with the curtain.
            // Let conventional Next.js Link handle the smooth scrolling.
            if (onClick) onClick(e);
            return;
        }

        e.preventDefault();

        // 1. Pull the Cream Curtain up (animation takes 0.8s)
        setIsTransitioning(true);

        // 2. Wait for the curtain to completely cover the screen, then route
        setTimeout(() => {
            router.push(href);

            // 3. Wait a tiny fraction for the new DOM to render unstyled, then drop the curtain
            setTimeout(() => {
                setIsTransitioning(false);
            }, 150);

        }, 800);

        if (onClick) onClick(e);
    };

    return (
        <Link href={href} onClick={handleTransitionClick} className={className} {...props}>
            {children}
        </Link>
    );
}
