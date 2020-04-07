import { PlanetDao } from "../dao/planet.dao";
import planet from "../models/planet";

export class PlanetController {

    planetDao: PlanetDao;
    
    constructor() {
        this.planetDao = new PlanetDao();
    }

    public getPlanets(): any {
        return this.planetDao.getPlanets();
    }

    public addPlanet(body: any) {
        return this.planetDao.addPlanet(new planet(body));
    }

    public updatePlanet(id: string, body: any) {
        return this.planetDao.updatePlanet(id, body);
    }

    public deletePlanet(id: string) {
        return this.planetDao.deletePlanet(id);
    }
}
