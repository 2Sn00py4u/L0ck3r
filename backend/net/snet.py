import socket
import json
import struct
import pathlib as plib
import os,sys
import hashlib
sys.path.append(os.path.abspath("backend"))
import crypting as cy

MAX_MSG = 10 * 1024 * 1024

def recv_exact(sock, n):
    try:
        if n > MAX_MSG:
            raise ValueError(f"message too large ({n} bytes)")
        
        sock.settimeout(10)
        buf = bytearray()
        while len(buf) < n:
            chunk = sock.recv(n - len(buf))
            if not chunk:
                raise ConnectionError("[ERROR] Connection closed before receiving all data")
            buf.extend(chunk)
        return bytes(buf)
    
    except socket.timeout:
        raise TimeoutError("[ERROR] Socket timeout while receiving data")
    
class Server:
    class Clientprofile:
        def __init__(self, client_ip: str = None, server_ip:str = None, port:int = None, clientConnection = None, username:str = None, password:str = None,
                     HEADER:str = 1024, FORMAT:str = 'utf-8', DISCONNECTMSG:str = None) -> None:
            self.CLIENT_IP = client_ip
            self.SERVER_IP = server_ip
            self.PORT = port
            self.IPPO = (self.SERVER_IP, self.PORT)
            self.CONNECTION = clientConnection
            self.HEADER = HEADER
            self.FORMAT = FORMAT
            self.DISCONNECTMSG = DISCONNECTMSG
            self.__username = username
            self.__password = password
            self.__auth_key = hashlib.sha256((self.__username + self.__password).encode()).digest()
        
        def get_auth_key(self):
            return self.__auth_key.hex()
        
    def __init__(self, server_ip:str = None, port:int = None, username:str = None, password:str = None,
                 HEADER:int = 1024, FORMAT:str = 'utf-8', DISCONNECTMSG:str = None) -> None:
        self.IPADDRESS = server_ip
        self.PORT = port
        self.IPPO = (self.IPADDRESS, self.PORT)
        self.HEADER = HEADER
        self.FORMAT = FORMAT
        self.DISCONNECTMSG = DISCONNECTMSG
        self.__serverSocket = None
        self.__client = None
        self.__username = username
        self.__password = password
        self.__auth_key = hashlib.sha256((self.__username + self.__password).encode()).digest()
    
    def init_client(self, client_ip: str, clientConnection):
        self.__client = self.Clientprofile(client_ip, self.IPADDRESS, self.PORT, clientConnection, self.__username, self.__password,
                                           self.HEADER, self.FORMAT, self.DISCONNECTMSG)
        return self.__client
    
    def authorizeClient(self) -> bool:
        root = plib.Path(os.getcwd())
        print(f"[SERVER] Searching for snet_v1.0.json in {root}")
        target = "snet_v1.0.json"
        for path in root.rglob(target):
            print(f"[SERVER] Searching for {target} in {path}")
            print(f" =====> Current pathname: {path.name}")
            if path.name == target:
                with open(path, "r") as file:
                    snet_data = json.load(file)
                    file.close()
            else:
                print(f"[SERVER] {target} not found in {root}")
                return False
        self.sendData({"payload": snet_data})
        response = self.receiveData()
        if response == {"auth_key": self.__auth_key.hex()}:
            print(f"[SERVER] Client {self.__client.CLIENT_IP} authorized successfully.")
            self.sendData({"payload":{"authorized": True}})
            print(f"[SERVER] Clientdata:\n  |Client IP: {self.__client.CLIENT_IP}\n  |Server IP: {self.__client.SERVER_IP}\n  |Port: {self.__client.PORT}\n  |Auth_Key: {self.__client.get_auth_key()}\n  +--------\n")
            return True
        else:
            print(f"[SERVER] Client {self.__client.CLIENT_IP} authorization failed.")
            self.sendData({"payload": {"authorized": False}})
            return False
        
    def bindServer(self) -> bool:
        try:
            self.__serverSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.__serverSocket.bind(self.IPPO)
            return True
        except:
            return False
        
    def hostServer(self, timeout: int = 1) -> tuple:
        if self.__serverSocket is None:
            self.bindServer()
            
        try:
            self.__serverSocket.listen(1)
            self.__serverSocket.settimeout(timeout)
            try:
                print(f"[SERVER] is listening on {self.IPADDRESS}|{self.PORT}")
                client_connection, client_ippo = self.__serverSocket.accept()
                print(f"[SERVER] found connection {client_ippo}")
                self.init_client(client_ippo[0], client_connection)
                print(f"[SERVER] initialized Client as:\n  |Client IP: {self.__client.CLIENT_IP}\n  |Server IP: {self.__client.SERVER_IP}\n  |Port: {self.__client.PORT}\n  +----\n")
                authorized = self.authorizeClient()
                print(f"[SERVER] Client {self.__client.CLIENT_IP} authorization status: {authorized}")
                if authorized:
                    return self.__client, True
                else:
                    self.__client.CONNECTION.close()
                    return self.__client, False
                
            except socket.timeout:
                print("[SERVER] No client connected within the timeout period.")
                return "timeout", False       
        
        except Exception as e:
            print(f"[SERVER] Error: {e}")
            self.closeServer()
            return None, False

    def receiveData(self) -> dict:
        raw_len = recv_exact(self.__client.CONNECTION, 4)
        msg_len = struct.unpack("!I", raw_len) [0]
        raw_msg = recv_exact(self.__client.CONNECTION, msg_len)
        print(f"[SERVER] Received data [length: {msg_len} bytes]") 
        try:
            data = json.loads(cy.decrypting(raw_msg, self.__password))
            
        except:
            return None
        
        if data["checksum"] != hashlib.sha256(json.dumps(data["payload"]).encode(self.FORMAT)).hexdigest():
            raise ValueError("Checksum mismatch, data may be corrupted.")
        
        else:  
            return data["payload"]
    
    def sendData(self, data: dict):
        data["checksum"] = hashlib.sha256(json.dumps(data["payload"]).encode(self.FORMAT)).hexdigest()
        message = json.dumps(data)
        message = cy.encrypting(message, self.__password)
        if len(message) > MAX_MSG:
            raise ValueError(f"Message too large ({len(message)} bytes), max allowed is {MAX_MSG} bytes.")
        
        header = struct.pack('!I', len(message))
        self.__client.CONNECTION.sendall(header + message)
        print(f"[SERVER] Successfully sent payload [length: {len(message)} bytes]")
        
    def closeServer(self):
        try:
            self.__client.CONNECTION.close()
            if self.__serverSocket:
                self.__serverSocket.close()
                
        except Exception as e:
            print(f"[SERVER] Error closing server: {e}")
            
            
class Client:
    def __init__(self, ip_address:str = None, server_ip:str = None, port:int = None, username:str = None, password:str = None,
                 HEADER:int = 1024, FORMAT:str = 'utf-8', DISCONNECTMSG:str = None) -> None:
        self.SERVER_IP = server_ip
        self.IPADDRESS = ip_address
        self.PORT = port
        self.IPPO = (self.SERVER_IP,self.PORT)
        self.HEADER = HEADER
        self.FORMAT = FORMAT
        self.DISCONNECTMSG = DISCONNECTMSG
        self.__connection = None
        self.__username = username
        self.__password = password
        self.__auth_key = hashlib.sha256((self.__username + self.__password).encode()).digest()

    def authorizeClient(self):
        data = self.receiveData()
        print(f"[CLIENT] Received profile: {data}")
        self.sendData({"payload": {"auth_key": self.__auth_key.hex()}})
        authorized = self.receiveData()["authorized"]
        if authorized == True:
            return True
        
        else:
            return False
        
    def connectToServer(self, timeout: int = 5):
        try:
            self.__connection = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
            print(f"[CLIENT] connect using {(self.IPADDRESS, self.PORT)}")
            self.__connection.settimeout(timeout)
            print(f"[CLIENT] set timeout {timeout}")
            self.__connection.connect(self.IPPO)
            print(f"[CLIENT] self.__connection: {self.__connection}")
            if self.__connection:
                authorized = self.authorizeClient()
                if authorized:
                    print(f"[CLIENT] Connected to server at {self.SERVER_IP}:{self.PORT}")
                    return (self.__connection, True)
                
                else:
                    print("[CLIENT] Authorization failed.")
                    self.disconnect(self.__connection)
                    return (None, False)
        except socket.timeout:
            print("[CLIENT] socket timeout")
            return (None, False)
        
        except Exception as e:
            print(f"[CLIENT] Connection ERROR:\n{e}")
            return (None, False)
    
    def sendData(self, data: dict):
        data["checksum"] = hashlib.sha256(json.dumps(data["payload"]).encode(self.FORMAT)).hexdigest()
        message = json.dumps(data)
        message = cy.encrypting(message, self.__password)
        if len(message) > MAX_MSG:
            raise ValueError(f"Message too large ({len(message)} bytes), max allowed is {MAX_MSG} bytes.")
        
        header = struct.pack('!I', len(message))
        self.__connection.sendall(header + message)
        print(f"[CLIENT] Successfully sent payload [length: {len(message)} bytes]")
        
    def receiveData(self) -> dict:
        raw_len = recv_exact(self.__connection, 4)            # read header
        msg_len = struct.unpack("!I", raw_len) [0]
        raw_msg = recv_exact(self.__connection, msg_len)
        print(f"[CLIENT] Received data [length: {msg_len} bytes]")
        try:
            data = json.loads(cy.decrypting(raw_msg, self.__password))
            
        except:
            return None
        
        if data["checksum"] != hashlib.sha256(json.dumps(data["payload"]).encode(self.FORMAT)).hexdigest():
            raise ValueError("Checksum mismatch, data may be corrupted.")
        
        else:    
            return data["payload"]
    
    def disconnect(self, clientConnection):
        clientConnection.close()