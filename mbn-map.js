/*
* Bladenight Live Map
*/

var route = []   // list of [lat, lng] pairs
var rline = null // L.polyline for the route
var train = null // L.polyline from head to tail
var start = null // L.marker for start/finish line
var user  = null
var bar   = document.getElementById('mbn-bar')
var msg   = document.getElementById('mbn-msg')
//var tileUrl  = 'https://ilvermorny.illusioni.de/osm/{s}/{z}/{x}/{y}.png'
var tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
var wampUrl = 'wss://map.k2bladenight.de:18082'
//var wampUrl = 'wss://ilvermorny.illusioni.de:14443'

// Load OpenStreeMap tiles.
var osm = L.tileLayer(tileUrl, {
	attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
	maxZoom: 19
})
var map = L.map('mbn-map', {
	layers: [osm]
})
L.control.fullscreen().addTo(map);
L.control.locate({
	flyTo: true,
	drawCircle: false
}).addTo(map);

// Send user location
map.on('locationfound', function(event) {
	console.log("locationfound", event.latlng)
	user = {
		did: "Me",
		par: false,
		coo: {
			la: event.latlng.lat,
			lo: event.latlng.lng
		}
	}
})


// Move head and tail markers and colorize line segments in between.
// @see https://github.com/bladenight/bladenightapp-common/blob/master/src/main/java/de/greencity/bladenightapp/network/messages/MovingPointMessage.java
/*
result: {
  hea: {		// head of train
    pos: 3246,
    spd: -2053,
    eta: 21718854,	// milliseconds from me to head
    ior: true,		// is on route
    iip: true,		// is in procession
    lat: 48.15286,
    lon: 11.55564,
    acc: 0
  },
  tai: {		// tail of train
    pos: 2916,
    spd: -307,
    eta: 21868579,	// milliseconds from me to tail
    ior: true,
    iip: true,
    lat: 48.15047,
    lon: 11.55746,
    acc: 0
  },
  fri: {
    fri: {}		// friends
  },
  up: {			// user position
    pos: 0,
    spd: 0,
    eta: 26320254,	// estimated time of arrival
    ior: false,		// is on route
    iip: false,		// is in procession
    lat: 0,
    lon: 0,
    acc: 0
  },
  rle: 16461,		// route length in meters
  rna: "West", 		// route name
  ust: 2,		// user total
  usr: 1		// user on route
}
*/
function drawTrain(result) {
	if (!result.hea.lat || !result.tai.lat) return
	
	// Get index of the segment for a travelled distance.
	var total = 0;
	var hs = null
	var ts = null
	for (var i = 0; i + 1 < route.length; i++) {
		var length = route[i].distanceTo(route[i + 1])
		if (hs == null && total + length > result.hea.pos) hs = i;
		if (ts == null && total + length > result.tai.pos) ts = i;
		total += length
	}
	console.log("head", result.hea.pos, hs, "tail", result.tai.pos, ts, "user", result.up.pos)

	// Draw polyline from tail to head
	var arr = route.slice (ts + 1, hs + 1)
	arr.push   (L.latLng(result.hea.lat, result.hea.lon))
	arr.unshift(L.latLng(result.tai.lat, result.tai.lon))
	if (train) {
		map.removeLayer(train)
	}
	train = L.polyline(arr, {
		color: '#0022ff',
		weight: 6,
		opacity: 1.0
	}).addTo(map)
	//map.fitBounds(train.getBounds())
	
	// Update progress bar
	if (bar && bar.getContext) {
		var ctx = bar.getContext("2d");
		ctx.clearRect(0, 0, bar.width, bar.height)
		if (result.hea.pos > 0) {
			// train
			ctx.fillStyle = '#0022ff'
			ctx.fillRect(bar.width *                           result.tai.pos  / result.rle, 0,
			             bar.width * Math.abs(result.hea.pos - result.tai.pos) / result.rle, bar.height)
		}
		if (result.up.pos > 0) {
			// user
			ctx.beginPath();
			ctx.arc(bar.width * result.up.pos  / result.rle,
				bar.height / 2,
				bar-height / 4, 0, 2 * Math.PI);
			ctx.stroke();
		}
		/*
		var point = 0
		for (var i = 0; i + 1 < route.length; i++) {
			point += route[i].distanceTo(route[i + 1])
			ctx.beginPath();
			ctx.arc(bar.width * point / result.rle,
				bar.height / 2,
				bar-height / 4, 0, 2 * Math.PI);
			ctx.fill();
			//ctx.fillRect(bar.width * point / result.rle, bar.height / 2 - 1, 2, 5)
		}
		*/
	}
	
	// Update message
	if (msg) {
		var text = "Strecke " + result.rna
		var wait = Math.round(result.tai.eta / 1000 / 60)
		var rle  = Math.round(result.rle     / 100) / 10
		var len  = Math.round((result.hea.pos - result.tai.pos) / 100) / 10
		if (rle > 0) {
			text += " " + rle + " km"
		}
		if (len > 0) {
			text += " Zuglänge " + len + " km"
		}
		if (wait > 0) {
			text += " Durchlaufzeit  " + wait + " Minuten"
		}
		msg.innerHTML = text
	}
	
}

// draw a polyline for the complete route.
/*
result = {
  nod: [		// waypoints
    {la: 48.1325, lo: 11.5438},
    ...
  ],
  len: 16461,		// total length in meters
  nam: "West"		// name of route
}
*/
function drawRoute(result) {
	console.log("drawRoute", JSON.stringify(result.nam))

	// convert result to array
	route = []
	for (var i = 0; i < result.nod.length; i++) {
		var latlng = L.latLng(result.nod[i].la, result.nod[i].lo)
		route.push(latlng)
	}

	// start/finish
	// @see https://commons.wikimedia.org/wiki/File:Emojione_1F3C1.svg
	start = L.marker(route[0], {
		icon: new L.Icon({
			iconUrl: 'flag.png',
			iconSize: [32, 32],
                	iconAnchor: [12, 32]
		})
	}).addTo(map)

	// route
	rline = L.polyline(route, {
		color: '#0022ff',
		weight: 8,
		opacity: 0.3
	}).addTo(map)
	map.fitBounds(rline.getBounds())
}

// Open WAMP 1 connection to the restricted Bladenight server.
// @see /home/olivier/bladenight-server/
ab.connect(wampUrl,
	function (session) {
		// load route
		session.call('http://www.greencity.de/bladenight/app/rpc/getActiveRoute').then(
			function (result) {
				drawRoute(result)
			},
			function (error, desc) {
				console.log ("getActiveRoute", error, desc)
			})

		session.call('http://www.greencity.de/bladenight/app/rpc/getRealtimeUpdate').then(
			function (result) {
				drawTrain(result)
			})

		// update head and tail
		setInterval (function() {
			session.call('http://www.greencity.de/bladenight/app/rpc/getRealtimeUpdate', user).then(
				function (result) {
					drawTrain(result)
				},
				function (error, desc) {
					console.log ("getRealtimeUpdate", error, desc)
				})
			}, 3000)
	},
	function (code, reason) {
		console.log("Connection lost", code, reason)
	})
