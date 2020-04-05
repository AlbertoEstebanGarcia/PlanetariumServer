const mongoose = require('mongoose');
import * as express from 'express';
import * as bodyParser from 'body-parser';

import { Logger } from './logger'
import Planet from './models/planet'

class App {

    public SUCCESS_CODE = 200;
    public BAD_REQUEST_CODE = 400;
    public NOT_FOUND_CODE = 404;
    public INTERNAL_ERROR_CODE = 500;

    public express: express.Application;
    public log: Logger;

    constructor() {
        this.log = new Logger();
        this.express = express();
        this.middleware();
        this.routes();
    }

    // Configure Express middleware
    private middleware(): void {
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

    private routes(): void {
        
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
            this.getPlanets().then(planets => {
                if (planets) {
                    res.json(planets);
                } else {
                    this.error(res, this.INTERNAL_ERROR_CODE, 'Error getting planets from database');
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
                this.addPlanet(req.body).then(planet => {
                    if (planet) {
                        res.json(planet);
                    } else {
                        this.error(res, this.INTERNAL_ERROR_CODE, 'Error adding planet to database');
                    }
                });
            } else {
                return this.error(res, this.BAD_REQUEST_CODE, 'The parameters provided are incorrect, avoiding to add a new planet');
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
                this.updatePlanet(req.params.id, req.body).then(planet => {
                    if (planet) {
                        res.json(planet);
                    } else {
                        this.error(res, this.INTERNAL_ERROR_CODE, 'Error updating planet from database');
                    }
                });
            } else {
                return this.error(res, this.BAD_REQUEST_CODE, 'The parameters provided are incorrect, avoiding to update the planet');              
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
            this.deletePlanet(req.params.id).then(planet => {
                if (planet) {
                    this.success(res);
                } else {
                    this.error(res, this.INTERNAL_ERROR_CODE, 'Error deleting planet from database');
                }
            });
        });

        // Undefined routes
        this.express.use('*', (req,res,next) => {
            this.log.info(req.url);
            return this.error(res, this.NOT_FOUND_CODE, 'Incorrect URL');
        });
    }

    private getPlanets() {
        return Planet.find({}).then(result => {
            return result;
        })
        .catch(error => {
            this.log.info("Unable to retrieve all the planets" + error);
            return undefined;
        });
    }

    private addPlanet(body: any) {
        const data = new Planet(body);
        return data.save()
            .then(planet => {
                this.log.info("Added new planet to the database" + planet);
                return planet;
            })
            .catch(error => {
                this.log.info("Unable to add new planet to the database" + error);
                return undefined;
            });
    }


    private updatePlanet(id: string, body: any) {
        if(mongoose.Types.ObjectId.isValid(id)) {
            return Planet.findByIdAndUpdate(id, {$set:body} , {new:true}).then(planet =>{
               if (planet) {
                 this.log.info("Updated planet with id " + id);
                 return planet;
               } else {
                this.log.info("Unable to update the planet with id: " + id);
                return undefined;
               }
            }).catch(error => {
                this.log.info("Error in the database: " + error)
                return undefined;
            });
        } else {
            this.log.info('Invalid Mongo id' + id);
            return undefined;
        }
    }

    private deletePlanet(id: string) {
        if(mongoose.Types.ObjectId.isValid(id)) {
            return Planet.deleteOne({_id: id})
              .then(planet => {
                 if (planet) {
                    this.log.info('Removed planet with id ' + id);
                    return planet;
                 } else {
                    this.log.info("Unable to delete the planet with id: " + id);
                    return undefined;
                 }
            }).catch((error)=>{
                this.log.info("Error in the database: " + error)
                return undefined;
            })
        } else {
            this.log.info('Invalid Mongo id' + id);
            return undefined;
        }
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
        return response.status(this.SUCCESS_CODE).send({message: 'Success'});
    }

    private error(response: any, status: number, error: string) {
        return response.status(status).send({error: error});
    }
}

export default new App().express;
