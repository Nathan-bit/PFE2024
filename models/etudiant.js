const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with connection details
const sequelize = new Sequelize('data', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
});

// Define the model
const Etudiants = sequelize.define('etudiants', {  // <-- Make sure this matches the actual table name
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Nom: DataTypes.STRING,
    Prenom: {type: DataTypes.STRING  },
    Departement:{type: DataTypes.STRING},
    Email: DataTypes.STRING,
    Date: DataTypes.STRING,
    Sexe : DataTypes.STRING,


});
// After defining the model, synchronize it with the database
sequelize.sync();


module.exports = Etudiants;
