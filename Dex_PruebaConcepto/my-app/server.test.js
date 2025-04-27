// tests/app.test.js
const request = require("supertest");
const app = require("./server");
const jwt = require("jsonwebtoken");

describe("Pruebas unitarias para el servidor Express", () => {
  it("Debería devolver un mensaje en la ruta raíz", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Servidor con JWT y Dex en Docker");
  });

  it("Debería redirigir a Dex en la ruta /login", async () => {
    const response = await request(app).get("/login");
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain("auth?client_id=");
  });

  it("Debería manejar un error si no se recibe un código en /callback", async () => {
    const response = await request(app).get("/callback");
    expect(response.status).toBe(400);
    expect(response.text).toBe("Código de autorización no recibido");
  });

  it("Debería devolver un error 401 si no se proporciona un token en /protected", async () => {
    const response = await request(app).get("/protected");
    expect(response.status).toBe(401);
    expect(response.text).toBe("Acceso denegado");
  });

  it("Debería permitir el acceso con un token válido en /protected", async () => {
    const token = jwt.sign({ user: "test" }, process.env.CLIENT_SECRET, { expiresIn: "1h" });
    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Acceso permitido");
  });

  it("Debería rechazar un token expirado en /protected", async () => {
    const token = jwt.sign({ user: "test" }, process.env.CLIENT_SECRET, { expiresIn: "-1h" }); // Token expirado
    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(401);
    expect(response.text).toBe("Token expirado"); // Ahora debería pasar
  });
});