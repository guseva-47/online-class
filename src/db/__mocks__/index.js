const SequelizeMock = require("sequelize-mock");
const initModels = require("../models/init-models");


const sequelizeDB = new SequelizeMock();

const models = initModels(sequelizeDB);

module.exports = models;