const express = require('express');
const router = express.Router();
const db = require('../config/config');
const fileUpload = require('express-fileupload');
const User = require('../models/User');
const Document = require('../models/Document');
const Comment = require('../models/Comment');
const Content = require('../models/Content');
const Version = require('../models/Version');
const Version_details = require('../models/Versions_details');
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

const getVersions = async (title) => {
    const version = await Version_details.findAll({
        where: {title},
        raw: true
    })
    return version;
}

const getUser = async (email) => {
    const user = await User.findOne({
        where: {email},
        attributes: ['id', 'name', 'surname', 'id_role'],
        raw: true
    })
    return user;
}

const getContentID = async (title) => {
    const version = await Content.findOne({
        where: {title},
        raw: true
    })
    return version.id_contents;
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
    let typePL;
    let existedTitle = [];
    let documents = [];
    let toReturn = [];
    if (type === 'raports')
        typePL = 'Raporty'
    if (type === 'documents')
        typePL = 'Dokumenty'

    // Document.findAll({where :{category:typePL}})
    //     .then(data => {
    //         let i = -1;
    //         for (const datum of data) {
    //             if (!existedTitle.includes(datum.title)){
    //                 toReturn.push({[datum.title]: [datum.document]});
    //                 existedTitle.push(datum.title)
    //                 i++;
    //             } else{
    //                 toReturn[i][datum.title].push(datum.document);
    //                 // toReturn[i].datum.title.push(datum.document);
    //             }
    //         }
    //         console.log(toReturn)
    //         res.render('category', {category:type, cookie: req.session.user, menu:toReturn})
    //     })
    //     .catch(err => {
    //         console.log(err)
    //         res.send('Błąd podczas pokazywania menu')
    //     })
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

router.get('/:type/:documentName', async (req, res) => {
    const {type, documentName} = req.params;
    let role;
    const versions = await getVersions(documentName);
    if(!req.session.user)
        role = 0;
    else {
        const user = await getUser(req.session.user)
        role = user.id_role
    }
    res.render('document', {category:documentName, cookie: req.session.user, versions, user: role})
})

router.post('/:type/:documentName/newComment', async (req, res) => {
    const { newComment } = req.body;
    const {type, documentName } = req.params
    let role;
    const id_content = await getContentID(documentName)
    if(!req.session.user)
        role = 0;
    else {
        const user = await getUser(req.session.user);
        Comment.create({id_user: user.id, comment:newComment, id_content});
    }
    res.redirect(`/content/${type}/${documentName}`)
})

module.exports = router