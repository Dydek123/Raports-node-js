const express = require('express');
const router = express.Router();
const db = require('../config/config');
const User = require('../models/User');
const Comment = require('../models/Comment');
const PasswordReset = require('../models/PasswordReset');
const Sequelize = require('sequelize');
const md5 = require('md5');
const Op = Sequelize.Op;
const { QueryTypes } = require('sequelize');
const date = require('date-and-time');

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

const generateRandomString = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const getBrowser = () => {
    let sBrowser, sUsrAg = navigator.userAgent;
// The order matters here, and this may report false positives for unlisted browsers.
    if (sUsrAg.indexOf("Firefox") > -1) {
        sBrowser = "Mozilla Firefox";
        // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
    } else if (sUsrAg.indexOf("SamsungBrowser") > -1) {
        sBrowser = "Samsung Internet";
        // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36
    } else if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) {
        sBrowser = "Opera";
        // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
    } else if (sUsrAg.indexOf("Trident") > -1) {
        sBrowser = "Microsoft Internet Explorer";
        // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
    } else if (sUsrAg.indexOf("Edge") > -1) {
        sBrowser = "Microsoft Edge";
        // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
    } else if (sUsrAg.indexOf("Chrome") > -1) {
        sBrowser = "Google Chrome or Chromium";
        // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
    } else if (sUsrAg.indexOf("Safari") > -1) {
        sBrowser = "Apple Safari";
        // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
    } else {
        sBrowser = "unknown";
    }
    return sBrowser;
}

const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    }
    if (
        /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
            ua
        )
    ) {
        return "mobile";
    }
    return "desktop";
};

const isUnique = async (email) => {
    const user = await User.findOne({
        where: {email},
        attributes: ['email'],
        raw: true,
    })
    return user === null;
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

router.get('/profile', (req, res) => {
    User.findOne({where : {email:req.session.user}})
        .then(user => {
            res.render('profile', {user, message:{}})
        })
        .catch(() => res.redirect('/user/login'))
})

router.get('/profile/change_password', (req, res) => {
    res.render('change_password', {message:{}})
})

router.post('/profile/change_password', (req, res) => {
    const {password, passwordRepeat} = req.body;
    console.log(req.body)
    if (!password || !passwordRepeat)
        res.render('change_password', {message:{status:'error', text: 'Oba pola są wymagane'}})
    else if (password !== passwordRepeat)
        res.render('change_password', {message:{status:'error', text: 'Hasła nie są takie same'}})
    else {
        User.findOne({where: {email: req.session.user}})
            .then(user => {
                user.password = md5(md5(password));
                user.save()
                res.render('profile', {user, message:{status:'successful', text: 'Zmieniono poprawnie'}})
            })
            .catch(err => {
                console.log(err)
                res.render('change_password', {message:{status:'error', text: 'Błąd podczas edycji hasła'}})
            })
    }
})

router.get('/profile/change_email', (req, res) => {
    res.render('change_email', {message:{allowKey: false}})
})

router.post('/profile/change_email', (req, res) => {
    const {email} = req.body;
    if (!email)
        res.render('change_email', {message:{status:'error', text: 'Wprowadź email', allowKey: false}})
    else{
        User.findOne({where:{email}})
            .then(data => {
                if (data !== null){
                    const expDate = new Date();
                    expDate.setHours(expDate.getHours()+2)
                    let key = generateRandomString();
                    PasswordReset.create({email, key, expDate:date.format(expDate, 'YYYY/MM/DD HH:mm:ss')})
                        .then(() => {
                            res.render('change_email', {message:{status:'successful',email, text: 'Na podany e-mail został wysłany kod potwierdzający', allowKey: true}});
                        })
                        .catch(err => {
                            console.log(err);
                            res.render('change_email', {message:{status:'error', text: 'Błąd podczas generowania klucza', allowKey: false}});
                        })
                } else
                    res.render('change_email', {message:{status:'error', text: 'Użytkownik z takim e-mailem nie istnieje', allowKey: false}})

            })
            .catch(err => {
                console.log(err);
                res.render('change_email', {message:{status:'error', text: 'Błąd podczas zmiany emaila', allowKey: false}})
            })
    }
})

router.post('/profile/email_reset', (req, res) => {
    const {email, key, newEmail} = req.body;
    const limit = 5;
    if (!email || !key)
        res.render('change_email', {message:{status:'error', text: 'Obie wartości są wymagane', email, allowKey: true}});
    else{
         PasswordReset.findAll({where: {email}, order: [
                ['expDate', 'DESC']
            ], limit:limit
        })
            .then(async data => {
                let isValid = false;
                for (let i = 0 ; i < data.length ; i++){
                    let expTime = new Date(data[i].expDate).getTime();
                    let currentTime = Date.now();
                    if (data[i].key === key && expTime > currentTime){
                        isValid = true;
                        break;
                    }
                }
                if (isValid && await isUnique(newEmail)) {
                    User.findOne({where: {email: req.session.user}})
                        .then(user => {
                            user.email = newEmail;
                            req.session.user = newEmail;
                            user.save()
                            res.render('profile', {user, message:{status:'successful', text: 'Zmieniono poprawnie'}})
                        })
                        .catch(err => {
                            console.log(err)
                            res.render('change_email', {message:{status:'error', text: 'Błąd podczas akutalizacji e-maila', email, allowKey: true}});
                        })
                } else
                    res.render('change_email', {message:{status:'error', text: 'Podany klucz jest nieprawidłowy lub użytkownik o takim emailu już istnieje', email, allowKey: true}});
            })
            .catch(err => {
                console.log(err)
                res.render('change_email', {message:{status:'error', text: 'Błąd podczas szukania kluczy', email, allowKey: true}});
            })
        // User.findOne({where:{email}})
        //     .then(data => {
        //         if (data !== null){
        //             const expDate = new Date();
        //             expDate.setHours(expDate.getHours()+2)
        //             let key = generateRandomString();
        //             PasswordReset.create({email, key, expDate:date.format(expDate, 'YYYY/MM/DD HH:mm:ss')})
        //                 .then(() => {
        //                     res.render('change_email', {message:{status:'successful', text: 'Na podany e-mail został wysłany kod potwierdzający', email}});
        //                 })
        //                 .catch(err => {
        //                     console.log(err);
        //                     res.render('change_email', {message:{status:'error', text: 'Błąd podczas generowania klucza'}});
        //                 })
        //         } else
        //             res.render('change_email', {message:{status:'error', text: 'Użytkownik z takim e-mailem nie istnieje'}})
        //
        //     })
        //     .catch(err => {
        //         console.log(err);
        //         res.render('change_email', {message:{status:'error', text: 'Błąd podczas zmiany emaila'}})
        //     })
    }
})

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
    if(!surname) {
        res.render('register', {errors: 'Wprowadź imię i nazwisko'})
    } else if (password !== repeatPassword) {
        res.render('register', {errors: 'Hasła nie są takie same'})
    } else {
        password = md5(md5(password))
        User.create({name, surname, email, password})
            .then(() => res.redirect('/user/login'))
            .catch(() => res.render('register', {errors: 'Użytkownik o takim emailu już istnieje'}))
    }
}))

module.exports = router;
