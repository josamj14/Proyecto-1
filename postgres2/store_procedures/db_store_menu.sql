CREATE FUNCTION create_menu(
    p_name VARCHAR
) RETURNS INT AS $$
DECLARE
    new_menu_id INT;
BEGIN
    -- Check if p_name is not null
    IF p_name IS NULL or p_name='' THEN
    RAISE EXCEPTION 'Error: Todos los campos son obligatorios.';
    END IF;

    -- Insert a new menu and capture the Menu_ID
    INSERT INTO Menu ("Name")
    VALUES (p_name)
    RETURNING Menu_ID INTO new_menu_id;

    -- Return the newly created Menu_ID
    RETURN new_menu_id;
END;
$$ LANGUAGE plpgsql;


CREATE FUNCTION get_menu_by_id(
    p_menu_id INT
)
RETURNS TABLE(Menu_ID INT, "Name" VARCHAR) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT M.Menu_ID, M."Name"
    FROM Menu AS M
    WHERE M.Menu_ID = p_menu_id;
END;
$$;

CREATE FUNCTION update_menu(
    p_menu_id INT,
    p_name VARCHAR
) RETURNS INT AS $$
DECLARE
    menu_exists INT;
    rows_updated INT;
BEGIN
    -- Check if Menu_ID exists
    SELECT COUNT(*) INTO menu_exists FROM Menu WHERE Menu_ID = p_menu_id;
    IF menu_exists = 0 THEN
        RAISE EXCEPTION 'Error: Menu con ID % no existe.', p_menu_id;
        RETURN -1;  -- Return -1 to indicate the menu does not exist
    END IF;

    -- Update the menu
    UPDATE Menu
    SET "Name" = p_name
    WHERE Menu_ID = p_menu_id
    RETURNING * INTO rows_updated;

    -- Return the number of rows updated
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;


CREATE FUNCTION delete_menu(
    p_menu_id INT
) RETURNS INT AS $$
DECLARE
    menu_exists INT;
    rows_deleted INT;
BEGIN
    DELETE FROM Menu WHERE Menu_ID = p_menu_id
    RETURNING * INTO rows_deleted;

    -- Return the number of rows deleted (1 if successful)
    RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_all_menus()
RETURNS TABLE(Menu_ID INT, "Name" VARCHAR) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT M.Menu_ID, M."Name"
    FROM Menu AS M;
END;
$$;
