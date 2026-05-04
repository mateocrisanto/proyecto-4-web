const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readLine = require('readline');

dotenv.config();

require('./esquema_products');
require('./esquema_cart');
require('./esquema_auth');
require('./esquema_services');
require('./esquema_sitecontent');

const dbURI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1/isp';

if (process.platform === 'win32') {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}

mongoose
  .connect(dbURI, {
    family: 4,
    serverSelectionTimeoutMS: 5000,
  })
  .catch((err) => {
    console.error('No se pudo conectar a MongoDB.');
    console.error(
      'Revisa MONGODB_URI, el acceso de red en Atlas y si tu red permite resolver direcciones mongodb+srv.'
    );
    console.error(err.message);
    process.exit(1);
  });

mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado a ' + dbURI);
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose error de conexion: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado');
});

const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close(() => {
    console.log('Mongoose desconectado por: ' + msg);
    callback();
  });
};

process.on('SIGINT', () => {
  gracefulShutdown('aplicacion terminada (Windows: Ctrl+C)', () => {
    process.exit(0);
  });
});

process.once('SIGUSR2', () => {
  gracefulShutdown('aplicacion reiniciada (nodemon)', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGTERM', () => {
  gracefulShutdown('aplicacion reiniciada (Heroku)', () => {
    process.exit(0);
  });
});
