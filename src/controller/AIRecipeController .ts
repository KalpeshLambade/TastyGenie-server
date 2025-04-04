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
        cuisine: string;
        imageUrl: string;
      };
    } = {};

    const recipeLines = responseText
      .split("\n")
      .filter((line) => line.trim() !== "");

    const recipePromises = recipeLines.map(async (line) => {
      const parts = line.split(" - ");
      if (parts.length === 3) {
        const recipeName = parts[0].trim();
        const cuisine = parts[1].trim();
        const estimateTime = parts[2].trim() || "";

        try {
          const imageUrl = await GeminiAI.generateRecipeImage(recipeName);
          console.log("imageUrl", imageUrl)
          return { recipeName, estimateTime, cuisine, imageUrl };
        } catch (error) {
          console.error(`Failed to get image for ${recipeName}:`, error);
          return { recipeName, estimateTime, cuisine, imageUrl: "" };
        }
      }
      return null;
    });

    const results = await Promise.all(recipePromises);

    results.forEach((result) => {
      if (result) {
        formattedResponse[result.recipeName] = {
          estimateTime: result.estimateTime,
          cuisine: result.cuisine,
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

export const getRecipeDetails = async(req:Request, res:Response)=>{
  const { ingredients, appliances, preferences, cuisine, imgUrl, recipeName } = req?.body;

  if(!ingredients || !imgUrl || !recipeName){
    res?.send(StatusFailed);
    return;
  }

  try {
    let recipeDetail = await GeminiAI.generateRecipeDetails({
      ingredients,
      appliances,
      preferences,
      cuisine,
      recipeName
    });

    if(recipeDetail?.length){
      let recipeObj = parseRecipe(recipeDetail,imgUrl,recipeName);
      res?.send({...StatusSuccess,recipeObj});
      return;
    }

    res?.send({...StatusFailed, message: "Something Went Wrong"});
    return;
  } catch (error) {
    res
      ?.status(500)
      .send({ ...StatusFailed, message: "Internal Server Error" });
  }
}

const parseRecipe = (recipeString: string,imgUrl:string,recipeName:string) => {
  const recipeObj = {
    recipeName: recipeString.match(/## (.*)\n/)?.[1] || recipeName,
    introduction: recipeString.match(/Introduction:\s*(.*)/)?.[1] || "",
    preparationTime: {
      total: recipeString.match(/Total:\s*(.*)/)?.[1] || "",
      preparation: recipeString.match(/Preparation:\s*(.*)/)?.[1] || "",
      cooking: recipeString.match(/Cooking:\s*(.*)/)?.[1] || ""
    },
    ingredients: [...recipeString.matchAll(/- (.*?)\n/g)].map(match => match[1]).slice(2, -1), 
    instructions: [...recipeString.matchAll(/\d+\.\s(.*?)\n/g)].map(match => match[1]), 
    proTips: [...recipeString.matchAll(/Pro Tips & Variations:\n\n- (.*?)\n/g)].map(match => match[1]),
    servingSuggestions: [...recipeString.matchAll(/Serving Suggestions:\n\n- (.*?)\n/g)].map(match => match[1]),
    nutritionFacts: {
      calories: recipeString.match(/Calories:\s*(.*?)\n/)?.[1] || "",
      carbohydrates: recipeString.match(/Carbohydrates:\s*(.*?)\n/)?.[1] || "",
      protein: recipeString.match(/Protein:\s*(.*?)\n/)?.[1] || "",
      fat: recipeString.match(/Fat:\s*(.*?)\n/)?.[1] || ""
    },
    imgUrl
  };

  return recipeObj;
};

