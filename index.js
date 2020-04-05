"use strict";
exports.__esModule = true;
var app_1 = require("./app");
var http = require("http");
var cors = require("cors");
var mongoose = require('mongoose');
var port = process.env.PORT || 8080;
app_1["default"].use(cors());
app_1["default"].set('port', port);
var server = http.createServer(app_1["default"]);
server.listen(port);
server.on('listening', function () {
    var addr = server.address();
    var bind = (typeof addr === 'string') ? "pipe " + addr : "port " + addr.port;
    console.log("Listening on " + bind);
    var mongodbConnection = "mongodb+srv://planetarium:planetarium2020@planetariumdb-og3n8.mongodb.net/planets?retryWrites=true&w=majority";
    // Connect to MongoDB with Mongoose.
    mongoose.connect(mongodbConnection, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(function () { return console.log("MongoDB connected"); })["catch"](function (err) { return console.log(err); });
});
module.exports = app_1["default"];
