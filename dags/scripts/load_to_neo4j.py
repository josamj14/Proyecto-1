import os
import pandas as pd
from neo4j import GraphDatabase

NEO4J_URI = "bolt://neo4j:7687"
NEO4J_USER = "neo4j"
NEO4J_PASS = "password"

def load_to_neo4j(directory="/opt/airflow/dags/"):
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))
    session = driver.session()

    # ----- CARGAR RESTAURANTES -----
    rest_csv = os.path.join(directory, "restaurant.csv")
    if os.path.exists(rest_csv):
        df_rest = pd.read_csv(rest_csv)
        print("Cargando nodos :Restaurante...")
        for _, row in df_rest.iterrows():
            session.run("""
                MERGE (:Restaurante {
                    restaurant_id: $id,
                    name: $name,
                    address: $address
                })
            """, id=int(row["restaurant_id"]), name=row["Name"], address=row["Address"])

    # ----- CARGAR ÓRDENES -----
    orders_csv = os.path.join(directory, "Order.csv")
    if os.path.exists(orders_csv):
        df_orders = pd.read_csv(orders_csv)
        print("Cargando nodos :Orden y relaciones :ENTREGADO_DESDE...")
        for _, row in df_orders.iterrows():
            order_id = int(row["order_id"])
            address = row["Address"]
            status = row["Status"]
            rest_id = int(row["restaurant_id"])
            ciudad = str(address).strip()[0] if isinstance(address, str) else "0"

            session.run("""
                MERGE (o:Orden {order_id: $order_id})
                SET o.address = $address, o.status = $status, o.ciudad = $ciudad

                WITH o
                MATCH (r:Restaurante {restaurant_id: $rest_id})
                MERGE (o)-[:ENTREGADO_DESDE]->(r)
            """, order_id=order_id, address=address, status=status, ciudad=ciudad, rest_id=rest_id)

        print("Creando relaciones :CERCA_DE entre órdenes de la misma ciudad...")
        session.run("""
            MATCH (a:Orden), (b:Orden)
            WHERE a.ciudad = b.ciudad AND a.order_id < b.order_id
            MERGE (a)-[:CERCA_DE]->(b)
        """)

    session.close()
    driver.close()
    print(" Carga a Neo4j completada.")