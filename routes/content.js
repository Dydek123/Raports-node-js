const express = require('express');
const router = express.Router();
const db = require('../config/config');
const fileUpload = require('express-fileupload');
const User = require('../models/User');
const Document = require('../models/Document');
const Comment = require('../models/Comment');
const Content = require('../models/Content');
const Version = require('../models/Version');
const Sequelize = require('sequelize');
const mime = require('mime-types')
const md5 = require('md5');
const path = require('path');
const Op = Sequelize.Op;
const { QueryTypes } = require('sequelize');

const createNewVersion = async (res, req, id_content) => {
    const {category, documentType, documentName, isPublic, title, file} = req.body;
    const newFile = req.files.file;
    let fileName = newFile.name;
    if (mime.contentType(fileName) !== mime.lookup('docx'))
    {
        res.render('upload', {error: 'Przesłany plik nie jest plikiem .docx'})
    } else{
        const user = await User.findOne({
            attributes: ['id'],
            where: {email:req.session.user},
            raw: true,
        })
        const id_user = user.id;

        Version.create({
            id_contents:id_content,
            file: fileName,
            id_user: id_user,
        })
            .then((inserted) => {
                let fileName = inserted.id_versions + '_' + newFile.name;
                const uploadPath = path.join(path.resolve('./public/uploads'), fileName);
                newFile.mv(uploadPath, err => {
                    if (err)
                        console.log(err)
                })
                res.render('upload', {error: 'Pomyślnie dodano'})
            })
            .catch(err => {
                if (err){
                    console.log(err)
                    res.render('upload', {error: 'Błąd'})
                }
            })
    }
}

router.get('/upload', (req, res) => {
    res.render('upload', {error: ''})
})

router.get('/uploadCategories', (req, res) => {
    Document.findAll()
        .then(document => {
            res.json(document)
        })
        .catch(err => console.log(err))
})

router.get('/uploadCategories/:title', (req, res) => {
    const {title} = req.params;
    Document.findAll({where: {[Op.or]: [ { title: {[Op.iLike]: '%' + title + '%'}} , {document: {[Op.iLike]: '%' + title + '%'}}]}})
        .then(document => {
            res.json(document)
        })
        .catch(err => console.log(err))
})

router.post('/upload', async (req, res) => {
    const {category, documentType, documentName, isPublic, title, file} = req.body;
    console.log(title)
    if (category && documentType && documentName) {
        if (documentName === 'new'){
            if (!isPublic || !title) {
                res.render('upload', {error: 'Uzupełnij wszystkie pola'})
            } else {
                const id_documents = await Document.findOne({
                    attributes: ['id'],
                    where: {title: documentType},
                    raw: true,
                })
                    .catch(err => {
                    console.log(err);
                    res.render('upload', {error: 'Błąd'});
                    })
                const id_document = id_documents.id;
                Content.create({
                    id_document,
                    is_public: isPublic,
                    title
                })
                    .then((inserted) => {
                        createNewVersion(res, req, inserted.id_contents)
                    })
                    .catch(err => {
                        if (err){
                            res.render('upload', {error: 'Kategoria o takim tytule już istnieje'})
                        }
                    })
                //TODO add new version
            }
        } else{
            //TODO add new version
            Content.findOne({where:{title:documentName}})
                .then(data => {
                    createNewVersion(res, req, data.id_contents)
                })
                .catch(err => {
                    console.log(err);
                    res.render('upload', {error: 'Błąd'});
                })
        }
    }
    else {
        res.render('upload', {error: 'Error'})
    }
    // const newFile = req.files.file;
    // const fileName = newFile.name;
    // const uploadPath = path.join(path.resolve('./public/uploads'), fileName);
    // newFile.mv(uploadPath, err => {
    //     if (err)
    //         console.log(err)
    // })
    //
    // res.render('upload', {error: ''})
})

router.get('/:type', (req, res) => {
    let type = req.params.type;
    if (type === 'raports' || type === 'documents') {
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