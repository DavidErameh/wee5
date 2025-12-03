"use client";

import { usePathname } from "next/navigation";
import { NavigationBar } from "./NavigationBar";

interface NavbarWrapperProps {
    communityName: string;
    userName: string;
    userAvatarUrl?: string;
    currentXp: number;
}

export const NavbarWrapper: React.FC<NavbarWrapperProps> = (props) => {
    const pathname = usePathname();

    // Hide navbar on landing page and discover page
    if (pathname === "/" || pathname === "/discover") {
        return null;
    }

    return <NavigationBar {...props} />;
};
