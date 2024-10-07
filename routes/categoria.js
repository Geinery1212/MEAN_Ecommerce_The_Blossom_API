'use strict'

var express = require('express');
var CategoriaController = require('../controllers/CategoriaController');

var api = express.Router();
var auth = require('../middlewares/authenticate');

api.post('/registro_categoria_admin',auth.auth,CategoriaController.registro_categoria_admin);
api.get('/listar_categorias_admin',auth.auth,CategoriaController.listar_categorias_admin);
api.get('/listar_categorias_publico',CategoriaController.listar_categorias_publico);
api.get('/obtener_categoria_admin/:id',auth.auth,CategoriaController.obtener_categoria_admin);
api.put('/actualizar_categoria_admin/:id',auth.auth,CategoriaController.actualizar_categoria_admin);
api.delete('/eliminar_categoria_admin/:id',auth.auth,CategoriaController.eliminar_categoria_admin);

module.exports = api;