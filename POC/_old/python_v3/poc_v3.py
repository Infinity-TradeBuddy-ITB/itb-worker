import urllib
import websocket
from google.protobuf.json_format import MessageToJson

ws = websocket.WebSocket()
ws.connect("wss://streamer.finance.yahoo.com")

message = '''
{
    subscribe: ['WEGE3']
}
'''

print(ws.send(message))
json_response = ws.recv()
print(json_response)

def open():
    print('connected')
    ws.send(
        json.dumps({
            'subscribe': (
                urllib.parse.parse_qs(window.location.search).get('symbols') or 'GME'
            ).split(',')
            .map((symbol) => symbol.upper())
        })
    )

def close():
    print('disconnected')

def incoming(message):
    next = Yaticker.decode(bytes(message.data, 'utf-8'))
    setStonks((current) => {
        stonk = next((stonk) => stonk['id'] == next['id'])
        if stonk:
            return [
                stonk if stonk['id'] == next['id'] else stonk
                for stonk in current
            ]
        else:
            return [
                *current,
                {
                    **next,
                    'direction': '',
                },
            ]
    })

params = urllib.parse.parse_qs(window.location.search)
ws = websocket.WebSocket('wss://streamer.finance.yahoo.com')
protobuf.load('./YPricingData.proto', (error, root) => {
    if error:
        return print(error)
    Yaticker = root.lookup_type('yaticker')

    ws.on_open = open
    ws.on_close = close
    ws.on_message = incoming
})