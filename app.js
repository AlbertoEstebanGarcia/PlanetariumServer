"use strict";
exports.__esModule = true;
var express = require("express");
var bodyParser = require("body-parser");
var logger_1 = require("./logger");
var planet_1 = require("./model/planet");
var App = /** @class */ (function () {
    function App() {
        this.planets = [];
        this.log = new logger_1.Logger();
        this.express = express();
        this.middleware();
        this.routes();
    }
    // Configure Express middleware
    App.prototype.middleware = function () {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(function (req, res, next) {
            // Website you wish to allow to connect
            res.header('Access-Control-Allow-Origin', '*');
            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            // Pass to next layer of middleware
            next();
        });
    };
    App.prototype.routes = function () {
        var _this = this;
        this.express.get('/', function (req, res, next) {
            res.send("Welcome to the Planetarium REST API");
        });
        // Get all the planets
        this.express.get("/planets", function (req, res, next) {
            _this.log.info(req.url);
            res.json(_this.planets);
        });
        // Get planet by name
        this.express.get("/planets/:name", function (req, res, next) {
            _this.log.info(req.url);
            var planet = _this.planets.filter(function (planet) {
                if (req.params.name.toLowerCase() === planet.name.toLowerCase()) {
                    return planet;
                }
            });
            res.json(planet);
        });
        // Add a new planet        
        this.express.post("/planets", function (req, res, next) {
            _this.log.info(req.url);
            if (_this.isDataValid(req.body)) {
                var planet = new planet_1.Planet();
                planet.id = _this.generateId();
                planet = _this.setPlanetAttributes(planet, req.body);
                _this.planets.push(planet);
                res.json(_this.planets);
            }
            else {
                return _this.error(res, 400, 'The parameters provided are incorrect, avoiding to add a new planet');
            }
        });
        // Update planet by id
        this.express.put("/planets/:id", function (req, res, next) {
            _this.log.info(req.url);
            if (_this.isDataValid(req.body)) {
                var planet = _this.planets.filter(function (planet) {
                    if (req.params.id === planet.id.toString()) {
                        return _this.setPlanetAttributes(planet, req.body);
                    }
                });
                if (planet) {
                    res.json(planet);
                }
                else {
                    return _this.error(res, 400, 'Planet does not exist');
                }
            }
            else {
                return _this.error(res, 400, 'The parameters provided are incorrect, avoiding to update the planet');
            }
        });
        // Delete planet by id
        this.express["delete"]("/planets/:id", function (req, res, next) {
            _this.log.info(req.url);
            var success = _this.deletePlanet(req.params.id);
            if (success) {
                return _this.success(res, 200, 'success');
            }
            else {
                return _this.error(res, 400, 'Planet does not exist');
            }
        });
        // Undefined routes
        this.express.use('*', function (req, res, next) {
            _this.log.info(req.url);
            return _this.error(res, 400, 'Incorrect URL');
        });
    };
    App.prototype.setPlanetAttributes = function (planet, body) {
        planet.name = body.name;
        planet.distance = body.distance;
        planet.gravity = body.gravity;
        planet.satellites = body.satellites;
        planet.radius = body.radius;
        planet.imageUrl = body.imageUrl;
        return planet;
    };
    App.prototype.deletePlanet = function (id) {
        var position = this.planets.findIndex(function (planet) { return planet.id === id; });
        if (position > -1) {
            this.planets.splice(position, 1);
            return true;
        }
        else {
            return false;
        }
    };
    App.prototype.isDataValid = function (body) {
        var isDataValid = true;
        if (!body.name || !body.distance || !body.gravity || !body.satellites || !body.radius || !body.imageUrl) {
            isDataValid = false;
        }
        else {
            if (body.distance < 0 || body.gravity < 0 || body.satellites < 0 || body.radius < 0) {
                isDataValid = false;
            }
            if (!body.imageUrl) {
                isDataValid = false;
            }
        }
        return isDataValid;
    };
    App.prototype.generateId = function () {
        return this.planets.length === 0
            ? 1
            : 1 + Math.max.apply(Math, this.planets.map(function (planet) { return planet.id; }));
    };
    App.prototype.success = function (response, status, message) {
        return response.status(status).send({ message: message });
    };
    App.prototype.error = function (response, status, error) {
        return response.status(status).send({ error: error });
    };
    return App;
}());
exports["default"] = new App().express;
