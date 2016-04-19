var views = chrome.extension.getViews({type: "popup"});
for (var i = 0; i < views.length; i++) {
	views[i].document.getElementById('x').innerHTML="My Custom Value";
}