CREATE SCHEMA test_user;
SET search_path TO test_user, public;

BEGIN;

SELECT  plan(33);

-- 1 Porbar que si se puede registrar un nuevo usuario
SELECT is(
    (SELECT register_user('Admin', 'Johnny', 'Johnny@example.com', 'hashed_password_123')),
    6,
    'Should successfully register a new user'
);

-- 2 Probar que no se pueda registrar un usuario con un correo ya existente
PREPARE register_user_email_exists AS SELECT register_user('Client', 'juanperez', 'juanperez@example.com', 'newpassword');
SELECT throws_ok(
    'register_user_email_exists',
    'P0001',
    'Error: El correo juanperez@example.com ya está registrado.',
    'Should throw error when email is already registered'
);

-- 3 Probar que no se pueda registrar un usuario con campos nulos
PREPARE register_user_null_fields AS SELECT register_user(NULL, 'newuser', 'newuser@example.com', 'newpassword');
SELECT throws_ok(
    'register_user_null_fields',
    'Error: Todos los campos son obligatorios.',
    'Should throw error when role is NULL'
);

-- 4 Probar que no se pueda registrar un usuario con correo vacío
PREPARE register_user_empty_email AS SELECT register_user('Client', 'useremptyemail', '', 'password123');
SELECT throws_ok(
    'register_user_empty_email',
    'Error: Todos los campos son obligatorios.',
    'Should throw error when email is empty'
);

-- 5 Probar que se pueda registrar un administrador correctamente
SELECT is(
    (SELECT register_user('Admin', 'admin3', 'admin3@example.com', 'adminpassword3')),
    7, 
    'Should successfully register a new admin user'
);

-- 6 Probar que se pueda registrar un usuario con caracteres especiales en los campos
SELECT is(
    (SELECT register_user('Client', 'johnny$#', 'johnny$#@example.com', 'special@123')),
    8,
    'Should successfully register a user with special characters'
);
-- 7 Probar que se pueda registrar un usuario con un nombre de usuario o correo largo
SELECT is(
    (SELECT register_user('Admin', 'user_with_a_really_long_username_1234567890', 'longemailaddress@example.com', 'password123')),
    9,
    'Should successfully register a user with a long username and email'
);


-- 8 Probar que un usuario existente pueda iniciar sesión correctamente
SELECT is(
    (SELECT HashedPassword FROM login_user('Johnny@example.com')),
    'hashed_password_123',
    'Should return the correct hashed password for an existing user'
);

-- 9 Probar que un usuario inexistente no pueda iniciar sesión
PREPARE login_user_non_existent AS SELECT login_user('nonexistent@example.com');
SELECT throws_ok(
    'login_user_non_existent',
    'P0001',
    'Error: No existe un usuario con el correo nonexistent@example.com.',
    'Should throw error when email is not registered'
);

-- 10 Probar que un administrador pueda iniciar sesión correctamente
SELECT is(
    (SELECT Role FROM login_user('admin3@example.com')),
    'Admin',
    'Should return the correct role for an admin user'
);

-- 11 Probar que un usuario cliente pueda iniciar sesión correctamente
SELECT is(
    (SELECT Role FROM login_user('juanperez@example.com')),
    'Client',
    'Should return the correct role for a client user'
);

-- 12 Probar que se pueden obtener los detalles de un usuario
PREPARE get_user_details_valid AS SELECT * FROM get_user_details(1);
PREPARE get_user_details_valid_answ AS 
SELECT * FROM (VALUES
  (1::INT, 'Client'::VARCHAR, 'juanperez'::VARCHAR, 'juanperez@example.com'::VARCHAR)
) AS expected_result(User_ID, "Role", Username, Email);

SELECT results_eq(
    'get_user_details_valid',
    'get_user_details_valid_answ',
    'Should return user details for a valid user ID'
);

-- 13 Probar que no se puede obtener detalles de un usuario inexistente
PREPARE get_user_details_non_existent AS SELECT get_user_details(999);
SELECT throws_ok(
    'get_user_details_non_existent',
    'P0001',
    'Error: No existe un usuario con ID 999.',
    'Should throw error when user ID does not exist'
);

-- 14 Probar que no se puede obtener detalles con un valor NULL
PREPARE get_user_details_null AS SELECT get_user_details(NULL);
SELECT throws_ok(
    'get_user_details_null',
    'P0001',
    'Error: No existe un usuario con ID <NULL>.',
    'Should throw error when user ID is NULL'
);

-- 15 Probar que se puede actualizar el nombre de usuario sin cambiar otros campos
SELECT lives_ok(
    'SELECT update_user(1, ''newjuanperez'', NULL, NULL)',
    'Should update username successfully'
);
--16
SELECT is(
    (SELECT Username FROM Users WHERE User_ID = 1),
    'newjuanperez',
    'Should have updated username'
);

-- 17 Probar que se puede actualizar el correo sin cambiar otros campos
SELECT lives_ok(
    'SELECT update_user(2, NULL, ''newadmin1@example.com'', NULL)',
    'Should update email successfully'
);
--18
SELECT is(
    (SELECT Email FROM Users WHERE User_ID = 2),
    'newadmin1@example.com',
    'Should have updated email'
);

-- 19 Probar que se puede actualizar la contraseña sin cambiar otros campos
SELECT lives_ok(
    'SELECT update_user(3, NULL, NULL, ''newpassword123'')',
    'Should update password successfully'
);
--20
SELECT is(
    (SELECT "Password" FROM Users WHERE User_ID = 3),
    'newpassword123',
    'Should have updated password'
);

-- 21 Probar que no se pueda actualizar un usuario inexistente
PREPARE update_user_non_existent AS SELECT update_user(999, 'nonexistent', 'nonexistent@example.com', 'password');
SELECT throws_ok(
    'update_user_non_existent',
    'P0001'::text,
    'Error: No existe un usuario con ID 999.'::text,
    'Should throw error when user does not exist'
);

-- 22 Probar que no se pueda actualizar con un correo ya existente
PREPARE update_user_duplicate_email AS SELECT update_user(1, NULL, 'maria123@example.com', NULL);
SELECT throws_ok(
    'update_user_duplicate_email',
    'P0001'::text,
    'Error: El correo maria123@example.com ya está en uso por otro usuario.'::text,
    'Should throw error when email is already in use'
);

-- 23 Probar que actualizar con NULL en todos los campos no cause errores y mantenga los valores previos
SELECT lives_ok(
    'SELECT update_user(4, NULL, NULL, NULL)',
    'Should allow update with all NULLs'
);
--24
SELECT is(
    (SELECT Username FROM Users WHERE User_ID = 4),
    'admin2',
    'Should keep the same username'
);
--25
SELECT is(
    (SELECT Email FROM Users WHERE User_ID = 4),
    'admin2@example.com',
    'Should keep the same email'
);
--26
SELECT is(
    (SELECT "Password" FROM Users WHERE User_ID = 4),
    'adminpassword2',
    'Should keep the same password'
);
-- 27 Probar que no se realice actualización si los valores son los mismos
SELECT lives_ok(
    'SELECT update_user(1, ''juanperez'', ''juanperez@example.com'', ''password123'')',
    'Should not update user if values are the same'
);

-- 28 Probar que se puede eliminar un usuario existente
SELECT lives_ok(
    'SELECT delete_user(2)',
    'Should delete user successfully'
);
--29
SELECT is(
    (SELECT COUNT(*) FROM Users WHERE User_ID = 2),
    0::BIGINT,
    'User should no longer exist'
);

-- 30 Probar que no se puede eliminar un usuario inexistente
PREPARE delete_user_non_existent AS SELECT delete_user(999);
SELECT throws_ok(
    'delete_user_non_existent',
    'P0001'::text,
    'Error: No existe un usuario con ID 999.'::text,
    'Should throw error when user does not exist'
);
-- 31 Probar que al eliminar un usuario, su ID no esté disponible en la tabla de usuarios
SELECT lives_ok(
    'SELECT delete_user(5)',
    'Should delete user successfully'
);
--32
SELECT is(
    (SELECT COUNT(*) FROM Users WHERE User_ID = 5),
    0::BIGINT,
    'User should no longer exist after deletion'
);

-- 33 Probar que devuelve una tabla vacía si no hay usuarios
DELETE FROM Users;
SELECT results_eq(
    'SELECT * FROM get_all_users()',
    'SELECT NULL::INT, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR WHERE FALSE',
    'Should return an empty result when no users exist'
);

SELECT * FROM finish();   
ROLLBACK;
