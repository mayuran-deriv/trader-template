import React from "react";
import { useClientStore } from "@/stores/clientStore";
import { AccountSwitcher } from "@/components/AccountSwitcher";
// import { BalanceDisplay } from "@/components/BalanceDisplay";

interface HeaderProps {
    className?: string;
    onDeposit?: () => void;
    depositLabel?: string;
    loginUrl?: string;
}

export const ResponsiveHeader: React.FC<HeaderProps> = ({
    className = "",
    onDeposit,
    depositLabel = "Deposit",
    loginUrl = "/login",
}) => {
    const { isLoggedIn } = useClientStore();
    const showLogo = !isLoggedIn;

    return (
        <header
            className={`flex items-center gap-4 px-4 py-2 lg:border-b lg:border-theme bg-theme justify-end ${className}`}
            id="header"
        >
            <button
                className="text-sm font-semibold rounded-3xl bg-color-brand-700 hover:bg-color-brand-600 text-black flex h-8 min-w-[80px] px-4 justify-center items-center"
                onClick={async () => {
                    const response = await fetch("/.netlify/functions/deploy");
                    const data = await response.json();
                    alert(`Your site is live at: ${data.url}`);
                }}
            >
                🚀 Deploy My Version
            </button>

            <div className="flex items-center justify-end">
                <div className="flex-1">
                    {isLoggedIn && (
                        <div className="mr-4">
                            <AccountSwitcher />
                        </div>
                    )}
                </div>
                {isLoggedIn ? (
                    <button
                        className="text-sm font-semibold rounded-3xl bg-color-brand-700 hover:bg-color-brand-600 text-black flex h-8 min-w-[80px] px-4 justify-center items-center"
                        onClick={onDeposit}
                    >
                        {depositLabel}
                    </button>
                ) : (
                    <a
                        href={loginUrl}
                        className="text-sm font-semibold rounded-3xl bg-color-brand-700 hover:bg-color-brand-600 text-black flex h-8 min-w-[80px] px-4 justify-center items-center"
                    >
                        Log in
                    </a>
                )}
            </div>
        </header>
    );
};
