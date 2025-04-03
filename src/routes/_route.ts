import { Router,Response,Request } from "express";
import { StatusSuccess } from "../Utils/Status";
import { GeminiAI } from "../Utils/Gemini";
import { Pixel } from "../Utils/Pixel";

const router = Router();

router.get('/ping', (req:Request, res:Response)=>{
    res?.send({...StatusSuccess})
})

router.post('/test', async(req:Request, res:Response)=>{
    let prompt = req?.body?.name;
    // let aiResponse = await GeminiAI.generateRecipeImage(prompt);
    // let aiResponse = await Pixel.getRecipePhoto(prompt);
    let aiResponse = await GeminiAI.generateRecipeDetails({
        name: "Chicken Biryani",
        ingredients: "chicken, yogurt, spices, rice",
        cuisine: "Indian",
        utilities: "stove, pressure cooker",
        preferences: "spicy, gluten-free"
      });
      

    res?.send({...StatusSuccess,aiResponse})
})

export default router