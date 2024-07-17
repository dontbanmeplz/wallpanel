const swiper = new Swiper('.swiper', {
    // Optional parameters
    loop: true
});
swiper.on('touchStart', (e) => {
    swiper.allowTouchMove = true
    let x = document.elementFromPoint(e.touches.currentX, e.touches.currentY);
    if (x.id === "points"){
        swiper.allowTouchMove = false
    }
});
$('#queue').click(async function () {
    const f1 = document.getElementById("qeee");
    f1.innerHTML = "";
    var qdata = await spotifyApi.getQueue();
    for (const e in qdata.queue) {
        var d = qdata.queue[e]
        f1.insertAdjacentHTML("beforeend", "<div class=\"group-2-VxPVnb\">\r\n                        <div class=\"rectangle-4-IHYDQL\">\r\n                        <\/div>\r\n                        <img class=\"ab67616d0000b273096a-IHYDQL\" src=\"" + d.album.images[0].url + "\">\r\n                        <h1 class=\"title-IHYDQL\">" + d.name + "<\/h1>\r\n                        <div class=\"album-IHYDQL\">" + d.album.name + "<\/div>\r\n                        <div class=\"artist-IHYDQL\">" + d.artists[0].name + "<\/div>\r\n       <img class=\"trash\" src=\"/img/trash.svg\" onclick='trash(" + d.id + ")'>                <div class=\"x0000-IHYDQL\">" + mtms(d.duration_ms) + "<\/div>\r\n                    <\/div> \r\n <br>");
    }
    $('.frame-1').toggleClass("close")
});
swiper.on('slideChange', (e) => {
    document.getElementById("qeee").className = "frame-1 screen close";
    $( ".topblock" ).each(function( ) {
        this.className = "topblock"
    });
    document.getElementById("b2").className = "topblock active";
    $( ".bdy" ).each(function( ) {
        this.className = "bdy hide"
    });
    document.getElementById("bdy2").className = "bdy";
});
$('.topblock').click(function(){
    document.getElementById("qeee").className = "frame-1 screen close";
    $( ".topblock" ).each(function( ) {
        this.className = "topblock"
    });
    this.className = "topblock active"
    $( ".bdy" ).each(function( ) {
        this.className = "bdy hide"
    });
    document.getElementById("bdy" + this.id.split("")[1]).className = "bdy";
});
let c1 = "#fff"
let c2 = "#4D4D4D"
const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(access_token);
function rrefreshtoken() {
    refreshToken()
    refresh_token = localStorage.getItem("refresh_token")
    spotifyApi.setAccessToken(access_token);
}
window.onSpotifyWebPlaybackSDKReady = async () => {
    const seekBar = document.getElementById("points");
    const name = document.getElementById("name");
    const t1 = document.getElementById("posit");
    const t2 = document.getElementById("durration");
    var n = 0;
    var song = "";
    var dur = 0
    let token = access_token;
    player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => {
            rrefreshtoken()
            access_token = localStorage.getItem("access_token")
            spotifyApi.setAccessToken(access_token);
            cb(access_token);
        },
        volume: 0.5
    });


    // Ready
    player.addListener('ready', ({device_id}) => {
        console.log('Ready with Device ID', device_id);
        spotifyApi.transferMyPlayback([device_id])
    });

    // Not Ready
    player.addListener('not_ready', ({device_id}) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('initialization_error', ({message}) => {
        console.error(message);
    });

    player.addListener('authentication_error', ({message}) => {
        refreshToken();
        console.error(message);
    });

    player.addListener('account_error', ({message}) => {
        console.error(message);
    });

    document.getElementById('togglePlay').onclick = function () {
        player.togglePlay();
    };
    document.getElementById('skip').onclick = function () {
        spotifyApi.skipToNext()
    };
    document.getElementById('hearts').onclick = async function () {

        let p = await spotifyApi.getMyCurrentPlaybackState()
        let a = await spotifyApi.containsMySavedTracks([p.item.id])
        if (a[0]) {
            await spotifyApi.removeFromMySavedTracks([p.item.id])
            document.getElementById("like").className = "likeicon-1-q2Ud4x hide"
            document.getElementById("notlike").className = "likeicon-1-q2Ud4x"

        } else {
            await spotifyApi.addToMySavedTracks([p.item.id])
            document.getElementById("like").className = "likeicon-1-q2Ud4x"
            document.getElementById("notlike").className = "likeicon-1-q2Ud4x hide"
        }
    };
    document.getElementById('back').onclick = async function () {
        var x = await spotifyApi.getMyCurrentPlaybackState();
        if (x.progress_ms > 5000) {
            player.seek(0)
        } else {
            spotifyApi.skipToPrevious()
        }

    };
    const button = document.getElementById("hiii")

    var recognizing;
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    function reset() {
        recognizing = false;
    }
    reset();
    recognition.onend = reset();
    recognition.onresult = async function (event) {
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                let tracks = await spotifyApi.search(q = event.results[i][0].transcript, type = ["track"], limit = 1)
                console.log(tracks)
                spotifyApi.play(options = {"uris": ["spotify:track:" + tracks.tracks.items[0].id]})

            }
        }
    }
    button.ontouchstart = function (e) {
        e.target.style.animation = "pulse 2s infinite"
        recognition.start();
        recognizing = true;
    }
    button.ontouchend = async function (e) {
        e.target.style.animation = ""
        button.disabled = true
        await new Promise(r => setTimeout(r, 1000));
        recognition.stop();
        reset();
        button.disabled = false
    }
    let isPlaying = false;
    let lastState = null;
    let lastTimestamp = 0;
    player.addListener('player_state_changed', async ({
                                                          position,
                                                          duration,
                                                          track_window: {current_track},
                                                          paused
                                                      }) => {
        if (position === null) {
            position = 0
        }
        lastState = position;
        lastTimestamp = Date.now();
        if (song !== current_track.name) {
            song = current_track.name;
            name.innerText = current_track.name;
            position = 0
        }
        seekBar.max = duration;
        dur = duration;
        seekBar.value = position
        t1.innerText = mtms(position);
        t2.innerText = mtms(duration)
        isPlaying = !paused;
        let f = document.getElementById("togglePlay").getElementsByTagName('img');
        for (let e of f) {
            if (e.id === "play" && !paused) {
                e.className = "playicon-1-bJ8vx4 hide"
            } else if (e.id === "play" && paused) {
                e.className = "playicon-1-bJ8vx4"
            }
            if (e.id === "pause" && paused) {
                e.className = "playicon-1-bJ8vx4 hide"
            } else if (e.id === "pause" && !paused) {
                e.className = "playicon-1-bJ8vx4"
            }
        }
        document.getElementById("trackimg").src = current_track.album.images[0].url;
        document.getElementById("album").innerText = current_track.album.name;
        document.getElementById("artist").innerText = current_track.artists[0].name;
        let p = await spotifyApi.getMyCurrentPlaybackState()
        let a = await spotifyApi.containsMySavedTracks([p.item.id])
        if (a[0]){
            document.getElementById("like").className = "likeicon-1-q2Ud4x"
            document.getElementById("notlike").className = "likeicon-1-q2Ud4x hide"
        }
        else{
            document.getElementById("like").className = "likeicon-1-q2Ud4x hide"
            document.getElementById("notlike").className = "likeicon-1-q2Ud4x"
        }
    });



    function updateSeekBar() {
        const seekBar = document.getElementById('points');
        const t = document.getElementById("time")
        const elapsedTime = Date.now() - lastTimestamp;
        let position = lastState + elapsedTime;
        if (isPlaying) {
            seekBar.value = position;
            //console.log(position)
            t1.innerText = mtms(position);
            t2.innerText = mtms(dur)
        }
        if (parseInt(seekBar.value) > parseInt(seekBar.max)) {
            seekBar.value = lastState;
        }
        x = (seekBar.value/seekBar.max)* 100
        $( seekBar ).css( 'background', 'linear-gradient(to right, ' + c1 +' 0%, '+c1+' '+ x +'%, '+c2+' ' + x + '%, '+c2+' 100%)' );
        requestAnimationFrame(updateSeekBar);
    }

    requestAnimationFrame(updateSeekBar);
    player.connect();
    // green = #1DB954
    var ltime = new Date();
    seekBar.oninput = (e) => {

        x = (e.target.value/e.target.max)* 100
        $( e.target ).css( 'background', 'linear-gradient(to right, ' + c1 +' 0%, '+c1+' '+ x +'%, '+c2+' ' + x + '%, '+c2+' 100%)' );
        t1.innerText = mtms(e.target.value);
        if (new Date - ltime > 200) {
            player.seek(e.target.value).then(() => {
                lastTimestamp = Date.now();
                //console.log(e.target.value)
                lastState = parseInt(e.target.value);
            });
            ltime = new Date;
        }
    };
    seekBar.onmousedown = (e) => {
        c1 = "#1DB954"
    }
    seekBar.onmouseup = (e) => {
        c1 = "#fff"
    }


}
function fixtoken() {
    refreshToken()
    access_token = localStorage.getItem("access_token")
    spotifyApi.setAccessToken(access_token);
}
/* $( 'input[type=range]' ).on( 'input', function( ) {
    x = (this.value/this.max)* 100
    $( this ).css( 'background', 'linear-gradient(to right, #1DB954 0%, #1DB954 '+ x +'%, #fff ' + x + '%, white 100%)' );
} ); */