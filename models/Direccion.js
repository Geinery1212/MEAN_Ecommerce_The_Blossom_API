'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DireccionSchema = Schema({
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: true},
    nombres: {type: String, required: true},
    apellidos: {type: String, required: true},
    dni: {type: String, required: true},
    telefono: {type: String, required: true},
    pais: {type: String, required: true},
    estado: {type: String, required: true},
    municipio: {type: String, required: true},    
    direccion: {type: String, required: true},
    referencia: {type: String, required: false},
    zip: {type: String, required: false},
    principal: {type: Boolean, required: true},
    status: {type: Boolean,default: true, required: false},
    createdAt: {type:Date, default: Date.now, required: true}
});

module.exports =  mongoose.model('direccion',DireccionSchema);