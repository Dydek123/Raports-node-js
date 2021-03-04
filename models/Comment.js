const Sequelize = require('sequelize');
const db = require('../config/config');

const Comment = db.define('comment', {
    id_comments: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
    },
    id_user: {
        type: Sequelize.INTEGER
    },
    comment: {
        type: Sequelize.STRING
    },
    id_content: {
        type: Sequelize.INTEGER
    },
}, {
    tableName: 'comments'
})

module.exports = Comment