var Admin = require('../models/Admin');
var Cliente = require('../models/Cliente');
var Config = require('../models/Config');
var Etiqueta = require('../models/Etiqueta');
var Variedad = require('../models/Variedad');
var Inventario = require('../models/Inventario');
var Producto = require('../models/Producto');
var Producto_etiqueta = require('../models/Producto_etiqueta');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');

var Venta = require('../models/Venta');
var Dventa = require('../models/Dventa');
var Carrito = require('../models/Carrito');
var Catalogo = require('../models/catalogo');
var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');

const login_admin = async function (req, res) {
    var data = req.body;
    var admin_arr = [];

    admin_arr = await Admin.find({
        email: data.email
    });

    if (admin_arr.length == 0) {
        res.status(200).send({
            message: 'El correo electrónico no existe',
            data: undefined
        });
    } else {
        //LOGIN
        let user = admin_arr[0];


        let fecha_actual = new Date();
        let dia_actual = fecha_actual.getDate();
        let mes_actual = fecha_actual.getMonth() + 1;
        let anio_actual = fecha_actual.getFullYear();

        let cadena_larga = user.fecha_fin.slice(0, 9);
        let cadena_corta = parseInt(user.fecha_fin.slice(9, 10));
        let dia_sustituir = cadena_corta + 1;
        let fecha_fin_str = cadena_larga + dia_sustituir;

        console.log('NUEVA FECHA FIN CONSTRUIDA')
        console.log(fecha_fin_str);

        console.log('FECHA ACTUAL SERVER');
        let fecha_actual_str = anio_actual + '-' + mes_actual + '-' + dia_actual;
        console.log(fecha_actual_str);
        console.log(user.fecha_inicio);

        if (!user.estado_cuenta) {
            res.status(200).send({
                message: 'Cuenta vencida, pongase en contacto con el admin',
                data: undefined
            });
        } else if (user.fecha_inicio > fecha_actual_str) {
            res.status(200).send({
                message: 'Cuenta por activar',
                data: undefined
            });
        } else if (fecha_actual_str >= fecha_fin_str) {
            let reg = await Admin.findByIdAndUpdate({
                _id: user._id
            }, {
                estado_cuenta: false
            });
            res.status(200).send({
                message: 'Cuenta vencida y cuenta en false',
                data: reg
            });
        } else {
            bcrypt.compare(data.password, user.password, async function (error, check) {
                if (check) {
                    res.status(200).send({
                        data: user,
                        token: jwt.createToken(user)
                    });
                } else {
                    res.status(200).send({
                        message: 'Las credenciales no coinciden',
                        data: undefined
                    });
                }
            });
        }
    }
}

const listar_etiquetas_admin = async function (req, res) {
    if (req.user) {
        var reg = await Etiqueta.find();
        res.status(200).send({
            data: reg
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const eliminar_etiqueta_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        let reg = await Etiqueta.findByIdAndRemove({
            _id: id
        });
        res.status(200).send({
            data: reg
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const agregar_etiqueta_admin = async function (req, res) {
    if (req.user) {
        try {
            let data = req.body;

            data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');;
            var reg = await Etiqueta.create(data);
            res.status(200).send({
                data: reg
            });
        } catch (error) {
            res.status(200).send({
                data: undefined,
                message: 'Etiqueta ya existente'
            });

        }
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const registro_producto_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;

        let productos = await Producto.find({
            titulo: data.titulo
        });

        let arr_etiquetas = JSON.parse(data.etiquetas);

        if (productos.length == 0) {
            var img_path = req.files.portada.path;
            var name = img_path.split('/');
            var portada_name = name[2];

            data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            data.portada = portada_name;
            let reg = await Producto.create(data);

            if (arr_etiquetas.length >= 1) {
                for (var item of arr_etiquetas) {
                    await Producto_etiqueta.create({
                        etiqueta: item.etiqueta,
                        producto: reg._id,
                    });
                }
            }

            res.status(200).send({
                data: reg
            });
        } else {
            res.status(200).send({
                data: undefined,
                message: 'El título del producto ya existe'
            });
        }
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

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

listar_variedades_productos_admin = async function (req, res) {
    if (req.user) {
        var productos = await Variedad.find().populate('producto');
        res.status(200).send({
            data: productos
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const obtener_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        try {
            var reg = await Producto.findById({
                _id: id
            });
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

const listar_etiquetas_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var etiquetas = await Producto_etiqueta.find({
            producto: id
        }).populate('etiqueta');
        res.status(200).send({
            data: etiquetas
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const eliminar_etiqueta_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        console.log(id);
        let reg = await Producto_etiqueta.findByIdAndRemove({
            _id: id
        });
        res.status(200).send({
            data: reg
        });

    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const agregar_etiqueta_producto_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;

        var reg = await Producto_etiqueta.create(data);
        res.status(200).send({
            data: reg
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const obtener_portada = async function (req, res) {
    var img = req.params['img'];


    fs.stat('./uploads/productos/' + img, function (err) {
        if (!err) {
            let path_img = './uploads/productos/' + img;
            res.status(200).sendFile(path.resolve(path_img));
        } else {
            let path_img = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_img));
        }
    })
}

const actualizar_producto_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        if (req.files) {
            //SI HAY IMAGEN
            var img_path = req.files.portada.path;
            var name = img_path.split('/');
            var portada_name = name[2];

            let reg = await Producto.findByIdAndUpdate({
                _id: id
            }, {
                titulo: data.titulo,
                stock: data.stock,
                precio_antes: data.precio_antes,                
                precio: data.precio,                
                peso: data.peso,
                sku: data.sku,
                categoria: data.categoria,
                visibilidad: data.visibilidad,
                descripcion: data.descripcion,
                contenido: data.contenido,
                portada: portada_name
            });

            fs.stat('./uploads/productos/' + reg.portada, function (err) {
                if (!err) {
                    fs.unlink('./uploads/productos/' + reg.portada, (err) => {
                        if (err) throw err;
                    });
                }
            })

            res.status(200).send({
                data: reg
            });
        } else {
            //NO HAY IMAGEN
            let reg = await Producto.findByIdAndUpdate({
                _id: id
            }, {
                titulo: data.titulo,
                stock: data.stock,
                precio_antes: data.precio_antes,                
                precio: data.precio,                
                peso: data.peso,
                sku: data.sku,
                categoria: data.categoria,
                visibilidad: data.visibilidad,
                descripcion: data.descripcion,
                contenido: data.contenido,
            });
            res.status(200).send({
                data: reg
            });
        }
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const listar_variedades_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        let data = await Variedad.find({
            producto: id
        });
        res.status(200).send({
            data: data
        });

    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const actualizar_producto_variedades_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        console.log(data.titulo_variedad);
        let reg = await Producto.findByIdAndUpdate({
            _id: id
        }, {
            titulo_variedad: data.titulo_variedad,
        });
        res.status(200).send({
            data: reg
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const eliminar_variedad_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        let reg = await Variedad.findByIdAndRemove({
            _id: id
        });
        res.status(200).send({
            data: reg
        });

    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const agregar_nueva_variedad_admin = async function (req, res) {
    if (req.user) {
        var data = req.body;

        console.log(data);
        let reg = await Variedad.create(data);

        res.status(200).send({
            data: reg
        });

    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}


const listar_inventario_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        var reg = await Inventario.find({
            producto: id
        }).populate('variedad').sort({
            createdAt: -1
        });
        res.status(200).send({
            data: reg
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const registro_inventario_producto_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;

        let reg = await Inventario.create(data);

        //OBTENER EL REGISTRO DE PRODUCTO
        let prod = await Producto.findById({
            _id: reg.producto
        });
        let varie = await Variedad.findById({
            _id: reg.variedad
        });

        //CALCULAR EL NUEVO STOCK        
        //STOCK ACTUAL         
        //STOCK A AUMENTAR
        let nuevo_stock = parseInt(prod.stock) + parseInt(reg.cantidad);

        let nuevo_stock_vari = parseInt(varie.stock) + parseInt(reg.cantidad);

        //ACTUALICACION DEL NUEVO STOCK AL PRODUCTO
        let producto = await Producto.findByIdAndUpdate({
            _id: reg.producto
        }, {
            stock: nuevo_stock
        });

        let variedad = await Variedad.findByIdAndUpdate({
            _id: reg.variedad
        }, {
            stock: nuevo_stock_vari
        });

        res.status(200).send({
            data: reg
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const agregar_imagen_galeria_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        var img_path = req.files.imagen.path;
        var name = img_path.split('/');
        var imagen_name = name[2];

        let reg = await Producto.findByIdAndUpdate({
            _id: id
        }, {
            $push: {
                galeria: {
                    imagen: imagen_name,
                    _id: data._id
                }
            }
        });

        res.status(200).send({
            data: reg
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const eliminar_imagen_galeria_admin = async function (req, res) {
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;


        let reg = await Producto.findByIdAndUpdate({
            _id: id
        }, {
            $pull: {
                galeria: {
                    _id: data._id
                }
            }
        });
        res.status(200).send({
            data: reg
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const verificar_token = async function (req, res) {
    console.log(req.user);
    if (req.user) {
        res.status(200).send({
            data: req.user
        });
    } else {
        console.log(2);
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const cambiar_vs_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var estado = req.params['estado'];
        console.log(id);
        console.log(estado);
        try {
            if (estado == 'Edicion') {
                await Producto.findByIdAndUpdate({
                    _id: id
                }, {
                    estado: 'Publicado'
                });
                res.status(200).send({
                    data: true
                });
            } else if (estado == 'Publicado') {
                await Producto.findByIdAndUpdate({
                    _id: id
                }, {
                    estado: 'Edicion'
                });
                res.status(200).send({
                    data: true
                });
            }
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

const obtener_config_admin = async (req, res) => {
    let config = await Config.findById({
        _id: '61abe55d2dce63583086f108'
    });
    res.status(200).send({
        data: config
    });
}

const actualizar_config_admin = async (req, res) => {
    if (req.user) {
        let data = req.body;
        let config = await Config.findByIdAndUpdate({
            _id: '61abe55d2dce63583086f108'
        }, {
            envio_activacion: data.envio_activacion,
            monto_min_mxn: data.monto_min_mxn,
        });
        res.status(200).send({
            data: config
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }

}

const pedido_compra_cliente = async function (req, res) {
    if (req.user) {
        try {
            var data = req.body;
            var detalles = data.detalles;
            let access = false;
            let producto_sl = '';

            for (var item of detalles) {
                let variedad = await Variedad.findById({
                    _id: item.variedad
                }).populate('producto');
                if (variedad.stock < item.cantidad) {
                    access = true;
                    producto_sl = variedad.producto.titulo;
                }
            }

            if (!access) {
                data.estado = 'En espera';
                let venta = await Venta.create(data);

                for (var element of detalles) {
                    element.venta = venta._id;
                    await Dventa.create(element);
                    await Carrito.remove({
                        cliente: data.cliente
                    });
                }
                enviar_email_pedido_compra(venta._id);
                res.status(200).send({
                    venta: venta
                });
            } else {
                res.status(200).send({
                    venta: undefined,
                    message: 'Stock insuficiente para ' + producto_sl
                });
            }
        } catch (error) {
            console.log(error);
        }


    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}


const enviar_email_pedido_compra = async function (venta) {
    try {
        var readHTMLFile = function (path, callback) {
            fs.readFile(path, {
                encoding: 'utf-8'
            }, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                } else {
                    callback(null, html);
                }
            });
        };

        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: 'theblossomtheblossom@gmail.com',
                pass: 'mlbpbejrnfzivuyj'
            }
        }));


        var orden = await Venta.findById({
            _id: venta
        }).populate('cliente').populate('direccion');
        var dventa = await Dventa.find({
            venta: venta
        }).populate('producto').populate('variedad');


        readHTMLFile(process.cwd() + '/mails/email_pedido.html', (err, html) => {

            let rest_html = ejs.render(html, {
                orden: orden,
                dventa: dventa
            });

            var template = handlebars.compile(rest_html);
            var htmlToSend = template({
                op: true
            });

            var mailOptions = {
                from: 'theblossomtheblossom@gmail.com',
                to: orden.cliente.email,
                subject: '¡Gracias por tu orden!.',
                html: htmlToSend
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (!error) {
                    console.log('Email sent: ' + info.response);
                }
            });

        });
    } catch (error) {
        console.log(error);
    }
}

const obtener_ventas_admin = async function (req, res) {
    if (req.user) {
        let ventas = [];
        let desde = req.params['desde'];
        let hasta = req.params['hasta'];

        ventas = await Venta.find().populate('cliente').populate('direccion').sort({
            createdAt: -1
        });
        res.status(200).send({
            data: ventas
        });


    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const obtener_detalles_ordenes_cliente = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];

        try {
            let venta = await Venta.findById({
                _id: id
            }).populate('direccion').populate('cliente');
            let detalles = await Dventa.find({
                venta: venta._id
            }).populate('producto').populate('variedad');
            res.status(200).send({
                data: venta,
                detalles: detalles
            });

        } catch (error) {
            console.log(error);
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

const marcar_finalizado_orden = async function (req, res) {
    if (req.user) {

        var id = req.params['id'];
        let data = req.body;

        var venta = await Venta.findByIdAndUpdate({
            _id: id
        }, {
            estado: 'Finalizado'
        });

        res.status(200).send({
            data: venta
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const eliminar_orden_admin = async function (req, res) {
    if (req.user) {

        var id = req.params['id'];

        var venta = await Venta.findOneAndRemove({
            _id: id
        });
        await Dventa.remove({
            venta: id
        });

        res.status(200).send({
            data: venta
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const marcar_envio_orden = async function (req, res) {
    if (req.user) {

        var id = req.params['id'];
        let data = req.body;

        var venta = await Venta.findByIdAndUpdate({
            _id: id
        }, {
            tracking: data.tracking,
            estado: 'Enviado'
        });

        mail_confirmar_envio(id);

        res.status(200).send({
            data: venta
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const confirmar_pago_orden = async function (req, res) {
    if (req.user) {

        var id = req.params['id'];
        let data = req.body;

        var venta = await Venta.findByIdAndUpdate({
            _id: id
        }, {
            estado: 'Procesando'
        });

        var detalles = await Dventa.find({
            venta: id
        });
        for (var element of detalles) {
            let element_producto = await Producto.findById({
                _id: element.producto
            });
            let new_stock = element_producto.stock - element.cantidad;
            let new_ventas = element_producto.nventas + 1;

            let element_variedad = await Variedad.findById({
                _id: element.variedad
            });
            let new_stock_variedad = element_variedad.stock - element.cantidad;

            await Producto.findByIdAndUpdate({
                _id: element.producto
            }, {
                stock: new_stock,
                nventas: new_ventas
            });

            await Variedad.findByIdAndUpdate({
                _id: element.variedad
            }, {
                stock: new_stock_variedad,
            });
        }

        res.status(200).send({
            data: venta
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}


const mail_confirmar_envio = async function (venta) {
    try {
        var readHTMLFile = function (path, callback) {
            fs.readFile(path, {
                encoding: 'utf-8'
            }, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                } else {
                    callback(null, html);
                }
            });
        };

        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: 'theblossomtheblossom@gmail.com',
                pass: 'mlbpbejrnfzivuyj'
            }
        }));


        var orden = await Venta.findById({
            _id: venta
        }).populate('cliente').populate('direccion');
        var dventa = await Dventa.find({
            venta: venta
        }).populate('producto').populate('variedad');


        readHTMLFile(process.cwd() + '/mails/email_enviado.html', (err, html) => {

            let rest_html = ejs.render(html, {
                orden: orden,
                dventa: dventa
            });

            var template = handlebars.compile(rest_html);
            var htmlToSend = template({
                op: true
            });

            var mailOptions = {
                from: 'theblossomtheblossom@gmail.com',
                to: orden.cliente.email,
                subject: 'Tu pedido ' + orden._id + ' fué enviado',
                html: htmlToSend
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (!error) {
                    console.log('Email sent: ' + info.response);
                }
            });

        });
    } catch (error) {
        console.log(error);
    }
}

const registro_compra_manual_cliente = async function (req, res) {
    if (req.user) {

        var data = req.body;
        var detalles = data.detalles;

        data.estado = 'Procesando';

        console.log(data);

        let venta = await Venta.create(data);

        for (var element of detalles) {
            element.venta = venta._id;
            element.cliente = venta.cliente;
            await Dventa.create(element);

            let element_producto = await Producto.findById({
                _id: element.producto
            });
            let new_stock = element_producto.stock - element.cantidad;
            let new_ventas = element_producto.nventas + 1;

            let element_variedad = await Variedad.findById({
                _id: element.variedad
            });
            let new_stock_variedad = element_variedad.stock - element.cantidad;

            await Producto.findByIdAndUpdate({
                _id: element.producto
            }, {
                stock: new_stock,
                nventas: new_ventas
            });

            await Variedad.findByIdAndUpdate({
                _id: element.variedad
            }, {
                stock: new_stock_variedad,
            });
        }

        enviar_orden_compra(venta._id);

        res.status(200).send({
            venta: venta
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const enviar_orden_compra = async function (venta) {
    try {
        var readHTMLFile = function (path, callback) {
            fs.readFile(path, {
                encoding: 'utf-8'
            }, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                } else {
                    callback(null, html);
                }
            });
        };

        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: 'theblossomtheblossom@gmail.com',
                pass: 'mlbpbejrnfzivuyj'
            }
        }));


        var orden = await Venta.findById({
            _id: venta
        }).populate('cliente').populate('direccion');
        var dventa = await Dventa.find({
            venta: venta
        }).populate('producto').populate('variedad');


        readHTMLFile(process.cwd() + '/mails/email_compra.html', (err, html) => {

            let rest_html = ejs.render(html, {
                orden: orden,
                dventa: dventa
            });

            var template = handlebars.compile(rest_html);
            var htmlToSend = template({
                op: true
            });

            var mailOptions = {
                from: 'theblossomtheblossom@gmail.com',
                to: orden.cliente.email,
                subject: 'Confirmación de compra ' + orden._id,
                html: htmlToSend
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (!error) {
                    console.log('Email sent: ' + info.response);
                }
            });

        });
    } catch (error) {
        console.log(error);
    }
}

/*MODULOS PARA LA CREACION DE AMDINISTRADORES */
listar_admins_tienda = async function (req, res) {
    if (req.user) {
        var admins = await Admin.find();
        res.status(200).send({
            data: admins
        });
    } else {
        res.status(500).send({
            message: 'NoAccess'
        });
    }
}

const obtener_admin_seleccionado = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        try {
            var reg = await Admin.findById({
                _id: id
            });
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

const registro_admin_tienda = async function (req, res) {
    if (!req.user) {
        res.status(500).send({
            message: 'NoAccess'
        });
    } else {
        var data = req.body;
        console.log(data);
        var admins_arr = [];

        admins_arr = await Admin.find({
            email: data.email
        });
        console.log('ADMINISTRADOR DUPLICADO....');
        console.log(data);
        if (admins_arr.length == 0) {
            if (data.password) {
                bcrypt.hash(data.password, null, null, async function (err, hash) {
                    if (hash) {
                        data.password = hash;
                        var reg = await Admin.create(data);
                        res.status(200).send({
                            data: reg
                        });
                    } else {
                        res.status(200).send({
                            message: 'ErrorServer',
                            data: undefined
                        });
                    }
                });
            } else {
                res.status(200).send({
                    message: 'No hay una contraseña',
                    data: undefined
                });
            }
        } else {
            res.status(200).send({
                message: 'El correo ya existe en la base de datos',
                data: undefined
            });
        }
    }

}

const actualizar_admin_seleccionado = async function (req, res) {
    if (!req.user) {
        res.status(500).send({
            message: 'NoAccess'
        });
    } else {
        var data = req.body;
        let id = req.params['id'];
        let reg_admin = await Admin.findById({
            _id: id
        });
        // manuel@manuel.com

        // manuel@manuel.com == manuel@manuel.com

        if (reg_admin.email == data.email) {
            let reg = await Admin.findByIdAndUpdate({
                _id: id
            }, {
                nombres: data.nombres,
                apellidos: data.apellidos,
                //email: data.email,
                fecha_inicio: data.fecha_inicio,
                fecha_fin: data.fecha_fin,
                estado_cuenta: data.estado_cuenta,
            });
            res.status(200).send({
                data: reg
            });
        }
        // admin@admin.com  != manuel@manuel.com
        else if (reg_admin.email != data.email) {
            let email_dup = await Admin.find({
                email: data.email
            });
            if (email_dup.length == 0) {
                let reg = await Admin.findByIdAndUpdate({
                    _id: id
                }, {
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    email: data.email,
                    fecha_inicio: data.fecha_inicio,
                    fecha_fin: data.fecha_fin,
                    estado_cuenta: data.estado_cuenta,
                });
                res.status(200).send({
                    data: reg
                });
            } else {
                res.status(200).send({
                    message: 'El correo ya esta siendo usado por otro administrador',
                    data: undefined
                });
            }
        } else {
            res.status(200).send({
                message: 'El correo ya esta siendo usado por otro administrador',
                data: undefined
            });
        }
    }


}

const eliminar_admin_seleccionado = async function (req, res) {
    let id = req.params['id'];
    if (!req.user || !id) {
        res.status(500).send({
            message: 'NoAccess'
        });
    } else {
        let reg = await Admin.findByIdAndRemove({
            _id: id
        });
        res.status(200).send({
            data: reg,
            message: 'El usuario se ha eliminado correctamente.'
        });
    }
}



const cambiar_pass_admin_seleccionado = async function (req, res) {
    if (!req.user) {
        res.status(500).send({
            message: 'NoAccess'
        });
    } else {
        let data = req.body;
        let id = req.params['id'];
        try {
            let reg = await Admin.findById({
                _id: id
            });
            if (data.password == '') {
                bcrypt.hash(data.password2, null, null, async function (err, hash) {
                    if (hash) {
                        let reg = await Admin.findByIdAndUpdate({
                            _id: id
                        }, {
                            password: hash
                        });
                        res.status(200).send({
                            data: reg
                        });
                    } else {
                        res.status(200).send({
                            message: 'Hubo un error en el servidor',
                            data: undefined
                        });
                    }
                });
            } else {
                bcrypt.compare(data.password, reg.password, async function (error, check) {
                    if (check) {
                        bcrypt.hash(data.password2, null, null, async function (err, hash) {
                            if (hash) {
                                let reg = await Admin.findByIdAndUpdate({
                                    _id: id
                                }, {
                                    password: hash
                                });
                                res.status(200).send({
                                    data: reg
                                });
                            } else {
                                res.status(200).send({
                                    message: 'Hubo un error en el servidor',
                                    data: undefined
                                });
                            }
                        });
                    } else {
                        res.status(200).send({
                            message: 'Las credenciales no coinciden',
                            data: undefined
                        });
                    }
                });
            }


        } catch (err) {}
    }

}


/*CLIENTES */
const obtener_cliente_seleccionado = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        try {
            var reg = await Cliente.findById({
                _id: id
            });
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
const cambiar_pass_cliente_seleccionado = async function (req, res) {
    if (!req.user) {
        res.status(500).send({
            message: 'NoAccess'
        });
    } else {
        let data = req.body;
        let id = req.params['id'];
        try {
            bcrypt.hash(data.password, null, null, async function (err, hash) {
                if (hash) {
                    let reg = await Cliente.findByIdAndUpdate({
                        _id: id
                    }, {
                        password: hash
                    });
                    res.status(200).send({
                        data: reg,
                        message: 'Contraseña actualizada correctamente.'
                    });
                } else {
                    res.status(200).send({
                        message: 'Hubo un error en el servidor',
                        data: undefined
                    });
                }
            });

        } catch (err) {
            
        }
    }

}

const eliminar_cliente_seleccionado = async function (req, res) {
    let id = req.params['id'];
    if (!req.user || !id) {
        res.status(500).send({
            message: 'NoAccess'
        });
    } else {
        let reg = await Cliente.findByIdAndRemove({
            _id: id
        });
        res.status(200).send({
            data: reg,
            message: 'El cliente se ha eliminado correctamente.'
        });
    }
}


/* MÉTODOS PARA CATALOGOS */

const obtener_catalogos = async function (req, res) {
    if (req.user) {
        try {
            var reg = await Catalogo.find();
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


const registro_catalogo_admin = async function (req, res) {
    if (req.user) {
        let data = req.body;
        try {
            var reg = await Catalogo.create(data);
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
module.exports = {
    login_admin,
    eliminar_etiqueta_admin,
    listar_etiquetas_admin,
    agregar_etiqueta_admin,
    registro_producto_admin,
    listar_productos_admin,
    obtener_producto_admin,
    listar_etiquetas_producto_admin,
    eliminar_etiqueta_producto_admin,
    agregar_etiqueta_producto_admin,
    obtener_portada,
    actualizar_producto_admin,
    listar_variedades_admin,
    actualizar_producto_variedades_admin,
    agregar_nueva_variedad_admin,
    eliminar_variedad_admin,
    listar_inventario_producto_admin,
    registro_inventario_producto_admin,
    agregar_imagen_galeria_admin,
    eliminar_imagen_galeria_admin,
    verificar_token,
    cambiar_vs_producto_admin,
    obtener_config_admin,
    actualizar_config_admin,
    pedido_compra_cliente,
    obtener_ventas_admin,
    obtener_detalles_ordenes_cliente,
    marcar_finalizado_orden,
    eliminar_orden_admin,
    marcar_envio_orden,
    confirmar_pago_orden,
    registro_compra_manual_cliente,
    listar_variedades_productos_admin,
    listar_admins_tienda,
    registro_admin_tienda,
    obtener_admin_seleccionado,
    actualizar_admin_seleccionado,
    eliminar_admin_seleccionado,
    cambiar_pass_admin_seleccionado,
    cambiar_pass_cliente_seleccionado,
    obtener_cliente_seleccionado,
    eliminar_cliente_seleccionado,
    obtener_catalogos,
    registro_catalogo_admin
}