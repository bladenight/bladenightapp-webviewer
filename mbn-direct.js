// Open WAMP 1 connection to the restricted Bladenight server.
// @see /home/olivier/bladenight-server/

ab.connect('wss://ilvermorny.illusioni.de:14443',
	function (session) {
		// load route
		session.call('http://www.greencity.de/bladenight/app/rpc/getActiveRoute').then(
			function (result) {
				drawRoute(result)
			},
			function (error, desc) {
				console.log ("getActiveRoute", error, desc)
			})

		// update head and tail
		setInterval (function() {
			session.call('http://www.greencity.de/bladenight/app/rpc/getRealtimeUpdate').then(
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
