import os
def logging(log:str, mode:str):
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)).rsplit("\\", 1)[0], "error_log.txt")
    with open(path, mode) as file:
        file.write(log)
        file.close()
try:
    import sys, datetime
    import pathlib as plib
    sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "net"))
    import json
    import duck_dbms as db
    import duck_functions as dbf
    import net.snet as snet
    import net.snet_functions as netf
except Exception as e:
    logging(f"IMPORT ERROR: {e}\n", "a")

def connectToServer(ipaddr: str, port: int, uname: str, passwd: str) -> bool:
    try:

        self_ipaddr = netf.get_local_ip()
        client = snet.Client(self_ipaddr, ipaddr, port, uname, passwd)

        connected = client.connectToServer()[1]

        if connected == True:
            sync_status, userdata = netf.clientSync(DBMS, client, uname, passwd)
            return connected, sync_status, userdata
        else:
            return connected, False, None
    
    except Exception as e:
        return False, False, None

def receiveMessage():
    try:
        message_length = sys.stdin.buffer.read(4)
        if not message_length:
            return {"valid": False}
        message_length = int.from_bytes(message_length, byteorder='little')
        message = sys.stdin.buffer.read(message_length)
        loaded_message = json.loads(message.decode('utf-8'))
        loaded_message['valid'] = True

        return loaded_message
    
    except:
        return {"valid": False}

def sendMessage(message):
    json_message = json.dumps(message)
    encoded_message = json_message.encode('utf-8')
    sys.stdout.buffer.write(len(encoded_message).to_bytes(4, byteorder='little'))
    sys.stdout.buffer.write(encoded_message)
    sys.stdout.buffer.flush()

def checkValidInput(uname: str, passwd: str):
    invalidChars = ['#', ',', '"', "'"]
    ValidInput = False
    if len(uname) >= 4 and len(uname) < 21 and len(passwd) >= 4 and len(passwd) < 21:
        if any(char in uname for char in invalidChars) == False and any(char in passwd for char in invalidChars) == False:
            ValidInput = True
    return ValidInput

def main():
    global DBMS
    try:
        root = plib.Path(os.getcwd())
        target = "l0ck3rdb.duckdb"
        for path in root.rglob(target):
            if path.name == target:
                DB_PATH = path
        DBMS = db.DBMS(DB_PATH)
        
    except Exception as e:
        pass
    
    try:
        received_message = receiveMessage()
        if received_message['valid'] == True:
            requestType = received_message['requestType']            
            uname = received_message['uname']
            if requestType == "logoutRequest":
                userdata = dbf.readUserdata(DBMS, uname)
                if userdata != None:
                    userdata["latest_access"] = received_message['timestamp']
                    dbf.setUserdata(DBMS, uname, userdata)
                    sendMessage({"logout": True})
          
            elif requestType == "deleteAccountRequest":
                userdata = dbf.readUserdata(DBMS, uname)
                if userdata != None:
                    dbf.deleteUser(DBMS, uname)
                    sendMessage({"accountDelete": True})
                        
            elif requestType == "delete_passwordCard":
                userdata = dbf.readUserdata(DBMS, uname)
                if userdata != None:
                    for i in range(len(userdata["password_cards"])):
                        if userdata["password_cards"][i]["card_id"] == received_message["password_card"]["card_id"]:
                            userdata["password_cards"].pop(i)
                            for a in range(len(userdata["password_cards"])):
                                userdata["password_cards"][a]["card_id"] = str((a+1))
                            dbf.setUserdata(DBMS, uname, userdata)
                            sendMessage({"deletedPasswordCard": True})
                            break
                                                
            elif requestType == "edit_passwordCard":
                userdata = dbf.readUserdata(DBMS, uname)
                if userdata != None:
                    for i in range(len(userdata["password_cards"])):
                        if userdata["password_cards"][i]["card_id"] == received_message["password_card"]["card_id"]:
                            userdata["password_cards"][i]["email"] = received_message["password_card"]["email"]
                            userdata["password_cards"][i]["password"] = received_message["password_card"]["password"]
                            userdata["password_cards"][i]["img_path"] = received_message["password_card"]["img_path"]
                            userdata["password_cards"][i]["update"] = datetime.datetime.now().isoformat()
                            edited = True
                            if userdata["password_cards"][i]["card_title"] == "L0CK3R":
                                edited = dbf.updateLogin(DBMS, uname, received_message["password_card"]["email"], received_message["password_card"]["password"])
                                if edited == False:
                                    sendMessage({"editPasswordCard": edited, "uname": userdata["user"]})
                                    break
                                userdata["user"] = received_message["password_card"]["email"]
                                uname = received_message["password_card"]["email"]

                            dbf.setUserdata(DBMS, uname, userdata)
                            sendMessage({"editPasswordCard": edited, "uname": userdata["user"]})
                            break
                            
            elif requestType == "add_passwordCard":
                userdata = dbf.readUserdata(DBMS, uname)
                if userdata != None:
                    new_card = {
                        "card_id": received_message["password_card"]["card_id"],
                        "card_title": received_message["password_card"]["card_title"],
                        "img_path": received_message["password_card"]["img_path"],
                        "email": received_message["password_card"]["email"],
                        "password": received_message["password_card"]["password"],
                        "update": datetime.datetime.now().isoformat()
                    }
                    userdata["password_cards"].append(new_card)
                    added = dbf.setUserdata(DBMS, uname, userdata)
                    sendMessage({"addedPasswordCard": added})
            
            elif requestType == "searchHostsRequest":
                hosts = netf.get_known_hosts()
                sendMessage({"hostList": hosts})
                
            elif requestType == "connectRequest":
                try:
                    connected, sync_status, userdata = connectToServer(received_message['ipaddr'], received_message['port'], uname, received_message['password'])
                    added = netf.add_to_known_hosts(received_message['ipaddr'])
                    sendMessage({"connected": connected, "added": added, "ipaddr": received_message['ipaddr']})
                except Exception as e:
                    logging(f"Connection ERROR: {e}\n", "a")
                    sendMessage({"connected": False})
                    
            elif requestType == "hostRequest":
                try:
                    self_ipaddr = netf.get_local_ip()
                    server = snet.Server(self_ipaddr, received_message['port'], uname, received_message['password'])
                    bindServer = server.bindServer()
                    if bindServer != False:
                        sendMessage({"bindedServer": True, "ipaddr": self_ipaddr})
                        
                        hosting = True
                        sendMessage({"hostedServer": True, "ipaddr": self_ipaddr, "port": received_message['port']})
                        while hosting:
                            client, authorized_client = server.hostServer(received_message["time"])
                            if authorized_client == True:
                                if client.CLIENT_IP == self_ipaddr:
                                    sendMessage({"cancelServer": True})
                                    netf.kill_python()
                                    hosting = False
                                    
                                else:
                                    sendMessage({"clientConnection": True, "clientIP": client.CLIENT_IP, "clientPort": client.PORT})
                                    try:
                                        netf.serverSync(DBMS, server, uname, client, authorized_client)
                                    
                                    except Exception as e:
                                        logging(f"SYNC ERROR: {e}\n", "a")
                                    
                                    hosting = False
                                    
                            elif client == "timeout":
                                sendMessage({"cancelServer": True})
                                netf.kill_python()
                                hosting = False
                                
                            else:
                                sendMessage({"clientConnection": False, "clientIP": client.CLIENT_IP})
                                netf.kill_python()
                                hosting = False
                    else:
                        sendMessage({"bindedServer": False})
                        netf.kill_python()
                        sys.exit()
                        
                except Exception as e:
                    sendMessage({"hostedServer": False})
                    logging(f"hostError: {e}", "a")
            
            elif requestType == "cancelHostRequest":
                try:
                    self_ipaddr = netf.get_local_ip()
                    connected = connectToServer(self_ipaddr, received_message['port'], uname, received_message['password'])        
                
                except Exception as e:
                    sendMessage({"cancelServer": False})
                    logging(f"Error cancel Host: {e}", "a")
            
            else:
                passwd = received_message['passwd']
                if checkValidInput(uname, passwd) == True:
                    if requestType == "loginRequest":
                        response = {
                            "received": [uname, passwd],
                            "access": dbf.L0CKin(DBMS, uname, passwd),
                        }
                        if response["access"] == True:
                            userdata = dbf.readUserdata(DBMS, uname)
                            for i in range(len(userdata["password_cards"])):
                                try:
                                    userdata["password_cards"][i].pop("update", None)
                                
                                except Exception as e:
                                    logging(f"Error removing 'update' key: {e}\n", "a")
                                    pass

                            response["userdata"] = userdata

                        else:
                            sendMessage({"access": False})
                        
                    elif requestType == "registerRequest":
                        response = {
                            "received": [uname, passwd],
                            "access": dbf.R3gister(DBMS, uname, passwd)
                        }
                        if response["access"] == True:
                            standard_userdata = {
                                "user": uname,
                                "latest_access": "new",
                                "password_cards": [
                                    {
                                        "card_id": "1",
                                        "card_title": "L0CK3R",
                                        "img_path": "../assets/icons/icon128.png",
                                        "email": uname,
                                        "password": passwd,
                                        "update": datetime.datetime.now().isoformat()
                                    }
                                ]
                            }
                            dbf.setUserdata(DBMS, uname, standard_userdata)
                            userdata = dbf.readUserdata(DBMS, uname)
                            for i in range(len(userdata["password_cards"])):
                                try:
                                    userdata["password_cards"][i].pop("update", None)
                                except Exception as e:
                                    logging(f"Error removing 'update' key: {e}\n", "a")
                            response["userdata"] = userdata
                            
                    sendMessage(response)

                else:
                    sendMessage({"access": False})
       
        else:
            try:
                sendMessage({"access": False})

            except:
                pass
            
    except Exception as e:        
        logging(f"Disconnected\nerror: {e}\n{e.args}\n", "a")
        sys.exit()
        
    finally:
        DBMS.disconnectDB()

            
if __name__ == "__main__":
    main()
