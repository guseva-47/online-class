const Sequelize = require("sequelize");
const initModels = require("./models/init-models");

// node_modules\.bin\sequelize-auto -h localhost -d my_class_2 -u postgres -x example -p 5433 --dialect postgres --sg --cm p
const sequelizeDB = new Sequelize("my_class", "postgres", "example", {
  host: "localhost",
  dialect: "postgres",
  port: "5433",
});

const models = initModels(sequelizeDB);

module.exports = models;