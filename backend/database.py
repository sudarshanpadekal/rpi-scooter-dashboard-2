import sqlite3

DATABASE_NAME = "scooter.db"

def initialize_database():

    conn = sqlite3.connect(DATABASE_NAME)

    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS service (
        id INTEGER PRIMARY KEY,
        next_service TEXT
    )
    """)

    conn.commit()
    conn.close()

def get_next_service():

    conn = sqlite3.connect(DATABASE_NAME)

    cursor = conn.cursor()

    cursor.execute(
        "SELECT next_service FROM service LIMIT 1"
    )

    row = cursor.fetchone()

    conn.close()

    if row:
        return row[0]

    return "15-Aug-2026"

def update_service(date):

    conn = sqlite3.connect(DATABASE_NAME)

    cursor = conn.cursor()

    cursor.execute("DELETE FROM service")

    cursor.execute(
        "INSERT INTO service(next_service) VALUES(?)",
        (date,)
    )

    conn.commit()
    conn.close()