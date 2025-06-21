import pandas as pd
import psycopg2

def extract_from_postgres():
    conn = psycopg2.connect(
        dbname='RestaurantDB',
        user='postgres',
        password='password',
        host='postgres',
        port=5432
    )
    cursor = conn.cursor()

    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE';
    """)
    tables = cursor.fetchall()

    for (table_name,) in tables:
        print(f"Extrayendo tabla: {table_name}")
        df = pd.read_sql(f'SELECT * FROM "{table_name}"', conn)
        df.to_csv(f"/opt/airflow/tmp/{table_name}.csv", index=False)

    cursor.close()
    conn.close()

extract_from_postgres()
