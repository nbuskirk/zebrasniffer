// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.

var alarmRunning = true;

function createAlarm(){
	chrome.alarms.create({when: Date.now() + 1000});
}

chrome.alarms.onAlarm.addListener(function() {
  console.log('alarm fired');
  if(alarmRunning == true){ createAlarm(); } else {
  	//do nothing
  }
});
