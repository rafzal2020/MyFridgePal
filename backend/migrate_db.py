import sqlite3
import os

db_path = "sql_app.db"

if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute("PRAGMA table_info(items)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "notes" not in columns:
            print("Adding notes column...")
            cursor.execute("ALTER TABLE items ADD COLUMN notes TEXT")
            conn.commit()
            print("Column added.")
        else:
            print("Column already exists.")
            
        conn.close()
    except Exception as e:
        print(f"Error migrating DB: {e}")
else:
    print("DB file not found (might be created on first request).")
