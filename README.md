# PlanetariumServer

This project is the backend for the Planetarium project

## Tech stack

The API was written in Node.js using the Express Framework.  For the persistence of the data it was used a MongoDB database hosted in MongoDB Atlas (DBaaS)
In the test folder there is an integration test to test the API using `mocha` and `supertest` libraries
For the documentation of the API it  was used `apidoc`

## Local installation
    git clone https://github.com/AlbertoEstebanGarcia/PlanetariumServer.git
    cd PlanetariumServer
    npm install
    npm run startDev

## Development server

The server is running in Heroku. You can access in the following URL:
[https://planetariumserver-salzburg.herokuapp.com/](https://planetariumserver-salzburg.herokuapp.com/)

## References
[https://expressjs.com/](https://expressjs.com/)
[https://account.mongodb.com/account/login](https://account.mongodb.com/account/login)
[https://apidocjs.com/](https://apidocjs.com/)
[https://mochajs.org/](https://mochajs.org/)

## Author
Alberto Esteban García
