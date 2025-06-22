import os
import pandas as pd
from pyhive import hive
import subprocess

def sanitize_column_name(col):
    return col.strip().replace(" ", "_").replace("-", "_")

def infer_hive_type(dtype):
    if pd.api.types.is_integer_dtype(dtype):
        return "INT"
    elif pd.api.types.is_float_dtype(dtype):
        return "FLOAT"
    else:
        return "STRING"

shared_dir = "/opt/airflow/dags/"

def load_to_hive(directory="/opt/airflow/dags/"):
    conn = hive.Connection(host='hive-server', port=10000, username='hive')
    cursor = conn.cursor()

    for filename in os.listdir(directory):
        if filename.endswith(".csv"):
            table_name = os.path.splitext(filename)[0]
            quoted_table_name = f'`{table_name}`'  # Always quote table name
            file_path = os.path.join(directory, filename)
            hive_path = os.path.join(shared_dir, filename)
            print(f"Cargando tabla: {table_name} desde {file_path}")

            df = pd.read_csv(file_path, nrows=100)

            # Construir definición
            hive_schema = []
            for col in df.columns:
                hive_col = sanitize_column_name(col)
                hive_type = infer_hive_type(df[col])
                hive_schema.append(f"{hive_col} {hive_type}")
            schema_str = ", ".join(hive_schema)

            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS {quoted_table_name} (
                    {schema_str}
                )
                ROW FORMAT DELIMITED
                FIELDS TERMINATED BY ','
                STORED AS TEXTFILE
            """)

            cursor.execute(f"LOAD DATA LOCAL INPATH '{hive_path}' OVERWRITE INTO TABLE {quoted_table_name}")

    cursor.close()
    conn.close()

