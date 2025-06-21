import os
import pandas as pd
from pyhive import hive

def sanitize_column_name(col):
    return col.strip().replace(" ", "_").replace("-", "_")

def infer_hive_type(dtype):
    if pd.api.types.is_integer_dtype(dtype):
        return "INT"
    elif pd.api.types.is_float_dtype(dtype):
        return "FLOAT"
    else:
        return "STRING"

def load_to_hive(directory="/opt/airflow/tmp/"):
    conn = hive.Connection(host='hive-server', port=10000, username='hive')
    cursor = conn.cursor()

    for filename in os.listdir(directory):
        if filename.endswith(".csv"):
            table_name = os.path.splitext(filename)[0]
            file_path = os.path.join(directory, filename)
            print(f"Cargando tabla: {table_name} desde {file_path}")

            df = pd.read_csv(file_path)

            # Construir definición de tabla
            hive_schema = []
            for col in df.columns:
                hive_col = sanitize_column_name(col)
                hive_type = infer_hive_type(df[col])
                hive_schema.append(f"{hive_col} {hive_type}")
            schema_str = ", ".join(hive_schema)

            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS {table_name} (
                    {schema_str}
                )
                ROW FORMAT DELIMITED
                FIELDS TERMINATED BY ','
                STORED AS TEXTFILE
            """)

            # Insertar los datos
            for _, row in df.iterrows():
                values = []
                for val in row:
                    if pd.isna(val):
                        values.append("NULL")
                    elif isinstance(val, str):
                        values.append(f"'{val.replace("'", "''")}'")
                    else:
                        values.append(str(val))
                insert_query = f"INSERT INTO {table_name} VALUES ({', '.join(values)})"
                cursor.execute(insert_query)

    cursor.close()
    conn.close()
