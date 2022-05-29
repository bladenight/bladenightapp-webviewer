# Bladenight Web Viewer

Web based viewer for the Bladenight App


## Files

* `k2.html` Mockup for the offical page
* `fullscreen.html` HTML Container
* `mbn-map.css` Stylez
* `mbn-map.js` Client implementation
* `leaflet.css` Map styles
* `leaflet.js` Map library
* `autobahn.js`	WAMP 1.0 library

## Websocket connection

The Bladenight server uses either self signed certificates (not trusted by default), or 
non-encrypted communication.

If you want to use TLS, then you can add a reverse proxy on the server to encrypt the
communication. With Apache, it would look like this:

```
<VirtualHost *:14443>
        ServerName              ...
        ServerAdmin             ...
        ErrorLog                ...
        CustomLog               ...
        SSLEngine               on
        SSLCertificateFile      ...
        SSLCertificateKeyFile   ...

        RewriteEngine           on
        RewriteCond             %{HTTP:UPGRADE} websocket [NC]
        RewriteCond             %{HTTP:CONNECTION} upgrade [NC]
        RewriteRule             .* ws://localhost:12345%{REQUEST_URI} [P]
        ProxyPass               / http://localhost:12345/
        ProxyPassReverse        / http://localhost:12345/
        ProxyRequests           off
</VirtualHost>
```

If you want to use unencrypted Websocket communication, be aware that Firefox will not
initiate a non-TLS websocket connection from an HTTPS page. To change this (not recommended):

* Enter `about:config`
* Set `network.websocket.allowInsecureFromHTTPS` to `true` (decreases global security!)
* Access the page

## Links

* Server      https://github.com/bladenight/bladenightapp-common/
* Autobahn    https://crossbar.io/autobahn/
* Leaflet     https://leafletjs.com/
* Fullscreen  https://github.com/Leaflet/Leaflet.fullscreen
* Location    https://github.com/domoritz/leaflet-locatecontrol
* Transport   https://github.com/openstreetmap/leaflet-osm
