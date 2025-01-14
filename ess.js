var queue = JSON.parse(localStorage.getItem("queue")) || []
var cqueue = JSON.parse(localStorage.getItem("cqueue")) || {}
var back = JSON.parse(localStorage.getItem("back")) || []
var vol = parseFloat(localStorage.getItem("vol")) || 1
//var ws = new WebSocket("wss://ws.sawicz.com");
var ws = new WebSocket("ws://localhost:8080")
var Sound = (function () {
	var df = document.createDocumentFragment()
	return function Sound(src) {
		var snd = new Audio(src)
		df.appendChild(snd) // keep in fragment until finished playing
		snd.addEventListener("ended", function () {
			df.removeChild(snd)
		})
		snd.play()
		return snd
	}
})()
var lastfm = new LastFM({
    apiKey    : '83c724c119c96d4c04e05f9c4ff63544',
    apiSecret : 'f876c1f0177b6b2bf33a528ccf9f7642',
});

function getSimilarTracksPromise(artist, track) {
    return new Promise((resolve, reject) => {
        lastfm.track.getSimilar({artist: artist, track: track}, {
            success: function(data) {
                resolve(data);
            },
            error: function(code, message) {
                reject(new Error(`Error code: ${code}, Message: ${message}`));
            }
        });
    });
}
async function getSpotifyUris(artist, track) {
    try {
        let similarTracksData = await getSimilarTracksPromise(artist, track);
		let access_token = localStorage.getItem("access_token")
        let spotifyUris = await Promise.all(similarTracksData.similartracks.track.slice(0, 20).map(async track => {
            let searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(track.artist.name)}%20${encodeURIComponent(track.name)}&type=track&limit=1`;
            let response = await fetch(searchUrl, {
                headers: {
                    'Authorization': 'Bearer ' + access_token
                }
            });
            let data = await response.json();
            if (data.tracks.items.length > 0) {
                return data.tracks.items[0].uri;
            } else {
                return null;
            }
        }));
        return spotifyUris.filter(uri => uri !== null);
    } catch (error) {
        console.error(error);
        return [];
    }
}
const swiper = new Swiper(".swiper", {
})
swiper.on("touchStart", (e) => {
	swiper.allowTouchMove = true
	let x = document.elementFromPoint(e.touches.currentX, e.touches.currentY)
	if (x.id === "points") {
		swiper.allowTouchMove = false
	}
})

swiper.on("slideChange", (e) => {
	document.getElementById("qeee").className = "frame-1 screen close"
	document.getElementById("psongs").className = "frame-1 screen close"
	$(".topblock").each(function () {
		this.className = "topblock"
	})
	document.getElementById("b2").className = "topblock active"
	$(".bdy").each(function () {
		this.className = "bdy hide"
	})
	document.getElementById("bdy2").className = "bdy"
})
$(".topblock").click(function () {
	document.getElementById("qeee").className = "frame-1 screen close"
	document.getElementById("psongs").className = "frame-1 screen close"
	$(".topblock").each(function () {
		this.className = "topblock"
	})
	this.className = "topblock active"
	$(".bdy").each(function () {
		this.className = "bdy hide"
	})
	document.getElementById("bdy" + this.id.split("")[1]).className = "bdy"
})

let c1 = "#fff"
let c2 = "#4D4D4D"
const spotifyApi = new SpotifyWebApi()
spotifyApi.setAccessToken(access_token)
ws.onopen = async (event) => {
	ws.send(JSON.stringify({ type: "token", auth: access_token }))
}
function rrefreshtoken() {
	refreshToken()
	access_token = localStorage.getItem("access_token")
	spotifyApi.setAccessToken(access_token)
	if (
		ws.readyState !== WebSocket.CONNECTING &&
		ws.readyState !== WebSocket.CLOSED
	) {
		ws.send(JSON.stringify({ type: "token", auth: access_token }))
	}
}
function likea(idd) {
	fetch("https://api.spotify.com/v1/me/tracks", {
		method: "PUT",
		headers: {
			Authorization: "Bearer " + access_token,
			"Content-Type": "application/json",
		},
		// body: '{\n    "ids": [\n        "string"\n    ]\n}',
		body: JSON.stringify({
			ids: [idd],
		}),
	})
}
function liked(idd) {
	fetch("https://api.spotify.com/v1/me/tracks", {
		method: "DELETE",
		headers: {
			Authorization: "Bearer " + access_token,
			"Content-Type": "application/json",
		},
		// body: '{\n    "ids": [\n        "string"\n    ]\n}',
		body: JSON.stringify({
			ids: [idd],
		}),
	})
}
async function getallpt(uri) {
	let offset = 0
	let pagesize = 50
	let continueloop = true
	var output = []
	let result = await spotifyApi.getPlaylistTracks(
		(playlistid = uri),
		(options = { limit: pagesize, offset: 0 }),
	)
	do {
		try {
			for (const i in result.items) {
				output.push(result.items[i].track)
			}
			if (result.next != null) {
				offset = offset + pagesize
				result = await spotifyApi.getPlaylistTracks(
					(playlistid = uri),
					(options = { limit: pagesize, offset: offset }),
				)
			} else {
				continueloop = false
			}
		} catch (e) {
			//handle error here...
			continueloop = false
		}
	} while (continueloop)
	return output
}
async function getallut(id = null) {
	let offset = 0
	let pagesize = 50
	let continueloop = true
	let go = false
	if (id === null) {
		go = true
	}
	var output = []
	let result = await spotifyApi.getMySavedTracks(
		(options = { limit: pagesize, offset: 0 }),
	)
	do {
		try {
			for (const i in result.items) {
				if (go) {
					output.push(result.items[i].track)
				}
				if (result.items[i].track.id === id) {
					go = true
				}
			}
			if (result.next != null) {
				offset = offset + pagesize
				result = await spotifyApi.getMySavedTracks(
					(options = { limit: pagesize, offset: offset }),
				)
			} else {
				continueloop = false
			}
		} catch (e) {
			//handle error here...
			continueloop = false
		}
	} while (continueloop)
	return output
}
async function getallup() {
	let offset = 0
	let pagesize = 50
	let continueloop = true
	let go = false
	var output = []
	let result = await spotifyApi.getUserPlaylists(
		(options = { limit: pagesize, offset: 0 }),
	)
	do {
		try {
			for (const i in result.items) {
				output.push(result.items[i])
			}
			if (result.next != null) {
				offset = offset + pagesize
				result = await spotifyApi.getUserPlaylists(
					(options = { limit: pagesize, offset: offset }),
				)
			} else {
				continueloop = false
			}
		} catch (e) {
			//handle error here...
			continueloop = false
		}
	} while (continueloop)
	return output
}
setInterval(rrefreshtoken, 1800000)
function trash(id) {
	for (const w in queue) {
		if (queue[w].id === id) {
			queue.splice(w, 1)
		}
	}
	localStorage.setItem("queue", JSON.stringify(queue))
	$("#queue").click()
}
function ttrash(id) {
	for (const w in queue) {
		if (queue[w].id === id) {
			queue.splice(w, 1)
		}
	}
	localStorage.setItem("queue", JSON.stringify(queue))
}
async function psong(id) {
	await spotifyApi.play((options = { uris: ["spotify:track:" + id] }));
	let t = await spotifyApi.getTrack(id);
	let recs = await getSpotifyUris(t.artists[0].name,t.name);
	console.log(recs)
	let tempq = []
	for (const i in recs) {
		tempq.push(recs[i])
	}
	queue = tempq
	cqueue = { type: "track", uri: "spotify:track:" + id }
	localStorage.setItem("cqueue", JSON.stringify(cqueue))
	localStorage.setItem("queue", JSON.stringify(queue))
	document.getElementById("qeee").className = "frame-1 screen close"
	document.getElementById("psongs").className = "frame-1 screen close"
	$(".topblock").each(function () {
		this.className = "topblock"
	})
	document.getElementById("b2").className = "topblock active"
	$(".bdy").each(function () {
		this.className = "bdy hide"
	})
	document.getElementById("bdy2").className = "bdy"
}
async function queuesong(id) {
	let n = await spotifyApi.getTrack(id)
	queue.unshift(n)
	localStorage.setItem("queue", JSON.stringify(queue))
	document.getElementById("qeee").className = "frame-1 screen close"
	document.getElementById("psongs").className = "frame-1 screen close"
	$(".topblock").each(function () {
		this.className = "topblock"
	})
	document.getElementById("b2").className = "topblock active"
	$(".bdy").each(function () {
		this.className = "bdy hide"
	})
	document.getElementById("bdy2").className = "bdy"
}
var isPlaying = false
async function openp(id) {
	if (id === "user") {
		plist = await getallut()
	} else {
		plist = await getallpt(id)
	}
	let f1 = document.getElementById("psongs")
	f1.innerHTML = ""
	for (const e in plist) {
		let d = plist[e]
		f1.insertAdjacentHTML(
			"beforeend",
			'<div class="group-2-VxPVnb">\r\n                        <div class="rectangle-4-IHYDQL">\r\n                        </div>\r\n                        <img class="ab67616d0000b273096a-IHYDQL" src="' +
				d.album.images[0].url +
				'">\r\n                        <h1 class="title-IHYDQL">' +
				d.name +
				'</h1>\r\n                        <div class="album-IHYDQL">' +
				d.album.name +
				'</div>\r\n                        <div class="artist-IHYDQL">' +
				d.artists[0].name +
				'</div>\r\n       <img class="qtrash" src="/img/queueicon.svg" onclick="queuesong(\'' +
				d.id +
				'\')">\r\n  <img class="psng" src="/img/playiconwhite.svg" onclick="psong(\'' +
				d.id +
				'\')">               <div class="x0000-IHYDQL">' +
				mtms(d.duration_ms) +
				"</div>\r\n                    </div> \r\n <br>",
		)
	}
	$("#psongs").removeClass("close")
}
async function pplaylist(id) {
	if (!e) var e = window.event
	e.cancelBubble = true
	if (e.stopPropagation) e.stopPropagation()
	if (id === "user") {
		queue = await getallut()
	} else {
		queue = await getallpt(id)
	}
	await spotifyApi.play(
		(options = { uris: ["spotify:track:" + queue.shift().id] }),
	)
	cqueue = { type: "playlist", uri: "spotify:playlist:" + id }
	localStorage.setItem("cqueue", JSON.stringify(cqueue))
	localStorage.setItem("queue", JSON.stringify(queue))
	document.getElementById("qeee").className = "frame-1 screen close"
	document.getElementById("psongs").className = "frame-1 screen close"
	$(".topblock").each(function () {
		this.className = "topblock"
	})
	document.getElementById("b2").className = "topblock active"
	$(".bdy").each(function () {
		this.className = "bdy hide"
	})
	document.getElementById("bdy2").className = "bdy"
}

window.onload = async () => {
	const seekBar = document.getElementById("points")
	const name = document.getElementById("name")
	const t1 = document.getElementById("posit")
	const t2 = document.getElementById("durration")
	var n = 0
	var song = ""
	var dur = 0

	while (ws.readyState != 1) {
		console.log("no ws");
		console.log(ws.readyState);
		await new Promise(r => setTimeout(r, 2000));
	}
	console.log("ws connected")
	rrefreshtoken()
	access_token = localStorage.getItem("access_token")
	spotifyApi.setAccessToken(access_token)
	if (
		ws.readyState !== WebSocket.CONNECTING &&
		ws.readyState !== WebSocket.CLOSED
	) {
		ws.send(JSON.stringify({ type: "token", auth: access_token }))
	}
	var temp2 = true
	var devid = null
	while (temp2) {
		var devs = await spotifyApi.getMyDevices()
		devs = devs.devices
		for (var i = 0; i < devs.length; i++) {
			if ((devs[i].name = "Librespot")) {
				temp2 = false
				devid = devs[i].id
				break
			}
		}
		await new Promise((r) => setTimeout(r, 2000))
	}
	await spotifyApi.transferMyPlayback([devid])
	console.log("Device found")
	if (cqueue.length !== 0 && queue.length !== 0) {
		//pass
	} else {
		let n = await spotifyApi.getMyCurrentPlaybackState()
		console.log(n)
		if (n.context) {
			cqueue = { type: n.context.type, uri: n.context.uri }
			if (n.context.type === "playlist") {
				queue = await getallpt(n.context.uri.replace("spotify:playlist:", ""))
			} else if (
				n.context.type === "collection" &&
				n.context.href === "https://api.spotify.com/v1/me/tracks"
			) {
				queue = await getallut(n.item.id)
			}
		} else {
			cqueue = { type: "track", uri: n.item.uri }
			let recs = getSpotifyUris(n.item.artists[0].name,n.item.name);
			let tempq = []
			for (const i in recs) {
				tempq.push(recs[i])
			}
			queue = tempq
		}
		localStorage.setItem("cqueue", JSON.stringify(cqueue))
		localStorage.setItem("queue", JSON.stringify(queue))
	}

	document.getElementById("togglePlay").onclick = async function () {
		let p = await spotifyApi.getMyCurrentPlaybackState()
		if (p.is_playing) {
			console.log(1)
			await spotifyApi.pause()
		} else {
			console.log(2)
			await spotifyApi.play()
		}
		updater()
	}
	document.getElementById("skip").onclick = async function () {
		let p = await spotifyApi.getMyCurrentPlaybackState()
		back.unshift(p.item.id)
		localStorage.setItem("back", JSON.stringify(back))
		if (queue.length !== 0) {
			await spotifyApi.play(
				(options = { uris: ["spotify:track:" + queue.shift().id] }),
			)
			localStorage.setItem("queue", JSON.stringify(queue))
		} else {
			let p = await spotifyApi.getMyCurrentPlaybackState()
			cqueue = { type: "track", uri: p.item.uri }
			let recs = getSpotifyUris(p.item.artists[0].name,p.item.name);
			let tempq = []
			for (const i in recs) {
				tempq.push(recs[i])
			}
			queue = tempq
			await spotifyApi.play(
				(options = { uris: ["spotify:track:" + queue.shift().id] }),
			)
			localStorage.setItem("cqueue", JSON.stringify(cqueue))
			localStorage.setItem("queue", JSON.stringify(queue))
		}
		updater()
	}
	document.getElementById("hearts").onclick = async function () {
		let p = await spotifyApi.getMyCurrentPlaybackState()
		let a = await spotifyApi.containsMySavedTracks([p.item.id])
		console.log(p.item.id)
		console.log(a)
		if (a[0]) {
			liked(p.item.id)
			document.getElementById("like").className = "likeicon-1-q2Ud4x hide"
			document.getElementById("notlike").className = "likeicon-1-q2Ud4x"
		} else {
			likea(p.item.id)
			document.getElementById("like").className = "likeicon-1-q2Ud4x"
			document.getElementById("notlike").className = "likeicon-1-q2Ud4x hide"
		}
		updater()
	}
	document.getElementById("back").onclick = async function () {
		//fix with localstorage
		let x = await spotifyApi.getMyCurrentPlaybackState()
		if (x.progress_ms > 5000) {
			await spotifyApi.seek(0)
		} else {
			if (back.length !== 0) {
				await spotifyApi.play(
					(options = { uris: ["spotify:track:" + back.shift()] }),
				)
				queue.unshift(x.item)
				localStorage.setItem("queue", JSON.stringify(queue))
				localStorage.setItem("back", JSON.stringify(back))
			} else {
				await spotifyApi.seek(0)
			}
		}
		updater()
	}
	const button = document.getElementById("hiii")

	ws.onmessage = async (event) => {
		const msg = JSON.parse(event.data)
		let s = true
		let recs
		let tempq
		switch (msg.type) {
			case "search":
				addClass()
				s = false
				Sound("data:audio/wav;base64," + endsound)
				$("html").removeClass("run")
				button.style.animation = ""
				let tracks = await spotifyApi.search(
					(q = msg.text),
					(type = ["track"]),
					(limit = 1),
					(callback = function (rej, res) {
						if (rej) {
							rrefreshtoken()
							console.log("failed")
						}
					}),
				)
				await spotifyApi.play(
					(options = { uris: ["spotify:track:" + tracks.tracks.items[0].id] }),
				)
				let recs = getSpotifyUris(tracks.tracks.items[0].artists[0].name,tracks.tracks.items[0].name);
				p.item
				tempq = []
				for (const i in recs) {
					tempq.push(recs[i])
				}
				queue = tempq
				cqueue = { type: "track", uri: tracks.tracks.items[0].uri }
				localStorage.setItem("cqueue", JSON.stringify(cqueue))
				localStorage.setItem("queue", JSON.stringify(queue))
				await spotifyApi.setVolume(vol)
				break
			case "wake":
				$("html").addClass("run")
				if (vol > 0) {
					await spotifyApi.setVolume(0.1)
				}
				Sound("data:audio/wav;base64," + startsound)
				s = false
				addClass()
				break
			case "fail":
				$("html").removeClass("run")
				$("html").addClass("fail")
				Sound("data:audio/wav;base64," + failsound)
				setTimeout(() => {
					$("html").removeClass("fail")
				}, "800")
				break
			case "pause":
				await spotifyApi.pause()
				ws.send(
					JSON.stringify({
						type: "state",
						position: positionn,
						duration: durationn,
						current_track: current_trackn,
						paused: pausedn,
						auth: access_token,
					}),
				)
				break
			case "unpause":
				await spotifyApi.play()
				ws.send(
					JSON.stringify({
						type: "state",
						position: positionn,
						duration: durationn,
						current_track: current_trackn,
						paused: pausedn,
						auth: access_token,
					}),
				)
				break
			case "cancel":
				break
			case "volume":
				if (msg.level) {
					console.log(msg.level)
					if (msg.level > 10) {
						vol = 1
					}
					vol = msg.level / 10
					break
				}
				if (msg.direction === "up") {
					if (vol > 0.8) {
						vol = 1
						break
					}
					vol = vol + 0.2
				}
				if (msg.direction === "down") {
					if (vol < 0.2) {
						vol = 0.1
						break
					}
					vol = vol - 0.2
				}
				if (msg.direction === "mute") {
					vol = 0
				}
				localStorage.setItem("vol", vol)
				break
			case "next":
				document.getElementById("skip").click()
				break
			case "previous":
				await spotifyApi.seek(6000)
				document.getElementById("back").click()
				break
			case "trash":
				s = false
				ttrash(msg.id)
				ws.send(JSON.stringify({ type: "q" }))
				break
			case "getqueue":
				s = false
				ws.send(JSON.stringify({ type: "squeue", queue: queue }))
				break
			case "queue":
				s = false
				let ss = await spotifyApi.getTrack(msg.id)
				queue.unshift(ss)
				localStorage.setItem("queue", JSON.stringify(queue))
				ws.send(JSON.stringify({ type: "squeue", queue: queue }))
				break
			case "gstate":
				s = false
				positionn =
					t1.innerText.split(":").map(Number)[0] * 60 * 1000 +
					t1.innerText.split(":").map(Number)[1] * 1000
				ws.send(
					JSON.stringify({
						type: "state",
						position: positionn,
						duration: durationn,
						current_track: current_trackn,
						paused: pausedn,
						auth: access_token,
					}),
				)
				let p = await spotifyApi.getMyCurrentPlaybackState()
				let a = await spotifyApi.containsMySavedTracks([p.item.id])
				if (a[0]) {
					document.getElementById("like").className = "likeicon-1-q2Ud4x"
					document.getElementById("notlike").className =
						"likeicon-1-q2Ud4x hide"
				} else {
					document.getElementById("like").className = "likeicon-1-q2Ud4x hide"
					document.getElementById("notlike").className = "likeicon-1-q2Ud4x"
				}
				break
			case "seek":
				s = false
				if (new Date() - ltime > 200) {
					await spotifyApi.seek(parseInt(msg.spot))
					lastTimestamp = Date.now()
					lastState = parseInt(msg.spot)
					ltime = new Date()
				}
				break
			case "psong":
				s = false
				await spotifyApi.play((options = { uris: ["spotify:track:" + msg.id] }))
				recs = getSpotifyUris(tracks.tracks.items[0].artists[0].name,tracks.tracks.items[0].name);
				tempq = []
				for (const i in recs) {
					tempq.push(recs[i])
				}
				queue = tempq
				let t = await spotifyApi.getTrack(id)
				cqueue = { type: "track", uri: t.uri }
				localStorage.setItem("cqueue", JSON.stringify(cqueue))
				localStorage.setItem("queue", JSON.stringify(queue))
				break
			case "playp":
				s = false
				await pplaylist(msg.id)
				break
			default:
				s = false
		}
		if (s === true) {
			Sound("data:audio/wav;base64," + endsound)
			$("html").removeClass("run")
			await spotifyApi.setVolume(vol)
			s = false
		}
	}
	button.addEventListener("click", function (e) {
		Sound("data:audio/wav;base64," + startsound)
		e.target.style.animation = "pulse 2s infinite"
		let msg = { type: "listen" }
		ws.send(JSON.stringify(msg))
	})

	let lastState = null
	let lastTimestamp = 0
	var ltime = new Date()
	$("#queue").click(async function () {
		let f1 = document.getElementById("qeee")
		f1.innerHTML = ""
		queue = JSON.parse(localStorage.getItem("queue"))
		for (const e in queue) {
			let d = await spotifyApi.getTrack(queue[e].replace("spotify:track:", ""))
			f1.insertAdjacentHTML(
				"beforeend",
				'<div class="group-2-VxPVnb">\r\n                        <div class="rectangle-4-IHYDQL">\r\n                        </div>\r\n                        <img class="ab67616d0000b273096a-IHYDQL" src="' +
					d.album.images[0].url +
					'">\r\n                        <h1 class="title-IHYDQL">' +
					d.name +
					'</h1>\r\n                        <div class="album-IHYDQL">' +
					d.album.name +
					'</div>\r\n                        <div class="artist-IHYDQL">' +
					d.artists[0].name +
					'</div>\r\n       <img class="trash" src="/img/trash.svg" onclick="trash(\'' +
					d.id +
					'\')">                <div class="x0000-IHYDQL">' +
					mtms(d.duration_ms) +
					"</div>\r\n                    </div> \r\n <br>",
			)
		}
		$("#qeee").removeClass("close")
	})

	$("#b1").click(async function () {
		let f1 = document.getElementById("playlist")
		f1.innerHTML = ""
		plist = await getallup()
		let liked = await getallut()
		plist.unshift({
			id: "user",
			images: [{ url: "/img/like.jpg" }],
			name: "Liked Songs",
			tracks: { total: liked.length },
		})
		for (const e in plist) {
			let d = plist[e]
			f1.insertAdjacentHTML(
				"beforeend",
				'<div class="group-2-VxPVnb" onclick="openp(\'' +
					d.id +
					'\')">\r\n <div class="rectangle-4-IHYDQL"></div> <img class="ab67616d0000b273096a-IHYDQL" src="' +
					d.images[0].url +
					'">\r\n <h1 class="title-IHYDQL">' +
					d.name +
					'</h1>\r\n <div class="number-IHYDQL">' +
					d.tracks.total +
					' songs</div>\r\n <img class="play" src="/img/playiconwhite.svg" onclick="pplaylist(\'' +
					d.id +
					"')\"> \r\n</div>\r\n                    </div> \r\n <br>",
			)
		}
	})
	var positionn
	var durationn
	var current_trackn
	var pausedn
	async function updater() {
		var data = await spotifyApi.getMyCurrentPlaybackState()
		var position = data.progress_ms
		var duration = data.item.duration_ms
		var current_track = data.item
		var paused = data.is_playing
		positionn = position
		durationn = duration
		current_trackn = current_track
		pausedn = !paused
		if (positionn === null) {
			positionn = 0
		}
		lastState = positionn
		lastTimestamp = Date.now()
		if (song !== current_trackn.name) {
			song = current_trackn.name
			name.innerText = current_trackn.name
			positionn = 0
		}
		seekBar.max = durationn
		dur = durationn
		seekBar.value = positionn
		t1.innerText = mtms(positionn)
		t2.innerText = mtms(durationn)
		isPlaying = !paused
		let f = document.getElementById("togglePlay").getElementsByTagName("img")
		for (let e of f) {
			if (e.id === "play" && !pausedn) {
				e.className = "playicon-1-bJ8vx4 hide"
			} else if (e.id === "play" && pausedn) {
				e.className = "playicon-1-bJ8vx4"
			}
			if (e.id === "pause" && pausedn) {
				e.className = "playicon-1-bJ8vx4 hide"
			} else if (e.id === "pause" && !pausedn) {
				e.className = "playicon-1-bJ8vx4"
			}
		}
		document.getElementById("trackimg").src = current_trackn.album.images[0].url
		document.getElementById("album").innerText = current_trackn.album.name
		document.getElementById("artist").innerText = current_trackn.artists[0].name
		let p = await spotifyApi.getMyCurrentPlaybackState()
		let a = await spotifyApi.containsMySavedTracks([p.item.id])
		if (a[0]) {
			document.getElementById("like").className = "likeicon-1-q2Ud4x"
			document.getElementById("notlike").className = "likeicon-1-q2Ud4x hide"
		} else {
			document.getElementById("like").className = "likeicon-1-q2Ud4x hide"
			document.getElementById("notlike").className = "likeicon-1-q2Ud4x"
		}
		ws.send(
			JSON.stringify({
				type: "state",
				position: positionn,
				duration: durationn,
				current_track: current_trackn,
				paused: pausedn,
				auth: access_token,
			}),
		)
	}
	setInterval(updater, 500)

	var nex = false
	async function updateSeekBar() {
		const seekBar = document.getElementById("points")
		const t = document.getElementById("time")
		const elapsedTime = Date.now() - lastTimestamp
		positionn = lastState + elapsedTime
		if (!isPlaying) {
			seekBar.value = positionn
			//console.log(positionn)
			t1.innerText = mtms(positionn)
			t2.innerText = mtms(dur)
		}
		if (parseInt(seekBar.value) > parseInt(seekBar.max)) {
			seekBar.value = lastState
		}
		x = (seekBar.value / seekBar.max) * 100
		if (x > 99.7 && nex === true) {
			let p = await spotifyApi.getMyCurrentPlaybackState()
			back.unshift(p.item.id)
			localStorage.setItem("back", JSON.stringify(back))
			if (queue.length !== 0) {
				nex = false
				await spotifyApi.play(
					(options = { uris: ["spotify:track:" + queue.shift().id] }),
				)
				localStorage.setItem("queue", JSON.stringify(queue))
			} else {
				cqueue = { type: "track", uri: p.item.uri }
				let recs = getSpotifyUris(p.item.artists[0].name,p.item.name);
				let tempq = []
				for (const i in recs) {
					tempq.push(recs[i])
				}
				queue = tempq
				back = []
				localStorage.setItem("back", JSON.stringify(back))
				localStorage.setItem("cqueue", JSON.stringify(cqueue))
				localStorage.setItem("queue", JSON.stringify(queue))
			}
		} else if (x < 99) {
			nex = true
		}
		$(seekBar).css(
			"background",
			"linear-gradient(to right, " +
				c1 +
				" 0%, " +
				c1 +
				" " +
				x +
				"%, " +
				c2 +
				" " +
				x +
				"%, " +
				c2 +
				" 100%)",
		)
		requestAnimationFrame(updateSeekBar)
	}

	requestAnimationFrame(updateSeekBar)
	// green = #1DB954
	seekBar.oninput = async (e) => {
		x = (e.target.value / e.target.max) * 100
		$(e.target).css(
			"background",
			"linear-gradient(to right, " +
				c1 +
				" 0%, " +
				c1 +
				" " +
				x +
				"%, " +
				c2 +
				" " +
				x +
				"%, " +
				c2 +
				" 100%)",
		)
		t1.innerText = mtms(e.target.value)
		if (new Date() - ltime > 200) {
			await spotifyApi.seek(parseInt(e.target.value))
			lastTimestamp = Date.now()
			lastState = parseInt(e.target.value)
			ltime = new Date()
		}
		updater()
	}
	seekBar.onmousedown = (e) => {
		c1 = "#1DB954"
	}
	seekBar.onmouseup = (e) => {
		c1 = "#fff"
	}
}
function pad(n, width, z) {
	z = z || "0"
	n = n + ""
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}
const nthNumber = (number) => {
	if (number > 3 && number < 21) return "th"
	switch (number % 10) {
		case 1:
			return "st"
		case 2:
			return "nd"
		case 3:
			return "rd"
		default:
			return "th"
	}
}
const time = document.getElementById("time")
const dates = document.getElementById("dates")
const timef = () => {
	let d = new Date()
	time.innerText =
		((d.getHours() + 24) % 12 || 12) + ":" + pad(d.getMinutes(), 2)
	dates.innerText =
		d.toLocaleDateString("en-US", { weekday: "long" }) +
		" " +
		d.toLocaleDateString("en-US", { month: "long" }) +
		" " +
		d.getDay() +
		nthNumber(d.getDay())
}
setInterval(timef, 3000)
timef()
function upp(str) {
	return str
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.substring(1))
		.join(" ")
}
const weatherf = () => {
	var settings = {
		url: "https://api.openweathermap.org/data/3.0/onecall?lat=39.168804&lon=-86.536659&appid=ebdfd7601815c5f915487fa6f88ee74c&units=imperial",
		method: "GET",
		timeout: 0,
	}

	$.ajax(settings).done(function (response) {
		let jsn = response
		document.getElementById("ctemp").innerText =
			parseInt(jsn["current"]["temp"]) + "\u00B0"
		for (let i = 0; i < 5; i++) {
			let widget = document.getElementById("w" + (i + 1))
			let w = jsn["hourly"][2 * (i + 1)]
			let d = new Date(Date.now() + 7200000 * (i + 1))
			let ts = d
				.toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
				.toLowerCase()
				.split(" ")
			widget.getElementsByClassName("x1200-pm")[0].innerText =
				ts[0] + ":00 " + ts[1] //toLocaleTimeString("en-US", options={hour: "numeric"}) + ":00 " + d.toLocaleTimeString("en-US", options={dayPeriod: "short", hourCycle: "h12"}).toLowerCase()
			widget.getElementsByClassName("clear-sky")[0].innerText = upp(
				w["weather"][0]["description"],
			)
			widget.getElementsByClassName("x102")[0].innerText =
				parseInt(w["temp"]) + "\u00B0"
			widget.getElementsByClassName("x01n2x-1")[0].src =
				"https://openweathermap.org/img/wn/" +
				w["weather"][0]["icon"].replace("d", "n") +
				"@2x.png"
		}
	})
	setTimeout(weatherf, 1800000)
}
weatherf()

let timer
let el = document.getElementsByClassName("screensaver")[0]
// Function to add the class and start the timer
function addClass() {
	// Add the class if it's not already there
	if (!el.classList.contains("hide")) {
		el.classList.add("hide")
	}

	// Clear any existing timer
	if (timer) {
		clearTimeout(timer)
	}

	// Start a new timer to remove the class after the timeout
	timer = setTimeout(() => {
		el.classList.remove("hide")
	}, 300000)
}

// Add an event listener to handle clicks\
let all = document.getElementById("everything")
all.addEventListener("click", addClass)
addClass()
