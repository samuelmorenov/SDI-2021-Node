module.exports = function (app, swig, gestorBD) {
    app.get('/comentario/borrar/:comentario_id', function (req, res) {
        if (req.session.usuario == null) {
            res.send("Error al eliminar comentario, se necesita estar identificado.");
            return;
        };
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.comentario_id)};
        gestorBD.borrarComentario(criterio, function (result) {
            if (result == null) {
                res.send("Error al eliminar comentario");
            } else {
                res.redirect('/tienda');
            }
        });

    });

    app.post('/comentario/:cancion_id', function (req, res) {
        if (req.session.usuario == null) {
            res.send("Error al insertar comentario, se necesita estar identificado.");
            return;
        };
        let comentario = {
            autor: req.session.usuario,
            texto: req.body.texto,
            cancion_id: gestorBD.mongo.ObjectID(req.params.cancion_id)
        }
        gestorBD.insertarComentario(comentario, function (id) {
            if (id == null) {
                res.send("Error al insertar comentario");
            } else {
                res.send("Agregado el comentario: " + id);
            }
        });

    });
};