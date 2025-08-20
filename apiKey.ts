// This file is deprecated and no longer in use.
// The API key is now sourced directly from process.env.API_KEY in the components that require it.
// This change was made to fix a critical loading error and to align with security best practices.

export async function getApiKey(): Promise<string> {
    console.warn("getApiKey is deprecated and should not be used.");
    return process.env.API_KEY || "";
}
