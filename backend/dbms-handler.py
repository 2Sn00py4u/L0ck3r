"""
import duckdb, os
import pandas as pd


con = duckdb.connect()
file_path = os.path.join(os.path.dirname(os.path.abspath(__name__)), "backend\\file.csv")
# Run a query and store results in a Pandas DataFrame
df = con.execute(f"SELECT * FROM '{file_path}'").fetchdf()

# Show the results in Jupyter Notebook (visual interface)
print(df.head())
"""

import duckdb
import pandas as pd

pandas_df = pd.DataFrame({"a": [42]})
print(duckdb.sql("SELECT * FROM pandas_df"))