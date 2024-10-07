'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Catalogo = Schema({
    descripcion: {type: String, required: true},
    //nombre_catalogo: {type: String, required: true},
    id_catalogo: {type: String, required: true},
    ds_catalogo: {type: String, required: true},
    createdAt: {type:Date, default: Date.now, require: true}
});

module.exports =  mongoose.model('catalogo',Catalogo);

//63f508cbb7f9346a284fca03