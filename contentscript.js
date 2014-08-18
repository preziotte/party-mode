// Chrome extension

var init, context, analyser, source, audio, waveform_array;

var frameLooper = function() {

	window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	 	window.requestAnimationFrame(frameLooper);
 	
 	waveform_array = new Uint8Array(analyser.frequencyBinCount);
 	analyser.getByteFrequencyData(waveform_array);

 	var event = new CustomEvent("waveform", {"detail":waveform_array});
	window.frames[window.frames.length-1].window.document.dispatchEvent(event);

 };


var existing_iframe = document.getElementById('partymode_iframe');

if (existing_iframe != null) {
	document.body.removeChild(existing_iframe);

}
else {

	audio = document.getElementsByTagName("video")[0];

	if (init != 1) {
		context = new (window.AudioContext || window.webkitAudioContext)();
		analyser = context.createAnalyser();
		source = context.createMediaElementSource(audio);
		source.connect(analyser);
		analyser.connect(context.destination);
	}

	var iFrame  = document.createElement ("iframe");
		iFrame.id = 'partymode_iframe';
		iFrame.width = '100%';
		iFrame.height = '100%';
		iFrame.style.position = 'fixed'; 
		iFrame.style.top = 0; 
		iFrame.style.left = 0;
		iFrame.style.zIndex = 2000000000;
		iFrame.style.border = 0;
		iFrame.src = chrome.extension.getURL("index.html");

	console.log("injecting iframe");
	document.body.insertBefore(iFrame, document.body.firstChild);

 	frameLooper();
 	init = 1;

}