//SAMPLE YOUTUBE URL: https://www.youtube.com/watch?&v=[VIDEO_ID]&list=[LIST_ID]

chrome.tabs.onUpdated.addListener((tabId, tab) => { //This method is called when a tab is changed passing the tabId and the tab object
  if(tab.url && tab.url.includes("youtube.com/watch")){ //if the tab is a youtube video
    const queryParameters = tab.url.split("?")[1] //Getting the part of the url after '?'

    const urlParameters = new URLSearchParams(queryParameters)

    //Send message to content script 
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v") //get VIDEO_ID 
    })
  }
})
  