import sys
import json

def read_message():
    message = sys.stdin.read()
    return json.loads(message)

def send_message(response):
    sys.stdout.write(json.dumps(response))
    sys.stdout.flush()

if __name__ == '__main__':
    while True:
        request = read_message()
        response = {"message": "Hello from the backend!", "data": request}
        send_message(response)
