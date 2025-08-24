import duck_dbms as db
import base64 as b64
import crypting as cy
import json
from datetime import date

def build_L0CK3R_DB(filePath: str) -> db.DBMS:
    L0CK3R_DBMS = db.DBMS(filePath)
    tables = L0CK3R_DBMS.getTables()
    for table in tables:
        try:
            L0CK3R_DBMS.deleteTable(table)
        except:
            pass

    L0CK3R_DBMS.createTable("users",["username VARCHAR PRIMARY KEY NOT NULL", "password BLOB", "registerDate VARCHAR NOT NULL", "userdata JSON"])
    return L0CK3R_DBMS

def L0CKin(DBMS: db.DBMS, username: str, password: str) -> bool:
    L0CK3R_DBMS = DBMS
    l0ck3din = False
    result = L0CK3R_DBMS.execute(f"""SELECT * FROM users WHERE username = '{username}'""")
    if result != []:
        userpassword = L0CK3R_DBMS.execute(f"""SELECT password FROM users WHERE username = '{username}'""")[0][0]
        l0ck3din = cy.compare_encrypted(password, password, userpassword)
    return l0ck3din
    
    
def R3gister(DBMS: db.DBMS, username: str, password: str) -> bool:
    L0CK3R_DBMS = DBMS
    try:
        L0CK3R_DBMS.insertValues("users",[(username, cy.encrypting(password, password), str(date.today()), {})])
        r3gistert = True
    except Exception as e:
        r3gistert = False
    return r3gistert

def updateLogin(DBMS: db.DBMS, username: str, new_username: str, password: str) -> bool:
    L0CK3R_DBMS = DBMS
    try:
        L0CK3R_DBMS.execute(f"""UPDATE users SET password = ? WHERE username = ?""", False, cy.encrypting(password, password), username)
        L0CK3R_DBMS.execute(f"""UPDATE users SET username = ? WHERE username = ?""", False, new_username, username)
        return True
    
    except Exception:
        return False

def readUserdata(DBMS: db.DBMS, username: str) -> dict:
    L0CK3R_DBMS = DBMS
    try:
        user_data = L0CK3R_DBMS.execute(f"""SELECT userdata FROM users WHERE username = '{username}'""")
        if user_data != []:
            fetched_user = json.loads(user_data[0][0])
            for i in range(len(fetched_user["password_cards"])):
                fetched_user["password_cards"][i]["password"] = b64.b64decode(fetched_user["password_cards"][i]["password"].encode("utf-8"))
                fetched_user["password_cards"][i]["password"] = cy.decrypting(fetched_user["password_cards"][i]["password"], fetched_user["password_cards"][i]["email"])
                                    
    except Exception as e:
        print(e)
    return fetched_user

def setUserdata(DBMS: db.DBMS, username: str, userdata: dict) -> bool:
    L0CK3R_DBMS = DBMS
    try:
        for i in range(len(userdata["password_cards"])):
            userdata["password_cards"][i]["password"] = b64.b64encode(cy.encrypting(userdata["password_cards"][i]["password"], userdata["password_cards"][i]["email"])).decode("utf-8")
        L0CK3R_DBMS.execute(f"""UPDATE users SET userdata = '{json.dumps(userdata)}' WHERE username = '{username}'""")
        return True
    except Exception as e:
        print(e)
        return False

def deleteUser(DBMS: db.DBMS, username: str):
    L0CK3R_DBMS = DBMS
    try:
        L0CK3R_DBMS.deleteValues("users", f"username = '{username}'")
        return True
    except:
        return False
