import duckdb as duck
import pandas as pd
import os

class DBMS:
    def __init__(self, DBfilePath:str) -> duck.DuckDBPyConnection:
        self.DBpath = DBfilePath
        self.__dbConnection = duck.connect(self.DBpath)
        self.__Tables = self.getTables()
    
    """  get_/set_functions  """
    def getConnection(self):
        return self.__dbConnection
    
    def getTables(self):
        return self.__dbConnection.execute("""SHOW TABLES""").fetchall()
        
    def set_(self):
        pass
    
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

    def insertValues(self):
        pass
    
    def deleteTable(self):
        pass
    
    def disconnectDB(self):
        self.__dbConnection.close()
    
    def deleteDB(self):
        pass
    
    def execute(self, command:str) -> list:
        return self.__dbConnection.execute(command).fetchall()
    
    """  magic-functions  """
    
    def __str__(self):
        return "class for interacting with a DB via duckdb"
    
    
dbms = DBMS(os.path.join(os.path.dirname(os.path.abspath(__name__)), "backend\\userdb.db"))
dbms.createTable("users",["id INTEGER PRIMARY KEY", "name VARCHAR", "age INTEGER"])
print(dbms.getTables())