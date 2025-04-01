import React, { Suspense, lazy } from "react";
import { useOrientationStore } from "@/stores/orientationStore";
import { BottomSheet } from "@/components/BottomSheet";
import { TradeFormController } from "./components/TradeFormController";
import { useBottomSheetStore } from "@/stores/bottomSheetStore";
import { MarketSelector } from "@/components/MarketSelector";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useMainLayoutStore } from "@/stores/mainLayoutStore";
import { useMarketStore } from "@/stores/marketStore";
import { useTradeStore } from "@/stores/tradeStore";
import { HowToTrade } from "@/components/HowToTrade";
import { ChevronDown } from "lucide-react";
import { MarketInfo } from "@/components/MarketInfo";
import { TradeTypesListController } from "./components/TradeTypesListController";

const Chart = lazy(() =>
    import("@/components/Chart").then((module) => ({
        default: module.Chart,
    }))
);

export const TradePage: React.FC = () => {
    const { isLandscape } = useOrientationStore();
    const { setBottomSheet } = useBottomSheetStore();
    const { isMobile } = useDeviceDetection();
    const selectedMarket = useMarketStore((state) => state.selectedMarket);
    const { setOverlaySidebar } = useMainLayoutStore();
    const tradeTypeDisplayName = useTradeStore((state) => state.tradeTypeDisplayName);

    const handleMarketSelect = React.useCallback(() => {
        if (isMobile) {
            setBottomSheet(true, "market-info", "80%");
        } else {
            setOverlaySidebar(true, "market-list");
        }
    }, [isMobile, setBottomSheet, setOverlaySidebar]);

    const handleTradeTypeSelect = React.useCallback(() => {
        if (isMobile) {
            setBottomSheet(true, "trade-types", "80%");
        } else {
            setOverlaySidebar(true, "trade-types");
        }
    }, [isMobile, setBottomSheet, setOverlaySidebar]);

    return (
        <div className="flex flex-col flex-1 p-4 gap-4" data-testid="trade-page">
            {/* Top section with Market and Trade Type selectors */}
            <TradeTypesListController /> {/* Trade Type Selector */}
            <div className="flex justify-between items-center gap-4">
                <MarketInfo
                    title={selectedMarket?.displayName || "Select Market"}
                    subtitle={tradeTypeDisplayName}
                    onClick={handleMarketSelect}
                    isMobile={false}
                />
            </div>
            {/* Trade Form */}
            <div className="flex flex-col gap-4">
                <div className="bg-white rounded-lg shadow p-4 max-w-[600px]">
                    <TradeFormController isLandscape={!isMobile} />
                </div>
            </div>
            {!isMobile && <MarketSelector />}
            <BottomSheet />
        </div>
    );
};
