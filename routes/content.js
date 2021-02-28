const express = require('express');
const router = express.Router();
const db = require('../config/config');
const fileUpload = require('express-fileupload');
const User = require('../models/User');
const Document = require('../models/Docuement');
const Comment = require('../models/Comment');
const Sequelize = require('sequelize');
const md5 = require('md5');
const path = require('path');
const Op = Sequelize.Op;
const { QueryTypes } = require('sequelize');

router.get('/upload', (req, res) => {
    res.render('upload')
    // Document.findAll()
    //     .then(document => {
    //         res.render('upload', {document})
    //     })
    //     .catch(err => {
    //         console.log(err)
    //         res.render('upload', {document: ''})
    //     })
})

router.post('/new', (req, res) => {
    const {category, documentType, documentName, isPublic, title, file} = req.body;
    if (documentName !== 'new'){
        //TODO add new category
    } else{
        //TODO add new version
    }
    const newFile = req.files.file;
    const fileName = newFile.name;
    const uploadPath = path.join(path.resolve('./public/uploads'), fileName);
    newFile.mv(uploadPath, err => {
        if (err)
            console.log(err)
    })
    res.redirect('/content/upload')
})

router.get('/:type', (req, res) => {
    let type = req.params.type;
    if (type === 'raports' || type === 'documents' || type === 'faq') {
        type = type.charAt(0).toUpperCase() + type.slice(1);
        res.render('category', {category:type, cookie: req.session.user})
    } else
        res.redirect('/')
    // Document.findAll()
    //     .then(document => {
    //         console.log(document)
    //     })
    //     .catch(err => console.log(err))
})

module.exports = router