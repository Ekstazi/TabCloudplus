if (localStorage.openin === undefined)
	localStorage.openin = 'window';
if (localStorage.deleteconfirm === undefined)
	localStorage.deleteconfirm = 'yes';
if (localStorage.encryption === undefined)
	localStorage.encryption = 'no';
	
localStorage.tempWindowNames = "{}";

/* tracked windows, a map "chrome window id" : "tagcloud saved window id" */
trackedWindows = {};
         
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.method  === "open_saved_window") {
            if (localStorage.openin === 'window') {
                chrome.windows.create({}, 
                                      function (window) {
                                        chrome.tabs.getAllInWindow(window.id, 
                                                                   function (tabs) {
                                                                      chrome.tabs.remove(tabs[0].id);
                                                                   });
                                        request.tabs.forEach(function (tab) {
                                                                curTab = {windowId: window.id,
                                                                          url: tab.url,
                                                                          selected: false
                                                                          };
                                                                if (localStorage.supportPinned == 1 && tab.pinned) {
                                                                    curTab.pinned = true;
                                                                }
                                                                chrome.tabs.create(curTab);
                                                            });
                                        /* update tracked windows */
                                        trackedWindows[window.id] = request.windowId;
                                        /* send response with this newly created local window Id */
                                        sendResponse({localWindowId: window.id});
                                     });
            } else if (localStorage.openin === 'tab') {
                request.tabs.forEach(function (tab) {
                                       chrome.tabs.create({url: tab.url});
                                    });
            }
        }
        return true;
    }
);
