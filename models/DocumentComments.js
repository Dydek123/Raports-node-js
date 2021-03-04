const Sequelize = require('sequelize');
const db = require('../config/config');

const DocumentComments = db.define('documentcomment', {
    id_comments: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
    },
    name: {
        type: Sequelize.STRING
    },
    comment: {
        type: Sequelize.STRING
    },
    title: {
        type: Sequelize.STRING
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    edited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
}, {
    createdAt: false,
    tableName: 'document_comments'
})

module.exports = DocumentComments