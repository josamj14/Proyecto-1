const jwt = require('jsonwebtoken');
const { loginUserService } = require('../models/userModel.js'); // Asegúrate de que esta ruta sea correcta

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Llamar al procedimiento 'login_user' en la base de datos
    const result = await loginUserService(email);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0]; // Obtenemos el usuario desde el resultado

    // Comparar la contraseña proporcionada con la almacenada en la base de datos
    if (password !== user.hashedpassword) { // Aquí, la contraseña debe coincidir exactamente
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generar el JWT con el rol del usuario incluido
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        username: user.username, 
        email: user.email,
        role: user.role  // Incluir el rol en el JWT
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Devolver el token en la respuesta
    return res.status(200).json({
      message: 'Login successful',
      token: token,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loginUser,
};
