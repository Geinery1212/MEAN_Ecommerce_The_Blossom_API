var Categoria = require('../models/Categoria');
var Producto = require('../models/Producto');

const registro_categoria_admin = async function (req, res) {
    if (req.user) {

        let data = req.body;
        let dup = await Categoria.find({
            titulo: data.titulo
        });

        if (dup.length == 0) {
            let dat = {
                titulo: data.titulo.trim(),
                slug: data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
            }
            let reg = await Categoria.create(dat);
            res.status(200).send({
                data: reg,
                message: 'Se registro correctamente la nueva categoría.'
            });
        } else {
            res.status(200).send({
                data: undefined,
                message: 'La categoría ya existe en la base de datos.'
            });
        }

    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}


const listar_categorias_admin = async function (req, res) {
    if (req.user) {
        var categorias = await Categoria.find();
        res.status(200).send({
            data: categorias
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const listar_categorias_publico = async function (req, res) {
    var categorias = await Categoria.find();
    res.status(200).send({
        data: categorias
    });
}

const obtener_categoria_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        try {
            var reg = await Categoria.findById({
                _id: id
            });
            console.log(reg);
            res.status(200).send({
                data: reg
            });
        } catch (error) {
            res.status(200).send({
                data: undefined
            });
        }
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}


const actualizar_categoria_admin = async function (req, res) {
    if (req.user) {
        var data = req.body;
        var id = req.params['id'];

        let dup = await Categoria.find({
            titulo: data.titulo
        });
        if (dup.length == 0) {
            let reg = await Categoria.findByIdAndUpdate({
                _id: id
            }, {
                titulo: data.titulo.trim(),
                slug: data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
            });

            res.status(200).send({
                data: reg,
                message: 'Se actualizo correctamente la categoría.'
            });
        } else {
            res.status(200).send({
                data: undefined,
                message: 'La categoría ya existe en la base de datos'
            });
        }

    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const eliminar_categoria_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        let producto_categoria = await Producto.find({categoria: id});
        console.log(producto_categoria.length);
        
        if (producto_categoria.length == 0) {
            let reg = await Categoria.findByIdAndRemove({
                _id: id
            });
            res.status(200).send({
                data: reg
            });
        } else {
            res.status(200).send({
                data: undefined,
                message: 'La categoría no se puede eliminar, porque está siendo usada en productos.'
            });
        }
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}





module.exports = {
    registro_categoria_admin,
    listar_categorias_admin,
    obtener_categoria_admin,
    actualizar_categoria_admin,
    eliminar_categoria_admin,
    listar_categorias_publico
}