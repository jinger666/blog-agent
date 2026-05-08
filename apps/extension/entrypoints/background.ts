// Background script for AI Blog Assistant
export default defineBackground(() => {
  console.log('AI Blog Assistant background script loaded');

  // Listen for messages from content scripts or popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);
    
    if (message.type === 'OPEN_SIDE_PANEL') {
      chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    }
  });
});
