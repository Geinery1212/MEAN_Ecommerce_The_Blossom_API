'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    titulo: {type: String, required: true},
    slug: {type: String, required: true},
    portada: {type: String, required: true},
    precio_antes: {type: Number,default: 0, required: true},    
    precio: {type: Number, required: true},
    sku: {type: String, required: true},
    contenido: {type: String, required: true},
    nventas: {type: Number, default: 0, required: true},
    //{type: Schema.ObjectId, ref: 'producto', required: true},
    //categoria: {type: String, required: true},
    categoria: {type: Schema.ObjectId, ref: 'categoria', required: true},
    visibilidad: {type: String, required: true},

    stock: {type: Number,default:0 ,required: false},
    galeria: [{type: Object, required: false}],
    peso: {type: String, required: false},

    estado: {type: String, default: 'Edicion', required: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('producto',ProductoSchema);