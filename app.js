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
        this.generatePlanets();
        this.express = express();
        this.middleware();
        this.routes();
    }
    // Configure Express middleware
    App.prototype.middleware = function () {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
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
            var name = req.body.name;
            if (_this.isNameAlreadyInUse(name)) {
                return res.status(400).send({ message: 'The name of the planet is already in use' });
            }
            else {
                var newPlanet = _this.createPlanet(req.body.name);
                _this.planets.push(newPlanet);
                res.json(_this.planets);
            }
        });
        // Update planet by id
        this.express.put("/planets/:id", function (req, res, next) {
            _this.log.info(req.url);
            var name = req.body.name;
            if (_this.isNameAlreadyInUse(name)) {
                return res.status(400).send({ message: 'The name of the planet is already in use' });
            }
            else {
                var planet = _this.planets.filter(function (planet) {
                    if (req.params.id === planet.id.toString()) {
                        planet.name = req.body.name;
                        return planet;
                    }
                });
                res.json(planet);
            }
        });
        // Undefined routes
        this.express.use('*', function (req, res, next) {
            _this.log.info(req.url);
            res.send("Incorrect URL");
        });
    };
    App.prototype.createPlanet = function (name) {
        var planet = new planet_1.Planet();
        planet.id = this.generateId();
        planet.name = name;
        return planet;
    };
    App.prototype.isNameAlreadyInUse = function (name) {
        return this.planets.some(function (planet) { return planet.name === name; });
    };
    App.prototype.generateId = function () {
        return this.planets.length === 0
            ? 1
            : 1 + Math.max.apply(Math, this.planets.map(function (planet) { return planet.id; }));
    };
    App.prototype.generatePlanets = function () {
        var p1 = this.createPlanet('Earth');
        this.planets.push(p1);
        var p2 = this.createPlanet('Mars');
        this.planets.push(p2);
    };
    return App;
}());
exports["default"] = new App().express;
