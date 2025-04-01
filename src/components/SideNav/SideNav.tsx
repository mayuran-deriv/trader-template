import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useClientStore } from "@/stores/clientStore";
import { useOrientationStore } from "@/stores/orientationStore";
import { useMainLayoutStore } from "@/stores/mainLayoutStore";
import {
    LegacyMenuHamburger1pxIcon,
    LegacyMenuHamburger2pxIcon,
    StandaloneClockThreeFillIcon,
    StandaloneClockThreeRegularIcon,
} from "@deriv/quill-icons";

export const SideNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn } = useClientStore();
    const { isLandscape } = useOrientationStore();
    const { activeSidebar, toggleSidebar, theme } = useMainLayoutStore();

    return (
        <nav className="flex fixed z-[60] flex-col h-[100dvh] sticky top-0 right-0 w-16 border-l border-theme bg-theme overflow-y-auto">
            <div className="flex flex-col items-center gap-8 py-4">
                {/* TODO: Add customize logo */}
                {/* <a href="/" className="">
                    <img
                        src="/logo.svg"
                        alt="Champion Trader Logo"
                        className="w-8 h-8 rounded-full"
                    />
                </a> */}
                <div className="flex flex-col gap-4">
                    {isLoggedIn && (
                        <button
                            onClick={() => {
                                if (isLandscape) {
                                    toggleSidebar("positions");
                                } else {
                                    navigate("/positions");
                                }
                            }}
                            className={`flex flex-col items-center ${
                                location.pathname === "/positions"
                                    ? "text-primary"
                                    : "text-theme-muted"
                            }`}
                        >
                            <div
                                className={`${activeSidebar === "positions" ? "bg-theme-active rounded-lg p-2" : "p-2"}`}
                            >
                                {activeSidebar === "positions" ? (
                                    <StandaloneClockThreeFillIcon
                                        fill={theme === "dark" ? "#fff" : "#000"}
                                    />
                                ) : (
                                    <StandaloneClockThreeRegularIcon
                                        fill={theme === "dark" ? "#fff" : "#000"}
                                    />
                                )}
                            </div>
                            <span className={`text-xs text-theme`}>Positions</span>
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (isLandscape) {
                                toggleSidebar("menu");
                            } else {
                                navigate("/menu");
                            }
                        }}
                        className="flex flex-col items-center  text-theme-muted"
                    >
                        <div
                            className={`${
                                activeSidebar === "menu" ? "bg-theme-active rounded-lg p-2" : "p-2"
                            }`}
                        >
                            {activeSidebar === "menu" ? (
                                <LegacyMenuHamburger2pxIcon
                                    iconSize="sm"
                                    fill={theme === "dark" ? "#fff" : "#000"}
                                />
                            ) : (
                                <LegacyMenuHamburger1pxIcon
                                    iconSize="sm"
                                    fill={theme === "dark" ? "#fff" : "#000"}
                                />
                            )}
                        </div>
                        <span className={`text-xs text-theme`}>Menu</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};
