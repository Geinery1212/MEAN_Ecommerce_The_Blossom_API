var Catalogos = require('../models/catalogos');

listar_productos_admin = async function (req, res) {
    if (req.user) {
        var productos = await Producto.find().sort({_id: -1});
        res.status(200).send({
            data: productos
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}