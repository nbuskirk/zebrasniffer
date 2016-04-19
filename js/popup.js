/* 

file: popup.js
author: nathan.buskirk@apicasystem.com / apicasystem.com
date: February/March 2016

what it does: chrome extension for zebratester, can be pointed to a controller/remote install of zebratester

usage/buttons:

home - opens a new window with the defined instance of zebratester displayed -- becomes active once options are set.
play - start recording -- becomes active once options are set.
pause - stop recording -- becomes active once options are set.
reset - dumps your chrome cache, sets chromes proxy to your ZT instance, and resets the active recording in ZT. -- becomes active once options are set.
  * reset may also be right clicked on -- this will clear the recording WITHOUT dumping your chrome cache.
pagebreak - inserts a pagebreak -- becomes active once options are set.
settings - configure your zebratester instance here. Can be remote IP or 127.0.0.1 if running locally. 


keyboard shortcuts:
COMMAND is the OSX modifier instead of CTRL on other operating systems!
CTRL/CMD+SHIFT+Z = Open ZebraSniffer

*/


$(function(){ 

var myitems={}; //reference to the json options object -- persists

$('body').on('click', 'a', function(){
  chrome.tabs.create({url: $(this).attr('href')});
  return false;
});
chrome.storage.sync.get({ mylocation:null, mybypasslist:null }, function(items) {
  if(items.mylocation===undefined || items.mylocation=="" || items.mylocation==null){
    console.log('No options set, disabling action buttons.');
  }else {
    myitems.mylocation = items.mylocation;
    myitems.mybypasslist = items.mybypasslist;
    
  }
  update_buttons();
})

function setHomeButton() {
  $('#home').attr('href','http://'+myitems.mylocation+':7990');
  $('#home > button').prop('disabled',false);  
}
function update_buttons() {
  var psl_ = 'http://'+myitems.mylocation+':7996?cmd=getRecordingState';
  $.getJSON(psl_,function(data){
    switch(data.RecordingState){
      case 0:
        //stopBlinker();
        enable_buttons();
        setHomeButton();
        break;
      case 1:
        disable_buttons();

        break;
    }
    update_widget();
  })
}
function update_widget(){
  var psl_ = 'http://'+myitems.mylocation+':7996?cmd=getNumRecordedItems';
  $.getJSON(psl_,function(data){
    chrome.browserAction.setBadgeText({text: data.NumRecordedItems.toString()});
  })
}
function set_proxy(){
  var iList = myitems.mybypasslist.split(",");
  /* Static bypasslist here, add more if necessary */
  iList.push('127.0.0.1');
  iList.push(myitems.mylocation);
  console.log(iList);
  var config = {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        host: myitems.mylocation,
        port: 7997
      },
      bypassList: iList
    }
  };
  chrome.proxy.settings.set({ value: config, scope: 'regular'}, function() { });
}
function remove_proxy(){
  chrome.proxy.settings.clear({scope:'regular'});
}
function enable_buttons(){
  //stopped
  $('#play').prop('disabled',false);
  $('#pause').prop('disabled',true);
  $('#reset').prop('disabled',false);
  $('#pagebreak').prop('disabled',false);
  chrome.browserAction.setBadgeBackgroundColor({color: "#666"});
  
}
function disable_buttons(){
  //recording
 $('#play').prop('disabled',true);
 $('#pause').prop('disabled',false);
 $('#pagebreak').prop('disabled',false);
 chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000"});
}

function query_ps(req){
  var psl_ = 'http://'+myitems.mylocation+':7996?cmd='+req;
  var mydata = $.getJSON(psl_.toString());
  return mydata;
}
function insert_pagebreak(pb) {
  //var comment = 'Demo Pagebreak';
  var psl_ = 'http://'+myitems.mylocation+':7996?cmd=insertPagebreak&comment='+pb;
  $.getJSON(psl_.toString(),function(){
    throw_notification('Pagebreak Inserted', 'Page break has been inserted.')
  });
}
function start_recording(){
  var psl_ = 'http://'+myitems.mylocation+':7996?cmd=startRecording';
  $.getJSON(psl_.toString(),function(){
    set_proxy(); 
    update_buttons();
    throw_notification('Recording Started','ZebraSniffer is recording on: '+myitems.mylocation+'\nYour Proxy is also set. Begin Browsing!')
  });
}
function stop_recording(){
  var psl_ = 'http://'+myitems.mylocation+':7996?cmd=stopRecording';
  $.getJSON(psl_.toString(),function(){
    remove_proxy(); 
    update_buttons();
    throw_notification('Recording Paused.','ZebraSniffer has paused recording.\nProxy Disabled.');
  });
} 
function callback(dumpcache){
  var psl_ = 'http://'+myitems.mylocation+':7996?cmd=clearRecording';
  $.getJSON(psl_.toString(),function(){ 
    update_buttons();
    if(dumpcache==true) { 
      throw_notification('Recording Cleared','Your recording has been reset. Your cache has been cleared and cookies emptied.')
    }else if(dumpcache==false){
      throw_notification('Recording Cleared','Your recording has been reset. Cache kept intact.')
    }
    $('.modal').modal('hide');
  });
}
function throw_notification(title,msg){
  chrome.notifications.create('',{
    type: 'basic',
    title: title,
    message: msg,
    iconUrl: chrome.extension.getURL('icon.png')
  })
}
function reset_recording_keep_cache(){
  $('.modal').modal('show');
  callback(false);
}
function reset_recording(){
  $('.modal').modal('show');
  var removal_start = 0;
  chrome.browsingData.remove({ "since" : removal_start }, {
    "appcache": true,
    "cache": true,
    "cookies": true,
    "downloads": true,
    "fileSystems": true,
    "formData": true,
    "history": true,
    "indexedDB": true,
    "localStorage": true,
    "serverBoundCertificates": true,
    "pluginData": true,
    "passwords": true,
    "webSQL": true
  }, callback(true));
}
$('#setup').click(function(){ 
  if (chrome.runtime.openOptionsPage) { chrome.runtime.openOptionsPage(); } 
  else { window.open(chrome.runtime.getURL('options.html')); }
});
$('#pb').submit(function(event){ 
  insert_pagebreak($('input[type="text"]').val());
  event.preventDefault();
})
$('#play').click(function(){ 
  start_recording();
})
$('#pause').click(function(){
  stop_recording();
})
$('#reset').contextmenu(function(){ 
  reset_recording_keep_cache();
  return false;
})
$('#reset').mousedown(function(event){
  switch(event.which){
    case 1:
      reset_recording();
      break;
    case 2:
      reset_recording_keep_cache();
      break;
  }
  return false;
})
})//jQuery



