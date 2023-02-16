(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";

    let currentVideoBookmarks = []

    chrome.runtime.onMessage.addListener((obj, sender, response) => { //Add listener for messages
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
          } else if (type === "PLAY") {
            youtubePlayer.currentTime = value; //Set video playback to the bookmark timestamp
          } else if ( type === "DELETE") { //Delete the bookmark
            currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value); //Remove the bookmark from all bookmarks
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) }); //Set new array of bookmarks in storage
      
            response(currentVideoBookmarks); //Call the callback function specified in popup.js:63 which is the viewBookmarks function passing the updated list of bookmarks
          }
    })

    const fetchBookmarks = () => {
        return new Promise((resolve) =>{
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]): []) //If we have bookmarks in storage for the given key (current video) then we return the values of that key parsing them as JSON (we are returning the bookmarks of the video as JSON array)
            })
        })
    }

    const newVideoLoaded = async () => {
        console.log("newVideoLoaded()")

        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0]

        currentVideoBookmarks = await fetchBookmarks(); //Fetch the bookmarks of the current video

        if(!bookmarkBtnExists){ //Check if the bookmark element exists in the DOM
            const bookmarkBtn = document.createElement("img") //Create image

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png")
            bookmarkBtn.className = "ytp-button " + "bookmark-btn"
            bookmarkBtn.title = "Click to bookmark current timestamp of the video :)";

            //To get the class names of the divs just go to inspect element in the browser
            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0]; //Get the div that contains the control buttons of a youtube video
            youtubePlayer = document.getElementsByClassName("video-stream")[0] //Get the div that contains the video

            //youtubeLeftControls.insertBefore(bookmarkBtn, youtubeLeftControls.firstChild); //Add the bookmark element to the youtube controls
            youtubeLeftControls.appendChild(bookmarkBtn);

            //Add click event listener
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }

    const addNewBookmarkEventHandler = async () => {
        const currentTimestampOfVideo = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTimestampOfVideo,
            desc: "Bookmark at " + getTime(currentTimestampOfVideo)
        }

        console.log(newBookmark)

        currentVideoBookmarks = await fetchBookmarks();

        //Add bookmark to the chrome storage
        chrome.storage.sync.set({
            //Add new bookmark to all the bookmarks of the current video and sort them by timestamp ASC. This means we will show the bookmarks in order of their timestamp.
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((bookmark1, bookmark2) => bookmark1.time - bookmark2.time))
        })
    }


    newVideoLoaded(); //This invocation here means that every time the contentScript.js file is called (when we refresh url or change any youtube page) it will inject the button
})();

const getTime = (timeInSeconds) => {
    var date = new Date(0);

    date.setSeconds(timeInSeconds);

    return date.toISOString().substring(11, 8);
}