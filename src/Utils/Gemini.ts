import { GoogleGenAI } from "@google/genai";
import { Config } from "../Config";
import fs from "fs";
import { Imgbb } from "./Imgbb";
import { Cloudinary } from "./Cloudinary";

export class GeminiAI {
  private static instance: GoogleGenAI;
  private static textGenModel = "gemini-2.0-flash";
  private static imageGenModel = "gemini-2.0-flash-exp-image-generation";

  private constructor() {}

  public static init(): void {
    if (!this.instance) {
      this.instance = new GoogleGenAI({
        apiKey: Config.configKeys.geminiApiKey,
      });
      console.log("✅ Gemini AI Initialized");
    }
  }

  private static async generateTextResponse(prompt: string): Promise<string> {
    if (!this.instance) {
      throw new Error(
        "GeminiAI not initialized. Call GeminiAI.init(API_KEY) first."
      );
    }

    try {
      const response = await this.instance.models.generateContent({
        model: this.textGenModel,
        contents: prompt,
      });
      return response.text || "";
    } catch (error) {
      console.error("❌ Error generating response:", error);
      return "";
    }
  }

  public static async generateImageResponse(
    prompt: string,
    recipeName:string
  ): Promise<{ imgUrl?: string; text?: string }> {
    if (!this.instance) {
      throw new Error(
        "GeminiAI not initialized. Call GeminiAI.init(API_KEY) first."
      );
    }

    try {
      const response = await this.instance.models.generateContent({
        model: this.imageGenModel,
        contents: prompt,
        config: {
          responseModalities: ["Text", "Image"],
        },
      });

      if (!response?.candidates || response.candidates.length === 0) {
        console.warn("⚠️ No valid response from Gemini AI.");
        return {};
      }

      let result: { imgUrl?: string; text?: string } = {};

      const content = response.candidates[0]?.content;
      if (!content?.parts) {
        console.warn("⚠️ No valid content parts found.");
        return {};
      }

      for (const part of content.parts) {
        if (part.text) {
          result.text = part.text;
        } else if (part.inlineData?.data) {
          
          result.imgUrl = await Cloudinary.uploadImage(part.inlineData?.data,recipeName);
          
        }
      }

      return result;
    } catch (error) {
      console.error("❌ Error generating image:", error);
      return {};
    }
  }

  public static async generateRecipeList(params: {
    ingredients: string;
    cuisine?: string;
    appliances?: string;
    preferences?: string;
  }) {
    let prompt = `
      Generate a list of recipe names (minimum 4, maximum 10) with their estimated preparation times.  
      Use the following details:  
      - Ingredients: ${params?.ingredients}  
      - Cuisine Type (optional): ${params?.cuisine}  
      - Available Utilities (optional): ${params?.appliances}  
      - Dietary Preferences (optional): ${params?.preferences}  
      
      Return the result as a plain list in the format:  
      Recipe Name - Cuisine Type - Time  
    
      - The time should be a **number only** (do not include "minutes" or "min").  
      - Always provide a cuisine type. If unknown, infer the most relevant cuisine based on ingredients.  
      - Do not include any extra text, descriptions, or explanations.
  `;

    let generatedResponse = await this.generateTextResponse(prompt);
    return generatedResponse;
  }

  public static async generateRecipeImage(recipeName: string) {
    const dishDescription = await this.generateDishDescription(recipeName);

    const contents = `Generate photorealistic image of a dish based on the following description: "${dishDescription}". 
      The dish should look authentic, freshly prepared, and professionally plated. 
      Ensure realistic textures, vibrant colors, and natural lighting, making it appear as if it were captured in a real-world setting. 
      Avoid artistic or illustrated styles.
    `;

    let generatedResponse = await this.generateImageResponse(contents,recipeName);
    return generatedResponse?.imgUrl as string;
  }

  public static async generateDishDescription(recipeName: string) {
    let prompt = `Generate a detailed, photorealistic description of the dish "${recipeName}" for image generation. 
    Describe its appearance, texture, colors, and presentation, including key ingredients, garnishes, and side dishes. 
    Ensure the description makes the dish look authentic, fresh, and appetizing, resembling a real-life photograph rather than an artistic 
    or illustrated style.
  `;
    let generatedResponse = await this.generateTextResponse(prompt);
    return generatedResponse;
  }

  public static async generateShortDescription(recipeName: string) {
    let prompt = `Generate a vivid and appetizing description for "${recipeName}". 
      Ensure it explicitly mentions "Chicken Tikka Masala" and includes details about its creamy tomato sauce, 
      tender grilled chicken, and Indian spices. Avoid vague terms that could misrepresent the dish.`;  

    let generatedResponse = await this.generateTextResponse(prompt);
    return generatedResponse;
  }

  public static async generateRecipeDetails(params: {
    ingredients: string;
    recipeName:string
    cuisine?: string;
    appliances?: string;
    preferences?: string;
  }) {
    let recipePrompt = `Generate a professional, well-structured, and detailed recipe for the dish: "${params?.recipeName}", using the following details:  
    - Main Ingredients: "${params?.ingredients}"  
    - Cuisine Type: "${params?.cuisine || "Any"}"  
    - Available Kitchen Utilities: "${params?.appliances || "Standard kitchen tools"}"  
    - Dietary Preferences: "${params?.preferences || "None"}"  
    
    ### Language Consideration:  
    If any ingredient is mentioned using a regional term (e.g., "aalu" for potato, "mirchi" for chili), retain that term consistently throughout the recipe instead of translating it to English.  
    
    ### Recipe Format:  
    Recipe Title: "${params?.recipeName}"  
    
    Introduction:  
    - A short, engaging description highlighting key flavors and appeal.  
    
    Preparation Time:  
    - Total: (e.g., "20 minutes")  
    - Preparation: (e.g., "5 minutes")  
    - Cooking: (e.g., "15 minutes")  
    
    Ingredients:  
    List each ingredient separately in bullet format (e.g., "- 2 cups milk"). Group similar ingredients under sections like "Base," "Spices," etc. **Ensure regional terms are retained if provided**.  
    
    Instructions:  
    Numbered step-by-step format. Each step should be concise and actionable. **Use the same regional terms for ingredients instead of English translations**.  
    
    Pro Tips & Variations:  
    - List at least 2 tips or variations. For example:  
      - "Add a pinch of red pepper flakes for extra spice."  
      - "Substitute cheddar with mozzarella for a different flavor."  
    
    Serving Suggestions:  
    - List at least 2 recommendations. For example:  
      - "Pair with a fresh green salad."  
      - "Garnish with chopped parsley for extra flavor."  
    
    Nutrition Facts (per serving):  
    - Calories: (e.g., "450 kcal")  
    - Carbohydrates: (e.g., "45g")  
    - Protein: (e.g., "20g")  
    - Fat: (e.g., "25g")  
    
    Ensure the recipe is **formatted clearly, concise, and structured for easy parsing**. Output should be in plain text without extra formatting symbols.`;
    

    let generatedResponse = await this.generateTextResponse(recipePrompt);
    return generatedResponse; 

  }

}
