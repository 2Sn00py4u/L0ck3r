import duckdb
import crypting as cy
# Open a connection to your DuckDB database (it will create the database if it doesn't exist)
conn = duckdb.connect('your_database.duckdb')

# Create the table (if it doesn't already exist)
conn.execute("""
    CREATE TABLE IF NOT EXISTS raw_data (
        id INTEGER PRIMARY KEY,
        data BLOB
    );
""")

# Example raw binary data
raw_bytes = cy.encrypting("papa")

# Insert the raw binary data into the database
conn.execute("INSERT INTO raw_data (id, data) VALUES (?, ?)", (1, raw_bytes))

# Commit the transaction and close the connection
#conn.commit()

# Query to check the inserted data
result = conn.execute("""PRAGMA table_info(raw_data)""").fetchall()

# Print the result (retrieved bytes)
print(result)

# Close the connection
conn.close()
