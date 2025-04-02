import path from "path";
import fs from 'fs'
import { FullConfig } from "../Config";

export class ConfigLoader{

    public static loadConfig(){
        const configPath = path.join(__dirname, '../../config.json');
        const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        if(!configData){
            throw new Error('Configuration not found')
        }

        return configData as FullConfig
    }
}