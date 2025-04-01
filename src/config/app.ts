export const appConfig = {
    app_id: 1001, // This should be replaced with the actual app ID
    account_type: "real" as const, // This should be determined by user context
};

/**
 * Template configuration for the application
 * This defines branding, UI elements, and default trade settings
 */
export const templateConfig = {
    // Branding
    // appName: "Deriv Trading App",
    // logo: {
    //     path: "/logo.svg",
    //     altText: "Deriv Logo",
    //     width: 120,
    //     height: 40,
    // },
    // favicon: "/favicon.ico",

    // Theme colors
    // theme: {
    //     primaryColor: "#ff444f",
    //     secondaryColor: "#85acb0",
    //     textColor: "#333333",
    //     backgroundColor: "#ffffff",
    //     chartColors: {
    //         bullish: "#4bb4b3",
    //         bearish: "#ff444f",
    //     },
    // },

    // Default trade settings
    TradeType: "rise_fall", // Must match a key in tradeTypeConfigs
    // defaultDuration: {
    //     value: 1,
    //     unit: "minutes",
    // },
    // defaultStake: {
    //     amount: 10,
    //     currency: "USD",
    // },

    // Feature flags
    // features: {
    //     showDemoAccounts: true,
    //     enableMultipliers: true,
    //     enableTouchTrading: true,
    //     showMarketInfo: true,
    // },

    // Market preferences
    // markets: {
    //     defaultMarket: "forex",
    //     favorites: ["R_100", "1HZ100V", "frxEURUSD"],
    // },
};
