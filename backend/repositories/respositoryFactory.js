require('dotenv').config();
const dbType = process.env.DB_TYPE || 'postgres';

function getRepository(entity){
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
    return repositories[dbType][entity];
}

module.exports = { getRepository };