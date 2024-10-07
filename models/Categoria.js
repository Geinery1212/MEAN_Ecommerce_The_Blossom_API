'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    titulo: {type: String, required: true},
    slug: {type: String, required: true},
});

module.exports =  mongoose.model('categoria',CategoriaSchema);