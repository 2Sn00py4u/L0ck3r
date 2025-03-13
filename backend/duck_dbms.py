import duckdb as duck
import pandas as pd
import os

class DBMS:
    def __init__(self, DBfilePath:str) -> duck.DuckDBPyConnection:
        self.DBpath = DBfilePath
        self.__dbConnection = duck.connect(self.DBpath)
        self.__Tables = self.getTables()
    
    def importCSV(self, csvPath: str, tableName: str):
        with open(csvPath, "r") as csvFile:
            attributes = []
            values = []
            for i, line in enumerate(csvFile):
                if i == 0:
                    line = line.split(";")
                    line.pop(len(line)-1)
                    attributes = line
                else:
                    line = line.split(";")
                    line.pop(len(line)-1)
                    values.append(tuple(line))
            csvFile.close()
        if tableName in self.getTables():
            self.deleteTable(tableName)
        self.createTable(tableName, attributes)
        self.insertValues(tableName, values)
    
    """  get-functions  """
    def getConnection(self):
        return self.__dbConnection
    
    def getTables(self, pdOutput: bool = False) -> list|pd.DataFrame:
        if pdOutput == True:
            return self.execute("""SHOW TABLES""", pdOutput)
        else:
            tables = []
            tableTuples = self.execute("""SHOW TABLES""", pdOutput)
            for i in range(len(tableTuples)):
                tables.append(tableTuples[i][0])
            #print(tables)
            return tables

    def getAttributes(self, table: str,pdOutput: bool = False):
        return self.execute(f"""PRAGMA table_info({table})""", pdOutput)
    
    """  key-functions  """
    def connectDB(self, dbPath: str):
        try:
            self.disconnectDB()
        except:
            pass
        self.__dbConnection = duck.connect(dbPath)
    
    def createTable(self, tableName: str, tableAttributes: list[str]):
        try:
            command = f"""CREATE TABLE IF NOT EXISTS {tableName}("""
            for i in range(len(tableAttributes)-1):
                command += f"{tableAttributes[i]},"
            command+= f"{tableAttributes[len(tableAttributes)-1]})"
            print(command)
            self.execute(command)
        except:
            raise Exception(f"error creating table {tableName}")

    def insertValues(self, table: str, rows: list[tuple,tuple]):
        for row in rows:
            print(f"""INSERT INTO {table} VALUES {row}""")
            self.execute(f"""INSERT INTO {table} VALUES {row}""")
        self.__dbConnection.commit()
    
    def renameTable(self, table: str, newTablename: str) -> None:
        self.execute(f"""ALTER TABLE {table} RENAME TO {newTablename}""")
    
    def deleteTable(self, table: str):
        self.execute(f"""DROP TABLE IF EXISTS {table}""")
    
    def disconnectDB(self):
        self.__dbConnection.close()
    
    def deleteDB(self):
        try:
            os.remove(self.DBpath)
        except Exception as e:
            raise Exception(f"error deleting self:\n{e}")
    
    def execute(self, command:str, pdOutput: bool= False) -> list:
        result = self.__dbConnection.execute(command).fetchall()
        if not pdOutput:
            return result
        else:
            try:
                pandasOutput = pd.DataFrame(result)
                return duck.sql("""SELECT * FROM pandasOutput""")
            except:
                return "min 1 value"
            
    
    """  magic-functions  """
    def __str__(self):
        return "class for interacting with a DB via duckdb"


"""
dbms = DBMS("")
dbms.createTable("users", ["name VARCHAR PRIMARY KEY","lastname VARCHAR"])
dbms.insertValues("users",[("Billie", "Jean"),("Some", "Dude")])
print(dbms.execute("SELECT * FROM users", True))
dbms.importCSV("backend\\l0ck3rDB.csv", "users")
print(dbms.execute("SELECT * FROM users", True))
    
  
dbms = DBMS(os.path.join(os.path.dirname(os.path.abspath(__name__)), "backend\\userdb.db"))
dbms.createTable("users",["id INTEGER PRIMARY KEY", "name VARCHAR", "age INTEGER"])
print(dbms.getTables(True))
try:
    dbms.insertValues("users", [(1,"Billie Jean",24), (2,"Aaron Waitemeier",16),(3,"Florian Grundelmann",16)])
except:
    pass
print(dbms.getAttributes("users",True))


con = duckdb.connect()
file_path = os.path.join(os.path.dirname(os.path.abspath(__name__)), "backend\\testing\\file.csv")
# Run a query and store results in a Pandas DataFrame
df = con.execute(f"SELECT * FROM '{file_path}'").fetchdf()
"""
"""
con = duck.connect("l0ck3rDB.db")
print(con.execute("INSTALL EXTENSION sqlite_scanner;").fetchall())"""