import { useMemo } from "react";
import { templateConfig } from "@/config/app.ts";
import { tradeTypeConfigs, TradeType } from "@/config/tradeTypes";

/**
 * Hook to access the template configuration
 * Focuses on trade type configuration
 */
export const useTemplateConfig = () => {
    // Return a memoized version of the config to prevent unnecessary re-renders
    return useMemo(() => {
        return {
            // Get the configured trade type from template config
            getTradeType: () => templateConfig.TradeType as TradeType,

            // Helper method to get the configuration for the current trade type
            getTradeTypeConfig: () => tradeTypeConfigs[templateConfig.TradeType as TradeType],

            // Get display name for the configured trade type
            getTradeTypeDisplayName: () =>
                tradeTypeConfigs[templateConfig.TradeType as TradeType]?.displayName ||
                templateConfig.TradeType,
        };
    }, []);
};
