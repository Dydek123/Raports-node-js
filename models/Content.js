const Sequelize = require('sequelize');
const db = require('../config/config');

const Content = db.define('content', {
    id_contents: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
    },
    id_document: {
        type: Sequelize.INTEGER
    },
    is_public: {
        type: Sequelize.BOOLEAN,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
}, {
    timestamps: false,
    tableName: 'Contents'
})

module.exports = Content