from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
from scripts.extract_postgres import extract_postgres
from scripts.load_to_hive import load_to_hive

with DAG(dag_id="etl_pipeline", start_date=datetime(2024, 1, 1), schedule_interval="@daily", catchup=False) as dag:

    extract = PythonOperator(task_id="extract", python_callable=extract_postgres)
    load = PythonOperator(task_id="load", python_callable=load_to_hive)

    extract  >> load
