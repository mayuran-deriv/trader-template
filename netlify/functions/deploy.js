const axios = require("axios");

exports.handler = async (event) => {
    const API_TOKEN = "nfp_Y9QnAgdshGjYYN6s4n3CbSw3xxS6nFyMbd5b";
    const SITE_NAME = `user-${Date.now()}-trading-app`; // Unique site name
    const REPO_URL = "mayuran-deriv/trader-template"; // Your repo
    const BRANCH = "main"; // Change if needed

    try {
        // Step 1: Create the site
        const siteResponse = await axios.post(
            "https://api.netlify.com/api/v1/sites",
            {
                name: SITE_NAME,
                repo: {
                    provider: "github",
                    repo: REPO_URL,
                    branch: BRANCH,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const siteId = siteResponse.data.id;
        console.log("Site Created:", siteResponse.data);

        // Step 2: Trigger a build manually
        const buildResponse = await axios.post(
            `https://api.netlify.com/api/v1/sites/${siteId}/builds`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Build Triggered:", buildResponse.data);

        return {
            statusCode: 200,
            body: JSON.stringify({ url: siteResponse.data.url }),
        };
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.response?.data || error.message }),
        };
    }
};
