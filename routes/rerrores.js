module.exports = function (app, swig, gestorBD) {

    app.get("/error", function (req, res) {
        let texto = req.session.error;
        req.session.error = null;
        let respuesta = swig.renderFile('views/error.html', {
            texto: texto
        });
        res.send(respuesta);
    });

};