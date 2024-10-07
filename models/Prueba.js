'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Prueba= Schema({
    descripcion: {type: String, required: true},
});

module.exports =  mongoose.model('prueba',Prueba);