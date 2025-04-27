
CREATE SCHEMA test_reservation;
SET search_path TO test_reservation, public;

BEGIN;

SELECT plan(24);

-- 1 Probar que se pueda crear una reserva correctamente
SELECT is(
    (SELECT create_reservation(1, '2025-04-25 12:00:00', 4, 1)),
    3,
    'Should successfully create a reservation with valid data'
);
-- 2 Crear una reserva con un usuario inexistente
PREPARE create_reservation_invalid_user AS SELECT create_reservation(9999, '2025-04-25 12:00:00', 4, 1);
SELECT throws_ok(
    'create_reservation_invalid_user',
    'P0001',
    'Error: Usuario con ID 9999 no existe.',
    'Should throw error when user ID does not exist'
);
-- 3 Crear una reserva con capacidad inexsistente
PREPARE create_reservation_invalid_table AS SELECT create_reservation(1, '2025-04-25 12:00:00', 999, 1);
SELECT throws_ok(
    'create_reservation_invalid_table',
    'P0001',
    'Error: No hay mesas disponibles.',
    'Should throw error when there is no table'
);
-- 4 Crear una reserva con un id invalido
PREPARE create_reservation_invalid_restaurant AS SELECT create_reservation(1, '2025-04-25 12:00:00', 1, 999);
SELECT throws_ok(
    'create_reservation_invalid_restaurant',
    'P0001',
    'Error: Restaurante con ID 999 no existe.',
    'Should throw error when restaurant ID does not exist'
);
-- 5 Crear una reserva con una fecha y hora pasada
PREPARE create_reservation_old_date AS SELECT create_reservation(1, '2023-04-25 12:00:00', 1, 1);
SELECT throws_ok(
    'create_reservation_old_date',
    'P0001',
    'Error: La fecha y hora de la reserva deben ser posteriores a la fecha y hora actual.',
    'Should throw error when reservation date is in the past'
);
-- 6 Crear una reserva con campos nulos
PREPARE create_reservation_null_fields AS SELECT create_reservation(NULL, NULL, NULL, NULL);
SELECT throws_ok(
    'create_reservation_null_fields',
    'P0001',
    'Error: Los campos no pueden ser NULL.',
    'Should throw error when required fields are NULL'
);

-- 7 Crear una reserva con una fecha y hora inválida
PREPARE create_reservation_invalid_date AS SELECT create_reservation(1, NULL, 1, 1);
SELECT throws_ok(
    'create_reservation_invalid_date',
    'Error: Los campos no pueden ser NULL.',
    'Should throw error when any required field is NULL'
);
-- 8 Eliminar una reserva existente
SELECT is(
    (SELECT delete_reservation(2)),
    2,
    'Should successfully delete a reservation with a valid ID'
);

-- 9 Eliminar una reserva inexistente
PREPARE delete_reservation_non_existent AS SELECT delete_reservation(9999);
SELECT throws_ok(
    'delete_reservation_non_existent',
    'P0001',
    'Error: Reserva con ID 9999 no existe.',
    'Should throw error when trying to delete a non-existent reservation'
);

-- 10 Obtener detalles de una reserva existente
PREPARE get_reservation_by_id_valid AS SELECT * FROM get_reservation_by_id(1);
PREPARE get_reservation_by_id_valid_answ AS 
SELECT * FROM (VALUES 
  (1::INT, 1::INT, '2025-03-17 19:00:00'::TIMESTAMP, 4::INT, 1::INT, 1::INT)
) AS expected_result(Reservation_ID, User_ID, "Datetime", Capacity, Table_ID, Restaurant_ID);

SELECT results_eq(
    'get_reservation_by_id_valid', -- Actual function call
    'get_reservation_by_id_valid_answ', -- Expected result
    'Should return the correct reservation details for a valid reservation ID'
);

-- 11 Obtener detalles de una reserva inexistente
SELECT is(
    (SELECT COUNT(*) FROM get_reservation_by_id(999)), 
    0::bigint, 
    'Should return no result for a non existent reservation ID'
);


-- 12 Obtener detalles de una reserva con un ID nulo
SELECT is(
    (SELECT COUNT(*) FROM get_reservation_by_id(NULL)), 
    0::bigint, 
    'Should return no result for a null reservation ID'
);

-- 13 Actualizar una reserva existente
SELECT is(
    (SELECT update_reservation(1, 1, '2025-03-26 14:00:00', 4, 2, 1)),
    1,
    'Should successfully update an existing reservation'
);

-- 14 Actualizar una reserva con campos nulos
PREPARE update_reservation_null_user AS SELECT update_reservation(1, NULL, '2025-03-26 14:00:00', NULL, 2, 1);
SELECT throws_ok(
    'update_reservation_null_user',
    'Error: Usuario con ID <NULL> no existe.',
    'Should throw error when trying to update with a null user ID'
);

-- 15 Actualizar una reserva con campos inválidos
PREPARE update_reservation_invalid_user AS SELECT update_reservation(1, 9999, '2025-03-26 14:00:00', 4, 2, 1);
SELECT throws_ok(
    'update_reservation_invalid_user',
    'P0001',
    'Error: Usuario con ID 9999 no existe.',
    'Should throw error when trying to update with a non-existent user ID'
);

-- 16 Actualizar una reserva inexistente
PREPARE update_reservation_non_existent AS SELECT update_reservation(9999, 1, '2025-03-26 14:00:00', 4, 2, 1);
SELECT throws_ok(
    'update_reservation_non_existent',
    'P0001',
    'Error: Reserva con ID 9999 no existe.',
    'Should throw error when trying to update a non-existent reservation'
);

-- 17 Obtener todas las reservas 
SELECT is(
    (SELECT count(*) FROM get_all_reservations()),
    2::bigint,
    'Should return the correct number of all reservations'
);

-- 18 Obtener todas las reservas de un restaurante específico
PREPARE test_restaurant_with_reservations AS 
SELECT * FROM get_reservations_by_restaurant(1);

PREPARE test_restaurant_with_reservations_answ AS 
SELECT * FROM (VALUES 
  (3::INT, 1::INT, '2025-04-25 12:00:00'::TIMESTAMP, 4::INT, 1::INT, 1::INT),
  (1::INT, 1::INT, '2025-03-26 14:00:00'::TIMESTAMP, 4::INT, 2::INT, 1::INT)
) AS expected_result(Reservation_ID, User_ID, "Datetime", Capacity, Table_ID, Restaurant_ID);

SELECT results_eq(
    'test_restaurant_with_reservations',
    'test_restaurant_with_reservations_answ',  
    'Debe devolver la reserva con ID 1 para el restaurante The Silicon Byte'
);


-- 19 Obtener todas las reservas de un restaurante inexistente
PREPARE test_invalid_restaurant AS SELECT get_reservations_by_restaurant(99);
SELECT throws_ok(
    'test_invalid_restaurant',
    'Error: Restaurante con ID 99 no existe',
    'Debe lanzar un error si el restaurante no existe'
);

--20 Obtener respuesta vacia si el restaurante existe pero no tiene reservas 
PREPARE test_restaurant_without_reservations AS SELECT get_reservations_by_restaurant(2);
SELECT results_eq(
    'test_restaurant_without_reservations',
    ARRAY[]::INT[],  
    'Debe devolver un conjunto vacío si el restaurante existe pero no tiene reservas'
);

-- 21 Probar que devuelve reservas para un restaurante en una fecha específica
PREPARE test_restaurant_with_reservations_date AS 
SELECT * FROM get_reservations_by_restaurant_and_date(1, '2025-03-26');
PREPARE test_restaurant_with_reservations_date_answ AS 
SELECT * FROM (VALUES 
  (1::INT, 1::INT, '2025-03-26 14:00:00'::TIMESTAMP, 4::INT, 2::INT, 1::INT)
) AS expected_result(Reservation_ID, User_ID, "Datetime", Capacity, Table_ID, Restaurant_ID);

SELECT results_eq(
    'test_restaurant_with_reservations_date', 
    'test_restaurant_with_reservations_date_answ', 
    'Debe devolver la reserva con ID 1 para The Silicon Byte el 17 de marzo de 2025'
);

-- 22 Probar que retorna vacío si no hay reservas para la fecha dada
PREPARE test_restaurant_without_reservations_date AS SELECT get_reservations_by_restaurant_and_date(1, '2025-03-18');
SELECT results_eq(
    'test_restaurant_without_reservations_date',
    ARRAY[]::INT[],  
    'Debe devolver un conjunto vacío si el restaurante tiene reservas pero no en esa fecha'
);

-- 23 Probar que lanza un error si el restaurante no existe
PREPARE test_invalid_restaurant_date AS SELECT get_reservations_by_restaurant_and_date(99, '2025-03-17');
SELECT throws_ok(
    'test_invalid_restaurant_date',
    'Error: Restaurante con ID 99 no existe',
    'Debe lanzar un error si el restaurante no existe'
);

-- 24 Probar que lanza un error si la fecha es NULL
PREPARE test_null_date AS SELECT get_reservations_by_restaurant_and_date(1, NULL);
SELECT throws_ok(
    'test_null_date',
    'Error: La fecha no es valida',
    'Debe lanzar un error si la fecha es NULL'
);


SELECT * FROM finish();   
ROLLBACK;