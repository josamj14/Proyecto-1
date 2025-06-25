from neo4j import GraphDatabase
import pandas as pd

def load_rec_graph():
    uri = "bolt://neo4j:7687"
    driver = GraphDatabase.driver(uri, auth=("neo4j", "password"))

    customers = pd.read_csv("/opt/airflow/dags/customers.csv")
    orders = pd.read_csv("/opt/airflow/dags/Order.csv")
    order_lines = pd.read_csv("/opt/airflow/dags/order_line.csv")
    products = pd.read_csv("/opt/airflow/dags/products.csv")

    with driver.session() as session:
        # 1. Crear nodos Usuario y Producto
        for _, row in customers.iterrows():
            session.run("MERGE (:Usuario {user_id: $id, email: $email, role: $role})",
                        id=int(row["user_id"]), email=row["email"], role=row["Role"])

        for _, row in products.iterrows():
            session.run("MERGE (:Producto {product_id: $id, name: $name, price: $price})",
                        id=int(row["product_id"]), name=row["Name"], price=row["price"])

        # 2. Crear orden y relaciones REALIZA y CONTIENE
        for _, row in orders.iterrows():
            session.run("""
                MATCH (u:Usuario {user_id: $uid})
                CREATE (o:Orden {order_id: $oid, status: $status})
                MERGE (u)-[:REALIZA]->(o)
            """, uid=int(row["user_id"]), oid=int(row["order_id"]), status=row["Status"])

        for _, row in order_lines.iterrows():
            session.run("""
                MATCH (o:Orden {order_id: $oid})
                MATCH (p:Producto {product_id: $pid})
                MERGE (o)-[:CONTIENE]->(p)
            """, oid=int(row["order_id"]), pid=int(row["product_id"]))

        # 3. Crear relaciones CO_COMPRA entre productos en una misma orden
        order_product_map = order_lines.groupby("order_id")["product_id"].apply(list)
        for product_list in order_product_map:
            for i in range(len(product_list)):
                for j in range(i + 1, len(product_list)):
                    p1, p2 = int(product_list[i]), int(product_list[j])
                    session.run("""
                        MATCH (a:Producto {product_id: $p1}), (b:Producto {product_id: $p2})
                        MERGE (a)-[r:CO_COMPRA]->(b)
                        ON CREATE SET r.count = 1
                        ON MATCH SET r.count = r.count + 1
                    """, p1=p1, p2=p2)

        # 4. RECOMIENDA: si dos usuarios compran al menos un producto en común
        user_product = orders.merge(order_lines, on="order_id")[["user_id", "product_id"]]
        grouped = user_product.groupby("product_id")["user_id"].apply(list)
        for user_list in grouped:
            for i in range(len(user_list)):
                for j in range(i + 1, len(user_list)):
                    u1, u2 = int(user_list[i]), int(user_list[j])
                    session.run("""
                        MATCH (a:Usuario {user_id: $u1}), (b:Usuario {user_id: $u2})
                        MERGE (a)-[r:RECOMIENDA]->(b)
                    """, u1=u1, u2=u2)
