import React, { useEffect } from "react";
import { TabList, Tab } from "@/components/ui/tab-list";
import { useTradeStore } from "@/stores/tradeStore";
import { useTemplateConfig } from "@/hooks/useTemplateConfig";

export const TradeTypesListController: React.FC = () => {
    // Get trade_type and setTradeType from tradeStore
    const trade_type = useTradeStore((state) => state.trade_type);
    const setTradeType = useTradeStore((state) => state.setTradeType);

    // Get template configuration for trade type
    const templateConfig = useTemplateConfig();
    const configuredTradeType = templateConfig.getTradeType();
    const displayName = templateConfig.getTradeTypeDisplayName();

    // Set the trade type from template config on component mount
    useEffect(() => {
        // Set the trade type from template config
        setTradeType(configuredTradeType, displayName);
    }, [configuredTradeType, displayName, setTradeType]);

    // Create a single tab for the configured trade type
    const tabs: Tab[] = [
        {
            label: displayName,
            value: configuredTradeType,
        },
    ];

    // Render TabList component with just the configured trade type
    return (
        <div className="min-h-fit lg:min-h-14 flex items-center mx-4">
            <TabList
                variant="chip"
                tabs={tabs}
                selectedValue={trade_type}
                onSelect={() => {}} // No selection needed as we only have one option
            />
        </div>
    );
};
