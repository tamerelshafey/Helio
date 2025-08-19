
let apiKey: string | null = null;

async function fetchApiKey(): Promise<string> {
    if (apiKey) {
        return apiKey;
    }
    try {
        // This assumes config.json is in the public root folder
        const response = await fetch('./config.json');
        if (!response.ok) {
            throw new Error('config.json not found or failed to load');
        }
        const config = await response.json();
        if (typeof config.API_KEY !== 'string' || !config.API_KEY) {
            throw new Error('API_KEY not found or is invalid in config.json');
        }
        apiKey = config.API_KEY;
        return apiKey;
    } catch (error) {
        console.error("Could not fetch API Key:", error);
        // Display a user-friendly message if the key is missing
        alert("API Key configuration is missing or invalid. Please ensure a valid 'config.json' file with your API_KEY exists.");
        throw new Error("API Key configuration is missing or invalid.");
    }
}

export async function getApiKey(): Promise<string> {
    return await fetchApiKey();
}
