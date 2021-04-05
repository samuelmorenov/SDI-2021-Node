module.exports = function (app, swig, gestorBD) {
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