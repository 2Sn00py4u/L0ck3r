import duckdb

# Connect to DuckDB (in-memory database for simplicity)
con = duckdb.connect()

# Install and load the sqlite_scanner extension
con.execute("LOAD 'C:/Users/Felix/Desktop/coolStuff/browser/extensions/L0ck3r/dependencies/sqlite_scanner.duckdb_extension/sqlite_scanner.duckdb_extension'")

# Alternatively, load from the local path (if you manually downloaded it)
# con.execute("LOAD 'C:/duckdb/extensions/sqlite_scanner.duckdb_extension'")
