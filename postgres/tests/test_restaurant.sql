
CREATE SCHEMA test_restaurant;
SET search_path TO test_restaurant, public;

BEGIN;

SELECT plan(12);

-- 1 Probar que se pueda crear un restaurante correctamente
SELECT is(
    (SELECT create_restaurant('The Java Lounge', '105 Java Road, Code City, Silicon Valley')),
    6, 
    'Should successfully create a new restaurant and return the Restaurant_ID'
);

-- 2 Probar que no se pueda crear un restaurante con campos nulos
PREPARE create_restaurant_null_fields AS 
SELECT create_restaurant(NULL, '101 Tech Lane, Code City, Silicon Valley');
SELECT throws_ok(
    'create_restaurant_null_fields',
    'Error: Todos los campos son obligatorios.',
    'Should throw error when restaurant name is NULL'
);

-- 3 Probar que no se pueda crear un restaurante con nombre vacío
PREPARE create_restaurant_empty_name AS 
SELECT create_restaurant('', '101 Tech Lane, Code City, Silicon Valley');
SELECT throws_ok(
    'create_restaurant_empty_name',
    'Error: Todos los campos son obligatorios.',
    'Should throw error when restaurant name is empty'
);

-- 4 Probar que no se pueda crear un restaurante con dirección vacía
PREPARE create_restaurant_empty_address AS 
SELECT create_restaurant('The Silicon Byte', '');
SELECT throws_ok(
    'create_restaurant_empty_address',
    'Error: Todos los campos son obligatorios.',
    'Should throw error when restaurant address is empty'
);

-- 5 Probar que se pueda obtener un restaurante por ID (The Silicon Byte)
PREPARE get_restaurant_by_id_valid AS SELECT * FROM get_restaurant_by_id(1);
PREPARE get_restaurant_by_id_valid_answ AS 
SELECT * FROM (VALUES
  (1::INT, 'The Silicon Byte'::VARCHAR, '101 Tech Lane, Code City, Silicon Valley'::TEXT)
) AS expected_result(restaurant_id, restaurant_name, restaurant_address);

SELECT results_eq(
    'get_restaurant_by_id_valid',
    'get_restaurant_by_id_valid_answ',
    'Should return the correct restaurant details for The Silicon Byte'
);

-- 6 Probar que se pueda obtener un restaurante con NULLL ID
PREPARE get_null_restaurant AS SELECT get_restaurant_by_id(NULL);
SELECT throws_ok(
    'get_null_restaurant',
    'P0001',
    'Error: El ID del restaurante no puede ser nulo o vacío.',
    'Should throw error when user ID is NULL'
);

-- 7 Probar que no se pueda obtener un restaurante con un ID inexistente
SELECT lives_ok(
    'SELECT get_restaurant_by_id(999)',
    'Should not throw an error when trying to GET a non-existent restaurant'
);

-- 8 Probar que se pueda actualizar un restaurante correctamente (The Python Pit)
SELECT is(
    (SELECT update_restaurant(4, 'The Python Pit Updated', '0x0 Python Blvd, Updated City, Byte Town')),
    4, 
    'Should successfully update the restaurant details for The Python Pit'
);

-- 9 Probar que no se pueda actualizar un restaurante con campos nulos (The Python Pit)
PREPARE update_restaurant_null_fields AS 
SELECT update_restaurant(4, NULL, '0x0 Python Blvd, Updated City, Byte Town');
SELECT throws_ok(
    'update_restaurant_null_fields',
    'Error: Todos los campos son obligatorios.',
    'Should throw error when restaurant name is NULL'
);

-- 10 Probar que se pueda eliminar un restaurante correctamente (Cache & Cookies)
SELECT is(
    (SELECT delete_restaurant(3)),
    3, 
    'Should successfully delete the restaurant and return the deleted rows for Cache & Cookies'
);

-- 11 Probar que no se pueda eliminar un restaurante con un ID inexistente
SELECT lives_ok(
    'SELECT delete_restaurant(999)',
    'Should not throw an error when trying to delete a non-existent restaurant'
);

-- 12 Probar que se puedan obtener todos los restaurantes
PREPARE get_all_restaurants AS SELECT * FROM get_all_restaurants();

PREPARE get_all_restaurants_answ AS
SELECT * FROM (VALUES
  (1::INT, 'The Silicon Byte'::VARCHAR, '101 Tech Lane, Code City, Silicon Valley'::TEXT),
  (2::INT, 'Code & Coffee'::VARCHAR, '1 GitHub Way, Hackertown, Git Branch'::TEXT),
  (5::INT, 'Java Beans Cafe'::VARCHAR, '102 Java Lane, OOP Park, Code Island'::TEXT),
  (6::INT,'The Java Lounge'::VARCHAR,'105 Java Road, Code City, Silicon Valley'::TEXT),
  (4::INT,'The Python Pit Updated'::VARCHAR,'0x0 Python Blvd, Updated City, Byte Town')
)AS expected_result(restaurant_id, restaurant_name, restaurant_address);

SELECT results_eq(
    'get_all_restaurants',
    'get_all_restaurants_answ',
    'Should return all restaurants'
);

SELECT * FROM finish();   
ROLLBACK;