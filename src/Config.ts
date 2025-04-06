import { ConfigLoader } from "./loaders/ConfigLoader";

export enum Env {
  dev = "dev",
  prod = "prod",
}

export interface FullConfig {
  port: string;
  env: Env;
  domain: string;
  geminiApiKey: string;
  cloudinary: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  };
  pixelApiKey:string
}

export class Config {
  public static configKeys: FullConfig;

  public static init() {
    this.configKeys = ConfigLoader.loadConfig();
  }
}
