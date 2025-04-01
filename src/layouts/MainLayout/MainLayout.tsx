import React, { useEffect } from "react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useOrientationStore } from "@/stores/orientationStore";
import { useBottomNavStore } from "@/stores/bottomNavStore";
import { useMainLayoutStore } from "@/stores/mainLayoutStore";
import { Footer } from "./Footer";
import { ResponsiveHeader } from "./ResponsiveHeader";
import { SideNav } from "@/components/SideNav";
import { Sidebar, MenuPanel, PositionsPanel } from "@/components/Sidebar";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { isMobile } = useDeviceDetection();
    const { isLandscape, setIsLandscape } = useOrientationStore();
    const { activeSidebar, setSidebar } = useMainLayoutStore();
    const isBottomNavVisible = useBottomNavStore((state) => state.isVisible);
    const location = useLocation();
    const isResponsiveHeaderVisible = !location.pathname.includes("/contract/");

    useEffect(() => {
        const handleOrientationChange = () => {
            const isLandscapeMode = window.matchMedia
                ? window.matchMedia("(orientation: landscape)").matches
                : window.innerWidth > window.innerHeight;
            setIsLandscape(isLandscapeMode);
        };

        handleOrientationChange();
        window.addEventListener("orientationchange", handleOrientationChange);
        window.addEventListener("resize", handleOrientationChange);

        return () => {
            window.removeEventListener("orientationchange", handleOrientationChange);
            window.removeEventListener("resize", handleOrientationChange);
        };
    }, [isMobile, isLandscape]);

    const shouldEnableScrolling = isLandscape && window.innerHeight < 500;

    return (
        <div className="min-h-[100dvh] h-[100dvh] flex flex-col bg-theme text-theme">
            {isResponsiveHeaderVisible && (
                <ResponsiveHeader
                    className={`${shouldEnableScrolling ? "" : "sticky top-0"} z-50 w-full`}
                />
            )}
            <div
                className={`flex flex-1 relative ${
                    isLandscape && !shouldEnableScrolling ? "overflow-hidden" : ""
                }`}
            >
                <div className="flex flex-1 overflow-hidden">
                    {!isMobile ? (
                        <div className="flex flex-1">
                            <main className="flex-1 flex flex-row transition-all duration-300">
                                {children}
                            </main>
                            <div className="relative z-[50]">
                                <Sidebar
                                    isOpen={activeSidebar === "positions"}
                                    onClose={() => setSidebar(null)}
                                    title="Positions"
                                >
                                    <PositionsPanel />
                                </Sidebar>
                                <Sidebar
                                    isOpen={activeSidebar === "menu"}
                                    onClose={() => setSidebar(null)}
                                    title="Menu"
                                >
                                    <MenuPanel />
                                </Sidebar>
                            </div>
                            {!isMobile && <SideNav />}
                        </div>
                    ) : (
                        <main className="max-w-full flex-1 flex flex-col">{children}</main>
                    )}
                </div>
            </div>
            {isMobile && isBottomNavVisible && (
                <Footer className="sticky bottom-0 left-0 right-0 z-50 w-full" />
            )}
        </div>
    );
};
