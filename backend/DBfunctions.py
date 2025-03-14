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
    L0CK3R_DBMS.insertValues("users",[("papa",cy.encrypting("papa"),str(date.today()))])
    return L0CK3R_DBMS

def L0CKin(DBMS: db.DBMS, username: str, password: str) -> bool:
    L0CK3R_DBMS = DBMS
    l0ck3din = False
    result = L0CK3R_DBMS.execute(f"""SELECT * FROM users WHERE username = '{username}'""")
    if result != []:
        userpassword = L0CK3R_DBMS.execute(f"""SELECT password FROM users WHERE username = '{username}'""")[0][0]
        print(userpassword, password)
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

"""
dbms = build_L0CK3R_DB("backend\\l0ck3rdb.duckdb")
print(dbms.execute("SELECT * FROM users", True))

print(dbms.getTables(True))
print(dbms.execute("SELECT * FROM users", True))
print(dbms.getAttributes("users", True))
#print(dbms.deleteValues("users","username = 'admin'"))

print(type(cy.encrypting("papa")))
print(R3gister(dbms, "mama", "mama"))
print(dbms.execute("SELECT * FROM users", True))
print(L0CKin(dbms, "admin", "admin"))
#print(dbms.execute("SELECT * FROM users", False))
#dbms.disconnectDB()


dbms = build_tempL0CK3R_DB()
print(dbms.execute("SELECT * FROM users", True))
#print(R3gister("admin","admin"))
#print(L0CKin("admin","admin"))
L0CK3R_DBMS = db.DBMS("l0ck3rDB.db")
print(L0CK3R_DBMS.execute("SELECT * FROM users", True))
print(date.today())

dbms = build_L0CK3R_DB("backend\\l0ck3rDB.duckdb")
print(L0CKin(dbms, "admin", "admin"))
print(R3gister(dbms, "admin", "password"))"""