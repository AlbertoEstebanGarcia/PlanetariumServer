// Imports
import App from './app/app';
import * as http from 'http';
const mongoose = require('mongoose');

// Database connection
const mongodbConnection = "mongodb+srv://planetarium:planetarium2020@planetariumdb-og3n8.mongodb.net/planetarium?retryWrites=true&w=majority";
mongoose.connect(mongodbConnection, { useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));


// Server setup
const port = process.env.PORT || 8080;
App.set('port', port);
const server = http.createServer(App);
server.listen(port);
server.on('listening', function(): void {
    console.log(`Listening on ${port}`);
});

module.exports = App;