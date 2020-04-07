const mongoose = require('mongoose');
import planet from "../models/planet";
import { Logger } from "../utils/logger";

export class PlanetDao {

    log = new Logger();

    public getPlanets(): any {
        return planet.find({}).then(result => {
            return result;
        })
        .catch(error => {
            this.log.info("Unable to retrieve all the planets" + error);
            return undefined;
        });
    }

    public addPlanet(data: any) {
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

    public updatePlanet(id: string, body: any) {
        if(mongoose.Types.ObjectId.isValid(id)) {
            return planet.findByIdAndUpdate(id, {$set:body} , {new:true}).then(planet =>{
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

    public deletePlanet(id: string) {
        if(mongoose.Types.ObjectId.isValid(id)) {
            return planet.deleteOne({_id: id})
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
}