const Sequelize = require('sequelize');
const db = require('../config/config');

const Logs = db.define('log', {
    email: {
        type: Sequelize.STRING,
    },
    browser: {
        type: Sequelize.STRING
    },
    device: {
        type: Sequelize.STRING
    },
}, {
    tableName: 'logs'
})

module.exports = Logs;