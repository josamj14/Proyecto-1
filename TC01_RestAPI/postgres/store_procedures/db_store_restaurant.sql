CREATE FUNCTION create_restaurant(
    p_name VARCHAR,
    p_address TEXT
) RETURNS INT AS $$
DECLARE
    new_restaurant_id INT;
BEGIN
    IF p_name IS NULL OR p_address IS NULL OR p_name = '' OR p_address = '' THEN
        RAISE EXCEPTION 'Error: Todos los campos son obligatorios.';
    END IF;

    INSERT INTO Restaurant ("Name", "Address")
    VALUES (p_name, p_address)
    RETURNING Restaurant_ID INTO new_restaurant_id;

    RETURN new_restaurant_id;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_restaurant_by_id(
    p_restaurant_id INT
)
RETURNS TABLE(Restaurant_ID INT, "Name" VARCHAR, "Address" TEXT) 
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Error: El ID del restaurante no puede ser nulo o vacío.';
    END IF;
    RETURN QUERY
    SELECT R.Restaurant_ID, R."Name", R."Address"
    FROM Restaurant AS R
    WHERE R.Restaurant_ID = p_restaurant_id;
END;
$$;

CREATE FUNCTION update_restaurant(
    p_restaurant_id INT,
    p_name VARCHAR,
    p_address TEXT
) RETURNS INT AS $$
DECLARE
    rows_updated INT;
BEGIN
    IF p_restaurant_id is NULL OR p_name IS NULL OR p_address IS NULL OR p_name = '' OR p_address = '' THEN
        RAISE EXCEPTION 'Error: Todos los campos son obligatorios.';
    END IF;
    UPDATE Restaurant
    SET "Name" = p_name, "Address" = p_address
    WHERE Restaurant.Restaurant_ID = p_restaurant_id
    RETURNING * INTO rows_updated;

    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;


CREATE FUNCTION delete_restaurant(
    p_restaurant_id INT
) RETURNS INT AS $$
DECLARE
    rows_deleted INT;
BEGIN
    DELETE FROM Restaurant
    WHERE Restaurant_ID = p_restaurant_id
    RETURNING * INTO rows_deleted;

    RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql;


CREATE FUNCTION get_all_restaurants()
RETURNS TABLE(Restaurant_ID INT, "Name" VARCHAR, "Address" TEXT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT R.Restaurant_ID, R."Name", R."Address"
    FROM Restaurant AS R;
END;
$$;
