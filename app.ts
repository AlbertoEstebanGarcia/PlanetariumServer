import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import { Logger } from './logger'
import { Planet } from "./model/planet";

class App {

    public express: express.Application;
    public log: Logger;

    private planets: Planet[] = [];

    constructor() {
        this.log = new Logger();
        this.generatePlanets();
        this.express = express();
        this.middleware();
        this.routes();
    }

    // Configure Express middleware
    private middleware(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));      
    }

    private routes(): void {
        
        this.express.use(cors({origin: '*'}));

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
            const name = req.body.name;

            if(this.isNameAlreadyInUse(name)) {
                return res.status(400).send({message: 'The name of the planet is already in use'});
            } else {
                const newPlanet = this.createPlanet(req.body.name);
                this.planets.push(newPlanet);
                res.json(this.planets);
            }
            
        });

        // Update planet by id
        this.express.put("/planets/:id", (req,res,next) => {
            this.log.info(req.url)
            const name = req.body.name;

            if(this.isNameAlreadyInUse(name)) {
                return res.status(400).send({message: 'The name of the planet is already in use'});
            } else {
                const planet = this.planets.filter(planet => {
                    if(req.params.id === planet.id.toString()) {
                        planet.name = req.body.name
                        return planet;
                    }
                })
    
                res.json(planet);
            }          
        });

        // Undefined routes
        this.express.use('*', (req,res,next) => {
            this.log.info(req.url)
            res.send("Incorrect URL");
        });
    }

    private createPlanet(name: string): Planet {
        const planet = new Planet();
        planet.id = this.generateId();
        planet.name = name;
        return planet;
    }

    private isNameAlreadyInUse(name: string): boolean {
        return this.planets.some(planet => planet.name === name);
    }

    private generateId() {        
        return this.planets.length === 0
            ? 1
            : 1 + Math.max.apply(Math, this.planets.map(planet => { return planet.id; }));
    }

    private generatePlanets() {
        const p1 = this.createPlanet('Earth');
        this.planets.push(p1);
        const p2 = this.createPlanet('Mars');
        this.planets.push(p2);
    }
}

export default new App().express;
