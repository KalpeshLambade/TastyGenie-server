import { GoogleGenAI } from "@google/genai";
import { Config } from "../Config";
import fs from "fs";
import { Imgbb } from "./Imgbb";

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
    prompt: string
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
          result.imgUrl = await Imgbb.uploadImage(part.inlineData?.data);
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

    let generatedResponse = await this.generateImageResponse(contents);
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
    name:string;
    cuisine?: string;
    utilities?: string;
    preferences?: string;
  }) {
    let recipePrompt = `Generate a professional, well-structured, and detailed recipe for the dish: **"${params?.name}"**, using the following details:  
      - **Main Ingredients:** "${params?.ingredients}"  
      - **Cuisine Type:** "${params?.cuisine || "Any"}"  
      - **Available Kitchen Utilities:** "${params?.utilities || "Standard kitchen tools"}"  
      - **Dietary Preferences:** "${params?.preferences || "None"}"  

      ### **Recipe Format:**  
      1️⃣ **Recipe Title:** Use the provided dish name: "${params?.name}"  
      2️⃣ **Introduction (1-2 lines):** Describe the dish’s key flavors and appeal  
      3️⃣ **Ingredients List:**  
        - Categorized (e.g., Marinade, Base, Spices)  
        - Accurate measurements for each ingredient  
      4️⃣ **Step-by-Step Instructions:**  
        - Clearly numbered, easy to follow  
        - Adapted to available kitchen utilities  
      5️⃣ **Pro Tips & Variations:**  
        - Cooking tips, substitutions, and customization options  
      6️⃣ **Serving Suggestions:**  
        - Best sides, pairings, and presentation ideas  

      Ensure the recipe is **engaging, practical, and well-formatted** for easy reading.  
    `;

    let generatedResponse = await this.generateTextResponse(recipePrompt);
    return generatedResponse; 

  }

}
