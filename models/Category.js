const Sequelize = require('sequelize');
const db = require('../config/config');

const Category = db.define('documents', {
    id_documents: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
    },
    id_categories: {
        type: Sequelize.INTEGER
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
}, {
    timestamps: false,
    tableName: 'documents'
})

module.exports = Category