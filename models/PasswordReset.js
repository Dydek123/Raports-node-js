const Sequelize = require('sequelize');
const db = require('../config/config');

const PasswordReset = db.define('password_reset', {
    id_reset: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
    },
    email: {
        type: Sequelize.INTEGER
    },
    key: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'wait',
    },
    expDate: {
        type: Sequelize.TIME,
    }
}, {
    timestamps: false,
    tableName: 'password_reset'
})

module.exports = PasswordReset