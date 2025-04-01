import React, { Suspense, lazy, useEffect, useState, useCallback } from "react";
import { useMainLayoutStore } from "@/stores/mainLayoutStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useToastStore } from "@/stores/toastStore";
import { ServerTime } from "@/components/ServerTime";
import { TradeButton } from "@/components/TradeButton";
import { useTradeStore } from "@/stores/tradeStore";
import { tradeTypeConfigs } from "@/config/tradeTypes";
import { useTradeActions } from "@/hooks/useTradeActions";
import { useClientStore } from "@/stores/clientStore";
import { HowToTrade } from "@/components/HowToTrade";
import { TradeNotification } from "@/components/ui/trade-notification";
import { useProductConfig } from "@/hooks/product/useProductConfig";
import { useProposalStream } from "@/hooks/proposal/useProposal";
import { validateStake } from "@/components/Stake/utils/validation";
import { parseStakeAmount } from "@/utils/stake";
import { StandaloneStopwatchBoldIcon } from "@deriv/quill-icons";
import { useDeviceDetection } from "@/hooks";

// Lazy load components
const DurationField = lazy(() =>
    import("@/components/Duration").then((module) => ({
        default: module.DurationField,
    }))
);

const StakeField = lazy(() =>
    import("@/components/Stake").then((module) => ({
        default: module.StakeField,
    }))
);

const EqualTradeController = lazy(() =>
    import("@/components/EqualTrade").then((module) => ({
        default: module.EqualTradeController,
    }))
);

interface TradeFormControllerProps {
    isLandscape: boolean;
}

interface ButtonState {
    loading: boolean;
    error: Event | { error: string } | null;
    payout: number;
    reconnecting?: boolean;
    validationError?: string | null;
}

interface ValidationResult {
    error: boolean;
    message?: string;
}

// Validate payout
const validatePayout = (
    payout: number,
    minPayout: number,
    maxPayout: number,
    currency: string
): ValidationResult => {
    if (payout < minPayout) {
        return {
            error: true,
            message: `Minimum payout is ${minPayout} ${currency}`,
        };
    }

    if (payout > maxPayout) {
        return {
            error: true,
            message: `Maximum payout is ${maxPayout} ${currency}`,
        };
    }

    return { error: false };
};

type ButtonStates = Record<string, ButtonState>;

// Validate trade parameters (stake and payout)
const validateTradeParameters = (
    buttonState: ButtonState | undefined,
    stake: string,
    productConfig: any,
    currency: string
): { isValid: boolean; errorMessage: string | null } => {
    if (!productConfig?.data) {
        return { isValid: true, errorMessage: null }; // Default to valid if no config
    }

    const stakeValidation = productConfig.data.validations.stake;
    const payoutValidation = productConfig.data.validations.payout;

    if (!buttonState) {
        return { isValid: false, errorMessage: "Button state not available" };
    }

    // Parse stake value
    const stakeValue = parseStakeAmount(stake || "0");

    // Validate stake
    const stakeResult = validateStake({
        amount: stakeValue,
        minStake: parseFloat(stakeValidation.min),
        maxStake: parseFloat(stakeValidation.max),
        currency,
    });

    if (stakeResult.error) {
        return { isValid: false, errorMessage: stakeResult.message || null };
    }

    // Validate payout
    const payoutResult = validatePayout(
        buttonState.payout,
        parseFloat(payoutValidation.min),
        parseFloat(payoutValidation.max),
        currency
    );

    if (payoutResult.error) {
        return { isValid: false, errorMessage: payoutResult.message || null };
    }

    return { isValid: true, errorMessage: null };
};

/**
 * Helper function to handle trade button clicks
 * Encapsulates common logic for trade actions, sidebar updates, and notifications
 *
 * @param params - Parameters needed for the trade action
 * @returns A promise that resolves when the action is complete
 */
const handleTradeClick = async ({
    isLoggedIn,
    tradeActions,
    actionName,
    buttonTitle,
    isLandscape,
    setSidebar,
    stake,
    currency,
    instrument,
    toast,
    hideToast,
}: {
    isLoggedIn: boolean;
    tradeActions: any;
    actionName: string;
    buttonTitle: string;
    isLandscape: boolean;
    setSidebar: (sidebar: "positions" | "menu" | null) => void;
    stake: string;
    currency: string;
    instrument: string;
    toast: (params: any) => void;
    hideToast: () => void;
}): Promise<void> => {
    if (!isLoggedIn) return;

    try {
        // Call the API
        await tradeActions[actionName]();

        // Open positions sidebar only in desktop view
        if (isLandscape) {
            setSidebar("positions");
        }

        // Show trade notification
        toast({
            content: (
                <TradeNotification
                    stake={`Stake: ${stake} ${currency}`}
                    market={instrument}
                    type={buttonTitle}
                    onClose={hideToast}
                    icon={
                        <StandaloneStopwatchBoldIcon
                            fill="#53b9ff"
                            iconSize="md"
                            className="rounded-full bg-[#2C9AFF3D]"
                        />
                    }
                />
            ),
            variant: "default",
            duration: 3000,
            position: isLandscape ? "bottom-left" : "top-center",
        });
    } catch (error) {
        // Error is already handled in the trade action
    }
};

export const TradeFormController: React.FC<TradeFormControllerProps> = ({ isLandscape }) => {
    const { trade_type, instrument, productConfig, setPayouts, stake, setStake, isStakeError } =
        useTradeStore();
    const { fetchProductConfig } = useProductConfig();
    const { setSidebar } = useMainLayoutStore();
    const { toast, hideToast } = useToastStore();
    const { currency, isLoggedIn } = useClientStore();
    const tradeActions = useTradeActions();
    const config = tradeTypeConfigs[trade_type];
    const { isMobile } = useDeviceDetection();

    // Track stake validation errors separately to persist them across payout updates
    const [stakeValidationError, setStakeValidationError] = useState<string | null>(null);

    const [debouncedValue, setDebouncedValue] = useState(stake);

    useDebounce(debouncedValue, setStake, 500);

    const handleStakeChange = useCallback((value: string) => {
        setDebouncedValue(value);
    }, []);

    // Parse duration into value and unit

    // Subscribe to proposal stream at the top level of the component
    const {
        data: proposalData,
        error: proposalError,
        isConnecting: isProposalConnecting,
    } = useProposalStream();

    const [buttonStates, setButtonStates] = useState<ButtonStates>(() => {
        // Initialize states for all buttons in the current trade type
        const initialStates: ButtonStates = {};
        config.buttons.forEach((button: any) => {
            initialStates[button.actionName] = {
                loading: true,
                error: null,
                payout: 0,
                reconnecting: false,
            };
        });
        return initialStates;
    });

    // Fetch product config when trade_type changes
    useEffect(() => {
        if (trade_type && instrument) {
            fetchProductConfig(trade_type, instrument);
        }
    }, [trade_type, instrument]);

    // Reset button states when trade type changes
    useEffect(() => {
        setButtonStates((prevStates) => {
            const initialStates: ButtonStates = {};
            config.buttons.forEach((button: any) => {
                initialStates[button.actionName] = {
                    loading: true,
                    error: null,
                    payout: prevStates[button.actionName]?.payout || 0,
                    reconnecting: false,
                    // Preserve any validation errors when trade type changes
                    validationError: prevStates[button.actionName]?.validationError || null,
                };
            });
            return initialStates;
        });
    }, [trade_type, config.buttons]);

    // Preload components based on metadata
    useEffect(() => {
        if (config.metadata?.preloadFields) {
            // Preload field components
            if (config.fields.duration) {
                import("@/components/Duration");
            }
            if (config.fields.stake) {
                import("@/components/Stake");
            }
            if (config.fields.allowEquals) {
                import("@/components/EqualTrade");
            }
        }
    }, [trade_type, config]);

    // Process proposal data and update button states
    useEffect(() => {
        if (!productConfig?.data) return;

        // Set initial loading state for buttons when parameters change
        if (!proposalData && !proposalError) {
            setButtonStates((prevStates) => {
                // Create a new state object based on previous state
                const initialLoadingStates: ButtonStates = {};
                config.buttons.forEach((button: any) => {
                    // Preserve existing payout and validationError values from previous state
                    initialLoadingStates[button.actionName] = {
                        // Stop loading if there's a stake error
                        loading: isStakeError ? false : true,
                        error: null,
                        payout: prevStates[button.actionName]?.payout || 0,
                        reconnecting: false,
                        // Also preserve any existing validation errors
                        validationError: prevStates[button.actionName]?.validationError || null,
                    };
                });
                return initialLoadingStates;
            });
            return;
        }

        // Update button states when data is received
        if (proposalData) {
            const { variants } = proposalData.data;

            setButtonStates((prevStates) => {
                // Create updated button states
                const updatedButtonStates: ButtonStates = {};

                // Map variants to buttons
                config.buttons.forEach((button: any) => {
                    // Find the matching variant for this button
                    const variantType = button.actionName === "buy_rise" ? "rise" : "fall";
                    const variant = variants.find((v) => v.variant === variantType);
                    const payout = variant ? Number(variant.contract_details.payout) : 0;

                    // Preserve stake validation error if it exists
                    updatedButtonStates[button.actionName] = {
                        loading: false,
                        error: null,
                        payout: payout || prevStates[button.actionName]?.payout,
                        reconnecting: false,
                        validationError: stakeValidationError, // Use the separate stake validation state
                    };

                    // If no stake error, check payout validation
                    if (!stakeValidationError && productConfig?.data) {
                        const payoutValidation = productConfig.data.validations.payout;
                        const payoutResult = validatePayout(
                            payout,
                            parseFloat(payoutValidation.min),
                            parseFloat(payoutValidation.max),
                            currency
                        );

                        if (payoutResult.error) {
                            updatedButtonStates[button.actionName].validationError =
                                payoutResult.message || null;
                        }
                    }
                });

                return updatedButtonStates;
            });

            // Update payouts in store
            const payoutValues = config.buttons.reduce(
                (acc, button) => {
                    const variantType = button.actionName === "buy_rise" ? "rise" : "fall";
                    const variant = variants.find((v) => v.variant === variantType);
                    acc[button.actionName] = variant ? Number(variant.contract_details.payout) : 0;
                    return acc;
                },
                {} as Record<string, number>
            );

            // Set payouts in store
            setPayouts({
                max: productConfig?.data.validations.payout.max
                    ? Number(productConfig.data.validations.payout.max)
                    : 50000,
                values: payoutValues,
            });
        }

        // Handle errors
        if (proposalError) {
            // Update all buttons to show error state
            setButtonStates((prevStates) => {
                const errorButtonStates = { ...prevStates };
                Object.keys(errorButtonStates).forEach((key) => {
                    errorButtonStates[key] = {
                        ...errorButtonStates[key],
                        loading: false,
                        error:
                            proposalError instanceof Error
                                ? { error: proposalError.message }
                                : proposalError,
                        reconnecting: true,
                        // Preserve stake validation errors
                        validationError: stakeValidationError,
                    };
                });
                return errorButtonStates;
            });
        }
    }, [
        proposalData,
        proposalError,
        trade_type,
        config.buttons,
        productConfig,
        stakeValidationError,
        currency,
    ]);

    // Validate all trade parameters (stake and payout) for all buttons
    const validateAllTradeParameters = (stakeValue?: string) => {
        if (!productConfig?.data) return;

        const payoutValidation = productConfig.data.validations.payout;
        const stakeValidation = productConfig.data.validations.stake;

        // First validate stake if needed
        if (!stakeValidationError && stake) {
            const parsedStakeValue = parseStakeAmount(stakeValue || stake || "0");
            const stakeResult = validateStake({
                amount: parsedStakeValue,
                minStake: parseFloat(stakeValidation.min),
                maxStake: parseFloat(stakeValidation.max),
                currency,
            });

            // If stake is invalid, update stake validation error
            if (stakeResult.error) {
                setStakeValidationError(stakeResult.message || null);

                // Update button states with stake error
                setButtonStates((prevStates) => {
                    const updatedStates = { ...prevStates };
                    Object.keys(updatedStates).forEach((buttonActionName) => {
                        updatedStates[buttonActionName] = {
                            ...updatedStates[buttonActionName],
                            validationError: stakeResult.message || null,
                        };
                    });
                    return updatedStates;
                });

                return; // Exit early if stake is invalid
            }
        }

        // Then validate payout for each button
        setButtonStates((prevStates) => {
            const updatedStates = { ...prevStates };

            // Check each button
            Object.keys(updatedStates).forEach((buttonActionName) => {
                const buttonState = updatedStates[buttonActionName];

                // If there's a stake validation error, keep it
                if (stakeValidationError) {
                    updatedStates[buttonActionName] = {
                        ...buttonState,
                        validationError: stakeValidationError,
                    };
                    return;
                }

                // Otherwise, validate payout
                const payoutResult = validatePayout(
                    buttonState.payout,
                    parseFloat(payoutValidation.min),
                    parseFloat(payoutValidation.max),
                    currency
                );

                if (payoutResult.error) {
                    updatedStates[buttonActionName] = {
                        ...buttonState,
                        validationError: payoutResult.message || null,
                    };
                } else {
                    // Clear validation error if both stake and payout are valid
                    updatedStates[buttonActionName] = {
                        ...buttonState,
                        validationError: null,
                    };
                }
            });

            return updatedStates;
        });
    };

    // Handle stake validation errors
    const handleStakeError = (hasError: boolean, errorMessage: string | null) => {
        // Update the separate stake validation state
        setStakeValidationError(hasError ? errorMessage : null);

        // Also update button states
        setButtonStates((prevStates) => {
            const updatedStates = { ...prevStates };

            // Update all buttons with the stake validation error
            Object.keys(updatedStates).forEach((buttonActionName) => {
                updatedStates[buttonActionName] = {
                    ...updatedStates[buttonActionName],
                    validationError: hasError ? errorMessage : null,
                };
            });

            return updatedStates;
        });

        // If stake is now valid, re-validate payout
        if (!hasError) {
            // Pass the current debouncedValue to ensure we're using the latest stake
            setTimeout(() => validateAllTradeParameters(debouncedValue), 0);
        }
    };

    // Update payout validation errors when productConfig or currency changes
    useEffect(() => {
        if (!productConfig?.data) {
            return;
        }

        const payoutValidation = productConfig.data.validations.payout;

        setButtonStates((prevStates) => {
            const updatedStates = { ...prevStates };

            // Only validate payout for each button
            Object.keys(updatedStates).forEach((buttonActionName) => {
                const buttonState = updatedStates[buttonActionName];

                // Skip if there's already a stake validation error
                if (buttonState.validationError) return;

                // Validate payout
                const payoutResult = validatePayout(
                    buttonState.payout,
                    parseFloat(payoutValidation.min),
                    parseFloat(payoutValidation.max),
                    currency
                );

                if (payoutResult.error) {
                    updatedStates[buttonActionName] = {
                        ...buttonState,
                        validationError: payoutResult.message || null,
                    };
                }
            });

            return updatedStates;
        });
    }, [productConfig, currency]); // Only run for productConfig and currency changes

    return (
        <div
            id="trade-section"
            className={`${
                isLandscape ? "flex flex-col justify-start px-4 gap-2" : "bg-theme px-4"
            }`}
        >
            <div className={"px-4"} id="how-to-trade">
                <HowToTrade />
            </div>
            <div className="flex-1 flex flex-col">
                <div
                    className="flex flex-col gap-0"
                    onMouseDown={() => {
                        // When clicking anywhere in the trade fields section, hide any open controllers
                        const event = new MouseEvent("mousedown", {
                            bubbles: true,
                            cancelable: true,
                        });
                        document.dispatchEvent(event);
                    }}
                >
                    <div className="flex flex-col gap-2">
                        {config.fields.duration && (
                            <Suspense fallback={<div>Loading duration field...</div>}>
                                <DurationField
                                    className={`w-full ${
                                        Object.values(buttonStates).some((state) => state.loading)
                                            ? "opacity-50"
                                            : ""
                                    }`}
                                    disabled={Object.values(buttonStates).some(
                                        (state) => state.loading
                                    )}
                                />
                            </Suspense>
                        )}
                        {config.fields.stake && (
                            <Suspense fallback={<div>Loading stake field...</div>}>
                                <StakeField
                                    className={`w-full ${Object.values(buttonStates).some((state) => state.loading) ? "opacity-50" : ""}`}
                                    stake={stake}
                                    setStake={handleStakeChange}
                                    productConfig={productConfig}
                                    currency={currency}
                                    isConfigLoading={!productConfig}
                                    handleError={handleStakeError}
                                    stackDisabled={
                                        !!stake &&
                                        Object.values(buttonStates).some((state) => state.loading)
                                    }
                                />
                            </Suspense>
                        )}
                    </div>
                    {config.fields.allowEquals && <EqualTradeController />}
                </div>

                <div className={`flex py-2 gap-2 ${isMobile ? "flex-col" : ""}`} id="trade-buttons">
                    {config.buttons.map((button) => (
                        <Suspense key={button.actionName} fallback={<div>Loading...</div>}>
                            <TradeButton
                                className={`${button.className} rounded-[16px] h-[48px] py-3 [&>div]:px-2 [&_span]:text-sm`}
                                title={button.title}
                                label={button.label}
                                value={
                                    buttonStates[button.actionName]?.loading
                                        ? "Loading..."
                                        : buttonStates[button.actionName]?.validationError
                                          ? "-"
                                          : `${
                                                buttonStates[button.actionName]?.payout || 0
                                            } ${currency}`
                                }
                                title_position={button.position}
                                disabled={
                                    buttonStates[button.actionName]?.loading ||
                                    Boolean(buttonStates[button.actionName]?.validationError)
                                    // Commenting it as api is not working we'll enable it once api is working
                                    // buttonStates[button.actionName]?.error !== null
                                }
                                loading={
                                    buttonStates[button.actionName]?.loading || isProposalConnecting
                                    // Commenting it as api is not working we'll enable it once api is working
                                    // buttonStates[button.actionName]?.reconnecting
                                }
                                error={
                                    buttonStates[button.actionName]?.validationError
                                        ? {
                                              error:
                                                  buttonStates[button.actionName]
                                                      ?.validationError || "",
                                          }
                                        : buttonStates[button.actionName]?.error
                                }
                                onClick={() =>
                                    handleTradeClick({
                                        isLoggedIn,
                                        tradeActions,
                                        actionName: button.actionName,
                                        buttonTitle: button.title,
                                        isLandscape,
                                        setSidebar,
                                        stake,
                                        currency,
                                        instrument,
                                        toast,
                                        hideToast,
                                    })
                                }
                            />
                        </Suspense>
                    ))}
                </div>
                <div className="mt-auto">
                    <ServerTime />
                </div>
            </div>
        </div>
    );
};
