"use strict";
exports.__esModule = true;
var app_1 = require("./app");
var http = require("http");
var port = process.env.PORT || 8080;
app_1["default"].set('port', port);
var server = http.createServer(app_1["default"]);
server.listen(port);
module.exports = app_1["default"];
