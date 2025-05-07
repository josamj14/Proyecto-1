-- Crear un esquema de prueba y configurar el search_path
CREATE SCHEMA test_orders;
SET search_path TO test_orders, public;

BEGIN;

-- Definir el número total de pruebas
SELECT plan(14);

-- 1. Probar que se pueda crear una orden correctamente
SELECT isnt(
    (SELECT create_order(1, '2025-03-24 12:00:00', 1)),
    -1,
    'Debe permitir crear una orden con datos válidos'
);

-- 2. Intentar crear una orden con un usuario inexistente
PREPARE create_order_invalid_user AS SELECT create_order(9999, '2025-03-24 12:00:00', 1);
SELECT throws_ok(
    'create_order_invalid_user',
    'P0001',
    'Error: Usuario con ID 9999 no existe.',
    'Debe lanzar error cuando el usuario no existe'
);

-- 3. Intentar crear una orden con un restaurante inexistente
PREPARE create_order_invalid_restaurant AS SELECT create_order(1, '2025-03-24 12:00:00', 9999);
SELECT throws_ok(
    'create_order_invalid_restaurant',
    'P0001',
    'Error: Restaurante con ID 9999 no existe.',
    'Debe lanzar error cuando el restaurante no existe'
);

-- 4. Intentar eliminar una orden existente
SELECT is(
    (SELECT delete_order(1)),
    1,
    'Debe eliminar una orden existente correctamente'
);

-- 5. Intentar eliminar una orden inexistente
PREPARE delete_order_non_existent AS SELECT delete_order(9999);
SELECT throws_ok(
    'delete_order_non_existent',
    'P0001',
    'Error: Orden con ID 9999 no existe.',
    'Debe lanzar error cuando intenta eliminar una orden inexistente'
);

-- 6. Obtener una orden existente
PREPARE get_order_valid AS SELECT * FROM get_order_by_id(2);
SELECT isnt_empty(
    'get_order_valid',
    'Debe retornar detalles de una orden existente'
);

-- 7. Obtener una orden inexistente
SELECT is(
    (SELECT COUNT(*) FROM get_order_by_id(9999)),
    0::bigint,
    'Debe devolver 0 resultados para una orden inexistente'
);

-- 8. Intentar actualizar una orden existente
SELECT is(
    (SELECT update_order(2, 1, '2025-03-24 15:00:00', 1)),
    2,
    'Debe actualizar una orden existente correctamente'
);

-- 9. Intentar actualizar una orden inexistente
PREPARE update_order_non_existent AS SELECT update_order(9999, 1, '2025-03-24 15:00:00', 1);
SELECT throws_ok(
    'update_order_non_existent',
    'P0001',
    'Error: Orden con ID 9999 no existe.',
    'Debe lanzar error cuando intenta actualizar una orden inexistente'
);

-- 10. Intentar actualizar una orden con un usuario inexistente
PREPARE update_order_invalid_user AS SELECT update_order(2, 9999, '2025-03-24 15:00:00', 1);
SELECT throws_ok(
    'update_order_invalid_user',
    'P0001',
    'Error: Usuario con ID 9999 no existe.',
    'Debe lanzar error cuando el usuario no existe en la actualización'
);

-- 11. Intentar actualizar una orden con un restaurante inexistente
PREPARE update_order_invalid_restaurant AS SELECT update_order(2, 1, '2025-03-24 15:00:00', 9999);
SELECT throws_ok(
    'update_order_invalid_restaurant',
    'P0001',
    'Error: Restaurante con ID 9999 no existe.',
    'Debe lanzar error cuando el restaurante no existe en la actualización'
);

-- 12. Obtener todas las órdenes
SELECT isnt_empty(
    'SELECT * FROM get_all_orders()',
    'Debe devolver al menos una orden'
);

-- 13. Intentar obtener órdenes cuando no hay registros
DELETE FROM "Order";
SELECT is(
    (SELECT COUNT(*) FROM get_all_orders()),
    0::bigint,
    'Debe devolver 0 resultados cuando no hay órdenes'
);

-- 14. Probar que no permite insertar valores nulos
PREPARE create_order_null_fields AS SELECT create_order(NULL, NULL, NULL);
SELECT throws_ok(
    'create_order_null_fields',
    'P0001',
    'Error: Usuario con ID <NULL> no existe.',
    'Debe lanzar error cuando se intenta crear una orden con valores nulos'
);

-- Finalizar pruebas
SELECT * FROM finish();

ROLLBACK;