CREATE EXTENSION IF NOT EXISTS pgtap;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

CREATE SCHEMA test_menu;
SET search_path TO test_menu, public;

BEGIN;

SELECT plan(9);

-- 1 Probar que se pueda crear un menú correctamente
SELECT is(
    (SELECT create_menu('Kids Menu')),
    5,
    'Should successfully create a new menu and return the Menu_ID'
);

-- 2 Probar que no se pueda crear un menú con nombre nulo
PREPARE create_menu_null AS 
SELECT create_menu(NULL);
SELECT throws_ok(
    'create_menu_null',
    'Error: Todos los campos son obligatorios.',
    'Should throw error when menu name is NULL'
);

-- 3 Probar que se pueda obtener un menú por ID (Regular Menu)
PREPARE get_menu_by_id_valid AS SELECT * FROM get_menu_by_id(1);
PREPARE get_menu_by_id_valid_answ AS 
SELECT * FROM (VALUES
  (1::INT, 'Regular Menu'::VARCHAR)
) AS expected_result(Menu_ID, "Name");

SELECT results_eq(
    'get_menu_by_id_valid',
    'get_menu_by_id_valid_answ',
    'Should return the correct menu details for Regular Menu'
);

-- 4 Probar que no se pueda obtener un menú con un ID inexistente
SELECT lives_ok(
    'SELECT get_menu_by_id(999)',
    'Should not throw an error when trying to GET a non-existent menu'
);

-- 5 Probar que se pueda actualizar un menú correctamente (Executive Menu)
SELECT is(
    (SELECT update_menu(2, 'Premium Executive Menu')),
    2,
    'Should successfully update the menu details for Executive Menu'
);

-- 6 Probar que no se pueda actualizar un menú con un ID inexistente
SELECT throws_ok(
    'SELECT update_menu(999, ''Non-existent Menu'')',
    'Error: Menu con ID 999 no existe.',
    'Should throw error when trying to update a non-existent menu'
);

-- 7 Probar que se pueda eliminar un menú correctamente (Dessert Menu)
SELECT is(
    (SELECT delete_menu(3)),
    3,
    'Should successfully delete the menu and return the deleted rows for Dessert Menu'
);

-- 8 Probar que no se pueda eliminar un menú con un ID inexistente
SELECT lives_ok(
    'SELECT delete_menu(999)',
    'Should not throw an error when trying to delete a non-existent menu'
);

-- 9 Probar que se puedan obtener todos los menús
PREPARE get_all_menus AS SELECT * FROM get_all_menus();

PREPARE get_all_menus_answ AS
SELECT * FROM (VALUES
  (1::INT, 'Regular Menu'::VARCHAR),
  (4::INT, 'Breakfast Menu'::VARCHAR),
  (5::INT, 'Kids Menu'::VARCHAR),
  (2::INT, 'Premium Executive Menu'::VARCHAR)
) AS expected_result(Menu_ID, "Name");

SELECT results_eq(
    'get_all_menus',
    'get_all_menus_answ',
    'Should return all menus'
);

SELECT * FROM finish();   
ROLLBACK;
