import express, { Application } from "express";
import { Config } from "../Config";
import cors from 'cors'
import router from "../routes/_route";
import { GeminiAI } from "../Utils/Gemini";
import { Cloudinary } from "../Utils/Cloudinary";


export class ExpressLoader {
  public static app: Application;

  public static async init() {
    Config.init();
    GeminiAI.init();
    Cloudinary.init();

    this.app = express();
    this.app.use(express.json());
    this.app.use(cors());

    this.app.use('/api',router);



    this.app.listen(Config.configKeys.port, () => {
      console.log(
        `[${new Date().toISOString()}] [${Config.configKeys.env.toUpperCase()}] 🚀 Server is running at ${
          Config.configKeys.domain
        }`
      );
    });
  }
}