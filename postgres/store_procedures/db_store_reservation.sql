CREATE FUNCTION create_reservation(
    p_user_id INT,
    p_datetime TIMESTAMP,
    p_capacity INT,
    p_restaurant_id INT
) RETURNS INT AS $$
DECLARE
    user_exists INT;
    table_exists INT;
    restaurant_exists INT;
    new_reservation_id INT;
    selected_table_id INT;
BEGIN
    IF p_user_id IS NULL OR p_datetime IS NULL OR p_capacity IS NULL OR p_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Error: Los campos no pueden ser NULL.';
    END IF;

    IF p_datetime <= CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Error: La fecha y hora de la reserva deben ser posteriores a la fecha y hora actual.';
    END IF;

    -- Check if the User_ID exists
    SELECT COUNT(*) INTO user_exists FROM Users WHERE User_ID = p_user_id;
    IF user_exists = 0 THEN
        RAISE EXCEPTION 'Error: Usuario con ID % no existe.', p_user_id;
        RETURN -1;  -- Return -1 to indicate an error
    END IF;

    -- Check if the Restaurant_ID exists
    SELECT COUNT(*) INTO restaurant_exists FROM Restaurant WHERE Restaurant_ID = p_restaurant_id;
    IF restaurant_exists = 0 THEN
        RAISE EXCEPTION 'Error: Restaurante con ID % no existe.', p_restaurant_id;
        RETURN -3;  -- Return -3 to indicate an error
    END IF;

        -- Check if the Table_ID exists
    SELECT Table_ID INTO selected_table_id FROM "Table" 
    WHERE Capacity >= p_capacity AND Available = TRUE ORDER BY Table_ID ASC LIMIT 1;
    IF selected_table_id IS NULL THEN
        RAISE EXCEPTION 'Error: No hay mesas disponibles.';
        RETURN -2;  -- Return -2 to indicate an error
    END IF;

    UPDATE "Table"
    SET Available = FALSE
    WHERE Table_ID = selected_table_id;


    -- If all checks pass, insert the reservation
    INSERT INTO Reservation (User_ID, "Datetime", Capacity, Table_ID, Restaurant_ID)
    VALUES (p_user_id, p_datetime, p_capacity, selected_table_id, p_restaurant_id)
    RETURNING Reservation_ID INTO new_reservation_id;

    -- Return the ID of the new reservation
    RETURN new_reservation_id;
END;
$$ LANGUAGE plpgsql;

-- POST /reservations/:id Cancelar una reserva
CREATE FUNCTION delete_reservation(
    p_reservation_id INT
) RETURNS INT AS $$
DECLARE
    rows_deleted INT;
    reservation_exists INT;
BEGIN
    SELECT COUNT(*) INTO reservation_exists FROM Reservation WHERE Reservation_ID = p_reservation_id;
    IF reservation_exists = 0 THEN
        RAISE EXCEPTION 'Error: Reserva con ID % no existe.', p_reservation_id;
        RETURN -1;  -- Return -1 to indicate the reservation does not exist
    END IF;

    DELETE FROM Reservation
    WHERE Reservation_ID = p_reservation_id
    RETURNING * INTO rows_deleted;

    RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql;


--  OTROS STORES QUE TAL VEZ SE OCUPEN

CREATE FUNCTION get_reservation_by_id(
    p_reservation_id INT
)
RETURNS TABLE(Reservation_ID INT, User_ID INT, "Datetime" TIMESTAMP, Capacity INT, Table_ID INT, Restaurant_ID INT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT R.Reservation_ID, R.User_ID, R."Datetime", R.Capacity, R.Table_ID, R.Restaurant_ID
    FROM Reservation AS R
    WHERE R.Reservation_ID = p_reservation_id;
END;
$$;

CREATE FUNCTION update_reservation(
    p_reservation_id INT,
    p_user_id INT,
    p_datetime TIMESTAMP,
    p_capacity INT,
    p_table_id INT,
    p_restaurant_id INT
) RETURNS INT AS $$
DECLARE
    reservation_exists INT;
    user_exists INT;
    table_exists INT;
    restaurant_exists INT;
    rows_updated INT;
BEGIN
    -- Check if the Reservation_ID exists
    SELECT COUNT(*) INTO reservation_exists FROM Reservation WHERE Reservation_ID = p_reservation_id;
    IF reservation_exists = 0 THEN
        RAISE EXCEPTION 'Error: Reserva con ID % no existe.', p_reservation_id;
        RETURN -1;  -- Return -1 to indicate the reservation does not exist
    END IF;

    -- Check if the User_ID exists
    SELECT COUNT(*) INTO user_exists FROM Users WHERE User_ID = p_user_id;
    IF user_exists = 0 THEN
        RAISE EXCEPTION 'Error: Usuario con ID % no existe.', p_user_id;
        RETURN -2;  -- Return -2 to indicate the user does not exist
    END IF;

    -- Check if the Table_ID exists
    SELECT COUNT(*) INTO table_exists FROM "Table" WHERE Table_ID = p_table_id;
    IF table_exists = 0 THEN
        RAISE EXCEPTION 'Error: Mesa con ID % no existe.', p_table_id;
        RETURN -3;  -- Return -3 to indicate the table does not exist
    END IF;

    -- Check if the Restaurant_ID exists
    SELECT COUNT(*) INTO restaurant_exists FROM Restaurant WHERE Restaurant_ID = p_restaurant_id;
    IF restaurant_exists = 0 THEN
        RAISE EXCEPTION 'Error: Restaurante con ID % no existe.', p_restaurant_id;
        RETURN -4;  -- Return -4 to indicate the restaurant does not exist
    END IF;

    -- If all checks pass, update the reservation
    UPDATE Reservation
    SET User_ID = p_user_id,
        "Datetime" = p_datetime,
        Capacity = p_capacity,
        Table_ID = p_table_id,
        Restaurant_ID = p_restaurant_id
    WHERE Reservation_ID = p_reservation_id
    RETURNING * INTO rows_updated;

    -- Return the number of updated rows
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;


CREATE FUNCTION get_all_reservations()
RETURNS TABLE(Reservation_ID INT, User_ID INT, "Datetime" TIMESTAMP, Capacity INT, Table_ID INT, Restaurant_ID INT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT R.Reservation_ID, R.User_ID, R."Datetime", R.Capacity, R.Table_ID, R.Restaurant_ID
    FROM Reservation AS R;
END;
$$;

CREATE FUNCTION get_reservations_by_restaurant(
    p_restaurant_id INT
) RETURNS TABLE(
    Reservation_ID INT, 
    User_ID INT, 
    "Datetime" TIMESTAMP, 
    Capacity INT, 
    Table_ID INT, 
    Restaurant_ID INT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    restaurant_exists INT;
BEGIN
    -- Check if the restaurant exists
    SELECT COUNT(*) INTO restaurant_exists 
    FROM Restaurant 
    WHERE Restaurant.Restaurant_ID = p_restaurant_id;

    -- If the restaurant doesn't exist, raise a notice and return an empty result
    IF p_restaurant_id IS NULL OR restaurant_exists = 0 THEN
        RAISE EXCEPTION 'Error: Restaurante con ID % no existe', p_restaurant_id;
        RETURN;
    END IF;

    -- Return reservations for the given restaurant
    RETURN QUERY
    SELECT R.Reservation_ID, R.User_ID, R."Datetime", R.Capacity, R.Table_ID, R.Restaurant_ID
    FROM Reservation AS R
    WHERE R.Restaurant_ID = p_restaurant_id;
END;
$$;

CREATE FUNCTION get_reservations_by_restaurant_and_date(
    p_restaurant_id INT,
    p_date DATE
) RETURNS TABLE(
    Reservation_ID INT, 
    User_ID INT, 
    "Datetime" TIMESTAMP, 
    Capacity INT, 
    Table_ID INT, 
    Restaurant_ID INT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    restaurant_exists INT;
BEGIN
    -- Validate restaurant existence
    SELECT COUNT(*) INTO restaurant_exists 
    FROM Restaurant 
    WHERE Restaurant.Restaurant_ID = p_restaurant_id;

    IF restaurant_exists = 0 THEN
        RAISE EXCEPTION 'Error: Restaurante con ID % no existe', p_restaurant_id;
        RETURN;
    END IF;

    -- Validate date (ensure it's not NULL or in an invalid format)
    IF p_date IS NULL THEN
        RAISE EXCEPTION 'Error: La fecha no es valida';
    END IF;

    -- Return reservations for the given restaurant and date
    RETURN QUERY
    SELECT R.Reservation_ID, R.User_ID, R."Datetime", R.Capacity, R.Table_ID, R.Restaurant_ID
    FROM Reservation AS R
    WHERE R.Restaurant_ID = p_restaurant_id
      AND DATE(R."Datetime") = p_date;
END;
$$;
