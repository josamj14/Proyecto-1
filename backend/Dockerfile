# Usar la imagen oficial de Node.js
FROM node:16

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar el package.json y el package-lock.json
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install
RUN npm install express-jwt
RUN npm install ---save-dev nodemon
RUN npm install jest
RUN npm install mongodb
RUN npm install redis
RUN npm install supertest

# Copiar el resto de los archivos del proyecto
COPY . .

# Exponer el puerto 3000
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "app.js"]