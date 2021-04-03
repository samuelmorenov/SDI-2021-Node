module.exports = function (app, swig, mongo) {

    app.get('/autores/agregar', function (req, res) {
        var roles = [
            {"nombre": "Cantante"},
            {"nombre": "Bateria"},
            {"nombre": "Guitarrista"},
            {"nombre": "Bajista"},
            {"nombre": "Teclista"}
        ];
        let respuesta = swig.renderFile('views/autores-agregar.html', {
            roles: roles
        });
        res.send(respuesta);
    });

    app.post("/autores/agregar", function (req, res) {
        res.send(
            "Autor agregado:" + req.body.nombre + "<br>"
            + " Grupo :" + req.body.grupo + "<br>"
            + " Rol: " + req.body.rol)
        ;
    });

    app.get("/autores", function (req, res) {
        var autores = [
            {"nombre": "Juan", "grupo": "Los escarabajos", "rol": "Guitarrista"},
            {"nombre": "Federico", "grupo": "Reina", "rol": "Cantante"}
        ];
        let respuesta = swig.renderFile('views/autores.html', {
            autores: autores
        });
        res.send(respuesta);
    });

    app.get("/autores/*", function (req, res) {
        res.redirect("/autores");
    });

}