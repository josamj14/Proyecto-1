from pyhive import hive

def create_views():
    conn = hive.Connection(host='hive-server', port=10000, username='hive')
    cursor = conn.cursor()

    #SALES BY month
    cursor.execute(""" 
        CREATE OR REPLACE VIEW sales_by_mon AS
        SELECT
            CAST(date_format(CAST(o.datetime AS timestamp), 'yyyy') AS INT) AS year,
            CAST(date_format(CAST(o.datetime AS timestamp), 'MM') AS INT) AS month,
            SUM(ol.price) AS total_sales
        FROM `order` o
        JOIN order_line ol ON o.order_id = ol.order_id
        GROUP BY 
            CAST(date_format(CAST(o.datetime AS timestamp), 'yyyy') AS INT),
            CAST(date_format(CAST(o.datetime AS timestamp), 'MM') AS INT)
    """)

    #TOTAL SALES BY PRODUCT
    cursor.execute(""" 
        CREATE OR REPLACE VIEW sales_by_product AS
        SELECT 
            name AS product_name,
            SUM(price) AS total_sales
        FROM product_sales
        GROUP BY name
    """)

    #RESERVATIONS BY DATE
    cursor.execute(""" 
        CREATE OR REPLACE VIEW reservations_by_date AS
        SELECT 
            TO_DATE(datetime) AS reservation_date,
            COUNT(*) AS num_reservations
        FROM reservation
        GROUP BY TO_DATE(datetime)
    """)

    #TOP selling products by restaurant
    cursor.execute(""" 
        CREATE OR REPLACE VIEW top_selling_products AS
        WITH ranked_products AS (
            SELECT 
                restaurant_id,
                product_id,
                name,
                SUM(price) AS total_sales,
                ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY SUM(price) DESC) AS rank
            FROM product_sales
            GROUP BY restaurant_id, product_id, name
        )
        SELECT 
            restaurant_id,
            name,
            total_sales
        FROM ranked_products
        WHERE rank = 1
    """)

    #monthLY SALES GROWTH
    cursor.execute(""" 
        CREATE OR REPLACE VIEW monthly_sales_growth AS
        SELECT
            year(datetime) AS year,
            month(datetime) AS month,
            SUM(total) AS total_sales
        FROM sales
        GROUP BY year(datetime), month(datetime)
    """)

    #PEAK ORDER HOURS
    cursor.execute(""" 
        CREATE OR REPLACE VIEW peak_order_hours AS
        SELECT
            HOUR(datetime) AS hour,
            COUNT(*) AS order_count
        FROM `order`
        GROUP BY HOUR(datetime)
    """)

    #WEEKLY RESERVATIONS PATTERNS
    cursor.execute(""" 
        CREATE OR REPLACE VIEW weekly_reservation_patterns AS
        SELECT
            DAYOFWEEK(datetime) AS weekday,
            COUNT(*) AS total_reservations
        FROM reservation
        GROUP BY DAYOFWEEK(datetime)
        ORDER BY weekday
    """)
