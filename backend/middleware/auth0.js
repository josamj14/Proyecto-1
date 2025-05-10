const { expressjwt: jwt } = require('express-jwt');  // Correct import for version 6.x+
const jwksRsa = require('jwks-rsa');
require('dotenv').config();  // Load the .env file

// Set up the Auth0 middleware
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`, // Using the domain from .env
  }),
  audience: process.env.AUTH0_AUDIENCE,  // Using the Audience from .env
  issuer: `https://${process.env.AUTH0_DOMAIN}/`, // Using the domain from .env
  algorithms: ['RS256'],
});

module.exports = checkJwt;
