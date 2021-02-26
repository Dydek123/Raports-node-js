const Sequelize = require('sequelize');
const db = require('../config/config');

const User = db.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
}, {
    timestamps: false,
    tableName: 'users'
})

module.exports = User