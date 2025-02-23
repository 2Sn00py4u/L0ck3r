import sys
import json

def read_message():
    # Read the length of the message
    message_length = sys.stdin.buffer.read(4)
    message_length = int.from_bytes(message_length, byteorder='big')

    # Read the message based on the length
    message = sys.stdin.buffer.read(message_length)

    return json.loads(message.decode('utf-8'))

def send_message(message):
    # Convert the message to JSON and send it back to the browser extension
    encoded_message = json.dumps(message).encode('utf-8')
    message_length = len(encoded_message)
    sys.stdout.buffer.write(message_length.to_bytes(4, byteorder='big'))
    sys.stdout.buffer.write(encoded_message)
    sys.stdout.flush()

def main():
    while True:
        with open("C:\\Users\\Felix\\Desktop\\start.txt", 'w') as file:
            file.write("start")
            file.close()
        # Read and process the incoming message
        received_message = read_message()
        with open("C:\\Users\\Felix\\Desktop\\test.txt", 'w') as file:
            file.write(received_message)
            file.close()
        # Create a response based on the incoming message
        response = {"response": f"Received: {received_message}"}

        # Send the response back
        send_message(response)

if __name__ == "__main__":
    main()
