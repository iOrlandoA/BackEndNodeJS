'use strict'
var validator= require('validator');
var Article= require('../models/article');
const article = require('../models/article');
var fs= require('fs');
var path = require('path');
const { error } = require('console');
var controller = {

    datosCurso: (req, res)=>{
        var hola = req.body.hola;
        return res.status(200).send({
            curso: 'AprendiendoVC',
            autor:'Orlando',
            url:'orlando.com',
            hola
        });
    },

    test: (req, res)=>{
        return res.status(200).send({
            message: 'Soy la accion del controlador de articulos'
        })
    },

    save: (req, res) => {
        //Recoger parametros por POST
        var params = req.body;
        //Validar datos (validator)
        try{
            var validateTitle= !validator.isEmpty(params.title);
            var valdateContent= !validator.isEmpty(params.content);

        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos!!'
            });
            
        }

        if(valdateContent && validateTitle){
            //Crear el objeto a guardar
            var article = new Article();

            //Asignar valores
            article.title= params.title;
            article.content= params.content;
            article.image= null;

            
            //Guardar el articulo 
            article.save().then((articleStored) => {
                //Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });
                
            })
            .catch((error)=>{  
                return res.status(200).send({
                    status: 'error',
                    message: 'No se pudo guardar correctamente'
                });
            });
            
            

        }else{
            return res.status(404).send({
                status: 'error',
                message: 'Error en los datos!!'
            });
        }
        
    },

    getArticles:(req,res) =>{

        var query = Article.find({});
        var last= req.params.last;
        if(last || last != undefined){
            query.limit(5);
        }
        //Find decendente 
        query.sort('-_id').then((articles)=>{
        
            if(!articles){
                return res.status(404).send({
                    status:'error',
                    message: 'Error no se encontro articulos'
                    
                });
            }
            return res.status(200).send({
                status:'success',
                articles
                
            });
        })
        .catch((error)=>{          
            return res.status(500).send({
                status:'error',
                message: 'Error al devolver los articulos'
                
            });
        });


       
    },
    getArticle: (req, res)=> {
        //Recoger el id de la URl
        var articleId= req.params.id;
        //Comprobar que existe
        if(!articleId || articleId == null){
            return res.status(404).send({
                status:'error',
                message: 'No existe el articulo'
            });
        }
        //Buscar el articulo 
        Article.findById(articleId).then (article => {
           
            if(!article){
                return res.status(404).send({
                    status:'error',
                    message: 'No existe el articulo'
                });
            }
            // Devolver en JSON
            return res.status(200).send({
                status:'success',
                article
                
            });
            
        }).catch(err=>{
            return res.status(500).send({
                status:'error',
                message: 'Error al devolver los datos'
            });
            
        });
        
    },
    update: (req, res) => {

        //Recoger el id del articulo de la URL
        var articleId= req.params.id;
        //Recoge los datos que llegan por el put
        var params = req.body;
        //Validar datos
        try {
            var validateTitle= !validator.isEmpty(params.title);
            var validateContent= !validator.isEmpty(params.content);
        } catch (error) {
            return res.status(404).send({
                status:'error',
                message: 'Faltan datos por enviar'
            });
        }
        if (validateTitle && validateContent){
            // Find and update
            Article.findOneAndUpdate({_id: articleId}, params, {new:true})
            .then (articleUpdated  => {
                if(!articleUpdated){
                    return res.status(404).send({
                        status:'error',
                        message: 'No existe el articulo'
                    });
                }
                return res.status(200).send({
                    status:'success',
                    articleUpdated
                    
                });

            }).catch (error =>{
                return res.status(500).send({
                    status:'error',
                    message: 'Error al actualizar'
                });

            });
        }else{
            return res.status(404).send({
                status:'error',
                message: 'La  validación no es correcta'
            });
        }

        
        
    },
    delete: (req, res)=>{
        //Recoger el id
        var articleId= req.params.id;
        //Find and Delete
        Article.findOneAndDelete({_id: articleId}).then(articleRemoved=>{
            if(!articleRemoved){
                return res.status(404).send({
                    status:'error',
                    message: 'Error no se borro el archivo, posiblemente no exista'
                });

                return res.status(200).send({
                    status: 'success',
                    article: articleRemoved
                });
            }
        }).catch(error=>{
            return res.status(500).send({
                status:'error',
                message: 'Error al borrar'
            });
        });
    },
    upload: (req, res)=>{
        // Configurar el modulo del ConnectMultiParty router/article.js

        // Recoger el fichero 
        var fileName= 'Imagen no subida...';
        if(!req.files){
            return res.status(404).send({
                status:'error',
                message: 'La imagen no está subida'
            });
        }
        // Conseguir nombre y extensión
        var filePath = req.files.file0.path;
        var fileSplit = filePath.split("/");

            //Nombre archivo
        var fileName = fileSplit[2];

            //Extensión
        var extensionSplit = fileName.split('.');
        var fileExt = extensionSplit[1];
        //Comprobar la extensión(Solo imagenes) si no es valido borrar el fichero
        if(fileExt != 'png' && fileExt != 'jpg' && fileExt != 'jpeg' && fileExt != 'gif'){           
            //Borrar archivo subido 
            fs.unlink(filePath, (error)=>{
                return res.status(404).send({
                    status:'error',
                    message: 'La extensión no es valida'
                });
            });
        }else{
            // Sacar id de la URL
            var articleId = req.params.id;

            //Buscar el articulo, asignarle la imagen y actualizarlo
            Article.findOneAndUpdate({_id: articleId}, {image: fileName},{new: true})
            .then(articleUpdated=>{
                if (!articleUpdated) {
                    return res.status(404).send({
                        status:'error',
                        message: 'Error al guardar imagen en articulo'
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
    
            }).catch(error=>{
                return res.status(404).send({
                    status:'error',
                    message: 'La extensión no es valida'
                });
            });

            
        }


    }, //End upload file
    
    
    getImage: (req, res)=>{
        // Se recupera la ruta de la URl
        var file = req.params.image;
        // Se crea la ruta completa
        var filePath = './upload/articles/'+file;

        fs.exists(filePath, (exists)=>{
            if(exists){
                return res.sendFile(path.resolve(filePath));
            }else{
                return res.status(404).send({
                    status:'error',
                    message: 'La imagen no existe'
                });
            }
        });

        
    },// End GetImage
    
    search:(req, res)=>{
        //Sacar el string a buscar 
        var searchString= req.params.search;
        //Find or
        Article.find({"$or":[
            {"title": {"$regex": searchString, "$options": "i"}},
            {"content": {"$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date','descending']])
        .exec().then(articles => {
            if(!article){
                return res.status(404).send({
                    status:'error',
                    message: 'No se encontro el articulo!!',
                    searchString
                });
            }
            return res.status(200).send({
                status: 'success',
                article: articles
            });

        }).catch(err => {
            return res.status(500).send({
                status:'error',
                message: 'Error al hacer la petición!!',
                searchString
            });
        });
        
    }


}; // End Controller


module.exports= controller;