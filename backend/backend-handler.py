import sys
import json
import sqlite3 as db

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
        tempDBMS = db.connect("l0ck3rDB.db")
        tables = tempDBMS.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        logging(str(tables),"w")
        #tempDBMS.importCSV("\\data\\users_l0ck3rDB.csv")
            
        #connection.read_csv("\\data\\users_l0ck3rDB.csv")
        #connection.execute("SELECT * FROM users")
        #DBMS = db.build_tempL0CK3R_DB()
        #result = DBMS.getTables()
        #logging(f"{result}\n", "w")
    except Exception as e:
        logging(f"{str(e)}","w")
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
                "access": True # db.L0CKin(uname, passwd)
            }
        
        elif requestType == "registerRequest":
            response = {
                "received": [uname, passwd],
                "access": True # db.R3gister(uname, passwd)
            }
            
        sendMessage(response)
        
        logging(f"succesfully send: {response["received"]}\n access: {response["access"]}", "a")

if __name__ == "__main__":
    main()
