'use strict'

var express= require('express');
var ArticleController = require('../controllers/article');
const article = require('../models/article');

var router= express.Router();

var multipart= require('connect-multiparty');
var md_upload = multipart({ uploadDir: './upload/articles'});
//Ruta prueba
router.post('/datos-curso',ArticleController.datosCurso);
router.get('/test-de-controlador', ArticleController.test);


//Rutas para articulos utiles
router.post('/article',ArticleController.save);
router.get('/articles/:last?', ArticleController.getArticles);
router.get('/article/:id', ArticleController.getArticle);
router.put('/article/:id', ArticleController.update);
router.delete('/article/:id', ArticleController.delete);
router.post('/article/upload-image/:id',md_upload ,ArticleController.upload);
router.get('/article/get-image/:image', ArticleController.getImage);
router.get('/article/search/:search', ArticleController.search);

module.exports= router; 