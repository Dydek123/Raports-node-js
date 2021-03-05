const express = require('express');
const router = express.Router();
const db = require('../config/config');
const fileUpload = require('express-fileupload');
const User = require('../models/User');
const Faq = require('../models/Faq');
const Document = require('../models/Document');
const Comment = require('../models/Comment');
const DocumentComments = require('../models/DocumentComments');
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

const getComments = async (title) => {
    const comments = await DocumentComments.findAll({
        where: {title},
        raw: true
    })
    return comments;
}

const getUser = async (email) => {
    const user = await User.findOne({
        where: {email},
        attributes: ['id', 'name', 'surname', 'id_role', 'email'],
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

router.get('/categories/:category', (req, res) => {
    const { category } = req.params;
    Document.findAll({where:{category}})
        .then(document => {
            res.json(document)
        })
        .catch(err => console.log(err))
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
                console.log(id_document)
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
            }
        } else{
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

let mammoth = require("mammoth");

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

    if (type === 'raports' || type === 'documents') {
        type = type.charAt(0).toUpperCase() + type.slice(1);
        res.render('category', {category:type, cookie: req.session.user})
    } else if (type === 'faq'){
        Faq.findAll()
            .then(faq => {
                res.render('faq', {category:type, cookie: req.session.user, faq});
            })
            .catch(err => {
                console.log(err);
                res.redirect('/')
            })
    } else
        res.redirect('/')
})

router.get('/:type/:documentName', async (req, res) =>{
    const {type, documentName} = req.params;
    let user;
    const versions = await getVersions(documentName);
    const comments = await getComments(documentName);
    if(!req.session.user)
        user = '';
    else {
        user = await getUser(req.session.user)
    }
    if (!versions.length) {
        let html = '<h2>Ten dokument nie posiada żadnej treści</h2>\n <a href="/content/upload">Dodaj pierwszy dokument</a>\n';
        console.log(html)
        res.render('document', {category: documentName, cookie: req.session.user, versions, user, comments, html: html})
    }
    else {
        let options = {
            convertImage: mammoth.images.imgElement(function(image) {
                return image.read("base64").then(function(imageBuffer) {
                    return {
                        src: "data:" + image.contentType + ";base64," + imageBuffer
                    };
                });
            })
        };
        const fileName = versions[0].id_versions + '_' + versions[0].file;
        const filePath = path.join(path.resolve('./public/uploads'), fileName);
        mammoth.convertToHtml({path: filePath}, options)
            .then(function (result) {
                let html = result.value; // The generated HTML
                let messages = result.messages; // Any messages, such as warnings during conversion
                res.render('document', {
                    category: documentName,
                    cookie: req.session.user,
                    versions,
                    user,
                    comments,
                    html
                })
            })
            .done();
    }
})

router.post('/faq', async (req, res) => {
    const { question, answer } = req.body;
    if(!req.session.user) {
        res.redirect(`/content/faq`);
    }
    else {
        Faq.create({question, answer})
            .then(insert => res.redirect(`/content/faq`))
            .catch(err => {
                console.log(err);
                res.redirect(`/content/faq`);
            })
    }
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

router.post('/:type/:documentName/deleteVersion',  (req, res) => {
    const { version } = req.body
    const {type, documentName } = req.params
    Version.findOne({where: {id_versions:version}})
        .then(data => {
            data.destroy();
            res.redirect(`/content/${type}/${documentName}`)
        })
        .catch(err => {
            console.log(err)
            res.redirect(`/error`)
        })

})

router.post('/:type/:documentName/deleteComment',  (req, res) => {
    const { commentDelete } = req.body
    const {type, documentName } = req.params
    Comment.findOne({where: {id_comments:commentDelete}})
        .then(data => {
            data.destroy();
            res.redirect(`/content/${type}/${documentName}`)
        })
        .catch(err => {
            console.log(err)
            res.redirect(`/error`)
        })

})

router.post('/:type/:documentName/updateComment',  (req, res) => {
    const { editComment, comment } = req.body
    const {type, documentName } = req.params
    res.redirect(`/content/${type}/${documentName}`)
    Comment.findOne({where: {id_comments:comment}})
        .then(data => {
            data.comment = editComment;
            data.edited = true;
            data.save()
            res.redirect(`/content/${type}/${documentName}`)
        })
        .catch(err => {
            console.log(err)
            res.redirect(`/error`)
        })
})

module.exports = router