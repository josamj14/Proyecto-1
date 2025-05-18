CREATE FUNCTION create_product(
    p_name VARCHAR,
    p_descrip TEXT,
    p_menu_id INT,
    p_price DECIMAL(10,2)
) RETURNS INT AS $$
DECLARE
    new_product_ID INT;
BEGIN
    INSERT INTO Products ("Name", "Description", Menu_ID, Price)
    VALUES (p_name, p_descrip, p_menu_id, p_price)
    RETURNING Product_ID INTO new_product_ID;
    
    RETURN new_product_ID;
END;
$$ LANGUAGE plpgsql;


-- CREATE FUNCTION create_product(
--     p_name VARCHAR,
--     p_descrip TEXT,
--     p_menu_id INT,
--     p_price DECIMAL(10,2)
-- ) RETURNS INT AS $$
-- DECLARE
--     new_product_ID INT;
-- BEGIN
--     INSERT INTO Products ("Name", "Description", Menu_ID, Price)
--     VALUES (p_name, p_descrip, p_menu_id, p_price)
--     RETURNING Product_ID INTO new_product_ID;
    
--     RETURN new_product_ID;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE FUNCTION get_all_products()
-- RETURNS TABLE(
--     product_id INT,
--     name VARCHAR,
--     description TEXT,
--     menu_name VARCHAR,
--     price DECIMAL
-- ) AS $$
-- BEGIN
--     RETURN QUERY 
--     SELECT 
--         p.Product_ID,
--         p."Name",
--         COALESCE(p."Description", 'Producto sin descripción') AS "Description",
--         m."Name" AS menu_name,
--         p.Price
--     FROM 
--         Products p
--     INNER JOIN 
--         Menu m ON p.Menu_ID = m.Menu_ID;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE FUNCTION get_all_products()
-- RETURNS TABLE(
--     product_id INT,
--     name VARCHAR,
--     description TEXT,
--     menu_id INT,
--     price DECIMAL
-- ) AS $$
-- BEGIN
--     RETURN QUERY
--     SELECT Product_ID, "Name", "Description", Menu_ID, Price
--     FROM Products;
-- END;
-- $$ LANGUAGE plpgsql;
