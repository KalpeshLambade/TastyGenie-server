import { Response, Request } from "express";
import { StatusFailed, StatusSuccess } from "../Utils/Status";
import { GeminiAI } from "../Utils/Gemini";

export const suggestFoodItems = async (req: Request, res: Response) => {
  const { ingredients, appliances, preferences, cuisine } = req?.body;

  if (!ingredients?.length) {
    res?.send(StatusFailed);
    return;
  }

  try {
    let responseText = await GeminiAI.generateRecipeList({
      ingredients,
      cuisine,
      appliances,
      preferences,
    });

    const formattedResponse: {
      [key: string]: {
        estimateTime: string;
        imageUrl: string;
      };
    } = {};

    const recipeLines = responseText
      .split("\n")
      .filter((line) => line.trim() !== "");

    const recipePromises = recipeLines.map(async (line) => {
      const parts = line.split(" - ");
      if (parts.length === 2) {
        const recipeName = parts[0].trim();
        const estimateTime = `${parts[1].trim()} min`;

        try {
        const imageUrl = await GeminiAI.generateRecipeImage(recipeName);

        console.log(imageUrl,"imgUrl")


          return { recipeName, estimateTime, imageUrl };
        } catch (error) {
          console.error(`Failed to get image for ${recipeName}:`, error);
          return { recipeName, estimateTime, imageUrl: "" };
        }
      }
      return null;
    });

    const results = await Promise.all(recipePromises);

    results.forEach((result) => {
      if (result) {
        formattedResponse[result.recipeName] = {
          estimateTime: result.estimateTime,
          imageUrl: result.imageUrl,

        };
      }
    });

    res?.send({ ...StatusSuccess, formattedResponse });
  } catch (error) {
    console.error("Error generating food suggestions:", error);
    res
      ?.status(500)
      .send({ ...StatusFailed, message: "Internal Server Error" });
  }
};
