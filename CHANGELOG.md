
v.1.7.1 (2016-03-29)
--------------------
- fix bug around `https://` compatibility

v.1.7.0 (2016-03-28)
--------------------
- fix bug around hearing feedback when connected to system mic
- ability to load in audio from an arbitrary URL (ex preziotte.com/partymode?audio=URL).  OGG and MP3 files will work best ([example](https://preziotte.com/partymode?audio=https://upload.wikimedia.org/wikipedia/en/4/45/ACDC_-_Back_In_Black-sample.ogg)).  this also includes limited support for streaming internet radio stations such as ICEcast/SHOUTcast ([example](https://preziotte.com/partymode?audio=http://dw2.hopto.org:8080/dance.mp3)).
- new volume adjustment slider (as requested)
- append `?fastHide=true` to the URL for the HUD to hide quicker and be less intrusive (as requested)
- ability to shuffle a playlist of songs


v.1.6.1 (2016-01-30)
--------------------
- fix CORS issue when connecting to soundcloud


v.1.6.0 (2014-11-15)
--------------------
- remove mp3s from github, replace with previews
- grab audio from system mic


v.1.5.0 (2014-10-04)
--------------------
- play/pause ui signifier
- soundcloud integration for chrome
- next/previous song ui


v1.1.0 (2014-09-14)
-------------------
- added favicon meta-html
- using aadsm/JavaScript-ID3-Reader to display song & artist
- added changelog.md
- added h.changeSong()

v1.0.0 (2014-08-18)
-------------------
