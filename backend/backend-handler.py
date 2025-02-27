import sys
import json

def logging(log:str, mode:str):
    with open("C:\\Users\\Felix\\Desktop\\coolStuff\\browser\\extensions\\L0ck3r\\nativeLog.txt", mode) as file:
            file.write(log)
            file.close()

def receiveMessage():
    message_length = sys.stdin.buffer.read(4)  #  reading length of message in first 4 bytes
    message_length = int.from_bytes(message_length, byteorder='little')
    
    message = sys.stdin.buffer.read(message_length)
    return json.loads(message.decode('utf-8'))

def sendMessage(message):
    logging(f"start sending message.. {message}\n", "a")
    json_message = json.dumps(message)
    logging(f"json message: {json_message}\n", "a")
    encoded_message = json_message.encode('utf-8')
    logging(f"encoded message: {encoded_message}\n", "a")
    sys.stdout.buffer.write(len(encoded_message).to_bytes(4, byteorder='little'))  #  writes length of message in first 4 bytes
    logging(f"length encoded message: {len(encoded_message)}\n", "a")
    sys.stdout.buffer.write(encoded_message)
    sys.stdout.buffer.flush()
    logging(f"send {message}\n", "a")

def main():
    logging("start test\n", "w")
    while True:
        received_message = receiveMessage()
        logging(f"{received_message['text']}\nuname:{received_message['uname']}\npasswd:{received_message['passwd']}\n", "a")
            
        response = {"response": [received_message["uname"], received_message["passwd"]]}
        sendMessage(response)
        
        logging(f"succesfully send: {response['response'][0]} - {response['response'][1]}\n", "a")

if __name__ == "__main__":
    main()
