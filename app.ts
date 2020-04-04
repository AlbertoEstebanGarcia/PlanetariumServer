import * as express from 'express';
import * as bodyParser from 'body-parser';

import { Logger } from './logger'
import { Planet } from "./model/planet";

class App {

    public express: express.Application;
    public log: Logger;

    private planets: Planet[] = [];

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
            res.json(this.planets);
        });

        // Get planet by name
        this.express.get("/planets/:name", (req,res,next) => {
            this.log.info(req.url)
            const planet = this.planets.filter(planet => {
                if(req.params.name.toLowerCase() === planet.name.toLowerCase()){
                    return planet;
                }
            })
            res.json(planet);
        });

        // Add a new planet        
        this.express.post("/planets", (req,res,next) => {
            this.log.info(req.url);

            if(this.isDataValid(req.body)) {
                let planet = new Planet();
                planet.id = this.generateId();
                planet = this.setPlanetAttributes(planet, req.body);
                this.planets.push(planet);
                res.json(this.planets);
            } else {
                return this.error(res, 400, 'The parameters provided are incorrect, avoiding to add a new planet');
            }
        });

        // Update planet by id
        this.express.put("/planets/:id", (req,res,next) => {
            this.log.info(req.url)

            if(this.isDataValid(req.body)) {
                const planet = this.planets.filter(planet => {
                    if(req.params.id === planet.id.toString()) {
                        return this.setPlanetAttributes(planet, req.body);
                    }
                })
                if (planet) {
                    res.json(planet);
                } else {
                    return this.error(res, 400, 'Planet does not exist');
                }
            } else {
                return this.error(res, 400, 'The parameters provided are incorrect, avoiding to update the planet');              
            }
        });

        // Delete planet by id
        this.express.delete("/planets/:id", (req,res,next) => {
            this.log.info(req.url)
            const success = this.deletePlanet(parseInt(req.params.id));
            if (success) {
                return this.success(res, 200, 'success');
            } else {
                return this.error(res, 400, 'Planet does not exist');
            }
        });

        // Undefined routes
        this.express.use('*', (req,res,next) => {
            this.log.info(req.url);
            return this.error(res, 400, 'Incorrect URL');
        });
    }

    private setPlanetAttributes(planet: Planet, body: any): Planet {
        planet.name = body.name;
        planet.distance = body.distance;
        planet.gravity = body.gravity;
        planet.satellites = body.satellites;
        planet.radius = body.radius;
        planet.imageUrl = body.imageUrl;
        return planet;
    }

    private deletePlanet(id: number): boolean {
        const position = this.planets.findIndex(planet => planet.id === id);
        if (position > -1) {
            this.planets.splice(position, 1);
            return true;
        } else {
            return false;
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

    private generateId() {        
        return this.planets.length === 0
            ? 1
            : 1 + Math.max.apply(Math, this.planets.map(planet => { return planet.id; }));
    }

    private success(response: any, status: number, message: string) {
        return response.status(status).send({message: message});
    }

    private error(response: any, status: number, error: string) {
        return response.status(status).send({error: error});
    }
}

export default new App().express;
