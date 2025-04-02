const axios = require("axios");

exports.handler = async (event) => {
    const API_TOKEN = "nfp_Y9QnAgdshGjYYN6s4n3CbSw3xxS6nFyMbd5b";
    const SITE_NAME = `user-${Date.now()}-trading-app`; // Unique site name
    const REPO_URL = "mayuran-deriv/trader-template";

    try {
        const response = await axios.post(
            "https://api.netlify.com/api/v1/sites",
            {
                name: SITE_NAME,
                repo: { provider: "github", repo: REPO_URL, branch: "main" },
            },
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ url: response.data.url }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.response?.data || error.message }),
        };
    }
};
