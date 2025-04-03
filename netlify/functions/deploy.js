const axios = require("axios");

exports.handler = async (event) => {
    const NETLIFY_AUTH_TOKEN = "nfp_Y9QnAgdshGjYYN6s4n3CbSw3xxS6nFyMbd5b"; // Replace with your token
    const GIT_REPO = "https://github.com/mayuran-deriv/trader-template"; // Replace with your GitHub repo URL

    try {
        const userId = Math.random().toString(36).substring(2, 10); // Generate unique user ID
        const siteName = `test-${userId}`; // Unique site name

        // Step 1: Create a new site for the user
        const siteResponse = await axios.post(
            "https://api.netlify.com/api/v1/sites",
            {
                name: siteName,
                repo: {
                    url: GIT_REPO, // The GitHub repo to deploy from
                    provider: "github",
                    branch: "main",
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${NETLIFY_AUTH_TOKEN}`,
                },
            }
        );

        const siteId = siteResponse.data.id;
        const siteUrl = siteResponse.data.ssl_url || siteResponse.data.url;

        return {
            statusCode: 200,
            body: JSON.stringify({ siteId, siteUrl }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.response?.data || error.message }),
        };
    }
};
