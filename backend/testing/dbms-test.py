"""
import duckdb, os
import pandas as pd


con = duckdb.connect()
file_path = os.path.join(os.path.dirname(os.path.abspath(__name__)), "backend\\testing\\file.csv")
# Run a query and store results in a Pandas DataFrame
df = con.execute(f"SELECT * FROM '{file_path}'").fetchdf()

# Show the results in Jupyter Notebook (visual interface)
print(df.head())
"""

import duckdb, os
import pandas as pd

con = duckdb.connect()

# Erstellen einer neuen Tabelle
con.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name VARCHAR,
        age INTEGER
    )
""")

con.execute("""
    INSERT INTO users (id, name, age)
    VALUES
    (1,'Billie Jean', 24),
    (2,'Some one', 23)
""")

print(con.execute("""SHOW TABLES""").fetchall())
print(con.execute("""SELECT * FROM users""").fetchall())

"""
file_path = os.path.join(os.path.dirname(os.path.abspath(__name__)), "backend\\testing\\file.csv")
# Run a query and store results in a Pandas DataFrame
df = con.execute(f"SELECT * FROM '{file_path}'").fetchall()

pandas_df = pd.DataFrame(df)
print(duckdb.sql("SELECT * FROM pandas_df"))

print(df)
"""