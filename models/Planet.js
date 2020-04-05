"use strict";
exports.__esModule = true;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PlanetSchema = new Schema({
    name: { type: String, required: true },
    distance: { type: String },
    gravity: { type: String },
    satellites: { type: String },
    radius: { type: String },
    imageUrl: { type: String }
});
exports["default"] = mongoose.model("PlanetDTO", PlanetSchema);
