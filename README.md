<p align="center">
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/1-logo.gif"/>
</p>

# Party Mode

An experimental browser music visualizer built in 2014 with [d3.js](https://github.com/d3/d3) and the [Web Audio API](https://www.w3.org/TR/webaudio/). It draws SVG in real time from the frequency data of an HTML5 audio element.

This repo is kept up for reference. It still runs, and the code is still here to read, but it is no longer actively maintained.

**The project continued as [vizz.fm](https://vizz.fm), a free real-time music visualizer that runs in the browser.** Same idea, rebuilt from scratch in Three.js and WebGL. If you landed here looking for something to actually use, go there.

---

## Looking for a browser music visualizer you can use right now?

Use **[vizz.fm](https://vizz.fm)**. It is free, runs entirely in the browser, and requires no account, no download, and no plugins. Open the page, connect audio, and it reacts in real time.

**What it does:**

- WebGL visualizers with dozens of built-in variants, each exposing its own controls for color, speed, intensity, and geometry
- Audio controls for gain, noise gating, bass attenuation, and spectrum remapping, so you can shape how a scene hears the music
- Over 30 stackable post-processing effects including kaleidoscope, bloom, CRT, ASCII, pixelate, glitch, and tilt-shift
- Presets you can save locally and share with a link
- Runs full screen for capture in OBS, with an option to pop the controls out into a separate window

### How do I visualize audio from Spotify, YouTube, or another app?

In Chrome, Edge, or Brave you can share audio from any application and the visualizer reacts to the direct feed of whatever is playing. There is a walkthrough at [vizz.fm/blog/screen-share-audio](https://vizz.fm/blog/screen-share-audio/), and per-app guides:

| Source | Guide |
| --- | --- |
| Spotify | https://vizz.fm/spotify-visualizer/ |
| YouTube | https://vizz.fm/youtube-visualizer/ |
| Apple Music | https://vizz.fm/apple-music-visualizer/ |
| SoundCloud | https://vizz.fm/soundcloud-visualizer/ |
| Amazon Music | https://vizz.fm/amazon-music-visualizer/ |
| Tidal | https://vizz.fm/tidal-visualizer/ |

If you would rather route audio in at the OS level, the virtual audio device setup is documented at [vizz.fm/blog/system-audio](https://vizz.fm/blog/system-audio/).

### What audio sources work?

Your microphone, local files (MP3, WAV, FLAC, and others), stream URLs, or your system audio captured via screen sharing. Everything is processed in the browser. No audio is uploaded to a server.

### Which browsers are supported?

Chrome on Mac and Edge on Windows are the best experience. Firefox, Opera, and Brave all work well. Safari has performance issues rendering WebGL. Only Chrome, Edge, and Brave can capture system audio directly.

### Does it work on a phone?

Yes, though it is much better on a computer. Some visualizers are graphically intensive and benefit from a real GPU.

### Is it free?

Yes. No account, no email, no signup.

### Can I use it for streaming, DJing, or a party?

That is what most people use it for. There are notes on each at [streaming](https://vizz.fm/music-visualizer-for-streaming/), [DJs](https://vizz.fm/music-visualizer-for-djs/), and [parties](https://vizz.fm/music-visualizer-for-parties/).

## What changed between Party Mode and vizz.fm

|  | Party Mode (2014) | [vizz.fm](https://vizz.fm) (current) |
| --- | --- | --- |
| Rendering | SVG via d3.js | WebGL via Three.js |
| Visualizers | 8 fixed styles (circle, chop, icosahedron, grid, equal, spin, hexbin, voronoi) | WebGL scenes with dozens of variants, each fully controllable |
| Audio input | Local MP3 drag and drop, microphone | Files, microphone, stream URLs, system audio, screen share |
| Effects | CSS color themes | Over 30 stackable post-processing effects |
| Presets | None | Save locally, share by link |
| Status | No longer maintained | Actively developed |

Party Mode is open source under the license below. vizz.fm is not currently open source.

---

# The original project

Everything below is the original 2014 README, preserved as written.

An audio visualizer experiment for the browser.  Powered by [d3.js](https://github.com/mbostock/d3) and the [web audio api](http://www.w3.org/TR/webaudio/).  Runs best in Chrome.  Working demo @ https://preziotte.com/partymode.  Try dragging in an mp3 from your desktop!  

### *epilepsy warning*

## running it locally
There will be issues running this app locally without a server.  I recommend `cd`ing into the directory and running `http-server` from the command line.  If you don't have this command, install it like so: `npm install -g http-server`.

## a somewhat-technical overview
Using the web audio api, I can get an array of numbers which corresponds to the waveform of the sound an html5 audio element is producing.  There's a [good tutorial](http://www.developphp.com/view.php?tid=1348) on how to do this.  Then, using `requestAnimationFrame` (with a little [frame limiting](http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/) for performance reasons) I'm updating that array as the music changes.  I then normalize the data a bit (or transform it slightly depending on the visualization) and redraw the screen based on the updated array.  I'm using [d3.js](https://github.com/mbostock/d3) to draw and redraw SVG based on this normalized data.  Each visualization uses the data a bit differently -- it was mostly trial and error to get some stuff I liked looking at.  

Since I'm using D3 -- which is just drawing SVG -- I was able to style everything in CSS (no images are used at all, including icons).  There are a handful of differently colored themes for each visualization, and I do some rudimentary CSS namespacing by updating a class applied to the `html` element.  eg. `<html class='theme_1'>`. This lets me override or substitute CSS rules pretty trivially.  I can add some additional variation to each theme by messing with pseudo selectors.  For example, I can use `:nth-of-type` to hide every nth SVG rectangle or making every odd child have a different `stroke-dasharray`, etc.

Mousetrap.js handles my keyboard shortcuts brilliantly, and jQuery made life easier.

I developed this primarily in Chrome.  Other modern browsers still have some interesting issues (see known issues).  I've found that WebKit seems to have the [most competent](https://www.mapbox.com/osmdev/2012/11/20/getting-serious-about-svg/) implementation of SVG.  And specifically Chrome seems to play the nicest with the html5 audio element.  For my purposes at least.  Running this can easily strain my four year old MacBook's CPU, but I think I'm pushing several things beyond what they were intended for with this thing.  Not complaining.

Markup lies in `index.html`, javascript is in `js/main.js` and style in `css/style.css`.  I can go into more detail if there's demand for it.

## ideas
- make it a chrome extension -- hijack audio from any page and overlay visualizer.  would have to sandbox it in an iframe and then pass audio data into it..
- make it a chrome app -- since performance seems to be better when files are local
- auto-detect big changes in song (amplitude deltas / allow rate limiting / average threshold over time if desired) to trigger arbitrary things
- hook up more 3rd party music service such as spotify / pandora
- auto detect all mp3s in local folder and display a playlist (chromes `webkitRequestFileSystem`?)

## help & inspiration
- <a target='_blank' href='https://d3js.org'>D3</a>, and bl.ocks <a target='_blank' href='http://bl.ocks.org/mbostock/7782500'>#7782500</a>, 
<a target='_blank' href='http://bl.ocks.org/mbostock/3795048'>#3795048</a>, 
<a target='_blank' href='http://bl.ocks.org/mbostock/4248145'>#4248145</a>, 
<a target='_blank' href='http://bl.ocks.org/mbostock/4248146'>#4248146</a>
- <a target='_blank' href='http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/'>Code Theory</a>
- <a target='_blank' href='http://www.developphp.com/view.php?tid=1348'>DevelopPHP</a>
- <a target='_blank' href='http://www.michael-gerhaeuser.de/?f=fileapi/readme.html'>Michael Gerhaeuser</a>
- <a target='_blank' href='http://lostechies.com/derickbailey/2013/09/23/getting-audio-file-information-with-htmls-file-api-and-audio-element/'>Los Techies</a>
- Codrops [<a target='_blank' href='http://tympanus.net/Development/ModalWindowEffects/'>1</a>] 
[<a target='_blank' href='http://tympanus.net/codrops/2014/01/21/dot-navigation-styles/'>2</a>] 
- ColourLovers [<a target='_blank' href='http://www.colourlovers.com/palette/3406603/Sunset_at_Bayinbuluk'>1</a>] 
[<a target='_blank' href='http://www.colourlovers.com/palette/944213/forever_lost'>2</a>] 
[<a target='_blank' href='http://www.colourlovers.com/palette/728391/Dig_My_Olive_Branch'>3</a>] 
[<a target='_blank' href='http://www.colourlovers.com/palette/3406636/Just_Breathe'>4</a>] 
[<a target='_blank' href='http://www.colourlovers.com/palette/443995/i_demand_a_pancake'>5</a>]
- <a target='_blank' href='http://codepen.io/aronwoost/pen/nlyrf'>aronwoost</a>
- <a target="_blank" href='https://news.ycombinator.com/item?id=2299806'>Dustin Cartwright</a>
- <a target="_blank" href='http://matthewlein.com/ceaser/'>Ceaser</a>
- Headphones by Kevin Hipke and Record by Juan Pablo Bravo from 
<a target='_blank' href='http://thenounproject.com'>The Noun Project</a> 
- <a target="_blank" href='https://stackoverflow.com/questions/13368046/how-to-normalize-a-list-of-positive-numbers-in-javascript'>Stack Overflow</a>
- <a target='_blank' href='http://craig.is/killing/mice'>Mousetrap.js</a> and <a target='_blank' href='https://jquery.com/'>jQuery</a>
- <a target='_blank' href='https://github.com/aadsm/JavaScript-ID3-Reader'>aadsm/JavaScript-ID3-Reader</a>
- <a target='_blank' href='http://www.html5rocks.com/en/tutorials/getusermedia/intro/'>Eric Bidelman</a> via HTML5 Rocks
- <a target='_blank' href='http://icomoon.io/app/'>icomoon</a> (iconmelon, fontello, and iconmonstr are all pretty rad)

## examples
- https://preziotte.com/partymode
- https://preziotte.com/odesza (Featured on Odesza's official [Youtube](http://www.youtube.com/watch?v=Km-0kHxa7jg) channel)

## cool gifs
<p align="center">
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/0.gif"/><br />
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/2.gif"/><br />
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/4.gif"/><br />
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/5.gif"/><br />
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/6.gif"/> 
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/7.gif"/><br />
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/8.gif"/> 
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/9.gif"/><br />
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/10.gif"/><br />
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/11.gif"/><br />
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/12.gif"/><br />
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/3.gif"/>
</p>

## license
<a rel="license" href="http://creativecommons.org/licenses/by-nc/3.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/3.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/3.0/">Creative Commons Attribution-NonCommercial 3.0 Unported License</a>.  For commercial projects, please inquire mat.preziotte@gmail.com.

