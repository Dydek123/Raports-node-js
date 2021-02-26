const Sequelize = require('sequelize');
const db = require('../config/config');

const Comment = db.define('comment', {
    id_comments: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    comment: {
        type: Sequelize.STRING
    },
}, {
    timestamps: false,
    tableName: 'comments'
})

module.exports = Comment