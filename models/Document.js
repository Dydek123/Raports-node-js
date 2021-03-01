const Sequelize = require('sequelize');
const db = require('../config/config');

const Document = db.define('document', {
    category: {
        type: Sequelize.STRING,
    },
    title: {
        type: Sequelize.STRING
    },
    document: {
        type: Sequelize.STRING
    },
    is_public: {
        type: Sequelize.BOOLEAN
    },
}, {
    timestamps: false,
    tableName: 'document'
})

module.exports = Document