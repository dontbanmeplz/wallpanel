var ws = new WebSocket("ws://ws.sawicz.com");
const swiper = new Swiper(".swiper", {
    // Optional parameters
});
function mtms(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
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
function trash(id) {
    ws.send(JSON.stringify({"type":"trash", "id": id}))
    $("#queue").click();
}
async function psong(id) {
    ws.send(JSON.stringify({"type":"psong", "id": id}))
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
    console.log(id)
    ws.send(JSON.stringify({"type":"queue", "id": id}))
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
$('#sear').on('input',async function (e) {
    let f1 = document.getElementById("ssn");
    f1.innerHTML = "";
    let plist = await spotifyApi.search(q=e.target.value, type=["track"],options={"limit":5})
    console.log(plist)
    for (const e in plist.tracks.items) {
        let d = plist.tracks.items[e];
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
});
async function pplaylist(id) {
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
    ws.send(JSON.stringify({"type":"playp", "id": id}))
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
const seekBar = document.getElementById("points");
const name = document.getElementById("name");
const t1 = document.getElementById("posit");
const t2 = document.getElementById("durration");
var song = "";
var dur = 0;
var position = 0;
var duration = 0;
let isPlaying = false;
let lastState = null;
let lastTimestamp = 0;
ws.onopen = async (event) => {
    ws.send(JSON.stringify({"type":"gtoken"}))
    ws.send(JSON.stringify({"type":"gstate"}))
    document.getElementById("togglePlay").onclick = function () {
        if(document.getElementById("play").classList.length === 1){
            ws.send(JSON.stringify({"type":"play"}))
        }
        else{
            ws.send(JSON.stringify({"type":"pause"}))
        }
    };
    document.getElementById("skip").onclick = async function () {
        ws.send(JSON.stringify({"type":"next"}))
    }
    document.getElementById("hearts").onclick = async function () {
        let p = await spotifyApi.getMyCurrentPlaybackState();
        let a = await spotifyApi.containsMySavedTracks([p.item.id]);
        if (a[0]) {
            await spotifyApi.removeFromMySavedTracks([p.item.id]);
        } else {
            await spotifyApi.addToMySavedTracks([p.item.id]);
        }
        ws.send(JSON.stringify({"type":"gstate"}))
    }
    document.getElementById("back").onclick = async function () {
        ws.send(JSON.stringify({"type":"previous"}))
    }
    $("#queue").click(async function () {
        ws.send(JSON.stringify({"type":"getqueue"}))
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

    async function updateSeekBar() {
        const t = document.getElementById("time");
        const elapsedTime = Date.now() - lastTimestamp;
        let position = lastState + elapsedTime;
        if (isPlaying) {
            seekBar.value = position;
            t1.innerText = mtms(position);
            t2.innerText = mtms(dur);
        }
        if (parseInt(seekBar.value) > parseInt(seekBar.max)) {
            seekBar.value = lastState;
        }
        let x = (seekBar.value / seekBar.max) * 100;

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
            ws.send(JSON.stringify({"type":"seek", "spot": e.target.value}))
            lastTimestamp = Date.now();
            lastState = parseInt(e.target.value);
            ltime = new Date();
        }
    };
    seekBar.onmousedown = (e) => {
        c1 = "#1DB954";
    };
    seekBar.onmouseup = (e) => {
        c1 = "#fff";
    };

}
ws.onmessage = async (event) => {
    const msg = JSON.parse(event.data);
    switch (msg.type) {
        case "sendqueue":
            let f1 = document.getElementById("qeee");
            f1.innerHTML = "";
            for (const e in msg.queue) {
                let d = msg.queue[e];
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
            break;
        case "state":
            spotifyApi.setAccessToken(msg.auth);
            let position = msg.position;
            let duration = msg.duration;
            let current_track = msg.current_track;
            let paused = msg.paused;
            if (position === null) {
                position = 0;
            }
            lastState = position;
            let seekBar = document.getElementById("points")
            seekBar.value = position;
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
            break;
        case "stoken":
            spotifyApi.setAccessToken(msg.auth);
            break;
    }
};