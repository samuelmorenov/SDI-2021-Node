module.exports = function (app, swig, gestorBD) {

    app.post("/cancion", function (req, res) {
        if (req.session.usuario == null) {
            res.redirect("/tienda");
            return;
        }
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
            autor: req.session.usuario
        };
        // Conectarse
        gestorBD.insertarCancion(cancion, function (id) {
            if (id == null) {
                req.session.error = "Error al insertar canción";
                res.redirect('/error');
            } else {
                if (req.files.portada != null) {
                    let imagen = req.files.portada;
                    imagen.mv('public/portadas/' + id + '.png', function (err) {
                        if (err) {
                            req.session.error = "Error al subir la portada";
                            res.redirect('/error');
                        } else {
                            if (req.files.audio != null) {
                                let audio = req.files.audio;
                                audio.mv('public/audios/' + id + '.mp3', function (err) {
                                    if (err) {
                                        req.session.error = "Error al subir el audio";
                                        res.redirect('/error');
                                    } else {
                                        res.redirect("/publicaciones");
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });

    app.get('/canciones/agregar', function (req, res) {
        if (req.session.usuario == null) {
            res.redirect("/tienda");
            return;
        }
        let respuesta = swig.renderFile('views/bagregar.html', {});
        res.send(respuesta);
    });

    app.get("/canciones", function (req, res) {
        var canciones = [
            {"nombre": "Blank space", "precio": "1.2"},
            {"nombre": "See you again", "precio": "1.3"},
            {"nombre": "Uptown Funk", "precio": "1.1"}
        ];
        let respuesta = swig.renderFile('views/btienda.html', {
            vendedor: 'Tienda de canciones',
            canciones: canciones
        });
        res.send(respuesta);
    });

    app.get('/suma', function (req, res) {
        let respuesta = parseInt(req.query.num1) + parseInt(req.query.num2);
        res.send(String(respuesta));
    });

    app.get('/cancion/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                req.session.error = "Error al obtener la cancion";
                res.redirect('/error');
            } else {
                let criterio = {"cancion_id": gestorBD.mongo.ObjectID(req.params.id)};
                gestorBD.obtenerComentarios(criterio, function (comentarios) {
                    if (comentarios == null) {
                        req.session.error = "Error al obtener la cancion";
                        res.redirect('/error');
                    } else {
                        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
                        let criterio = {
                            usuario: req.session.usuario,
                            cancionId: cancionId
                        };
                        gestorBD.obtenerCompras(criterio, function (compras) {
                            if (compras == null) {
                                req.session.error = "Error al obtener la cancion";
                                res.redirect('/error');
                            } else {
                                let sepuedecomprar = true;
                                if (compras.length != 0 || canciones[0].autor == req.session.usuario) {
                                    sepuedecomprar = false;
                                }
                                let respuesta = swig.renderFile('views/bcancion.html',
                                    {
                                        puedecomprar: sepuedecomprar,
                                        comentario: comentarios,
                                        cancion: canciones[0]
                                    });
                                res.send(respuesta);

                            }
                        });
                    }
                });
            }
        });
    });

    app.get('/cancion/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarCancion(criterio,function(canciones){
            if ( canciones == null ){
                req.session.error = "Error al eliminar la cancion";
                res.redirect('/error');
            } else {
                res.redirect("/publicaciones");
            }
        });
    });

    app.get('/canciones/:genero/:id', function (req, res) {
        var respuesta = 'id: ' + req.params.id + '<br>'
            + 'Genero: ' + req.params.genero;
        res.send(respuesta);
    });

    app.get("/tienda", function (req, res) {

        let criterio = {};

        if (req.query.busqueda != null) {
            criterio = {"nombre": {$regex: ".*" + req.query.busqueda + ".*"}};
        }

        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }

        gestorBD.obtenerCancionesPg(criterio, pg, function (canciones, total) {
            if (canciones == null) {
                req.session.error = "Error al obtener las canciones";
                res.redirect('/error');
            } else {
                let ultimaPg = total / 4;
                if (total % 4 > 0) { // Sobran decimales
                    ultimaPg = ultimaPg + 1;
                }
                let paginas = []; // paginas mostrar
                for (let i = pg - 2; i <= pg + 2; i++) {
                    if (i > 0 && i <= ultimaPg) {
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones: canciones,
                        paginas: paginas,
                        actual: pg
                    });
                res.send(respuesta);
            }
        });
    });

    app.get("/publicaciones", function (req, res) {
        let criterio = {autor: req.session.usuario};
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                req.session.error = "Error al obtener las publicaciones";
                res.redirect('/error');
            } else {
                let respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        canciones: canciones
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                req.session.error = "Error al obtener las canciones";
                res.redirect('/error');
            } else {
                let respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion : canciones[0]
                    });
                res.send(respuesta);
            }
        });
    });

    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = {"_id": gestorBD.mongo.ObjectID(id)};
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio
        }
        gestorBD.modificarCancion(criterio, cancion, function (result) {
            if (result == null) {
                req.session.error = "Error al modificar la cancion";
                res.redirect('/error');
            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if (result == null) {
                        req.session.error = "Error en la modificación";
                        res.redirect('/error');
                    } else {
                        //res.send("Modificado");
                        res.redirect("/publicaciones");
                    }
                });
            }
        });
    });

    app.get('/cancion/comprar/:id', function (req, res) {
        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
        let compra = {
            usuario: req.session.usuario,
            cancionId: cancionId
        }

        gestorBD.obtenerCompras(compra, function (compras) {
            if (compras == null) {
                req.session.error = "Error al listar compras";
                res.redirect('/error');
            } else {
                if(compras.length != 0){
                    req.session.error = "Error: Ya comprada";
                    res.redirect('/error');
                }
                else{
                    gestorBD.insertarCompra(compra, function (idCompra) {
                        if (idCompra == null) {
                            req.session.error = "Error: No se ha podido realizar la compra";
                            res.redirect('/error');
                        } else {
                            res.redirect("/compras");
                        }
                    });
                }
            }
        });
    });

    app.get('/compras', function (req, res) {
        let criterio = {"usuario": req.session.usuario};
        gestorBD.obtenerCompras(criterio, function (compras) {
            if (compras == null) {
                req.session.error = "Error al listar compras";
                res.redirect('/error');
            } else {
                let cancionesCompradasIds = [];
                for (i = 0; i < compras.length; i++) {
                    cancionesCompradasIds.push(compras[i].cancionId);
                }

                let criterio = {"_id": {$in: cancionesCompradasIds}}
                gestorBD.obtenerCanciones(criterio, function (canciones) {
                    let respuesta = swig.renderFile('views/bcompras.html',
                        {
                            canciones: canciones
                        });
                    res.send(respuesta);
                });
            }
        });
    });

    function paso1ModificarPortada(files, id, callback) {
        if (files && files.portada != null) {
            let imagen = files.portada;
            imagen.mv('public/portadas/' + id + '.png', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    };

    function paso2ModificarAudio(files, id, callback) {
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/' + id + '.mp3', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    };
}
;