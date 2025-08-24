import subprocess, os, sys, datetime
sys.path.append(os.path.abspath("backend"))
import duck_functions as dbf
import duck_dbms as duck_dbms
import pathlib as plib
import socket, snet

def get_known_hosts() -> list:
    hosts = []
    root = plib.Path(os.getcwd())
    target = "knownhosts.txt"
    for path in root.rglob(target):
        if path.name == target:
            with open(path, "r") as file:
                for line in file:
                    hosts.append((line.strip(), "unknown"))
                file.close()
        else:
            return []              
    return hosts

def kill_python(include_self = False):
    output = subprocess.check_output('tasklist /FI "IMAGENAME eq python.exe"', shell=True).decode()
    for line in output.splitlines():
        if "python.exe" in line.lower():
            parts = line.split()
            pid = int(parts[1])
            if include_self or pid != os.getpid():
                try:
                    subprocess.run(f"taskkill /PID {pid} /F /T", shell=True)
                    print(f"Killed Python process with PID {pid}\n")
                except Exception as e:
                    print(f"Failed to kill PID {pid}: {e}\n")

def add_to_known_hosts(ipaddr: str) -> bool:
    hosts = get_known_hosts()
    print(hosts)
    for i in range(len(hosts)):
        if ipaddr in hosts[i]:
            return False
    else:
        root = plib.Path(os.getcwd())
        target = "knownhosts.txt"
        for path in root.rglob(target):
            if path.name == target:
                with open(path, "a") as file:
                    file.write(f"{ipaddr}\n")
                    file.close()
                return True
            else:
                return False

def get_local_ip():
    try:
        # Connect to a non-routable IP (no packets sent)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))  # Google DNS IP, doesn't need to be reachable
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception as e:
        return f"Error: {e}"
    
def serverSync(dbms: duck_dbms.DBMS, server: snet.Server, USERNAME: str, client: snet.Client, authorized_client: bool) -> bool:
    userdata = dbf.readUserdata(dbms, USERNAME)
    for i in range(len(userdata["password_cards"])):
        userdata["password_cards"][i]["img_path"] = "default"

    if authorized_client == True:
        server.sendData({"payload": userdata})
        status =  server.receiveData()
        if status:
            sync_userdata = server.receiveData()
            if sync_userdata and sync_userdata["status"] == "sync":
                new_userdata = sync_userdata["data"]
                for i in range(len(new_userdata["password_cards"])):
                    new_userdata["password_cards"][i]["img_path"] = "../assets/icons/icon128.png"
                try:
                    dbf.setUserdata(dbms, USERNAME, new_userdata)
                    new_userdata = dbf.readUserdata(dbms, USERNAME)
                    
                    if userdata["password_cards"][0]["password"] != new_userdata["password_cards"][0]["password"]:
                        dbf.updateLogin(dbms, USERNAME, USERNAME, new_userdata["password_cards"][0]["password"])
                    server.sendData({"payload": {"synced": True}})
                    
                except Exception as e:
                    server.sendData({"payload": {"synced": False, "error": str(e)}})
                    
            server.closeServer()


def clientSync(dbms: duck_dbms.DBMS, client: snet.Client, USERNAME: str, PASSWORD: str) -> bool:
    server_userdata = client.receiveData()
    if server_userdata:
        client.sendData({"payload": {"status": "received",
                                    "data": server_userdata}})
        for i in range(len(server_userdata["password_cards"])):
            server_userdata["password_cards"][i]["img_path"] = "../assets/icons/icon128.png"
        
        client_userdata = dbf.readUserdata(dbms, USERNAME)
        new_password_cards = syncPasswordCards(server_userdata, client_userdata)
        new_userdata = {
            "user": USERNAME,
            "latest_access": "new",
            "password_cards": new_password_cards
        }
        
        client.sendData({"payload": {"status": "sync",
                                    "data": new_userdata}})
        sync_proof = client.receiveData()
        if sync_proof and sync_proof["synced"] == True:
            dbf.setUserdata(dbms, USERNAME, new_userdata)
            userdata = dbf.readUserdata(dbms, USERNAME)
            
            if userdata["password_cards"][0]["password"] != PASSWORD:
                dbf.updateLogin(dbms, USERNAME, USERNAME, userdata["password_cards"][0]["password"])
            return True, userdata
        else:
            return False, None
        
    else:
        client.sendData({"payload": {"status": "lost",
                                    "data": userdata}})
        return False, None
    
    
def syncPasswordCards(server_userdata: dict, client_userdata: dict) -> list:
    new_passwordlist = []
    tmp_new_passwordlist = []
    client_title_table = {}
    server_title_table = {}
    
    for i in range(len(server_userdata["password_cards"])):
        if server_userdata["password_cards"][i]["card_title"] not in server_title_table.keys():
            server_title_table[server_userdata["password_cards"][i]["card_title"]] = [server_userdata["password_cards"][i]]
        else:
            server_title_table[server_userdata["password_cards"][i]["card_title"]].append(server_userdata["password_cards"][i])
    
    for i in range(len(client_userdata["password_cards"])):
        if client_userdata["password_cards"][i]["card_title"] not in client_title_table.keys():
            client_title_table[client_userdata["password_cards"][i]["card_title"]] = [client_userdata["password_cards"][i]]
        else:
            client_title_table[client_userdata["password_cards"][i]["card_title"]].append(client_userdata["password_cards"][i])
    
    for key in server_title_table:
        if key not in client_title_table.keys():
            for password_card in server_title_table[key]:
                tmp_new_passwordlist.append(password_card)
        else:
            if len(server_title_table[key]) >= len(client_title_table[key]):
                for password_card in server_title_table[key]:
                    found = False
                    for a in range(len(client_title_table[key])):
                        if password_card["email"] == client_title_table[key][a]["email"]:
                            found = True
                            server_date = datetime.datetime.fromisoformat(password_card["update"])
                            client_date = datetime.datetime.fromisoformat(client_title_table[key][a]["update"])
                            if server_date > client_date:
                                tmp_new_passwordlist.append(password_card)
                            else:
                                tmp_new_passwordlist.append(client_title_table[key][a])
                    if not found:
                        tmp_new_passwordlist.append(password_card)
            else:
                for password_card in client_title_table[key]:
                    found = False
                    for a in range(len(server_title_table[key])):
                        if password_card["email"] == server_title_table[key][a]["email"]:
                            found = True
                            client_date = datetime.datetime.fromisoformat(password_card["update"])
                            server_date = datetime.datetime.fromisoformat(server_title_table[key][a]["update"])
                            if client_date > server_date:
                                tmp_new_passwordlist.append(password_card)
                            else:
                                tmp_new_passwordlist.append(server_title_table[key][a])
                    if not found:
                        tmp_new_passwordlist.append(password_card)
                                            
    for key in client_title_table:
        if key not in server_title_table.keys():
            for password_card in client_title_table[key]:
                tmp_new_passwordlist.append(password_card)
    
    for i in range(len(tmp_new_passwordlist)):
        if tmp_new_passwordlist[i]["card_id"] == "1":
            new_passwordlist.append(tmp_new_passwordlist[i])
            tmp_new_passwordlist.pop(i)
            break
    for i in range(len(tmp_new_passwordlist)):
        tmp_new_passwordlist[i]["card_id"] = str(i+2)
        new_passwordlist.append(tmp_new_passwordlist[i])
        
    return new_passwordlist