docker exec -it py01_badilla_marin-hive-server-1  /bin/bash

/opt/hive/bin/beeline -u jdbc:hive2://localhost:10000

SELECT * FROM menu LIMIT 10;
SELECT * FROM menu_restaurant LIMIT 10;
SELECT * FROM `order` LIMIT 10;
SELECT * FROM order_line LIMIT 10;
SELECT * FROM products LIMIT 10;
SELECT * FROM reservation LIMIT 10;
SELECT * FROM restaurant LIMIT 10;
SELECT * FROM `table` LIMIT 10;
SELECT * FROM users LIMIT 10;

DESCRIBE customers;
DESCRIBE `order`;
DESCRIBE order_line;
DESCRIBE products;
DESCRIBE product_sales;
DESCRIBE reservation;
DESCRIBE restaurant;
DESCRIBE sales;


CREATE VIEW sales_by_mon AS
SELECT
    YEAR(o.datetime) AS year,
    MONTH(o.datetime) AS month,
    SUM(ol.price) AS total_sales
FROM `order` o
JOIN order_line ol ON o.order_id = ol.order_id 
GROUP BY YEAR(o.datetime), MONTH(o.datetime)
ORDER BY year, month;

SELECT * FROM sales_by_mon;



CREATE VIEW sales_by_product AS
SELECT 
    p.name AS product_name,
    SUM(ol.price) AS total_sales
FROM orders o
JOIN restaurants r ON o.restaurantId = r.restaurantId
JOIN orderlines ol ON o.orderId = ol.orderId  -- Join with orderlines based on orderId
JOIN products p ON p.productId = ol.productId  -- Join with products based on productId
GROUP BY p.name
ORDER BY total_sales DESC;

SELECT * FROM sales_by_product;



CREATE VIEW reservations_by_date AS
SELECT 
    TO_DATE(datetime) AS reservation_date,  -- Use TO_DATE for proper date extraction
    COUNT(*) AS num_reservations
FROM reservations
GROUP BY TO_DATE(datetime)  -- Group by the date part of datetime
ORDER BY reservation_date;

SELECT * FROM reservations_by_date;



CREATE VIEW top_menus AS
WITH menu_usage AS (
    SELECT 
        menuId,
        COUNT(restaurantId) AS restaurants_count
    FROM restaurants
    LATERAL VIEW explode(menuIds) exploded_menu AS menuId
    GROUP BY menuId
)
SELECT menuId, restaurants_count
FROM menu_usage
ORDER BY restaurants_count DESC
LIMIT 5;


SELECT * FROM top_menus;




CREATE VIEW top_selling_products AS
WITH ranked_products AS (
    SELECT 
        o.restaurantId,
        ol.productId,
        SUM(ol.price) AS total_sales,
        ROW_NUMBER() OVER (PARTITION BY o.restaurantId ORDER BY SUM(ol.price) DESC) AS rank
    FROM orders o
    JOIN orderlines ol ON o.orderId = ol.orderId  -- Join with orderlines based on orderId
    JOIN products p ON p.productId = ol.productId  -- Join with products based on productId
    GROUP BY o.restaurantId, ol.productId
)
SELECT 
    rp.restaurantId,
    p.name,
    rp.total_sales
FROM ranked_products rp
JOIN products p ON p.productId = rp.productId  -- Join with products to get the product name
WHERE rp.rank = 1
ORDER BY rp.total_sales DESC;

SELECT * FROM top_selling_products;

