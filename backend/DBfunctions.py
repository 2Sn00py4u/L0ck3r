import os #TODO: automatically get all csvs
import duck_dbms as db
import crypting as cy
from datetime import date


def build_tempL0CK3R_DB() -> db.DBMS:
    L0CK3R_DBMS = db.DBMS("")
    tables = L0CK3R_DBMS.getTables()
    for table in tables:
        try:
            L0CK3R_DBMS.deleteTable(table)
        except:
            pass
    
    csvTables = [("backend\\data\\users_l0ck3rDB.csv", "users")]    
    #  users(_id_, uname, passwd, registerDate)
    for csvTable in csvTables:
        L0CK3R_DBMS.importCSV(csvTable[0], csvTable[1])
    return L0CK3R_DBMS

def L0CKin(tempDBMS: db.DBMS, username: str, password: str) -> None:
    L0CK3R_DBMS = tempDBMS
    l0ck3din = False
    result = L0CK3R_DBMS.execute(f"""SELECT * FROM users WHERE username = '{username}'""")
    if result != []:
        userpassword = L0CK3R_DBMS.execute(f"""SELECT password FROM users WHERE username = '{username}'""")[0][0]
        l0ck3din = cy.compare_encrypted(password, userpassword[1:len(userpassword)])
    return l0ck3din
    
    
def R3gister(tempDBMS: db.DBMS, filePath: str, username: str, password: str):
    L0CK3R_DBMS = tempDBMS
    try:
        L0CK3R_DBMS.insertValues("users",[(username, cy.encrypting(password), str(date.today()))])
        r3gistert = True
    except Exception as e:
        r3gistert = False
    return r3gistert
"""
dbms = build_tempL0CK3R_DB()
print(dbms.execute("SELECT * FROM users", True))
#print(R3gister("admin","admin"))
#print(L0CKin("admin","admin"))
L0CK3R_DBMS = db.DBMS("l0ck3rDB.db")
print(L0CK3R_DBMS.execute("SELECT * FROM users", True))
print(date.today())
"""
