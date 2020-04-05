const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlanetSchema = new Schema({
  name: { type: String, required: true },
  distance: { type: String },
  gravity: { type: String },
  satellites: { type: String },
  radius: { type: String },
  imageUrl: { type: String }
});

export default mongoose.model("PlanetDTO", PlanetSchema);