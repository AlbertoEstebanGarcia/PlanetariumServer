"use strict";
exports.__esModule = true;
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var logger_1 = require("./logger");
var planet_1 = require("./models/planet");
var App = /** @class */ (function () {
    function App() {
        this.SUCCESS_CODE = 200;
        this.BAD_REQUEST_CODE = 400;
        this.INTERNAL_ERROR_CODE = 500;
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
            _this.getAllPlanets().then(function (planets) {
                if (planets) {
                    res.json(planets);
                }
                else {
                    _this.error(res, _this.INTERNAL_ERROR_CODE, 'Error getting planets from database');
                }
            });
        });
        // Add a new planet        
        this.express.post("/planets", function (req, res, next) {
            _this.log.info(req.url);
            if (_this.isDataValid(req.body)) {
                _this.addPlanet(req.body).then(function (planet) {
                    if (planet) {
                        res.json(planet);
                    }
                    else {
                        _this.error(res, _this.INTERNAL_ERROR_CODE, 'Error adding planet to database');
                    }
                });
            }
            else {
                return _this.error(res, _this.BAD_REQUEST_CODE, 'The parameters provided are incorrect, avoiding to add a new planet');
            }
        });
        // Update planet by id
        this.express.put("/planets/:id", function (req, res, next) {
            _this.log.info(req.url);
            if (_this.isDataValid(req.body)) {
                _this.updatePlanet(req.params.id, req.body).then(function (planet) {
                    if (planet) {
                        res.json(planet);
                    }
                    else {
                        _this.error(res, _this.INTERNAL_ERROR_CODE, 'Error updating planet from database');
                    }
                });
            }
            else {
                return _this.error(res, _this.BAD_REQUEST_CODE, 'The parameters provided are incorrect, avoiding to update the planet');
            }
        });
        // Delete planet by id
        this.express["delete"]("/planets/:id", function (req, res, next) {
            _this.deletePlanet(req.params.id).then(function (planet) {
                if (planet) {
                    _this.success(res);
                }
                else {
                    _this.error(res, _this.INTERNAL_ERROR_CODE, 'Error deleting planet from database');
                }
            });
        });
        // Undefined routes
        this.express.use('*', function (req, res, next) {
            _this.log.info(req.url);
            return _this.error(res, 400, 'Incorrect URL');
        });
    };
    App.prototype.getAllPlanets = function () {
        var _this = this;
        return planet_1["default"].find({}).then(function (result) {
            return result;
        })["catch"](function (error) {
            _this.log.info("Unable to retrieve all the planets" + error);
            return undefined;
        });
    };
    App.prototype.addPlanet = function (body) {
        var _this = this;
        var data = new planet_1["default"](body);
        return data.save()
            .then(function (planet) {
            _this.log.info("Added new planet to the database" + planet);
            return planet;
        })["catch"](function (error) {
            _this.log.info("Unable to add new planet to the database" + error);
            return undefined;
        });
    };
    App.prototype.updatePlanet = function (id, body) {
        var _this = this;
        if (mongoose.Types.ObjectId.isValid(id)) {
            return planet_1["default"].findByIdAndUpdate(id, { $set: body }, { "new": true }).then(function (planet) {
                if (planet) {
                    _this.log.info("Updated planet with id " + id);
                    return planet;
                }
                else {
                    _this.log.info("Unable to update the planet with id: " + id);
                    return undefined;
                }
            })["catch"](function (error) {
                _this.log.info("Error in the database: " + error);
                return undefined;
            });
        }
        else {
            this.log.info('Invalid Mongo id' + id);
            return undefined;
        }
    };
    App.prototype.deletePlanet = function (id) {
        var _this = this;
        if (mongoose.Types.ObjectId.isValid(id)) {
            return planet_1["default"].deleteOne({ _id: id })
                .then(function (planet) {
                if (planet) {
                    _this.log.info('Removed planet with id ' + id);
                    return planet;
                }
                else {
                    _this.log.info("Unable to delete the planet with id: " + id);
                    return undefined;
                }
            })["catch"](function (error) {
                _this.log.info("Error in the database: " + error);
                return undefined;
            });
        }
        else {
            this.log.info('Invalid Mongo id' + id);
            return undefined;
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
    App.prototype.success = function (response) {
        return response.status(this.SUCCESS_CODE).send({ message: 'Success' });
    };
    App.prototype.error = function (response, status, error) {
        return response.status(status).send({ error: error });
    };
    return App;
}());
exports["default"] = new App().express;
