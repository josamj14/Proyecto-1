from pyspark.sql import SparkSession
from pyspark.sql.functions import col, year, month, dayofmonth, date_format, hour, to_timestamp, to_date
import os


import shutil
import glob

def transform_with_spark():
    spark = SparkSession.builder.appName("ETL").getOrCreate()

    temp_path = "/opt/airflow/dags/__tmp_output"

    #----------------
    # Dimension tables
    #----------------
    #Reservations, order & restaurant are kept the same

    # Dim table customers from users, 
    df = spark.read.csv("/opt/airflow/dags/users.csv", header=True, inferSchema=True)
    df_filtered = df.select("user_id", "Role", "email")
    df_filtered.write.csv(temp_path, header=True, mode="overwrite")
    part_file = glob.glob(f"{temp_path}/part-*.csv")[0]
    shutil.move(part_file, "/opt/airflow/dags/customers.csv")
    os.remove("/opt/airflow/dags/users.csv")

    # Dim table products from products, remove description
    df = spark.read.csv("/opt/airflow/dags/products.csv", header=True, inferSchema=True)
    df_filtered = df.select("product_id", "Name", "menu_id", "price")
    df_filtered.write.csv(temp_path, header=True, mode="overwrite")
    part_file = glob.glob(f"{temp_path}/part-*.csv")[0]
    os.remove("/opt/airflow/dags/products.csv")
    shutil.move(part_file, "/opt/airflow/dags/products.csv")
    
    #IDC FOR THESE
    os.remove("/opt/airflow/dags/menu.csv")
    os.remove("/opt/airflow/dags/menu_restaurant.csv")
    os.remove("/opt/airflow/dags/table.csv")

    #----------------
    #FACT TABLES
    #----------------

    #Sales -> made from order and order line
    df_order = spark.read.csv("/opt/airflow/dags/Order.csv", header=True, inferSchema=True)
    df_line = spark.read.csv("/opt/airflow/dags/order_line.csv", header=True, inferSchema=True)
    df_order.createOrReplaceTempView("order")
    df_line.createOrReplaceTempView("order_line")
    df_sales = spark.sql("""
        SELECT 
            o.order_id,
            o.datetime,
            o.user_id,
            o.restaurant_id,
            o.address,
            o.status,
            SUM(ol.price) AS total
        FROM order o
        JOIN order_line ol ON o.order_id = ol.order_id
        GROUP BY 
            o.order_id, o.datetime, o.user_id, o.restaurant_id, o.address, o.status
    """)
    
    df_sales.write.csv(temp_path, header=True, mode="overwrite")
    part_file = glob.glob(f"{temp_path}/part-*.csv")[0]
    shutil.move(part_file, "/opt/airflow/dags/sales.csv")

    #Product sales -> similar to sales but for products kinda
    df_products = spark.read.csv("/opt/airflow/dags/products.csv", header=True, inferSchema=True)
    df_order_line = spark.read.csv("/opt/airflow/dags/order_line.csv", header=True, inferSchema=True)
    df_products.createOrReplaceTempView("products")
    df_order_line.createOrReplaceTempView("order_line")
    df_joined = spark.sql("""
        SELECT 
            ol.product_id,
            p.Name AS name,
            p.menu_id,
            ol.order_id,
            ol.price
        FROM order_line ol
        JOIN products p ON ol.product_id = p.product_id
        ORDER BY ol.product_id, ol.order_id
    """)
    df_joined.write.csv(temp_path, header=True, mode="overwrite")
    part_file = glob.glob(f"{temp_path}/part-*.csv")[0]
    shutil.move(part_file, "/opt/airflow/dags/product_sales.csv")

    shutil.rmtree(temp_path)