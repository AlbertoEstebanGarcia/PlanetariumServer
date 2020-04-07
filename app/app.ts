import * as express from 'express';
import * as bodyParser from 'body-parser';

import { Logger } from './utils/logger'
import { PlanetController } from './controllers/planet.controller'

class HttpStatus {
    public static SUCCESS = 200;
    public static BAD_REQUEST = 400;
    public static NOT_FOUND = 404;
    public static INTERNAL_ERROR = 500;
}

class App {

    public express: express.Application;
    public log: Logger;
    public planetController: PlanetController;

    constructor() {
        this.log = new Logger();
        this.planetController = new PlanetController();
        this.express = express();
        this.middleware();
        this.routes();
    }

    // Configure Express middleware
    public middleware(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(express.static(__dirname + '/apidoc'));
        this.express.use(express.static(process.cwd()));
        this.express.use(function (req, res, next) {
            // Website you wish to allow to connect
            res.header('Access-Control-Allow-Origin', '*');
            // Request methods you wish to allow
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            // Request headers you wish to allow
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            if (req.method === "OPTIONS") {
                return res.status(200).end();
            }
            // Pass to next layer of middleware
            next();
        });
    }

    public routes(): void {
        
        this.express.get('/', (req,res,next) => {
            res.sendFile(__dirname + '/index.html');
        });

        /**
         * @api {get} /planets/ Returns all the planets
         * @apiName GetPlanets
         * @apiGroup Planets
         *
         * @apiSuccess { Object[] } planets List of planets
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *     [{
         *       'id': '5e89c138d9c56a4460717c86',
         *       'name': 'Earth',
         *       'distance': '6000',
         *       'gravity': '9.78',
         *       'satellites': '1',
         *       'radius': '6000',
         *       'imageUrl': 'https://www.wikipeda.com/earth.png'
         *     }]
         *
         * @apiError InternalServerError 500 Internal server error
         *
         * @apiErrorExample Error:
         *     HTTP/1.1 500 Internal Server Error
         *     {
         *       'error': 'Database error'
         *     }
         * @apiExample {curl} Example usage:
         *     curl -i http://localhost:8080/planets
         */
        this.express.get("/planets", (req,res,next) => {
            this.log.info(req.url)
            this.planetController.getPlanets().then(planets => {
                if (planets) {
                    res.json(planets);
                } else {
                    this.error(res, HttpStatus.INTERNAL_ERROR, 'Error getting planets from database');
                }
            });
        });

        /**
         * @api {post} /planets/ Add a new planet
         * @apiName PostPlanets
         * @apiGroup Planets
         *
         * @apiParam { Object } planet Planet with all the fields in the body request
         * 
         * @apiSuccess { Object } planet Planet added to the database
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *     {
         *       'id': '5e89c138d9c56a4460717c86',
         *       'name': 'Earth',
         *       'distance': '6000',
         *       'gravity': '9.78',
         *       'satellites': '1',
         *       'radius': '6000',
         *       'imageUrl': 'https://www.wikipeda.com/earth.png'
         *     }
         *
         * @apiError BadRequest 400 Bad request
         * @apiError InternalServerError 500 Internal server error
         *
         * @apiErrorExample Error:
         *     HTTP/1.1 400 Bad Request
         *     {
         *       'error': 'Invalid parameters'
         *     }
         */
        this.express.post("/planets", (req,res,next) => {
            this.log.info(req.url);

            if(this.isDataValid(req.body)) {
                this.planetController.addPlanet(req.body).then(planet => {
                    if (planet) {
                        res.json(planet);
                    } else {
                        this.error(res, HttpStatus.INTERNAL_ERROR, 'Error adding planet to database');
                    }
                });
            } else {
                return this.error(res, HttpStatus.BAD_REQUEST, 'The parameters provided are incorrect, avoiding to add a new planet');
            }
        });

         /**
         * @api {put} /planets/:id Update a planet
         * @apiName PutPlanets
         * @apiGroup Planets
         *
         * @apiParam { String } id Id of the planet to update
         * @apiParam { Object } planet Planet with all the fields in the body request
         * 
         * @apiSuccess { Object } planet Planet updated
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *     {
         *       'id': '5e89c138d9c56a4460717c86',
         *       'name': 'Earth',
         *       'distance': '6000',
         *       'gravity': '9.78',
         *       'satellites': '1',
         *       'radius': '6000',
         *       'imageUrl': 'https://www.wikipeda.com/earth.png'
         *     }
         *
         * @apiError BadRequest 400 Bad request
         * @apiError InternalServerError 500 Internal server error
         *
         *
         * @apiErrorExample Error:
         *     HTTP/1.1 400 Bad Request
         *     {
         *       'error': 'Invalid parameters'
         *     }
         */
        this.express.put("/planets/:id", (req,res,next) => {
            this.log.info(req.url)
            if(this.isDataValid(req.body)) {
                this.planetController.updatePlanet(req.params.id, req.body).then(planet => {
                    if (planet) {
                        res.json(planet);
                    } else {
                        this.error(res, HttpStatus.INTERNAL_ERROR, 'Error updating planet from database');
                    }
                });
            } else {
                return this.error(res, HttpStatus.BAD_REQUEST, 'The parameters provided are incorrect, avoiding to update the planet');              
            }
        });

         /**
         * @api {delete} /planets/:id Delete a planet
         * @apiName DeletePlanets
         * @apiGroup Planets
         *
         * @apiParam { String } id Id of the planet to delete
         * 
         * @apiSuccess { Object } success Success message
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *     {
         *      'message': 'Success'
         *     }
         *
         * @apiError InternalServerError 500 Internal server error
         *
         * @apiErrorExample Error:
         *     HTTP/1.1 500 Internal Error
         *     {
         *       'error': 'Database error'
         *     }
         */
        this.express.delete("/planets/:id", (req,res,next) => {
            this.planetController.deletePlanet(req.params.id).then(planet => {
                if (planet) {
                    this.success(res);
                } else {
                    this.error(res, HttpStatus.INTERNAL_ERROR, 'Error deleting planet from database');
                }
            });
        });

        // Undefined routes
        this.express.use('*', (req,res,next) => {
            this.log.info(req.url);
            return this.error(res, HttpStatus.NOT_FOUND, 'Incorrect URL');
        });
    }

    private isDataValid(body: any): boolean {
        let isDataValid = true;
        if (!body.name || !body.distance || !body.gravity || !body.satellites || !body.radius || !body.imageUrl) {
            isDataValid = false;
        } else {
            if (body.distance < 0 || body.gravity < 0 || body.satellites < 0 || body.radius < 0 ) {
                isDataValid = false;
            }
            if (!body.imageUrl) {
                isDataValid = false;
            }
        }
        return isDataValid;
    }

    private success(response: any) {
        return response.status(HttpStatus.SUCCESS).send({message: 'Success'});
    }

    private error(response: any, status: number, error: string) {
        return response.status(status).send({error: error});
    }
}

export default new App().express;
