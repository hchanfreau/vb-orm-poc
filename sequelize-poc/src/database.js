const { Sequelize } = require('sequelize');

// Usamos SQLite en un archivo para poder inspeccionarlo si es necesario.
// Para una base de datos en memoria pura, usa: new Sequelize('sqlite::memory:');
const sequelize = new Sequelize('sqlite:database.sqlite', {
  // Desactiva el logging de SQL para no ensuciar la salida de los ejemplos.
  // Puedes activarlo a 'console.log' para ver las consultas que Sequelize ejecuta.
  logging: false,
});

module.exports = sequelize;
