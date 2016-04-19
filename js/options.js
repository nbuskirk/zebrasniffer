// Saves options to chrome.storage
function save_options(){
  setModal('show','Saving Options..');
  var mylocation = document.getElementById('mylocation').value;
  var mybypasslist = document.getElementById('mybypasslist').value;
  chrome.storage.sync.set({
    mylocation: mylocation,
    mybypasslist: mybypasslist
  },function(){
    setModal('hide','Options Saved'); 
  })
}
function clear_options(){
  setModal('show','Clearing Options..');
  document.getElementById('mylocation').value = '';
  document.getElementById('mybypasslist').value = '';
  chrome.browserAction.setBadgeText({text: ""});
  chrome.storage.sync.remove(['mylocation', 'mybypasslist'], function() {
    setModal('hide','Options Cleared!');        
  });
}
function restore_options() {
  chrome.storage.sync.get({
    mylocation: null,
    mybypasslist: null
  }, function(items) {
    document.getElementById('mylocation').value = items.mylocation;
    document.getElementById('mybypasslist').value = items.mybypasslist;
  });
}
$(function(){ 
  restore_options();
  $('#save').click(function(){
    save_options();
  })
  $('#unset').click(function(){
    clear_options();
  })  
})