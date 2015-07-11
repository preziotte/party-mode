/////////////////////////////////////////////////////////////////////////////////////////////////////

(function () {

	var root = this;  														// use global context rather than window object
	var waveform_array, old_waveform, objectUrl, metaHide, micStream;		// raw waveform data from web audio api
	var WAVE_DATA = []; 													// normalized waveform data used in visualizations

	// main app/init stuff //////////////////////////////////////////////////////////////////////////
	var a = {};	
	a.init = function() {
		console.log("a.init fired");

		// globals & state
		var s = {
			version: '1.6.0',
			debug: (window.location.href.indexOf("debug") > -1) ? true : false,
			// preziotte.com/partymode playlist
			//playlist: ['forgot.mp3', 'chaos.mp3', 'stop.mp3', 'bless.mp3', 'benares.mp3', 'radio.mp3', 'selftanner.mp3', 'startshootin.mp3', 'track1.mp3', 'holdin.m4a', 'waiting.mp3', 'dawn.mp3', 'analog.mp3', 'settle.mp3', 'crackers.mp3', 'nuclear.mp3', 'madness.mp3', 'magoo.mp3', 'around.mp3', 'where.mp3', 'bird.mp3', 'notes.mp3'],
			//playListLinks: ['https://soundcloud.com/mononome', 'https://soundcloud.com/sixfingerz/sixfingerz-out-of-chaos-sttb', 'http://odesza.com/', 'https://soundcloud.com/keithkenniff', 'http://www.holbaumann.com/', 'http://www.holbaumann.com/', 'http://www.blackmothsuperrainbow.com/', 'http://www.littlepeoplemusic.com/', 'https://en.wikipedia.org/wiki/The_1UP_Show', 'https://soundcloud.com/hermitude/holdin-on-hermitude-remix', 'https://soundcloud.com/ceiling_fan', 'http://www.iamsirch.com/', 'http://prettylightsmusic.com/', 'https://soundcloud.com/saycet'],
			// example playlist
			playlist: ['dawn.mp3', 'forgot.mp3'],
			playListLinks: ['http://www.iamsirch.com/', 'https://soundcloud.com/mononome'],
			width : $(document).width(),
			height : $(document).height(),
			sliderVal: 50,												// depricated -- value of html5 slider
			canKick: true,												// rate limits auto kick detector
			metaLock: false,											// overrides .hideHUD() when song metadata needs to be shown

			vendors : ['-webkit-', '-moz-', '-o-', ''],

			drawInterval: 1000/24,										// 1000ms divided by max framerate
			then: Date.now(),											// last time a frame was drawn
			trigger: 'circle',											// default visualization

			hud: 1,														// is hud visible?
			active: null,												// active visualization (string)
			vizNum: 0,													// active visualization (index number)
			thumbs_init: [0,0,0,0,0,0,0,0],								// are thumbnails initialized?
			theme: 0, 													// default color palette
			currentSong : 0,											// current track

			soundCloudURL: null,
			soundCloudData: null,
			soundCloudTracks: null,

			loop: 1,													// current loop index
			loopDelay: [null,20000,5000,1000],							// array of loop options
			loopText: ['off', 'every 20s', 'every 5s', 'every 1s'],
			changeInterval: null										// initialize looping setInterval id

		};
		root.State = s;


		root.context = new (window.AudioContext || window.webkitAudioContext)();

		// append main svg element
		root.svg = d3.select("body").append("svg").attr('id', 'viz')
				.attr("width", State.width)
				.attr("height", State.height);

		a.bind();			// attach all the handlers
		a.keyboard();		// bind all the shortcuts

		if (window.location.protocol.search('chrome-extension') >= 0) {
			a.findAudio();
			return;
		}
		
		if (h.getURLParameter('sc') == null)
			a.loadSound();		
		else
			a.soundCloud();


		};
	a.bind = function() {
		console.log("a.bind fired");
		var click = (Helper.isMobile()) ? 'touchstart' : 'click';

		$('.menu, .icon-menu').on('mouseenter touchstart', function() { h.toggleMenu('open'); });
		$('.menu').on('mouseleave', function() { h.toggleMenu('close'); });
		$('.menu').on(click, 'li', function() { h.vizChange(+$(this).attr('viz-num')); });
		$('.menu').on(click, '.clicker', function() { h.vizChange(+$(this).closest('li').attr('viz-num')); });
		$('.buffer').on(click, function() { window.location.href='http://preziotte.com' });
		$('.song-metadata').on(click, h.songGo);
		$('.wrapper').on(click, function() { h.toggleMenu('close'); });
		$('.icon-pause').on(click, h.togglePlay);
		$('.icon-play').on(click, h.togglePlay);
		$('.icon-forward2').on(click, function() { h.changeSong('n'); });
		$('.icon-backward2').on(click, function() { h.changeSong('p'); });
		$('.icon-expand').on(click, h.toggleFullScreen);
		$('.icon-soundcloud').on(click, function() { h.showModal('#modal-soundcloud'); });
		$('.icon-microphone').on(click, a.microphone);
		$('.sc_import').on(click, a.soundCloud);
		$('.icon-question').on(click, function() { h.showModal('#modal-about'); });
		$('.icon-keyboard2').on(click, function() { h.showModal('#modal-keyboard'); });
		$('.icon-volume-medium').on(click, function() { audio.muted = (audio.muted == true) ? false : true; });
		$('.icon-github2').on(click, function() { window.open('http://github.com/preziotte/party-mode','_blank'); });
		$('.icon-loop-on').on(click, function() { 
			$(this).find('b').text(State.loopText[(State.loop)%4]);
			h.infiniteChange(State.loopDelay[(State.loop++)%4]); 
		});
		$('.md-close').on(click, h.hideModals);
		$('.dotstyle').on(click, 'li', function() { h.themeChange($(this).find('a').text()); });
		$('#slider').on('input change', function() { analyser.smoothingTimeConstant = 1-(this.value/100); }); 
		$('#slider').on('change', function() { $('#slider').blur(); }); 
		$('.i').on('mouseenter', h.tooltipReplace);
		$('.i').on('mouseleave', h.tooltipUnReplace);

		$(document).on('dragenter', h.stop );
		$(document).on('dragover', h.stop);
		$(document).on('drop', h.handleDrop );

		document.addEventListener("waveform", function (e) { 
			//console.log(e.detail);
			waveform_array = e.detail;
			//audio = this;
		}, false);


		// hide HUD on idle mouse
		$('body').on('touchstart mousemove',function() {
			h.showHUD();
			clearTimeout(hide);
			hide = setTimeout(function() { h.hideHUD(); }, 2000);
		});
		hide = setTimeout(function() { h.hideHUD(); }, 2000);

		// update state on window resize
		window.onresize = function(event) { h.resize(); };
		$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', h.resize);  //http://stackoverflow.com/a/9775411


		};
	a.keyboard = function() {
		console.log("a.keyboard fired");

		Mousetrap.bind('esc', h.hideModals);
		Mousetrap.bind('space', h.togglePlay);
		Mousetrap.bind('f', h.toggleFullScreen); 
		Mousetrap.bind('m', function() { h.toggleMenu('toggle') }); 
		Mousetrap.bind('c', function() { h.changeSong(); });
		Mousetrap.bind('l', function() { $('.icon-loop-on').trigger('click'); });
		Mousetrap.bind('k', function() { $('.icon-keyboard2').trigger('click'); });
		Mousetrap.bind('s', function() { h.showModal('#modal-soundcloud'); });
		Mousetrap.bind('v', function() { h.changeSong('n'); });
		Mousetrap.bind('x', function() { h.changeSong('p'); });

		Mousetrap.bind('1', function() { State.trigger = 'circle'; });
		Mousetrap.bind('2', function() { State.trigger = 'chop'; });
		Mousetrap.bind('3', function() { State.trigger = 'icosahedron'; });
		Mousetrap.bind('4', function() { State.trigger = 'grid'; });
		Mousetrap.bind('5', function() { State.trigger = 'equal'; });
		Mousetrap.bind('6', function() { State.trigger = 'spin'; });
		Mousetrap.bind('7', function() { State.trigger = 'hexbin'; });
		Mousetrap.bind('8', function() { State.trigger = 'voronoi'; });

		Mousetrap.bind('up', function() { h.vizChange(State.vizNum-1); });
		Mousetrap.bind('down', function() { h.vizChange(State.vizNum+1); });
		Mousetrap.bind('left', function() { h.themeChange(State.theme-1); });
		Mousetrap.bind('right', function() { h.themeChange(State.theme+1); });

		};

	a.loadSound = function() {
		console.log("a.loadSound fired");

		if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
			console.log(" -- sound loaded via ajax request");
			$('.menu-controls').hide();
			a.loadSoundAJAX();
		}
		else {
			console.log(" -- sound loaded via html5 audio");
			var path = 'mp3/'+State.playlist[0];
			a.loadSoundHTML5(path);
	    	h.readID3(path);
		}

		};
	a.loadSoundAJAX = function() {
		console.log('a.loadSoundAJAX fired');

		audio = null;
	    var request = new XMLHttpRequest();
	    request.open("GET", "mp3/"+State.playlist[0], true);
	    request.responseType = "arraybuffer";
	 
	    request.onload = function(event) {
	        var data = event.target.response;
	 
	        a.audioBullshit(data);
	    };
	 
	    request.send();

		};
	a.loadSoundHTML5 = function(f) {
		console.log('a.loadSoundHTML5 fired');

		audio = new Audio();
		//audio.remove();
		audio.src = f; 
	    //audio.controls = true;
	    //audio.loop = true;
	    audio.autoplay = true;
 		audio.addEventListener('ended', function() { h.songEnded(); }, false);
		
		$('#audio_box').empty();
		document.getElementById('audio_box').appendChild(audio);
        a.audioBullshit();

		};

	a.soundCloud = function() {
		console.log('a.soundCloud fired');		

		// if mozilla or safar, just loadsound instead
		if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
			a.loadSound();	
			return;	
		}
		if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
			a.loadSound();	
			return;	
		}

		State.soundCloudURL = $('#sc_input').val() || h.getURLParameter('sc');
		$('#sc_input').val(State.soundCloudURL);
		$('#sc_url span').html(State.soundCloudURL);

		if (State.soundCloudURL == null) return;

		State.currentSong = 0

		// use /resolve to get tracks/playlists/whatever from url
		$.get(
		  'http://api.soundcloud.com/resolve.json?url=' + State.soundCloudURL + '&client_id=67129366c767d009ecc75cec10fa3d0f', 
		  function (result) {
		  	State.soundCloudData = result;
		    console.log(result);
		    console.log(result.kind);

	    	if (result.kind == "user") {
			    console.log(result.id);

				// https://stackoverflow.com/questions/10159802/getting-specific-users-track-list-with-soundcloud-api
				// get all tracks from user via /users/{user_id}/tracks
				SC.initialize({
					client_id: '67129366c767d009ecc75cec10fa3d0f'
				});

				SC.get("/users/"+result.id+"/tracks", function(sound) {
					State.soundCloudTracks = sound.length;
					State.soundCloudData = sound;
					sound = sound[0];
					console.log(sound);
					console.log(sound.title)
					console.log(sound.user.permalink)
	    			//sound.uri = sound.uri.replace(/.*?:\/\//g, "http://www.corsproxy.com/");

					h.renderSongTitle(sound);
					a.loadSoundHTML5(sound.uri+'/stream?client_id=67129366c767d009ecc75cec10fa3d0f');

		});

	    	}

	    	if (result.kind == "track") {
				State.soundCloudTracks = 1;
				State.soundCloudData = result;
	    		console.log(result.uri);
	    		console.log(result.title);
	    		console.log(result.user.username);

	    		// http://www.corsproxy.com/
	    		//result.uri = result.uri.replace(/.*?:\/\//g, "http://www.corsproxy.com/");
				a.loadSoundHTML5(result.uri+'/stream?client_id=67129366c767d009ecc75cec10fa3d0f');
				h.renderSongTitle(result);

	    	}

	    	if (result.kind == "playlist") {
				State.soundCloudTracks = result.tracks.length;
				State.soundCloudData = result.tracks;
	    		console.log(result.tracks.length);
	    		console.log(result.title);
	    		console.log(result.user.username);
				h.renderSongTitle(result.tracks[0]);
				a.loadSoundHTML5(result.tracks[0].uri+'/stream?client_id=67129366c767d009ecc75cec10fa3d0f');

	    	}
		  }
		);
		return;

		// to get tracks /users/{user_id}/tracks

		SC.initialize({
			client_id: '67129366c767d009ecc75cec10fa3d0f'
		});

		SC.get("/tracks/115225139", function(sound) {
			console.log(sound);
			console.log(sound.title)
			$('.song-metadata').html(sound.title);
			$('.song-metadata').addClass("show-meta");

			State.metaLock = true;

		// in 3 seconds, remove class unless lock
		metaHide = setTimeout(function() { 
			State.metaLock = false;
			$('.song-metadata').removeClass("show-meta");

		}, 3000); 	
		a.loadSoundHTML5(sound.uri+'/stream?client_id=67129366c767d009ecc75cec10fa3d0f');

		});
				//	 SC.get("/tracks/75868018", {}, function(sound){
				//	 	console.log(sound);
				//	     console.log("Sound URI: "+sound.uri+'/stream?client_id=67129366c767d009ecc75cec10fa3d0f');			// append to sound.uri --> /stream?client_id=YOUR_ID
					     //$("#audio-test").attr("src", sound.uri);
				//		     a.loadSoundHTML5(sound.uri+'/stream?client_id=67129366c767d009ecc75cec10fa3d0f');
				//		 });

					 //  SC.stream("/tracks/75868018", function(sound){
					 //     $("audio-test").attr("src", sound.uri);
					 // });
		};
	a.microphone = function() {
		console.log('a.microphone fired');

		navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

		if (micStream == null) {
			if (navigator.getUserMedia) {
				navigator.getUserMedia({audio: true, video: false}, function(stream) {
					console.log(" --> audio being captured");
					micStream = stream;
					console.log(micStream);
					var src = window.URL.createObjectURL(micStream);
		 			root.source = context.createMediaStreamSource(micStream)
					source.connect(analyser);
					analyser.connect(context.destination);	
					audio.pause();
					//audio.src = null;
				}, h.microphoneError);
			} else {
			  // fallback.
			}
		}
		else {
			console.log(" --> turning off")
			micStream.stop();
			micStream = null;
			audio.play();
		}

		};

	a.audioBullshit = function (data) {
		// uses web audio api to expose waveform data
		console.log("a.audioBullshit fired");

		root.analyser = context.createAnalyser();
        //analyser.smoothingTimeConstant = .4; // .8 default
		
		if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
	        root.source = context.createBufferSource();
	        source.buffer = context.createBuffer(data, false);
	        source.loop = true;
	        source.noteOn(0);
	    }
	    else {
	    	// https://developer.mozilla.org/en-US/docs/Web/API/AudioContext.createScriptProcessor
	 		root.source = context.createMediaElementSource(audio);  // doesn't seem to be implemented in safari :(
	 		//root.source = context.createMediaStreamSource()
	 		//root.source = context.createScriptProcessor(4096, 1, 1);  

	    }

		source.connect(analyser);
		analyser.connect(context.destination);

		a.frameLooper();
		};
	a.findAudio = function() {
		// unused.
		console.log("a.findAudio fired");

		$('video, audio').each(function() {
			//h.loadSoundHTML5(this.src);
			// if .src?  if playing?
			audio = this;
			a.audioBullshit();
		});

		//$('object')
		//swf?  SWFObject?
		// can use soundmanager2 -- > http://schillmania.com/projects/soundmanager2/
		// waveformData in sound object gives 256 array.  just multiply by 4?

		};
	a.frameLooper = function(){
		//console.log("a.frameLooper fired");

		// recursive function used to update audio waveform data and redraw visualization

		window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	 	window.requestAnimationFrame(a.frameLooper);

	    now = Date.now();
	    delta = now - State.then;
	    
	    if (audio)
	        $('#progressBar').attr('style','width: '+(audio.currentTime/audio.duration)*100+"%");
	     
	    // some framerate limiting logic -- http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
	    if (delta > State.drawInterval) {
	        State.then = now - (delta % State.drawInterval);
	    
			// update waveform data
			if (h.detectEnvironment() != 'chrome-extension') {
			 	waveform_array = new Uint8Array(analyser.frequencyBinCount);
			 	analyser.getByteFrequencyData(waveform_array);
			 	//analyser.getByteTimeDomainData(waveform_array);
			}
			
			// if (c.kickDetect(95)) {
			// 	h.themeChange(Math.floor(Math.random() * 6));
			//  	h.vizChange(Math.floor(Math.random() * 7));
			// }

			// draw all thumbnails
		 	r.circle_thumb();
		 	r.chop_thumb();
		 	r.icosahedron_thumb();
		 	r.grid_thumb();
			r.equal_thumb();
			r.spin_thumb();
			r.hexbin_thumb();

		 	// draw active visualizer
			switch (State.trigger) {
			  case "circle": case 0:
			  	State.vizNum = 0;
			  	r.circle();
			  	break;
			  case "chop": case 1:
			  	State.vizNum = 1;
			  	r.chop();
			  	break;
			  case "icosahedron": case 2:
			  	State.vizNum = 2;
			  	r.icosahedron();
			  	break;
			  case "grid": case 3:
			  	State.vizNum = 3;
			  	r.grid();
			  	break;
			  case "equal": case 4:
			  	State.vizNum = 4;
			  	r.equal();
			  	break;
			  case "spin": case 5:
			  	State.vizNum = 5;
			  	r.spin();
			  	break;
			  case "hexbin": case 6:
			  	State.vizNum = 6;
			  	r.hexbin();
			  	break;
			  case "voronoi": case 7:
			  	State.vizNum = 7;
			  	r.voronoi();
			  	break;
			  default:
			  	State.vizNum = 0;
			    r.circle();
			  	break;
			};

		}

		}
	root.App = a;

	// manipulating/normalizing waveform data ///////////////////////////////////////////////////////
	var c = {}; 
	c.kickDetect = function(threshold) {
		var kick = false;

		var deltas = $(waveform_array).each(function(n,i) {
			if (!old_waveform) return 0;
			else return old_waveform[i]-n;
		});
		var s = d3.sum(deltas)/1024;

		if (s>threshold && State.canKick) {
			kick = true;
			State.canKick = false;
	        setTimeout(function(){
	            State.canKick = true;
	        }, 5000);
		}

		root.old_waveform = waveform_array;

		return kick;
		};
	c.normalize = function(coef, offset, neg) {

		//https://stackoverflow.com/questions/13368046/how-to-normalize-a-list-of-positive-numbers-in-javascript

		var coef = coef || 1;
		var offset = offset || 0;
		var numbers = waveform_array;
		var numbers2 = [];
		var ratio = Math.max.apply( Math, numbers );
		var l = numbers.length

		for (var i = 0; i < l; i++ ) {
			if (numbers[i] == 0)
				numbers2[i] = 0 + offset;
			else
				numbers2[i] = ((numbers[i]/ratio) * coef) + offset;

			if (i%2 == 0 && neg)
				numbers2[i] = -Math.abs(numbers2[i]);
		}
		return numbers2;
		
		};
	c.normalize_binned = function(binsize, coef, offset, neg) {

		var numbers = [];
		var temp = 0;
	 	for (var i = 0; i < waveform_array.length; i++) {
	 		temp += waveform_array[i];
	    	if (i%binsize==0) {
	    		numbers.push(temp/binsize);
	    		temp = 0;
	    	}
	  	}

		var coef = coef || 1;
		var offset = offset || 0;
		var numbers2 = [];
		var ratio = Math.max.apply( Math, numbers );
		var l = numbers.length

		for (var i = 0; i < l; i++ ) {
			if (numbers[i] == 0)
				numbers2[i] = 0 + offset;
			else
				numbers2[i] = ((numbers[i]/ratio) * coef) + offset;

			if (i%2 == 0 && neg)
				numbers2[i] = -Math.abs(numbers2[i]);
		}
		return numbers2;
		
		};
	c.total = function() { return Math.floor(d3.sum(waveform_array)/waveform_array.length); };
	c.total_normalized = function() {};
	c.bins_select = function(binsize) {
		var copy = [];
	 	for (var i = 0; i < 500; i++) {
	    	if (i%binsize==0)
	    		copy.push(waveform_array[i]);
	  	}
	  	return copy;
		};
	c.bins_avg = function(binsize) {
		var binsize = binsize || 100;
		var copy = [];
		var temp = 0;
	 	for (var i = 0; i < waveform_array.length; i++) {
	 		temp += waveform_array[i];
	    	if (i%binsize==0) {
	    		copy.push(temp/binsize);
	    		temp = 0;
	    	}
	  	}
	  	//console.log(copy);
	  	return copy;
		};	
	root.Compute = c;

	// rendering svg based on normalized waveform data //////////////////////////////////////////////
	var r = {};	
	r.circle = function() {

		if (State.active != 'circle') {
			State.active = 'circle';
			$('body > svg').empty();
		}

	 	WAVE_DATA = c.bins_select(70);

		var x = d3.scale.linear()
			.domain([0, d3.max(WAVE_DATA)])
			.range([0, 420]);

		var slideScale = d3.scale.linear()
			.domain([1, 100])
			.range([0, 2]);

		root.bars = svg.selectAll("circle")
				.data(WAVE_DATA, function(d) { return d; });

		// bars.attr("r", function(d) { return x(d) + ""; })
		// 	.attr('transform', "scale("+slideScale(State.sliderVal)+")")
		// 	.attr("cy", function(d, i) { return '50%'; })
		// 	.attr("cx", function(d, i) { return '50%'; });

		bars.enter().append("circle")
			.attr('transform', "scale("+slideScale(State.sliderVal)+")")
			.attr("cy", function(d, i) { return '50%'; })
			.attr("cx", function(d, i) { return '50%'; })
			.attr("r", function(d) { return x(d) + ""; });

		bars.exit().remove();

		};
	r.circle_thumb = function() {

		if (State.thumbs_init[0] != 'init') {
			State.thumbs_init[0] = 'init';
			root.svg_thumb_one = d3.select("#circle").append("svg")
				.attr("width", '100%')
				.attr("height", '100%');
		}

	 	WAVE_DATA = c.bins_select(200);

		var x_t1 = d3.scale.linear()
			.domain([0, d3.max(WAVE_DATA)])
			.range([0, 80]);

		var bars_t1 = svg_thumb_one
			.selectAll("circle")
			.data(WAVE_DATA, function(d) { return d; });

		// bars_t1.attr("r", function(d) { return x_t1(d) + ""; })
		// 	.attr("cy", function(d, i) { return '50%'; })
		// 	.attr("cx", function(d, i) { return '50%'; });

		bars_t1.enter().append("circle")
			.attr("cy", function(d, i) { return '50%'; })
			.attr("cx", function(d, i) { return '50%'; })
			.attr("r", function(d) { return x_t1(d) + ""; });

		bars_t1.exit().remove();
		}
	r.chop = function() {

		if (State.active != 'chop') {
			State.active = 'chop';
			$('body > svg').empty();
		}

	 	WAVE_DATA = c.bins_select(70);

		var x = d3.scale.linear()
			.domain([0, d3.max(WAVE_DATA)])
			.range([0, 1000]);

		var bars = svg.selectAll("rect")
				.data(WAVE_DATA, function(d) { return d; });

		bars.attr("width", function(d) { return '200%'; })
			.attr("height", function(d) { return x(d) + ""; })
			.attr("y", function(d, i) { return '0%'; })
			.attr("x", function(d, i) { return '-50%'; });

		bars.enter().append("rect")
			.attr("y", function(d, i) { return '0%'; })
			.attr("x", function(d, i) { return '-50%'; })
			.attr("width", function(d) { return '200%'; })
			.attr("height", function(d) { return x(d) + ""; });

		bars.exit().remove();
		};	
	r.chop_thumb = function() {

		if (State.thumbs_init[1] != 'init') {
			State.thumbs_init[1] = 'init';
			root.svg_thumb_two = d3.select("#chop").append("svg")
				.attr("width", '100%')
				.attr("height", '100%');
		}

	 	WAVE_DATA = c.bins_select(200);

		var x = d3.scale.linear()
		.domain([0, d3.max(WAVE_DATA)])
		.range([10, 200]);

		var bars = svg_thumb_two.selectAll("rect")
				.data(WAVE_DATA, function(d) { return d; });

		// bars.attr("width", function(d) { return '200%'; })
		// 	.attr("height", function(d) { return x(d) + ""; })
		// 	.attr("y", function(d, i) { return '0%'; })
		// 	.attr("x", function(d, i) { return '-60%'; });

		bars.enter().append("rect")
			.attr("y", function(d, i) { return '-20%'; })
			.attr("x", function(d, i) { return '-50%'; })
			.attr("width", function(d) { return '250%'; })
			.attr("height", function(d) { return x(d) + ""; });

		bars.exit().remove();
		}
	r.icosahedron = function() {

		// http://bl.ocks.org/mbostock/7782500
		
		if (State.active == 'icosahedron') {

	  		var time = Date.now() - t0;
			var xx = c.total()/100;
			h.applyStyles("body > svg path","transform: scale("+xx+","+xx+"); ");
			//$('body > svg path').attr("style", "transform: skew("+xx+"deg,"+xx+"deg)");

	  		// 1
			projection.rotate([time * velocity[0], time * velocity[1]]);
			face
		    	.each(function(d) { d.forEach(function(p, i) { d.polygon[i] = projection(p); }); })
		    	.style("display", function(d) { return d.polygon.area() > 0 ? null : "none"; })
		    	.attr("d", function(d) { return "M" + d.polygon.join("L") + "Z"; })

		    // 2
			projection2.rotate([time * velocity2[0], time * velocity2[1]]);
			face2
				.each(function(d) { d.forEach(function(p, i) { d.polygon[i] = projection2(p); }); })
				.style("display", function(d) { return d.polygon.area() > 0 ? null : "none"; })
				.attr("d", function(d) { return "M" + d.polygon.join("L") + "Z"; })

			// 3
			projection3.rotate([time * velocity3[0], time * velocity3[1]]);
			face3
				.each(function(d) { d.forEach(function(p, i) { d.polygon[i] = projection3(p); }); })
				.style("display", function(d) { return d.polygon.area() > 0 ? null : "none"; })
				.attr("d", function(d) { return "M" + d.polygon.join("L") + "Z"; })

			return;
		}

		State.active = 'icosahedron';
		$('body > svg').empty();

		width = State.width;
		height = State.height;
		root.velocity = [.10, .005];
		root.velocity2 = [-.10, -.05];
		root.velocity3 = [.10, .1];
		t0 = Date.now();

		// 1
		root.projection = d3.geo.orthographic()
		    .scale(height/2)
		    .translate([width/2, height/2])
            .center([0, 0]);

		svg = d3.select("body").append("svg")
			.attr("class", "isoco1")
		    .attr("width", width)
		    .attr("height", height);

		root.face = svg.selectAll("path")
			.data(h.icosahedronFaces)
			.enter()
			.append("path").attr("class", "isoco")
			.each(function(d) { d.polygon = d3.geom.polygon(d.map(projection)); });

		// 2
		root.projection2 = d3.geo.orthographic()
		    .scale(height/4)
		    .translate([width/2, height/2])
  		    .center([0, 0]);

		svg2 = d3.select("body").append("svg")
			.attr("class", "isoco2")
		    .attr("width", width)
		    .attr("height", height);

		root.face2 = svg2.selectAll("path")
			.data(h.icosahedronFaces)
			.enter()
			.append("path").attr("class", "isoco")
			.each(function(d) { d.polygon = d3.geom.polygon(d.map(projection2)); });

		// 3
		root.projection3 = d3.geo.orthographic()
		    .scale(height/1)
		    .translate([width/2, height/2])
  		    .center([0, 0]);

		svg3 = d3.select("body").append("svg")
			.attr("class", "isoco3")
		    .attr("width", width)
		    .attr("height", height);

		root.face3 = svg3.selectAll("path")
			.data(h.icosahedronFaces)
			.enter()
			.append("path").attr("class", "isoco")
			.each(function(d) { d.polygon = d3.geom.polygon(d.map(projection3)); });

		};
	r.icosahedron_thumb = function() {

		if (State.thumbs_init[2] == 'init') {

			var xx_t0 = c.total()/100;
	  		var time_t0 = Date.now() - t0_thumb;
	  		h.applyStyles("#icosahedron svg path","transform: scale("+xx_t0+","+xx_t0+"); ")

			projection_thumb.rotate([time_t0 * velocity_thumb[0], time_t0 * velocity_thumb[1]]);

			face_thumb
			    .each(function(d) { d.forEach(function(p, i) { d.polygon[i] = projection_thumb(p); }); })
		        .style("display", function(d) { return d.polygon.area() > 0 ? null : "none"; })
			    .attr("d", function(d) { return "M" + d.polygon.join("L") + "Z"; })

			return;
		}

		State.thumbs_init[2] = 'init';

		var width = $('#icosahedron').width();
		var height = $('#icosahedron').height();
		root.velocity_thumb = [.01, .05];
		root.t0_thumb = Date.now();

		root.projection_thumb = d3.geo.orthographic()
		    .scale(height*1.5)
		    .translate([width/2, height/2])
            .center([0, 0]);

		root.svg_thumb_three = d3.select("#icosahedron").append("svg")
			.attr("width", width)
			.attr("height", height);
		
		root.face_thumb = svg_thumb_three.selectAll("path")
		    .data(h.icosahedronFaces)
		    .enter().append("path")
		    .each(function(d) { d.polygon = d3.geom.polygon(d.map(projection_thumb)); });

		};
	r.grid2 = function(data) {
		// http://bl.ocks.org/mbostock/5731578

		if (State.active == 'grid') {

		  var dt = Date.now() - time;
		  projection.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);
		  feature.attr("d", path);

			return;
		}
		$('body > svg').empty();
		State.active = 'grid';

	    root.rotate = [10, -10],
	    root.velocity = [.03, -.01],
	    root.time = Date.now();

		root.projection = d3.geo.orthographic()
		    .scale(240)
		    .translate([State.width / 2, State.height / 2])
		    .clipAngle(90 + 1e-6)
		    .precision(.3);

		root.path = d3.geo.path()
		    .projection(projection);

		graticule = d3.geo.graticule().minorExtent([[-180, -89], [180, 89 + 1e-4]]);


		svg.append("path")
		    .datum({type: "Sphere"})
		    .attr("class", "sphere")
		    .attr("d", path);

		svg.append("path")
		    .datum(graticule)
		    .attr("class", "graticule")
		    .attr("d", path);

		// svg.append("path")
		//     .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
		//     .attr("class", "equator")
		//     .attr("d", path);

		root.feature = svg.selectAll("path");

		};
	r.grid = function(data) {

		if (State.active == 'grid') {

			var xx = c.total()/100 + 1;
				xx = (xx<1) ? 1 : xx;
				xx = (xx>1.1) ? 1.1 : xx;

			var style = '';
			for (var i = 0; i < State.vendors.length; i++) {
				style += State.vendors[i]+"transform: scale("+xx+","+xx+"); ";
			}
			$('body > svg path').attr("style", style);

			projection.rotate([λ(p), φ(p)]);
			//projection.rotate([λ(p), 0]);
			svg.selectAll("path").attr("d", path);
			p=p+5;
			//((c.total()/100)*10);

			step = Math.floor((c.total()/100)*60);
			step = (step<5) ? 5 : step;

			graticule = d3.geo.graticule()
				.minorStep([step, step])
				.minorExtent([[-180, -90], [180, 90 + 1e-4]]);

			grat.datum(graticule)
				.attr("class", "graticule")
				.attr("d", path);

			return;
		}

		p = 0;
		State.active = 'grid';
		$('body > svg').empty();

		projection = d3.geo.gnomonic()
		    .clipAngle(80)
		    .scale(500);

		path = d3.geo.path()
		    .projection(projection);
		
		graticule = d3.geo.graticule()
		    .minorStep([5, 5])
     		.minorExtent([[-180, -90], [180, 90 + 1e-4]]);

		// lamda / longitude
		λ = d3.scale.linear()
		    .domain([0, State.width])
		    .range([-180, 180]);

		// phi / latitude
		φ = d3.scale.linear()
		    .domain([0, State.height])
		    .range([90, -90]);
		 
		grat = svg.append("path")
		    .datum(graticule)
		    .attr("class", "graticule")
		    .attr("d", path);

		};
	r.grid_thumb = function(data) {

		var width = $('#grid').width();
		var height = $('#grid').height();

		if (State.thumbs_init[3] == 'init') {

			var xx = c.total()/100 + 1;
				xx = (xx==1) ? 0 : xx;
			//	xx = (xx>1.4) ? 1.4 : xx;

			var style = '';
			for (var i = 0; i < State.vendors.length; i++) {
				style += State.vendors[i]+"transform: scale("+xx+","+xx+"); ";
			}
			$('#grid svg path').attr("style", style);

			// step = Math.floor((c.total()/100)*5);
			// step = (step<1) ? 1 : step;

			// graticule = d3.geo.graticule()
			// 	.minorStep([step, step])
			// 	.minorExtent([[-180, -90], [180, 90 + 1e-4]]);

			// grat.datum(graticule)
			// 	.attr("class", "graticule")
			// 	.attr("d", path);

			return;
		}

		State.thumbs_init[3] = 'init';
		$('#grid svg').empty();

		projection = d3.geo.gnomonic()
		    .clipAngle(80);
		    //.scale(50)

		path = d3.geo.path()
		    .projection(projection);
		
		graticule = d3.geo.graticule()
		    .minorStep([2, 2])
     		.minorExtent([[-180, -90], [180, 90 + 1e-4]]);
 
		svg_thumb_four = d3.select("#grid").append("svg")
			.attr("width", width)
			.attr("height", height);

		grat = svg_thumb_four.append("path")
		    .datum(graticule)
		    .attr("class", "graticule")
		    .attr("d", path);

		};
	r.equal = function() {

		if (State.active != 'equal') {
			State.active = 'equal';
		}

		$('body > svg').empty();
		var marginX = Math.floor(State.width/10);
		var marginY = Math.floor(State.height/10);
		var w = Math.floor((State.width - marginX*2)/21);

	 	WAVE_DATA = c.normalize_binned(50);

		var x = d3.scale.linear()
			.domain([0, WAVE_DATA.length])
			.range([marginX, State.width-marginX]);

		var y = d3.scale.linear()
			.domain([0, 1])
			.range([0,State.height-marginY*3]);

		var opacity = d3.scale.sqrt()
		    .domain([0, 1])
		    .range([.25, .8]);

		root.squares = svg.selectAll("g")
			.data(WAVE_DATA, function(d) { return d; });

		squares.enter()
			.append("g")
			    .attr("transform", function(d,i) { return "translate(" + ((i*w)+marginX) + "," + ((State.height/2)-(y(d)/2)) + ")"; })
			    .attr("opacity", function(d) { return opacity(d); })
			.append("rect")
			    .attr("class", "equal")
			    .attr("width", w-7 +'px')
			    .attr("height", function(d,i) { return y(d) + "px" });

		squares.exit().remove();

		};
	r.equal_thumb = function() {

		if (State.thumbs_init[4] != 'init') {
			State.thumbs_init[4] = 'init';
			root.svg_thumb_five = d3.select("#equal").append("svg")
				.attr("width", '100%')
				.attr("height", '100%');
		}

		$('#equal svg').empty();
		var width = $('#equal').width();
		var height = $('#equal').height();
		var marginX = Math.floor(width/10);
		var marginY = Math.floor(height/10);
		var w = Math.floor((width - marginX*2)/5);

	 	WAVE_DATA = c.normalize_binned(200);
	 	WAVE_DATA = WAVE_DATA.slice(1);

		var x = d3.scale.linear()
			.domain([0, WAVE_DATA.length])
			.range([marginX, width-marginX]);

		var y = d3.scale.linear()
			.domain([0, 1])
			.range([0,height-marginY*3]);

		var opacity = d3.scale.sqrt()
		    .domain([0, 1])
		    .range([.25, .8]);

		root.squares = svg_thumb_five.selectAll("g")
			.data(WAVE_DATA, function(d) { return d; });

		squares.enter()
			.append("g")
			    .attr("transform", function(d,i) { return "translate(" + ((i*w)+marginX) + "," + ((height/2)-(y(d)/2)) + ")"; })
			    .attr("opacity", function(d) { return opacity(d); })
			.append("rect")
			    .attr("class", "equal")
			    .attr("width", w-7 +'px')
			    .attr("height", function(d,i) { return y(d) + "px" });

		squares.exit().remove();

		};
	r.spin = function() {

		if (State.active == 'spin') {

	     	WAVE_DATA = c.total()*2;
	     	//WAVE_DATA = c.normalize_binned(200,1000,10);
	     	var $c = $('body > svg circle');

			$c.attr("style", "stroke-width: "+WAVE_DATA*4+"px");
			$c.attr("stroke-dashoffset", WAVE_DATA+"px");
			$c.attr("stroke-dasharray", WAVE_DATA/6+"px");
			$c.attr("opacity", WAVE_DATA/2200);

			return;
		}

		State.active = 'spin';
		$('body > svg').empty();

		var elems = [
			{ id: 'c1', radius: 300 },
			{ id: 'c4', radius: 10 },
			{ id: 'c2', radius: 100 },
			{ id: 'c3', radius: 50 }
		];

		bars = svg.selectAll("circle")
				.data(elems, function(d,i) { return i; });

		bars.enter().append("circle")
			.attr("class", "spin")
			.attr("cy", "50%")
			.attr("cx", "50%")
			.attr("id", function(d) { return d.id; })
			.attr("r", function(d) { return d.radius + ""; });

		bars.exit().remove();

		};
	r.spin_thumb = function() {

		if (State.thumbs_init[5] == 'init') {

	     	WAVE_DATA = c.total()*2;
	     	//WAVE_DATA = c.normalize_binned(200,1000,10);
	     	var $c = $('#spin svg circle');

			$c.attr("style", "stroke-width: "+WAVE_DATA*4+"px");
			$c.attr("stroke-dashoffset", WAVE_DATA+"px");
			$c.attr("stroke-dasharray", WAVE_DATA/6+"px");
			$c.attr("opacity", WAVE_DATA/2200);

			return;
		}

		$('#spin svg').empty();
		State.thumbs_init[5] = 'init';
		root.svg_thumb_six = d3.select("#spin").append("svg")
			.attr("width", '100%')
			.attr("height", '100%');

		var elems = [
		//	{ id: 'c1', radius: 300 },
			{ id: 'c4', radius: 10 },
		//	{ id: 'c2', radius: 100 },
			{ id: 'c3', radius: 50 }
		];

		bars_t6 = svg_thumb_six.selectAll("circle")
				.data(elems, function(d,i) { return i; });

		bars_t6.enter().append("circle")
			.attr("class", "spin")
			.attr("cy", "50%")
			.attr("cx", "50%")
			.attr("id", function(d) { return d.id; })
			.attr("r", function(d) { return d.radius + ""; });

		bars_t6.exit().remove();

		};
	r.hexbin = function() {

		// http://bl.ocks.org/mbostock/4248145 
		// http://bl.ocks.org/mbostock/4248146

		$('body > svg').empty();

		if (State.active != 'hexbin') {
			randomX = d3.random.normal(State.width/2, 700),
		    ps = d3.range(1024).map(function() { return randomX(); });
		}

		State.active = 'hexbin';
		points = d3.zip(ps, c.normalize(State.height, 0));
		//randomY = d3.random.normal(height / 2, 300),
		//points = d3.range(2000).map(function() { return [randomX(), randomY()]; });

		color = d3.scale.linear()
		    .domain([0, 20])
		    //.range(["black", "white"])
		    .range([$('.dotstyle li.current a').css('background-color'), $('.dotstyle li.current a').css('background-color')])
		    .interpolate(d3.interpolateLab);

		hexbin = d3.hexbin()
		    .size([State.width, State.height])
		    .radius(50);

		radius = d3.scale.linear()
		    .domain([0, 20])
		    .range([0, 130]);

		svg.append("g")
		  .selectAll(".hexagon")
		    .data(hexbin(points))
		  .enter().append("path")
		    .attr("class", "hexagon")
		    .attr("id", "hexx")
    		.attr("d", function(d) { return hexbin.hexagon(radius(d.length)); })
		    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		    .style("fill", function(d) { return color(d.length); })
		    .style("opacity", function(d) { return 0.8-(radius(d.length)/180); });

		};
	r.hexbin_thumb = function() {

		// http://bl.ocks.org/mbostock/4248145 
		// http://bl.ocks.org/mbostock/4248146

		var width = $('#hexbin').width();
		var height = $('#hexbin').height();

		if (State.thumbs_init[6] != 'init') {
			root.svg_thumb_seven = d3.select("#hexbin").append("svg")
				.attr("width", '100%')
				.attr("height", '100%');

			State.thumbs_init[6] = 'init';
			randomX_t7 = d3.random.normal(width/2, 50),
		    ps_t7 = d3.range(1024).map(function() { return randomX_t7(); });
		}

		$('#hexbin svg').empty();
		points_t7 = d3.zip(ps_t7, c.normalize(height*1.5, -20));

		color_t7 = d3.scale.linear()
		    .domain([0, 50])
		    .range(["black", "white"])
		    .interpolate(d3.interpolateLab);

		hexbin_t7 = d3.hexbin()
		    .size([width, height])
		    .radius(15);

		radius_t7 = d3.scale.linear()
		    .domain([0, 10])
		    .range([0, 15]);

		svg_thumb_seven.append("g")
		  .selectAll(".hexagon")
		    .data(hexbin_t7(points_t7))
		  .enter().append("path")
		    .attr("class", "hexagon")
    		.attr("d", function(d) { return hexbin_t7.hexagon(15); })
		    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		    .style("fill", function(d) { return color_t7(d.length); });

		};
	r.voronoi = function() {

		// http://bl.ocks.org/mbostock/4060366

		if (State.active == 'voronoi') {
			redraw();
			return;
		}

		State.active = 'voronoi';
		width = State.width;
		height = State.height;

		vertices = d3.range(100).map(function(d) {
		  return [Math.random() * width, Math.random() * height];
		});

		voronoi = d3.geom.voronoi()
		    .clipExtent([[0, 0], [width, height]]);

		svg = d3.select("body").append("svg")
		    .attr("width", width)
		    .attr("height", height);

		path = svg.append("g").selectAll("path");

		svg.selectAll("circle")
		    .data(vertices.slice(1))
			.enter().append("circle")
		    .attr("transform", function(d) { return "translate(" + d + ")"; })
		    .attr("r", 1.5);

		redraw();

		function redraw() {
			
			vertices = d3.range(100).map(function(d) {
			  return [Math.random() * width, Math.random() * height];
			});

			path = path.data(voronoi(vertices), polygon);

			path.exit().remove();

			path.enter().append("path")
				.attr("class", function(d, i) { return "q" + (i % 9) + "-9"; })
				.attr("d", polygon);

			path.order();
		};

		function polygon(d) {
		  return "M" + d.join("L") + "Z";
		};

		};
	root.Render = r;

	// helper methods ///////////////////////////////////////////////////////////////////////////////
	var h = {};
	h.toggleMenu = function(x) {
		console.log('h.toggleMenu');

		if (x == 'toggle')
			x = ($('.menu').hasClass('menu-open')) ? 'close' : 'open';

		if (x == 'open') {
			$('.menu').addClass('menu-open');
			$('.icon-menu').addClass('fadeOut');
			//$("body > svg").attr("class", "svg-open");
		}
		else {
			$('.menu').removeClass('menu-open');
			//$("body > svg").attr("class", "svg-closed");
		}

		};
	h.toggleFullScreen = function() {
		console.log("h.toggleFullScreen fired");

		// thanks mdn

		if (!document.fullscreenElement &&    // alternative standard method
		  !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods

		  	$('.icon-expand').addClass('icon-contract');
			if (document.documentElement.requestFullscreen) {
				document.documentElement.requestFullscreen();
			} else if (document.documentElement.msRequestFullscreen) {
				document.documentElement.msRequestFullscreen();
			} else if (document.documentElement.mozRequestFullScreen) {
				document.documentElement.mozRequestFullScreen();
			} else if (document.documentElement.webkitRequestFullscreen) {
				document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		} else {
		  	$('.icon-expand').removeClass('icon-contract');
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		}
		}
	h.hideHUD = function() {
		//$('.icon-knobs').is(':hover') || 
		if ($('#mp3_player').is(':hover') || $('.dotstyle').is(':hover') || $('.slider').is(':hover') || $('.icon-expand').is(':hover') || $('.icon-github2').is(':hover') || $('.icon-loop-on').is(':hover') || $('.icon-question').is(':hover') || $('.icon-keyboard2').is(':hover') || $('.song-metadata').is(':hover') || $('.icon-forward2').is(':hover') || $('.icon-backward2').is(':hover') || $('.icon-pause').is(':hover') || $('.schover').is(':hover'))
			return;

		$('#mp3_player').addClass('fadeOut');
		$('.icon-menu').addClass('fadeOut');
		$('.menu-wide').addClass('fadeOut');
		$('.menu').addClass('fadeOut');
		$('.menu-controls').addClass('fadeOut');
		$('#progressBar').addClass('fadeOut');
		$('html').addClass('noCursor');
		if (State.metaLock == false)
			$('.song-metadata').removeClass("show-meta");

		State.hud = 0;
		}
	h.showHUD = function() {

		$('#mp3_player').removeClass('fadeOut');
		$('.icon-menu').removeClass('fadeOut');
		$('.menu-wide').removeClass('fadeOut');
		$('.menu').removeClass('fadeOut');
		$('.menu-controls').removeClass('fadeOut');
		$('#progressBar').removeClass('fadeOut');
		$('html').removeClass('noCursor');
		$('.song-metadata').addClass("show-meta");

		State.hud = 1;

		}
	h.showModal = function(id) {
		if ($(id).hasClass('md-show')) {
			h.hideModals();
			return;
		}

		if ($('.md-show').length > 0) {
			h.hideModals();
		}

		$(id).addClass('md-show');
		
		};
	h.hideModals = function() {
		$('.md-modal').removeClass('md-show');
		};

	h.resize = function() {
		console.log('h.resize fired');		
	    State.width = $(window).width();
		State.height = $(window).height();
		State.active = State.trigger;
		$('body > svg').attr("width", State.width).attr("height", State.height);

		var full = document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen;
		if (!full) $('.icon-expand').removeClass('icon-contract');

		};
	h.stop = function(e) {
	    e.stopPropagation();
	    e.preventDefault();
		};
	h.handleDrop = function(e) {
		console.log('h.handleDrop fired');

		h.stop(e);
		h.removeSoundCloud();
		//if (window.File && window.FileReader && window.FileList && window.Blob) {

    	URL.revokeObjectURL(objectUrl);		
    	var file = e.originalEvent.dataTransfer.files[0];

		if (!file.type.match(/audio.*/)) {
			console.log("not audio file");
			return;
		}

    	h.readID3(file);

    	var objectUrl = URL.createObjectURL(file);
    	a.loadSoundHTML5(objectUrl);

			   //  	var files = e.originalEvent.dataTransfer.files;

			   //  	if (files[0].type.match(/audio.*/)) {
			   //  		console.log('true');
				
						// var read = new FileReader(); 
						// read.readAsDataURL(files[0]);
						// read.onload = function(e) { 
						// 	console.log(' -- FileReader onload fired');
							
						// 	// fuuzikplay[3] = soundManager.createSound({ 
						// 	// id: "audio", 
						// 	// url: d.target.result 
						// 	// }); 
						// 	//audio.pause(); 
				   			
				  //  			audio = new Audio();
						// 	audio.src = e.target.result; 
						//     audio.controls = true;
						//     audio.loop = true;
						//     audio.autoplay = true;

						//     $('#audio_box').empty();
						// 	document.getElementById('audio_box').appendChild(audio);
					 //        a.audioBullshit();

						// };
			   //  	}
		
		};
	h.readID3 = function(file) {
		console.log('h.readID3 fired');

		$('.song-metadata').html("");

		if (typeof file == 'string') {

			ID3.loadTags(audio.src, function() {
			    var tags = ID3.getAllTags(audio.src);
				h.renderSongTitle(tags);
			});

		}

		else {

			ID3.loadTags(file.urn || file.name, function() {
			    var tags = ID3.getAllTags(file.urn || file.name);
			    tags.dragged = true;
				h.renderSongTitle(tags);

			    if( "picture" in tags ) {
			    	var image = tags.picture;
			    	var base64String = "";
			    	for (var i = 0; i < image.data.length; i++) {
			    		base64String += String.fromCharCode(image.data[i]);
			    	}
			    	//console.log("data:" + image.format + ";base64," + window.btoa(base64String));
			    	//$("art").src = "data:" + image.format + ";base64," + window.btoa(base64String);
			    	//$("art").style.display = "block";
			    } 
			    else {
			    	//console.log("nope.");
			    	//$("art").style.display = "none";
			    }
			}, {
			    dataReader: FileAPIReader(file)
			});
		}

		};

	h.removeSoundCloud = function() {
		State.soundCloudURL = null;
		State.soundCloudData = null;
		State.soundCloudTracks = null;

		$('.song-metadata').html("");
		$('.song-metadata').attr('data-go', "");

		$('#sc_input').val("");
		$('#sc_url span').html('SOUNDCLOUD_URL');

		// load local songs?

		};

	h.togglePlay = function() {
		(audio && audio.paused == false) ? audio.pause() : audio.play();
		$('.icon-pause').toggleClass('icon-play');
		};
	h.songEnded = function() {
		console.log('h.songEnded fired');		

		h.changeSong('n');

		};
	h.changeSong = function(direction) {
		console.log('h.changeSong fired');		

		var totalTracks = State.soundCloudTracks || State.playlist.length;

		if (State.soundCloudData && State.soundCloudTracks <= 1) {
			audio.currentTime = 0;
			$('.icon-pause').removeClass('icon-play');
			return;
		}

		if (direction == 'n')
			State.currentSong = State.currentSong + 1;

		else if (direction == 'p') {
			if (audio.currentTime < 3) {
				State.currentSong = (State.currentSong <= 0) ? State.currentSong+totalTracks-1 : State.currentSong - 1;
			}
			else {
				audio.currentTime = 0;
				$('.icon-pause').removeClass('icon-play');
				return;
			}
		}
		else {
			State.currentSong = Math.floor(Math.random() * totalTracks);
		}

		if (State.soundCloudData) {
			var trackNum = Math.abs(State.currentSong)%State.soundCloudTracks;
			h.renderSongTitle(State.soundCloudData[trackNum]);
			a.loadSoundHTML5(State.soundCloudData[trackNum].uri+'/stream?client_id=67129366c767d009ecc75cec10fa3d0f');
		}
		else {
			if (audio) {
				audio.src = 'mp3/'+State.playlist[Math.abs(State.currentSong)%State.playlist.length];
				h.readID3(audio.src);
			}
		}

		$('.icon-pause').removeClass('icon-play');

		};
	h.renderSongTitle = function(obj) {
		console.log('h.renderSongTitle fired');		

		if (State.soundCloudData) {
			var trackNum = Math.abs(State.currentSong)%State.soundCloudTracks;
			var regs = new RegExp(obj.user.username, 'gi');
			var prettyTitle = obj.title;

			if (prettyTitle.search(regs) == -1)
				prettyTitle += ' <b>' + obj.user.username + '</b>'; 

			//var prettyTitle = obj.title.replace(regs, "<b>"+obj.user.username+"</b>");
			
			if (State.soundCloudTracks > 1)
				prettyTitle += ' ['+(trackNum+1)+'/'+State.soundCloudTracks+']';

			$('.song-metadata').html(prettyTitle);
			$('.song-metadata').attr('data-go', obj.permalink_url);
		}
		else {
			// id3?
		    var prettyTitle = '"'+obj.title+'" by <b>'+obj.artist+'</b>'; //  on <i>'+tags.album+'</i>
			var trackNum = Math.abs(State.currentSong)%State.playlist.length;

			if (State.playlist.length > 1 && !obj.dragged)
				prettyTitle += ' ['+(trackNum+1)+'/'+State.playlist.length+']';

			$('.song-metadata').html(prettyTitle);
			$('.song-metadata').attr('data-go', State.playListLinks[trackNum]);
		}

			$('.song-metadata').addClass("show-meta");

			State.metaLock = true;
			clearTimeout(metaHide);
			// in 3 seconds, remove class unless lock
			metaHide = setTimeout(function() { 
				State.metaLock = false;
				if (State.hud == 0)
					$('.song-metadata').removeClass("show-meta");
			}, 3000);

		};
	h.tooltipReplace = function() {
		console.log('h.tooltipReplace fired');

		var text = $(this).attr('data-hovertext');
		console.log(text);
		if (text != null) {
			State.hoverTemp = $('.song-metadata').html();
			$('.song-metadata').html(text);
		}
	
		};
	h.tooltipUnReplace = function() {
		console.log('h.tooltipUnReplace fired');
		
		if (State.hoverTemp != null) {
			$('.song-metadata').html(State.hoverTemp);
			State.hoverTemp = null;
		}

		};
	h.songGo = function() {
		console.log('h.songGo fired.');

		if (!$(this).attr('data-go'))
			return false;
		audio.pause();
		$('.icon-pause').removeClass('icon-play');
		window.open($(this).attr('data-go'),'_blank');
		
		};

	h.themeChange = function(n) {
		n = +n;
		n  = (n<0) ? 5 : n;
		n  = (n>5) ? 0 : n;
		State.theme = n;

		console.log('h.themeChange:'+n);
		var name = 'theme_'+n;
		$('html').attr('class',name); 

		$('.dotstyle li.current').removeClass('current');
		$('.dotstyle li:eq('+n+')').addClass('current');

		};
	h.vizChange = function(n) {
		n  = (n<0) ? 6 : n;
		n  = (n>6) ? 0 : n;

		console.log('h.vizChange:'+n);
		State.trigger = n;
		$('.menu li.active').removeClass('active');
		$('.menu li[viz-num="'+n+'"]').addClass('active');

		};
	h.infiniteChange = function(toggle) {
		console.log('h.infiniteChange fired: '+toggle);

		clearInterval(State.changeInterval);

		State.changeInterval = setInterval(function(){
	    	h.themeChange(Math.floor(Math.random() * 6));
	    	h.vizChange(Math.floor(Math.random() * 8));
		},toggle);

		if (toggle == null)
			clearInterval(State.changeInterval);

		};

	h.icosahedronFaces = function(slide) {
		var slide = slide || 180;
		var faces = [],
		  y = Math.atan2(1, 2) * slide / Math.PI;
		for (var x = 0; x < 360; x += 72) {
		faces.push(
		  [[x +  0, -90], [x +  0,  -y], [x + 72,  -y]],
		  [[x + 36,   y], [x + 72,  -y], [x +  0,  -y]],
		  [[x + 36,   y], [x +  0,  -y], [x - 36,   y]],
		  [[x + 36,   y], [x - 36,   y], [x - 36,  90]]
		);
		}
		return faces;
		};
	h.degreesToRads = function(n) {
        return d3.scale.linear().domain([0, 360]).range([0, 2 * Math.PI])(this);
    	};

	h.microphoneError = function(e) {
		// user clicked not to let microphone be used
		console.log(e);
		};
    h.getURLParameter = function(sParam) {
    	//http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
	    var sPageURL = window.location.search.substring(1);
	    var sURLVariables = sPageURL.split('&');
	    for (var i = 0; i < sURLVariables.length; i++) {
	        var sParameterName = sURLVariables[i].split('=');
	        if (sParameterName[0] == sParam) {
	            return sParameterName[1];
	        }
	    }
		};
	h.isMobile = function() {
		// returns true if user agent is a mobile device
		return (/iPhone|iPod|iPad|Android|BlackBerry/).test(navigator.userAgent);
		};
	h.detectEnvironment = function() {
		if (window.location.protocol.search('chrome-extension') >= 0)
			return 'chrome-extension';

		if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0)
			return 'safari';

		//  https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
		
		if (!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0)
			return 'opera';

		if (typeof InstallTrigger !== 'undefined')
			return 'firefox';

		// var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
		// var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

		return 'unknown';

		};
	h.getCookie = function(c_name) {
		//console.log("h.getCookie fired");
		var i,x,y,ARRcookies=document.cookie.split(";");
		for (i=0;i<ARRcookies.length;i++) {
		  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		  x=x.replace(/^\s+|\s+$/g,"");
		  if (x==c_name) {
		    return unescape(y);
		  }
		}
		};
	h.setCookie = function(c_name,value,exdays) {
		//console.log("h.setCookie fired");
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
		document.cookie=c_name + "=" + c_value;
		};
	h.prettyLog = function(data) {
		console.log("h.prettyLog fired");
		return false;
		
		var x = data || localStorage.account;
		if (typeof x == 'object') x = JSON.stringify(x);
		if (typeof data == "undefined") return;
		if (typeof data == "string") {
			console.log(data);
			return;
		}
		console.log('\n'+JSON.stringify(JSON.parse(x),null, 4));
		};
	h.applyStyles = function(selector, styleToApply){
		if(typeof selector == undefined) return;
		if(typeof styleToApply == undefined) return;

		var style = '';
		for (var i = 0; i < State.vendors.length; i++) {
			style += State.vendors[i]+ styleToApply;
		}
		$(selector).attr("style", style);
		};
	root.Helper = h;

}).call(this);

$(document).ready(App.init);

