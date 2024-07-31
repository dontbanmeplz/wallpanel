var queue = JSON.parse(localStorage.getItem("queue")) || [];
var cqueue = JSON.parse(localStorage.getItem("cqueue")) || {};
var back = JSON.parse(localStorage.getItem("back")) || [];
var vol = parseFloat(localStorage.getItem("vol")) || 0;
var ws = new WebSocket("ws://localhost:8081");
var Sound = (function () {
	var df = document.createDocumentFragment();
	return function Sound(src) {
		var snd = new Audio(src);
		df.appendChild(snd); // keep in fragment until finished playing
		snd.addEventListener("ended", function () {
			df.removeChild(snd);
		});
		snd.play();
		return snd;
	};
})();
const swiper = new Swiper(".swiper", {
	// Optional parameters
});
swiper.on("touchStart", (e) => {
	swiper.allowTouchMove = true;
	let x = document.elementFromPoint(e.touches.currentX, e.touches.currentY);
	if (x.id === "points") {
		swiper.allowTouchMove = false;
	}
});

swiper.on("slideChange", (e) => {
	document.getElementById("qeee").className = "frame-1 screen close";
	document.getElementById("psongs").className = "frame-1 screen close";
	$(".topblock").each(function () {
		this.className = "topblock";
	});
	document.getElementById("b2").className = "topblock active";
	$(".bdy").each(function () {
		this.className = "bdy hide";
	});
	document.getElementById("bdy2").className = "bdy";
});
$(".topblock").click(function () {
	document.getElementById("qeee").className = "frame-1 screen close";
	document.getElementById("psongs").className = "frame-1 screen close";
	$(".topblock").each(function () {
		this.className = "topblock";
	});
	this.className = "topblock active";
	$(".bdy").each(function () {
		this.className = "bdy hide";
	});
	document.getElementById("bdy" + this.id.split("")[1]).className = "bdy";
});

let c1 = "#fff";
let c2 = "#4D4D4D";
const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(access_token);
function rrefreshtoken() {
	refreshToken();
	refresh_token = localStorage.getItem("refresh_token");
	spotifyApi.setAccessToken(access_token);
}
async function getallpt(uri) {
	let offset = 0;
	let pagesize = 50;
	let continueloop = true;
	var output = [];
	let result = await spotifyApi.getPlaylistTracks(
		(playlistid = uri),
		(options = { limit: pagesize, offset: 0 }),
	);
	do {
		try {
			for (const i in result.items) {
				output.push(result.items[i].track);
			}
			if (result.next != null) {
				offset = offset + pagesize;
				result = await spotifyApi.getPlaylistTracks(
					(playlistid = uri),
					(options = { limit: pagesize, offset: offset }),
				);
			} else {
				continueloop = false;
			}
		} catch (e) {
			//handle error here...
			continueloop = false;
		}
	} while (continueloop);
	return output;
}
async function getallut(id = null) {
	let offset = 0;
	let pagesize = 50;
	let continueloop = true;
	let go = false;
	if (id === null) {
		go = true;
	}
	var output = [];
	let result = await spotifyApi.getMySavedTracks(
		(options = { limit: pagesize, offset: 0 }),
	);
	do {
		try {
			for (const i in result.items) {
				if (go) {
					output.push(result.items[i].track);
				}
				if (result.items[i].track.id === id) {
					go = true;
				}
			}
			if (result.next != null) {
				offset = offset + pagesize;
				result = await spotifyApi.getMySavedTracks(
					(options = { limit: pagesize, offset: offset }),
				);
			} else {
				continueloop = false;
			}
		} catch (e) {
			//handle error here...
			continueloop = false;
		}
	} while (continueloop);
	return output;
}
async function getallup() {
	let offset = 0;
	let pagesize = 50;
	let continueloop = true;
	let go = false;
	var output = [];
	let result = await spotifyApi.getUserPlaylists(
		(options = { limit: pagesize, offset: 0 }),
	);
	do {
		try {
			for (const i in result.items) {
				output.push(result.items[i]);
			}
			if (result.next != null) {
				offset = offset + pagesize;
				result = await spotifyApi.getUserPlaylists(
					(options = { limit: pagesize, offset: offset }),
				);
			} else {
				continueloop = false;
			}
		} catch (e) {
			//handle error here...
			continueloop = false;
		}
	} while (continueloop);
	return output;
}
setInterval(rrefreshtoken, 1800000);
function trash(id) {
	for (const w in queue) {
		if (queue[w].id === id) {
			queue.splice(w, 1);
		}
	}
	localStorage.setItem("queue", JSON.stringify(queue));
	$("#queue").click();
}
async function psong(id) {
	await spotifyApi.play((options = { uris: ["spotify:track:" + id] }));
	let recs = await spotifyApi.getRecommendations(
		(options = {
			limit: 30,
			market: "US",
			seed_tracks: id,
		}),
	);
	let tempq = [];
	for (const i in recs.tracks) {
		tempq.push(recs.tracks[i]);
	}
	queue = tempq;
	cqueue = { type: "track", uri: "spotify:track:" + id };
	localStorage.setItem("cqueue", JSON.stringify(cqueue));
	localStorage.setItem("queue", JSON.stringify(queue));
	document.getElementById("qeee").className = "frame-1 screen close";
	document.getElementById("psongs").className = "frame-1 screen close";
	$(".topblock").each(function () {
		this.className = "topblock";
	});
	document.getElementById("b2").className = "topblock active";
	$(".bdy").each(function () {
		this.className = "bdy hide";
	});
	document.getElementById("bdy2").className = "bdy";
}
async function queuesong(id) {
	let n = await spotifyApi.getTrack(id);
	queue.unshift(n);
	localStorage.setItem("queue", JSON.stringify(queue));
	document.getElementById("qeee").className = "frame-1 screen close";
	document.getElementById("psongs").className = "frame-1 screen close";
	$(".topblock").each(function () {
		this.className = "topblock";
	});
	document.getElementById("b2").className = "topblock active";
	$(".bdy").each(function () {
		this.className = "bdy hide";
	});
	document.getElementById("bdy2").className = "bdy";
}
async function openp(id) {
	if (id === "user") {
		plist = await getallut();
	} else {
		plist = await getallpt(id);
	}
	let f1 = document.getElementById("psongs");
	f1.innerHTML = "";
	for (const e in plist) {
		let d = plist[e];
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
		);
	}
	$("#psongs").removeClass("close");
}
async function pplaylist(id) {
	if (!e) var e = window.event;
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	if (id === "user") {
		queue = await getallut();
	} else {
		queue = await getallpt(id);
	}
	await spotifyApi.play(
		(options = { uris: ["spotify:track:" + queue.shift().id] }),
	);
	cqueue = { type: "playlist", uri: "spotify:playlist:" + id };
	localStorage.setItem("cqueue", JSON.stringify(cqueue));
	localStorage.setItem("queue", JSON.stringify(queue));
	document.getElementById("qeee").className = "frame-1 screen close";
	document.getElementById("psongs").className = "frame-1 screen close";
	$(".topblock").each(function () {
		this.className = "topblock";
	});
	document.getElementById("b2").className = "topblock active";
	$(".bdy").each(function () {
		this.className = "bdy hide";
	});
	document.getElementById("bdy2").className = "bdy";
}
window.onSpotifyWebPlaybackSDKReady = async () => {
	const seekBar = document.getElementById("points");
	const name = document.getElementById("name");
	const t1 = document.getElementById("posit");
	const t2 = document.getElementById("durration");
	var n = 0;
	var song = "";
	var dur = 0;
	let token = access_token;
	player = new Spotify.Player({
		name: "Web Playback SDK Quick Start Player",
		getOAuthToken: (cb) => {
			rrefreshtoken();
			access_token = localStorage.getItem("access_token");
			spotifyApi.setAccessToken(access_token);
			cb(access_token);
		},
		volume: vol,
	});

	// Ready
	player.addListener("ready", async ({ device_id }) => {
		console.log("Ready with Device ID", device_id);
		await spotifyApi.transferMyPlayback([device_id]);
		await player.setVolume(vol);
		if (cqueue !== {} && queue.length !== 0) {
			//pass
		} else {
			let n = await spotifyApi.getMyCurrentPlaybackState();
			console.log(n);
			if (n.context) {
				cqueue = { type: n.context.type, uri: n.context.uri };
				if (n.context.type === "playlist") {
					queue = await getallpt(
						n.context.uri.replace("spotify:playlist:", ""),
					);
				} else if (
					n.context.type === "collection" &&
					n.context.href === "https://api.spotify.com/v1/me/tracks"
				) {
					queue = await getallut(n.item.id);
				}
			} else {
				cqueue = { type: "track", uri: n.item.uri };
				let recs = await spotifyApi.getRecommendations(
					(options = { limit: 30, market: "US", seed_tracks: n.item.id }),
				);
				let tempq = [];
				for (const i in recs.tracks) {
					tempq.push(recs.tracks[i]);
				}
				queue = tempq;
			}
			localStorage.setItem("cqueue", JSON.stringify(cqueue));
			localStorage.setItem("queue", JSON.stringify(queue));
		}
	});

	// Not Ready
	player.addListener("not_ready", ({ device_id }) => {
		console.log("Device ID has gone offline", device_id);
	});

	player.addListener("initialization_error", ({ message }) => {
		console.error(message);
	});

	player.addListener("authentication_error", ({ message }) => {
		rrefreshtoken();
		console.error(message);
	});

	player.addListener("account_error", ({ message }) => {
		console.error(message);
	});

	document.getElementById("togglePlay").onclick = function () {
		player.togglePlay();
	};
	document.getElementById("skip").onclick = async function () {
		let p = await spotifyApi.getMyCurrentPlaybackState();
		back.unshift(p.item.id);
		localStorage.setItem("back", JSON.stringify(back));
		if (queue.length !== 0) {
			await spotifyApi.play(
				(options = { uris: ["spotify:track:" + queue.shift().id] }),
			);
			localStorage.setItem("queue", JSON.stringify(queue));
		} else {
			let p = await spotifyApi.getMyCurrentPlaybackState();
			cqueue = { type: "track", uri: p.item.uri };
			let recs = await spotifyApi.getRecommendations(
				(options = { limit: 30, market: "US", seed_tracks: p.item.id }),
			);
			let tempq = [];
			for (const i in recs.tracks) {
				tempq.push(recs.tracks[i]);
			}
			queue = tempq;
			await spotifyApi.play(
				(options = { uris: ["spotify:track:" + queue.shift().id] }),
			);
			localStorage.setItem("cqueue", JSON.stringify(cqueue));
			localStorage.setItem("queue", JSON.stringify(queue));
		}
	};
	document.getElementById("hearts").onclick = async function () {
		let p = await spotifyApi.getMyCurrentPlaybackState();
		let a = await spotifyApi.containsMySavedTracks([p.item.id]);
		if (a[0]) {
			await spotifyApi.removeFromMySavedTracks([p.item.id]);
			document.getElementById("like").className = "likeicon-1-q2Ud4x hide";
			document.getElementById("notlike").className = "likeicon-1-q2Ud4x";
		} else {
			await spotifyApi.addToMySavedTracks([p.item.id]);
			document.getElementById("like").className = "likeicon-1-q2Ud4x";
			document.getElementById("notlike").className = "likeicon-1-q2Ud4x hide";
		}
	};
	document.getElementById("back").onclick = async function () {
		//fix with localstorage
		let x = await spotifyApi.getMyCurrentPlaybackState();
		if (x.progress_ms > 5000) {
			player.seek(0);
		} else {
			if (back.length !== 0) {
				await spotifyApi.play(
					(options = { uris: ["spotify:track:" + back.shift()] }),
				);
				queue.unshift(x.item);
				localStorage.setItem("queue", JSON.stringify(queue));
				localStorage.setItem("back", JSON.stringify(back));
			} else {
				player.seek(0);
			}
		}
	};
	const button = document.getElementById("hiii");

	ws.onmessage = async (event) => {
		const msg = JSON.parse(event.data);
		let s = true;
		switch (msg.type) {
			case "search":
				s = false;
				Sound("data:audio/wav;base64," + endsound);
				$("html").removeClass("run")
				button.style.animation = "";
				let tracks = await spotifyApi.search(
					(q = msg.text),
					(type = ["track"]),
					(limit = 1),
					(callback = function (rej, res) {
						if (rej) {
							rrefreshtoken();
							console.log("failed");
						}
					}),
				);
				await spotifyApi.play(
					(options = { uris: ["spotify:track:" + tracks.tracks.items[0].id] }),
				);
				let recs = await spotifyApi.getRecommendations(
					(options = {
						limit: 30,
						market: "US",
						seed_tracks: tracks.tracks.items[0].id,
					}),
				);
				let tempq = [];
				for (const i in recs.tracks) {
					tempq.push(recs.tracks[i]);
				}
				queue = tempq;
				cqueue = { type: "track", uri: tracks.tracks.items[0].uri };
				localStorage.setItem("cqueue", JSON.stringify(cqueue));
				localStorage.setItem("queue", JSON.stringify(queue));
				await player.setVolume(vol);
				break;
			case "wake":
				$("html").addClass("run")
				if (vol > 0) {
					await player.setVolume(0.1);
				}
				Sound("data:audio/wav;base64," + startsound);
				s = false;
				break;
			case "fail":
				$("html").removeClass("run")
				$("html").addClass("fail")
				Sound("data:audio/wav;base64," + failsound);
				setTimeout(() => {
					$("html").removeClass("fail");
				}, "800");
				break;
			case "pause":
				player.pause();
				break;
			case "unpause":
				player.resume();
				break;
			case "cancel":
				break;
			case "volume":
				if (msg.level) {
					console.log(msg.level);
					if (msg.level > 10) {
						vol = 1;
					}
					vol = msg.level / 10;
					break;
				}
				if (msg.direction === "up") {
					if (vol > 0.8) {
						vol = 1;
						break;
					}
					vol = vol + 0.2;
				}
				if (msg.direction === "down") {
					if (vol < 0.2) {
						vol = 0.1;
						break;
					}
					vol = vol - 0.2;
				}
				if (msg.direction === "mute") {
					vol = 0;
				}
				localStorage.setItem("vol", vol);
				break;
			case "next":
				document.getElementById("skip").click();
				break;
			case "previous":
				await player.seek(6000);
				document.getElementById("back").click();
				break;
		}
		if (s === true) {
			Sound("data:audio/wav;base64," + endsound);
			$("html").removeClass("run")
			await player.setVolume(vol);
			s = false;
		}
	};
	button.addEventListener("click", function (e) {
		Sound("data:audio/wav;base64," + startsound);
		e.target.style.animation = "pulse 2s infinite";
		let msg = { type: "listen" };
		ws.send(JSON.stringify(msg));
	});
	let isPlaying = false;
	let lastState = null;
	let lastTimestamp = 0;
	$("#queue").click(async function () {
		let f1 = document.getElementById("qeee");
		f1.innerHTML = "";
		for (const e in queue) {
			let d = queue[e];
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
			);
		}
		$("#qeee").removeClass("close");
	});

	$("#b1").click(async function () {
		let f1 = document.getElementById("playlist");
		f1.innerHTML = "";
		plist = await getallup();
		let liked = await getallut();
		plist.unshift({
			id: "user",
			images: [{ url: "/img/like.jpg" }],
			name: "Liked Songs",
			tracks: { total: liked.length },
		});
		for (const e in plist) {
			let d = plist[e];
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
			);
		}
	});
	player.addListener(
		"player_state_changed",
		async ({ position, duration, track_window: { current_track }, paused }) => {
			if (position === null) {
				position = 0;
			}
			lastState = position;
			lastTimestamp = Date.now();
			if (song !== current_track.name) {
				song = current_track.name;
				name.innerText = current_track.name;
				position = 0;
			}
			seekBar.max = duration;
			dur = duration;
			seekBar.value = position;
			t1.innerText = mtms(position);
			t2.innerText = mtms(duration);
			isPlaying = !paused;
			let f = document.getElementById("togglePlay").getElementsByTagName("img");
			for (let e of f) {
				if (e.id === "play" && !paused) {
					e.className = "playicon-1-bJ8vx4 hide";
				} else if (e.id === "play" && paused) {
					e.className = "playicon-1-bJ8vx4";
				}
				if (e.id === "pause" && paused) {
					e.className = "playicon-1-bJ8vx4 hide";
				} else if (e.id === "pause" && !paused) {
					e.className = "playicon-1-bJ8vx4";
				}
			}
			document.getElementById("trackimg").src =
				current_track.album.images[0].url;
			document.getElementById("album").innerText = current_track.album.name;
			document.getElementById("artist").innerText =
				current_track.artists[0].name;
			let p = await spotifyApi.getMyCurrentPlaybackState();
			let a = await spotifyApi.containsMySavedTracks([p.item.id]);
			if (a[0]) {
				document.getElementById("like").className = "likeicon-1-q2Ud4x";
				document.getElementById("notlike").className = "likeicon-1-q2Ud4x hide";
			} else {
				document.getElementById("like").className = "likeicon-1-q2Ud4x hide";
				document.getElementById("notlike").className = "likeicon-1-q2Ud4x";
			}
		},
	);

	var nex = true;
	async function updateSeekBar() {
		const seekBar = document.getElementById("points");
		const t = document.getElementById("time");
		const elapsedTime = Date.now() - lastTimestamp;
		let position = lastState + elapsedTime;
		if (isPlaying) {
			seekBar.value = position;
			//console.log(position)
			t1.innerText = mtms(position);
			t2.innerText = mtms(dur);
		}
		if (parseInt(seekBar.value) > parseInt(seekBar.max)) {
			seekBar.value = lastState;
		}
		x = (seekBar.value / seekBar.max) * 100;
		if (x > 99.7 && nex === true) {
			let p = await spotifyApi.getMyCurrentPlaybackState();
			back.unshift(p.item.id);
			localStorage.setItem("back", JSON.stringify(back));
			if (queue.length !== 0) {
				nex = false;
				await spotifyApi.play(
					(options = { uris: ["spotify:track:" + queue.shift().id] }),
				);
				localStorage.setItem("queue", JSON.stringify(queue));
			} else {
				cqueue = { type: "track", uri: p.item.uri };
				let recs = await spotifyApi.getRecommendations(
					(options = { limit: 30, market: "US", seed_tracks: p.item.id }),
				);
				let tempq = [];
				for (const i in recs.tracks) {
					tempq.push(recs.tracks[i]);
				}
				queue = tempq;
				back = [];
				localStorage.setItem("back", JSON.stringify(back));
				localStorage.setItem("cqueue", JSON.stringify(cqueue));
				localStorage.setItem("queue", JSON.stringify(queue));
			}
		} else if (x < 99) {
			nex = true;
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
		);
		requestAnimationFrame(updateSeekBar);
	}

	requestAnimationFrame(updateSeekBar);
	player.connect();
	// green = #1DB954
	var ltime = new Date();
	seekBar.oninput = (e) => {
		x = (e.target.value / e.target.max) * 100;
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
		);
		t1.innerText = mtms(e.target.value);
		if (new Date() - ltime > 200) {
			player.seek(e.target.value).then(() => {
				lastTimestamp = Date.now();
				//console.log(e.target.value)
				lastState = parseInt(e.target.value);
			});
			ltime = new Date();
		}
	};
	seekBar.onmousedown = (e) => {
		c1 = "#1DB954";
	};
	seekBar.onmouseup = (e) => {
		c1 = "#fff";
	};
};
