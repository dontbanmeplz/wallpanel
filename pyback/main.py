import speech_recognition as sr
from datetime import datetime
from websocket_server import WebsocketServer
import json
import pvporcupine
from pvrecorder import PvRecorder
import re
 
def c2n(s):
   
    words_to_numbers = {
        'one': '1',
        'two': '2',
        'three': '3',
        'four': '4',
        'five': '5',
        'six': '6',
        'seven': '7',
        'eight': '8',
        'nine': '9',
        'zero': '0'
    }
 
    pattern = re.compile(r'\b(' + '|'.join(words_to_numbers.keys()) + r')\b')
    return re.sub(pattern, lambda x: words_to_numbers[x.group()], s)
r = sr.Recognizer()
mic = sr.Microphone()
global auth
auth = ""
# Parse input arguments
with mic as source:
    r.adjust_for_ambient_noise(source)
porcupine = pvporcupine.create(
  access_key='VgSr8zcTlPgAZq20K5xWyY0TEkLPfeIXuV9uplffCPVYaipbc68D2g==',
  keyword_paths=["model.ppn"]
)
recorder = PvRecorder(
        frame_length=porcupine.frame_length)
recorder.start()
def detect(audio):
    try:
        return r.recognize_google(audio)
    except sr.UnknownValueError:
        return "Bruh idk"
def message_received(client, ws, message):
    msg = json.loads(message)
    typ = msg['type']
    global auth
    match typ:
        case 'listen':
            ws.send_message_to_all(json.dumps({'type':'wake'}))
            with mic as source:
                try:
                    audio = r.listen(source, timeout=3, phrase_time_limit=7)
                except sr.WaitTimeoutError:
                        print("timeout")
                        ws.send_message_to_all(json.dumps({'type':'fail'}))
                        return
                text = detect(audio)
            ws.send_message(client, json.dumps({'type':'search','text':text}))
        case "trash":
            ws.send_message_to_all(json.dumps({'type':'trash', "id":msg['id']}))
        case "getqueue":
            ws.send_message_to_all(json.dumps({'type':'getqueue'}))
        case "queue":
            ws.send_message_to_all(json.dumps({'type':'queue', "id":msg['id']}))
        case "squeue":
            ws.send_message_to_all(json.dumps({'type':'sendqueue', "queue":msg['queue']}))
        case "gstate":
            ws.send_message_to_all(json.dumps({'type':'gstate'}))
        case "state":
            ws.send_message_to_all(json.dumps({'type':'state', "position":msg['position'], "duration":msg['duration'], "current_track":msg['current_track'], "paused":msg['paused'], "auth":msg['auth']}))
        case "token":
            auth = msg['auth']
            ws.send_message_to_all(json.dumps({'type':'stoken', "auth":msg['auth']}))
        case "gtoken":
            ws.send_message_to_all(json.dumps({'type':'stoken', "auth":auth}))
        case "q":
            ws.send_message_to_all(json.dumps({'type':'q'}))
        case "seek":
            ws.send_message_to_all(json.dumps({'type':'seek', "spot":msg['spot']}))
        case "play":
            ws.send_message_to_all(json.dumps({'type':'unpause'}))
        case "pause":
            ws.send_message_to_all(json.dumps({'type':'pause'}))
        case "next":
            ws.send_message_to_all(json.dumps({'type':'next'}))
        case "previous":
            ws.send_message_to_all(json.dumps({'type':'previous'}))
        case "psong":
            ws.send_message_to_all(json.dumps({'type':'psong', "id":msg['id']}))
        case "playp":
            ws.send_message_to_all(json.dumps({'type':'playp', "id":msg['id']}))
        
PORT=8080
server = WebsocketServer(port = PORT)
server.set_fn_message_received(message_received)
    
if __name__ == "__main__":
    try:
        server.run_forever(True)
        print("Server started on port",PORT)
        print('[%s] Started ...' % str(datetime.now()))
        while True:
            pcm = recorder.read()
            result = porcupine.process(pcm)
            if result >= 0:
                
                server.send_message_to_all(json.dumps({'type':'wake'}))
                with mic as source:
                    print("listening")
                    try:
                        audio = r.listen(source, timeout=3, phrase_time_limit=7)
                    except Exception as e:
                        print(e)
                        print("timeout")
                        server.send_message_to_all(json.dumps({'type':'fail'}))
                        continue
                    print("go")
                    text = detect(audio)
                    print(text)
                tl = text.split(" ")
                match tl[0].lower():
                    case "play":
                        text = text.split(" ")[1:]
                        if text == []:
                            server.send_message_to_all(json.dumps({'type':'unpause'}))
                        else:
                            server.send_message_to_all(json.dumps({'type':'search','text':text}))
                    case "pause" | "stop":
                        server.send_message_to_all(json.dumps({'type':'pause'}))
                    case "unpause" | "resume" | "go":
                        server.send_message_to_all(json.dumps({'type':'unpause'}))
                    case "nevermind" | "cancel":
                        server.send_message_to_all(json.dumps({'type':'cancel'}))
                    case "lower" | "quieter":
                        server.send_message_to_all(json.dumps({'type':'volume','direction':'down'}))
                    case "raise" | "louder":
                        server.send_message_to_all(json.dumps({'type':'volume','direction':'up'}))
                    case "volume":
                        try:
                            if tl[1].lower() == "down":
                                server.send_message_to_all(json.dumps({'type':'volume','direction':'down'}))
                            elif tl[1].lower() == "up":
                                server.send_message_to_all(json.dumps({'type':'volume','direction':'up'}))
                            elif tl[1].lower() == "to":
                                if tl[2].isdigit() or c2n(tl[2].lower()).isdigit():
                                    server.send_message_to_all(json.dumps({'type':'volume','level':c2n(tl[2])}))
                            else:
                                if tl[1].isdigit() or c2n(tl[2].lower()).isdigit():
                                    server.send_message_to_all(json.dumps({'type':'volume','level':c2n(tl[1])}))
                        except:
                            pass
                    case "set":
                        try:
                            if tl[1].lower() == "volume":
                                if tl[2].isdigit() or c2n(tl[2].lower()).isdigit():
                                    server.send_message_to_all(json.dumps({'type':'volume','level':c2n(tl[2])}))
                                elif tl[2].lower() == "to":
                                    if tl[3].isdigit() or c2n(tl[2].lower()).isdigit():
                                        server.send_message_to_all(json.dumps({'type':'volume','level':c2n(tl[3])}))
                                elif tl[2].lower() == "down":
                                    server.send_message_to_all(json.dumps({'type':'volume','direction':'down'}))
                                elif tl[2].lower() == "up":
                                    server.send_message_to_all(json.dumps({'type':'volume','direction':'up'}))
                        except:
                            pass
                    case "mute":
                        server.send_message_to_all(json.dumps({'type':'volume','direction':'mute'}))
                    case "next" | "skip":
                        server.send_message_to_all(json.dumps({'type':'next'}))
                    case "previous" | "back":
                        server.send_message_to_all(json.dumps({'type':'previous'}))
                    case "bruh":
                        server.send_message_to_all(json.dumps({'type':'fail'}))
                    case _:
                        server.send_message_to_all(json.dumps({'type':'fail'}))
    except KeyboardInterrupt:
        print('Stopping ...')
    except Exception as e:
        print(e)
    finally:
        recorder.delete()
        porcupine.delete()
        exit()
