const Sequelize = require('sequelize');
const db = require('../config/config');

const Faq = db.define('faq', {
    question: {
        type: Sequelize.STRING
    },
    answer: {
        type: Sequelize.STRING
    },
}, {
    timestamps: false,
    tableName: 'faq'
})

module.exports = Faq