// Initialize side panel when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    // Ensure the side panel is available
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
