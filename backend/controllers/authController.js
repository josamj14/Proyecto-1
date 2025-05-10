// controllers/authController.js
const { AuthenticationClient } = require('auth0');
require('dotenv').config();  // Cargar el .env

const auth0 = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN,        // Tomando el dominio desde .env
  clientId: process.env.AUTH0_CLIENT_ID,   // Tomando el Client ID desde .env
  clientSecret: process.env.AUTH0_CLIENT_SECRET, // Tomando el Client Secret desde .env
});

// Ruta de login (para obtener el token JWT)
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const response = await auth0.oauth.passwordGrant({
      username: email,
      password: password,
      realm: 'Username-Password-Authentication', // O el nombre del Connection
      scope: 'openid profile',
    });

    // Devuelve el token JWT
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        access_token: response.access_token,
        expires_in: response.expires_in,
        token_type: response.token_type,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginUser };
