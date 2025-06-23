from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
from scripts.extract_postgres import extract_postgres
from scripts.load_to_hive import load_to_hive
from scripts.transform_with_spark import transform_with_spark
from scripts.olap_cubes import create_views
from scripts.load_to_neo4j import load_to_neo4j

with DAG(dag_id="etl_pipeline", start_date=datetime(2024, 1, 1), schedule_interval="@daily", catchup=False) as dag:

    extract = PythonOperator(task_id="extract", python_callable=extract_postgres)
    transform = PythonOperator(task_id="transform", python_callable=transform_with_spark)
    load = PythonOperator(task_id="load", python_callable=load_to_hive)
    analize = PythonOperator(task_id="analize", python_callable=create_views)
    load_graph = PythonOperator(task_id="load_graph", python_callable=load_to_neo4j)
    
    extract  >> transform >> load >> analize >> load_graph
