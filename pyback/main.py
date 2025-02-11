import speech_recognition as sr
from datetime import datetime
from websocket_server import WebsocketServer
import json
import pvporcupine
from pvrecorder import PvRecorder
import re
import json
import requests

def c2n(s):

    words_to_numbers = {
        "one": "1",
        "two": "2",
        "three": "3",
        "four": "4",
        "five": "5",
        "six": "6",
        "seven": "7",
        "eight": "8",
        "nine": "9",
        "zero": "0",
    }

    pattern = re.compile(r"\b(" + "|".join(words_to_numbers.keys()) + r")\b")
    return re.sub(pattern, lambda x: words_to_numbers[x.group()], s)


r = sr.Recognizer()
mic = sr.Microphone()
global auth
auth = ""
# Parse input arguments
with mic as source:
    r.adjust_for_ambient_noise(source)
porcupine = pvporcupine.create(
    access_key="VgSr8zcTlPgAZq20K5xWyY0TEkLPfeIXuV9uplffCPVYaipbc68D2g==",
    keyword_paths=["model.ppn"],
)
recorder = PvRecorder(frame_length=porcupine.frame_length)
recorder.start()


def detect(audio):
    try:
        text = r.recognize_vosk(audio)
        text = json.loads(text)["text"]
        return text
    except sr.UnknownValueError:
        return "Bruh idk"


def message_received(client, ws, message):
    msg = json.loads(message)
    typ = msg["type"]
    global auth

    if typ == "listen":

        with mic as source:
            r.adjust_for_ambient_noise(source)
            ws.send_message_to_all(json.dumps({"type": "wake"}))
            try:
                audio = r.listen(source, timeout=3, phrase_time_limit=5)
            except sr.WaitTimeoutError:
                print("timeout")
                ws.send_message_to_all(json.dumps({"type": "fail"}))
                return
            text = detect(audio)
        ws.send_message(client, json.dumps({"type": "search", "text": text}))
    elif typ == "trash":
        ws.send_message_to_all(json.dumps({"type": "trash", "id": msg["id"]}))
    elif typ == "getqueue":
        ws.send_message_to_all(json.dumps({"type": "getqueue"}))
    elif typ == "queue":
        ws.send_message_to_all(json.dumps({"type": "queue", "id": msg["id"]}))
    elif typ == "squeue":
        ws.send_message_to_all(json.dumps({"type": "sendqueue", "queue": msg["queue"]}))
    elif typ == "gstate":
        ws.send_message_to_all(json.dumps({"type": "gstate"}))
    elif typ == "state":
        ws.send_message_to_all(
            json.dumps(
                {
                    "type": "state",
                    "position": msg["position"],
                    "duration": msg["duration"],
                    "current_track": msg["current_track"],
                    "paused": msg["paused"],
                    "auth": msg["auth"],
                }
            )
        )
    elif typ == "token":
        auth = msg["auth"]
        ws.send_message_to_all(json.dumps({"type": "stoken", "auth": msg["auth"]}))
    elif typ == "gtoken":
        ws.send_message_to_all(json.dumps({"type": "stoken", "auth": auth}))
    elif typ == "q":
        ws.send_message_to_all(json.dumps({"type": "q"}))
    elif typ == "seek":
        ws.send_message_to_all(json.dumps({"type": "seek", "spot": msg["spot"]}))
    elif typ == "play":
        ws.send_message_to_all(json.dumps({"type": "unpause"}))
    elif typ == "pause":
        ws.send_message_to_all(json.dumps({"type": "pause"}))
    elif typ == "next":
        ws.send_message_to_all(json.dumps({"type": "next"}))
    elif typ == "previous":
        ws.send_message_to_all(json.dumps({"type": "previous"}))
    elif typ == "psong":
        ws.send_message_to_all(json.dumps({"type": "psong", "id": msg["id"]}))
    elif typ == "playp":
        ws.send_message_to_all(json.dumps({"type": "playp", "id": msg["id"]}))
    elif typ == "jam":
        try:

            headers = {
                'Host': 'guc3-spclient.spotify.com',
                'Connection': 'keep-alive',
                'Origin': 'https://xpui.app.spotify.com',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.117 Spotify/1.2.52.442 Safari/537.36',
                'accept': 'application/json',
                'accept-language': 'en',
                'app-platform': 'OSX_ARM64',
                'authorization': 'Bearer ' + auth,
                'content-type': 'application/json;charset=UTF-8',
                'sec-ch-ua': '"Not?A_Brand";v="99", "Chromium";v="130"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'spotify-app-version': '1.2.52.442',
                'Sec-Fetch-Site': 'same-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://xpui.app.spotify.com/',
            }

            params = {
                'activate': 'true',
            }

            response = requests.get(
                'https://guc3-spclient.spotify.com/social-connect/v2/sessions/current_or_new',
                params=params,
                headers=headers,
            )
            print(response.text)
            print(r.text)
            j = r.json()
            headers = {
                'Host': 'guc3-spclient.spotify.com',
                'Connection': 'keep-alive',
                'Origin': 'https://xpui.app.spotify.com',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.117 Spotify/1.2.52.442 Safari/537.36',
                'accept': 'application/json',
                'accept-language': 'en',
                'app-platform': 'OSX_ARM64',
                'authorization': 'Bearer ' + auth,
                'content-type': 'application/json;charset=UTF-8',
                'sec-ch-ua': '"Not?A_Brand";v="99", "Chromium";v="130"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'spotify-app-version': '1.2.52.442',
                'Sec-Fetch-Site': 'same-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://xpui.app.spotify.com/',
            }

            json_data = {
                'spotify_uri': j["join_session_uri"],
                'custom_data': [
                    {
                        'key': 'ssp',
                        'value': '1',
                    },
                    {
                        'key': 'app_destination',
                        'value': 'socialsession',
                    },
                ],
                'link_preview': {
                    'title': 'Join my Jam on Spotify',
                    'image_url': 'https://avatars.githubusercontent.com/u/59851616?v=4',
                },
                'utm_parameters': {
                    'utm_campaign': None,
                    'utm_term': None,
                    'utm_medium': 'qr',
                    'utm_content': None,
                    'utm_source': 'share-options-sheet',
                },
            }

            response = requests.post('https://guc3-spclient.spotify.com/url-dispenser/v1/generate-url', headers=headers, json=json_data)
            print(response.text)
            j = response.json()
            ws.send_message_to_all(json.dumps({"type": "link", "link": j["shareable_url"]}))
        except Exception as e:
            print(e)



PORT = 8080
server = WebsocketServer(port=PORT)
server.set_fn_message_received(message_received)

if __name__ == "__main__":
    try:
        server.run_forever(True)
        print("Server started on port", PORT)
        print("[%s] Started ..." % str(datetime.now()))
        while True:
            pcm = recorder.read()
            result = porcupine.process(pcm)
            if result >= 0:
                with mic as source:
                    r.adjust_for_ambient_noise(source)
                    server.send_message_to_all(json.dumps({"type": "wake"}))
                    print("listening")
                    try:
                        audio = r.listen(source, timeout=3, phrase_time_limit=4)
                    except Exception as e:
                        print(e)
                        print("timeout")
                        server.send_message_to_all(json.dumps({"type": "fail"}))
                        continue
                    print("go")
                    text = detect(audio)
                    print(type(text))
                    print(text)
                tl = text.split(" ")
                tt = tl[0].lower()

                if tt == "play":
                    text = text.split(" ")[1:]
                    if text == []:
                        server.send_message_to_all(json.dumps({"type": "unpause"}))
                    else:
                        server.send_message_to_all(
                            json.dumps({"type": "search", "text": text})
                        )
                elif tt == "pause" or tt == "stop":
                    server.send_message_to_all(json.dumps({"type": "pause"}))
                elif tt == "unpause" or tt == "resume" or tt == "go":
                    server.send_message_to_all(json.dumps({"type": "unpause"}))
                elif tt == "nevermind" or tt == "cancel":
                    server.send_message_to_all(json.dumps({"type": "cancel"}))
                elif tt == "lower" or tt == "quieter":
                    server.send_message_to_all(
                        json.dumps({"type": "volume", "direction": "down"})
                    )
                elif tt == "raise" or tt == "louder":
                    server.send_message_to_all(
                        json.dumps({"type": "volume", "direction": "up"})
                    )
                elif tt == "volume":
                    try:
                        if tl[1].lower() == "down":
                            server.send_message_to_all(
                                json.dumps({"type": "volume", "direction": "down"})
                            )
                        elif tl[1].lower() == "up":
                            server.send_message_to_all(
                                json.dumps({"type": "volume", "direction": "up"})
                            )
                        elif tl[1].lower() == "to":
                            if tl[2].isdigit() or c2n(tl[2].lower()).isdigit():
                                server.send_message_to_all(
                                    json.dumps({"type": "volume", "level": c2n(tl[2])})
                                )
                        else:
                            if tl[1].isdigit() or c2n(tl[2].lower()).isdigit():
                                server.send_message_to_all(
                                    json.dumps({"type": "volume", "level": c2n(tl[1])})
                                )
                    except:
                        pass
                elif tt == "set":
                    try:
                        if tl[1].lower() == "volume":
                            if tl[2].isdigit() or c2n(tl[2].lower()).isdigit():
                                server.send_message_to_all(
                                    json.dumps({"type": "volume", "level": c2n(tl[2])})
                                )
                            elif tl[2].lower() == "to":
                                if tl[3].isdigit() or c2n(tl[2].lower()).isdigit():
                                    server.send_message_to_all(
                                        json.dumps(
                                            {"type": "volume", "level": c2n(tl[3])}
                                        )
                                    )
                            elif tl[2].lower() == "down":
                                server.send_message_to_all(
                                    json.dumps({"type": "volume", "direction": "down"})
                                )
                            elif tl[2].lower() == "up":
                                server.send_message_to_all(
                                    json.dumps({"type": "volume", "direction": "up"})
                                )
                    except:
                        pass
                elif tt == "mute":
                    server.send_message_to_all(
                        json.dumps({"type": "volume", "direction": "mute"})
                    )
                elif tt == "next" or tt == "skip":
                    server.send_message_to_all(json.dumps({"type": "next"}))
                elif tt == "previous" or tt == "back":
                    server.send_message_to_all(json.dumps({"type": "previous"}))
                elif tt == "bruh":
                    server.send_message_to_all(json.dumps({"type": "fail"}))
                else:
                    server.send_message_to_all(json.dumps({"type": "fail"}))
    except KeyboardInterrupt:
        print("Stopping ...")
    except Exception as e:
        print(e)
    finally:
        recorder.delete()
        porcupine.delete()
        exit()
