-- /orders Realizar un pedido
CREATE FUNCTION create_order(
    p_user_id INT,
    p_datetime TIMESTAMP,
    p_restaurant_id INT
) RETURNS INT AS $$
DECLARE
    user_exists INT;
    restaurant_exists INT;
    new_order_id INT;
BEGIN
    -- Check if User_ID exists
    SELECT COUNT(*) INTO user_exists FROM Users WHERE User_ID = p_user_id;
    IF user_exists = 0 THEN
        RAISE EXCEPTION 'Error: Usuario con ID % no existe.', p_user_id;
        RETURN -1;  -- Return -1 to indicate error: user does not exist
    END IF;

    -- Check if Restaurant_ID exists
    SELECT COUNT(*) INTO restaurant_exists FROM Restaurant WHERE Restaurant_ID = p_restaurant_id;
    IF restaurant_exists = 0 THEN
        RAISE EXCEPTION 'Error: Restaurante con ID % no existe.', p_restaurant_id;
        RETURN -2;  -- Return -2 to indicate error: restaurant does not exist
    END IF;

    -- Insert order and capture the Order_ID
    INSERT INTO "Order" (User_ID, "Datetime", Restaurant_ID)
    VALUES (p_user_id, p_datetime, p_restaurant_id)
    RETURNING Order_ID INTO new_order_id;

    -- Return the newly created Order_ID
    RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;

--/orders/:id Cancelar un pedido
CREATE FUNCTION delete_order(
    p_order_id INT
) RETURNS INT AS $$
DECLARE
    order_exists INT;
    rows_deleted INT;
BEGIN
    -- Check if Order_ID exists
    SELECT COUNT(*) INTO order_exists FROM "Order" WHERE Order_ID = p_order_id;
    IF order_exists = 0 THEN
        RAISE EXCEPTION 'Error: Orden con ID % no existe.', p_order_id;
        RETURN 0;  -- Return 0 to indicate no rows were deleted
    END IF;

    -- Delete the order
    DELETE FROM "Order" WHERE Order_ID = p_order_id
    RETURNING * INTO rows_deleted;

    -- Return the number of rows deleted (1 if successful)
    RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql;

--Otros
CREATE FUNCTION get_order_by_id(
    p_order_id INT
)
RETURNS TABLE(Order_ID INT, User_ID INT, "Datetime" TIMESTAMP, Restaurant_ID INT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT O.Order_ID, O.User_ID, O."Datetime", O.Restaurant_ID
    FROM "Order" AS O
    WHERE O.Order_ID = p_order_id;
END;
$$;

CREATE FUNCTION update_order(
    p_order_id INT,
    p_user_id INT,
    p_datetime TIMESTAMP,
    p_restaurant_id INT
) RETURNS INT AS $$
DECLARE
    order_exists INT;
    user_exists INT;
    restaurant_exists INT;
    rows_updated INT;
BEGIN
    -- Check if Order_ID exists
    SELECT COUNT(*) INTO order_exists FROM "Order" WHERE Order_ID = p_order_id;
    IF order_exists = 0 THEN
        RAISE EXCEPTION 'Error: Orden con ID % no existe.', p_order_id;
        RETURN -1;  -- Return -1 to indicate the order does not exist
    END IF;

    -- Check if User_ID exists
    SELECT COUNT(*) INTO user_exists FROM Users WHERE User_ID = p_user_id;
    IF user_exists = 0 THEN
        RAISE EXCEPTION 'Error: Usuario con ID % no existe.', p_user_id;
        RETURN -2;  -- Return -2 to indicate the user does not exist
    END IF;

    -- Check if Restaurant_ID exists
    SELECT COUNT(*) INTO restaurant_exists FROM Restaurant WHERE Restaurant_ID = p_restaurant_id;
    IF restaurant_exists = 0 THEN
        RAISE EXCEPTION 'Error: Restaurante con ID % no existe.', p_restaurant_id;
        RETURN -3;  -- Return -3 to indicate the restaurant does not exist
    END IF;

    -- Update the order
    UPDATE "Order"
    SET User_ID = p_user_id,
        "Datetime" = p_datetime,
        Restaurant_ID = p_restaurant_id
    WHERE Order_ID = p_order_id
    RETURNING * INTO rows_updated;

    -- Return the number of rows updated
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;


CREATE FUNCTION get_all_orders()
RETURNS TABLE(Order_ID INT, User_ID INT, "Datetime" TIMESTAMP, Restaurant_ID INT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT O.Order_ID, O.User_ID, O."Datetime", O.Restaurant_ID
    FROM "Order" AS O;
END;
$$;
