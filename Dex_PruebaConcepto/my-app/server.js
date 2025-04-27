require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const qs = require("qs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const DEX_URL = process.env.DEX_URL;
const REDIRECT_URI = process.env.REDIRECT_URI;

//Verificar que si hay variables de entorno
// APP.JS
if (!CLIENT_ID || !CLIENT_SECRET || !DEX_URL) {
  console.error("Faltan variables de entorno requeridas.");
  process.exit(1);
}

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Servidor con JWT y Dex en Docker");
});

//DESDE ROUTES>USER_ROUTES
app.get("/login", (req, res) => {
  // verificar que el user y pass match
  res.redirect(
    `${DEX_URL}/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid`
  );
});

//MIDDLEWARE
app.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Código de autorización no recibido");

  try {
    console.log("Enviando solicitud de token a Dex...");
    console.log("Mi code is:", code);

    const data = qs.stringify({
      grant_type: "authorization_code",
      code, 
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    console.log("Data to send:", data);

    const config = {
      method: "post",
      url: `http://dex:5556/dex/token`,  // Ensure the correct Dex container name or IP
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    console.log("Config:", config);

    const response = await axios.request(config);
    console.log("Token Response:", response.data);

    const token = response.data.id_token;
    const decoded = jwt.decode(token);
    console.log("TOKEN DECODED:", decoded);

    res.json({ message: "Login exitoso", user: decoded, token });
  } catch (error) {
    console.error("Error en autenticación con Dex:", error.response?.data || error.message);
    console.error("Error details:", error);
    res.status(500).send("Error en autenticación con Dex");
  }
});

// MIDDLEWARE ESTO PRACTICAMENTE YA ESTA 
app.get("/protected", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Acceso denegado");

  try {
    const decoded = jwt.verify(token, CLIENT_SECRET);
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).send("Token expirado");
    }
    res.json({ message: "Acceso permitido", user: decoded });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send("Token expirado");
    }
    res.status(401).send("Token inválido");
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

module.exports = app;