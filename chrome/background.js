if (localStorage.openin === undefined)
	localStorage.openin = 'window';
if (localStorage.deleteconfirm === undefined)
	localStorage.deleteconfirm = 'yes';
if (localStorage.encryption === undefined)
	localStorage.encryption = 'no';
	
//localStorage.tempWindowNames = "{}";
/*temp window names*/

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var trackedWindows = Storage.get('trackedWindows');
        var tempWindowNames = Storage.get('tempWindowNames');

        if (request.method  === "open_saved_window") {
            if (localStorage.openin === 'window') {
                var onWindowCreated = function (window) {
                    chrome.tabs.query({windowId: window.id}, function (tabs) {
                        chrome.tabs.remove(tabs[0].id);
                    });
                    request.tabs.forEach(function (tab) {
                        curTab = {windowId: window.id,
                            url: tab.url,
                            //selected: false,
                            active:false
                        };
                        if (localStorage.supportPinned == 1 && tab.pinned) {
                            curTab.pinned = true;
                        }
                        chrome.tabs.create(curTab);
                    });
                    /* update tracked windows */
                    trackedWindows[window.id] = request.windowId;
                    /* update window name */
                    tempWindowNames['winl'+window.id] = request.windowName;

                    Storage.set('trackedWindows', trackedWindows);
                    Storage.set('tempWindowNames', tempWindowNames);

                    /* send response with this newly created local window Id */
                    //sendResponse({localWindowId: window.id});
                };
                if(typeof browser !== "undefined") {
                    browser.windows.create({}, onWindowCreated);
                } else {
                    chrome.windows.create({focused: false}, onWindowCreated);
                }
            } else if (localStorage.openin === 'tab') {
                request.tabs.forEach(function (tab) {
                                       chrome.tabs.create({url: tab.url});
                                    });
            }
        }
        return true;
    }
);
