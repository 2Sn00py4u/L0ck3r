import duck_dbms as db
import crypting as cy
import json
from datetime import date


USERDATA = {
    "user": "admin",
    "latest_access": "new",
    "password_cards": [
        {
            "card_id": "1",
            "card_title": "L0CK3R",
            "img_path": "../assets/icons/icon128.png",
            "email": "admin@l0ck3r.com",
            "password": "admin",
        }
    ]
}

def build_L0CK3R_DB(filePath: str) -> db.DBMS:
    L0CK3R_DBMS = db.DBMS(filePath)
    tables = L0CK3R_DBMS.getTables()
    for table in tables:
        try:
            L0CK3R_DBMS.deleteTable(table)
        except:
            pass
       
    #  users(_id_, uname, passwd, registerDate)
    L0CK3R_DBMS.createTable("users",["username VARCHAR PRIMARY KEY NOT NULL", "password BLOB", "registerDate VARCHAR NOT NULL", "userdata JSON"])
    L0CK3R_DBMS.insertValues("users",[("admin",cy.encrypting("admin"),str(date.today()), USERDATA)])
    return L0CK3R_DBMS

def L0CKin(DBMS: db.DBMS, username: str, password: str) -> bool:
    L0CK3R_DBMS = DBMS
    l0ck3din = False
    result = L0CK3R_DBMS.execute(f"""SELECT * FROM users WHERE username = '{username}'""")
    if result != []:
        userpassword = L0CK3R_DBMS.execute(f"""SELECT password FROM users WHERE username = '{username}'""")[0][0]
        l0ck3din = cy.compare_encrypted(password, userpassword)
    return l0ck3din
    
    
def R3gister(DBMS: db.DBMS, username: str, password: str) -> bool:
    L0CK3R_DBMS = DBMS
    try:
        L0CK3R_DBMS.insertValues("users",[(username, cy.encrypting(password), str(date.today()), {})])
        r3gistert = True
    except Exception as e:
        r3gistert = False
    return r3gistert

def readUserdata(DBMS: db.DBMS, username: str) -> dict:
    L0CK3R_DBMS = DBMS
    try:
        user_data = L0CK3R_DBMS.execute(f"""SELECT userdata FROM users WHERE username = '{username}'""")
    except Exception as e:
        print(e)
    return json.loads(user_data[0][0])

def setUserdata(DBMS: db.DBMS, username: str, userdata: dict) -> bool:
    L0CK3R_DBMS = DBMS
    try:
        L0CK3R_DBMS.execute(f"""UPDATE users SET userdata = '{json.dumps(userdata)}' WHERE username = '{username}'""")
        return True
    except Exception as e:
        print(e)
        return False

"""
DMBS = build_L0CK3R_DB("backend\\l0ck3rdb.duckdb")

print(readUserdata(DMBS, "admin"),type(readUserdata(DMBS, "admin")))

USERDATA["password_cards"].append(
    {
        "card_id": "2",
        "card_title": "Youtube",
        "img_path": "../assets/website_images/youtube.png",
        "email": "admin@youtube.com",
        "password": "password123",
    }
)
USERDATA["password_cards"].append(
    {
        "card_id": "3",
        "card_title": "Google",
        "img_path": "../assets/website_images/google.png",
        "email": "admin@google.com",
        "password": "password123",
    }
)
USERDATA["password_cards"].append(
    {
        "card_id": "4",
        "card_title": "Instagram",
        "img_path": "../assets/website_images/instagram.png",
        "email": "admin@instagram.com",
        "password": "password123",
    }
)
USERDATA["password_cards"].append(
    {
        "card_id": "5",
        "card_title": "Spotify",
        "img_path": "../assets/website_images/spotify.png",
        "email": "admin@spotify.com",
        "password": "password123",
    }
)

print(setUserdata(DMBS, "admin", USERDATA))
print(readUserdata(DMBS, "admin"),type(readUserdata(DMBS, "admin")))
"""
