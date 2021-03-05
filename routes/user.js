const express = require('express');
const md5 = require('md5');
const date = require('date-and-time');
const User = require('../models/User');
const Category = require('../models/Category');
const PasswordReset = require('../models/PasswordReset');

const router = express.Router();

// TODO Delete if not crash
// const Sequelize = require('sequelize');
// const db = require('../config/config');
// const Comment = require('../models/Comment');
// const Op = Sequelize.Op;
// const { QueryTypes } = require('sequelize');

const isSet = item => {
    return !(item === null || item === undefined);

}

const isAdmin = async (email) => {
    const user = await User.findOne({
        where: {email},
        attributes: ['id_role'],
        raw: true,
    })
    return user.id_role > 1;
}

const getUserName = async (email) => {
    const user = await User.findOne({
        where: {email},
        attributes: ['name', 'surname'],
        raw: true
    })
    return user.join(' ');
}

const getUser = async (email) => {
    return await User.findOne({
        where: {email},
        attributes: ['name', 'surname', 'id_role', 'email'],
        raw: true
    });
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

// Login panel
router.get('/login', (req, res, next) => {
    const cookie = req.session.user;
    if (isSet(cookie))
        res.redirect('/');
    else
        res.render('login', {message : ''});
});

// Sign up panel
router.get('/register', (req, res, next) => {
    const cookie = req.session.user;
    if (isSet(cookie)) {
        res.redirect('/');
    }
    else
        res.render('register', {errors : ''});
});

// Logout
router.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/user/login');
});

// User and admin panel
router.get('/profile', (req, res) => {
    User.findOne({where : {email:req.session.user}})
        .then(user => {
            res.render('profile', {user, message:{}})
        })
        .catch(() => res.redirect('/user/login'))
})

// Change_password
router.get('/profile/change_password', (req, res) => {
    const cookie = req.session.user;
    if (isSet(cookie)) {
        res.render('change_password', {message:{}})
    }
    else
        res.redirect('/user/login')
})

router.post('/profile/change_password', (req, res) => {
    const {password, passwordRepeat} = req.body;
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

// Change email
router.get('/profile/change_email', (req, res) => {
    const cookie = req.session.user;
    if (isSet(cookie)) {
        res.render('change_email', {message:{}})
    }
    else
        res.redirect('/user/login')
})

router.post('/profile/change_email', async (req, res) => {
    const {email, newEmail} = req.body;
    if (email !== req.session.user){
        res.render('change_email', {message:{status:'error', text: 'Sprawdź wprowadzone dane'}});
        return;
    }
    if(!await isUnique(newEmail)){
        res.render('change_email', {message:{status:'error', text: 'Email zajęty'}});
        return;
    } else {
        User.findOne({where: {email: req.session.user}})
            .then(user => {
                user.email = newEmail;
                req.session.user = newEmail;
                user.save()
                res.render('profile', {user, message:{status:'successful', text: 'Zmieniono poprawnie'}})
            })
            .catch(err => {
                console.log(err)
                res.render('forget_password', {message:{status:'error', text: 'Błąd podczas zmiany', email, allowKey: true}});
            })
    }
})

// Forget password
router.get('/forgot_password', (req, res) => {
    res.render('forgot_password', {message:{allowKey: false}})
})

router.post('/generate_key', (req, res) => {
    const {email} = req.body;
    if (!email)
        res.render('forgot_password', {message:{status:'error', text: 'Wprowadź email', allowKey: false}})
    else{
        User.findOne({where:{email}})
            .then(data => {
                if (data !== null){
                    const expDate = new Date();
                    expDate.setHours(expDate.getHours()+2)
                    let key = generateRandomString();
                    PasswordReset.create({email, key, expDate:date.format(expDate, 'YYYY/MM/DD HH:mm:ss')})
                        .then(() => {
                            console.log(key)
                            res.render('forgot_password', {message:{status:'successful',email, text: `Na podany e-mail został wysłany kod potwierdzający (${key})`, allowKey: true}});
                        })
                        .catch(err => {
                            console.log(err);
                            res.render('forgot_password', {message:{status:'error', text: 'Błąd podczas generowania klucza', allowKey: false}});
                        })
                } else
                    res.render('forgot_password', {message:{status:'error', text: 'Użytkownik z takim e-mailem nie istnieje', allowKey: false}})

            })
            .catch(err => {
                console.log(err);
                res.render('forgot_password', {message:{status:'error', text: 'Błąd podczas zmiany hasła', allowKey: false}})
            })
    }
})

router.post('/recover_password', (req, res) => {
    const {email, key, newPassword} = req.body;
    const limit = 5;
    if (!email || !key || !newPassword)
        res.render('forgot_password', {message:{status:'error', text: 'Obie wartości są wymagane', email, allowKey: true}});
    else if (req.session.user)
        res.redirect('/')
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
                if (isValid) {
                    User.findOne({where: {email}})
                        .then(user => {
                            console.log(user)
                            user.password = md5(md5(newPassword));
                            user.save()
                            res.render('login', {user, message:{status:'successful', text: 'Zmieniono poprawnie'}})
                        })
                        .catch(err => {
                            console.log(err)
                            res.render('forgot_password', {message:{status:'error', text: 'Błąd podczas zmiany', email, allowKey: true}});
                        })
                } else
                    res.render('forgot_password', {message:{status:'error', text: 'Podany klucz jest nieprawidłowy lub użytkownik o takim emailu już istnieje', email, allowKey: true}});
            })
            .catch(err => {
                console.log(err)
                res.render('forgot_password', {message:{status:'error', text: 'Błąd podczas szukania kluczy', email, allowKey: true}});
            })
    }
})

router.get('/profile/delete_user', async (req, res) => {
    if(req.session.user){
        if (await isAdmin(req.session.user))
            res.render('delete_user', {message:''});
        else{
            let user = await getUser(req.session.user)
            res.render('profile', {user, message:{status:'error', text: 'Nie posiadasz uprawnień administratora'}});
        }
    } else
        res.redirect('/user/login');
})

router.post('/profile/delete_user', async(req, res) => {
    if(req.session.user){
        if (await isAdmin(req.session.user)) {
            const {email} = req.body;
            User.findOne({where: {email}})
                .then(async user => {
                    if(user !== null) {
                        const adminUser = await getUser(req.session.user)
                        user.destroy();
                        res.render('profile', {user: adminUser, message:{status:'successful', text: 'Użytkownik został usunięty'}})
                    } else {
                        res.render('delete_user', {message:{status:'error', text: 'Taki użytkownik nie istnieje'}});
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.render('delete_user', {message:{status:'error', text: 'Błąd podczas usuwania użytkownika'}});
                })
        }
        else{
            let user = getUserName(req.session.user)
            res.render('profile', {user, message:{status:'successful', text: 'Nie posiadasz uprawnień administratora'}});
        }
    } else
        res.redirect('/user/login');
})

router.get('/profile/make_admin', async (req, res) => {
    if(req.session.user){
        if (await isAdmin(req.session.user))
            res.render('make_admin', {message:''});
        else{
            let user = await getUser(req.session.user)
            res.render('profile', {user, message:{status:'error', text: 'Nie posiadasz uprawnień administratora'}});
        }
    } else
        res.redirect('/user/login');
})

router.post('/profile/make_admin', async(req, res) => {
    if(req.session.user){
        if (await isAdmin(req.session.user)) {
            const {email} = req.body;
            User.findOne({where: {email}})
                .then(async user => {
                    if(user !== null) {
                        user.id_role = 2;
                        const adminUser = await getUser(req.session.user)
                        user.save();
                        res.render('profile', {user: adminUser, message:{status:'successful', text: 'Użytkownik został adminem'}})
                    } else {
                        res.render('make_admin', {message:{status:'error', text: 'Taki użytkownik nie istnieje'}});
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.render('make_admin', {message:{status:'error', text: 'Błąd podczas zmieniania uprawnień'}});
                })
        }
        else{
            let user = getUserName(req.session.user)
            res.render('profile', {user, message:{status:'error', text: 'Nie posiadasz uprawnień administratora'}});
        }
    } else
        res.redirect('/user/login');
})

router.get('/profile/new_category', async (req, res) => {
    if(req.session.user){
        if (await isAdmin(req.session.user))
            res.render('new_category', {message:''});
        else{
            let user = await getUser(req.session.user)
            res.render('profile', {user, message:{status:'error', text: 'Nie posiadasz uprawnień administratora'}});
        }
    } else
        res.redirect('/user/login');
})

router.post('/profile/new_category', async(req, res) => {
    if(req.session.user){
        if (await isAdmin(req.session.user)) {
            const {category, title} = req.body;
            Category.findOne({where: {title}})
                .then(data => {
                    console.log(data)
                    if (data !== null)
                        res.render('new_category', {message:{status:'error', text: 'Taki dokument już istnieje'}});
                    else {
                        let id_categories;
                        if (category === 'Raporty')
                            id_categories = 1;
                        if (category === 'Dokumentacja')
                            id_categories = 2;
                        Category.create({id_categories, title})
                            .then(async () => {
                                let user = await getUser(req.session.user);
                                res.render('profile', {user , message:{status:'successful', text: 'Pomyślnie dodano'}})
                            })
                            .catch(err => {
                                console.log(err);
                                res.render('new_category', {message:{status:'error', text: 'Błąd przy dodawaniu kategorii'}});
                            })
                    }
                })
        }
        else{
            let user = getUserName(req.session.user)
            res.render('profile', {user, message:{status:'error', text: 'Nie posiadasz uprawnień administratora'}});
        }
    } else
        res.redirect('/user/login');
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
                res.render('login', {message:{status:'error', text: 'Nieprawidłowe dane logowania'}});
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
        res.render('register', {message:{status:'error', text: 'Wprowadź imię i nazwisko'}})
    } else if (password !== repeatPassword) {
        res.render('register', {message:{status:'error', text: 'Hasła nie są takie same'}})
    } else {
        password = md5(md5(password))
        User.create({name, surname, email, password})
            .then(() => res.render('login', {message:{status:'successful', text: 'Konto zostało utworzone'}}))
            .catch(() => res.render('register', {message:{status:'error', text: 'Użytkownik o takim emailu już istnieje'}}))
    }
}))

module.exports = router;
