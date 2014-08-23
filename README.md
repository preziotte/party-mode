<p align="center">
<img src="https://raw.githubusercontent.com/preziotte/party-mode/master/img/1-logo.gif"/>
<h1>PARTY MODE</h1>
</p>

Party Mode
==========
An experimental music visualizer using d3.js and the web audio api.  Working demo @ http://preziotte.com/partymode.


###*** *If anything deserves an epilepsy warning, it'd be this.* ***


todo
====
- read id3 tags & show widget when new song starts
- record some motion screencaps
- play/pause ui signifier
- debug on ipad?
- grunt
- http://www.chromeexperiments.com/submit/

ideas
=====
- chrome extension -- hijack audio from any page and overlay visualizer
- chrome app -- performance seems to be better when files are local
- auto-detect big changes in song (amplitude deltas / allow rate limiting / average threshold over time if desired) )
- hook up to 3rd party music service such as soundcloud / spotify / pandora
- auto detect all mp3s in local folder (chromes webkitRequestFileSystem?)

known issues
============
- does not play locally in firefox
- firefox transform-origin: center;
- opera document.querySelector('audio').error returns 4 (MEDIA_ERR_SRC_NOT_SUPPORTED)
- safari freezes when returning from fullscreen
- safari doesnt have AudioContext .createMediaElementSource() method implemented, so no progressive loading
- safari dragndrop issue

credits & inspiration
=====================
####Javascript
- <a target='_blank' href='http://bost.ocks.org/mike/'>Mike Bostock</a>'s, bl.ocks: 
<a target='_blank' href='http://bl.ocks.org/mbostock/7782500'>#7782500</a>, 
<a target='_blank' href='http://bl.ocks.org/mbostock/3795048'>#3795048</a>, 
<a target='_blank' href='http://bl.ocks.org/mbostock/4248145'>#4248145</a>, 
<a target='_blank' href='http://bl.ocks.org/mbostock/7782500'>#7782500</a>
- <a target="_blank" href='https://stackoverflow.com/questions/13368046/how-to-normalize-a-list-of-positive-numbers-in-javascript'>Stack Overflow</a>, 
- <a target='_blank' href='http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/'>Code Theory</a>, 
- <a target='_blank' href='http://craig.is/killing/mice'>Mousetrap.js</a>, 
- <a target='_blank' href='https://jquery.com/'>jQuery</a>, and 
<a target='_blank' href='http://www.developphp.com/view.php?tid=1348'>DevelopPHP</a>. 
<a target='_blank' href='http://www.michael-gerhaeuser.de/?f=fileapi/readme.html'>Michael Gerhaeuser</a>, 
<a target='_blank' href='http://lostechies.com/derickbailey/2013/09/23/getting-audio-file-information-with-htmls-file-api-and-audio-element/'>Los Techies</a>

####Design
- Codrops [<a target='_blank' href='http://tympanus.net/Development/ModalWindowEffects/'>1</a>] 
[<a target='_blank' href='hhttp://tympanus.net/codrops/2014/01/21/dot-navigation-styles/'>2</a>] 
ColourLovers [<a target='_blank' href='http://www.colourlovers.com/palette/3406603/Sunset_at_Bayinbuluk'>1</a>] 
[<a target='_blank' href='http://www.colourlovers.com/palette/944213/forever_lost'>2</a>] 
[<a target='_blank' href='http://www.colourlovers.com/palette/728391/Dig_My_Olive_Branch'>3</a>] 
[<a target='_blank' href='http://www.colourlovers.com/palette/3406636/Just_Breathe'>4</a>] 
[<a target='_blank' href='http://www.colourlovers.com/palette/443995/i_demand_a_pancake'>5</a>]
- <a target='_blank' href='http://codepen.io/aronwoost/pen/nlyrf'>aronwoost</a>, 
- <a target="_blank" href='https://news.ycombinator.com/item?id=2299806'>Dustin Cartwright</a>, 
- <a target="_blank" href='http://matthewlein.com/ceaser/'>Ceaser</a>
- <a target='_blank' href='http://www.developphp.com/view.php?tid=1348'></a>, 
- Headphones by Kevin Hipke and Record by Juan Pablo Bravo from 
<a target='_blank' href='thenounproject.com'>The Noun Project</a> 
- <a target='_blank', href='http://icomoon.io/app/'>icomoon</a>, 
- iconmelon, 
fontello, 
iconmonstr.

cool gifs
==========
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


