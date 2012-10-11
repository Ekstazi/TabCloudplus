$(function () {setTimeout(function () {
	// Protect against XSRF attacks
	jQuery.ajaxSetup({
		'beforeSend': function(xhr) {
			xhr.setRequestHeader('X-XSRF-Protection', 'true');
		}
	})
	
	var getWindowName = function (name) {
		var names = JSON.parse(localStorage.tempWindowNames)
		return names[name];
	};
	var setWindowName = function (name, value) {
		if (value.length == 0) {
			value = 'Window';
		}
		var names = JSON.parse(localStorage.tempWindowNames)
		names[name] = value;
		localStorage.tempWindowNames = JSON.stringify(names);
	};
    
    //remote tracking record by remote WindowID
    var removeTrackRecByRWinId = function (windowId) {
        for (var remoteWindowId in chrome.extension.getBackgroundPage().trackedWindows) {
            if (chrome.extension.getBackgroundPage().trackedWindows[remoteWindowId] === windowId)
                delete chrome.extension.getBackgroundPage().trackedWindows[remoteWindowId];
        }        
    }
    
    var makeSortable = function () {
		$(".tabs").sortable({
			placeholder: 'tabplaceholder',
			forcePlaceholderSize: true,
			revert: 100,
			connectWith: '.tabs',
			scroll: false,
			update: function (e, ui) {
				var tab = $($(ui.item[0]).children()[0]).attr('id');
				var oldWindow = $($(ui.item[0]).children()[0]).attr('windowid');
				if ($(e.target).attr('id') === 'trash') {
					// Dragged to trash
					if (tab.substring(6,7) == 'l') {
						chrome.tabs.remove(parseInt(tab.substring(7),10));
					} else if (tab.substring(6,7) == 'r') {
						// Remove from remote
						// Remove from array
						var data = TCWindows[oldWindow.substring(4)];
						data.tabs.splice(tab.substring(7),1);
						data.name = getWindowName(oldWindow);
						// Send new array
						$.post('https://chrometabcloud.appspot.com/update', {window: JSON.stringify(data), windowId: oldWindow.substring(4)});
					}
					$(ui.item[0]).detach();
				} else {
					// Dragged between windows
					// Assume both local
					var newWindow = $(e.target).parent().attr('id');
					if (tab.substring(6,7) == 'l' && newWindow.substring(3,4) == 'l') {
						// Local to local
						
						// Move tab
						chrome.tabs.move(parseInt(tab.substring(7),10), {
							windowId: parseInt(newWindow.substring(4),10),
							index: $(ui.item[0]).index()
						});
						
						// Update image
						$($(ui.item[0]).children()[0]).attr('windowid', newWindow);
					} else if (tab.substring(6,7) == 'l' && newWindow.substring(3,4) == 'r') {
						// Local to remote
						
						// Add to remote
						// Add to array
						var data = TCWindows[newWindow.substring(4)];
						data.tabs.splice($(ui.item[0]).index(),0,{
							url: $($(ui.item[0]).children()[0]).attr('url'),
							title: $($(ui.item[0]).children()[0]).attr('title'),
							favicon: ($($(ui.item[0]).children()[0]).attr('src') != 'chrome://favicon/'+$($(ui.item[0]).children()[0]).attr('url')) ? $($(ui.item[0]).children()[0]).attr('src') : ''
						});
						data.name = getWindowName(newWindow);
						// Send new array
						$.post('https://chrometabcloud.appspot.com/update', {window: JSON.stringify(data), windowId: newWindow.substring(4)});
						
						// Remove from local
						chrome.tabs.remove(parseInt(tab.substring(7),10));
						
						// Update image
						$($(ui.item[0]).children()[0]).removeClass('tabimglocal').attr('id','tabimgr'+$(ui.item[0]).index()).attr('windowid', newWindow);
						$.each($(ui.item[0]).parent().children(), function (i, e) {
							$($(e).children()[0]).attr('id','tabimgr'+i);
						});
					
					} else if (tab.substring(6,7) == 'r' && newWindow.substring(3,4) == 'l') {
						// Remote to local
						
						// Add to local
						chrome.tabs.create({
							windowId: parseInt(newWindow.substring(4),10),
							url: $($(ui.item[0]).children()[0]).attr('url'),
							index: $(ui.item[0]).index(),
							selected: false
						}, function (newTab) {
							// Update image
							$($(ui.item[0]).children()[0]).addClass('tabimglocal').attr('id','tabimgl'+newTab.id);
						});
						
						// Remove from remote
						// Remove from array
						var data = TCWindows[oldWindow.substring(4)];
						data.tabs.splice(tab.substring(7),1);
						data.name = getWindowName(oldWindow);
						// Send new array
						$.post('https://chrometabcloud.appspot.com/update', {window: JSON.stringify(data), windowId: oldWindow.substring(4)});
						
						// Update image
						$($(ui.item[0]).children()[0]).attr('windowid', newWindow);
						
						// Update remote ids
						$.each($('#'+oldWindow).find('.tabs').children(), function (i, e) {
							$($(e).children()[0]).attr('id','tabimgr'+i);
						});
					} else if (tab.substring(6,7) == 'r' && newWindow.substring(3,4) == 'r') {
						// Remote to remote
						
						if (oldWindow === newWindow) {
							// Move within window
							// TODO
						} else {
							// Add to first window
							// Add to array
							var data = TCWindows[newWindow.substring(4)];
							data.tabs.splice($(ui.item[0]).index(),0,{
								url: $($(ui.item[0]).children()[0]).attr('url'),
								title: $($(ui.item[0]).children()[0]).attr('title'),
								favicon: ($($(ui.item[0]).children()[0]).attr('src') != 'chrome://favicon/'+$($(ui.item[0]).children()[0]).attr('url')) ? $($(ui.item[0]).children()[0]).attr('src') : ''
							});
							data.name = getWindowName(newWindow);
							// Send new array
							$.post('https://chrometabcloud.appspot.com/update', {window: JSON.stringify(data), windowId: newWindow.substring(4)});

							// Remove from 2nd
							// Remove from array
							var data = TCWindows[oldWindow.substring(4)];
							data.tabs.splice(tab.substring(7),1);
							data.name = getWindowName(oldWindow);
							// Send new array
							$.post('https://chrometabcloud.appspot.com/update', {window: JSON.stringify(data), windowId: oldWindow.substring(4)});
							// Update image
							$($(ui.item[0]).children()[0]).attr('windowid', newWindow);
							
							// Update image
							$($(ui.item[0]).children()[0]).attr('windowid', newWindow);
							$.each($('#'+oldWindow).find('.tabs').children(), function (i, e) {
								$($(e).children()[0]).attr('id','tabimgr'+i);
							});
							$.each($(ui.item[0]).parent().children(), function (i, e) {
								$($(e).children()[0]).attr('id','tabimgr'+i);
							});
						}
					}
					$('.tabslocal').each(function (e) {
						if ($(this).children().length === 0) {
							$(this).parent().detach();
						}
					});
				}
			}
		});
		$("#saved").sortable({
			revert: 100,
			axis: 'y',
			distance: 5,
			containment: 'parent',
			tolerance: 'pointer',
			update: function (e, ui) {
				$.post('https://chrometabcloud.appspot.com/move', { oldIndex: parseInt(ui.item[0].id.substring(4),10), newIndex: $('#saved > fieldset').index($(ui.item[0]))}, function () {
					updateTabs();
				});
			}
		});
	};
	chrome.windows.getAll({populate: true}, function (windows) {
		windows.forEach(function (curWindow) {
			if (('winl'+curWindow.id) === undefined)
				setWindowName('winl'+curWindow.id,'Click to name');
			var winString = '<fieldset class="window" id="winl'+curWindow.id+'"><legend class="windowname">'+getWindowName('winl'+curWindow.id)+'</legend><span class="right"><img class="windowclose" src="images/delete.png" title="Close window"><img class="windowsave" src="images/disk.png" title="Save window" /></span><div class="tabs tabslocal">';
			curWindow.tabs.forEach(function (curTab) {
				if (curTab.pinned !== undefined) {
					localStorage.supportPinned = 1;
				}
				var favicon = (curTab.favIconUrl != '' && curTab.favIconUrl !== undefined) ? curTab.favIconUrl : 'chrome://favicon/'+curTab.url;
				winString += '<div style="float: left"><img id="tabimgl'+curTab.id+'" windowid="winl'+curWindow.id+'" class="tabimg tabimglocal" url="'+curTab.url+'" src="'+favicon+'" title="'+curTab.title.replace(/\"/g,"'")+'" /></div>';
			});
			winString += '</div></fieldset>';
			$('#current').append(winString);
		});
		makeSortable();
		updateScroll();
	});

	$('.tabimg').live('mouseup', function (e) {
		if (e.button === 1 || (e.button === 0 && e.ctrlKey === true)) {
			chrome.tabs.create({
				url: $(this).attr('url'),
				selected: false
			});
		}
	});
	
	// Local options
	
	$('.tabimglocal').live('click', function (e) {
		if (e.button === 0 && e.ctrlKey === false) {
			var tabId = $(this).attr('id').substring(7);
			chrome.tabs.update(parseInt(tabId,10), {selected: true});
		}
	});
	
	$('.windowname').live('click', function (e) {
		var windowId = $(this).parent().attr('id');
		$(this).html('<input type="text" class="windowinput" value="'+getWindowName(windowId)+'" />').removeClass('windowname');
		$(this).find('input').focus();
	});
	
	$('.windowinput').live('blur', function (e) {
		var windowId = $(this).parent().parent().attr('id');
        var oldWindowName = getWindowName(windowId);
		setWindowName(windowId, $(this).val());
		$(this).parent().text(getWindowName(windowId)).addClass('windowname');
        
		var trackedWindows = chrome.extension.getBackgroundPage().trackedWindows;
        // Remote windows
		if (windowId.substring(3,4) == 'r') {
			var data = TCWindows[windowId.substring(4)];
			data.name = getWindowName(windowId);
			$.post('https://chrometabcloud.appspot.com/update', {window: JSON.stringify(data), windowId: windowId.substring(4)});
            //if this window is tracked by a local window, update the local windows name as well    
            for (var localWindowId in trackedWindows) {
                if (trackedWindows.hasOwnProperty(localWindowId) && 
                    (trackedWindows[localWindowId] == parseInt(windowId.substring(4), 10))) {
                    /* update local window name */
                    /* set the local chrome window name */
                    setWindowName('winl'+ localWindowId, getWindowName(windowId));
                    /* update the name in popup window */
                    $("winl" + localWindowId).text(getWindowName('winl'+ localWindowId));
                }
            }

		} else if ((windowId.substring(3,4) == 'l') && 
                   (getWindowName(windowId) !== oldWindowName)) {
            // local windows and name changed
            /* renaming local windows will destroy the window tracking property,
            *  if this local window is tracking a remote window 
            */
            delete trackedWindows[windowId.substring(4)];
        }
	});
	
	$('.windowinput').live('keypress', function (e) {
		if (e.which === 13) {
			$(this).blur();
		} else {
			return true;
		}
		
	})
	
	$('.windowsave').live('click', function (e) {
		var windowId = parseInt($(this).parent().parent().attr('id').substring(4),10);
		var img = this;
		$(img).attr('src','images/arrow_refresh.png').removeClass('windowsave');
		chrome.tabs.getAllInWindow(windowId, function (tabs) {
			var data = {};
			if (getWindowName('winl'+windowId) == 'Click to name') {
				var date = new Date();
				var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
				data.name = months[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear()+' - '+date.toLocaleTimeString();
			} else {
				data.name = getWindowName('winl'+windowId);
			}
			data.tabs = [];
			tabs.forEach(function (tab) {
				data.tabs.push({
					url: tab.url,
					title: tab.title,
					favicon: (tab.favIconUrl != '' && tab.favIconUrl !== undefined) ? tab.favIconUrl : '',
					pinned: (tab.pinned) ? true : false
				});
			});
            
            /* if this window is tracked by a saved window, we should update the saved window, otherwise add */
            var trackedWindowId = chrome.extension.getBackgroundPage().trackedWindows[windowId];
            if (trackedWindowId === undefined) {
                $.post('https://chrometabcloud.appspot.com/add', {window: JSON.stringify(data)}, 
                        function () { 
                            $(img).attr('src','images/accept.png');
                            $(img).attr('title','Window saved');
                            /* add local window to tracked windows, the remote windowId is unknown at this point,
                            * but it will eventually be updated in updateTabs() when rebuild the trackedWindows db.
                            */
                            chrome.extension.getBackgroundPage().trackedWindows[windowId] = -1;
                            updateTabs();
                        
                        }
                       );
                
            } else {
                $.post('https://chrometabcloud.appspot.com/update', {window: JSON.stringify(data), windowId: trackedWindowId},
                       function () {
                        $(img).attr('src','images/accept.png');
                        $(img).attr('title','Window saved');
                        updateTabs();
                       });
                     
            }
		});
	});
	
	
	$('.windowopen').live('click', function (e) {
		var windowId = parseInt($(this).parent().parent().attr('id').substring(4),10);
		chrome.extension.sendMessage({method : "open_saved_window", 
                                      windowId : windowId,
                                      tabs: TCWindows[windowId].tabs
                                      },
                                      function (response) {
                                        console.log(response.localWindowId);
                                        console.log(getWindowName('winr'+windowId));
                                        /* set the local chrome window name */
                                        setWindowName('winl'+ response.localWindowId, getWindowName('winr'+windowId));
                                        /* update the name in popup window */
                                        $("winl" + response.localWindowId).text(getWindowName(windowId));
                                        }
                                    );
	});
	
	$('.windowdelete').live('click', function (e) {
		if (localStorage.deleteconfirm === 'yes') {
			$(this).parent().html('<span class="confirm">Confirm: <img class="windowreallydelete" title="Delete window" src="images/delete.png" /></span>');
		} else {
			var windowId = parseInt($(this).parent().parent().attr('id').substring(4),10);
			$(this).attr('src','images/arrow_refresh.png');
			var self = this;
			$.post('https://chrometabcloud.appspot.com/remove', {window: windowId}, function () {
                //remove the tracking info in the db
                removeTrackRecByRWinId(windowId);            
				updateTabs();
			});
		}
	});
	
	$('.windowreallydelete').live('click', function (e) {
		var windowId = parseInt($(this).parent().parent().parent().attr('id').substring(4),10);
		$(this).attr('src','images/arrow_refresh.png');
		var self = this;
		$.post('https://chrometabcloud.appspot.com/remove', {window: windowId}, function () {
            //remove the tracking info in the db
            removeTrackRecByRWinId(windowId);            
			updateTabs();
		});
	});
	
	$('.windowclose').live('click', function (e) {
		if (localStorage.deleteconfirm === 'yes') {
			$(this).parent().html('<span class="confirm">Confirm: <img class="windowreallyclose" title="Close window" src="images/delete.png" /></span>');
		} else {
			var windowId = parseInt($(this).parent().parent().attr('id').substring(4),10);
			chrome.windows.remove(windowId);
            delete chrome.extension.getBackgroundPage().trackedWindows[windowId];
			$(this).parent().parent().remove()
		}
	});
	
	$('.windowreallyclose').live('click', function (e) {
		var windowId = parseInt($(this).parent().parent().parent().attr('id').substring(4),10);
		chrome.windows.remove(windowId);
        delete chrome.extension.getBackgroundPage().trackedWindows[windowId];
		$(this).parent().parent().parent().remove()
	});
	
	var setInfo = function (info) {
		$('#saved').html('<div class="info">'+info+'</div>');
		updateScroll();
	}
	
	var TCWindows = [];

	var updateTabs = function (triedAutoLogin) {
		setInfo('Loading...');
		$.get('https://chrometabcloud.appspot.com/tabcloud', function (data) {
			if (data.status !== undefined) {
				if (data.status == 'loggedin') {
					if (data.windows.length == 0) {
						setInfo('You haven\'t saved any windows yet!');	
					} else {
						$('#saved').html("");
						TCWindows = data.windows;
						var i = 0;
                        var newTrackedWindows = {};
                        data.windows.forEach(function (curWindow) {
							setWindowName('winr'+i,curWindow.name);
							var winString = '<fieldset class="window" id="winr'+i+'"><legend class="windowname">'+curWindow.name+'</legend><span class="right"><img class="windowdelete" src="images/delete.png" title="Delete window"><img class="windowopen" src="images/add.png" title="Open window"></span><div class="tabs">';
							var ti = 0;
							curWindow.tabs.forEach(function (curTab) {
								var favicon = (curTab.favicon != '' && curTab.favicon !== undefined) ? curTab.favicon : 'chrome://favicon/'+curTab.url;
								winString += '<div style="float: left"><img id="tabimgr'+(ti++)+'" windowid="winr'+i+'" class="tabimg" src="'+favicon+'" url="'+curTab.url+'" title="'+curTab.title.replace(/\"/g,"'")+'" /></div>';
							});
							winString += '</div></fieldset>';
							$('#saved').append(winString);
                            
                            //update tracking window db, since the remote window id might be changed for ADD and DELETE                            
                            for (var localWindowId in chrome.extension.getBackgroundPage().trackedWindows) {
                                console.log(curWindow.name);
                                console.log(getWindowName('winl' + localWindowId));
                                if (curWindow.name === getWindowName('winl' + localWindowId)) {
                                    newTrackedWindows[localWindowId] = i;
                                }
                            }
                            
                            
                            i++;
						});
                        //update trackedWindows
                        chrome.extension.getBackgroundPage().trackedWindows = newTrackedWindows;
						makeSortable();
						updateScroll();
					}
				} else {
					if (triedAutoLogin === true) {
						setInfo('TabCloud requires you login to load your saved windows<br /><a target="_blank" href="https://chrometabcloud.appspot.com/login">Click here to login</a>');
					} else {
						setInfo('Attempting automatic login...<iframe style="height: 1px; width: 1px; opacity: 0; position: absolute" src="https://chrometabcloud.appspot.com/login"></iframe>');
						setTimeout(function () {
							updateTabs(true);
						}, 1000);
					}
				}
			} else {
				setInfo('Server error, try again later.');
			}
		}, 'json');
	}
	setTimeout(updateTabs, 0);
	
	// Extra links
	
	$('#optionslink').click(function (e) {
		chrome.tabs.create({
			url: chrome.extension.getURL('options.html')
		});
	});				
	
	$('#logoutlink').click(function (e) {
		chrome.tabs.create({
			url: 'https://chrometabcloud.appspot.com/logout'
		});
	});		
	
	// Tips
	
	$('#tips').innerfade({
		speed: 'slow',
		timeout: 4000,
		type: 'random',
		containerheight: '1em'
	});
	
	var scroll = $('#scrollbar');
	scroll.tinyscrollbar({
		axis: 'y'
	});
	var updateScroll = function () {
		$('.viewport').height(Math.min($('.overview').height(), 500));
		scroll.update();
	}
	updateScroll();
	
	// Show body (hidden to make loading less horrible)
	$('body').css('visibility','visible');
},0)});
