import * as express from 'express';
import * as bodyParser from 'body-parser';
const mongoose = require('mongoose');

import { Logger } from './logger'
import PlanetDTO from './models/planet'


class App {

    public SUCCESS_CODE = 200;
    public BAD_REQUEST_CODE = 400;
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
    }

    private routes(): void {
        
        this.express.get('/', (req,res,next) => {
            res.send("Welcome to the Planetarium REST API");
        });

        // Get all the planets
        this.express.get("/planets", (req,res,next) => {
            this.log.info(req.url)
            this.getAllPlanets().then(planets => {
                if (planets) {
                    res.json(planets);
                } else {
                    this.error(res, this.INTERNAL_ERROR_CODE, 'Error getting planets from database');
                }
            });
        });

        // Add a new planet        
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

        // Update planet by id
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

        // Delete planet by id
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
            return this.error(res, 400, 'Incorrect URL');
        });
    }

    private getAllPlanets() {
        return PlanetDTO.find({}).then(result => {
            return result;
        })
        .catch(error => {
            this.log.info("Unable to retrieve all the planets" + error);
            return undefined;
        });
    }

    private addPlanet(body: any) {
        const data = new PlanetDTO(body);
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
            return PlanetDTO.findByIdAndUpdate(id, {$set:body} , {new:true}).then(planet =>{
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
            return PlanetDTO.deleteOne({_id: id})
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
