import sys, os
import json
import duck_dbms as db
import DBfunctions as dbf

def logging(log:str, mode:str):
    with open("C:\\Users\\Felix\\Desktop\\coolStuff\\browser\\extensions\\L0ck3r\\nativeLog.txt", mode) as file:
            file.write(log)
            file.close()

def receiveMessage():
    #  reading message-head
    message_length = sys.stdin.buffer.read(4)
    message_length = int.from_bytes(message_length, byteorder='little')
    #  reading message-body
    message = sys.stdin.buffer.read(message_length)
    return json.loads(message.decode('utf-8'))

def sendMessage(message):
    #  converting dict -> json
    json_message = json.dumps(message)
    encoded_message = json_message.encode('utf-8')
    #  writing message(message-head (first 4 bytes): length of message, message-body: json-message)
    sys.stdout.buffer.write(len(encoded_message).to_bytes(4, byteorder='little'))
    sys.stdout.buffer.write(encoded_message)
    #  send/flush message
    sys.stdout.buffer.flush()


def main():
    try:
        DBMS = db.DBMS(os.path.join(os.path.dirname(os.path.abspath(__name__)),"l0ck3rdb.duckdb"))
        extensionPath = os.path.join(os.path.dirname(os.path.abspath(__name__)), r"dependencies\sqlite_scanner.duckdb_extension\sqlite_scanner.duckdb_extension")
        DBMS.execute(f"LOAD '{extensionPath}'")
    except Exception as e:
        logging(f"{str(e)}\n","w")
        
    while True:
        logging("in loop\n", "a")
        received_message = receiveMessage()
        logging("msg received\n", "a")
        requestType = received_message['requestType']
        uname = received_message['uname']
        passwd = received_message['passwd']
        logging(f"{requestType}\nuname:{uname}\npasswd:{passwd}\n", "a")
        
        if requestType == "loginRequest":
            response = {
                "received": [uname, passwd],
                "access": dbf.L0CKin(DBMS, uname, passwd)
            }
        
        elif requestType == "registerRequest":
            response = {
                "received": [uname, passwd],
                "access": dbf.R3gister(DBMS, uname, passwd)
            }
            
        sendMessage(response)
        
        logging(f"succesfully send: {response["received"]}\n access: {response["access"]}\n", "a")

if __name__ == "__main__":
    main()
