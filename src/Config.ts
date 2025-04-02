import { ConfigLoader } from "./loaders/ConfigLoader";

export enum Env{
    dev ='dev',
    prod = 'prod'
}

export interface FullConfig{
    port: string;
    env: Env;
    domain: string;
}

export class Config{
    public static configKeys: FullConfig;

    public static init(){
        this.configKeys = ConfigLoader.loadConfig();
    }
}