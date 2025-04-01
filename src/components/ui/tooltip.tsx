import { useEffect, useRef } from "react";
import { useTooltipStore } from "@/stores/tooltipStore";
import { cn } from "@/lib/utils";

export const Tooltip = () => {
    const { message, isVisible, position, type, hideTooltip } = useTooltipStore();
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                hideTooltip();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [hideTooltip]);

    if (!isVisible) return null;

    const tooltipStyles = {
        position: "fixed" as const,
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(0, -100%)",
        marginTop: "-8px",
    };

    return (
        <div
            ref={tooltipRef}
            style={tooltipStyles}
            className={cn(
                "z-50 px-4 py-2 rounded-lg shadow-lg whitespace-nowrap font-ibm-plex text-xs leading-[18px] font-normal",
                "after:content-[''] after:absolute after:bottom-[-8px] after:left-4",
                "after:w-4 after:h-4 after:rotate-45",
                {
                    "bg-red-500 text-white after:bg-red-500": type === "error",
                    "bg-blue-500 text-white after:bg-blue-500": type === "info",
                    "bg-yellow-500 text-white after:bg-yellow-500": type === "warning",
                    "bg-green-500 text-white after:bg-green-500": type === "success",
                }
            )}
        >
            {message}
        </div>
    );
};
