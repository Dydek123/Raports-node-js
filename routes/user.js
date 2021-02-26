const express = require('express');
const router = express.Router();
const db = require('../config/config');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Sequelize = require('sequelize');
const md5 = require('md5');
const Op = Sequelize.Op;
const { QueryTypes } = require('sequelize');

const isSet = item => {
    if (item === null || item === undefined)
        return false
    return true
}
const capitalizeFirstLetters = (arr) => {
    for (let i = 0 ; i < arr.length ; i++)
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);;
    return arr;
}

/* GET home page. */
router.get('/login', (req, res, next) => {
    const cookie = req.session.user;
    if (isSet(cookie))
        res.redirect('/')
    else
        res.render('login', {errors : ''});
});

router.get('/register', (req, res, next) => {
    const cookie = req.session.user;
    if (isSet(cookie)) {
        res.render('register', {error: 'Wyloguj się aby przejść dalej'});
    }
    else
        res.render('register', {errors : ''});
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
            else {
                console.log('Nie')
                res.render('login', {errors: 'Nie ma takiego użytkownika'});
            }
        })
        .catch(err => console.log(err))
});

router.post('/addUser', ((req, res) => {
    const body = req.body;
    let {name : fullName , email, password, repeatPassword} = body;
    fullName = fullName.split(' ');
    fullName = capitalizeFirstLetters(fullName);
    let name = fullName[0];
    let surname = fullName.slice(1).join(' ');
    password = md5(md5(password))
    User.create({name, surname, email, password})
        .then(() => res.redirect('/user/login'))
        .catch(() => res.render('register', {errors: 'Użytkownik o takim emailu już istnieje'}))
}))

module.exports = router;
