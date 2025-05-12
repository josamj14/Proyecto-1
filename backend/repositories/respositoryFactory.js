require('dotenv').config();
const dbType = process.env.DB_TYPE || 'postgres';

console.log("🔍 DB_TYPE leída al inicio:", dbType); // Verificar el tipo de DB al inicio

function getRepository(entity) {
    console.log("📌 Solicitando repositorio para la entidad:", entity); // Verificar el nombre de la entidad

    const repositories = {
        postgres: {
            user: require('./postgres/userRepository'),
            order: require('./postgres/orderRepository'),
            menu: require('./postgres/menuRepository'),
            restaurant: require('./postgres/restaurantRepository'),
            reservation: require('./postgres/reservationRepository')
        },
        mongo: {
            user: require('./mongo/userRepository'),
            order: require('./mongo/orderRepository'),
            menu: require('./mongo/menuRepository'),
            restaurant: require('./mongo/restaurantRepository'),
            reservation: require('./mongo/reservationRepository'),
        }
    };

    const repo = repositories[dbType][entity];

    console.log("🔎 Repositorio encontrado:", repo); // Verificar si encontró el repositorio
    if (!repo) {
        console.error(`❌ No se encontró el repositorio para la entidad ${entity} en ${dbType}`);
    }

    return repo;
}

module.exports = { getRepository };
