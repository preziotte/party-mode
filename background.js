// Chrome extension

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {

  console.log('Button clicked on ' + tab.url + '!');
  chrome.tabs.executeScript({
    file: 'contentscript.js'
  });


});
