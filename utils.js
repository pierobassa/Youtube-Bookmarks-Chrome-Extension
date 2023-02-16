/**
 * @returns the current tab object the user is on. 
 */
export async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };

    let [tab] = await chrome.tabs.query(queryOptions);

    return tab;
}