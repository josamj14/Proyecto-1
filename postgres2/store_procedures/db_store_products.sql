CREATE FUNCTION create_product(
    p_name VARCHAR,
    p_descrip VARCHAR,
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

CREATE OR REPLACE FUNCTION get_all_products()
RETURNS TABLE (
    Product_ID INT,
    Name VARCHAR,
    Description TEXT,
    Menu_ID INT,
    Price DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.Product_ID,
        p."Name",
        p."Description",
        p.Menu_ID,
        p.Price
    FROM Products p;
END;
$$ LANGUAGE plpgsql;

