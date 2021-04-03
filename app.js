// Módulos
let express = require('express');
let app = express();

let mongo = require('mongodb');
let swig = require('swig');
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// Variables
app.set('port', 8081);
let fs = require('fs');
let pass = fs.readFileSync('pass.txt', 'utf-8');
app.set('db','mongodb://admin:'+pass+'@tiendamusica-shard-00-00-8d9nh.mongodb.net:27017,tiendamusica-shard-00-01-8d9nh.mongodb.net:27017,tiendamusica-shard-00-02-8d9nh.mongodb.net:27017/test?ssl=true&replicaSet=tiendamusica-shard-0&authSource=admin&retryWrites=true&w=majority');

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, mongo);
require("./routes/rcanciones.js")(app, swig, mongo);
require("./routes/rautores.js")(app, swig, mongo);

// lanzar el servidor
app.listen(app.get('port'), function () {
    console.log("Servidor activo en http://localhost:8081/");
});