const Sequelize = require('sequelize');
const db = require('../config/config');

const Version = db.define('version', {
    id_versions: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
    },
    id_contents: {
        type: Sequelize.INTEGER
    },
    id_user: {
        type: Sequelize.INTEGER
    },
    file: {
        type: Sequelize.STRING,
    },
}, {
    tableName: 'Versions'
})

module.exports = Version