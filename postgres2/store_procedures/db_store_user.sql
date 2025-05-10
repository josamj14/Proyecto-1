-- Registrar un nuevo usuario
CREATE FUNCTION register_user(
    p_role VARCHAR,
    p_username VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR
) RETURNS INT AS $$
DECLARE
    new_user_id INT;
    email_exists INT;
BEGIN
    -- Verificar si el correo ya está registrado
    SELECT COUNT(*) INTO email_exists FROM Users WHERE Users.Email = p_email;
    IF email_exists > 0 THEN
        RAISE EXCEPTION 'Error: El correo % ya está registrado.', p_email;
    END IF;

    -- Validar campos obligatorios
    IF p_role IS NULL OR p_username IS NULL OR p_email IS NULL OR p_password IS NULL THEN
        RAISE EXCEPTION 'Error: Todos los campos son obligatorios.';
    END IF;

    INSERT INTO Users ("Role", Username, Email, "Password")
    VALUES (p_role, p_username, p_email, p_password)
    RETURNING User_ID INTO new_user_id;

    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;


-- Iniciar sesión (devuelve la contraseña para validación en Node.js)
CREATE FUNCTION login_user(
    p_email VARCHAR
) RETURNS TABLE(User_ID INT, Role VARCHAR, HashedPassword VARCHAR) AS $$
DECLARE
    email_exists INT;
BEGIN
    -- Verificar si el correo existe
    SELECT COUNT(*) INTO email_exists FROM Users WHERE Email = p_email;
    IF email_exists = 0 THEN
        RAISE EXCEPTION 'Error: No existe un usuario con el correo %.', p_email;
    END IF;

    RETURN QUERY
    SELECT Users.User_ID, Users."Role", Users."Password" FROM Users 
    WHERE Email = p_email;
END;
$$ LANGUAGE plpgsql;

-- Obtener detalles del usuario autenticado
CREATE FUNCTION get_user_details(
    p_user_id INT
) RETURNS TABLE(User_ID INT, Role VARCHAR, Username VARCHAR, Email VARCHAR) AS $$
DECLARE
    user_exists INT;
BEGIN
    -- Verificar si el usuario existe
    SELECT COUNT(*) INTO user_exists FROM Users WHERE Users.User_ID = p_user_id;
    IF user_exists = 0 THEN
        RAISE EXCEPTION 'Error: No existe un usuario con ID %.', p_user_id;
    END IF;

    RETURN QUERY
    SELECT Users.User_ID, Users."Role", Users.Username, Users.Email 
    FROM Users 
    WHERE Users.User_ID = p_user_id;
END;
$$ LANGUAGE plpgsql;


-- Actualizar información de un usuario
CREATE FUNCTION update_user(
    p_user_id INT,
    p_username VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR
) RETURNS VOID AS $$ 
DECLARE
    user_exists INT;
    email_exists INT;
BEGIN
    -- Verificar si el usuario existe
    SELECT COUNT(*) INTO user_exists FROM Users WHERE Users.User_ID = p_user_id;
    IF user_exists = 0 THEN
        RAISE EXCEPTION 'Error: No existe un usuario con ID %.', p_user_id;
    END IF;

    -- Verificar si el nuevo correo ya está registrado con otro usuario
    IF p_email IS NOT NULL THEN
        SELECT COUNT(*) INTO email_exists FROM Users WHERE Email = p_email AND Users.User_ID <> p_user_id;
        IF email_exists > 0 THEN
            RAISE EXCEPTION 'Error: El correo % ya está en uso por otro usuario.', p_email;
        END IF;
    END IF;

    -- Actualizar usuario
    UPDATE Users
    SET Username = COALESCE(p_username, Username),
        Email = COALESCE(p_email, Email),
        "Password" = COALESCE(p_password, "Password")
    WHERE User_ID = p_user_id;
END;
$$ LANGUAGE plpgsql;



-- Eliminar un usuario
CREATE FUNCTION delete_user(
    given_id INT
) RETURNS VOID AS $$ 
DECLARE
    user_exists INT;
BEGIN
    -- Verificar si el usuario existe
    SELECT COUNT(*) INTO user_exists FROM Users WHERE Users.User_ID = given_id;
    IF user_exists = 0 THEN
        RAISE EXCEPTION 'Error: No existe un usuario con ID %.', given_id;
    END IF;

    DELETE FROM Users WHERE User_ID = given_id;
END;
$$ LANGUAGE plpgsql;


--Obtener todos los usuarios
CREATE FUNCTION get_all_users()
RETURNS TABLE(User_ID INT, Role VARCHAR, Username VARCHAR, Email VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT u.User_ID, u."Role", u.Username, u.Email FROM Users as u;
END;
$$ LANGUAGE plpgsql;