# Bladenigght Live Map

Client for the Bladenight Android App.

## Files

* `k2.html` Mockup for the offical page
* `fullscreen.html` HTML Container
* `mbn-map.css` Stylez
* `mbn-map.js` Client implementation
* `leaflet.css` Map styles
* `leaflet.js` Map library
* `autobahn.js`	WAMP 1.0 library

## Usage

By default, Firefox will not initiate a non-TLS web socket connection from an HTTPS page.
To change this:

* Enter `about:config`
* Set `network.websocket.allowInsecureFromHTTPS` to `true`
* Access the page

## Links

* Server      https://github.com/bladenight/bladenightapp-common/
* Autobahn    https://crossbar.io/autobahn/
* Leaflet     https://leafletjs.com/
* Fullscreen  https://github.com/Leaflet/Leaflet.fullscreen
* Location    https://github.com/domoritz/leaflet-locatecontrol
* Transport   https://github.com/openstreetmap/leaflet-osm
