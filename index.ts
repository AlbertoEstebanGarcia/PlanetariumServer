import App from './app';
import * as http from 'http';
import * as cors from 'cors'
const mongoose = require('mongoose');

const port = process.env.PORT || 8080;

App.use(cors());
App.set('port', port);

const server = http.createServer(App);
server.listen(port);

server.on('listening', function(): void {
    let addr = server.address();
    let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Listening on ${bind}`);
    
    const mongodbConnection = "mongodb+srv://planetarium:planetarium2020@planetariumdb-og3n8.mongodb.net/planetarium?retryWrites=true&w=majority";
    // Connect to MongoDB with Mongoose.
    mongoose.connect(mongodbConnection, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

});

module.exports = App;