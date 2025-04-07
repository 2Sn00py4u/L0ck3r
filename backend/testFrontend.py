import subprocess
import json

message = {
    "requestType": "loginRequest",
    "uname": "testuser",
    "passwd": "testpass"
}
json_message = json.dumps(message)
message_length = len(json_message).to_bytes(4, byteorder='little')

process = subprocess.Popen(
    ["python", "backend\\backend_handler.py"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE
)
process.stdin.write(message_length + json_message.encode('utf-8'))
process.stdin.flush()
response_length = int.from_bytes(process.stdout.read(4), byteorder='little')
response = process.stdout.read(response_length).decode('utf-8')
print("Response:", response)