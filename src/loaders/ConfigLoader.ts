import path from "path";
import fs from "fs";
import { FullConfig } from "../Config";

export class ConfigLoader {
  public static loadConfig(): FullConfig {
    let fileConfig: Partial<FullConfig> = {};

    // Load from config.json if it exists
    try {
      const configPath = path.join(__dirname, "../../config.json");
      const fileContent = fs.readFileSync(configPath, "utf-8");
      fileConfig = JSON.parse(fileContent);
    } catch (err) {
      console.warn("⚠️ config.json not found or unreadable. Falling back to environment variables.");
    }

    // Return final config with env fallback
    const finalConfig: FullConfig = {
      port: process.env.PORT || fileConfig.port || "3000",
      env: (process.env.NODE_ENV as FullConfig["env"]) || fileConfig.env || "development",
      domain: process.env.DOMAIN || fileConfig.domain || "http://localhost",
      geminiApiKey: process.env.GEMINI_API_KEY || fileConfig.geminiApiKey || "",
      pixelApiKey: process.env.PIXEL_API_KEY || fileConfig.pixelApiKey || "",
      imgbb: process.env.IMGBB_API_KEY || fileConfig.imgbb || ""
    };

    // Sanity check (optional)
    if (!finalConfig.geminiApiKey || !finalConfig.pixelApiKey || !finalConfig.imgbb) {
      console.warn("⚠️ One or more API keys are missing. Make sure they are defined in config.json or environment.");
    }

    return finalConfig;
  }
}
