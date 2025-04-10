import duck_dbms as db
import crypting as cy
from datetime import date

def build_L0CK3R_DB(filePath: str) -> db.DBMS:
    L0CK3R_DBMS = db.DBMS(filePath)
    tables = L0CK3R_DBMS.getTables()
    for table in tables:
        try:
            L0CK3R_DBMS.deleteTable(table)
        except:
            pass
       
    #  users(_id_, uname, passwd, registerDate)
    L0CK3R_DBMS.createTable("users",["username VARCHAR PRIMARY KEY NOT NULL", "password BLOB", "registerDate VARCHAR NOT NULL"])
    L0CK3R_DBMS.insertValues("users",[("admin",cy.encrypting("admin"),str(date.today()))])
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
        L0CK3R_DBMS.insertValues("users",[(username, cy.encrypting(password), str(date.today()))])
        r3gistert = True
    except Exception as e:
        r3gistert = False
    return r3gistert

#build_L0CK3R_DB("backend\\l0ck3rdb.duckdb")