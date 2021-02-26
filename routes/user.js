const express = require('express');
const router = express.Router();
const db = require('../config/config');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Sequelize = require('sequelize');
const md5 = require('md5');
const Op = Sequelize.Op;

/* GET home page. */
router.get('/login', (req, res, next) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/user/login');
});

router.post('/login', (req, res, next) => {
    const body = req.body;
    let {email, password} = body;
    User.findOne({
        where: {
            email,
            password: md5(md5(password))
        }
    })
        .then(logged => {
            if (logged) {
                req.session.user = email;
                res.render('index', {cookie: req.session.user})
            }
            else
                res.render('login', { errors: 'Nie ma takiego użytkownika' });
        })
        .catch(err => console.log(err))
    // res.render('login', { title: 'Express' });
});

module.exports = router;
