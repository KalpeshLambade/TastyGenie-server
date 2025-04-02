import { GoogleGenerativeAI } from "@google/generative-ai";
import { Config } from "../Config";

export class GeminiAI{
    private static instance: GoogleGenerativeAI;
    private static modelName = "gemini-1.5-flash"; 

    private constructor() {}

    public static init(): void {
        if (!this.instance) {
            this.instance = new GoogleGenerativeAI(Config.configKeys.geminiApiKey);
            console.log("✅ Gemini AI Initialized");
        }
    }


    private static async generateResponse(prompt: string): Promise<string> {
        if (!this.instance) {
            throw new Error("GeminiAI not initialized. Call GeminiAI.init(API_KEY) first.");
        }

        const model = this.instance.getGenerativeModel({ model: this.modelName });

        try {
            const result = await model.generateContent(prompt);
            console.log(result.response.text())
            return result.response.text();
        } catch (error) {
            console.error("❌ Error generating response:", error);
            return ''
        }
    }


    public static async generateRecipeList(prompt: string){
       let generatedResponse = await this.generateResponse(prompt);
       return generatedResponse

    }   
    
}