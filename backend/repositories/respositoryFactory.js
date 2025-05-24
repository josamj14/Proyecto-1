require('dotenv').config();
const dbType = process.env.DB_TYPE || 'postgres';

function getRepository(entity) {
    const repositories = {
        postgres: {
            user: require('./postgres/userRepository'),
            order: require('./postgres/orderRepository'),
            menu: require('./postgres/menuRepository'),
            restaurant: require('./postgres/restaurantRepository'),
            reservation: require('./postgres/reservationRepository'),
            product: require('./postgres/productRepository'),
        },
        mongo: {
            user: require('./mongo/userRepository'),
            order: require('./mongo/orderRepository'),
            menu: require('./mongo/menuRepository'),
            restaurant: require('./mongo/restaurantRepository'),
            reservation: require('./mongo/reservationRepository'),
            product: require('./mongo/productRepository')
        }
    };

    const repo = repositories[dbType][entity];

    console.log(`Se realizara la consulta para la entidad ${entity} en ${dbType}`); // Verificar si encontró el repositorio
    if (!repo) {
        console.error(` No se encontró el repositorio para la entidad ${entity} en ${dbType}`);
    }

    return repo;
}

module.exports = { getRepository };
