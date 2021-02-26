const Sequelize = require('sequelize');
const db = require('../config/config');

const User = db.define('user', {
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    password: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    },
    surname: {
        type: Sequelize.STRING
    },
    id_role: {
        type: Sequelize.INTEGER,
        defaultValue: 1.
    }
}, {
    timestamps: false,
    tableName: 'users'
})

module.exports = User