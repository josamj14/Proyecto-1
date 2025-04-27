const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Middleware para verificar el JWT y el rol

function verifyToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    console.log("No token provided");
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verificar el token
    req.user = decoded; // Guardar la información decodificada del usuario en la solicitud

    // Verificar el rol en el token
    console.log("Token decoded:", req.user);

    // Si la ruta requiere un rol específico, lo validamos aquí
    if (req.role) {
      // Verificar el rol
      console.log("Role required:", req.role);
      console.log("User role from token:", req.user.role);

      // Convertir el rol a minúsculas para evitar problemas con la capitalización
      const userRole = req.user.role.toLowerCase();
      const requiredRole = req.role.toLowerCase();

      // Si la ruta requiere un rol específico, validamos el rol
      if (userRole !== requiredRole) {
        console.log("User does not have the required role");
        return res.status(403).json({ message: 'Forbidden. You do not have the required role.' });
      }
    }

    next();
  } catch (err) {
    console.log("Invalid token", err);
    res.status(403).json({ message: 'Invalid token' });
  }
}


module.exports = verifyToken;
