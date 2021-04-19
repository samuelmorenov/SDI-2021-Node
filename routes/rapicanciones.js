module.exports = function (app, gestorBD) {

    //Listar canciones
    app.get("/api/cancion", function (req, res) {
        gestorBD.obtenerCanciones({}, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({error: "se ha producido un error"})
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones));
            }
        });
    });

    //Obtener una cancion
    app.get("/api/cancion/:id", function (req, res) {
        var criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({error: "se ha producido un error"})
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones[0]));
            }
        });
    });

    //Borrar una cancion
    app.delete("/api/cancion/:id", function (req, res) {
        var criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}

        comprobarAutoria(req.params.id, res, function () {
        gestorBD.eliminarCancion(criterio, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({error: "se ha producido un error"})
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones));
            }
        });
        });
    });

    //Añadir una cancion
    app.post("/api/cancion", function (req, res) {
        let usuario = res.usuario;
        var cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero, precio:
            req.body.precio,
            autor: usuario
        }
        // ¿Validar nombre, genero, precio?

        if(!comprobarDatosCancion(cancion, res)){
            return
        }

        gestorBD.insertarCancion(cancion, function (id) {
            if (id == null) {
                res.status(500);
                res.json({error: "se ha producido un error"})
            } else {
                res.status(201);
                res.json({mensaje: "canción insertarda", _id: id})
            }
        });
    });

    //Modificar una cancion
    app.put("/api/cancion/:id", function(req, res) {

        comprobarAutoria(req.params.id, res, function () {

        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };

        let cancion = {}; // Solo los atributos a modificar
        if ( req.body.nombre != null)
            cancion.nombre = req.body.nombre;
        if ( req.body.genero != null)
            cancion.genero = req.body.genero;
        if ( req.body.precio != null)
            cancion.precio = req.body.precio;

        if(!comprobarDatosCancion(cancion, res)){
            return
        }

        gestorBD.modificarCancion(criterio, cancion, function(result) {
            if (result == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.json({
                    mensaje : "canción modificada",
                    _id : req.params.id
                })
            }
        });
        });
    });

    //Autentificarse
    app.post("/api/autenticar/", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        }

        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401);
                res.json({
                    autenticado: false
                })
            } else {
                var token = app.get('jwt').sign(
                    {
                        usuario: criterio.email,
                        tiempo: Date.now() / 1000
                    },
                    "secreto");
                res.status(200);
                res.json(
                    {
                        autenticado: true,
                        token: token
                    })
            }
        })
    });

    //Funcion auxiliar de comprobacion de validez de datos de una cancion
    function comprobarDatosCancion(cancion, res) {

        if (String(cancion.nombre).length <= 2 || String(cancion.genero).length <= 2) {
            res.status(400);
            res.json({
                error: "Los campos de nombre y genero deben tener al menos 3 caracteres"
            });
            return false;
        }
        if (cancion.precio <= 0) {
            res.status(400);
            res.json({
                error: "El precio debe tener un valor positivo"
            });
            return false;
        }
        return true;
    };

    //Funcion auxiliar de comprobacion de existencia y autoria de una cancion
    function comprobarAutoria(idCancion, res, callback){
        var criterio = {"_id": gestorBD.mongo.ObjectID(idCancion)}
        let usuario = res.usuario;

        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.status(404);
                res.json({
                    error: "La cancion no existe"
                });
            } else if (canciones[0].autor !== usuario) {
                res.status(403);
                res.json({
                    error: "Debes ser el autor de la cancion"
                });
            } else {
                callback();
            }
        })
    }
};

