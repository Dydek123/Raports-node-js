const Sequelize = require('sequelize');
const db = require('../config/config');

const Version_details = db.define('version_details', {
    id_versions: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
    },
    file: {
        type: Sequelize.STRING,
    },
    date: {
        type: Sequelize.DATE,
    },
    is_public: {
        type: Sequelize.BOOLEAN,
    },
    title: {
        type: Sequelize.STRING,
    },
    name: {
        type: Sequelize.STRING,
    },
    email: {
        type: Sequelize.STRING,
    },
}, {
    timestamps: false,
    tableName: 'versions_details'
})

module.exports = Version_details